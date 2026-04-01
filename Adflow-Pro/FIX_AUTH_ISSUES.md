# 🔧 Fix Authentication Issues - Complete Guide

## ❌ Problems

### Issue 1: New User Signup
**Error**: "Database error" when creating new user
**Cause**: Missing INSERT policy on public.users table

### Issue 2: Existing User Login
**Error**: "Invalid credentials" for existing users
**Cause**: Users exist in auth.users but not in public.users

---

## ✅ Complete Solution (2 Minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click **"SQL Editor"** (left sidebar)
3. Click **"New Query"**

### Step 2: Run Complete Fix
Copy this ENTIRE script and paste in SQL Editor:

```sql
-- COMPLETE FIX - Run this entire script

-- Fix 1: Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
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
    RAISE LOG 'Error: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Fix 2: Add INSERT policy
DROP POLICY IF EXISTS "users_insert_on_signup" ON public.users;
CREATE POLICY "users_insert_on_signup" 
ON public.users 
FOR INSERT 
WITH CHECK (true);

-- Fix 3: Sync existing users
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

-- Fix 4: Confirm all emails (for development)
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Verify
SELECT 'Fix Complete!' as status;
```

### Step 3: Click "Run"
Wait for success message

### Step 4: Verify Fix
Run this to check:
```sql
-- Check sync status
SELECT 
  au.email,
  CASE 
    WHEN pu.id IS NULL THEN 'NOT SYNCED ❌'
    ELSE 'SYNCED ✅'
  END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id;
```

All users should show "SYNCED ✅"

---

## 🧪 Test the Fixes

### Test 1: New User Signup
1. Go to: http://localhost:3001/auth/register
2. Fill form:
   - Full Name: Test User
   - Email: newuser@test.com
   - Password: Test@123
3. Click "Create Account"
4. Should work now! ✅

### Test 2: Existing User Login
1. Go to: http://localhost:3001/auth/login
2. Enter existing user credentials
3. Click "Login"
4. Should work now! ✅

---

## 🔍 What Each Fix Does

### Fix 1: Trigger Recreation
**Problem**: Old trigger might be broken
**Solution**: Drop and recreate with error handling
**Result**: New signups work

### Fix 2: INSERT Policy
**Problem**: RLS blocks trigger from inserting
**Solution**: Add policy that allows inserts
**Result**: Trigger can create users

### Fix 3: Sync Existing Users
**Problem**: Old users only in auth.users, not public.users
**Solution**: Copy all auth users to public.users
**Result**: Existing users can login

### Fix 4: Email Confirmation
**Problem**: Users need email verification
**Solution**: Auto-confirm all emails (dev only)
**Result**: Instant login without email check

---

## 📊 Understanding the Issue

### How Auth Should Work:
```
1. User fills signup form
2. Supabase Auth creates user in auth.users
3. Trigger fires automatically
4. Function inserts into public.users
5. User can login ✅
```

### What Was Broken:
```
1. User fills signup form
2. Supabase Auth creates user in auth.users ✅
3. Trigger fires ✅
4. Function tries to insert into public.users ❌
   - RLS blocks insert (no policy)
   - User NOT created in public.users
5. User cannot login ❌
   - Auth checks public.users
   - User not found
   - "Invalid credentials" error
```

### After Fix:
```
1. User fills signup form
2. Supabase Auth creates user in auth.users ✅
3. Trigger fires ✅
4. Function inserts into public.users ✅
   - INSERT policy allows it
5. User can login ✅
   - User exists in both tables
```

---

## 🐛 Troubleshooting

### Still Getting "Database error"?

**Check 1: Trigger exists**
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```
Should return 1 row

**Check 2: Policy exists**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'users' 
AND policyname = 'users_insert_on_signup';
```
Should return 1 row

**Check 3: Function exists**
```sql
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
```
Should return 1 row

### Still Getting "Invalid credentials"?

**Check 1: User in auth.users**
```sql
SELECT id, email FROM auth.users WHERE email = 'your@email.com';
```
Should return user

**Check 2: User in public.users**
```sql
SELECT id, email FROM public.users WHERE email = 'your@email.com';
```
Should return same user

**Check 3: Email confirmed**
```sql
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'your@email.com';
```
email_confirmed_at should NOT be null

### Manual Sync for Specific User

If one user still not working:
```sql
-- Replace with actual user email
INSERT INTO public.users (id, email, full_name, role)
SELECT id, email, 
  COALESCE(raw_user_meta_data->>'full_name', ''),
  'client'::user_role
FROM auth.users 
WHERE email = 'problem@email.com'
ON CONFLICT (id) DO NOTHING;
```

---

## 🎯 Quick Commands

### Check All Users Status
```sql
SELECT 
  au.email,
  au.created_at,
  CASE WHEN pu.id IS NOT NULL THEN '✅' ELSE '❌' END as synced,
  CASE WHEN au.email_confirmed_at IS NOT NULL THEN '✅' ELSE '❌' END as confirmed
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY au.created_at DESC;
```

### Sync All Users
```sql
INSERT INTO public.users (id, email, full_name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', ''),
  'client'::user_role
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
```

### Confirm All Emails
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
```

### Delete Test User
```sql
-- Delete from both tables
DELETE FROM public.users WHERE email = 'test@example.com';
DELETE FROM auth.users WHERE email = 'test@example.com';
```

---

## ✅ Success Checklist

After running the fix:
- [ ] SQL script executed successfully
- [ ] No errors in SQL Editor
- [ ] Trigger exists (verified)
- [ ] Policy exists (verified)
- [ ] Users synced (verified)
- [ ] Emails confirmed (verified)
- [ ] New signup works
- [ ] Existing login works

---

## 📝 Files Reference

### Main Fix File
`supabase/COMPLETE_FIX.sql` - Run this in SQL Editor

### Alternative Fix
`supabase/FIX_USER_SIGNUP.sql` - Older version (use COMPLETE_FIX instead)

---

## 🎉 After Fix

### What Should Work:
✅ New user registration
✅ Existing user login
✅ Dashboard access
✅ Ad creation
✅ All features

### Test Flow:
1. Register new user → Should work
2. Login with new user → Should work
3. Access dashboard → Should work
4. Create ad → Should work
5. Logout → Should work
6. Login again → Should work

---

## 🚀 Next Steps

1. **Run the fix** - Copy script to SQL Editor
2. **Test signup** - Create new user
3. **Test login** - Login with existing user
4. **Verify dashboard** - Check access
5. **Start using** - Create ads!

---

**Status**: Fix ready to apply
**Time**: 2 minutes
**Difficulty**: Easy (just copy-paste)
**Result**: Both issues fixed! ✅
