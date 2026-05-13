-- ============================================================
-- Migration 002: Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_requests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions    ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================
CREATE POLICY "Profiles are viewable by all authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ============================================================
-- COMMITTEES POLICIES
-- ============================================================
CREATE POLICY "Public committees viewable by all"
  ON public.committees FOR SELECT TO authenticated USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "Members can view their committees"
  ON public.committees FOR SELECT TO authenticated
  USING (id IN (SELECT committee_id FROM public.committee_members WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can create committees"
  ON public.committees FOR INSERT TO authenticated WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update their committees"
  ON public.committees FOR UPDATE TO authenticated USING (creator_id = auth.uid());

CREATE POLICY "Creators can delete their committees"
  ON public.committees FOR DELETE TO authenticated USING (creator_id = auth.uid());

-- ============================================================
-- COMMITTEE MEMBERS POLICIES
-- ============================================================
CREATE POLICY "Members are viewable by committee members"
  ON public.committee_members FOR SELECT TO authenticated
  USING (committee_id IN (SELECT committee_id FROM public.committee_members WHERE user_id = auth.uid())
      OR committee_id IN (SELECT id FROM public.committees WHERE creator_id = auth.uid()));

CREATE POLICY "Authenticated users can join committees"
  ON public.committee_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Creators can manage members"
  ON public.committee_members FOR UPDATE TO authenticated
  USING (committee_id IN (SELECT id FROM public.committees WHERE creator_id = auth.uid()));

CREATE POLICY "Creators can remove members"
  ON public.committee_members FOR DELETE TO authenticated
  USING (committee_id IN (SELECT id FROM public.committees WHERE creator_id = auth.uid()) OR user_id = auth.uid());

-- ============================================================
-- JOIN REQUESTS POLICIES
-- ============================================================
CREATE POLICY "Users can view their own join requests"
  ON public.join_requests FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Committee creators can view join requests"
  ON public.join_requests FOR SELECT TO authenticated
  USING (committee_id IN (SELECT id FROM public.committees WHERE creator_id = auth.uid()));

CREATE POLICY "Authenticated users can create join requests"
  ON public.join_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Creators can update join requests"
  ON public.join_requests FOR UPDATE TO authenticated
  USING (committee_id IN (SELECT id FROM public.committees WHERE creator_id = auth.uid()));

-- ============================================================
-- PAYMENTS POLICIES
-- ============================================================
CREATE POLICY "Members can view their committee payments"
  ON public.payments FOR SELECT TO authenticated
  USING (committee_id IN (SELECT committee_id FROM public.committee_members WHERE user_id = auth.uid())
      OR committee_id IN (SELECT id FROM public.committees WHERE creator_id = auth.uid()));

CREATE POLICY "Members can update their own payments"
  ON public.payments FOR UPDATE TO authenticated
  USING (member_id IN (SELECT id FROM public.committee_members WHERE user_id = auth.uid()));

CREATE POLICY "Creators can manage all payments in their committees"
  ON public.payments FOR ALL TO authenticated
  USING (committee_id IN (SELECT id FROM public.committees WHERE creator_id = auth.uid()));

CREATE POLICY "System can insert payments"
  ON public.payments FOR INSERT TO authenticated
  WITH CHECK (committee_id IN (SELECT id FROM public.committees WHERE creator_id = auth.uid()));

-- ============================================================
-- NOTIFICATIONS POLICIES
-- ============================================================
CREATE POLICY "Users can only see their own notifications"
  ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- REVIEWS POLICIES
-- ============================================================
CREATE POLICY "Reviews are viewable by all authenticated users"
  ON public.reviews FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can write reviews for others"
  ON public.reviews FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid());

-- ============================================================
-- REPUTATION LOGS POLICIES
-- ============================================================
CREATE POLICY "Users can view their own reputation logs"
  ON public.reputation_logs FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- ACTIVITY LOGS POLICIES (admin only view)
-- ============================================================
CREATE POLICY "Admins can view all activity logs"
  ON public.activity_logs FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "System can insert activity logs"
  ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- TRANSACTIONS POLICIES
-- ============================================================
CREATE POLICY "Members can view committee transactions"
  ON public.transactions FOR SELECT TO authenticated
  USING (committee_id IN (SELECT committee_id FROM public.committee_members WHERE user_id = auth.uid()));
