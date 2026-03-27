'use client';
// components/layout/PackagesSection.tsx
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Zap, Star, Crown } from 'lucide-react';
import type { Package } from '@/types';

interface Props { packages: Package[]; }

const PKG_STYLES = {
  basic:    { icon: Zap,   color: '#64748B', glow: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.3)' },
  standard: { icon: Star,  color: '#3B82F6', glow: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.4)'  },
  premium:  { icon: Crown, color: '#8B5CF6', glow: 'rgba(139,92,246,0.2)',   border: 'rgba(139,92,246,0.5)'  },
};

export default function PackagesSection({ packages }: Props) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-3 block">Pricing</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Choose Your <span className="gradient-text">Package</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Flexible plans designed for every business size. All plans include moderation & verification.
          </p>
        </motion.div>

        {/* Package Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg, i) => {
            const style = PKG_STYLES[pkg.slug as keyof typeof PKG_STYLES] ?? PKG_STYLES.basic;
            const Icon = style.icon;
            const isPremium = pkg.slug === 'premium';

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, type: 'spring', stiffness: 150 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative rounded-2xl p-6 flex flex-col"
                style={{
                  background: isPremium
                    ? 'linear-gradient(135deg, #13102A 0%, #1a1040 100%)'
                    : 'var(--clr-card)',
                  border: `1px solid ${style.border}`,
                  boxShadow: `0 0 40px ${style.glow}`,
                }}
              >
                {/* Popular badge */}
                {isPremium && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Icon & Name */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${style.color}20`, border: `1px solid ${style.color}40` }}>
                    <Icon size={20} style={{ color: style.color }} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">{pkg.name}</h3>
                    <p className="text-xs text-white/40">{pkg.duration_days} days duration</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-display font-800 text-white">
                    PKR {pkg.price.toLocaleString()}
                  </span>
                  <span className="text-white/40 text-sm ml-1">/ listing</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {(pkg.features as string[]).map((feat, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-white/70">
                      <Check size={15} className="mt-0.5 shrink-0" style={{ color: style.color }} />
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/auth/register"
                  className="block text-center py-3 rounded-xl font-display font-bold text-sm transition-all"
                  style={{
                    background: isPremium
                      ? `linear-gradient(135deg, ${style.color}, #6D28D9)`
                      : `${style.color}20`,
                    color: isPremium ? 'white' : style.color,
                    border: `1px solid ${style.border}`,
                    boxShadow: isPremium ? `0 8px 24px ${style.glow}` : undefined,
                  }}
                >
                  Get Started →
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
