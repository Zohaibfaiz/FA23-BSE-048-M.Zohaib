-- ============================================================
-- Committee Management System — Migration 001: Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT NOT NULL,
  full_name             TEXT NOT NULL DEFAULT '',
  phone                 TEXT,
  avatar_url            TEXT,
  iban                  TEXT,
  bank_account          TEXT,
  easypaisa_number      TEXT,
  jazzcash_number       TEXT,
  reputation_score      INTEGER NOT NULL DEFAULT 50 CHECK (reputation_score >= 0 AND reputation_score <= 100),
  completed_committees  INTEGER NOT NULL DEFAULT 0,
  active_committees     INTEGER NOT NULL DEFAULT 0,
  ontime_payment_pct    NUMERIC(5,2) NOT NULL DEFAULT 0,
  role                  TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  is_verified           BOOLEAN NOT NULL DEFAULT false,
  is_suspended          BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role  ON public.profiles(role);

-- ============================================================
-- COMMITTEES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.committees (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  monthly_amount   NUMERIC(12,2) NOT NULL CHECK (monthly_amount > 0),
  duration_months  INTEGER NOT NULL CHECK (duration_months >= 2 AND duration_months <= 24),
  max_members      INTEGER NOT NULL CHECK (max_members >= 2 AND max_members <= 50),
  current_members  INTEGER NOT NULL DEFAULT 1,
  start_date       DATE NOT NULL,
  end_date         DATE,
  rules            TEXT,
  payment_method   TEXT NOT NULL DEFAULT 'bank_transfer'
                   CHECK (payment_method IN ('bank_transfer','easypaisa','jazzcash','cash')),
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','active','completed','cancelled')),
  current_month    INTEGER NOT NULL DEFAULT 0,
  is_public        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_committees_creator  ON public.committees(creator_id);
CREATE INDEX idx_committees_status   ON public.committees(status);
CREATE INDEX idx_committees_public   ON public.committees(is_public);

-- ============================================================
-- COMMITTEE MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.committee_members (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  committee_id       UUID NOT NULL REFERENCES public.committees(id) ON DELETE CASCADE,
  user_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  turn_number        INTEGER NOT NULL DEFAULT 1,
  joined_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  iban               TEXT,
  bank_account       TEXT,
  easypaisa_number   TEXT,
  jazzcash_number    TEXT,
  status             TEXT NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active','removed','left','suspended')),
  total_paid         NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_due          NUMERIC(12,2) NOT NULL DEFAULT 0,
  has_received_turn  BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(committee_id, user_id),
  UNIQUE(committee_id, turn_number)
);

CREATE INDEX idx_cm_committee ON public.committee_members(committee_id);
CREATE INDEX idx_cm_user      ON public.committee_members(user_id);

-- ============================================================
-- JOIN REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.join_requests (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  committee_id  UUID NOT NULL REFERENCES public.committees(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','approved','rejected')),
  message       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(committee_id, user_id)
);

CREATE INDEX idx_jr_committee ON public.join_requests(committee_id);
CREATE INDEX idx_jr_user      ON public.join_requests(user_id);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  committee_id    UUID NOT NULL REFERENCES public.committees(id) ON DELETE CASCADE,
  member_id       UUID NOT NULL REFERENCES public.committee_members(id) ON DELETE CASCADE,
  month_number    INTEGER NOT NULL CHECK (month_number > 0),
  amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','paid','overdue','waived')),
  transaction_id  TEXT,
  proof_url       TEXT,
  due_date        DATE NOT NULL,
  paid_at         TIMESTAMPTZ,
  verified_by     UUID REFERENCES public.profiles(id),
  verified_at     TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(committee_id, member_id, month_number)
);

CREATE INDEX idx_payments_committee ON public.payments(committee_id);
CREATE INDEX idx_payments_member    ON public.payments(member_id);
CREATE INDEX idx_payments_status    ON public.payments(status);
CREATE INDEX idx_payments_due_date  ON public.payments(due_date);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL DEFAULT 'general',
  title      TEXT NOT NULL,
  message    TEXT NOT NULL DEFAULT '',
  is_read    BOOLEAN NOT NULL DEFAULT false,
  data       JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user    ON public.notifications(user_id);
CREATE INDEX idx_notif_is_read ON public.notifications(user_id, is_read);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  committee_id  UUID NOT NULL REFERENCES public.committees(id) ON DELETE CASCADE,
  rating        INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(reviewer_id, reviewee_id, committee_id)
);

-- ============================================================
-- REPUTATION LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reputation_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  change     INTEGER NOT NULL,
  reason     TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reputlog_user ON public.reputation_logs(user_id);

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,
  entity_type  TEXT,
  entity_id    UUID,
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_actlog_user ON public.activity_logs(user_id);
CREATE INDEX idx_actlog_time ON public.activity_logs(created_at DESC);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id    UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  committee_id  UUID NOT NULL REFERENCES public.committees(id) ON DELETE CASCADE,
  amount        NUMERIC(12,2) NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('credit','debit','refund')),
  reference     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
