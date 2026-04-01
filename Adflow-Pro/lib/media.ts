import { MediaSourceType } from './types';

const HTTPS_PROTOCOL = 'https:';
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

export function getPlaceholderImage(): string {
  return 'https://placehold.co/1200x800/0f172a/f8fafc?text=AdFlow+Pro';
}

export function validateMediaUrl(url: string) {
  try {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === HTTPS_PROTOCOL;
    const pathname = parsed.pathname.toLowerCase();
    const isYoutube = /(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(parsed.hostname.toLowerCase());
    const isDirectImage = IMAGE_EXTENSIONS.some((extension) => pathname.endsWith(extension));

    return {
      valid: isHttps && (isYoutube || isDirectImage),
      protocolValid: isHttps,
      imageTypeValid: isYoutube || isDirectImage,
      reason:
        !isHttps
          ? 'Only https URLs are allowed'
          : !isYoutube && !isDirectImage
            ? 'Only jpg, jpeg, png or YouTube URLs are supported'
            : null,
    };
  } catch {
    return {
      valid: false,
      protocolValid: false,
      imageTypeValid: false,
      reason: 'Invalid URL format',
    };
  }
}

export function normalizeMediaUrl(url: string): {
  sourceType: MediaSourceType;
  thumbnailUrl: string;
  fallbackThumbnailUrl: string;
  youtubeId?: string;
} {
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const youtubeMatch = url.match(youtubeRegex);

  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    return {
      sourceType: 'youtube',
      thumbnailUrl,
      fallbackThumbnailUrl: thumbnailUrl,
      youtubeId: videoId,
    };
  }

  if (/\.(jpg|jpeg|png)(\?.*)?$/i.test(url)) {
    return {
      sourceType: 'direct_image',
      thumbnailUrl: url,
      fallbackThumbnailUrl: url,
    };
  }

  return {
    sourceType: 'other',
    thumbnailUrl: getPlaceholderImage(),
    fallbackThumbnailUrl: getPlaceholderImage(),
  };
}
