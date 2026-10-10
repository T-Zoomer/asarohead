import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { MODELS } from './src/models.js';

// The public address of the site. Canonical links, share previews,
// robots.txt and sitemap.xml are all built from it. Override with
// SITE_URL=https://example.com npm run build
const SITE_URL = (process.env.SITE_URL ?? 'https://asarohead.com').replace(/\/$/, '');

const PAGES = ['/', '/about/', ...MODELS.map((m) => `/view/?m=${m.id}`)];

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// The home page cards, built from src/models.js.
function galleryHtml() {
  return MODELS.map(
    (m) => `<li>
          <a class="card" href="view/?m=${m.id}">
            <div class="thumb"><img src="thumbs/${m.id}.webp" alt="" width="600" height="600" loading="lazy" /></div>
            <h2>${escape(m.title)}</h2>
          </a>
        </li>`,
  ).join('\n        ');
}

// The About page's list of scan credits, built from src/models.js. The Asaro
// head has its own paragraph there.
function creditsHtml() {
  return MODELS.filter((m) => m.id !== 'asaro')
    .map((m) => `<li>${m.credit}</li>`)
    .join('\n        ');
}

// models/LICENSE.txt: the credit and license of every model, as plain text,
// built from the same credits so it never falls behind the list.
function licenseText() {
  const text = (html) =>
    html
      .replace(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g, '$2 ($1)')
      .replace(/<[^>]+>/g, '');
  const header =
    'Credits and licenses for the models in this folder. Each GLB was converted for the web\n' +
    '(reoriented, simplified and given baked ambient occlusion) from the source named below;\n' +
    'derivatives of CC BY-SA and CC BY-NC-SA sources keep the same license.\n';
  return `${header}\n${MODELS.map((m) => `${m.id}.glb: ${text(m.credit)}`).join('\n\n')}\n`;
}

function seo() {
  return {
    name: 'seo',
    transformIndexHtml: (html) =>
      html
        .replace('<head>', `<head>\n    <script>${readFileSync(new URL('./src/background-boot.js', import.meta.url), 'utf8')}</script>`)
        .replaceAll('__SITE_URL__', SITE_URL)
        .replace('<!--gallery-->', galleryHtml())
        .replace('<!--credits-->', creditsHtml()),
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'models/LICENSE.txt', source: licenseText() });
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

// The path the site is served under. GitHub Pages project sites live at
// /<repo>/, so the deploy workflow sets BASE_PATH=/asarohead/.
const BASE_PATH = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base: BASE_PATH,
  plugins: [seo()],
  build: {
    // three.js is most of the bundle and loads as one chunk by design.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      input: {
        main: 'index.html',
        view: 'view/index.html',
        about: 'about/index.html',
      },
    },
  },
});
