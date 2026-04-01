-- ============================================================
-- AdFlow Pro - Complete Supabase SQL Schema + RLS Policies
-- Run this in Supabase SQL Editor (as a single migration)
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search indexes

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
  'archived'
);
CREATE TYPE payment_status AS ENUM ('pending', 'submitted', 'verified', 'rejected');
CREATE TYPE media_source_type AS ENUM ('github_raw', 'direct_image', 'youtube', 'other');
CREATE TYPE media_validation_status AS ENUM ('pending', 'valid', 'invalid');
CREATE TYPE notification_type AS ENUM (
  'status_change',
  'payment_required',
  'payment_verified',
  'payment_rejected',
  'ad_expiring_soon',
  'ad_expired',
  'moderation_note',
  'system'
);
CREATE TYPE package_tier AS ENUM ('basic', 'standard', 'premium');

-- ============================================================
-- TABLE: users (mirrors Supabase auth.users with extra fields)
-- ============================================================
CREATE TABLE public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL UNIQUE,
  full_name       TEXT,
  role            user_role NOT NULL DEFAULT 'client',
  is_verified_seller BOOLEAN NOT NULL DEFAULT false,
  avatar_url      TEXT,
  phone           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ  -- soft delete
);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);

-- ============================================================
-- TABLE: seller_profiles
-- ============================================================
CREATE TABLE public.seller_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_name   TEXT,
  business_type   TEXT,
  website_url     TEXT,
  description     TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified','pending','verified','rejected')),
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- TABLE: packages
-- ============================================================
CREATE TABLE public.packages (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  TEXT NOT NULL,
  tier                  package_tier NOT NULL,
  duration_days         INTEGER NOT NULL,
  price                 NUMERIC(10,2) NOT NULL,
  homepage_visibility   BOOLEAN NOT NULL DEFAULT false,
  featured_weight       INTEGER NOT NULL DEFAULT 1,
  refresh_rule          TEXT, -- 'none', 'manual', 'auto_3_days'
  description           TEXT,
  is_active             BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_packages_tier ON public.packages(tier);

-- Seed default packages (Prices in PKR)
INSERT INTO public.packages (name, tier, duration_days, price, homepage_visibility, featured_weight, refresh_rule, description) VALUES
('Basic',    'basic',    7,  2999,  false, 1, 'none',         'Perfect for small businesses and short-term promotions.'),
('Standard', 'standard', 15, 6999, false, 2, 'manual',       'Ideal for growing businesses needing category priority.'),
('Premium',  'premium',  30, 14999, true,  3, 'auto_3_days',  'Maximum visibility with homepage placement and auto-refresh.');

-- ============================================================
-- TABLE: categories
-- ============================================================
CREATE TABLE public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_categories_slug ON public.categories(slug);

INSERT INTO public.categories (name, slug, icon) VALUES
('Technology',    'technology',    'Monitor'),
('Real Estate',   'real-estate',   'Home'),
('Vehicles',      'vehicles',      'Car'),
('Jobs',          'jobs',          'Briefcase'),
('Services',      'services',      'Wrench'),
('Fashion',       'fashion',       'Shirt'),
('Food & Dining', 'food-dining',   'UtensilsCrossed'),
('Health',        'health',        'Heart'),
('Education',     'education',     'GraduationCap'),
('Entertainment', 'entertainment', 'Tv');

-- ============================================================
-- TABLE: cities
-- ============================================================
CREATE TABLE public.cities (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  state      TEXT,
  country    TEXT NOT NULL DEFAULT 'US',
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cities_slug ON public.cities(slug);

INSERT INTO public.cities (name, slug, state, country) VALUES
('New York',     'new-york',     'NY', 'US'),
('Los Angeles',  'los-angeles',  'CA', 'US'),
('Chicago',      'chicago',      'IL', 'US'),
('Houston',      'houston',      'TX', 'US'),
('Phoenix',      'phoenix',      'AZ', 'US'),
('Philadelphia', 'philadelphia', 'PA', 'US'),
('San Antonio',  'san-antonio',  'TX', 'US'),
('San Diego',    'san-diego',    'CA', 'US'),
('Dallas',       'dallas',       'TX', 'US'),
('San Jose',     'san-jose',     'CA', 'US');

-- ============================================================
-- TABLE: ads
-- ============================================================
CREATE TABLE public.ads (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug              TEXT NOT NULL UNIQUE,
  title             TEXT NOT NULL,
  description       TEXT NOT NULL,
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  package_id        UUID REFERENCES public.packages(id),
  category_id       UUID REFERENCES public.categories(id),
  city_id           UUID REFERENCES public.cities(id),
  status            ad_status NOT NULL DEFAULT 'draft',
  contact_email     TEXT,
  contact_phone     TEXT,
  website_url       TEXT,
  price             NUMERIC(10,2),
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  admin_boost       INTEGER NOT NULL DEFAULT 0,
  rank_score        NUMERIC(10,2) NOT NULL DEFAULT 0,
  freshness_points  INTEGER NOT NULL DEFAULT 10,
  last_refreshed_at TIMESTAMPTZ DEFAULT NOW(),
  publish_at        TIMESTAMPTZ,
  expire_at         TIMESTAMPTZ,
  moderation_notes  TEXT,
  rejection_reason  TEXT,
  view_count        INTEGER NOT NULL DEFAULT 0,
  click_count       INTEGER NOT NULL DEFAULT 0,
  report_count      INTEGER NOT NULL DEFAULT 0,
  is_deleted        BOOLEAN NOT NULL DEFAULT false, -- soft delete
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ads_status ON public.ads(status);
CREATE INDEX idx_ads_user_id ON public.ads(user_id);
CREATE INDEX idx_ads_category_id ON public.ads(category_id);
CREATE INDEX idx_ads_city_id ON public.ads(city_id);
CREATE INDEX idx_ads_rank_score ON public.ads(rank_score DESC);
CREATE INDEX idx_ads_expire_at ON public.ads(expire_at);
CREATE INDEX idx_ads_publish_at ON public.ads(publish_at);
CREATE INDEX idx_ads_slug ON public.ads(slug);
CREATE INDEX idx_ads_title_trgm ON public.ads USING GIN (title gin_trgm_ops);
CREATE INDEX idx_ads_description_trgm ON public.ads USING GIN (description gin_trgm_ops);

-- ============================================================
-- TABLE: ad_media
-- ============================================================
CREATE TABLE public.ad_media (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id                   UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  source_type             media_source_type NOT NULL DEFAULT 'direct_image',
  original_url            TEXT NOT NULL,
  normalized_thumbnail_url TEXT,
  youtube_video_id        TEXT,
  validation_status       media_validation_status NOT NULL DEFAULT 'pending',
  is_primary              BOOLEAN NOT NULL DEFAULT false,
  sort_order              INTEGER NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ad_media_ad_id ON public.ad_media(ad_id);

-- ============================================================
-- TABLE: payments
-- ============================================================
CREATE TABLE public.payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id               UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  package_id          UUID NOT NULL REFERENCES public.packages(id),
  amount              NUMERIC(10,2) NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'PKR',
  transaction_ref     TEXT UNIQUE, -- duplicate blocked by UNIQUE constraint
  payment_proof_url   TEXT,
  status              payment_status NOT NULL DEFAULT 'pending',
  submitted_at        TIMESTAMPTZ,
  verified_at         TIMESTAMPTZ,
  verified_by         UUID REFERENCES public.users(id),
  rejection_reason    TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_payments_ad_id ON public.payments(ad_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_transaction_ref ON public.payments(transaction_ref);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  ad_id       UUID REFERENCES public.ads(id) ON DELETE SET NULL,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- ============================================================
-- TABLE: audit_logs
-- ============================================================
CREATE TABLE public.audit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  actor_email   TEXT,
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL, -- 'ad', 'payment', 'package', etc.
  entity_id     UUID,
  old_data      JSONB,
  new_data      JSONB,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity_id ON public.audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============================================================
-- TABLE: ad_status_history
-- ============================================================
CREATE TABLE public.ad_status_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id       UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  from_status ad_status,
  to_status   ad_status NOT NULL,
  changed_by  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ad_status_history_ad_id ON public.ad_status_history(ad_id);

-- ============================================================
-- TABLE: learning_questions
-- ============================================================
CREATE TABLE public.learning_questions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question     TEXT NOT NULL,
  options      JSONB NOT NULL, -- array of {text, is_correct}
  explanation  TEXT,
  category     TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.learning_questions (question, options, explanation, category) VALUES
('What is the best package for short-term promotions?', 
 '[{"text":"Basic","is_correct":true},{"text":"Standard","is_correct":false},{"text":"Premium","is_correct":false}]',
 'The Basic package runs for 7 days and is best for short-term promotions.',
 'packages'),
('How long does the Premium package last?',
 '[{"text":"7 days","is_correct":false},{"text":"15 days","is_correct":false},{"text":"30 days","is_correct":true}]',
 'Premium packages run for 30 days with homepage visibility.',
 'packages'),
('Which package includes auto-refresh every 3 days?',
 '[{"text":"Basic","is_correct":false},{"text":"Standard","is_correct":false},{"text":"Premium","is_correct":true}]',
 'Premium ads are automatically refreshed every 3 days to maintain freshness.',
 'features');

-- ============================================================
-- TABLE: system_health_logs  
-- ============================================================
CREATE TABLE public.system_health_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  check_type      TEXT NOT NULL, -- 'db_heartbeat', 'cron_publish', 'cron_expire'
  status          TEXT NOT NULL, -- 'ok', 'warning', 'error'
  message         TEXT,
  metadata        JSONB,
  duration_ms     INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_system_health_logs_created_at ON public.system_health_logs(created_at DESC);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON public.ads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seller_profiles_updated_at BEFORE UPDATE ON public.seller_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate rank score
CREATE OR REPLACE FUNCTION calculate_rank_score(
  p_is_featured BOOLEAN,
  p_package_weight INTEGER,
  p_freshness_points INTEGER,
  p_admin_boost INTEGER,
  p_is_verified_seller BOOLEAN
) RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    CASE WHEN p_is_featured THEN 50 ELSE 0 END +
    (p_package_weight * 10) +
    p_freshness_points +
    p_admin_boost +
    CASE WHEN p_is_verified_seller THEN 5 ELSE 0 END
  );
END;
$$ LANGUAGE plpgsql;

-- Auto-log ad status changes
CREATE OR REPLACE FUNCTION log_ad_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.ad_status_history (ad_id, from_status, to_status, notes)
    VALUES (NEW.id, OLD.status, NEW.status, 'Auto-logged by trigger');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_ad_status_change
AFTER UPDATE OF status ON public.ads
FOR EACH ROW EXECUTE FUNCTION log_ad_status_change();

-- Function to handle new user signup (populate users table from auth)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- USERS policies
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_select_staff" ON public.users FOR SELECT USING (get_user_role() IN ('admin', 'super_admin', 'moderator'));
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "users_update_admin" ON public.users FOR UPDATE USING (get_user_role() IN ('admin', 'super_admin'));

-- SELLER PROFILES policies
CREATE POLICY "seller_profiles_select_own" ON public.seller_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "seller_profiles_select_public" ON public.seller_profiles FOR SELECT USING (true);
CREATE POLICY "seller_profiles_insert_own" ON public.seller_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "seller_profiles_update_own" ON public.seller_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "seller_profiles_admin" ON public.seller_profiles FOR ALL USING (get_user_role() IN ('admin', 'super_admin'));

-- PACKAGES policies (public read, admin write)
CREATE POLICY "packages_select_all" ON public.packages FOR SELECT USING (true);
CREATE POLICY "packages_write_super_admin" ON public.packages FOR ALL USING (get_user_role() = 'super_admin');

-- CATEGORIES policies
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_write_super_admin" ON public.categories FOR ALL USING (get_user_role() = 'super_admin');

-- CITIES policies
CREATE POLICY "cities_select_all" ON public.cities FOR SELECT USING (true);
CREATE POLICY "cities_write_super_admin" ON public.cities FOR ALL USING (get_user_role() = 'super_admin');

-- ADS policies
-- Public: only see published, not expired, not deleted ads
CREATE POLICY "ads_select_public" ON public.ads
  FOR SELECT USING (
    status = 'published'
    AND (expire_at IS NULL OR expire_at > NOW())
    AND is_deleted = false
  );

-- Owners can see their own ads in any status
CREATE POLICY "ads_select_own" ON public.ads
  FOR SELECT USING (user_id = auth.uid() AND is_deleted = false);

-- Staff can see all ads
CREATE POLICY "ads_select_staff" ON public.ads
  FOR SELECT USING (get_user_role() IN ('moderator', 'admin', 'super_admin'));

-- Clients can create ads
CREATE POLICY "ads_insert_client" ON public.ads
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Owners can update their own draft ads
CREATE POLICY "ads_update_own_draft" ON public.ads
  FOR UPDATE
  USING (user_id = auth.uid() AND status IN ('draft', 'submitted'))
  WITH CHECK (user_id = auth.uid() AND status IN ('draft', 'submitted'));

CREATE POLICY "ads_update_own_payment_submission" ON public.ads
  FOR UPDATE
  USING (user_id = auth.uid() AND status = 'payment_pending')
  WITH CHECK (user_id = auth.uid() AND status = 'payment_submitted');

-- Moderators can update status (to under_review, payment_pending)
CREATE POLICY "ads_update_moderator" ON public.ads
  FOR UPDATE
  USING (
    get_user_role() IN ('moderator', 'admin', 'super_admin')
    AND status IN ('submitted', 'under_review')
  )
  WITH CHECK (
    get_user_role() IN ('moderator', 'admin', 'super_admin')
    AND status IN ('under_review', 'payment_pending', 'archived')
  );

-- Soft delete (admin only)
CREATE POLICY "ads_delete_admin" ON public.ads
  FOR UPDATE USING (get_user_role() IN ('admin', 'super_admin'));

-- AD_MEDIA policies
CREATE POLICY "ad_media_select_public" ON public.ad_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ads
      WHERE ads.id = ad_media.ad_id
        AND ads.status = 'published'
        AND (ads.expire_at IS NULL OR ads.expire_at > NOW())
        AND ads.is_deleted = false
    )
  );
CREATE POLICY "ad_media_select_own" ON public.ad_media
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.ads WHERE ads.id = ad_media.ad_id AND ads.user_id = auth.uid())
  );
