-- ============================================================
-- AdFlow Pro — Complete Supabase SQL Schema
-- Version: 1.0.0
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search on titles

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('client', 'moderator', 'admin', 'super_admin');

CREATE TYPE ad_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'payment_pending',
  'payment_submitted',
  'payment_verified',
  'scheduled',
  'published',
  'expired',
  'archived',
  'rejected'
);

CREATE TYPE package_type AS ENUM ('basic', 'standard', 'premium');

CREATE TYPE media_source_type AS ENUM ('github_raw', 'direct_image', 'youtube', 'other_url');

CREATE TYPE validation_status AS ENUM ('pending', 'valid', 'invalid', 'failed');

CREATE TYPE payment_status AS ENUM ('pending', 'submitted', 'verified', 'rejected');

CREATE TYPE notification_type AS ENUM (
  'ad_submitted', 'ad_approved', 'ad_rejected', 'payment_verified',
  'ad_published', 'ad_expiring_soon', 'ad_expired', 'new_review_needed'
);

-- ============================================================
-- TABLE: users (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT,
  role          user_role NOT NULL DEFAULT 'client',
  avatar_url    TEXT,
  is_verified   BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);

-- ============================================================
-- TABLE: seller_profiles
-- ============================================================
CREATE TABLE public.seller_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  business_name   TEXT,
  phone           TEXT,
  whatsapp        TEXT,
  city            TEXT,
  bio             TEXT,
  website_url     TEXT,
  is_verified     BOOLEAN DEFAULT FALSE,
  verified_at     TIMESTAMPTZ,
  verified_by     UUID REFERENCES public.users(id),
  total_ads       INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_seller_profiles_user ON public.seller_profiles(user_id);

-- ============================================================
-- TABLE: categories
-- ============================================================
CREATE TABLE public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT,           -- Lucide icon name
  color       TEXT,           -- hex color
  ad_count    INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_categories_slug ON public.categories(slug);

