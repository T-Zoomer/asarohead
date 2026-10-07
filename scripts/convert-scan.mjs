// Converts sculpture scans from Three D Scans (https://threedscans.com) into
// web-ready GLBs in public/models/. Three D Scans publishes its scans free to
// use without copyright restrictions.
//
//   npm run convert:scan            # every scan below
//   npm run convert:scan -- nymph   # just one
//
// The source files are large (tens of MB) and stay out of git. Download them
// into "3d_model files/" under the names below.
//
// Each scan keeps its full resolution. Smooth normals are computed here from
// the full mesh, so the viewer shades it like the original.

import { readFileSync, mkdirSync } from 'node:fs';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';

// rotate maps a source vertex to y-up with the front of the sculpture
// facing +z. height is the model's height in scene units; the viewer frames
// each model by its size, so it only needs to be roughly comparable.
const SCANS = {
  napoleon: {
    // https://threedscans.com/nouveau-musee-national-de-monaco/napoleon-ler/
    src: 'NAPOLEON_fix.OBJ',
    // ZBrush export, upside down (up is -z) with the face toward -x.
    rotate: ([x, y, z]) => [y, -z, -x],
    height: 2.4,
  },
  nymph: {
    // https://threedscans.com/lincoln/nymph/
    src: 'Nymph_Preparing_For_The_Bath.stl',
    // Upside down (up is -y) with the front toward -z.
    rotate: ([x, y, z]) => [x, -y, -z],
    height: 3,
  },
  'john-baptist': {
    // https://threedscans.com/bode-museum/haupt-johannes-des-taufers-in-einer-schussel/
    src: 'John_the_Baptist.obj',
    // Z-up (the platter lies on z = 0) with the face toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 1.2,
  },
};

const SRC_DIR = new URL('../3d_model files/', import.meta.url);
const OUT_DIR = new URL('../public/models/', import.meta.url);

// Returns { verts: [[x, y, z], ...], faces: [a, b, c, ...] }.
function readObj(path) {
  const verts = [];
  const faces = [];
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (line.startsWith('v ')) {
      const [, x, y, z] = line.split(/\s+/).map(Number);
      verts.push([x, y, z]);
    } else if (line.startsWith('f ')) {
      const idx = line.trim().split(/\s+/).slice(1).map((p) => parseInt(p, 10) - 1);
      for (let i = 1; i < idx.length - 1; i++) faces.push(idx[0], idx[i], idx[i + 1]);
    }
  }
  return { verts, faces };
}

// Binary STL stores three separate corners per triangle. Merge corners at the
// same position so the mesh is connected and its normals come out smooth.
function readStl(path) {
  const buf = readFileSync(path);
  const count = buf.readUInt32LE(80);
  const ids = new Map();
  const verts = [];
  const faces = [];
  for (let i = 0; i < count; i++) {
    const o = 84 + i * 50 + 12;
    for (let k = 0; k < 3; k++) {
      const v = [buf.readFloatLE(o + k * 12), buf.readFloatLE(o + k * 12 + 4), buf.readFloatLE(o + k * 12 + 8)];
      const key = v.join(',');
      if (!ids.has(key)) {
        ids.set(key, verts.length);
        verts.push(v);
      }
      faces.push(ids.get(key));
    }
  }
  return { verts, faces };
}

async function convert(name, scan) {
  const path = new URL(scan.src, SRC_DIR);
  const { verts, faces } = scan.src.toLowerCase().endsWith('.stl') ? readStl(path) : readObj(path);
  const rotated = verts.map(scan.rotate);

  // Center on x and z, stand the base on y = 0, scale to the target height.
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const v of rotated) for (let k = 0; k < 3; k++) {
    min[k] = Math.min(min[k], v[k]);
    max[k] = Math.max(max[k], v[k]);
  }
  const scale = scan.height / (max[1] - min[1]);
  const offset = [-(min[0] + max[0]) / 2, -min[1], -(min[2] + max[2]) / 2];
  const positions = new Float32Array(rotated.length * 3);
  rotated.forEach((v, i) => {
    for (let k = 0; k < 3; k++) positions[i * 3 + k] = (v[k] + offset[k]) * scale;
  });

  // Area-weighted smooth normals: the unnormalized cross product makes
  // larger faces count for more.
  const normals = new Float32Array(positions.length);
  let volume = 0;
  for (let f = 0; f < faces.length; f += 3) {
    const [a, b, c] = [faces[f] * 3, faces[f + 1] * 3, faces[f + 2] * 3];
    const e1 = [positions[b] - positions[a], positions[b + 1] - positions[a + 1], positions[b + 2] - positions[a + 2]];
    const e2 = [positions[c] - positions[a], positions[c + 1] - positions[a + 1], positions[c + 2] - positions[a + 2]];
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    for (const v of [a, b, c]) for (let k = 0; k < 3; k++) normals[v + k] += n[k];
    volume += positions[a] * n[0] + positions[a + 1] * n[1] + positions[a + 2] * n[2];
  }
  for (let i = 0; i < normals.length; i += 3) {
    const len = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1;
    for (let k = 0; k < 3; k++) normals[i + k] /= len;
  }
  // A negative signed volume means the triangles wind inside out.
  if (volume < 0) console.warn(`${name}: triangles wind inward, the model will render inside out`);

  const doc = new Document();
  const buffer = doc.createBuffer();
  const prim = doc
    .createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(positions).setBuffer(buffer))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(normals).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(faces)).setBuffer(buffer))
    .setMaterial(doc.createMaterial('marble').setBaseColorFactor([0.9, 0.9, 0.88, 1]).setRoughnessFactor(0.9));
  doc.createScene().addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(prim)));

  await doc.transform(dedup(), prune(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));

  const out = new URL(`${name}.glb`, OUT_DIR);
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
  await io.write(out.pathname, doc);
  console.log(`${name}: ${faces.length / 3} tris -> ${out.pathname}`);
}

await MeshoptEncoder.ready;
mkdirSync(OUT_DIR, { recursive: true });
const names = process.argv.slice(2);
for (const name of names.length ? names : Object.keys(SCANS)) {
  if (!SCANS[name]) throw new Error(`Unknown scan "${name}". Known: ${Object.keys(SCANS).join(', ')}`);
  await convert(name, SCANS[name]);
}
