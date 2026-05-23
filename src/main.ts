import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { buildCamera } from "./lib/camera";
import { buildPlanets, Planet } from "./lib/planet";
import { GLOBAL_MAX_SPEED, GLOBAL_MIN_SPEED, GLOBAL_SPEED } from "./lib/config";
import { Pane } from "tweakpane";

// Init general params
let globalSpeedScale = GLOBAL_SPEED;

// Init scene
const scene = new THREE.Scene();
// Set skybox
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
camera.position.set(0, 80, 260);

// Init planets
const planets: Planet[] = buildPlanets();

// put planets in their orbit position
planets.forEach((p) => {
  p.mesh.position.x = p.orbitRadius;
});

// Init lights
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
const pointLight = new THREE.PointLight(0xffffff, 1000);

// Add elements to scene
scene.add(pointLight);
scene.add(ambientLight);
planets.forEach((p) => {
  scene.add(p.mesh);
});

// Init renderer
const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);

// Init controls
const controls = new OrbitControls(camera, renderer.domElement);

// Init pane (UI)
const pane = new Pane();
const folder = pane.addFolder({
  title: "Settings",
  expanded: true,
});

const speedBinding = folder.addBinding(
  {
    Speed: globalSpeedScale,
  },
  "Speed",
  { min: GLOBAL_MIN_SPEED, max: GLOBAL_MAX_SPEED, step: 0.1 },
);

speedBinding.on("change", (ev) => {
  console.log(ev.value);
  globalSpeedScale = ev.value;
});

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
    const sinTheta = Math.sin(elapsedTime * p.orbitSpeed * globalSpeedScale);
    const cosTheta = Math.cos(elapsedTime * p.orbitSpeed * globalSpeedScale);
    const x = p.orbitRadius * cosTheta;
    const y = p.orbitRadius * sinTheta;
    p.mesh.position.set(x, 0, y);
    //self rotation
    const rotationSpeedAsEulerAngle =
      THREE.MathUtils.DEG2RAD * p.selfRotationSpeed * globalSpeedScale;
    const yaw = rotationSpeedAsEulerAngle * timeDelta;
    p.mesh.rotateY(yaw);

    // apply same processes to moons if any
    p.moons.forEach((m) => {
      //rotate around orbit
      const sinTheta = Math.sin(elapsedTime * m.orbitSpeed * globalSpeedScale);
      const cosTheta = Math.cos(elapsedTime * m.orbitSpeed * globalSpeedScale);
      const x = m.orbitRadius * cosTheta;
      const y = m.orbitRadius * sinTheta;
      m.mesh.position.set(x, 0, y);
      //self rotation
      const rotationSpeedAsEulerAngle =
        THREE.MathUtils.DEG2RAD * m.selfRotationSpeed * globalSpeedScale;
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
