'use client';
// components/layout/StatsSection.tsx
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { TrendingUp, Users, Shield, Clock } from 'lucide-react';

const STATS = [
  { icon: TrendingUp, value: 5000, suffix: '+', label: 'Active Listings',    color: '#8B5CF6' },
  { icon: Users,      value: 2000, suffix: '+', label: 'Verified Sellers',   color: '#06B6D4' },
  { icon: Shield,     value: 98,   suffix: '%', label: 'Moderation Rate',    color: '#10B981' },
  { icon: Clock,      value: 24,   suffix: 'h', label: 'Avg. Review Time',   color: '#F59E0B' },
];

function StatItem({ stat, i }: { stat: typeof STATS[0]; i: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const Icon = stat.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1, type: 'spring' }}
      className="glass rounded-2xl p-6 text-center"
    >
      <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
        style={{ background: `${stat.color}20`, border: `1px solid ${stat.color}30` }}>
        <Icon size={22} style={{ color: stat.color }} />
      </div>
      <div className="text-3xl font-display font-800 text-white mb-1">
        {isInView ? (
          <CountUp end={stat.value} duration={2.5} separator="," />
        ) : '0'}
        <span style={{ color: stat.color }}>{stat.suffix}</span>
      </div>
      <p className="text-sm text-white/40">{stat.label}</p>
    </motion.div>
  );
}

export default function StatsSection({ totalAds }: { totalAds: number }) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat, i) => <StatItem key={stat.label} stat={stat} i={i} />)}
      </div>
    </section>
  );
}
