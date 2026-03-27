// app/(dashboard)/admin/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminDashboardClient from './AdminDashboardClient';

export const metadata = { title: 'Admin Dashboard' };

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (!['admin', 'super_admin'].includes(profile?.role ?? '')) redirect('/client');

  const { data: paymentQueue } = await supabase
    .from('payments')
    .select(`*, ad:ads(id,title,slug,status,user_id,package:packages(name,price)), user:users(full_name,email)`)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  const { data: publishQueue } = await supabase
    .from('ads')
    .select(`*, category:categories(name), city:cities(name), package:packages(name,duration_days), user:users(full_name)`)
    .eq('status', 'payment_verified')
    .is('deleted_at', null)
    .order('updated_at', { ascending: true });

  const { count: totalAds }   = await supabase.from('ads').select('*', { count: 'exact', head: true }).is('deleted_at', null);
  const { count: activeAds }  = await supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'published').gt('expire_at', new Date().toISOString());
  const { count: pendingAds } = await supabase.from('ads').select('*', { count: 'exact', head: true }).in('status', ['submitted','under_review','payment_submitted']);
  const { count: expiredAds } = await supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'expired');

  const { data: revenueData } = await supabase.from('payments').select('amount,created_at,package:packages(name)').eq('status', 'verified');
  const totalRevenue = revenueData?.reduce((s, p) => s + (p.amount ?? 0), 0) ?? 0;
  const thisMonth = new Date(); thisMonth.setDate(1);
  const monthlyRevenue = revenueData?.filter(p => new Date(p.created_at) >= thisMonth).reduce((s, p) => s + (p.amount ?? 0), 0) ?? 0;

  const { data: byCategory } = await supabase.from('ads').select('category:categories(name)').eq('status', 'published');
  const catMap: Record<string, number> = {};
  byCategory?.forEach(a => { const n = (a.category as {name?:string})?.name ?? 'Other'; catMap[n] = (catMap[n] ?? 0) + 1; });

  const pkgMap: Record<string, number> = {};
  revenueData?.forEach(p => { const n = (p.package as {name?:string})?.name ?? 'Other'; pkgMap[n] = (pkgMap[n] ?? 0) + (p.amount ?? 0); });

  return (
    <AdminDashboardClient
      admin={profile}
      paymentQueue={paymentQueue ?? []}
      publishQueue={publishQueue ?? []}
      analytics={{ totalAds: totalAds??0, activeAds: activeAds??0, pendingAds: pendingAds??0, expiredAds: expiredAds??0, totalRevenue, monthlyRevenue, approvalRate: 75, rejectionRate: 25 }}
      categoryData={Object.entries(catMap).map(([name, count]) => ({ name, count }))}
      revenueByPackage={Object.entries(pkgMap).map(([name, total]) => ({ name, total }))}
    />
  );
}
