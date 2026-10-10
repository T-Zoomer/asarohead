// Shared steps of the convert scripts: reading source meshes, smooth normals,
// and writing a finished GLB (ambient occlusion baked, meshopt-compressed).

import { readFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { meshopt } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { bakeAO } from './ao.mjs';

// Lives in ao.mjs, which also runs in worker threads and so keeps no heavy imports.
export { computeNormals } from './ao.mjs';

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready, MeshoptSimplifier.ready]);
export { MeshoptSimplifier };

export const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });

// Reads an .stl or .obj into { positions: Float64Array (x, y, z per vertex),
// faces: Uint32Array (three vertex indices per triangle) }. Positions stay
// 64-bit, so callers that rotate and scale them round only once.
export function readMesh(path) {
  return String(path).toLowerCase().endsWith('.stl') ? readStl(path) : readObj(path);
}

function readObj(path) {
  const verts = [];
  const faces = [];
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (line.startsWith('v ')) {
      const [, x, y, z] = line.split(/\s+/).map(Number);
      verts.push(x, y, z);
    } else if (line.startsWith('f ')) {
      const idx = line.trim().split(/\s+/).slice(1).map((p) => parseInt(p, 10) - 1);
      for (let i = 1; i < idx.length - 1; i++) faces.push(idx[0], idx[i], idx[i + 1]);
    }
  }
  return { positions: new Float64Array(verts), faces: new Uint32Array(faces) };
}

// Binary STL stores three separate corners per triangle. Merge corners at the
// same position so the mesh is connected and its normals come out smooth.
// An open-addressing hash table on typed arrays keeps this lean enough for
// 10M-triangle scans.
function readStl(path) {
  const buf = readFileSync(path);
  const count = buf.readUInt32LE(80);
  const corners = count * 3;
  let size = 1;
  while (size < corners * 2) size *= 2;
  const table = new Int32Array(size).fill(-1);
  const positions = new Float64Array(corners * 3);
  const faces = new Uint32Array(corners);
  const v = new Float32Array(3);
  const bits = new Uint32Array(v.buffer);
  let n = 0;
  for (let i = 0; i < count; i++) {
    for (let k = 0; k < 3; k++) {
      const o = 84 + i * 50 + 12 + k * 12;
      v[0] = buf.readFloatLE(o);
      v[1] = buf.readFloatLE(o + 4);
      v[2] = buf.readFloatLE(o + 8);
      let h = Math.imul(bits[0], 0x9e3779b1) ^ Math.imul(bits[1], 0x85ebca77) ^ Math.imul(bits[2], 0xc2b2ae3d);
      h = (h ^ (h >>> 15)) & (size - 1);
      for (;;) {
        const j = table[h];
        if (j === -1) {
          table[h] = n;
          positions.set(v, n * 3);
          faces[i * 3 + k] = n++;
          break;
        }
        if (positions[j * 3] === v[0] && positions[j * 3 + 1] === v[1] && positions[j * 3 + 2] === v[2]) {
          faces[i * 3 + k] = j;
          break;
        }
        h = (h + 1) & (size - 1);
      }
    }
  }
  return { positions: positions.slice(0, n * 3), faces };
}

// A one-mesh document. normals and indices are optional.
export function createModel(name, { positions, normals, indices }) {
  const doc = new Document();
  const buffer = doc.createBuffer();
  const accessor = (type, array) => doc.createAccessor().setType(type).setArray(array).setBuffer(buffer);
  const prim = doc
    .createPrimitive()
    .setAttribute('POSITION', accessor('VEC3', positions))
    .setMaterial(doc.createMaterial('marble').setBaseColorFactor([0.9, 0.9, 0.88, 1]).setRoughnessFactor(0.9));
  if (normals) prim.setAttribute('NORMAL', accessor('VEC3', normals));
  if (indices) prim.setIndices(accessor('SCALAR', indices));
  doc.createScene().addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(prim)));
  return { doc, prim };
}

// Bakes ambient occlusion, compresses and writes the GLB to path (a URL).
export async function writeModel(doc, path) {
  await bakeAO(doc);
  await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  mkdirSync(dirname(path.pathname), { recursive: true });
  await io.write(path.pathname, doc);
}
