// app/(public)/explore/page.tsx — Explore Ads with filters + pagination
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ExploreClient from './ExploreClient';
import type { Category, City } from '@/types';

export const metadata = { title: 'Explore Ads' };

interface SearchParams {
  q?: string; category?: string; city?: string;
  sort?: string; page?: string;
}

export default async function ExplorePage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient();
  const page = parseInt(searchParams.page ?? '1');
  const limit = 12;
  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from('ads')
    .select(`
      *,
      category:categories(id, name, slug, icon),
      city:cities(id, name, slug),
      package:packages(id, name, slug, featured_weight),
      ad_media(id, source_type, normalized_thumbnail_url, is_primary)
    `, { count: 'exact' })
    .eq('status', 'published')
    .gt('expire_at', new Date().toISOString())
    .is('deleted_at', null);

  // Filters
  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`);
  }
  if (searchParams.category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', searchParams.category).single();
    if (cat) query = query.eq('category_id', cat.id);
  }
  if (searchParams.city) {
    const { data: ct } = await supabase.from('cities').select('id').eq('slug', searchParams.city).single();
    if (ct) query = query.eq('city_id', ct.id);
  }

  // Sort
  switch (searchParams.sort) {
    case 'newest':     query = query.order('published_at', { ascending: false }); break;
    case 'price_asc':  query = query.order('price', { ascending: true });         break;
    case 'price_desc': query = query.order('price', { ascending: false });        break;
    default:           query = query.order('rank_score', { ascending: false });   break;
  }

  const { data: ads, count } = await query.range(offset, offset + limit - 1);

  // Filter data for sidebar
  const { data: categories } = await supabase.from('categories').select('*').eq('is_active', true).order('name');
  const { data: cities }     = await supabase.from('cities').select('*').eq('is_active', true).order('name');

  return (
    <>
      <Navbar />
      <ExploreClient
        ads={ads ?? []}
        total={count ?? 0}
        page={page}
        limit={limit}
        categories={(categories ?? []) as Category[]}
        cities={(cities ?? []) as City[]}
        filters={{
          q: searchParams.q,
          category: searchParams.category,
          city: searchParams.city,
          sort: searchParams.sort ?? 'rank',
        }}
      />
      <Footer />
    </>
  );
}