CREATE POLICY "ad_media_select_staff" ON public.ad_media
  FOR SELECT USING (get_user_role() IN ('moderator', 'admin', 'super_admin'));
CREATE POLICY "ad_media_insert_own" ON public.ad_media
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.ads WHERE ads.id = ad_media.ad_id AND ads.user_id = auth.uid())
  );
CREATE POLICY "ad_media_delete_own" ON public.ad_media
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.ads WHERE ads.id = ad_media.ad_id AND ads.user_id = auth.uid())
  );
CREATE POLICY "ad_media_admin" ON public.ad_media
  FOR ALL USING (get_user_role() IN ('admin', 'super_admin'));

-- PAYMENTS policies
CREATE POLICY "payments_select_own" ON public.payments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "payments_select_staff" ON public.payments FOR SELECT USING (get_user_role() IN ('admin', 'super_admin'));
CREATE POLICY "payments_insert_own" ON public.payments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "payments_update_own" ON public.payments
  FOR UPDATE
  USING (user_id = auth.uid() AND status IN ('pending', 'rejected'))
  WITH CHECK (user_id = auth.uid() AND status = 'submitted');
CREATE POLICY "payments_update_admin" ON public.payments
  FOR UPDATE
  USING (get_user_role() IN ('admin', 'super_admin'))
  WITH CHECK (get_user_role() IN ('admin', 'super_admin'));

