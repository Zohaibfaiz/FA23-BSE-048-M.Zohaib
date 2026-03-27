// app/api/ads/route.ts — GET all published ads (public API)
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q        = searchParams.get('q');
  const category = searchParams.get('category');
  const city     = searchParams.get('city');
  const sort     = searchParams.get('sort') ?? 'rank';
  const page     = parseInt(searchParams.get('page') ?? '1');
  const limit    = Math.min(parseInt(searchParams.get('limit') ?? '12'), 50);
  const offset   = (page - 1) * limit;

  const supabase = createClient();

  let query = supabase
    .from('ads')
    .select(`
      id, slug, title, price, price_label, is_featured, rank_score, published_at, expire_at,
      category:categories(id, name, slug),
      city:cities(id, name, slug),
      package:packages(id, name, slug, featured_weight),
      ad_media(id, source_type, normalized_thumbnail_url, is_primary)
    `, { count: 'exact' })
    .eq('status', 'published')
    .gt('expire_at', new Date().toISOString())
    .is('deleted_at', null);

  if (q) query = query.ilike('title', `%${q}%`);
  if (category) query = query.eq('categories.slug', category);
  if (city) query = query.eq('cities.slug', city);

  switch (sort) {
    case 'newest':     query = query.order('published_at', { ascending: false }); break;
    case 'price_asc':  query = query.order('price', { ascending: true }); break;
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    default:           query = query.order('rank_score', { ascending: false }); break;
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({
    success: true,
    data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}
