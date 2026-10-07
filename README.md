# Cast Room

Free 3D sculptures in the browser, for drawing reference. Pick a model, turn
it, light it, and draw from it.

- **Pick a model:** the home page is a gallery; each card opens the viewer
  at `view/?m=<id>`.
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

1. Put the source file in `3d_model files/` (it stays out of git), add it to
   `SCANS` in `scripts/convert-scan.mjs` with a rotation that stands it
   upright facing +z, and run `npm run convert:scan -- <id>`.
2. Add an entry to `src/models.js`: title, artist, file and credit. The
   gallery and viewer are both built from that list.
3. Run `npm run thumbs -- <id>` to render its gallery thumbnail into
   `public/thumbs/` (needs `npx playwright install chromium` once).

## The models

**Asaro head.** "Asaro Head" by AgentSCAD
([Thingiverse 7287701](https://www.thingiverse.com/thing:7287701)),
licensed **CC BY-SA**. The original print files are in `model-src/`.
`npm run convert` reassembles them into `public/models/asaro-head.glb`. It
flips the back half onto the front, stitches the seam, seats the ears in
their sockets, and simplifies the result from 239k to about 6k triangles
(26 KB). The GLB is a derivative and stays under CC BY-SA. Keep the credit
on the model's page if you deploy this.

**Sculpture scans.** From [Three D Scans](https://threedscans.com), which
publishes its scans free to use without copyright restrictions. They keep
their full resolution up to 1.5M triangles (larger scans are simplified to
that), with smooth normals computed from the full mesh.

| Model | Source file | Triangles | GLB |
| --- | --- | --- | --- |
| [Napoléon Ier](https://threedscans.com/nouveau-musee-national-de-monaco/napoleon-ler/), François Joseph Bosio | `NAPOLEON_fix.OBJ` | 990k | 5.6 MB |
| [Nymph Preparing for the Bath](https://threedscans.com/lincoln/nymph/), John Gibson | `Nymph_Preparing_For_The_Bath.stl` | 533k | 3.2 MB |
| [Head of Saint John the Baptist on a Platter](https://threedscans.com/bode-museum/haupt-johannes-des-taufers-in-einer-schussel/), 1430 | `John_the_Baptist.obj` | 1.5M | 8.7 MB |
| [Neptune](https://threedscans.com/uncategorized/neptune-restored-by-iustinian-funie/), restored by Iustinian Funie | `Neptune_Iustinian_Funie.obj` | 2.7M → 1.5M | 8.7 MB |
| [Enfant au Chien](https://threedscans.com/uncategorized/enfant-au-chien-restored/), restored | `enfant_au_chien_threedscans.obj` | 2.2M → 1.5M | 8.3 MB |
| [Sleeping Venus](https://threedscans.com/uncategorized/sleeping-venus/) | `Sleeping Venus.obj` | 1.5M | 8.4 MB |
| [Statue of Resting Goat](https://threedscans.com/fondazione-torlonia/statue-of-resting-goat/) | `GOAT.obj` | 222k | 1.3 MB |
