import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import { createLightBall } from './light-ball.js';

const DEG = Math.PI / 180;
const $ = (id) => document.getElementById(id);

// Starting camera: a three-quarter view. Azimuth is measured from the face
// (+z) toward the head's left side (+x); elevation is above the horizon.
const START_VIEW = { az: 40, el: 6 };
// Starting light, relative to the camera: up and to the viewer's left.
const START_LIGHT = { az: -45, el: 40 };

const BACKGROUND = 0x111113;
const LENS_MM = 85;

function dirFromAngles(az, el, out = new THREE.Vector3()) {
  return out.set(Math.sin(az * DEG) * Math.cos(el * DEG), Math.sin(el * DEG), Math.cos(az * DEG) * Math.cos(el * DEG));
}

// ---------------------------------------------------------------------------
// Renderer, scene, camera

const canvas = $('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping;

const scene = new THREE.Scene();
scene.background = new THREE.Color(BACKGROUND);

// Vertical field of view of an 85 mm lens on a full-frame (24 mm tall) sensor.
const camera = new THREE.PerspectiveCamera((2 * Math.atan(12 / LENS_MM)) / DEG, 1, 0.1, 200);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 1.5;
controls.maxDistance = 60;
camera.position.set(0, 1, 12);
controls.target.set(0, 1, 0);

// Distance that frames the whole head. Narrow (portrait) screens back off so
// the head fits the width too.
const frameDistance = () => LENS_MM * 0.125 * head.scale * Math.max(1, 0.55 / camera.aspect);

const hemi = new THREE.HemisphereLight(0xffffff, 0x8d8b88, 0.3);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xfff8f0, 1.7);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.012;
Object.assign(key.shadow.camera, { left: -1.4, right: 1.4, top: 1.4, bottom: -1.4, near: 0.5, far: 12 });
scene.add(key, key.target);

// Fill comes from the camera, so it lifts the shadows evenly from any angle.
const fill = new THREE.DirectionalLight(0xe4ebff, 0.15);
scene.add(fill, fill.target);

const plaster = new THREE.MeshStandardMaterial({ color: 0xe2e0da, roughness: 0.86, metalness: 0 });

// ---------------------------------------------------------------------------
// Models
//
// Each model is a GLB in public/models/. The crease angle splits normals
// where neighbouring faces turn sharply, which keeps the Asaro planes flat
// with hard edges. Without one, a sculpted surface shades smoothly.

const MODELS = {
  asaro: {
    file: 'asaro-head.glb',
    crease: 28,
    credit:
      'Model: <a href="https://www.thingiverse.com/thing:7287701" target="_blank" rel="noopener">Asaro Head</a> ' +
      'by AgentSCAD, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA</a>',
  },
  napoleon: {
    file: 'napoleon.glb',
    credit:
      '<a href="https://threedscans.com/nouveau-musee-national-de-monaco/napoleon-ler/" target="_blank" rel="noopener">Napoléon Ier</a> ' +
      'by François Joseph Bosio, Nouveau Musée National de Monaco. Scan: Three D Scans',
  },
};
// The Asaro head is the reference size: the camera frames it at frameDistance().
const REFERENCE_HEIGHT = 1.78;

const head = { mesh: null, center: new THREE.Vector3(0, 1, 0), scale: 1 };
const light = new THREE.Vector3(); // world-space direction toward the key light
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const meshes = {}; // cache, so switching back is instant
let current = null;

function loadModel(name) {
  const model = MODELS[name];
  if (meshes[name]) return Promise.resolve(meshes[name]);
  return loader.loadAsync(`${import.meta.env.BASE_URL}models/${model.file}`).then((gltf) => {
    let source;
    gltf.scene.traverse((o) => o.isMesh && (source ??= o));
    let geometry = source.geometry;
    if (model.crease) geometry = toCreasedNormals(geometry, model.crease * DEG);
    else if (!geometry.attributes.normal) geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, plaster);
    // Quantized glTF positions carry their real scale and offset on the node.
    gltf.scene.updateMatrixWorld(true);
    mesh.applyMatrix4(source.matrixWorld);
    mesh.castShadow = mesh.receiveShadow = true;
    return (meshes[name] = mesh);
  });
}

function showModel(name) {
  if (!MODELS[name]) name = 'asaro';
  if (name === current) return;
  current = name;
  for (const button of document.querySelectorAll('[data-model]')) {
    button.setAttribute('aria-pressed', String(button.dataset.model === name));
  }
  $('credit').innerHTML = MODELS[name].credit;
  if (!meshes[name]) $('status').textContent = 'Loading model…';

  loadModel(name).then(
    (mesh) => {
      if (name !== current) return; // another model was picked while this loaded
      const first = !head.mesh;
      if (head.mesh) scene.remove(head.mesh);
      head.mesh = mesh;
      scene.add(mesh);

      const box = new THREE.Box3().setFromObject(mesh);
      const size = box.getSize(new THREE.Vector3());
      box.getCenter(head.center);
      head.scale = size.y / REFERENCE_HEIGHT;
      key.target.position.copy(head.center);
      fill.target.position.copy(head.center);
      const r = 0.8 * Math.max(size.x, size.y, size.z);
      Object.assign(key.shadow.camera, { left: -r, right: r, top: r, bottom: -r, far: 12 * head.scale });
      key.shadow.camera.updateProjectionMatrix();
      controls.maxDistance = 60 * head.scale;

      // Keep the viewing angle when switching, but reframe for the new size.
      const dir = first
        ? dirFromAngles(START_VIEW.az, START_VIEW.el)
        : camera.position.clone().sub(controls.target).normalize();
      resize();
      controls.target.copy(head.center);
      camera.position.copy(head.center).addScaledVector(dir, frameDistance());
      controls.update();
      if (first) dirFromAngles(START_VIEW.az + START_LIGHT.az, START_LIGHT.el, light);
      $('status').textContent = '';
    },
    (err) => {
      console.error(err);
      if (name === current) $('status').textContent = 'The model didn’t load. Check your connection and reload the page.';
    },
  );
}

for (const button of document.querySelectorAll('[data-model]')) {
  button.addEventListener('click', () => {
    history.replaceState(null, '', button.dataset.model === 'asaro' ? location.pathname : `#${button.dataset.model}`);
    showModel(button.dataset.model);
  });
}
window.addEventListener('hashchange', () => showModel(location.hash.slice(1)));
showModel(location.hash.slice(1));

// ---------------------------------------------------------------------------
// Light
//
// The light stays fixed to the head, like a studio lamp. The ball shows it
// as seen from the camera, and dragging it sets it from the camera's view.

const lightBall = createLightBall($('light-ball'), {
  onChange([x, y, z]) {
    light.set(x, y, z).normalize().applyQuaternion(camera.quaternion);
  },
});

const toCam = new THREE.Vector3();
const inverseCam = new THREE.Quaternion();
function updateLights() {
  inverseCam.copy(camera.quaternion).invert();
  lightBall.set(light.clone().applyQuaternion(inverseCam).toArray());
  key.position.copy(head.center).addScaledVector(light, 6 * head.scale);
  toCam.copy(camera.position).sub(controls.target).normalize();
  fill.position.copy(head.center).addScaledVector(toCam, 6 * head.scale);
}

// ---------------------------------------------------------------------------
// Loop

function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

resize();
renderer.setAnimationLoop(() => {
  controls.update();
  updateLights();
  renderer.render(scene, camera);
});
