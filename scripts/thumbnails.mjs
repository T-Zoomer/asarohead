// Renders a gallery thumbnail for every model in src/models.js into
// public/thumbs/<id>.webp, using the real viewer with its controls hidden and
// a transparent background, so the casts sit on whatever background the
// visitor has chosen.
//
//   npm run thumbs                    # every model
//   npm run thumbs -- nymph           # just one
//   npm run thumbs -- --sides nymph   # front, left, back and right in one
//                                     # strip, to check a new scan's rotation
//
// Needs Playwright's Chromium: npx playwright install chromium

import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { MODELS } from '../src/models.js';

const SIZE = 600;
const OUT = new URL('../public/thumbs/', import.meta.url);
const SIDES_OUT = join(tmpdir(), 'cast-room-sides');

const args = process.argv.slice(2);
const sides = args.includes('--sides');
const ids = args.filter((a) => a !== '--sides');
const models = MODELS.filter((m) => !ids.length || ids.includes(m.id));
mkdirSync(sides ? SIDES_OUT : OUT, { recursive: true });

const server = await createServer({ server: { port: 0 }, logLevel: 'error' });
await server.listen();
const base = server.resolvedUrls.local[0];

// SwiftShader renders WebGL in software, so this works without a GPU.
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });

// Loads the viewer with the given query and returns a PNG of the model alone.
async function render(query) {
  await page.goto(`${base}view/?${query}`);
  await page.addStyleTag({
    content: '.brand, .controls, .credit, .status { display: none !important; } html, body { background: transparent !important; }',
  });
  await page.waitForFunction(() => document.getElementById('status').textContent === '', null, { timeout: 300000 });
  await page.waitForTimeout(1000); // let the orbit damping settle
  return (await page.screenshot({ omitBackground: true })).toString('base64');
}

// Playwright only writes PNG or JPEG; let the browser draw the PNGs side by
// side and encode the result, which for WebP keeps the transparency at a
// fraction of the PNG's size.
function encode(pngs, type, quality) {
  return page.evaluate(
    async ({ pngs, type, quality }) => {
      const imgs = await Promise.all(
        pngs.map(async (b64) => {
          const img = new Image();
          img.src = `data:image/png;base64,${b64}`;
          await img.decode();
          return img;
        }),
      );
      const c = Object.assign(document.createElement('canvas'), { width: imgs[0].width * imgs.length, height: imgs[0].height });
      imgs.forEach((img, i) => c.getContext('2d').drawImage(img, i * img.width, 0));
      return c.toDataURL(type, quality).split(',')[1];
    },
    { pngs, type, quality },
  );
}

for (const model of models) {
  let path;
  if (sides) {
    const pngs = [];
    for (const az of [0, 90, 180, 270]) pngs.push(await render(`m=${model.id}&az=${az}`));
    path = join(SIDES_OUT, `${model.id}.png`);
    writeFileSync(path, Buffer.from(await encode(pngs, 'image/png'), 'base64'));
  } else {
    const png = await render(`m=${model.id}&thumb&zoom=${model.thumbZoom ?? 1}`);
    path = new URL(`${model.id}.webp`, OUT).pathname;
    writeFileSync(path, Buffer.from(await encode([png], 'image/webp', 0.85), 'base64'));
  }
  console.log(`${model.id} -> ${path}`);
}

await browser.close();
await server.close();
