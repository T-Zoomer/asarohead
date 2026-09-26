// Converts the printable Asaro head STL parts (model-src/) into a single
// web-ready GLB (public/models/asaro-head.glb).
//
// Source: "Asaro Head" by AgentSCAD, https://www.thingiverse.com/thing:7287701
// License: CC BY-SA. The output GLB is a derivative and stays CC BY-SA.
//
// The print files are laid flat on the build plate, so this script
// reassembles them: the back half is flipped onto the front half, and the
// ears are rotated into the sockets on either side of the head.

import { readFileSync, mkdirSync } from 'node:fs';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, simplify, dedup, prune, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

const SRC = new URL('../model-src/', import.meta.url);
const OUT = new URL('../public/models/asaro-head.glb', import.meta.url);
const MM_TO_UNITS = 0.01; // 180 mm head -> 1.8 units

function readStl(name) {
  const buf = readFileSync(new URL(name, SRC));
  const count = buf.readUInt32LE(80);
  const tris = [];
  for (let i = 0; i < count; i++) {
    const o = 84 + i * 50 + 12;
    const t = [];
    for (let k = 0; k < 9; k++) t.push(buf.readFloatLE(o + k * 4));
    tris.push(t);
  }
  return tris;
}

// Apply fn(x, y, z) -> [x, y, z] to every vertex; flip winding if mirrored.
function transform(tris, fn, mirrored = false) {
  return tris.map((t) => {
    const a = fn(t[0], t[1], t[2]);
    const b = fn(t[3], t[4], t[5]);
    const c = fn(t[6], t[7], t[8]);
    return mirrored ? [...a, ...c, ...b] : [...a, ...b, ...c];
  });
}

// Each half is a closed solid with a flat cap on its cut plane. The caps end
// up inside the assembled head, so drop them and join the open borders.
const onPlane = (t, z) => Math.abs(t[2] - z) < 0.005 && Math.abs(t[5] - z) < 0.005 && Math.abs(t[8] - z) < 0.005;
// Vertices this close to the cut are seam vertices; put them exactly on it.
const toSeam = (z) => (Math.abs(z) < 0.03 ? 0 : z);

// Front half: face points +z, cap at z = 0.021. Center it on x.
const front = transform(
  readStl('Asaro-HeadFront.stl').filter((t) => !onPlane(t, 0.021)),
  (x, y, z) => [x + 160.1134, y, toSeam(z - 0.021)],
);
// Back half: rotated 180° about x and offset ~100 mm on the plate, cap at z = -0.001.
const back = transform(
  readStl('Asaro-HeadBack.stl').filter((t) => !onPlane(t, -0.001)),
  (x, y, z) => [x + 60, -y, toSeam(-(z + 0.001))],
);
const shell = [...front, ...back];

// Ears lie on their backs with the lobe pointing +y. Seating one: ear z ->
// head x (out from the skull), ear y flipped so the lobe hangs down, ear x ->
// head -z so the helix runs along the back. The flip mirrors the ear, so the
// +x ear needs its winding reversed; the -x ear mirrors it back.
const EAR_SOCKET_X = 40;
const rightEarSrc = readStl('Asaro-Ears.stl').filter((t) => (t[0] + t[3] + t[6]) / 3 > 10);
const rightEar = transform(rightEarSrc, (x, y, z) => [EAR_SOCKET_X + z, 56 - y, 23 - x], true);
const leftEar = transform(rightEarSrc, (x, y, z) => [-(EAR_SOCKET_X + z), 56 - y, 23 - x]);

const all = [...shell, ...rightEar, ...leftEar];

// Bottom of the neck at y = 0, so the model stands on the ground plane.
let minY = Infinity;
for (const t of all) minY = Math.min(minY, t[1], t[4], t[7]);

// Snap to a 1 µm grid so vertices on the seam between the two halves are
// bit-identical and weld() stitches them into one closed surface.
const snap = (n) => Math.round(n * 1000) / 1000;
const positions = new Float32Array(all.length * 9);
all.forEach((t, i) => {
  for (let v = 0; v < 3; v++) {
    positions[i * 9 + v * 3 + 0] = snap(t[v * 3 + 0]) * MM_TO_UNITS;
    positions[i * 9 + v * 3 + 1] = snap(t[v * 3 + 1] - minY) * MM_TO_UNITS;
    positions[i * 9 + v * 3 + 2] = snap(t[v * 3 + 2]) * MM_TO_UNITS;
  }
});

