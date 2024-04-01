import * as THREE from "three";
import { LEO_RADIUS, MMOD_SCALE } from "../helpers/Constants";

export type TLE = [string, string];

export class MMOD {
  // The three js object to be rendered.
  public readonly mesh: THREE.Mesh;

  // TODO: Think on this one.
  // Normally, a sequential nine-digit number assigned by the
  // USSPACECOM in order of launch or discovery.
  public satelliteCatalogNumber = 0;

  // Keplerian orbital elements, plus some others used in
  // producing the TLE representation.
  // See: https://en.wikipedia.org/wiki/Orbital_elements
  // Semi-major axis is the sum of the periapsis and apoapsis
  // distances divided by two.
  // public semiMajorAxis: number;
  // Inclination is the vertical tilt of the ellipse with
  // respect to the reference plane.
  public inclination: number;
  // The right ascension of the ascending node is the angle
  // from a specified reference direction, called the origin
  // of longitude, to the direction of the ascending node.
  public longitude: number;
  // Eccentricity represents the shape of the orbital ellipse,
  // describing how much it is elongated compared to a circle.
  public eccentricity: number;
  // The argument of perigee is, parametrically, the angle
  // from the body's ascending node to its periapsis, measured
  // in the direction of motion.
  public perigee: number;
  // Mean motion is revolutions per day.
  public motion: number;
  // Mean anomaly is the fraction of an elliptical orbit's
  // period that has elapsed since the orbiting body passed
  // periapsis.
  public anomaly: number;
  // TODO: Again, think on this. Could be prohibitive, but
  // maybe we can exclude from target consensus data model?
  // Revolution number (typically at a given epoch) is just
  // a counter, again normally tracked by
  // This will not be tracked here.
  public revolution = 0;
  // Will leave this at unclassified for now.
  public classification: "U" | "C" | "S" = "U";

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

    // Set mean motion at random.
    // Initial speed (scalar) should be anywhere from 6-9 km/s.
    const initialSpeed = this.random(6000, 9000); // In m/s.
    // Convert this to approximate (non-elliptical) revolutions per day.
    const circumference = 46357.341; // 2pi * 7378 (mean LEO).
    const dayDistanceTraveled = initialSpeed * 86400; // Seconds in a day.
    this.motion = dayDistanceTraveled / circumference;

    // Set inclination at random.
    this.inclination = this.random(40.0, 60.0);

    // Set eccentricity at random.
    this.eccentricity = this.random(0.0, 0.0009);

    // Set argument of perigee at random.
    this.perigee = this.random(100.0, 150.0);

    // Set mean anomaly at random.
    this.anomaly = this.random(300.0, 350.0);

    // Set longitude at random.
    this.longitude = this.random(200, 300);
  }

  /**
   * Proceed to the next animation frame. Reposition the
   * @param t Time in seconds since init. It's assumed that we init at 0.
   */
  public step(t: number): void {}

  public tle(timestamp: Date): TLE {
    const tle = [Array(69).fill("\xa0"), Array(69).fill("\xa0")];

    tle[0].splice(0, 1, "1");

    const catalogNum = this.satelliteCatalogNumber.toString();
    tle[0].splice(2, catalogNum.length, ...catalogNum.split(""));

    tle[0].splice(7, 1, this.classification);

    // International designator, the launch year etc., not relevant.
    tle[0].splice(9, 6, "0", "0", "0", "0", "0", "A");

    // Add epoch to the first line.
    // Epoch year, the last two digits of year.
    tle[0].splice(
      18,
      2,
      ...timestamp.getFullYear().toString().slice(2, 4).split("")
    );
    // Epoch day of the year and fractional portion of the day.
    const day = this.pad(this.getDayOfYear(timestamp), 3);
    tle[0].splice(20, 12);
  }

  private getFractionalPortionOfDay(date: Date): number {
    const beginningOfDay = new Date(date);
    beginningOfDay.setUTCHours(0, 0, 0, 0);
    const msElapsed =
      date.getUTCMilliseconds() - beginningOfDay.getUTCMilliseconds();
    return msElapsed / 8.64e7;
  }

  private getDayOfYear(date: Date): number {
    const beginningOfYear = new Date();
    beginningOfYear.setUTCHours(0, 0, 0, 0);
    beginningOfYear.setUTCDate(0);
    beginningOfYear.setUTCMonth(0);

    const secondsIntoYear =
      date.getUTCSeconds() - beginningOfYear.getUTCSeconds();
    return Math.floor(secondsIntoYear / 86400);
  }

  private pad(num: number, size: number): string {
    let s = num.toString();
    while (s.length < size) {
      s = "0" + s;
    }
    return s;
  }

  private random(min: number, max: number): number {
    // min and max included
    return Math.random() * (max - min + 1) + min;
  }
}
