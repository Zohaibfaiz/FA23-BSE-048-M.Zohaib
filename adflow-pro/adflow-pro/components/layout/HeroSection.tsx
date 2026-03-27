'use client';
// components/layout/HeroSection.tsx
// Full-screen hero with animated background, floating ad cards, CTA
import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, ArrowRight, Sparkles, TrendingUp, Shield } from 'lucide-react';

const FEATURES = [
  { icon: Sparkles, label: 'AI-Powered Ranking' },
  { icon: Shield,   label: 'Strict Moderation' },
  { icon: TrendingUp, label: 'Real-time Analytics' },
];

// Floating mini-card data for visual decoration
const FLOAT_CARDS = [
  { title: 'iPhone 15 Pro',    cat: 'Electronics', price: 'PKR 3.2L', color: '#8B5CF6' },
  { title: 'DHA Phase 6 Villa',cat: 'Real Estate', price: 'PKR 9.5Cr', color: '#06B6D4' },
  { title: 'Honda Civic 2021', cat: 'Vehicles',    price: 'PKR 42L',  color: '#10B981' },
  { title: 'Node.js Dev Job',  cat: 'Jobs',        price: 'PKR 1.5L/mo',color: '#F59E0B' },
];

interface Props { totalAds: number; }

export default function HeroSection({ totalAds }: Props) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute top-3/4 left-1/2 w-72 h-72 bg-blue-600/15 rounded-full blur-[100px]"
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Floating Ad Cards — decorative */}
      {FLOAT_CARDS.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 60 }}
          animate={{
            opacity: [0, 0.7, 0.7, 0],
            y: [60, 0, 0, -60],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: i * 2.5,
            ease: 'easeInOut',
          }}
          className="absolute hidden lg:block glass rounded-xl p-3 shadow-2xl pointer-events-none"
          style={{
            top: `${20 + i * 18}%`,
            right: i % 2 === 0 ? '6%' : undefined,
            left: i % 2 === 1 ? '4%' : undefined,
            borderColor: `${card.color}40`,
            boxShadow: `0 0 30px ${card.color}20`,
            width: '180px',
          }}
        >
          <div className="w-6 h-6 rounded-md mb-1.5" style={{ background: `${card.color}30`, border: `1px solid ${card.color}60` }} />
          <p className="text-xs font-display font-bold text-white/90 leading-tight">{card.title}</p>
          <p className="text-[10px] text-white/40 mt-0.5">{card.cat}</p>
          <p className="text-[11px] font-bold mt-1" style={{ color: card.color }}>{card.price}</p>
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6 text-sm text-violet-300"
        >
          <Sparkles size={14} className="text-violet-400" />
          Pakistan's Premier Ad Marketplace
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-display font-800 mb-6 leading-tight"
        >
          List Smarter.
          <br />
          <span className="gradient-text">Rank Higher.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          AdFlow Pro uses AI-powered ranking, verified payments & strict moderation to deliver your ads to the right audience — every time.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex gap-2 max-w-xl mx-auto mb-8"
        >
          <div className="flex-1 flex items-center gap-3 glass rounded-xl px-4 py-3 border border-white/10">
            <Search size={18} className="text-white/40 shrink-0" />
            <input
              type="text"
              placeholder="Search ads by title, category, city..."
              className="bg-transparent text-white placeholder:text-white/30 text-sm flex-1 outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  window.location.href = `/explore?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`;
                }
              }}
            />
          </div>
          <Link href="/explore" className="btn-primary flex items-center gap-2 whitespace-nowrap">
            Search <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-center gap-4 flex-wrap mb-10"
        >
          {FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-white/50">
              <Icon size={14} className="text-violet-400" />
              {label}
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <Link href="/auth/register" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
            Post Your Ad <ArrowRight size={18} />
          </Link>
          <Link href="/explore" className="btn-ghost text-base px-6 py-3">
            Browse Listings
          </Link>
        </motion.div>

        {/* Live stats */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-sm text-white/30"
        >
          🟢 {totalAds.toLocaleString()} active listings right now
        </motion.p>
      </div>
    </section>
  );
}
