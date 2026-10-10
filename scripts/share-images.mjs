// Makes each model's link-preview image, public/og/<id>.jpg (1200 × 630):
// its gallery thumbnail on the dark background with its title and artist,
// laid out like the site's own share image. Run it after npm run thumbs.
//
//   npm run share-images            # every model
//   npm run share-images -- nymph   # just one

import { mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { MODELS, SITE_NAME } from '../src/models.js';

const OUT = new URL('../public/og/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const ids = process.argv.slice(2);
const models = MODELS.filter((m) => !ids.length || ids.includes(m.id));

const server = await createServer({ server: { port: 0 }, logLevel: 'error' });
await server.listen();
const browser = await chromium.launch();
const page = await browser.newPage();
// The home page loads the site's fonts; the images are drawn on a canvas there.
await page.goto(server.resolvedUrls.local[0]);

for (const model of models) {
  const jpg = await page.evaluate(
    async ({ id, title, artist, site }) => {
      await Promise.all(['500 60px Cinzel', '400 26px "Instrument Sans"'].map((f) => document.fonts.load(f)));
      const img = new Image();
      img.src = `/thumbs/${id}.webp`;
      await img.decode();

      const c = Object.assign(document.createElement('canvas'), { width: 1200, height: 630 });
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#111113';
      ctx.fillRect(0, 0, 1200, 630);
      ctx.drawImage(img, 580, 15, 600, 600);

      ctx.letterSpacing = '2px';
      ctx.fillStyle = '#8b8c8f';
      ctx.font = '500 26px Cinzel';
      ctx.fillText(site, 64, 92);

      // The title wraps to fit the left half, getting smaller if it would
      // take more than three lines.
      const wrap = (size) => {
        ctx.font = `500 ${size}px Cinzel`;
        const lines = [''];
        for (const word of title.split(' ')) {
          const next = lines.at(-1) ? `${lines.at(-1)} ${word}` : word;
          if (ctx.measureText(next).width > 500 && lines.at(-1)) lines.push(word);
          else lines[lines.length - 1] = next;
        }
        return lines;
      };
      let size = 60;
      let lines = wrap(size);
      while (lines.length > 3 && size > 36) lines = wrap((size -= 4));

      ctx.letterSpacing = '1px';
      ctx.fillStyle = '#e9e9e7';
      const lineHeight = size * 1.2;
      const top = 520 - lineHeight * (lines.length - 1);
      lines.forEach((line, i) => ctx.fillText(line, 64, top + i * lineHeight));

      ctx.letterSpacing = '0px';
      ctx.fillStyle = '#8b8c8f';
      ctx.font = '400 26px "Instrument Sans"';
      ctx.fillText(artist, 64, 570);
      return c.toDataURL('image/jpeg', 0.86).split(',')[1];
    },
    { id: model.id, title: model.title, artist: model.artist, site: SITE_NAME },
  );
  const path = new URL(`${model.id}.jpg`, OUT).pathname;
  writeFileSync(path, Buffer.from(jpg, 'base64'));
  console.log(`${model.id} -> ${path}`);
}

await browser.close();
await server.close();
