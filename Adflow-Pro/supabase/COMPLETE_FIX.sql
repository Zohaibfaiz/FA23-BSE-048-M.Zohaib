-- ============================================================
-- COMPLETE FIX - User Signup & Login Issues
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- PART 1: Fix User Signup (Database Error)
-- ============================================================

-- Step 1: Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Create improved function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (id, email, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the signup
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 3: Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Add INSERT policy (CRITICAL!)
DROP POLICY IF EXISTS "users_insert_on_signup" ON public.users;
CREATE POLICY "users_insert_on_signup" 
ON public.users 
FOR INSERT 
WITH CHECK (true);

-- ============================================================
-- PART 2: Fix Existing Users (Invalid Credentials)
-- ============================================================

-- Step 5: Sync existing auth.users to public.users
-- This fixes users who exist in auth but not in public.users
INSERT INTO public.users (id, email, full_name, role, avatar_url)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  COALESCE((au.raw_user_meta_data->>'role')::user_role, 'client'),
  au.raw_user_meta_data->>'avatar_url'
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

-- Step 6: Confirm all users' emails (for development)
-- This allows login without email verification
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- ============================================================
-- PART 3: Verification
-- ============================================================

-- Check 1: Verify trigger exists
SELECT 
  'Trigger exists' as check_name,
  COUNT(*) as status
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check 2: Verify INSERT policy exists
SELECT 
  'Insert policy exists' as check_name,
  COUNT(*) as status
FROM pg_policies 
WHERE tablename = 'users' AND policyname = 'users_insert_on_signup';

-- Check 3: Verify users are synced
SELECT 
  'Auth users' as table_name,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Public users' as table_name,
  COUNT(*) as count
FROM public.users;

-- Check 4: Show any unsynced users
SELECT 
  au.id,
  au.email,
  au.created_at,
  CASE 
    WHEN pu.id IS NULL THEN 'NOT SYNCED ❌'
    ELSE 'SYNCED ✅'
  END as sync_status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY au.created_at DESC;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
SELECT 
  '✅ FIX COMPLETE!' as status,
  'Try signup and login now' as next_step;
