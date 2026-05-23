import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { buildCamera } from "./camera";
import { Planet, type PlanetData } from "./planet";

// Load textures
const textureLoader = new THREE.TextureLoader();

const sunTexture = await textureLoader.loadAsync(
  "src/assets/textures/2k_sun.jpg",
);
sunTexture.colorSpace = THREE.SRGBColorSpace;

const earthTexture = await textureLoader.loadAsync(
  "src/assets/textures/2k_earth.jpg",
);
earthTexture.colorSpace = THREE.SRGBColorSpace;

const marsTexture = await textureLoader.loadAsync(
  "src/assets/textures/2k_mars.jpg",
);
marsTexture.colorSpace = THREE.SRGBColorSpace;

const mercuryTexture = await textureLoader.loadAsync(
  "src/assets/textures/2k_mercury.jpg",
);
mercuryTexture.colorSpace = THREE.SRGBColorSpace;

const moonTexture = await textureLoader.loadAsync(
  "src/assets/textures/2k_moon.jpg",
);
moonTexture.colorSpace = THREE.SRGBColorSpace;

const venusTexture = await textureLoader.loadAsync(
  "src/assets/textures/2k_venus.jpg",
);
venusTexture.colorSpace = THREE.SRGBColorSpace;

const planetDataArray: PlanetData[] = [
  {
    name: "sun",
    scale: 5,
    orbitRadius: 0,
    orbitSpeed: 0,
    selfRotationSpeed: 5,
    texture: sunTexture,
    moons: [],
  },
  {
    name: "earth",
    scale: 1,
    orbitRadius: 20,
    orbitSpeed: 0.5,
    selfRotationSpeed: 100,
    texture: earthTexture,
    moons: [],
  },
  {
    name: "mercury",
    scale: 0.5,
    orbitRadius: 10,
    orbitSpeed: 0.4,
    selfRotationSpeed: 0.01,
    texture: mercuryTexture,
    moons: [],
  },
  {
    name: "venus",
    scale: 0.8,
    orbitRadius: 15,
    orbitSpeed: 0.8,
    selfRotationSpeed: 0.007,
    texture: venusTexture,
    moons: [],
  },
  {
    name: "mars",
    scale: 0.7,
    orbitRadius: 25,
    orbitSpeed: 0.3,
    selfRotationSpeed: 0.003,
    texture: marsTexture,
    moons: [],
  },
  {
    name: "moon",
    scale: 0.5,
    orbitRadius: 15,
    orbitSpeed: 0.5,
    selfRotationSpeed: 10,
    texture: moonTexture,
    moons: [],
  },
];

// construct planets
const planets: Planet[] = planetDataArray.map((pd) => {
  return new Planet(pd);
});

// Init scene
const scene = new THREE.Scene();
const loader = new THREE.CubeTextureLoader().setPath(
  "src/assets/textures/cubeMap/",
);
const cubeTexture = await loader.loadAsync([
  "px.png",
  "nx.png",
  "py.png",
  "ny.png",
  "pz.png",
  "nz.png",
]);
scene.background = cubeTexture;
// Init camera
const camera = buildCamera();

// put planets in their orbit position
planets.forEach((p) => {
  p.mesh.position.x = p.orbitRadius;
});

camera.position.z = 10;
// Add elements to scene
const axesHelper = new THREE.AxesHelper(100);
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1000);
scene.add(pointLight);
planets.forEach((p) => {
  scene.add(p.mesh);
});
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

  planets.forEach((p) => {
    // rotate around orbit
    const sinTheta = Math.sin(elapsedTime * p.orbitSpeed);
    const cosTheta = Math.cos(elapsedTime * p.orbitSpeed);
    const x = p.orbitRadius * cosTheta;
    const y = p.orbitRadius * sinTheta;
    p.mesh.position.set(x, 0, y);
    //self rotation
    const rotationSpeedAsEulerAngle =
      THREE.MathUtils.DEG2RAD * p.selfRotationSpeed;
    const yaw = rotationSpeedAsEulerAngle * timeDelta;
    p.mesh.rotateY(yaw);

    // apply same processes to moons if any
    p.moons.forEach((m) => {
      const sinTheta = Math.sin(elapsedTime * m.orbitSpeed);
      const cosTheta = Math.cos(elapsedTime * m.orbitSpeed);
      const x = m.orbitRadius * cosTheta;
      const y = m.orbitRadius * sinTheta;
      m.mesh.position.set(x, 0, y);
      //self rotation
      const rotationSpeedAsEulerAngle =
        THREE.MathUtils.DEG2RAD * m.selfRotationSpeed;
      const yaw = rotationSpeedAsEulerAngle * timeDelta;
      m.mesh.rotateY(yaw);
    });
  });

  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(update);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
