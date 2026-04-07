/** Remote URL for the marketing hero photo (Unsplash). In-page only — keep `auto=format` for smaller WebP/AVIF in browsers. */
export const REMOTE_HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&q=80&w=2400';

/**
 * Link-preview URL for Open Graph / Twitter. Must be JPEG: Unsplash/imgix serves WebP to bot user-agents when
 * `auto=format` is set, and clients like Telegram often skip non-JPEG/PNG previews.
 */
export const OPEN_GRAPH_IMAGE_URL =
  'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?fm=jpg&fit=crop&w=1200&h=630&q=80';
