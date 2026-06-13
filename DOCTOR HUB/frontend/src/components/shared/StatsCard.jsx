import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const CountUp = ({ end, duration = 1200 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span className="font-display">{count}</span>;
};

export const StatsCard = ({ icon: Icon, label, value, trend, trendUp = true }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="glass p-6 transition-shadow hover:shadow-[0_16px_40px_rgba(201,169,98,0.12)]"
  >
    <div className="flex items-start justify-between">
      <div
        className="flex h-12 w-12 items-center justify-center border border-[var(--color-brass)]/25 bg-[var(--color-brass)]/10"
        style={{ borderRadius: '2px 12px 2px 12px' }}
      >
        <Icon size={22} className="text-[var(--color-brass)]" strokeWidth={1.5} />
      </div>
      {trend !== undefined && (
        <span
          className={`flex items-center gap-1 text-xs font-medium ${
            trendUp ? 'text-[var(--color-success)]' : 'text-[var(--color-alert)]'
          }`}
        >
          {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trend}%
        </span>
      )}
    </div>
    <p className="mt-5 font-display text-4xl font-bold text-[var(--color-brass-light)]">
      <CountUp end={Number(value) || 0} />
    </p>
    <p className="mt-1 font-accent text-sm italic text-muted">{label}</p>
  </motion.div>
);
