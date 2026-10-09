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
// Scans keep their full resolution up to MAX_TRIS; larger ones are
// simplified to it. Smooth normals are computed from the full mesh first, so
// the viewer shades every model like the original scan.

import { readFileSync, mkdirSync } from 'node:fs';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, meshopt, simplify, weld } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

// Above this, files pass 10 MB and load slowly; with full-resolution normals
// the simplified mesh looks the same.
const MAX_TRIS = 1_500_000;

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
  neptune: {
    // https://threedscans.com/uncategorized/neptune-restored-by-iustinian-funie/
    src: 'Neptune_Iustinian_Funie.obj',
    // Z-up with the front toward +y.
    rotate: ([x, y, z]) => [-x, z, y],
    height: 3.5,
  },
  enfant: {
    // https://threedscans.com/uncategorized/enfant-au-chien-restored/
    src: 'enfant_au_chien_threedscans.obj',
    // Z-up with the front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  venus: {
    // https://threedscans.com/uncategorized/sleeping-venus/
    src: 'Sleeping Venus.obj',
    // Z-up with the front toward -y; she reclines along x.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 1.2,
  },
  goat: {
    // https://threedscans.com/fondazione-torlonia/statue-of-resting-goat/
    src: 'GOAT.obj',
    // Already y-up, lying along x with the head toward -x.
    rotate: ([x, y, z]) => [x, y, z],
    height: 1.2,
  },
  'triton': {
    // https://threedscans.com/ferdinandeum-innsbruck/triton/
    src: '200720_Triton 2.OBJ',
    // Upside down (up is -y), front toward -z.
    rotate: ([x, y, z]) => [x, -y, -z],
    height: 2,
  },
  'oceanus': {
    // https://threedscans.com/ferdinandeum-innsbruck/oceanus/
    src: 'Oceanus100.stl',
    // Upside down (up is -y), front toward -z.
    rotate: ([x, y, z]) => [x, -y, -z],
    height: 2,
  },
  'aphrodite': {
    // https://threedscans.com/lincoln/aphrodite/
    src: 'aphrodite.stl',
    // Upside down (up is -y), front toward -z.
    rotate: ([x, y, z]) => [x, -y, -z],
    height: 2,
  },
  'child-goose': {
    // https://threedscans.com/institut-fur-klassische-archaologie/child-with-goose/
    src: 'Child_with_goose.obj',
    // Already y-up, facing +z.
    rotate: ([x, y, z]) => [x, y, z],
    height: 2,
  },
  'einstein': {
    // https://threedscans.com/lincoln/einstein/
    src: 'Einstein.stl',
    // Upside down (up is -y), front toward -z.
    rotate: ([x, y, z]) => [x, -y, -z],
    height: 2,
  },
  'elssler-foot': {
    // https://threedscans.com/theater-museum/fanny-elssler/
    src: 'Fuß-Fanny-Elssler_mehr_Details-50T.stl',
    // Up is -z.
    rotate: ([x, y, z]) => [x, -z, y],
    height: 2,
  },
  'drame-au-desert': {
    // https://threedscans.com/depot-des-sculptures-de-la-ville-de-paris/drameaudesert/
    src: 'Georges Gardet.OBJ',
    // Upside down (up is -y).
    rotate: ([x, y, z]) => [x, -y, -z],
    height: 2,
  },
  'hounds': {
    // https://threedscans.com/depot-des-sculptures-de-la-ville-de-paris/deuxchiensdemeutealattache/
    src: 'Georges Lucien Vacossin.OBJ',
    // Y-up, front toward +x.
    rotate: ([x, y, z]) => [-z, y, x],
    height: 2,
  },
  'hermes': {
    // https://threedscans.com/vienna/hermes-fastening-his-sandals/
    src: 'hermes.OBJ',
    // Already y-up, facing +z.
    rotate: ([x, y, z]) => [x, y, z],
    height: 2,
  },
  'horse-head': {
    // https://threedscans.com/museo-archeologico-nazionale/horse/
    src: 'Horse_Head.obj',
    // Upside down (up is -y), front toward +x.
    rotate: ([x, y, z]) => [z, -y, x],
    height: 2,
  },
  'jungling': {
    // https://threedscans.com/kunsthistorisches-museum-wien/jungling/
    src: 'Jüngling_Vom_Magdalensberg.obj',
    // Y-up, front toward +x.
    rotate: ([x, y, z]) => [-z, y, x],
    height: 2,
  },
  'marble-player': {
    // https://threedscans.com/lincoln/marble-player/
    src: 'Marble_Player.stl',
    // Upside down (up is -y), front toward -z.
    rotate: ([x, y, z]) => [x, -y, -z],
    height: 2,
  },
  'mars': {
    // https://threedscans.com/lincoln/mars/
    src: 'Mars.stl',
    // Upside down (up is -y), front toward -z.
    rotate: ([x, y, z]) => [x, -y, -z],
    height: 2,
  },
  'mercury': {
    // https://threedscans.com/lincoln/mercury/
    src: 'Mercury.stl',
    // Y-up, front toward -z.
    rotate: ([x, y, z]) => [-x, y, -z],
    height: 2,
  },
  'napoleon-chaudet': {
    // https://threedscans.com/lincoln/napoleon/
    src: 'Napoleon.stl',
    // Upside down (up is -y), front toward -z.
    rotate: ([x, y, z]) => [x, -y, -z],
    height: 2,
  },
  'salmacis': {
    // https://threedscans.com/nouveau-musee-national-de-monaco/la-nymphe-salmacis/
    src: 'NYMPH_fix1.OBJ',
    // Already y-up, facing +z.
    rotate: ([x, y, z]) => [x, y, z],
    height: 2,
  },
  'photosculpture': {
    // https://threedscans.com/musee-carnavalet/delaunay-photosculpture/
    src: 'Photosculpture.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'shepherd-boy': {
    // https://threedscans.com/walker-art-gallery/sleeping-shepherd-boy/
    src: 'shepherd-boy.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'tennyson': {
    // https://threedscans.com/lincoln/tennyson/
    src: 'Tennyson_Bust_Plaster.stl',
    // Upside down (up is -y), front toward +z.
    rotate: ([x, y, z]) => [-x, -y, z],
    height: 2,
  },
  'hunter': {
    // https://threedscans.com/lincoln/hunter-and-dog/
    src: 'The_Hunter_And_His_Dog.stl',
    // Upside down (up is -y), front toward +x.
    rotate: ([x, y, z]) => [z, -y, x],
    height: 2,
  },
  'boy-with-thorn': {
    // https://threedscans.com/institut-fur-klassische-archaologie/boy-with-thorn/
    src: 'Thorne.obj',
    // Y-up, front toward -z.
    rotate: ([x, y, z]) => [-x, y, -z],
    height: 2,
  },
  'venus-cupid': {
    // https://threedscans.com/lincoln/venus-and-cupid/
    src: 'Venus_Kissing_Cupid.stl',
    // Upside down (up is -y), front toward -z.
    rotate: ([x, y, z]) => [x, -y, -z],
    height: 2,
  },
  rhino: {
    // https://threedscans.com/depot-des-sculptures-de-la-ville-de-paris/rhino/
    src: 'Alfred Jacquemart.OBJ',
    // Upside down along z (the base is at +z), head toward -y.
    rotate: ([x, y, z]) => [-x, -z, -y],
    height: 2,
  },
  eagle: {
    // https://threedscans.com/saint-louis-art-museum/striding-eagle/
    src: 'Eagle_custom_Normals.obj',
    // Y-up, front toward +x.
    rotate: ([x, y, z]) => [-z, y, x],
    height: 2,
  },
  ephebe: {
    // https://threedscans.com/museo-archeologico-nazionale/efebo/
    src: 'Ephebe.obj',
    // Scanned tilted about 46° off any axis. This rotation takes the normal
    // of the plinth's flat underside (fitted to the scan) to +y; he then
    // faces +z.
    rotate: ([x, y, z]) => [
      0.99762 * x - 0.02708 * y + 0.06340 * z,
      0.02708 * x - 0.69174 * y - 0.72164 * z,
      0.06340 * x + 0.72164 * y - 0.68936 * z,
    ],
    height: 2,
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

  const tris = faces.length / 3;
  const reduce = tris > MAX_TRIS ? [weld(), simplify({ simplifier: MeshoptSimplifier, ratio: MAX_TRIS / tris, error: 0.01 })] : [];
  await doc.transform(...reduce, dedup(), prune(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));

  const out = new URL(`${name}.glb`, OUT_DIR);
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
  await io.write(out.pathname, doc);
  console.log(`${name}: ${tris} -> ${prim.getIndices().getCount() / 3} tris -> ${out.pathname}`);
}

await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
mkdirSync(OUT_DIR, { recursive: true });
const names = process.argv.slice(2);
for (const name of names.length ? names : Object.keys(SCANS)) {
  if (!SCANS[name]) throw new Error(`Unknown scan "${name}". Known: ${Object.keys(SCANS).join(', ')}`);
  await convert(name, SCANS[name]);
}
