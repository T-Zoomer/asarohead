// Converts sculpture scans (Three D Scans, Scan the World, SMK) into
// web-ready GLBs in public/models/. Each model's source and license is in its
// credit in src/models.js.
//
//   npm run convert:scan            # every scan below
//   npm run convert:scan -- nymph   # just one
//
// The source files are large (tens of MB) and stay out of git. Download them
// into scans-src/ under the names below.
//
// Scans keep their full resolution up to MAX_TRIS; larger ones are
// simplified to it. Smooth normals are computed from the full mesh first, so
// the viewer shades every model like the original scan. Ambient occlusion is
// baked in last (scripts/ao.mjs).

import { dedup, prune, simplify, weld } from '@gltf-transform/functions';
import { MeshoptSimplifier, computeNormals, createModel, readMesh, writeModel } from './glb.mjs';

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
  'venus-italica': {
    // https://www.myminifactory.com/object/3d-print-venus-italica-102804
    src: '10-smk-venus-italica-kas-dep1-bust.stl',
    // Z-up, front toward +x.
    rotate: ([x, y, z]) => [y, z, x],
    height: 2,
  },
  'genius-hand': {
    // https://www.myminifactory.com/object/3d-print-hand-of-the-genius-of-liberty-la-marseillaise-143732
    src: '7621-cap-hand-2.stl',
    // The fingers point along +x and the back of the hand faces -y. Stand the
    // fingers up (+x to +y) with the palm toward +z.
    rotate: ([x, y, z]) => [z, x, y],
    height: 2,
  },
  'alexander-helios': {
    // https://www.myminifactory.com/object/3d-print-ideal-portrait-of-alexander-the-great-as-helios-100249
    src: '84-smk-alexander-as-helios-inv-283.stl',
    // Z-up, front toward -x.
    rotate: ([x, y, z]) => [-y, z, -x],
    height: 2,
  },
  'athlete-python': {
    // https://www.myminifactory.com/object/3d-print-athlete-wrestling-a-python-3253
    src: 'athlete-wrestling-a-python-at-the-tate-britain-london-1.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'bearded-man': {
    // https://www.myminifactory.com/object/3d-print-head-of-a-bearded-old-man-24136
    src: 'bearded-man-d.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'medusa': {
    // https://www.myminifactory.com/object/3d-print-medusa-at-the-musei-capitolini-rome-17660
    src: 'bust-of-medusa-at-the-musei-capitolini-rome-1.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'diana': {
    // https://www.myminifactory.com/object/3d-print-diana-86065
    src: 'jadyn-sotheby-s-diana.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'marcus-aurelius': {
    // https://www.myminifactory.com/search?query=marcus%20aurelius
    src: 'marcus-aurelius-1.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'trotting-horse': {
    // https://www.myminifactory.com/search?query=trotting%20horse%20nationalmuseum
    src: 'nms-drhsk0064-trotting-horse.stl',
    // Z-up, front toward +x.
    rotate: ([x, y, z]) => [y, z, x],
    height: 2,
  },
  'david': {
    // https://www.myminifactory.com/object/3d-print-michelangelo-s-david-in-florence-italy-2052
    src: 'scan-the-world-michelangelo-s-david.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'sleeping-bacchante': {
    // https://www.myminifactory.com/search?query=sleeping%20bacchante
    src: 'sleeping-bacchante.stl',
    // Z-up, front toward -y; she reclines along x.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'discobolus': {
    // https://www.myminifactory.com/object/3d-print-townley-discobolus-the-discus-thrower-25156
    src: 'smk-kas1074-discobolus-decimated.stl',
    // Z-up, the classic side view toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'moses': {
    // https://www.myminifactory.com/object/3d-print-moses-271189
    src: 'smk-kas243-moses.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'augustus': {
    // https://www.myminifactory.com/object/3d-print-augustus-of-prima-porta-264761
    src: 'smk-kas65-augustus-prima-porta.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'farnese-head': {
    // https://open.smk.dk/en/artwork/image/KAS701
    src: 'smk26-kas701-head-from-farnese-hercules.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'david-head': {
    // https://www.myminifactory.com/object/3d-print-head-of-michelangelo-s-david-52645
    src: 'smk55-kas2232-head-of-david.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'laocoon': {
    // https://www.myminifactory.com/object/3d-print-laocoon-and-his-sons-52652
    src: 'smk57-kas285-laocoon-group-decimated.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'three-graces': {
    // https://www.myminifactory.com/search?query=three%20graces%20scan%20the%20world
    src: 'the-three-graces-1.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'uffizi-torso': {
    // https://www.myminifactory.com/search?query=uffizi%20torso%20scan%20the%20world
    src: 'uffizi-torso-5.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'girl-kittens': {
    // https://www.myminifactory.com/object/3d-print-a-little-girl-with-kittens-105328
    src: 'smk-kms5471-girl-with-cats.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'pseudo-seneca': {
    // SMK KAS 94
    src: '152-smk-inv-94.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'leeds-brotherton': {
    src: '719234 - Leeds - Brotherton 2.stl',
    // Y-up, front toward +z.
    rotate: ([x, y, z]) => [x, y, z],
    height: 2,
  },
  'farnese-hercules': {
    // https://www.myminifactory.com/object/3d-print-farnese-hercules-70132
    src: 'anatomical-museum-farnese-hercules.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'eurydice': {
    // https://www.myminifactory.com/object/3d-print-eurydice-dying-at-the-louvre-paris-6535
    src: 'louvre-eurydice-dying-1.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'hermaphroditus': {
    // https://www.myminifactory.com/object/3d-print-hermaphrodite-sleeping-at-the-louvre-paris-france-7286
    src: 'louvre-hermaphrodite-sleeping-1.stl',
    // Z-up, lying along x, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 0.8,
  },
  'slave-girl': {
    // https://open.smk.dk/en/artwork/image/KMS5025
    src: 'smk-19-slave-girl-kms5025.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'venus-apple': {
    // https://open.smk.dk/en/artwork/image/KMS6004
    src: 'smk16-venus-med-apple.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'the-mist': {
    // https://www.myminifactory.com/object/3d-print-the-mist-98661
    src: 'snm-sk0955-the-mist.stl',
    // Z-up, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 2,
  },
  'venus-victrix': {
    src: 'venus-vixtrix.stl',
    // Z-up, lying along x, front toward -y.
    rotate: ([x, y, z]) => [x, z, -y],
    height: 1.2,
  },
  'perseus-medusa': {
    // https://www.myminifactory.com/object/3d-print-perseus-slaying-medusa-268334
    src: 'glyptotek-min-588.stl',
    // Y-up, front toward +z.
    rotate: ([x, y, z]) => [x, y, z],
    height: 2,
  },
};