// The halves are tessellated differently along the cut, so their border
// vertices don't line up (T-junctions) and weld() alone leaves a crack.
// Split each open edge at every other open vertex lying on it.
function stitchTJunctions(flat, eps = 2e-4) {
  const ids = new Map();
  const verts = [];
  const indexOf = (i) => {
    const k = `${flat[i]},${flat[i + 1]},${flat[i + 2]}`;
    if (!ids.has(k)) {
      ids.set(k, verts.length);
      verts.push([flat[i], flat[i + 1], flat[i + 2]]);
    }
    return ids.get(k);
  };
  let tris = [];
  for (let i = 0; i < flat.length; i += 9) tris.push([indexOf(i), indexOf(i + 3), indexOf(i + 6)]);

  const edgeKey = (a, b) => (a < b ? `${a}_${b}` : `${b}_${a}`);
  const counts = new Map();
  for (const t of tris) for (let k = 0; k < 3; k++) {
    const e = edgeKey(t[k], t[(k + 1) % 3]);
    counts.set(e, (counts.get(e) ?? 0) + 1);
  }
  const openVerts = new Set();
  for (const [e, c] of counts) if (c === 1) e.split('_').forEach((v) => openVerts.add(Number(v)));
  let open = [...openVerts];

  // Border vertices that nearly coincide (< eps) become one vertex.
  const remap = new Map();
  for (let i = 0; i < open.length; i++) {
    const a = open[i];
    if (remap.has(a)) continue;
    for (let j = i + 1; j < open.length; j++) {
      const b = open[j];
      if (remap.has(b)) continue;
      const [dx, dy, dz] = [verts[a][0] - verts[b][0], verts[a][1] - verts[b][1], verts[a][2] - verts[b][2]];
      if (dx * dx + dy * dy + dz * dz < eps * eps) remap.set(b, a);
    }
  }
  tris = tris.map((t) => t.map((v) => remap.get(v) ?? v)).filter((t) => t[0] !== t[1] && t[1] !== t[2] && t[0] !== t[2]);
  open = open.filter((v) => !remap.has(v));
  counts.clear();
  for (const t of tris) for (let k = 0; k < 3; k++) {
    const e = edgeKey(t[k], t[(k + 1) % 3]);
    counts.set(e, (counts.get(e) ?? 0) + 1);
  }

  let splits = 0;
  const out = [];
  for (const t of tris) {
    let poly = [t[0]];
    for (let k = 0; k < 3; k++) {
      const a = t[k];
      const b = t[(k + 1) % 3];
      if (counts.get(edgeKey(a, b)) === 1) {
        const [ax, ay, az] = verts[a];
        const [dx, dy, dz] = [verts[b][0] - ax, verts[b][1] - ay, verts[b][2] - az];
        const len2 = dx * dx + dy * dy + dz * dz;
        const onEdge = [];
        for (const v of open) {
          if (v === a || v === b) continue;
          const [px, py, pz] = [verts[v][0] - ax, verts[v][1] - ay, verts[v][2] - az];
          const s = (px * dx + py * dy + pz * dz) / len2;
          if (s <= 1e-6 || s >= 1 - 1e-6) continue;
          const [qx, qy, qz] = [px - s * dx, py - s * dy, pz - s * dz];
          if (qx * qx + qy * qy + qz * qz < eps * eps) onEdge.push([s, v]);
        }
        onEdge.sort((p, q) => p[0] - q[0]).forEach(([, v]) => poly.push(v));
        splits += onEdge.length;
      }
      if (k < 2) poly.push(b);
    }
    // Fan from the corner opposite edge a-b. Points added on the other two
    // edges only produce zero-area slivers, which simplify() removes.
    if (poly.length === 3) out.push(poly);
    else {
      const c = poly.indexOf(t[2]);
      poly = [...poly.slice(c), ...poly.slice(0, c)];
      for (let i = 1; i < poly.length - 1; i++) out.push([poly[0], poly[i], poly[i + 1]]);
    }
  }
  tris = out;
  const result = new Float32Array(tris.length * 9);
  tris.forEach((t, i) => t.forEach((v, k) => result.set(verts[v], i * 9 + k * 3)));
  console.log(`seam: merged ${remap.size} vertices, split ${splits} T-junctions`);
  return result;
}

const stitched = stitchTJunctions(positions);

const doc = new Document();
const buffer = doc.createBuffer();
const position = doc.createAccessor().setType('VEC3').setArray(stitched).setBuffer(buffer);
const material = doc.createMaterial('plaster').setBaseColorFactor([0.9, 0.9, 0.88, 1]).setRoughnessFactor(0.9);
const prim = doc.createPrimitive().setAttribute('POSITION', position).setMaterial(material);
const mesh = doc.createMesh('AsaroHead').addPrimitive(prim);
doc.createScene().addChild(doc.createNode('AsaroHead').setMesh(mesh));

await MeshoptSimplifier.ready;
await MeshoptEncoder.ready;
await doc.transform(
  weld(),
  // The planes are flat but densely tessellated; a tight error bound keeps
  // every plane edge while removing most of the redundant triangles.
  simplify({ simplifier: MeshoptSimplifier, ratio: 0, error: 0.0004, lockBorder: true }),
  dedup(),
  prune(),
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
);

const triCount = prim.getIndices().getCount() / 3;
mkdirSync(new URL('../public/models/', import.meta.url), { recursive: true });
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
await io.write(OUT.pathname, doc);
console.log(`input ${all.length} tris -> output ${triCount} tris -> ${OUT.pathname}`);
