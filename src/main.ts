import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { buildCamera } from "./lib/camera";
import { Planet } from "./lib/planet";
import { planetDataArray } from "./data/planet-data";
import { GLOBAL_SPEED_SCALE } from "./lib/config";

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
    const sinTheta = Math.sin(elapsedTime * p.orbitSpeed * GLOBAL_SPEED_SCALE);
    const cosTheta = Math.cos(elapsedTime * p.orbitSpeed * GLOBAL_SPEED_SCALE);
    const x = p.orbitRadius * cosTheta;
    const y = p.orbitRadius * sinTheta;
    p.mesh.position.set(x, 0, y);
    //self rotation
    const rotationSpeedAsEulerAngle =
      THREE.MathUtils.DEG2RAD * p.selfRotationSpeed * GLOBAL_SPEED_SCALE;
    const yaw = rotationSpeedAsEulerAngle * timeDelta;
    p.mesh.rotateY(yaw);

    // apply same processes to moons if any
    p.moons.forEach((m) => {
      const sinTheta = Math.sin(
        elapsedTime * m.orbitSpeed * GLOBAL_SPEED_SCALE,
      );
      const cosTheta = Math.cos(
        elapsedTime * m.orbitSpeed * GLOBAL_SPEED_SCALE,
      );
      const x = m.orbitRadius * cosTheta;
      const y = m.orbitRadius * sinTheta;
      m.mesh.position.set(x, 0, y);
      //self rotation
      const rotationSpeedAsEulerAngle =
        THREE.MathUtils.DEG2RAD * m.selfRotationSpeed * GLOBAL_SPEED_SCALE;
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
