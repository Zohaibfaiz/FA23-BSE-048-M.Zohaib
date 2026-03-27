// app/(public)/ads/[slug]/page.tsx — Ad Detail Page
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdDetailClient from './AdDetailClient';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: ad } = await supabase.from('ads').select('title, description').eq('slug', params.slug).single();
  if (!ad) return { title: 'Ad Not Found' };
  return { title: ad.title, description: ad.description?.slice(0, 160) };
}

export default async function AdDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: ad } = await supabase
    .from('ads')
    .select(`
      *,
      category:categories(*),
      city:cities(*),
      package:packages(*),
      user:users(id, full_name, is_verified, created_at),
      ad_media(*)
    `)
    .eq('slug', params.slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single();

  if (!ad) notFound();

  // Fetch related ads
  const { data: relatedAds } = await supabase
    .from('ads')
    .select(`*, category:categories(name,slug), city:cities(name,slug), package:packages(slug,featured_weight), ad_media(source_type,normalized_thumbnail_url,is_primary)`)
    .eq('status', 'published')
    .eq('category_id', ad.category_id)
    .neq('id', ad.id)
    .gt('expire_at', new Date().toISOString())
    .is('deleted_at', null)
    .order('rank_score', { ascending: false })
    .limit(4);

  return (
    <>
      <Navbar />
      <AdDetailClient ad={ad} relatedAds={relatedAds ?? []} />
      <Footer />
    </>
  );
}
