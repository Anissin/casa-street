import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

// Works on every Node version (import.meta.dirname needs Node >= 20.11).
const ROOT = path.dirname(fileURLToPath(import.meta.url));

/**
 * Public https origin for SEO tags, known at build time:
 * SITE_URL if set, otherwise Vercel's production domain (set automatically on Vercel).
 */
function buildTimeSiteUrl(): string {
  const raw =
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '');
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' ? url.origin : '';
  } catch {
    return '';
  }
}

/**
 * True when the site is deployed as static files only (no Express server),
 * e.g. on Vercel. Override with CASA_STATIC_HOSTING=true|false.
 */
function isStaticHosting(): boolean {
  if (process.env.CASA_STATIC_HOSTING) return process.env.CASA_STATIC_HOSTING === 'true';
  return Boolean(process.env.VERCEL);
}

export default defineConfig(() => {
  const siteUrl = buildTimeSiteUrl();

  return {
    define: {
      __CASA_STATIC_HOSTING__: JSON.stringify(isStaticHosting()),
    },
    plugins: [
      react(),
      tailwindcss(),
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
      // Static hosting (e.g. Vercel) has no Express server, so bake the
      // canonical URL, absolute share-image URLs, robots.txt and sitemap.xml
      // into the build. The Express server does the same at runtime.
      {
        name: 'static-seo',
        apply: 'build',
        transformIndexHtml(html) {
          if (!siteUrl) return html;
          return html
            .replace(
              '<!--casa:canonical-->',
              `<link rel="canonical" href="${siteUrl}/" />\n    <meta property="og:url" content="${siteUrl}/" />`
            )
            .replaceAll('content="/images/', `content="${siteUrl}/images/`);
        },
        generateBundle() {
          this.emitFile({
            type: 'asset',
            fileName: 'robots.txt',
            source: `User-agent: *\nAllow: /\nDisallow: /api/\n${siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml\n` : ''}`,
          });
          if (siteUrl) {
            this.emitFile({
              type: 'asset',
              fileName: 'sitemap.xml',
              source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc><changefreq>weekly</changefreq></url>\n</urlset>\n`,
            });
          }
        },
      },
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(ROOT, 'dist');
          const srcAssets = path.resolve(ROOT, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, { recursive: true, force: true });
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
        '@': path.resolve(ROOT, '.'),
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
