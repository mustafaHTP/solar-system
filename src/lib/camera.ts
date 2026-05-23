import * as THREE from "three";

export const ASPECT_RATIO = 16 / 9;
export const NEAR_PLANE = 0.1;
export const FAR_PLANE = 10000;
export const FOV = 60;

export function buildCamera() {
  return new THREE.PerspectiveCamera(
    FOV,
    getAspectRatio(),
    NEAR_PLANE,
    FAR_PLANE,
  );
}

export function getAspectRatio() {
  return window.innerWidth / window.innerHeight;
}
