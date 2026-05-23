import * as THREE from "three";

export interface PlanetData {
  name: string;
  scale: number;
  orbitRadius: number;
  orbitSpeed: number;
  selfRotationSpeed: number;
  texture: THREE.Texture;
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
    const planetMaterial = new THREE.MeshStandardMaterial({
      map: planetData.texture,
    });
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
