// app/(public)/cities/page.tsx
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

export const metadata = { title: 'Browse by City' };

export default async function CitiesPage() {
  const supabase = createClient();
  const { data: cities } = await supabase
    .from('cities')
    .select('*')
    .eq('is_active', true)
    .order('name');

  const cityCounts: Record<string, number> = {};
  if (cities) {
    await Promise.all(
      cities.map(async (city) => {
        const { count } = await supabase.from('ads')
          .select('*', { count: 'exact', head: true })
          .eq('city_id', city.id)
          .eq('status', 'published');
        cityCounts[city.id] = count ?? 0;
      })
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 mesh-bg">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
              Browse by <span className="gradient-text-blue">City</span>
            </h1>
            <p className="text-white/40">Find ads in your area</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(cities ?? []).map(city => (
              <Link
                key={city.id}
                href={`/explore?city=${city.slug}`}
                className="glass rounded-2xl p-5 border border-white/8 hover:border-cyan-500/30 transition-all hover:-translate-y-1 group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/20 flex items-center justify-center mb-3 group-hover:bg-cyan-500/30 transition-colors">
                  <MapPin size={20} className="text-cyan-400" />
                </div>
                <h3 className="font-display font-bold text-white text-sm mb-0.5">{city.name}</h3>
                <p className="text-xs text-white/40">{city.province}</p>
                <p className="text-xs text-cyan-400/70 mt-1">{cityCounts[city.id] ?? 0} listings</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
