import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
export const metadata = { title: 'Browse Categories' };
export default async function CategoriesPage() {
  const supabase = createClient();
  const { data: cats } = await supabase.from('categories').select('*').eq('is_active',true).order('name');
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16 mesh-bg">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl font-display font-bold text-white mb-2">Browse by Category</h1>
          <p className="text-white/40 mb-10">Find exactly what you're looking for.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cats?.map(cat => (
              <Link key={cat.id} href={`/explore?category=${cat.slug}`}
                className="glass rounded-xl p-5 border border-white/8 hover:border-violet-500/30 transition-all hover:-translate-y-1 group">
                <p className="font-display font-bold text-white group-hover:text-violet-300 transition-colors">{cat.name}</p>
                <p className="text-xs text-white/40 mt-1">{cat.description ?? 'Browse listings'}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
