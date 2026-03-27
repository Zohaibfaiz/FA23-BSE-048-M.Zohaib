-- ============================================================
-- AdFlow Pro — Complete Supabase SQL Schema + RLS Policies
-- ============================================================
-- Run this in your Supabase SQL Editor (Dashboard → SQL)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- 1. CATEGORIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  icon        TEXT,                        -- lucide icon name
  description TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 2. CITIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cities (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  province   TEXT,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 3. PACKAGES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS packages (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 TEXT NOT NULL,           -- Basic | Standard | Premium
  slug                 TEXT NOT NULL UNIQUE,
  price                NUMERIC(10,2) NOT NULL,
  duration_days        INTEGER NOT NULL,         -- 7 | 15 | 30
  homepage_visibility  BOOLEAN DEFAULT FALSE,
  featured_weight      INTEGER DEFAULT 1,        -- 1x | 2x | 3x
  refresh_rule         TEXT DEFAULT 'none',      -- none | manual | auto_3days
  description          TEXT,
  features             JSONB DEFAULT '[]',       -- list of feature strings
  is_active            BOOLEAN DEFAULT TRUE,
  sort_order           INTEGER DEFAULT 0,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 4. USERS (extends Supabase auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  full_name    TEXT,
  avatar_url   TEXT,
  role         TEXT NOT NULL DEFAULT 'client'
                 CHECK (role IN ('client','moderator','admin','super_admin')),
  is_active    BOOLEAN DEFAULT TRUE,
  is_verified  BOOLEAN DEFAULT FALSE,            -- seller verified badge
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 5. SELLER PROFILES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seller_profiles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT,
  phone        TEXT,
  whatsapp     TEXT,
  website      TEXT,
  bio          TEXT,
  social_links JSONB DEFAULT '{}',
  verified_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ─────────────────────────────────────────────
-- 6. ADS (core table)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  description     TEXT,
  price           NUMERIC(12,2),
  price_label     TEXT,                          -- e.g. "PKR 5,000/month"
  contact_phone   TEXT,
  contact_email   TEXT,
  contact_whatsapp TEXT,
  city_id         UUID REFERENCES cities(id),
  category_id     UUID REFERENCES categories(id),
  package_id      UUID REFERENCES packages(id),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Status machine
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN (
                      'draft','submitted','under_review','payment_pending',
                      'payment_submitted','payment_verified','scheduled',
                      'published','expired','archived'
                    )),
  moderation_note TEXT,
  rejection_reason TEXT,

  -- Scheduling & expiry
  publish_at      TIMESTAMPTZ,
  expire_at       TIMESTAMPTZ,
  published_at    TIMESTAMPTZ,
  expired_at      TIMESTAMPTZ,

  -- Ranking
  is_featured     BOOLEAN DEFAULT FALSE,
  admin_boost     INTEGER DEFAULT 0,
  rank_score      NUMERIC DEFAULT 0,

  -- Soft delete
  deleted_at      TIMESTAMPTZ,

  -- Abuse report
  report_count    INTEGER DEFAULT 0,

  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 7. AD MEDIA (external URLs only — NO uploads)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ad_media (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id                    UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  source_type              TEXT NOT NULL
                             CHECK (source_type IN ('image','youtube','github_raw','other')),
  original_url             TEXT NOT NULL,
  normalized_thumbnail_url TEXT,              -- auto-extracted for YouTube
  validation_status        TEXT DEFAULT 'pending'
                             CHECK (validation_status IN ('pending','valid','invalid')),
  is_primary               BOOLEAN DEFAULT FALSE,
  sort_order               INTEGER DEFAULT 0,
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 8. PAYMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id            UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id       UUID REFERENCES packages(id),
  amount           NUMERIC(10,2) NOT NULL,
  currency         TEXT DEFAULT 'PKR',
  transaction_ref  TEXT NOT NULL UNIQUE,        -- prevents duplicates
  payment_method   TEXT DEFAULT 'bank_transfer',
  proof_url        TEXT NOT NULL,               -- external URL of payment proof
  status           TEXT DEFAULT 'pending'
                     CHECK (status IN ('pending','verified','rejected')),
  verified_by      UUID REFERENCES users(id),
  verified_at      TIMESTAMPTZ,
  rejection_reason TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 9. NOTIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT DEFAULT 'info'
               CHECK (type IN ('info','success','warning','error')),
  is_read    BOOLEAN DEFAULT FALSE,
  link       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 10. AUDIT LOGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id    UUID REFERENCES users(id),
  action      TEXT NOT NULL,                   -- e.g. "ad.approved"
  entity_type TEXT NOT NULL,                   -- e.g. "ad"
  entity_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 11. AD STATUS HISTORY
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ad_status_history (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id      UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status  TEXT NOT NULL,
  actor_id   UUID REFERENCES users(id),
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 12. LEARNING QUESTIONS (homepage widget)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_questions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question     TEXT NOT NULL,
  options      JSONB NOT NULL,                 -- array of {label, value}
  correct_key  TEXT NOT NULL,
  explanation  TEXT,
  category     TEXT,
  difficulty   TEXT DEFAULT 'easy'
                 CHECK (difficulty IN ('easy','medium','hard')),
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 13. SYSTEM HEALTH LOGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_health_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  check_type       TEXT NOT NULL,             -- db_heartbeat | cron_publish | cron_expire
  status           TEXT NOT NULL,             -- ok | error
  details          JSONB,
  duration_ms      INTEGER,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 14. ABUSE REPORTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS abuse_reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id       UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES users(id),
  reason      TEXT NOT NULL,
  details     TEXT,
  status      TEXT DEFAULT 'open'
                CHECK (status IN ('open','reviewed','dismissed')),
  reviewed_by UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INDEXES for performance
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ads_status        ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_user_id       ON ads(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_category_id   ON ads(category_id);
CREATE INDEX IF NOT EXISTS idx_ads_city_id       ON ads(city_id);
CREATE INDEX IF NOT EXISTS idx_ads_rank_score    ON ads(rank_score DESC);
CREATE INDEX IF NOT EXISTS idx_ads_publish_at    ON ads(publish_at);
CREATE INDEX IF NOT EXISTS idx_ads_expire_at     ON ads(expire_at);
CREATE INDEX IF NOT EXISTS idx_ads_deleted_at    ON ads(deleted_at);
CREATE INDEX IF NOT EXISTS idx_payments_tx_ref   ON payments(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity  ON audit_logs(entity_type, entity_id);

-- ─────────────────────────────────────────────
-- RANK SCORE FUNCTION
-- rankScore = (featured?50:0) + (packageWeight*10) + freshnessPoints + adminBoost + verifiedSellerPoints
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION compute_rank_score(
  p_is_featured      BOOLEAN,
  p_package_weight   INTEGER,
  p_published_at     TIMESTAMPTZ,
  p_admin_boost      INTEGER,
  p_is_seller_verified BOOLEAN
) RETURNS NUMERIC AS $$
DECLARE
  featured_pts   NUMERIC := CASE WHEN p_is_featured THEN 50 ELSE 0 END;
  package_pts    NUMERIC := COALESCE(p_package_weight, 1) * 10;
  freshness_pts  NUMERIC;
  boost_pts      NUMERIC := COALESCE(p_admin_boost, 0);
  verified_pts   NUMERIC := CASE WHEN p_is_seller_verified THEN 5 ELSE 0 END;
  hours_old      NUMERIC;
BEGIN
  -- Freshness: newer ads rank higher (decay over 30 days)
  hours_old := EXTRACT(EPOCH FROM (NOW() - COALESCE(p_published_at, NOW()))) / 3600;
  freshness_pts := GREATEST(0, 30 - (hours_old / 24));
  RETURN featured_pts + package_pts + freshness_pts + boost_pts + verified_pts;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-compute rank_score on insert/update
CREATE OR REPLACE FUNCTION trigger_update_rank_score() RETURNS TRIGGER AS $$
DECLARE
  pkg_weight  INTEGER := 1;
  is_verified BOOLEAN := FALSE;
BEGIN
  SELECT featured_weight INTO pkg_weight
  FROM packages WHERE id = NEW.package_id;

  SELECT u.is_verified INTO is_verified
  FROM users u WHERE u.id = NEW.user_id;

  NEW.rank_score := compute_rank_score(
    NEW.is_featured,
    pkg_weight,
    NEW.published_at,
    NEW.admin_boost,
    is_verified
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ads_rank_score_trigger
  BEFORE INSERT OR UPDATE ON ads
  FOR EACH ROW EXECUTE FUNCTION trigger_update_rank_score();

-- Trigger to log status history
CREATE OR REPLACE FUNCTION trigger_log_status_history() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO ad_status_history(ad_id, from_status, to_status)
    VALUES(NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ads_status_history_trigger
  AFTER UPDATE ON ads
  FOR EACH ROW EXECUTE FUNCTION trigger_log_status_history();

-- updated_at auto-update
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ads_updated_at     BEFORE UPDATE ON ads     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER users_updated_at   BEFORE UPDATE ON users   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER seller_profiles_updated_at BEFORE UPDATE ON seller_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION auth_user_role() RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT role FROM users WHERE id = auth.uid()),
    'anon'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user is admin or super_admin
CREATE OR REPLACE FUNCTION is_admin_or_above() RETURNS BOOLEAN AS $$
  SELECT auth_user_role() IN ('admin','super_admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_moderator_or_above() RETURNS BOOLEAN AS $$
  SELECT auth_user_role() IN ('moderator','admin','super_admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── CATEGORIES RLS ──
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read"  ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "categories_admin_all"    ON categories FOR ALL   USING (is_admin_or_above());

-- ── CITIES RLS ──
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cities_public_read"  ON cities FOR SELECT USING (is_active = TRUE);
CREATE POLICY "cities_admin_all"    ON cities FOR ALL   USING (is_admin_or_above());

-- ── PACKAGES RLS ──
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "packages_public_read"  ON packages FOR SELECT USING (is_active = TRUE);
CREATE POLICY "packages_admin_all"    ON packages FOR ALL   USING (is_admin_or_above());

-- ── USERS RLS ──
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_read"       ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_own_update"     ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "users_admin_all"      ON users FOR ALL   USING (is_admin_or_above());
CREATE POLICY "users_moderator_read" ON users FOR SELECT USING (is_moderator_or_above());

-- ── SELLER PROFILES RLS ──
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seller_own_all"    ON seller_profiles FOR ALL    USING (user_id = auth.uid());
CREATE POLICY "seller_public_read" ON seller_profiles FOR SELECT USING (TRUE);
CREATE POLICY "seller_admin_all"  ON seller_profiles FOR ALL    USING (is_admin_or_above());

-- ── ADS RLS ──
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
-- Public can see published, non-expired, non-deleted ads
CREATE POLICY "ads_public_read" ON ads FOR SELECT USING (
  status = 'published'
  AND (expire_at IS NULL OR expire_at > NOW())
  AND deleted_at IS NULL
);
-- Clients can see their own ads
CREATE POLICY "ads_owner_read" ON ads FOR SELECT USING (user_id = auth.uid());
-- Clients can create/update their own ads
CREATE POLICY "ads_owner_insert" ON ads FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "ads_owner_update" ON ads FOR UPDATE USING (
  user_id = auth.uid()
  AND status IN ('draft','payment_pending')
);
-- Moderators can see submitted/under_review ads
CREATE POLICY "ads_moderator_read" ON ads FOR SELECT USING (is_moderator_or_above());
CREATE POLICY "ads_moderator_update" ON ads FOR UPDATE USING (is_moderator_or_above());
-- Admins can do everything
CREATE POLICY "ads_admin_all" ON ads FOR ALL USING (is_admin_or_above());

-- ── AD MEDIA RLS ──
ALTER TABLE ad_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ad_media_public_read"  ON ad_media FOR SELECT USING (TRUE);
CREATE POLICY "ad_media_owner_insert" ON ad_media FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM ads WHERE ads.id = ad_id AND ads.user_id = auth.uid())
);
CREATE POLICY "ad_media_owner_delete" ON ad_media FOR DELETE USING (
  EXISTS(SELECT 1 FROM ads WHERE ads.id = ad_id AND ads.user_id = auth.uid())
);
CREATE POLICY "ad_media_admin_all"    ON ad_media FOR ALL USING (is_admin_or_above());

-- ── PAYMENTS RLS ──
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_owner_read"   ON payments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "payments_owner_insert" ON payments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "payments_admin_all"    ON payments FOR ALL   USING (is_admin_or_above());

-- ── NOTIFICATIONS RLS ──
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_own_all" ON notifications FOR ALL USING (user_id = auth.uid());
CREATE POLICY "notif_admin_insert" ON notifications FOR INSERT WITH CHECK (is_admin_or_above());

-- ── AUDIT LOGS RLS ──
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_admin_read" ON audit_logs FOR SELECT USING (is_admin_or_above());
CREATE POLICY "audit_system_insert" ON audit_logs FOR INSERT WITH CHECK (TRUE);

-- ── AD STATUS HISTORY RLS ──
ALTER TABLE ad_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "history_owner_read" ON ad_status_history FOR SELECT USING (
  EXISTS(SELECT 1 FROM ads WHERE ads.id = ad_id AND ads.user_id = auth.uid())
);
CREATE POLICY "history_mod_read"    ON ad_status_history FOR SELECT USING (is_moderator_or_above());
CREATE POLICY "history_system_insert" ON ad_status_history FOR INSERT WITH CHECK (TRUE);

-- ── LEARNING QUESTIONS RLS ──
ALTER TABLE learning_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lq_public_read"  ON learning_questions FOR SELECT USING (is_active = TRUE);
CREATE POLICY "lq_admin_all"    ON learning_questions FOR ALL   USING (is_admin_or_above());

-- ── SYSTEM HEALTH LOGS RLS ──
ALTER TABLE system_health_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "health_admin_read"    ON system_health_logs FOR SELECT USING (is_admin_or_above());
CREATE POLICY "health_system_insert" ON system_health_logs FOR INSERT WITH CHECK (TRUE);

-- ── ABUSE REPORTS RLS ──
ALTER TABLE abuse_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "abuse_owner_insert" ON abuse_reports FOR INSERT WITH CHECK (
  reporter_id = auth.uid() OR reporter_id IS NULL
);
CREATE POLICY "abuse_admin_all" ON abuse_reports FOR ALL USING (is_admin_or_above());
