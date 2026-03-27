'use client';
/**
 * AdFlow Pro — Hero Section
 * 3D animated canvas + floating cards + neon effects
 * Uses Framer Motion for animations (Three.js optionally loaded)
 */
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp, Shield } from 'lucide-react';

const FLOATING_CARDS = [
  { title: 'DHA Karachi Apartment', category: 'Real Estate', price: '₨ 4,999', badge: 'PREMIUM', color: '#a855f7' },
  { title: 'Honda Civic 2022',       category: 'Vehicles',    price: '₨ 2,499', badge: 'STANDARD', color: '#3b82f6' },
  { title: 'iPhone 15 Pro Max',      category: 'Electronics', price: '₨ 4,999', badge: 'FEATURED', color: '#06b6d4' },
];

const STATS = [
  { label: 'Active Ads',   value: '12,500+', icon: TrendingUp },
  { label: 'Verified Sellers', value: '3,200+', icon: Shield },
  { label: 'Cities Covered',  value: '50+',    icon: Sparkles },
];

function FloatingAdCard({ card, index }: { card: typeof FLOATING_CARDS[0]; index: number }) {
  return (
    <motion.div
      className="glass-card p-4 w-56 absolute"
      style={{
        right: index === 0 ? '5%' : index === 1 ? '12%' : '2%',
        top: index === 0 ? '15%' : index === 1 ? '45%' : '70%',
      }}
      initial={{ opacity: 0, x: 100 }}
      animate={{
        opacity: 1, x: 0,
        y: [0, -12, 0],
        rotate: [0, index % 2 === 0 ? 2 : -2, 0],
      }}
      transition={{
        opacity: { delay: 0.8 + index * 0.2, duration: 0.6 },
        x: { delay: 0.8 + index * 0.2, duration: 0.6 },
        y: { duration: 3 + index * 0.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 },
        rotate: { duration: 4 + index, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <div className="w-full h-20 rounded-lg mb-3 shimmer" style={{ background: `${card.color}22` }}>
        <div className="w-full h-full rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${card.color}33, transparent)` }}>
          <span className="text-2xl">🏷️</span>
        </div>
      </div>
      <span className="inline-block text-xs font-bold px-2 py-0.5 rounded mb-1" style={{ background: `${card.color}33`, color: card.color }}>
        {card.badge}
      </span>
      <p className="text-xs font-semibold text-white truncate">{card.title}</p>
      <p className="text-xs text-[var(--text-muted)]">{card.category}</p>
      <p className="text-xs font-bold mt-1" style={{ color: card.color }}>{card.price}</p>
    </motion.div>
  );
}

export default function HeroSection() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [typedText, setTypedText] = useState('');
  const fullText = "Pakistan's Premium Ad Marketplace";
  const indexRef = useRef(0);

  // Typewriter effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (indexRef.current < fullText.length) {
        setTypedText(fullText.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Mouse parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left - rect.width / 2) / rect.width);
    mouseY.set((e.clientY - rect.top - rect.height / 2) / rect.height);
  };

  const bgX = useTransform(mouseX, [-0.5, 0.5], ['-10px', '10px']);
  const bgY = useTransform(mouseY, [-0.5, 0.5], ['-10px', '10px']);

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Animated background blobs */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ x: bgX, y: bgY }}
      >
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-20 right-32 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
      </motion.div>

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 w-full">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span className="text-[var(--text-secondary)]">New:</span>
              <span className="text-brand-400">Premium 3D Ad Cards with Analytics</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6"
            >
              Reach More{' '}
              <span className="gradient-text">Customers</span>{' '}
              <br />With{' '}
              <span className="relative">
                Smart Ads
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl leading-relaxed"
            >
              {typedText}<span className="animate-pulse">|</span>
              <br />
              <span className="text-base">Post sponsored listings with strict moderation, payment verification, and automated expiry management.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <Link href="/register" className="btn-neon flex items-center gap-2 text-base px-6 py-3">
                Post Your Ad <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/ads" className="px-6 py-3 rounded-xl border border-white/10 hover:border-brand-500/50 text-[var(--text-secondary)] hover:text-white transition-all flex items-center gap-2 text-base">
                Browse Ads
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex gap-8"
            >
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  <p className="text-2xl font-display font-bold gradient-text">{stat.value}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Floating cards */}
          <div className="hidden lg:block relative h-[600px]">
            {FLOATING_CARDS.map((card, i) => (
              <FloatingAdCard key={i} card={card} index={i} />
            ))}
            {/* Central glow orb */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3), transparent)' }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--bg-base))' }} />
    </section>
  );
}
