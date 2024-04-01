import * as THREE from "three";
import { LEO_RADIUS, MMOD_SCALE } from "./Constants";

export class MMOD {
  // The three js object to be rendered.
  public readonly mesh: THREE.Mesh;
  // Keplerian orbital elements.
  // See: https://en.wikipedia.org/wiki/Orbital_elements
  // Eccentricity represents the shape of the orbital ellipse,
  // describing how much it is elongated compared to a circle.
  // public readonly eccentricity: number;
  // Semi-major axis is the sum of the periapsis and apoapsis
  // distances divided by two.
  // public readonly semiMajorAxis: number;
  // Inclination is the vertical tilt of the ellipse with
  // respect to the reference plane.
  // public readonly inclination: number;
  private _velocity: number[];
  private _rhat: number[] = [-1.0, 0.0];

  /**
   * A small point object representing orbiting debris.
   */
  constructor() {
    const geometry = new THREE.SphereGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(0.9, 0.9, 0.9, THREE.SRGBColorSpace),
      side: THREE.DoubleSide,
      alphaToCoverage: true,
    });
    this.mesh = new THREE.Mesh(geometry, material);

    // Determine the initial position of the MMOD at random.
    // Points on the surface of a sphere can be expressed using two
    // spherical coordinates, theta and phi with 0 < theta < 2pi and
    // 0 < phi < pi.
    // Generate random values for theta and phi.
    const theta = this.random(0.01, 2 * Math.PI);
    const phi = Math.acos(this.random(-1, 1));
    // TODO: Vary the radius slightly.
    // Convert theta and phi into cartesian coordinates for the mesh.
    this.mesh.position.x = LEO_RADIUS * Math.cos(theta) * Math.sin(phi);
    this.mesh.position.y = LEO_RADIUS * Math.sin(theta) * Math.sin(phi);
    this.mesh.position.z = LEO_RADIUS * Math.cos(phi);
    this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = MMOD_SCALE;

    // Initial velocity should be anywhere from 6-9 km/s.
    const initialVelocity = this.random(6000, 9000);
    this._velocity = [0.0, -1 * initialVelocity];
  }

  /**
   * Proceed to the next animation frame. Reposition the
   * @param t Time in seconds since init. It's assumed that we init at 0.
   */
  private step(t: number): void {}

  private random(min: number, max: number): number {
    // min and max included
    return Math.random() * (max - min + 1) + min;
  }
}
