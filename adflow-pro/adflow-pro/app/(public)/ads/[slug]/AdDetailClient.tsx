'use client';
// app/(public)/ads/[slug]/AdDetailClient.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Tag, Clock, Phone, Mail, MessageCircle, Star, Shield, Flag, ExternalLink, ChevronLeft } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { getAdThumbnail, getYouTubeEmbedUrl } from '@/lib/utils/media';
import AdCard from '@/components/ads/AdCard';
import AbuseReportModal from '@/components/ads/AbuseReportModal';
import type { Ad } from '@/types';

export default function AdDetailClient({ ad, relatedAds }: { ad: Ad; relatedAds: Ad[] }) {
  const [activeMedia, setActiveMedia] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const media = ad.ad_media ?? [];
  const current = media[activeMedia];

  return (
    <main className="min-h-screen pt-20 pb-16 mesh-bg">
      <div className="max-w-6xl mx-auto px-4 pt-8">
        {/* Back */}
        <Link href="/explore" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to listings
        </Link>

        <div className="grid lg:grid-cols-[1fr_340px] gap-8">
          {/* Left column */}
          <div>
            {/* Media Viewer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl overflow-hidden mb-6 border border-white/10"
            >
              {/* Main media */}
              <div className="relative h-80 md:h-96 bg-[#0D1526]">
                {current?.source_type === 'youtube' && current.youtube_id ? (
                  <iframe
                    src={getYouTubeEmbedUrl(current.youtube_id ?? '')}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                  />
                ) : (
                  <Image
                    src={current ? getAdThumbnail(current) : '/images/placeholder.png'}
                    alt={ad.title}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={e => { (e.target as HTMLImageElement).src = '/images/placeholder.png'; }}
                  />
                )}
                {/* Featured badge */}
                {ad.is_featured && (
                  <div className="absolute top-4 left-4">
                    <span className="badge-featured text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                      <Star size={11} fill="currentColor" /> Featured
                    </span>
                  </div>
                )}
              </div>
              {/* Thumbnails strip */}
              {media.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {media.map((m, i) => (
                    <button
                      key={m.id}
                      onClick={() => setActiveMedia(i)}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${i === activeMedia ? 'border-violet-500' : 'border-transparent opacity-60'}`}
                    >
                      <Image src={getAdThumbnail(m)} alt="" fill className="object-cover" unoptimized />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Title & Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              {/* Category & City */}
              <div className="flex flex-wrap gap-2 mb-3">
                {ad.category && (
                  <Link href={`/categories/${ad.category.slug}`} className="flex items-center gap-1.5 text-xs text-violet-400 bg-violet-400/10 border border-violet-400/20 px-3 py-1 rounded-full hover:bg-violet-400/20 transition-colors">
                    <Tag size={11} /> {ad.category.name}
                  </Link>
                )}
                {ad.city && (
                  <Link href={`/cities/${ad.city.slug}`} className="flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 rounded-full hover:bg-cyan-400/20 transition-colors">
                    <MapPin size={11} /> {ad.city.name}
                  </Link>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">{ad.title}</h1>

              {ad.price_label && (
                <p className="text-2xl font-display font-bold text-cyan-400 mb-4">{ad.price_label}</p>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-white/40 mb-6">
                <span className="flex items-center gap-1">
                  <Clock size={13} />
                  Posted {ad.published_at ? formatDistanceToNow(new Date(ad.published_at), { addSuffix: true }) : 'recently'}
                </span>
                {ad.expire_at && (
                  <span className="flex items-center gap-1 text-amber-400/70">
                    Expires {format(new Date(ad.expire_at), 'MMM d, yyyy')}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="glass rounded-xl p-5 border border-white/8 mb-6">
                <h3 className="font-display font-bold text-white mb-3">Description</h3>
                <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{ad.description}</p>
              </div>

              {/* Report Abuse */}
              <button
                onClick={() => setShowReport(true)}
                className="flex items-center gap-2 text-xs text-white/25 hover:text-red-400 transition-colors"
              >
                <Flag size={12} /> Report this ad
              </button>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Seller Card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-5 border border-white/10">
              <h3 className="font-display font-bold text-white mb-4">Contact Seller</h3>
              {ad.user && (
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/8">
                  <div className="w-10 h-10 rounded-full bg-violet-500/30 flex items-center justify-center text-violet-300 font-bold">
                    {ad.user.full_name?.[0]?.toUpperCase() ?? 'S'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                      {ad.user.full_name ?? 'Seller'}
                      {ad.user.is_verified && (
                        <span className="flex items-center gap-0.5 text-[10px] text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded-full">
                          <Shield size={9} /> Verified
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-white/40">Member since {format(new Date(ad.user.created_at), 'MMM yyyy')}</p>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {ad.contact_phone && (
                  <a href={`tel:${ad.contact_phone}`} className="btn-ghost w-full flex items-center justify-center gap-2 text-sm py-2.5">
                    <Phone size={15} /> {ad.contact_phone}
                  </a>
                )}
                {ad.contact_whatsapp && (
                  <a
                    href={`https://wa.me/${ad.contact_whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl font-semibold transition-all"
                    style={{ background: 'rgba(37,211,102,0.15)', color: '#25D366', border: '1px solid rgba(37,211,102,0.3)' }}
                  >
                    <MessageCircle size={15} /> WhatsApp
                  </a>
                )}
                {ad.contact_email && (
                  <a href={`mailto:${ad.contact_email}`} className="btn-ghost w-full flex items-center justify-center gap-2 text-sm py-2.5">
                    <Mail size={15} /> Email Seller
                  </a>
                )}
              </div>
            </motion.div>

            {/* Package Info */}
            {ad.package && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass rounded-xl p-4 border border-white/8">
                <p className="text-xs text-white/40 mb-1">Listed under</p>
                <p className="font-display font-bold text-white">{ad.package.name} Package</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Related Ads */}
        {relatedAds.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-display font-bold text-white mb-6">Similar Listings</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedAds.map((rel, i) => <AdCard key={rel.id} ad={rel as Ad} index={i} />)}
            </div>
          </section>
        )}
      </div>

      {showReport && (
        <AbuseReportModal adId={ad.id} onClose={() => setShowReport(false)} />
      )}
    </main>
  );
}
