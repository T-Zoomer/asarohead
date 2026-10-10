import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { MODELS, SITE_NAME } from './src/models.js';

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

// Tags every page shares, added to the top of each <head>: the saved
// background (inlined, so it applies before the first paint), icons and
// fonts.
const HEAD = `
    <script>${readFileSync(new URL('./src/background-boot.js', import.meta.url), 'utf8')}</script>
    <meta name="theme-color" content="#111113" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500&family=Instrument+Sans:wght@400;500&display=swap" rel="stylesheet" />`;

function site() {
  return {
    name: 'site',
    // Before Vite's own HTML step, so the icon links get the base path.
    transformIndexHtml: {
      order: 'pre',
      handler: (html) =>
        html
          .replace('<head>', `<head>${HEAD}`)
          // Script contents aren't HTML-decoded, so JSON-LD gets the name raw.
          .replaceAll('__SITE_NAME_JSON__', SITE_NAME)
          .replaceAll('__SITE_NAME__', escape(SITE_NAME))
          .replaceAll('__SITE_URL__', SITE_URL)
          .replace('<!--gallery-->', galleryHtml())
          .replace('<!--credits-->', creditsHtml()),
    },
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
  plugins: [site()],
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
