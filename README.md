# Light & Form

Free 3D sculptures in the browser, for drawing reference. Pick a model, turn
it, light it, and draw from it.

- **Pick a model:** the home page is a gallery; each card opens the viewer
  at `view/<id>/`.
- **Turn the model:** drag to orbit, scroll to zoom, right-drag to pan.
- **Move the light:** drag the bright spot on the ball in the top right. The
  outer ring puts the light behind the model.

## Develop

```sh
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/
```

`dist/` is a plain static site. It deploys as-is to Netlify, Vercel,
GitHub Pages or Cloudflare Pages. Pushing to `main` deploys to GitHub Pages.

Canonical links, share previews, `robots.txt` and `sitemap.xml` use the
site's public address. It defaults to `https://asarohead.com`; build with
`SITE_URL=https://your-domain npm run build` to change it, or edit the
default in `vite.config.js`.

## Adding a model

1. Put the source file in `scans-src/` (it stays out of git), add it to
   `SCANS` in `scripts/convert-scan.mjs` with a rotation that stands it
   upright facing +z, and run `npm run convert:scan -- <id>`. To check the
   rotation, `npm run thumbs -- --sides <id>` renders it from all four sides.
2. Add an entry to `src/models.js`: id, title, artist and credit. The
   gallery and viewer are both built from that list.
3. Run `npm run thumbs -- <id>` to render its gallery thumbnail into
   `public/thumbs/` (needs `npx playwright install chromium` once).

## The models

**Asaro head.** "Asaro Head" by AgentSCAD
([Thingiverse 7287701](https://www.thingiverse.com/thing:7287701)),
licensed **CC BY-SA**. The original print files are in `asaro-src/`.
`npm run convert:asaro` reassembles them into `public/models/asaro.glb`. It
flips the back half onto the front, stitches the seam, seats the ears in
their sockets, and simplifies the result from 239k to about 6k triangles
(26 KB). The GLB is a derivative and stays under CC BY-SA. Keep the credit
on the model's page if you deploy this.

**Sculpture scans.** From [Three D Scans](https://threedscans.com), which
publishes its scans free to use without copyright restrictions, and from
[Scan the World](https://www.myminifactory.com/scantheworld/) on MyMiniFactory
(public domain SMK casts, and CC BY-NC-SA scans whose converted files keep
that license; the build lists every credit in `models/LICENSE.txt`). Don't add MyMiniFactory
Exclusive models: their license forbids hosting them elsewhere. They keep
their full resolution up to 1.5M triangles (larger scans are simplified to
that), with smooth normals computed from the full mesh.

**Ambient occlusion.** Both convert scripts bake ambient occlusion into each
model as a per-vertex `_AO` attribute (`scripts/ao.mjs`), which the viewer
uses to darken the ambient light in recesses. To re-bake models that are
already converted, for example after changing its settings, run
`npm run bake:ao` (or `npm run bake:ao -- <id>`).

The full list, with sources and credits, is in `src/models.js` (and on the
site's About page); the source file for each is in `SCANS` in
`scripts/convert-scan.mjs`.
