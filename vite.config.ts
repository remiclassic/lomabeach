import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { REMOTE_HERO_IMAGE_URL } from './constants/remoteHeroUrl';

const OG_TITLE = 'LOMA Beach Resort | Koh Phangan — Nothing fancy. Everything you need.';
const OG_DESCRIPTION =
  "Loma Beach Resort on Koh Phangan, Thailand: you've done enough—come do nothing. Simple beachfront stays. Secure booking with Stripe.";

function injectLinkPreviewMeta(env: Record<string, string>): Plugin {
  return {
    name: 'inject-link-preview-meta',
    transformIndexHtml(html) {
      const useLocal = env.VITE_USE_LOCAL_IMAGES === 'true';
      // Full public origin + path to site root (e.g. https://user.github.io/repo) — do not append Vite `base` again.
      const site = (env.VITE_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
      let ogImage = REMOTE_HERO_IMAGE_URL;
      if (useLocal && site) {
        ogImage = `${site}/images/hero.jpg`;
      }
      const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
      const canonical = site === '' ? '' : `${site}/`;
      const urlLine =
        canonical === ''
          ? ''
          : `    <meta property="og:url" content="${esc(canonical)}" />\n`;
      const block = `    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(OG_TITLE)}" />
    <meta property="og:description" content="${esc(OG_DESCRIPTION)}" />
    <meta property="og:image" content="${esc(ogImage)}" />
    <meta property="og:image:alt" content="${esc('Loma Beach Resort — Koh Phangan beachfront')}" />
${urlLine}    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(OG_TITLE)}" />
    <meta name="twitter:description" content="${esc(OG_DESCRIPTION)}" />
    <meta name="twitter:image" content="${esc(ogImage)}" />
`;
      return html.replace('</head>', `${block}  </head>`);
    },
  };
}

function normalizeBase(path: string): '/' | `${string}/` {
  if (!path || path === '/') return '/';
  const trimmed = path.replace(/\/$/, '');
  return `${trimmed}/` as `${string}/`;
}

export default defineConfig(({ mode }) => {
    const fileEnv = loadEnv(mode, process.cwd(), '');
    const env: Record<string, string> = { ...fileEnv };
    for (const key of Object.keys(process.env)) {
      if (key.startsWith('VITE_')) env[key] = process.env[key] as string;
    }
    const base = normalizeBase(process.env.VITE_BASE_PATH ?? env.VITE_BASE_PATH ?? '/');
    return {
      base,
      plugins: [react(), tailwindcss(), injectLinkPreviewMeta(env)],
      server: {
        port: 5173,
        // If 5173 is taken, Vite uses the next free port — always use the "Local" URL from the terminal.
        strictPort: false,
        host: true,
        open: base,
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
