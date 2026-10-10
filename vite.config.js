import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { MODELS, SITE_NAME } from './src/models.js';

// The public address of the site. Canonical links, share previews,
// robots.txt and sitemap.xml are all built from it. Override with
// SITE_URL=https://example.com npm run build
const SITE_URL = (process.env.SITE_URL ?? 'https://lightandform.art').replace(/\/$/, '');

const PAGES = ['/', '/about/', ...MODELS.map((m) => `/view/${m.id}/`)];

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// The home page cards, built from src/models.js.
function galleryHtml() {
  return MODELS.map(
    (m) => `<li>
          <a class="card" href="view/${m.id}/">
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

// Tags every page shares, added after the charset and viewport tags (the
// charset has to come within the first 1024 bytes): the saved
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

// One page per model at view/<id>/, made from the built viewer page with the
// model's title, description, credit and structured data filled in, so each
// model is a real page for search engines and link previews. The viewer
// script picks the model from the path.
function modelPage(html, m) {
  const url = `${SITE_URL}/view/${m.id}/`;
  const title = `${m.title} – 3D model – ${SITE_NAME}`;
  const description = `Explore ${m.title} (${m.artist}) in 3D: turn it, zoom in close and light it any way you like. Free in your browser, for art lovers, students and artists.`;
  const data = {
    '@context': 'https://schema.org',
    '@type': '3DModel',
    name: m.title,
    description,
    url,
    contentUrl: `${SITE_URL}/models/${m.id}.glb`,
    encodingFormat: 'model/gltf-binary',
    thumbnailUrl: `${SITE_URL}/thumbs/${m.id}.webp`,
    isAccessibleForFree: true,
    about: { '@type': 'VisualArtwork', name: m.title },
  };
  const tags = `
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escape(SITE_NAME)}" />
    <meta property="og:title" content="${escape(m.title)} – ${escape(SITE_NAME)}" />
    <meta property="og:description" content="${escape(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${SITE_URL}/og/${m.id}.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escape(m.title)}, shown in 3D on a dark background" />
    <meta name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
  </head>`;
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*"/, `$1${escape(description)}"`)
    .replace('</head>', tags)
    .replace('<h1 id="title">&nbsp;</h1>', `<h1 id="title">${escape(m.title)}</h1>`)
    .replace('<p class="tagline" id="artist">&nbsp;</p>', `<p class="tagline" id="artist">${escape(m.artist)}</p>`)
    .replace('<footer class="credit" id="credit"></footer>', `<footer class="credit" id="credit">${m.credit}</footer>`)
    .replaceAll('href="../"', 'href="../../"');
}

function site() {
  return {
    name: 'site',
    // Before Vite's own HTML step, so the icon links get the base path.
    transformIndexHtml: {
      order: 'pre',
      handler: (html) =>
        html
          .replace(/(<meta name="viewport"[^>]*>)/, `$1${HEAD}`)
          // Script contents aren't HTML-decoded, so JSON-LD gets the name raw.
          .replaceAll('__SITE_NAME_JSON__', SITE_NAME)
          .replaceAll('__SITE_NAME__', escape(SITE_NAME))
          .replaceAll('__SITE_URL__', SITE_URL)
          .replace('<!--gallery-->', galleryHtml())
          .replace('<!--credits-->', creditsHtml()),
    },
    // In development, serve the viewer page for view/<id>/ as the build does.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const match = req.url.match(/^\/view\/[a-z0-9-]+\/(\?.*)?$/);
        if (match) req.url = `/view/index.html${match[1] ?? ''}`;
        next();
      });
    },
    writeBundle({ dir }) {
      const viewer = readFileSync(`${dir}/view/index.html`, 'utf8');
      for (const m of MODELS) {
        mkdirSync(`${dir}/view/${m.id}`, { recursive: true });
        writeFileSync(`${dir}/view/${m.id}/index.html`, modelPage(viewer, m));
      }
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

// The path the site is served under: the domain root. To serve it from a
// subfolder, such as a GitHub Pages project URL, set BASE_PATH=/<repo>/.
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
        notFound: '404.html',
      },
    },
  },
});