const SRC_DIR = new URL('../scans-src/', import.meta.url);
const OUT_DIR = new URL('../public/models/', import.meta.url);

async function convert(name, scan) {
  const { positions: source, faces } = readMesh(new URL(scan.src, SRC_DIR));
  const positions = new Float32Array(source.length);

  // Rotate upright, then center on x and z, stand the base on y = 0, and
  // scale to the target height.
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < source.length; i += 3) {
    const r = scan.rotate([source[i], source[i + 1], source[i + 2]]);
    for (let k = 0; k < 3; k++) {
      source[i + k] = r[k];
      min[k] = Math.min(min[k], r[k]);
      max[k] = Math.max(max[k], r[k]);
    }
  }
  const scale = scan.height / (max[1] - min[1]);
  const offset = [-(min[0] + max[0]) / 2, -min[1], -(min[2] + max[2]) / 2];
  for (let i = 0; i < source.length; i += 3) {
    for (let k = 0; k < 3; k++) positions[i + k] = (source[i + k] + offset[k]) * scale;
  }

  const normals = new Float32Array(positions.length);
  const volume = computeNormals(positions, faces, normals);
  // A negative signed volume means the triangles wind inside out.
  if (volume < 0) console.warn(`${name}: triangles wind inward, the model will render inside out`);

  const { doc, prim } = createModel(name, { positions, normals, indices: faces });

  const tris = faces.length / 3;
  const reduce = tris > MAX_TRIS ? [weld(), simplify({ simplifier: MeshoptSimplifier, ratio: MAX_TRIS / tris, error: 0.01 })] : [];
  await doc.transform(...reduce, dedup(), prune());
  const out = new URL(`${name}.glb`, OUT_DIR);
  await writeModel(doc, out);
  console.log(`${name}: ${tris} -> ${prim.getIndices().getCount() / 3} tris -> ${out.pathname}`);
}

const names = process.argv.slice(2);
for (const name of names.length ? names : Object.keys(SCANS)) {
  if (!SCANS[name]) throw new Error(`Unknown scan "${name}". Known: ${Object.keys(SCANS).join(', ')}`);
  await convert(name, SCANS[name]);
}
