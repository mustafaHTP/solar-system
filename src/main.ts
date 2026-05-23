import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { buildCamera } from "./lib/camera";
import { buildPlanets, Planet } from "./lib/planet";
import {
  AMBIENT_LIGHT_INTENSITY,
  GLOBAL_MAX_SPEED,
  GLOBAL_MIN_SPEED,
  GLOBAL_SPEED,
  MAX_AMBIENT_LIGHT_INTENSITY,
  MAX_SUN_LIGHT_DISTANCE,
  MAX_SUN_LIGHT_INTENSITY,
  MIN_AMBIENT_LIGHT_INTENSITY,
  MIN_SUN_LIGHT_DISTANCE,
  MIN_SUN_LIGHT_INTENSITY,
  SUN_LIGHT_DISTANCE,
  SUN_LIGHT_INTENSITY,
} from "./lib/config";
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
const ambientLight = new THREE.AmbientLight(0xffffff, AMBIENT_LIGHT_INTENSITY);
const sunLight = new THREE.PointLight(
  0xffffff,
  SUN_LIGHT_INTENSITY,
  SUN_LIGHT_DISTANCE,
);

// Add elements to scene
scene.add(sunLight);
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
buildUI();

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

function buildUI() {
  const pane = new Pane();
  const paneParams = {
    Speed: globalSpeedScale,
    SunLightIntensity: SUN_LIGHT_INTENSITY,
    SunLightDistance: SUN_LIGHT_DISTANCE,
    AmbientLightIntensity: AMBIENT_LIGHT_INTENSITY,
  };
  const folder = pane.addFolder({
    title: "Settings",
    expanded: true,
  });

  const speedBinding = folder.addBinding(paneParams, "Speed", {
    min: GLOBAL_MIN_SPEED,
    max: GLOBAL_MAX_SPEED,
    step: 0.1,
  });
  speedBinding.on("change", (ev) => {
    console.log(ev.value);
    globalSpeedScale = ev.value;
  });

  const ambientLightIntensityBinding = folder.addBinding(
    paneParams,
    "AmbientLightIntensity",
    {
      min: MIN_AMBIENT_LIGHT_INTENSITY,
      max: MAX_AMBIENT_LIGHT_INTENSITY,
      step: 0.1,
    },
  );
  ambientLightIntensityBinding.on("change", (evt) => {
    ambientLight.intensity = evt.value;
  });

  const sunLightIntensityBinding = folder.addBinding(
    paneParams,
    "SunLightIntensity",
    {
      min: MIN_SUN_LIGHT_INTENSITY,
      max: MAX_SUN_LIGHT_INTENSITY,
      step: 1000,
    },
  );
  sunLightIntensityBinding.on("change", (evt) => {
    sunLight.intensity = evt.value;
  });

  const sunLightDistanceBinding = folder.addBinding(
    paneParams,
    "SunLightDistance",
    {
      min: MIN_SUN_LIGHT_DISTANCE,
      max: MAX_SUN_LIGHT_DISTANCE,
      step: 100,
    },
  );
  sunLightDistanceBinding.on("change", (evt) => {
    sunLight.distance = evt.value;
  });
}
