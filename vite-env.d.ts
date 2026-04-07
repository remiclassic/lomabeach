/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_LOCAL_IMAGES?: string;
  /** Contact email shown in the footer and for guests (e.g. hello@lomabeach.com). */
  readonly VITE_CONTACT_EMAIL?: string;
  /** Optional: production site URL for canonical links (e.g. https://www.lomabeach.com). */
  readonly VITE_PUBLIC_SITE_URL?: string;
  /**
   * Optional: static hosting base path (e.g. `/lomabeach/` for https://user.github.io/lomabeach/).
   * CI sets this automatically; omit locally for root `/`.
   */
  readonly VITE_BASE_PATH?: string;
  /** Optional: backend origin for `/api/*` when the SPA is on GitHub Pages (e.g. https://xxx.vercel.app). */
  readonly VITE_API_BASE_URL?: string;
  /** Currency symbol before amounts (default $). Use ฿ for THB, etc. */
  readonly VITE_CURRENCY_SYMBOL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
