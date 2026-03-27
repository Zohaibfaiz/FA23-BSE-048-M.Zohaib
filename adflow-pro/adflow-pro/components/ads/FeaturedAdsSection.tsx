'use client';
// components/ads/FeaturedAdsSection.tsx
import { motion } from 'framer-motion';
import AdCard from './AdCard';
import Link from 'next/link';
import type { Ad } from '@/types';

export default function FeaturedAdsSection({ ads }: { ads: Ad[] }) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2 block">⭐ Featured</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Top <span className="gradient-text">Sponsored Listings</span>
            </h2>
          </div>
          <Link href="/explore?sort=rank" className="text-sm text-white/40 hover:text-violet-400 transition-colors">
            View all →
          </Link>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ads.map((ad, i) => <AdCard key={ad.id} ad={ad} index={i} showRank />)}
        </div>
      </div>
    </section>
  );
}
