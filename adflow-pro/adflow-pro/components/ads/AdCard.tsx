'use client';
// components/ads/AdCard.tsx
// Reusable ad card with tilt effect, rank badge, media preview
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Tag, Clock, Star, Zap, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getAdThumbnail } from '@/lib/utils/media';
import type { Ad } from '@/types';

interface AdCardProps {
  ad: Ad;
  index?: number;
  showRank?: boolean;
}

const PACKAGE_COLORS = {
  basic:    { border: '#64748B', glow: 'rgba(100,116,139,0.2)', label: 'Basic' },
  standard: { border: '#3B82F6', glow: 'rgba(59,130,246,0.2)',  label: 'Standard' },
  premium:  { border: '#8B5CF6', glow: 'rgba(139,92,246,0.3)',  label: 'Premium' },
};

export default function AdCard({ ad, index = 0, showRank = false }: AdCardProps) {
  const pkgSlug = (ad.package?.slug ?? 'basic') as keyof typeof PACKAGE_COLORS;
  const pkgStyle = PACKAGE_COLORS[pkgSlug] ?? PACKAGE_COLORS.basic;

  const primaryMedia = ad.ad_media?.find(m => m.is_primary) ?? ad.ad_media?.[0];
  const thumbnail = getAdThumbnail(primaryMedia);

  const timeAgo = ad.published_at
    ? formatDistanceToNow(new Date(ad.published_at), { addSuffix: true })
    : 'Recently';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, type: 'spring', stiffness: 200 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="card-ad group cursor-pointer relative"
      style={{
        borderColor: ad.is_featured ? pkgStyle.border + '60' : undefined,
        boxShadow: ad.is_featured ? `0 0 30px ${pkgStyle.glow}` : undefined,
      }}
    >
      <Link href={`/ads/${ad.slug}`} className="block">
        {/* Thumbnail */}
        <div className="relative h-48 bg-[#0D1526] overflow-hidden">
          <Image
            src={thumbnail}
            alt={ad.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.png'; }}
            unoptimized
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/80 via-transparent to-transparent" />

          {/* Badges on thumbnail */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {ad.is_featured && (
              <span className="badge-featured text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Star size={9} fill="currentColor" />
                Featured
              </span>
            )}
            {pkgSlug === 'premium' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                style={{ background: `${pkgStyle.border}30`, color: pkgStyle.border, border: `1px solid ${pkgStyle.border}50` }}>
                <Zap size={9} />
                Premium
              </span>
            )}
          </div>

          {/* Rank score badge */}
          {showRank && (
            <div className="absolute top-2 right-2">
              <span className="rank-badge">#{index + 1}</span>
            </div>
          )}

          {/* YouTube indicator */}
          {primaryMedia?.source_type === 'youtube' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                <ExternalLink size={16} className="text-white ml-0.5" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          {ad.category && (
            <div className="flex items-center gap-1.5 mb-2">
              <Tag size={11} className="text-violet-400" />
              <span className="text-[11px] text-violet-400 font-medium">{ad.category.name}</span>
            </div>
          )}

          {/* Title */}
          <h3 className="font-display font-bold text-base text-white leading-snug mb-2 line-clamp-2 group-hover:text-violet-300 transition-colors">
            {ad.title}
          </h3>

          {/* Price */}
          {ad.price_label && (
            <p className="text-sm font-bold text-cyan-400 mb-3">{ad.price_label}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-[11px] text-white/40">
            <div className="flex items-center gap-1">
              <MapPin size={11} />
              {ad.city?.name ?? 'Pakistan'}
            </div>
            <div className="flex items-center gap-1">
              <Clock size={11} />
              {timeAgo}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