-- NOTIFICATIONS policies
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_insert_system" ON public.notifications FOR INSERT WITH CHECK (true); -- service role only in practice
CREATE POLICY "notifications_admin" ON public.notifications FOR ALL USING (get_user_role() IN ('admin', 'super_admin'));

-- AUDIT_LOGS policies (admin read-only)
CREATE POLICY "audit_logs_select_admin" ON public.audit_logs FOR SELECT USING (get_user_role() IN ('admin', 'super_admin'));
CREATE POLICY "audit_logs_insert_all" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- AD_STATUS_HISTORY policies
CREATE POLICY "status_history_select_own" ON public.ad_status_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.ads WHERE ads.id = ad_status_history.ad_id AND ads.user_id = auth.uid())
  );
CREATE POLICY "status_history_select_staff" ON public.ad_status_history
  FOR SELECT USING (get_user_role() IN ('moderator', 'admin', 'super_admin'));
CREATE POLICY "status_history_insert_actor" ON public.ad_status_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.ads
      WHERE ads.id = ad_status_history.ad_id
        AND (
          ads.user_id = auth.uid()
          OR get_user_role() IN ('moderator', 'admin', 'super_admin')
        )
    )
  );

-- LEARNING_QUESTIONS policies
CREATE POLICY "learning_questions_select_all" ON public.learning_questions FOR SELECT USING (is_active = true);
CREATE POLICY "learning_questions_admin" ON public.learning_questions FOR ALL USING (get_user_role() = 'super_admin');

