-- ============================================================
-- Migration 003: Admin & Moderator RLS Policies
-- ============================================================

-- Admin can read all users (or user can read self)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can read all users'
  ) THEN
    CREATE POLICY "Admins can read all users"
    ON users FOR SELECT
    USING (
      id = auth.uid()
      OR (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'super_admin')
    );
  END IF;
END $$;

-- Admin can update user roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update users'
  ) THEN
    CREATE POLICY "Admins can update users"
    ON users FOR UPDATE
    USING (
      (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'super_admin')
    );
  END IF;
END $$;

-- Moderators can update ads for review
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Moderators can review ads'
  ) THEN
    CREATE POLICY "Moderators can review ads"
    ON ads FOR UPDATE
    USING (
      (SELECT role FROM users WHERE id = auth.uid()) IN ('moderator', 'admin', 'super_admin')
    );
  END IF;
END $$;

-- Admins can read all ads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can read all ads'
  ) THEN
    CREATE POLICY "Admins can read all ads"
    ON ads FOR SELECT
    USING (
      user_id = auth.uid()
      OR (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'super_admin')
    );
  END IF;
END $$;

-- Admins can read all payments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can read all payments'
  ) THEN
    CREATE POLICY "Admins can read all payments"
    ON payments FOR SELECT
    USING (
      user_id = auth.uid()
      OR (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'super_admin')
    );
  END IF;
END $$;

-- Moderators can read ads for review
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Moderators can read ads for review'
  ) THEN
    CREATE POLICY "Moderators can read ads for review"
    ON ads FOR SELECT
    USING (
      user_id = auth.uid()
      OR (SELECT role FROM users WHERE id = auth.uid()) IN ('moderator', 'admin', 'super_admin')
    );
  END IF;
END $$;
