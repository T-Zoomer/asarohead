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
const frameDistance = () => LENS_MM * 0.125 * Math.max(1, 0.55 / camera.aspect);

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
// Model

const head = { mesh: null, center: new THREE.Vector3(0, 1, 0) };
const light = new THREE.Vector3(); // world-space direction toward the key light

new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(
  '/models/asaro-head.glb',
  (gltf) => {
    let source;
    gltf.scene.traverse((o) => o.isMesh && (source ??= o));

    // Creased normals: the planes stay flat with hard edges between them,
    // while the few gently curved areas (the skull) shade smoothly.
    const geometry = toCreasedNormals(source.geometry, 28 * DEG);
    head.mesh = new THREE.Mesh(geometry, plaster);
    // Quantized glTF positions carry their real scale and offset on the node.
    gltf.scene.updateMatrixWorld(true);
    head.mesh.applyMatrix4(source.matrixWorld);
    head.mesh.castShadow = head.mesh.receiveShadow = true;
    scene.add(head.mesh);

    new THREE.Box3().setFromObject(head.mesh).getCenter(head.center);
    key.target.position.copy(head.center);
    fill.target.position.copy(head.center);

    resize();
    controls.target.copy(head.center);
    camera.position.copy(head.center).addScaledVector(dirFromAngles(START_VIEW.az, START_VIEW.el), frameDistance());
    controls.update();
    dirFromAngles(START_VIEW.az + START_LIGHT.az, START_LIGHT.el, light);
    $('status').textContent = '';
  },
  undefined,
  (err) => {
    console.error(err);
    $('status').textContent = 'The model didn’t load. Check your connection and reload the page.';
  },
);

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
  key.position.copy(head.center).addScaledVector(light, 6);
  toCam.copy(camera.position).sub(controls.target).normalize();
  fill.position.copy(head.center).addScaledVector(toCam, 6);
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
