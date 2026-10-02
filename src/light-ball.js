// A small shaded sphere that shows, and sets, the key light direction as seen
// from the current camera. The inner disc covers lights in front of the head;
// the outer ring covers lights behind it (rim and back light).

const SPHERE = 0.64; // sphere radius as a fraction of the half-size
const RING = 0.96; // outer edge of the "behind" ring

export function createLightBall(canvas, { onChange }) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const half = size / 2;
  const sphereR = half * SPHERE;
  const ringR = half * RING;
  const image = ctx.createImageData(size, size);
  let dir = [0, 0, 1]; // view space: x right, y up, z toward the viewer

  function dirToPoint([x, y, z]) {
    const len = Math.hypot(x, y);
    if (z >= 0) return [x * sphereR, y * sphereR];
    const theta = Math.acos(Math.max(-1, Math.min(1, z)));
    const t = (theta - Math.PI / 2) / (Math.PI / 2);
    const d = sphereR + t * (ringR - sphereR);
    const [ux, uy] = len > 1e-6 ? [x / len, y / len] : [0, 1];
    return [ux * d, uy * d];
  }

  function pointToDir(px, py) {
    const d = Math.hypot(px, py);
    if (d <= sphereR) {
      const x = px / sphereR;
      const y = py / sphereR;
      return [x, y, Math.sqrt(Math.max(0, 1 - x * x - y * y))];
    }
    const t = Math.min(1, (d - sphereR) / (ringR - sphereR));
    const theta = Math.PI / 2 + t * (Math.PI / 2);
    const s = Math.sin(theta);
    return [(px / d) * s, (py / d) * s, Math.cos(theta)];
  }

  function draw() {
    const [lx, ly, lz] = dir;
    const px = image.data;
    for (let j = 0; j < size; j++) {
      for (let i = 0; i < size; i++) {
        const k = (j * size + i) * 4;
        const x = (i + 0.5 - half) / sphereR;
        const y = -(j + 0.5 - half) / sphereR;
        const r2 = x * x + y * y;
        if (r2 > 1) {
          px[k + 3] = 0;
          continue;
        }
        const z = Math.sqrt(1 - r2);
        const lambert = Math.max(0, x * lx + y * ly + z * lz);
        const v = 0.13 + 0.8 * lambert;
        const c = Math.round(255 * Math.pow(v, 1 / 2.2));
        px[k] = c;
        px[k + 1] = c;
        px[k + 2] = Math.round(c * 0.985);
        // soft edge
        px[k + 3] = Math.round(255 * Math.min(1, (1 - Math.sqrt(r2)) * sphereR));
      }
    }
    ctx.clearRect(0, 0, size, size);
    ctx.putImageData(image, 0, 0);

    // "behind" ring
    ctx.save();
    ctx.translate(half, half);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.setLineDash([3, 5]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, ringR - 1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // handle
    const [hx, hy] = dirToPoint(dir);
    const behind = dir[2] < 0;
    ctx.beginPath();
    ctx.arc(hx, -hy, 9, 0, Math.PI * 2);
    ctx.fillStyle = behind ? 'rgba(224, 165, 38, 0.5)' : '#e0a526';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#4a4b4f';
    ctx.stroke();
    ctx.restore();
  }

  function eventToDir(e) {
    const rect = canvas.getBoundingClientRect();
    const scale = size / rect.width;
    const px = (e.clientX - rect.left) * scale - half;
    const py = -((e.clientY - rect.top) * scale - half);
    return pointToDir(px, py);
  }

  let dragging = false;
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    canvas.setPointerCapture(e.pointerId);
    dir = eventToDir(e);
    draw();
    onChange(dir);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dir = eventToDir(e);
    draw();
    onChange(dir);
  });
  const end = () => (dragging = false);
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  // Arrow keys orbit the light around the view axis (left/right) and up/down.
  canvas.addEventListener('keydown', (e) => {
    const step = (e.shiftKey ? 15 : 5) * (Math.PI / 180);
    const [x, y, z] = dir;
    let az = Math.atan2(x, z);
    let el = Math.asin(Math.max(-1, Math.min(1, y)));
    if (e.key === 'ArrowLeft') az -= step;
    else if (e.key === 'ArrowRight') az += step;
    else if (e.key === 'ArrowUp') el = Math.min(Math.PI / 2 - 0.01, el + step);
    else if (e.key === 'ArrowDown') el = Math.max(-Math.PI / 2 + 0.01, el - step);
    else return;
    e.preventDefault();
    dir = [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)];
    draw();
    onChange(dir);
  });

  return {
    /** Update the display without firing onChange (e.g. when the camera moves). */
    set(viewDir) {
      if (viewDir.every((v, i) => Math.abs(v - dir[i]) < 1e-4)) return;
      dir = viewDir;
      draw();
    },
  };
}
