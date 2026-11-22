import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      // Preload the fonts used above the fold so the client-rendered headline
      // does not reflow when they arrive (prevents font-swap layout shift / CLS).
      {
        name: 'preload-critical-fonts',
        apply: 'build',
        transformIndexHtml: {
          order: 'post',
          handler(_html, ctx) {
            if (!ctx.bundle) return [];
            const critical = [
              /barlow-condensed-latin-800-normal-[\w-]+\.woff2$/,
              /barlow-condensed-latin-700-normal-[\w-]+\.woff2$/,
              /plus-jakarta-sans-latin-wght-normal-[\w-]+\.woff2$/,
            ];
            return Object.keys(ctx.bundle)
              .filter((file) => critical.some((re) => re.test(file)))
              .map((file) => ({
                tag: 'link',
                attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${file}`, crossorigin: '' },
                injectTo: 'head' as const,
              }));
          },
        },
      },
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(import.meta.dirname, 'dist');
          const srcAssets = path.resolve(import.meta.dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    build: {
      // Never inline fonts as base64 data: URIs (keeps CSS small and the CSP strict).
      assetsInlineLimit: (filePath: string) => (/\.woff2?$/.test(filePath) ? false : undefined),
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
