// app/(dashboard)/moderator/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ModeratorDashboardClient from './ModeratorDashboardClient';

export const metadata = { title: 'Moderator Dashboard' };

export default async function ModeratorPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (!['moderator', 'admin', 'super_admin'].includes(profile?.role ?? '')) redirect('/client');

  // Ads pending moderation
  const { data: reviewQueue } = await supabase
    .from('ads')
    .select(`*, category:categories(name), city:cities(name), package:packages(name,price), user:users(full_name, email), ad_media(*)`)
    .eq('status', 'submitted')
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  // Under review (already grabbed by moderator)
  const { data: underReview } = await supabase
    .from('ads')
    .select(`*, category:categories(name), city:cities(name), package:packages(name,price), user:users(full_name, email)`)
    .eq('status', 'under_review')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  // Stats
  const { count: approvedToday } = await supabase
    .from('ad_status_history')
    .select('*', { count: 'exact', head: true })
    .eq('to_status', 'payment_pending')
    .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString());

  const { count: rejectedToday } = await supabase
    .from('ad_status_history')
    .select('*', { count: 'exact', head: true })
    .eq('to_status', 'archived')
    .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString());

  return (
    <ModeratorDashboardClient
      moderator={profile}
      reviewQueue={reviewQueue ?? []}
      underReview={underReview ?? []}
      approvedToday={approvedToday ?? 0}
      rejectedToday={rejectedToday ?? 0}
    />
  );
}
