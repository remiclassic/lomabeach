/** Public site config from env (build-time). */

/**
 * API URL for Stripe checkout. On GitHub Pages, set `VITE_API_BASE_URL` at build time to your
 * deployed backend (e.g. https://your-app.vercel.app) — same-origin `/api/...` is not available on static hosting.
 */
export function resolveApiUrl(apiPath: string): string {
  const path = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  const backend = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
  if (backend) return `${backend}${path}`;
  const root = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${root}${path}`;
}

export function getContactEmail(): string {
  return import.meta.env.VITE_CONTACT_EMAIL || 'hello@lomabeach.com';
}

export function getPublicSiteUrl(): string {
  return import.meta.env.VITE_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
}

export function getCurrencySymbol(): string {
  return import.meta.env.VITE_CURRENCY_SYMBOL || '$';
}
