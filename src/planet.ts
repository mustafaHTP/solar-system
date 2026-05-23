import * as THREE from "three";

export interface PlanetData {
  name: string;
  scale: number;
  color: THREE.ColorRepresentation;
}

export class Planet {
  public readonly mesh: THREE.Mesh;
  public readonly name: string;

  constructor(planetData: PlanetData) {
    const planetMaterial = new THREE.MeshBasicMaterial({
      color: planetData.color,
    });
    const planetGeometry = new THREE.SphereGeometry(1);
    this.mesh = new THREE.Mesh(planetGeometry, planetMaterial);
    this.mesh.scale.setScalar(planetData.scale);
    this.name = planetData.name;
  }
}
