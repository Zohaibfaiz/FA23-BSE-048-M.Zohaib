// app/page.tsx — Public Landing Page
import { createClient } from '@/lib/supabase/server';
import HeroSection from '@/components/layout/HeroSection';
import PackagesSection from '@/components/layout/PackagesSection';
import FeaturedAdsSection from '@/components/ads/FeaturedAdsSection';
import RecentAdsSection from '@/components/ads/RecentAdsSection';
import LearningWidget from '@/components/layout/LearningWidget';
import StatsSection from '@/components/layout/StatsSection';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import type { Ad, Package, LearningQuestion } from '@/types';

export const revalidate = 60; // ISR — revalidate every minute

export default async function HomePage() {
  const supabase = createClient();

  // Fetch featured published ads
  const { data: featuredAds } = await supabase
    .from('ads')
    .select(`
      *,
      category:categories(id, name, slug, icon),
      city:cities(id, name, slug),
      package:packages(id, name, slug, featured_weight),
      ad_media(id, source_type, normalized_thumbnail_url, is_primary)
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .gt('expire_at', new Date().toISOString())
    .is('deleted_at', null)
    .order('rank_score', { ascending: false })
    .limit(6);

  // Fetch recent published ads
  const { data: recentAds } = await supabase
    .from('ads')
    .select(`
      *,
      category:categories(id, name, slug, icon),
      city:cities(id, name, slug),
      package:packages(id, name, slug, featured_weight),
      ad_media(id, source_type, normalized_thumbnail_url, is_primary)
    `)
    .eq('status', 'published')
    .gt('expire_at', new Date().toISOString())
    .is('deleted_at', null)
    .order('published_at', { ascending: false })
    .limit(8);

  // Fetch packages
  const { data: packages } = await supabase
    .from('packages')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  // Fetch one random learning question
  const { data: questions } = await supabase
    .from('learning_questions')
    .select('*')
    .eq('is_active', true)
    .limit(3);

  // Quick stats
  const { count: totalAds } = await supabase
    .from('ads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  return (
    <>
      <Navbar />
      <main className="min-h-screen mesh-bg">
        {/* Hero */}
        <HeroSection totalAds={totalAds ?? 0} />

        {/* Stats */}
        <StatsSection totalAds={totalAds ?? 0} />

        {/* Featured Ads */}
        {featuredAds && featuredAds.length > 0 && (
          <FeaturedAdsSection ads={featuredAds as unknown as Ad[]} />
        )}

        {/* Packages */}
        {packages && (
          <PackagesSection packages={packages as Package[]} />
        )}

        {/* Recent Ads */}
        {recentAds && recentAds.length > 0 && (
          <RecentAdsSection ads={recentAds as unknown as Ad[]} />
        )}

        {/* Learning Widget */}
        {questions && questions.length > 0 && (
          <LearningWidget questions={questions as LearningQuestion[]} />
        )}
      </main>
      <Footer />
    </>
  );
}
