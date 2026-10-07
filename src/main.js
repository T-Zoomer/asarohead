import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createLightBall } from './light-ball.js';
import { SITE_NAME, modelById } from './models.js';

const DEG = Math.PI / 180;
const $ = (id) => document.getElementById(id);

// Starting camera: a three-quarter view. Azimuth is measured from the face
// (+z) toward the head's left side (+x); elevation is above the horizon.
const START_VIEW = { az: 40, el: 6 };
// Starting light, relative to the camera: up and to the viewer's left.
const START_LIGHT = { az: -45, el: 40 };

const LENS_MM = 85;

function dirFromAngles(az, el, out = new THREE.Vector3()) {
  return out.set(Math.sin(az * DEG) * Math.cos(el * DEG), Math.sin(el * DEG), Math.cos(az * DEG) * Math.cos(el * DEG));
}

// ---------------------------------------------------------------------------
// Renderer, scene, camera

const canvas = $('view');
// ?thumb renders on a transparent background, for the gallery thumbnails.
const THUMB = new URLSearchParams(location.search).has('thumb');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: THUMB });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping;

const scene = new THREE.Scene();
scene.background = THUMB ? null : new THREE.Color(siteBackground.css());

// Vertical field of view of an 85 mm lens on a full-frame (24 mm tall) sensor.
const camera = new THREE.PerspectiveCamera((2 * Math.atan(12 / LENS_MM)) / DEG, 1, 0.1, 200);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 1.5;
controls.maxDistance = 60;
camera.position.set(0, 1, 12);
controls.target.set(0, 1, 0);

// Distance that frames the whole model: its height fills 60% of the view
// and its widest side (x or z, since it turns) at most 85% of the width, so
// tall figures and wide, low pieces both fit on any screen shape. Seen from
// a little above, a wide piece looks taller than it is, so its height counts
// as at least 0.75 of its width; upright models are taller than that anyway.
// ?zoom=1.5 starts closer; the thumbnail script uses it to fill the frame.
const ZOOM = Number(new URLSearchParams(location.search).get('zoom')) || 1;
function frameDistance() {
  const width = Math.max(head.size.x, head.size.z);
  const viewHeight = Math.max(Math.max(head.size.y, 0.75 * width) / 0.6, width / (0.85 * camera.aspect));
  return viewHeight / (2 * Math.tan((camera.fov / 2) * DEG)) / ZOOM;
}

const hemi = new THREE.HemisphereLight(0xffffff, 0x8d8b88, 0.3);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xffffff, 1.7);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.012;
Object.assign(key.shadow.camera, { left: -1.4, right: 1.4, top: 1.4, bottom: -1.4, near: 0.5, far: 12 });
scene.add(key, key.target);

// Fill comes from the camera, so it lifts the shadows evenly from any angle.
const fill = new THREE.DirectionalLight(0xe4ebff, 0.15);
scene.add(fill, fill.target);

// One white marble for every model: a soft sheen, a polished-stone
// highlight and faint reflections of a neutral studio, kept low so the
// shadows stay deep and values stay readable.
const studio = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const marble = new THREE.MeshPhysicalMaterial({
  color: 0xf2f0ea,
  roughness: 0.42,
  metalness: 0,
  envMap: studio,
  envMapIntensity: 0.1,
  clearcoat: 0.25,
  clearcoatRoughness: 0.35,
});

// ---------------------------------------------------------------------------
// Model
//
// The page shows one model from src/models.js, picked by ?m=<id>. The crease
// angle splits normals where neighbouring faces turn sharply, which keeps the
// Asaro planes flat with hard edges. Scans ship smooth normals in the GLB.

const model = modelById(new URLSearchParams(location.search).get('m'));
if (!model) location.replace('../');

// The Asaro head is the reference size for lights, shadows and zoom limits.
const REFERENCE_SIZE = 1.78;

const head = { mesh: null, center: new THREE.Vector3(0, 1, 0), size: new THREE.Vector3(1, 1.78, 1), scale: 1 };
const light = new THREE.Vector3(); // world-space direction toward the key light

if (model) {
  document.title = `${model.title} – 3D drawing reference – ${SITE_NAME}`;
  const canonical = document.createElement('link');
  canonical.rel = 'canonical';
  canonical.href = `${location.origin}${location.pathname}?m=${model.id}`;
  document.head.append(canonical);
  $('title').textContent = model.title;
  $('artist').textContent = model.artist;
  $('credit').innerHTML = model.credit;

  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(
    `${import.meta.env.BASE_URL}models/${model.file}`,
    (gltf) => {
      let source;
      gltf.scene.traverse((o) => o.isMesh && (source ??= o));
      let geometry = source.geometry;
      if (model.crease) geometry = toCreasedNormals(geometry, model.crease * DEG);
      else if (!geometry.attributes.normal) geometry.computeVertexNormals();
      head.mesh = new THREE.Mesh(geometry, marble);
      // Quantized glTF positions carry their real scale and offset on the node.
      gltf.scene.updateMatrixWorld(true);
      head.mesh.applyMatrix4(source.matrixWorld);
      head.mesh.castShadow = head.mesh.receiveShadow = true;
      scene.add(head.mesh);

      const box = new THREE.Box3().setFromObject(head.mesh);
      const size = box.getSize(head.size);
      box.getCenter(head.center);
      head.scale = Math.max(size.x, size.y, size.z) / REFERENCE_SIZE;
      key.target.position.copy(head.center);
      fill.target.position.copy(head.center);
      const r = 0.8 * Math.max(size.x, size.y, size.z);
      Object.assign(key.shadow.camera, { left: -r, right: r, top: r, bottom: -r, far: 12 * head.scale });
      key.shadow.camera.updateProjectionMatrix();
      controls.minDistance = 0.75 * head.scale;
      controls.maxDistance = 60 * head.scale;

      resize();
      controls.target.copy(head.center);
      const view = { ...START_VIEW, ...model.view };
      camera.position.copy(head.center).addScaledVector(dirFromAngles(view.az, view.el), frameDistance());
      controls.update();
      dirFromAngles(view.az + START_LIGHT.az, START_LIGHT.el, light);
      $('status').textContent = '';
    },
    undefined,
    (err) => {
      console.error(err);
      $('status').textContent = 'The model didn’t load. Check your connection and reload the page.';
    },
  );
}

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

// ---------------------------------------------------------------------------
// Background
//
// The slider sets the site-wide background (src/background-boot.js), which
// every page remembers. Text and the light ball's outlines follow it.

const bgSlider = $('bg');
bgSlider.value = siteBackground.value();
bgSlider.addEventListener('input', () => {
  siteBackground.set(Number(bgSlider.value));
  if (!THUMB) scene.background.setStyle(siteBackground.css());
  lightBall.redraw();
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
// Watch the canvas itself: it can change size without a window resize, for
// example when the stylesheet arrives after the model.
new ResizeObserver(resize).observe(canvas);

resize();
renderer.setAnimationLoop(() => {
  controls.update();
  updateLights();
  renderer.render(scene, camera);
});
