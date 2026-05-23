import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { buildCamera } from "./camera";
import { Planet, type PlanetData } from "./planet";

// Init scene elements
// sun
const sunData: PlanetData = {
  name: "sun",
  color: 0xf2ff03,
  scale: 5,
};
const earthData: PlanetData = {
  name: "earth",
  color: 0x0339ff,
  scale: 1,
};
const moonData: PlanetData = {
  name: "moon",
  color: 0xbababa,
  scale: 0.5,
};

const sun = new Planet(sunData);
const earth = new Planet(earthData);
const moon = new Planet(moonData);

// Init scene
const scene = new THREE.Scene();
// Init camera
const camera = buildCamera();

// Update transforms
sun.mesh.scale.setScalar(5);
earth.mesh.scale.setScalar(1);
moon.mesh.scale.setScalar(0.5);
earth.mesh.position.x = -10;
moon.mesh.position.x = -15;
camera.position.z = 10;

const axesHelper = new THREE.AxesHelper(100);
// Add elements to scene
scene.add(sun.mesh);
scene.add(earth.mesh);
scene.add(moon.mesh);
scene.add(axesHelper);

// Init renderer
const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);
// Init controls
const controls = new OrbitControls(camera, renderer.domElement);
// Init timer
const timer = new THREE.Timer();

// Render scene
function update() {
  // first update timer
  timer.update();
  const timeDelta = timer.getDelta();
  const elapsedTime = timer.getElapsed();

  const sinTheta = Math.sin(elapsedTime);
  const cosTheta = Math.cos(elapsedTime);
  const r = 10;
  const x = r * cosTheta;
  const y = r * sinTheta;

  earth.mesh.position.set(x, 0, y);

  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(update);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
