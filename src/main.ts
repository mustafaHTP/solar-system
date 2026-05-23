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

const jupiterTexture = moonTexture;
const saturnTexture = moonTexture;
const uranusTexture = moonTexture;
const neptuneTexture = moonTexture;

const globalSizeScale = 10;
const globalOrbitScale = 10;
const globalSpeedScale = 0.3;

const planetDataArray: PlanetData[] = [
  {
    name: "sun",
    scale: 15 * globalSizeScale,
    orbitRadius: 0,
    orbitSpeed: 0,
    selfRotationSpeed: 5,
    texture: sunTexture,
    moons: [],
  },
  {
    name: "mercury",
    scale: 0.07 * globalSizeScale,
    orbitRadius: 10 * globalOrbitScale,
    orbitSpeed: 4.15 * globalSpeedScale,
    selfRotationSpeed: 10 * globalSpeedScale,
    texture: mercuryTexture,
    moons: [],
  },
  {
    name: "venus",
    scale: 0.17 * globalSizeScale,
    orbitRadius: 15 * globalOrbitScale,
    orbitSpeed: 1.62 * globalSpeedScale,
    selfRotationSpeed: 7 * globalSpeedScale,
    texture: venusTexture,
    moons: [],
  },
  {
    name: "earth",
    scale: 0.14 * globalSizeScale,
    orbitRadius: 20 * globalOrbitScale,
    orbitSpeed: 1 * globalSpeedScale,
    selfRotationSpeed: 15 * globalSpeedScale,
    texture: earthTexture,
    moons: [
      {
        name: "moon",
        scale: 0.05 * globalSizeScale,
        orbitRadius: 2 * globalOrbitScale,
        orbitSpeed: 5 * globalSpeedScale,
        selfRotationSpeed: 10 * globalSpeedScale,
        texture: moonTexture,
        moons: [],
      },
    ],
  },
  {
    name: "mars",
    scale: 0.1 * globalSizeScale,
    orbitRadius: 25 * globalOrbitScale,
    orbitSpeed: 0.53 * globalSpeedScale,
    selfRotationSpeed: 12 * globalSpeedScale,
    texture: marsTexture,
    moons: [],
  },
  {
    name: "jupiter",
    scale: 2.05 * globalSizeScale,
    orbitRadius: 35 * globalOrbitScale,
    orbitSpeed: 0.084 * globalSpeedScale,
    selfRotationSpeed: 45 * globalSpeedScale,
    texture: jupiterTexture,
    moons: [],
  },
  {
    name: "saturn",
    scale: 1.73 * globalSizeScale,
    orbitRadius: 45 * globalOrbitScale,
    orbitSpeed: 0.034 * globalSpeedScale,
    selfRotationSpeed: 38 * globalSpeedScale,
    texture: saturnTexture,
    moons: [],
  },
  {
    name: "uranus",
    scale: 0.74 * globalSizeScale,
    orbitRadius: 55 * globalOrbitScale,
    orbitSpeed: 0.0119 * globalSpeedScale,
    selfRotationSpeed: 30 * globalSpeedScale,
    texture: uranusTexture,
    moons: [],
  },
  {
    name: "neptune",
    scale: 0.71 * globalSizeScale,
    orbitRadius: 65 * globalOrbitScale,
    orbitSpeed: 0.006 * globalSpeedScale,
    selfRotationSpeed: 33 * globalSpeedScale,
    texture: neptuneTexture,
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

camera.position.set(0, 80, 260);
// Add elements to scene
const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1000);
scene.add(pointLight);
planets.forEach((p) => {
  scene.add(p.mesh);
});

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
