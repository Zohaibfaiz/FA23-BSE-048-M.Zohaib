'use client';
// components/ads/RecentAdsSection.tsx
import { motion } from 'framer-motion';
import AdCard from './AdCard';
import Link from 'next/link';
import type { Ad } from '@/types';

export default function RecentAdsSection({ ads }: { ads: Ad[] }) {
  return (
    <section className="py-20 px-4 bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold mb-2 block">🕐 Latest</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Recently <span className="gradient-text-blue">Posted</span>
            </h2>
          </div>
          <Link href="/explore" className="text-sm text-white/40 hover:text-cyan-400 transition-colors">
            Browse all →
          </Link>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ads.map((ad, i) => <AdCard key={ad.id} ad={ad} index={i} />)}
        </div>
      </div>
    </section>
  );
}
