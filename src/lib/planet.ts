import * as THREE from "three";
import { planetDataArray } from "../data/planet-data";

export interface PlanetData {
  name: string;
  // Sun is exceptional planet, since it emits lights and it must be visible, MeshBasicMaterial is applied
  // ? If MeshStandardMaterial is used, since point light inside is sun, sun planet is not visible
  isSun: boolean;
  scale: number;
  orbitRadius: number;
  orbitSpeed: number;
  selfRotationSpeed: number;
  texturePath: string;
  moons: PlanetData[];
}

export class Planet {
  public readonly mesh: THREE.Mesh;
  public readonly name: string;
  public readonly orbitRadius: number;
  public readonly orbitSpeed: number;
  public readonly selfRotationSpeed: number;
  public readonly moons: Planet[];

  constructor(planetData: PlanetData) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(planetData.texturePath);
    texture.colorSpace = THREE.SRGBColorSpace;

    let planetMaterial;
    if (planetData.isSun) {
      planetMaterial = new THREE.MeshBasicMaterial({
        map: texture,
      });
    } else {
      planetMaterial = new THREE.MeshStandardMaterial({
        map: texture,
      });
    }
    const planetGeometry = new THREE.SphereGeometry(1);
    this.mesh = new THREE.Mesh(planetGeometry, planetMaterial);
    this.mesh.scale.setScalar(planetData.scale);
    this.name = planetData.name;
    this.orbitRadius = planetData.orbitRadius;
    this.selfRotationSpeed = planetData.selfRotationSpeed;
    this.orbitSpeed = planetData.orbitSpeed;

    this.moons = planetData.moons.map((m) => {
      return new Planet(m);
    });
    // make moons child of this planet
    this.moons.forEach((m) => {
      this.mesh.add(m.mesh);
    });
  }
}

export function buildPlanets() {
  const planets = planetDataArray.map((pd) => {
    return new Planet(pd);
  });

  return planets;
}
