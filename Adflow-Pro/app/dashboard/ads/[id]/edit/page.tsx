import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import EditAdForm from './edit-ad-form';

export default async function EditAdPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const supabase = await createClient();

  const { data: ad } = await supabase
    .from('ads')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!ad) {
    redirect('/dashboard');
  }

  // Only the ad owner can edit, and only while it's still a draft.
  if (ad.user_id !== user.id) {
    redirect('/dashboard');
  }

  if (ad.status !== 'draft') {
    redirect(`/dashboard/ads/${params.id}`);
  }

  const [{ data: media }, { data: categories }, { data: cities }, { data: packages }] =
    await Promise.all([
      supabase.from('ad_media').select('original_url').eq('ad_id', params.id).order('sort_order'),
      supabase.from('categories').select('*').eq('is_active', true).order('name'),
      supabase.from('cities').select('*').eq('is_active', true).order('name'),
      supabase.from('packages').select('*').eq('is_active', true).order('price'),
    ]);

  return (
    <EditAdForm
      adId={params.id}
      initialAd={ad}
      initialMediaUrls={(media || []).map((m: any) => m.original_url)}
      categories={categories || []}
      cities={cities || []}
      packages={packages || []}
    />
  );
}

