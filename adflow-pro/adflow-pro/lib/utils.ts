import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { MediaSourceType } from '@/types';

/** Tailwind class merger */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Extract YouTube video ID from any YouTube URL */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([^?&#]+)/,
    /youtube\.com\/watch\?v=([^?&#]+)/,
    /youtube\.com\/embed\/([^?&#]+)/,
    /youtube\.com\/shorts\/([^?&#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

/** Get YouTube thumbnail from video URL */
export function getYouTubeThumbnail(url: string): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

/** Detect media source type from URL */
export function detectMediaSourceType(url: string): MediaSourceType {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('raw.githubusercontent.com')) return 'github_raw';
  if (/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url)) return 'direct_image';
  return 'other_url';
}

/** Normalize a media URL to a displayable thumbnail */
export function normalizeMediaUrl(url: string): { thumbnailUrl: string; sourceType: MediaSourceType } {
  const sourceType = detectMediaSourceType(url);
  if (sourceType === 'youtube') {
    return { thumbnailUrl: getYouTubeThumbnail(url) ?? url, sourceType };
  }
  return { thumbnailUrl: url, sourceType };
}

/** Format currency in PKR */
export function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency', currency: 'PKR', minimumFractionDigits: 0,
  }).format(amount);
}

/** Format a date nicely */
export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

/** Relative time (e.g. "2 hours ago") */
export function relativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** Check if an ad is expired */
export function isAdExpired(expireAt: string | null): boolean {
  if (!expireAt) return false;
  return isPast(new Date(expireAt));
}

/** Generate a URL-safe slug */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/** Ad status badge color */
export function statusColor(status: string): string {
  const map: Record<string, string> = {
    draft:             'bg-gray-500/20 text-gray-400',
    submitted:         'bg-blue-500/20 text-blue-400',
    under_review:      'bg-yellow-500/20 text-yellow-400',
    payment_pending:   'bg-orange-500/20 text-orange-400',
    payment_submitted: 'bg-cyan-500/20 text-cyan-400',
    payment_verified:  'bg-emerald-500/20 text-emerald-400',
    scheduled:         'bg-violet-500/20 text-violet-400',
    published:         'bg-green-500/20 text-green-400',
    expired:           'bg-red-500/20 text-red-400',
    archived:          'bg-gray-600/20 text-gray-500',
    rejected:          'bg-rose-500/20 text-rose-400',
  };
  return map[status] ?? 'bg-gray-500/20 text-gray-400';
}

/** Calculate rank score (client-side version) */
export function calcRankScore(params: {
  isFeatured: boolean;
  packageWeight: number;
  publishAt: Date | null;
  adminBoost: number;
  sellerVerified: boolean;
}): number {
  const featured = params.isFeatured ? 50 : 0;
  const weight = params.packageWeight * 10;
  let freshness = 0;
  if (params.publishAt) {
    const hoursOld = (Date.now() - params.publishAt.getTime()) / 3600000;
    freshness = Math.max(0, 20 - (hoursOld / 168) * 20);
  }
  const boost = params.adminBoost;
  const verified = params.sellerVerified ? 10 : 0;
  return featured + weight + freshness + boost + verified;
}

/** Truncate text */
export function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

/** Package badge colors */
export function packageColor(type: string): string {
  return { basic: '#6b7280', standard: '#3b82f6', premium: '#a855f7' }[type] ?? '#6b7280';
}
