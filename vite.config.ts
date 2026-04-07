import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function normalizeBase(path: string): '/' | `${string}/` {
  if (!path || path === '/') return '/';
  const trimmed = path.replace(/\/$/, '');
  return `${trimmed}/` as `${string}/`;
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const base = normalizeBase(process.env.VITE_BASE_PATH ?? env.VITE_BASE_PATH ?? '/');
    return {
      base,
      server: {
        port: 5173,
        // If 5173 is taken, Vite uses the next free port — always use the "Local" URL from the terminal.
        strictPort: false,
        host: true,
        open: base,
      },
      plugins: [react(), tailwindcss()],
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
