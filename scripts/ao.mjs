// Bakes ambient occlusion into a model as a per-vertex _AO attribute
// (0 = fully enclosed, 1 = open sky). The viewer uses it to darken only the
// ambient and environment light, so eye sockets, nostrils, folds and the
// gaps between limbs read as darker accents inside the shadow mass, while
// the key light and its cast shadows stay exact.
//
//   npm run bake:ao            # every GLB in public/models/
//   npm run bake:ao -- nymph   # just one
//
// The convert scripts call bakeAO() themselves, so this command is for
// re-baking existing models (for example after changing the settings below).
//
// Each vertex casts RAYS rays over its hemisphere, cosine-weighted, and a
// hit closer than RADIUS (a fraction of the model's largest side) occludes
// it, more so the closer it is. Rays are spread over worker threads.

import { availableParallelism } from 'node:os';
import { Worker, isMainThread, workerData, parentPort } from 'node:worker_threads';

const RAYS = 64;
const RADIUS = 0.1;
// Neighbour-averaging passes that smooth out sampling noise.
const SMOOTH = 2;

if (!isMainThread && workerData?.ao) runWorker(workerData);

// Adds _AO to every primitive in doc. Positions and normals must be plain
// floats (call dequantize() first on a compressed file).
export async function bakeAO(doc) {
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const matrix = node.getWorldMatrix();
    for (const prim of mesh.listPrimitives()) {
      const posAttr = prim.getAttribute('POSITION');
      const normAttr = prim.getAttribute('NORMAL');
      const count = posAttr.getCount();
      const positions = new Float32Array(new SharedArrayBuffer(count * 12));
      const normals = new Float32Array(new SharedArrayBuffer(count * 12));
      const p = [0, 0, 0];
      const n = [0, 0, 0];
      for (let i = 0; i < count; i++) {
        posAttr.getElement(i, p);
        // World space: node matrices here are translation plus uniform scale
        // (from quantization), so normals need no transform.
        for (let k = 0; k < 3; k++) positions[i * 3 + k] = matrix[k] * p[0] + matrix[4 + k] * p[1] + matrix[8 + k] * p[2] + matrix[12 + k];
        if (normAttr) normAttr.getElement(i, n);
        const len = Math.hypot(n[0], n[1], n[2]) || 1;
        for (let k = 0; k < 3; k++) normals[i * 3 + k] = n[k] / len;
      }
      const indexArray = prim.getIndices()?.getArray() ?? Uint32Array.from({ length: count }, (_, i) => i);
      const index = new Uint32Array(new SharedArrayBuffer(indexArray.length * 4));
      index.set(indexArray);
      if (!normAttr) computeNormals(positions, index, normals);

      const ao = smooth(await occlusion(positions, normals, index), index, SMOOTH);
      const bytes = new Uint8Array(count);
      for (let i = 0; i < count; i++) bytes[i] = Math.round(ao[i] * 255);
      const buffer = doc.getRoot().listBuffers()[0];
      prim.setAttribute('_AO', doc.createAccessor().setType('SCALAR').setArray(bytes).setNormalized(true).setBuffer(buffer));
    }
  }
}

async function occlusion(positions, normals, index) {
  const count = positions.length / 3;
  const ao = new Float32Array(new SharedArrayBuffer(count * 4));
  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], positions[i + k]);
      max[k] = Math.max(max[k], positions[i + k]);
    }
  }
  const size = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
  const threads = Math.max(1, availableParallelism() - 1);
  const chunk = Math.ceil(count / threads);
  await Promise.all(
    Array.from({ length: threads }, (_, t) => {
      const worker = new Worker(new URL(import.meta.url), {
        workerData: { ao, positions, normals, index, size, start: t * chunk, end: Math.min(count, (t + 1) * chunk) },
      });
      return new Promise((resolve, reject) => {
        worker.once('message', resolve);
        worker.once('error', reject);
      });
    }),
  );
  return ao;
}

