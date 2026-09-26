# Asaro head

A 3D Asaro planar head in the browser, for drawing reference. Turn it, light
it, and draw from it.

- **Turn the head:** drag to orbit, scroll to zoom, right-drag to pan.
- **Move the light:** drag the bright spot on the ball in the top right. The
  outer ring puts the light behind the head.

## Develop

```sh
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/
```

`dist/` is a plain static site. It deploys as-is to Netlify, Vercel,
GitHub Pages or Cloudflare Pages.

Canonical links, share previews, `robots.txt` and `sitemap.xml` use the
site's public address. It defaults to `https://asarohead.com`; build with
`SITE_URL=https://your-domain npm run build` to change it, or edit the
default in `vite.config.js`.

## The model

"Asaro Head" by AgentSCAD
([Thingiverse 7287701](https://www.thingiverse.com/thing:7287701)),
licensed **CC BY-SA**. The original print files are in `model-src/`.
`npm run convert` reassembles them into `public/models/asaro-head.glb`. It
flips the back half onto the front, stitches the seam, seats the ears in
their sockets, and simplifies the result from 239k to about 6k triangles
(26 KB). The GLB is a derivative and stays under CC BY-SA. Keep the credit
in the page footer if you deploy this.
