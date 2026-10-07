// Renders a gallery thumbnail for every model in src/models.js into
// public/thumbs/<id>.jpg, using the real viewer with its controls hidden.
//
//   npm run thumbs            # every model
//   npm run thumbs -- nymph   # just one
//
// Needs Playwright's Chromium: npx playwright install chromium

import { mkdirSync } from 'node:fs';
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
  await page.goto(`${base}view/?m=${model.id}&zoom=${model.thumbZoom ?? 1}`);
  await page.addStyleTag({ content: '.brand, .light-ball, .credit, .status { display: none !important; }' });
  await page.waitForFunction(() => document.getElementById('status').textContent === '', null, { timeout: 120000 });
  await page.waitForTimeout(1000); // let the orbit damping settle
  const path = new URL(`${model.id}.jpg`, OUT).pathname;
  await page.screenshot({ path, type: 'jpeg', quality: 82 });
  console.log(`${model.id} -> ${path}`);
}

await browser.close();
await server.close();
