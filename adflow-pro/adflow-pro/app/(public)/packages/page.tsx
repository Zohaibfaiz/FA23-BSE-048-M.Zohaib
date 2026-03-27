import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PackagesSection from '@/components/layout/PackagesSection';
export const metadata = { title: 'Pricing Packages' };
export default async function PackagesPage() {
  const supabase = createClient();
  const { data: packages } = await supabase.from('packages').select('*').eq('is_active',true).order('sort_order');
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 mesh-bg">
        <div className="pt-12 text-center px-4">
          <h1 className="text-5xl font-display font-bold text-white mb-4">Simple, Transparent <span className="gradient-text">Pricing</span></h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto">No hidden fees. Pick the package that fits your needs.</p>
        </div>
        {packages && <PackagesSection packages={packages as import('@/types').Package[]} />}
      </main>
      <Footer />
    </>
  );
}
