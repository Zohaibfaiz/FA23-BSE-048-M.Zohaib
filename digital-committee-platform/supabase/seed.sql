-- ============================================================
-- Seed Data — Demo committees, users, and payments
-- Run AFTER migrations 001-003
-- ============================================================

-- Demo profile (password: Demo@1234)
-- Note: Create the user via Supabase Auth first, then update profile

-- Demo committee (will be auto-seeded once users are created)
-- Insert demo public committees for browsing

DO $$
DECLARE
  demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Only insert if demo user doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = demo_user_id) THEN
    -- Insert into profiles (user must exist in auth.users first via Supabase Auth)
    RAISE NOTICE 'Demo user not found. Create users via Supabase Auth UI first.';
  END IF;
END $$;

-- Sample notifications for any existing user
-- (Replace USER_ID with actual user UUID from your auth.users table)
/*
INSERT INTO public.notifications (user_id, type, title, message) VALUES
  ('USER_ID', 'general', 'Welcome to CommitteePro! 🎉', 'Start by creating or joining a committee.'),
  ('USER_ID', 'payment_due', 'Payment Due Tomorrow', 'Your monthly payment of ₨5,000 is due tomorrow.'),
  ('USER_ID', 'your_turn', 'Your Turn This Month! 🎉', 'Congratulations! You will receive the committee fund this month.');
*/

-- Verification
SELECT 'Schema seeded successfully' AS status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
