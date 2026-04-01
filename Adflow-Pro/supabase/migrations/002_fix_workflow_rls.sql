-- Fix workflow updates blocked by RLS when rows change status.
-- The previous policies only used USING clauses, so Postgres also applied them
-- to the updated row state, which blocked legitimate transitions like:
-- draft -> submitted, submitted -> under_review, pending -> submitted.

DROP POLICY IF EXISTS "ads_update_own_draft" ON public.ads;
CREATE POLICY "ads_update_own_draft" ON public.ads
  FOR UPDATE
  USING (user_id = auth.uid() AND status IN ('draft', 'submitted'))
  WITH CHECK (user_id = auth.uid() AND status IN ('draft', 'submitted'));

DROP POLICY IF EXISTS "ads_update_own_payment_submission" ON public.ads;
CREATE POLICY "ads_update_own_payment_submission" ON public.ads
  FOR UPDATE
  USING (user_id = auth.uid() AND status = 'payment_pending')
  WITH CHECK (user_id = auth.uid() AND status = 'payment_submitted');

DROP POLICY IF EXISTS "ads_update_moderator" ON public.ads;
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

DROP POLICY IF EXISTS "payments_update_own" ON public.payments;
CREATE POLICY "payments_update_own" ON public.payments
  FOR UPDATE
  USING (user_id = auth.uid() AND status IN ('pending', 'rejected'))
  WITH CHECK (user_id = auth.uid() AND status = 'submitted');

DROP POLICY IF EXISTS "payments_update_admin" ON public.payments;
CREATE POLICY "payments_update_admin" ON public.payments
  FOR UPDATE
  USING (get_user_role() IN ('admin', 'super_admin'))
  WITH CHECK (get_user_role() IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS "status_history_insert_actor" ON public.ad_status_history;
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