-- ============================================================
-- TABLE: cities
-- ============================================================
CREATE TABLE public.cities (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  province    TEXT,
  country     TEXT DEFAULT 'Pakistan',
  ad_count    INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_cities_slug ON public.cities(slug);

-- ============================================================
-- TABLE: packages
-- ============================================================
CREATE TABLE public.packages (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  TEXT NOT NULL,
  type                  package_type NOT NULL UNIQUE,
  price                 DECIMAL(10,2) NOT NULL,
  duration_days         INTEGER NOT NULL,       -- 7, 15, 30
  featured_weight       INTEGER NOT NULL,       -- 1, 2, 3
  homepage_visibility   BOOLEAN DEFAULT FALSE,
  category_priority     BOOLEAN DEFAULT FALSE,
  auto_refresh          BOOLEAN DEFAULT FALSE,  -- Premium only
  refresh_interval_days INTEGER,               -- 3 for premium
  description           TEXT,
  features              JSONB DEFAULT '[]',     -- array of feature strings
  is_active             BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: ads (core table)
-- ============================================================
CREATE TABLE public.ads (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug              TEXT NOT NULL UNIQUE,
  title             TEXT NOT NULL,
  description       TEXT,
  category_id       UUID REFERENCES public.categories(id),
  city_id           UUID REFERENCES public.cities(id),
  owner_id          UUID NOT NULL REFERENCES public.users(id),
  package_id        UUID REFERENCES public.packages(id),
  status            ad_status NOT NULL DEFAULT 'draft',
  is_featured       BOOLEAN DEFAULT FALSE,
  admin_boost       INTEGER DEFAULT 0,         -- 0-20 manual boost
  rank_score        DECIMAL(10,2) DEFAULT 0,
  view_count        INTEGER DEFAULT 0,
  click_count       INTEGER DEFAULT 0,
  contact_clicks    INTEGER DEFAULT 0,
  publish_at        TIMESTAMPTZ,              -- scheduled publish time
  expire_at         TIMESTAMPTZ,
  last_refreshed_at TIMESTAMPTZ,
  expiry_warned     BOOLEAN DEFAULT FALSE,    -- 48h warning sent?
  rejection_reason  TEXT,
  moderator_notes   TEXT,
  is_deleted        BOOLEAN DEFAULT FALSE,    -- soft delete
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ads_slug ON public.ads(slug);
CREATE INDEX idx_ads_status ON public.ads(status);
CREATE INDEX idx_ads_owner ON public.ads(owner_id);
CREATE INDEX idx_ads_category ON public.ads(category_id);
CREATE INDEX idx_ads_city ON public.ads(city_id);
CREATE INDEX idx_ads_rank ON public.ads(rank_score DESC);
CREATE INDEX idx_ads_publish_at ON public.ads(publish_at);
CREATE INDEX idx_ads_expire_at ON public.ads(expire_at);
CREATE INDEX idx_ads_featured ON public.ads(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_ads_title_search ON public.ads USING gin(to_tsvector('english', title));

-- ============================================================
-- TABLE: ad_media
-- ============================================================
CREATE TABLE public.ad_media (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id                     UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  source_type               media_source_type NOT NULL,
  original_url              TEXT NOT NULL,
  normalized_thumbnail_url  TEXT,
  validation_status         validation_status DEFAULT 'pending',
  validation_error          TEXT,
  is_primary                BOOLEAN DEFAULT FALSE,
  sort_order                INTEGER DEFAULT 0,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ad_media_ad ON public.ad_media(ad_id);

-- ============================================================
-- TABLE: payments
-- ============================================================
CREATE TABLE public.payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id               UUID NOT NULL REFERENCES public.ads(id),
  user_id             UUID NOT NULL REFERENCES public.users(id),
  package_id          UUID NOT NULL REFERENCES public.packages(id),
  amount              DECIMAL(10,2) NOT NULL,
  transaction_ref     TEXT NOT NULL UNIQUE,    -- duplicate prevention
  proof_url           TEXT,                    -- external URL of payment screenshot
  status              payment_status DEFAULT 'pending',
  submitted_at        TIMESTAMPTZ,
  verified_at         TIMESTAMPTZ,
  verified_by         UUID REFERENCES public.users(id),
  rejection_reason    TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_payments_ad ON public.payments(ad_id);
CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE UNIQUE INDEX idx_payments_txn_ref ON public.payments(transaction_ref);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ad_id       UUID REFERENCES public.ads(id) ON DELETE SET NULL,
  type        notification_type NOT NULL,
  title       TEXT NOT NULL,
  message     TEXT,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================================
-- TABLE: audit_logs
-- ============================================================
CREATE TABLE public.audit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id      UUID REFERENCES public.users(id),
  actor_role    user_role,
  action        TEXT NOT NULL,         -- e.g. 'ad.status_changed', 'payment.verified'
  entity_type   TEXT NOT NULL,         -- 'ad', 'payment', 'user', etc.
  entity_id     UUID,
  old_value     JSONB,
  new_value     JSONB,
  ip_address    TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ============================================================
-- TABLE: ad_status_history
-- ============================================================
CREATE TABLE public.ad_status_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id       UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  from_status ad_status,
  to_status   ad_status NOT NULL,
  changed_by  UUID REFERENCES public.users(id),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_status_history_ad ON public.ad_status_history(ad_id);

-- ============================================================
-- TABLE: learning_questions (landing page widget)
-- ============================================================
CREATE TABLE public.learning_questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question      TEXT NOT NULL,
  options       JSONB NOT NULL,   -- ["option A", "option B", "option C", "option D"]
  correct_index INTEGER NOT NULL, -- 0-based index
  explanation   TEXT,
  category      TEXT DEFAULT 'general',
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: system_health_logs
-- ============================================================
CREATE TABLE public.system_health_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  check_type      TEXT NOT NULL,  -- 'db_heartbeat', 'cron_publish', 'cron_expire'
  status          TEXT NOT NULL,  -- 'ok', 'error', 'warning'
  details         JSONB,
  ads_processed   INTEGER,
  duration_ms     INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_health_logs_type ON public.system_health_logs(check_type, created_at DESC);

-- ============================================================
-- TABLE: abuse_reports
-- ============================================================
CREATE TABLE public.abuse_reports (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id         UUID NOT NULL REFERENCES public.ads(id),
  reported_by   UUID REFERENCES public.users(id),
  reason        TEXT NOT NULL,
  details       TEXT,
  status        TEXT DEFAULT 'pending', -- pending, reviewed, dismissed
  reviewed_by   UUID REFERENCES public.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_abuse_reports_ad ON public.abuse_reports(ad_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_ads_updated_at BEFORE UPDATE ON public.ads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function: calculate rank score
CREATE OR REPLACE FUNCTION calculate_rank_score(
  p_is_featured BOOLEAN,
  p_package_weight INTEGER,
  p_publish_at TIMESTAMPTZ,
  p_admin_boost INTEGER,
  p_owner_verified BOOLEAN
)
RETURNS DECIMAL AS $$
DECLARE
  featured_pts    DECIMAL := 0;
  weight_pts      DECIMAL := 0;
  freshness_pts   DECIMAL := 0;
  boost_pts       DECIMAL := 0;
  verified_pts    DECIMAL := 0;
  hours_old       DECIMAL;
BEGIN
  -- Featured bonus
  IF p_is_featured THEN
    featured_pts := 50;
  END IF;
  -- Package weight (1x=10, 2x=20, 3x=30)
  weight_pts := p_package_weight * 10;
  -- Freshness: max 20 points, decays over 168h (7 days)
  IF p_publish_at IS NOT NULL THEN
    hours_old := EXTRACT(EPOCH FROM (NOW() - p_publish_at)) / 3600;
    freshness_pts := GREATEST(0, 20 - (hours_old / 168 * 20));
  END IF;
  -- Admin boost (0-20)
  boost_pts := COALESCE(p_admin_boost, 0);
  -- Verified seller bonus
  IF p_owner_verified THEN
    verified_pts := 10;
  END IF;

  RETURN featured_pts + weight_pts + freshness_pts + boost_pts + verified_pts;
END;
$$ LANGUAGE plpgsql;

-- Trigger: auto-update ad_count on categories/cities
CREATE OR REPLACE FUNCTION update_category_city_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status = 'published') THEN
    UPDATE public.categories SET ad_count = (
      SELECT COUNT(*) FROM public.ads WHERE category_id = NEW.category_id AND status = 'published'
    ) WHERE id = NEW.category_id;
    UPDATE public.cities SET ad_count = (
      SELECT COUNT(*) FROM public.ads WHERE city_id = NEW.city_id AND status = 'published'
    ) WHERE id = NEW.city_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_counts AFTER INSERT OR UPDATE ON public.ads
  FOR EACH ROW EXECUTE FUNCTION update_category_city_counts();

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abuse_reports ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- USERS policies ----
CREATE POLICY "users_select_own" ON public.users FOR SELECT
  USING (id = auth.uid() OR auth_user_role() IN ('admin', 'super_admin', 'moderator'));

CREATE POLICY "users_update_own" ON public.users FOR UPDATE
  USING (id = auth.uid() OR auth_user_role() IN ('admin', 'super_admin'));

-- ---- SELLER PROFILES policies ----
CREATE POLICY "seller_profiles_select" ON public.seller_profiles FOR SELECT USING (TRUE);
CREATE POLICY "seller_profiles_insert" ON public.seller_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "seller_profiles_update" ON public.seller_profiles FOR UPDATE
  USING (user_id = auth.uid() OR auth_user_role() IN ('admin', 'super_admin'));

-- ---- CATEGORIES / CITIES / PACKAGES — public read ----
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "categories_admin_write" ON public.categories FOR ALL
  USING (auth_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "cities_public_read" ON public.cities FOR SELECT USING (TRUE);
CREATE POLICY "cities_admin_write" ON public.cities FOR ALL
  USING (auth_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "packages_public_read" ON public.packages FOR SELECT USING (TRUE);
CREATE POLICY "packages_superadmin_write" ON public.packages FOR ALL
  USING (auth_user_role() = 'super_admin');

-- ---- ADS policies ----
-- Public can see published, non-deleted ads
CREATE POLICY "ads_public_read" ON public.ads FOR SELECT
  USING (
    status = 'published'
    AND is_deleted = FALSE
    AND (expire_at IS NULL OR expire_at > NOW())
  );

-- Clients see their own ads (all statuses)
CREATE POLICY "ads_owner_read" ON public.ads FOR SELECT
  USING (owner_id = auth.uid());

-- Moderators see submitted/under_review ads
CREATE POLICY "ads_moderator_read" ON public.ads FOR SELECT
  USING (auth_user_role() IN ('moderator', 'admin', 'super_admin'));

-- Clients can insert their own ads
CREATE POLICY "ads_client_insert" ON public.ads FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Clients can update draft ads
CREATE POLICY "ads_client_update" ON public.ads FOR UPDATE
  USING (owner_id = auth.uid() AND status = 'draft');

-- Admin/Moderator can update any ad
CREATE POLICY "ads_admin_update" ON public.ads FOR UPDATE
  USING (auth_user_role() IN ('admin', 'super_admin', 'moderator'));

-- ---- AD_MEDIA policies ----
CREATE POLICY "ad_media_public_read" ON public.ad_media FOR SELECT USING (TRUE);
CREATE POLICY "ad_media_owner_write" ON public.ad_media FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.ads WHERE id = ad_id AND owner_id = auth.uid())
  );
CREATE POLICY "ad_media_admin_all" ON public.ad_media FOR ALL
  USING (auth_user_role() IN ('admin', 'super_admin'));

-- ---- PAYMENTS policies ----
CREATE POLICY "payments_owner_read" ON public.payments FOR SELECT
  USING (user_id = auth.uid() OR auth_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "payments_client_insert" ON public.payments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "payments_admin_update" ON public.payments FOR UPDATE
  USING (auth_user_role() IN ('admin', 'super_admin'));

-- ---- NOTIFICATIONS policies ----
CREATE POLICY "notifications_own" ON public.notifications FOR SELECT
  USING (user_id = auth.uid() OR auth_user_role() IN ('admin', 'super_admin'));
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY "notifications_system_insert" ON public.notifications FOR INSERT
  WITH CHECK (auth_user_role() IN ('admin', 'super_admin') OR TRUE); -- system inserts

-- ---- AUDIT LOGS — read by admin+ ----
CREATE POLICY "audit_logs_admin_read" ON public.audit_logs FOR SELECT
  USING (auth_user_role() IN ('admin', 'super_admin'));
CREATE POLICY "audit_logs_system_insert" ON public.audit_logs FOR INSERT WITH CHECK (TRUE);

-- ---- AD STATUS HISTORY ----
CREATE POLICY "status_history_read" ON public.ad_status_history FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.ads WHERE id = ad_id AND owner_id = auth.uid())
    OR auth_user_role() IN ('admin', 'super_admin', 'moderator')
  );
CREATE POLICY "status_history_insert" ON public.ad_status_history FOR INSERT WITH CHECK (TRUE);

-- ---- LEARNING QUESTIONS — public read ----
CREATE POLICY "learning_questions_public" ON public.learning_questions FOR SELECT
  USING (is_active = TRUE);
CREATE POLICY "learning_questions_admin" ON public.learning_questions FOR ALL
  USING (auth_user_role() IN ('admin', 'super_admin'));

-- ---- SYSTEM HEALTH LOGS — admin only ----
CREATE POLICY "health_logs_admin" ON public.system_health_logs FOR ALL
  USING (auth_user_role() IN ('admin', 'super_admin'));
CREATE POLICY "health_logs_insert" ON public.system_health_logs FOR INSERT WITH CHECK (TRUE);

-- ---- ABUSE REPORTS ----
CREATE POLICY "abuse_reports_insert" ON public.abuse_reports FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "abuse_reports_admin_read" ON public.abuse_reports FOR SELECT
  USING (auth_user_role() IN ('admin', 'super_admin', 'moderator'));

-- ============================================================
-- VIEWS (convenience)
-- ============================================================

CREATE OR REPLACE VIEW public.ads_with_details AS
  SELECT
    a.*,
    c.name AS category_name,
    c.slug AS category_slug,
    c.icon AS category_icon,
    ci.name AS city_name,
    ci.slug AS city_slug,
    p.name AS package_name,
    p.type AS package_type,
    p.featured_weight AS package_weight,
    u.full_name AS owner_name,
    sp.business_name,
    sp.is_verified AS seller_verified,
    (SELECT normalized_thumbnail_url FROM public.ad_media
     WHERE ad_id = a.id AND is_primary = TRUE LIMIT 1) AS primary_media_url,
    (SELECT source_type FROM public.ad_media
     WHERE ad_id = a.id AND is_primary = TRUE LIMIT 1) AS primary_media_type
  FROM public.ads a
  LEFT JOIN public.categories c ON a.category_id = c.id
  LEFT JOIN public.cities ci ON a.city_id = ci.id
  LEFT JOIN public.packages p ON a.package_id = p.id
  LEFT JOIN public.users u ON a.owner_id = u.id
  LEFT JOIN public.seller_profiles sp ON a.owner_id = sp.user_id;
