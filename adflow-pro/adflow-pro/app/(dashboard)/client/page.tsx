// app/(dashboard)/client/page.tsx — Client Dashboard
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ClientDashboardClient from './ClientDashboardClient';

export const metadata = { title: 'My Dashboard' };

export default async function ClientDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Fetch user's ads with full details
  const { data: ads } = await supabase
    .from('ads')
    .select(`
      *,
      category:categories(name, slug),
      city:cities(name),
      package:packages(name, slug, price, duration_days),
      ad_media(source_type, normalized_thumbnail_url, is_primary),
      payments(id, status, transaction_ref, amount, created_at)
    `)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  // Fetch packages for create form
  const { data: packages } = await supabase.from('packages').select('*').eq('is_active', true).order('sort_order');
  const { data: categories } = await supabase.from('categories').select('*').eq('is_active', true).order('name');
  const { data: cities } = await supabase.from('cities').select('*').eq('is_active', true).order('name');
  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();

  // Notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <ClientDashboardClient
      user={profile}
      ads={ads ?? []}
      packages={packages ?? []}
      categories={categories ?? []}
      cities={cities ?? []}
      notifications={notifications ?? []}
    />
  );
}