-- SYSTEM_HEALTH_LOGS policies
CREATE POLICY "system_health_select_admin" ON public.system_health_logs FOR SELECT USING (get_user_role() IN ('admin', 'super_admin'));
CREATE POLICY "system_health_insert_all" ON public.system_health_logs FOR INSERT WITH CHECK (true);

-- ============================================================
-- VIEWS (for convenient querying)
-- ============================================================

-- Public ads with joined data
CREATE OR REPLACE VIEW public.v_public_ads AS
SELECT
  a.id, a.slug, a.title, a.description,
  a.contact_email, a.contact_phone, a.website_url,
  a.price, a.is_featured, a.rank_score,
  a.view_count, a.click_count,
  a.publish_at, a.expire_at, a.created_at,
  u.full_name AS seller_name, u.is_verified_seller,
  p.name AS package_name, p.tier AS package_tier,
  c.name AS category_name, c.slug AS category_slug,
  ci.name AS city_name, ci.slug AS city_slug
FROM public.ads a
JOIN public.users u ON a.user_id = u.id
LEFT JOIN public.packages p ON a.package_id = p.id
LEFT JOIN public.categories c ON a.category_id = c.id
LEFT JOIN public.cities ci ON a.city_id = ci.id
WHERE
  a.status = 'published'
  AND (a.expire_at IS NULL OR a.expire_at > NOW())
  AND a.is_deleted = false;

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.v_public_ads TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
