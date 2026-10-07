// Renders a gallery thumbnail for every model in src/models.js into
// public/thumbs/<id>.webp, using the real viewer with its controls hidden and
// a transparent background, so the casts sit on whatever background the
// visitor has chosen.
//
//   npm run thumbs            # every model
//   npm run thumbs -- nymph   # just one
//
// Needs Playwright's Chromium: npx playwright install chromium

import { mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { MODELS } from '../src/models.js';

const SIZE = 600;
const OUT = new URL('../public/thumbs/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const server = await createServer({ server: { port: 0 }, logLevel: 'error' });
await server.listen();
const base = server.resolvedUrls.local[0];

// SwiftShader renders WebGL in software, so this works without a GPU.
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });

const ids = process.argv.slice(2);
for (const model of MODELS.filter((m) => !ids.length || ids.includes(m.id))) {
  await page.goto(`${base}view/?m=${model.id}&thumb&zoom=${model.thumbZoom ?? 1}`);
  await page.addStyleTag({
    content: '.brand, .controls, .credit, .status { display: none !important; } html, body { background: transparent !important; }',
  });
  await page.waitForFunction(() => document.getElementById('status').textContent === '', null, { timeout: 120000 });
  await page.waitForTimeout(1000); // let the orbit damping settle
  const png = await page.screenshot({ omitBackground: true });
  // Playwright only writes PNG or JPEG; let the browser encode WebP, which
  // keeps the transparency at a fraction of the PNG's size.
  const webp = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = Object.assign(document.createElement('canvas'), { width: img.width, height: img.height });
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', 0.85).split(',')[1];
  }, png.toString('base64'));
  const path = new URL(`${model.id}.webp`, OUT).pathname;
  writeFileSync(path, Buffer.from(webp, 'base64'));
  console.log(`${model.id} -> ${path}`);
}

await browser.close();
await server.close();
