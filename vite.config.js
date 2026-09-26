import { defineConfig } from 'vite';

// The public address of the site. Canonical links, share previews,
// robots.txt and sitemap.xml are all built from it. Override with
// SITE_URL=https://example.com npm run build
const SITE_URL = (process.env.SITE_URL ?? 'https://asarohead.com').replace(/\/$/, '');

const PAGES = ['/', '/about/'];

function seo() {
  return {
    name: 'seo',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', SITE_URL),
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
      });
      const urls = PAGES.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join('\n');
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
    },
  };
}

export default defineConfig({
  plugins: [seo()],
  build: {
    // three.js is most of the bundle and loads as one chunk by design.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      input: {
        main: 'index.html',
        about: 'about/index.html',
      },
    },
  },
});
