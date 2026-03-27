// lib/utils/media.ts
// External media normalization — NO local uploads
// Supports: YouTube, GitHub raw, direct image URLs

export type MediaSourceType = 'youtube' | 'github_raw' | 'image' | 'other';

export interface NormalizedMedia {
  source_type: MediaSourceType;
  original_url: string;
  normalized_thumbnail_url: string;
  youtube_id?: string;
  validation_status: 'pending' | 'valid' | 'invalid';
}

/**
 * Extract YouTube video ID from any YouTube URL format
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Normalize any media URL into a standard format
 * - YouTube → extract ID, generate hq thumbnail
 * - GitHub raw → use as-is
 * - Direct image → use as-is
 * - Other → categorize as other
 */
export function normalizeMediaUrl(url: string): NormalizedMedia {
  const trimmedUrl = url.trim();

  // ── YouTube ────────────────────────────────────────────
  const ytId = extractYouTubeId(trimmedUrl);
  if (ytId) {
    return {
      source_type: 'youtube',
      original_url: trimmedUrl,
      // hqdefault gives 480×360, maxresdefault gives 1280×720 (may 404 for older videos)
      normalized_thumbnail_url: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      youtube_id: ytId,
      validation_status: 'valid',
    };
  }

  // ── GitHub Raw ─────────────────────────────────────────
  if (
    trimmedUrl.includes('raw.githubusercontent.com') ||
    trimmedUrl.includes('github.com') && trimmedUrl.includes('/raw/')
  ) {
    // Convert github.com/user/repo/raw/... → raw.githubusercontent.com/...
    const rawUrl = trimmedUrl
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/raw/', '/');

    return {
      source_type: 'github_raw',
      original_url: trimmedUrl,
      normalized_thumbnail_url: rawUrl,
      validation_status: 'pending',
    };
  }

  // ── Direct Image ───────────────────────────────────────
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i;
  if (imageExtensions.test(trimmedUrl)) {
    return {
      source_type: 'image',
      original_url: trimmedUrl,
      normalized_thumbnail_url: trimmedUrl,
      validation_status: 'pending',
    };
  }

  // ── HTTPS image (no extension but likely image) ────────
  if (trimmedUrl.startsWith('https://') || trimmedUrl.startsWith('http://')) {
    return {
      source_type: 'image',
      original_url: trimmedUrl,
      normalized_thumbnail_url: trimmedUrl,
      validation_status: 'pending',
    };
  }

  // ── Other / Unknown ────────────────────────────────────
  return {
    source_type: 'other',
    original_url: trimmedUrl,
    normalized_thumbnail_url: '/images/placeholder.png',
    validation_status: 'invalid',
  };
}

/**
 * Get display thumbnail for an ad's primary media
 * Falls back to placeholder if media fails
 */
export function getAdThumbnail(media?: { normalized_thumbnail_url?: string; source_type?: string } | null): string {
  if (!media?.normalized_thumbnail_url) return '/images/placeholder.png';
  return media.normalized_thumbnail_url;
}

/**
 * Get YouTube embed URL from video ID
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
}