async function runWorker({ ao, positions, normals, index, size, start, end }) {
  const { BufferGeometry, BufferAttribute, Ray, Vector3, DoubleSide } = await import('three');
  const { MeshBVH } = await import('three-mesh-bvh');
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  // MeshBVH reorders the index while it builds, so each worker needs its own.
  geometry.setIndex(new BufferAttribute(Uint32Array.from(index), 1));
  const bvh = new MeshBVH(geometry);

  const radius = RADIUS * size;
  // Start rays just off the surface and ignore hits right at the start, so a
  // vertex doesn't occlude itself on its own neighbouring triangles.
  const offset = 2e-4 * size;
  const near = 5e-4 * size;
  const ray = new Ray();
  const n = new Vector3();
  const t1 = new Vector3();
  const t2 = new Vector3();

  // Fixed cosine-weighted directions on the unit hemisphere (z up), spread
  // with a golden-angle spiral; each vertex turns them by a random angle.
  const dirs = [];
  for (let s = 0; s < RAYS; s++) {
    const r = Math.sqrt((s + 0.5) / RAYS);
    const phi = s * 2.399963229728653;
    dirs.push([r * Math.cos(phi), r * Math.sin(phi), Math.sqrt(1 - r * r)]);
  }

  for (let i = start; i < end; i++) {
    n.fromArray(normals, i * 3);
    // Tangent frame around the normal.
    t1.set(Math.abs(n.x) < 0.9 ? 1 : 0, Math.abs(n.x) < 0.9 ? 0 : 1, 0).cross(n).normalize();
    t2.crossVectors(n, t1);
    const turn = Math.random() * Math.PI * 2;
    const c = Math.cos(turn);
    const s = Math.sin(turn);
    let blocked = 0;
    for (const [dx, dy, dz] of dirs) {
      const x = dx * c - dy * s;
      const y = dx * s + dy * c;
      ray.direction.set(t1.x * x + t2.x * y + n.x * dz, t1.y * x + t2.y * y + n.y * dz, t1.z * x + t2.z * y + n.z * dz);
      ray.origin.fromArray(positions, i * 3).addScaledVector(n, offset);
      const hit = bvh.raycastFirst(ray, DoubleSide, near, radius);
      if (hit) blocked += 1 - hit.distance / radius;
    }
    ao[i] = 1 - blocked / RAYS;
  }
  parentPort.postMessage(true);
}

// Averages each vertex with its neighbours `passes` times.
function smooth(ao, index, passes) {
  let src = Float32Array.from(ao);
  for (let p = 0; p < passes; p++) {
    const sum = Float32Array.from(src);
    const weight = new Float32Array(src.length).fill(1);
    for (let f = 0; f < index.length; f += 3) {
      for (let k = 0; k < 3; k++) {
        const a = index[f + k];
        const b = index[f + ((k + 1) % 3)];
        sum[a] += src[b];
        weight[a]++;
        sum[b] += src[a];
        weight[b]++;
      }
    }
    for (let i = 0; i < src.length; i++) sum[i] /= weight[i];
    src = sum;
  }
  return src;
}

function computeNormals(positions, index, normals) {
  for (let f = 0; f < index.length; f += 3) {
    const [a, b, c] = [index[f] * 3, index[f + 1] * 3, index[f + 2] * 3];
    const e1 = [positions[b] - positions[a], positions[b + 1] - positions[a + 1], positions[b + 2] - positions[a + 2]];
    const e2 = [positions[c] - positions[a], positions[c + 1] - positions[a + 1], positions[c + 2] - positions[a + 2]];
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    for (const v of [a, b, c]) for (let k = 0; k < 3; k++) normals[v + k] += n[k];
  }
  for (let i = 0; i < normals.length; i += 3) {
    const len = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1;
    for (let k = 0; k < 3; k++) normals[i + k] /= len;
  }
}

// CLI: re-bake GLBs in place.
if (isMainThread && process.argv[1] === new URL(import.meta.url).pathname) {
  const { readdirSync } = await import('node:fs');
  const { NodeIO } = await import('@gltf-transform/core');
  const { ALL_EXTENSIONS } = await import('@gltf-transform/extensions');
  const { dequantize, meshopt } = await import('@gltf-transform/functions');
  const { MeshoptEncoder, MeshoptDecoder } = await import('meshoptimizer');
  await MeshoptEncoder.ready;
  await MeshoptDecoder.ready;
  const dir = new URL('../public/models/', import.meta.url);
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
  const names = process.argv.slice(2);
  const files = readdirSync(dir).filter((f) => f.endsWith('.glb') && (!names.length || names.includes(f.slice(0, -4))));
  for (const file of files) {
    const started = Date.now();
    const path = new URL(file, dir).pathname;
    const doc = await io.read(path);
    await doc.transform(dequantize());
    await bakeAO(doc);
    await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
    await io.write(path, doc);
    console.log(`${file}: baked in ${((Date.now() - started) / 1000).toFixed(1)} s`);
  }
}
