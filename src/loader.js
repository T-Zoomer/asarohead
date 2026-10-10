// The loading animation: a plaster sphere with a lamp circling it, so the
// edge between light and shadow sweeps around the form, inside a ring that
// fills as the model downloads.

export function createLoader(el) {
  const canvas = el.querySelector('canvas');
  const ring = el.querySelector('.fill');
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const r = size / 2 - 1;
  const image = ctx.createImageData(size, size);
  const start = performance.now();
  let running = true;

  function draw(now) {
    if (!running) return;
    // The lamp circles at a little above the sphere's middle, passing behind it.
    const a = ((now - start) / 1000) * 1.6;
    const len = Math.hypot(1, 0.55);
    const [lx, ly, lz] = [Math.sin(a) / len, 0.55 / len, Math.cos(a) / len];
    const d = image.data;
    for (let py = 0; py < size; py++) {
      for (let px = 0; px < size; px++) {
        const i = (py * size + px) * 4;
        const nx = (px + 0.5 - size / 2) / r;
        const ny = -(py + 0.5 - size / 2) / r;
        const rr = nx * nx + ny * ny;
        if (rr >= 1) {
          d[i + 3] = 0;
          continue;
        }
        const nz = Math.sqrt(1 - rr);
        const lambert = Math.max(0, nx * lx + ny * ly + nz * lz);
        // Light bounced up from the floor keeps the shadow side from going
        // black, and with the lamp behind, a rim of light outlines the edge.
        const bounce = 0.08 * Math.max(0, -ny);
        const rim = 0.5 * Math.max(0, -lz) * (1 - nz) ** 3;
        const v = Math.round(255 * Math.min(1, 0.07 + bounce + rim + 0.88 * lambert));
        d[i] = d[i + 1] = v;
        d[i + 2] = Math.round(v * 0.97);
        d[i + 3] = Math.round(255 * Math.min(1, (1 - Math.sqrt(rr)) * r)); // antialiased rim
      }
    }
    ctx.putImageData(image, 0, 0);
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  return {
    // fraction from 0 to 1, or null when the download size is unknown.
    progress(fraction) {
      el.classList.toggle('indeterminate', fraction == null);
      ring.style.strokeDashoffset = String(100 - (fraction ?? 0) * 100);
    },
    // Gone at once, so it never sits over the model.
    finish() {
      running = false;
      el.remove();
    },
  };
}
