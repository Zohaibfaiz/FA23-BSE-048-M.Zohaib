'use client';
// app/(public)/explore/ExploreClient.tsx
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import AdCard from '@/components/ads/AdCard';
import type { Ad, Category, City } from '@/types';
import { useCallback } from 'react';

interface Props {
  ads: Ad[]; total: number; page: number; limit: number;
  categories: Category[]; cities: City[];
  filters: { q?: string; category?: string; city?: string; sort?: string };
}

const SORT_OPTIONS = [
  { value: 'rank',       label: 'Top Ranked' },
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
];

export default function ExploreClient({ ads, total, page, limit, categories, cities, filters }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / limit);

  const updateParam = useCallback((key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  function goPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <main className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 pt-8">
          <h1 className="text-3xl font-display font-bold mb-2">
            Explore <span className="gradient-text">Listings</span>
          </h1>
          <p className="text-white/40 text-sm">{total.toLocaleString()} ads found</p>
        </motion.div>

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1 flex items-center gap-3 glass rounded-xl px-4 py-2.5 border border-white/10">
            <Search size={16} className="text-white/40 shrink-0" />
            <input
              type="text"
              defaultValue={filters.q}
              placeholder="Search ads..."
              className="bg-transparent text-white placeholder:text-white/30 text-sm flex-1 outline-none"
              onKeyDown={e => {
                if (e.key === 'Enter') updateParam('q', (e.target as HTMLInputElement).value || undefined);
              }}
            />
            {filters.q && (
              <button onClick={() => updateParam('q', undefined)} className="text-white/40 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>
          <select
            value={filters.sort ?? 'rank'}
            onChange={e => updateParam('sort', e.target.value)}
            className="glass border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white bg-transparent outline-none"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-[#111827]">{o.label}</option>)}
          </select>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          {/* Sidebar Filters */}
          <aside className="space-y-4">
            {/* Category Filter */}
            <div className="glass rounded-xl p-4 border border-white/8">
              <h3 className="font-display font-bold text-sm text-white mb-3">Category</h3>
              <div className="space-y-1">
                <button
                  onClick={() => updateParam('category', undefined)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${!filters.category ? 'bg-violet-500/20 text-violet-300' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => updateParam('category', cat.slug)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${filters.category === cat.slug ? 'bg-violet-500/20 text-violet-300' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* City Filter */}
            <div className="glass rounded-xl p-4 border border-white/8">
              <h3 className="font-display font-bold text-sm text-white mb-3">City</h3>
              <div className="space-y-1">
                <button
                  onClick={() => updateParam('city', undefined)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${!filters.city ? 'bg-cyan-500/20 text-cyan-300' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                >
                  All Cities
                </button>
                {cities.map(city => (
                  <button
                    key={city.id}
                    onClick={() => updateParam('city', city.slug)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${filters.city === city.slug ? 'bg-cyan-500/20 text-cyan-300' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Ad Grid */}
          <div>
            {ads.length === 0 ? (
              <div className="glass rounded-2xl p-16 text-center border border-white/8">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="font-display font-bold text-white text-xl mb-2">No ads found</h3>
                <p className="text-white/40">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {ads.map((ad, i) => <AdCard key={ad.id} ad={ad as Ad} index={i} showRank={filters.sort === 'rank'} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => goPage(page - 1)}
                      disabled={page === 1}
                      className="btn-ghost px-3 py-2 disabled:opacity-30 flex items-center gap-1 text-sm"
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => Math.abs(p - page) <= 2)
                      .map(p => (
                        <button
                          key={p}
                          onClick={() => goPage(p)}
                          className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${p === page ? 'bg-violet-600 text-white' : 'glass text-white/50 hover:text-white border border-white/10'}`}
                        >
                          {p}
                        </button>
                      ))
                    }
                    <button
                      onClick={() => goPage(page + 1)}
                      disabled={page === totalPages}
                      className="btn-ghost px-3 py-2 disabled:opacity-30 flex items-center gap-1 text-sm"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
