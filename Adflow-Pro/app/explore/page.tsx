import Link from 'next/link';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, truncate } from '@/lib/utils';

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; city?: string; page?: string };
}) {
  const supabase = await createClient();
  const page = parseInt(searchParams.page || '1');
  const pageSize = 12;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('v_public_ads')
    .select('*', { count: 'exact' })
    .order('rank_score', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (searchParams.q) query = query.or(`title.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`);
  if (searchParams.category) query = query.eq('category_slug', searchParams.category);
  if (searchParams.city) query = query.eq('city_slug', searchParams.city);

  const [{ data: ads, count }, { data: categories }, { data: cities }] = await Promise.all([
    query,
    supabase.from('categories').select('*').eq('is_active', true).order('name'),
    supabase.from('cities').select('*').eq('is_active', true).order('name'),
  ]);

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return (
    <div className="page-shell">
      <header className="shell-header sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="brand-mark text-xl font-semibold tracking-tight text-slate-950">AdFlow Pro</Link>
          <div className="flex items-center gap-3">
            <Link href="/packages"><Button variant="ghost" className="rounded-full">Packages</Button></Link>
            <Link href="/auth/register"><Button className="rounded-full">Launch Listing</Button></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="surface-dark hero-outline rounded-[2.25rem] px-6 py-8 text-white lg:px-10">
          <p className="section-kicker">Public Marketplace</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Discover verified sponsored listings ranked for visibility.</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
            Only published and non-expired ads are listed here. Ranking blends featured placement, package weight, freshness, and seller trust.
          </p>
        </section>

        <Card className="surface-card mt-6 rounded-[2rem] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <CardContent className="p-6">
            <form method="GET" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_auto]">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input name="q" defaultValue={searchParams.q} placeholder="Search listings, sellers, or campaigns" className="h-12 rounded-full border-slate-200 pl-11" />
                </div>
                <select name="category" defaultValue={searchParams.category} className="h-12 rounded-full px-4 text-sm">
                  <option value="">All categories</option>
                  {categories?.map((category: any) => (
                    <option key={category.id} value={category.slug}>{category.name}</option>
                  ))}
                </select>
                <select name="city" defaultValue={searchParams.city} className="h-12 rounded-full px-4 text-sm">
                  <option value="">All cities</option>
                  {cities?.map((city: any) => (
                    <option key={city.id} value={city.slug}>{city.name}</option>
                  ))}
                </select>
                <Button type="submit" className="h-12 rounded-full px-6">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Apply
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <span>{count || 0} published listings found</span>
          <span>Page {page} of {totalPages || 1}</span>
        </div>

        {ads && ads.length > 0 ? (
          <>
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {ads.map((ad: any) => (
                <Link key={ad.id} href={`/ads/${ad.slug}`} className="surface-card group rounded-[1.85rem] p-6 transition hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
                  <div className="flex items-center justify-between">
                    <Badge className="rounded-full border-slate-900 bg-slate-900 text-white hover:bg-slate-900">{ad.package_name}</Badge>
                    {ad.is_featured ? <Badge className="rounded-full border-orange-200 bg-orange-100 text-orange-700 hover:bg-orange-100">Featured</Badge> : null}
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">{ad.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{truncate(ad.description, 130)}</p>
                  <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                    <span>{ad.category_name}</span>
                    <span>{ad.city_name}</span>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm text-slate-500">Rank {Math.round(Number(ad.rank_score ?? 0))}</span>
                    <span className="text-lg font-semibold text-slate-950">{ad.price ? formatCurrency(Number(ad.price)) : 'Contact'}</span>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="mt-8 flex items-center justify-center gap-3">
                {page > 1 ? (
                  <Link href={`/explore?${new URLSearchParams({ ...searchParams, page: String(page - 1) }).toString()}`}>
                    <Button variant="outline" className="rounded-full">Previous</Button>
                  </Link>
                ) : null}
                {page < totalPages ? (
                  <Link href={`/explore?${new URLSearchParams({ ...searchParams, page: String(page + 1) }).toString()}`}>
                    <Button variant="outline" className="rounded-full">Next</Button>
                  </Link>
                ) : null}
              </div>
            ) : null}
          </>
        ) : (
          <Card className="surface-card mt-6 rounded-[2rem] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <CardContent className="p-10 text-center text-slate-600">
              No listings matched the current filters.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
