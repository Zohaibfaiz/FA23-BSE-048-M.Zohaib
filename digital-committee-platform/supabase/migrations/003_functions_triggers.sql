-- ============================================================
-- Migration 003: Functions, Triggers & Storage Buckets
-- ============================================================

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- AUTO-ADD CREATOR AS MEMBER #1 WHEN COMMITTEE CREATED
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_committee_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.committee_members (committee_id, user_id, turn_number, status)
  VALUES (NEW.id, NEW.creator_id, 1, 'active');
  
  UPDATE public.profiles
  SET active_committees = active_committees + 1,
      updated_at = NOW()
  WHERE id = NEW.creator_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_committee_created
  AFTER INSERT ON public.committees
  FOR EACH ROW EXECUTE FUNCTION public.handle_committee_created();

-- ============================================================
-- UPDATE REPUTATION SCORE ON PAYMENT
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_reputation_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_total   INTEGER;
  v_paid    INTEGER;
  v_score   NUMERIC;
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    SELECT cm.user_id INTO v_user_id
    FROM public.committee_members cm
    WHERE cm.id = NEW.member_id;

    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'paid')
    INTO v_total, v_paid
    FROM public.payments
    WHERE member_id = NEW.member_id;

    v_score := CASE
      WHEN v_total = 0 THEN 50
      ELSE LEAST(100, 30 + (v_paid::NUMERIC / v_total * 70))
    END;

    UPDATE public.profiles
    SET reputation_score = ROUND(v_score),
        ontime_payment_pct = ROUND((v_paid::NUMERIC / v_total * 100), 2),
        updated_at = NOW()
    WHERE id = v_user_id;

    INSERT INTO public.reputation_logs (user_id, change, reason)
    VALUES (v_user_id, 2, 'On-time payment for committee');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_payment_updated
  AFTER UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_reputation_on_payment();

-- ============================================================
-- UPDATE MEMBER COUNT ON JOIN APPROVAL
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_member_joined()
RETURNS TRIGGER AS $$
DECLARE
  v_creator_id UUID;
BEGIN
  SELECT creator_id INTO v_creator_id FROM public.committees WHERE id = NEW.committee_id;

  IF NEW.user_id != v_creator_id THEN
    UPDATE public.committees
    SET current_members = current_members + 1,
        updated_at = NOW()
    WHERE id = NEW.committee_id;

    UPDATE public.profiles
    SET active_committees = active_committees + 1,
        updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_member_joined
  AFTER INSERT ON public.committee_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_member_joined();

-- ============================================================
-- MARK OVERDUE PAYMENTS (run via cron or manually)
-- ============================================================
CREATE OR REPLACE FUNCTION public.mark_overdue_payments()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.payments
  SET status = 'overdue'
  WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- GET COMMITTEE PROGRESS
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_committee_progress(p_committee_id UUID)
RETURNS TABLE(
  total_payments   INTEGER,
  paid_payments    INTEGER,
  overdue_payments INTEGER,
  completion_pct   NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER                                         AS total_payments,
    COUNT(*) FILTER (WHERE status = 'paid')::INTEGER         AS paid_payments,
    COUNT(*) FILTER (WHERE status = 'overdue')::INTEGER      AS overdue_payments,
    ROUND(COUNT(*) FILTER (WHERE status = 'paid')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) AS completion_pct
  FROM public.payments
  WHERE committee_id = p_committee_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars',        'avatars',        true,  5242880,  ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('payment-proofs', 'payment-proofs', false, 10485760, ARRAY['image/jpeg','image/png','image/webp','application/pdf']),
  ('attachments',    'attachments',    false, 20971520, NULL)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload their own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

CREATE POLICY "Committee members can upload payment proofs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Committee members can view payment proofs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs');

-- Enable Realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.committee_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.committees;
