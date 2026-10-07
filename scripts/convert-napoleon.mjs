// Converts the Napoleon bust scan (3d_model files/NAPOLEON_fix.OBJ) into a
// web-ready GLB (public/models/napoleon.glb).
//
// Source: "Napoléon Ier" by François Joseph Bosio, Nouveau Musée National de
// Monaco. Scan from Three D Scans, https://threedscans.com/nouveau-musee-national-de-monaco/napoleon-ler/
// Three D Scans publishes its scans free to use without copyright restrictions.
//
// The OBJ is a 1M-triangle ZBrush export, upside down (up is -z) with the
// face toward -x. This stands it upright facing +z and simplifies it.

import { readFileSync, mkdirSync } from 'node:fs';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, simplify, dedup, prune, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

const SRC = new URL('../3d_model files/NAPOLEON_fix.OBJ', import.meta.url);
const OUT = new URL('../public/models/napoleon.glb', import.meta.url);
const HEIGHT = 2.4; // units, base of the bust to the top of the head
const TARGET_TRIS = 300000;

const verts = [];
const faces = [];
for (const line of readFileSync(SRC, 'utf8').split('\n')) {
  if (line.startsWith('v ')) {
    const [, x, y, z] = line.split(/\s+/).map(Number);
    // Rotation: source y -> x, -z -> y (up), -x -> z (toward the face).
    verts.push([y, -z, -x]);
  } else if (line.startsWith('f ')) {
    const idx = line.trim().split(/\s+/).slice(1).map((p) => parseInt(p, 10) - 1);
    for (let i = 1; i < idx.length - 1; i++) faces.push(idx[0], idx[i], idx[i + 1]);
  }
}

// Center on x and z, stand the base on y = 0, scale to HEIGHT.
const min = [Infinity, Infinity, Infinity];
const max = [-Infinity, -Infinity, -Infinity];
for (const v of verts) for (let k = 0; k < 3; k++) {
  min[k] = Math.min(min[k], v[k]);
  max[k] = Math.max(max[k], v[k]);
}
const scale = HEIGHT / (max[1] - min[1]);
const offset = [-(min[0] + max[0]) / 2, -min[1], -(min[2] + max[2]) / 2];
const positions = new Float32Array(verts.length * 3);
verts.forEach((v, i) => {
  for (let k = 0; k < 3; k++) positions[i * 3 + k] = (v[k] + offset[k]) * scale;
});

// Smooth normals from the full-resolution scan. simplify() keeps a subset of
// the original vertices, so they carry these normals with them and the
// simplified mesh shades like the original instead of showing its coarser
// triangles.
const normals = new Float32Array(positions.length);
for (let f = 0; f < faces.length; f += 3) {
  const [a, b, c] = [faces[f] * 3, faces[f + 1] * 3, faces[f + 2] * 3];
  const e1 = [positions[b] - positions[a], positions[b + 1] - positions[a + 1], positions[b + 2] - positions[a + 2]];
  const e2 = [positions[c] - positions[a], positions[c + 1] - positions[a + 1], positions[c + 2] - positions[a + 2]];
  // Cross product, unnormalized, so larger faces count for more.
  const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
  for (const v of [a, b, c]) for (let k = 0; k < 3; k++) normals[v + k] += n[k];
}
for (let i = 0; i < normals.length; i += 3) {
  const len = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1;
  for (let k = 0; k < 3; k++) normals[i + k] /= len;
}

const doc = new Document();
const buffer = doc.createBuffer();
const position = doc.createAccessor().setType('VEC3').setArray(positions).setBuffer(buffer);
const normal = doc.createAccessor().setType('VEC3').setArray(normals).setBuffer(buffer);
const indices = doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(faces)).setBuffer(buffer);
const material = doc.createMaterial('marble').setBaseColorFactor([0.9, 0.9, 0.88, 1]).setRoughnessFactor(0.9);
const prim = doc.createPrimitive().setAttribute('POSITION', position).setAttribute('NORMAL', normal).setIndices(indices).setMaterial(material);
const mesh = doc.createMesh('Napoleon').addPrimitive(prim);
doc.createScene().addChild(doc.createNode('Napoleon').setMesh(mesh));

await MeshoptSimplifier.ready;
await MeshoptEncoder.ready;
await doc.transform(
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: TARGET_TRIS / (faces.length / 3), error: 0.01 }),
  dedup(),
  prune(),
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
);

const triCount = prim.getIndices().getCount() / 3;
mkdirSync(new URL('../public/models/', import.meta.url), { recursive: true });
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
await io.write(OUT.pathname, doc);
console.log(`input ${faces.length / 3} tris -> output ${triCount} tris -> ${OUT.pathname}`);
