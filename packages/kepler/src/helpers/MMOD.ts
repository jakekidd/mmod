import * as THREE from "three";
import { LEO_RADIUS, MMOD_SCALE } from "./Constants";

export class MMOD {
  public readonly mesh: THREE.Mesh;

  /**
   * A small point object representing orbiting debris.
   */
  constructor() {
    const geometry = new THREE.SphereGeometry(1, 4, 2);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(
        Math.random(),
        0.5,
        0.5,
        THREE.SRGBColorSpace
      ),
      side: THREE.DoubleSide,
      alphaToCoverage: true,
    });
    this.mesh = new THREE.Mesh(geometry, material);

    // Points on the surface of a sphere can be expressed using two
    // spherical coordinates, theta and phi with 0 < theta < 2pi and
    // 0 < phi < pi.
    // Generate random values for theta and phi.
    const theta = this.random(0, 2 * Math.PI);
    const phi = this.random(0, Math.PI);
    // Convert theta and phi into cartesian coordinates for the mesh.
    this.mesh.position.x = LEO_RADIUS * Math.cos(theta) * Math.sin(phi);
    this.mesh.position.y = LEO_RADIUS * Math.sin(theta) * Math.sin(phi);
    this.mesh.position.z = LEO_RADIUS * Math.cos(phi);
    this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = MMOD_SCALE;
  }

  private random(min: number, max: number): number {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
