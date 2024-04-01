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
  public revolution = 1;
  // Will leave this at unclassified for now.
  public classification: "U" | "C" | "S" = "U";

  // Variables used to calculate the ballistic coefficient.
  public mass: number; // In grams.
  public diameter: number; // In meters.
  public drag = 0.47; // Drag coefficient of a sphere.
  public density = 7850.0;

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

    // Set mass, diameter at random.
    this.mass = this.random(200, 500);
    this.diameter = this.random(0.1, 0.3);
  }

  /**
   * Proceed to the next animation frame. Reposition the
   * @param t Time in seconds since init. It's assumed that we init at 0.
   */
  public step(t: number): void {}

  public tle(timestamp: Date): TLE {
    const tle = [Array(69).fill("\xa0"), Array(69).fill("\xa0")];

    /// LINE 1
    // Line number.
    tle[0].splice(0, 1, "1");

    // TODO: Check if this should be 0-padded.
    // Satellite catalog number. This is space junk, so probably zero.
    tle[0].splice(2, 5, ...this.pad(this.satelliteCatalogNumber, 5).split(""));

    // Append classification.
    tle[0].splice(7, 1, this.classification);

    // Append international designator, the launch year etc., not relevant.
    tle[0].splice(9, 6, "0", "0", "0", "0", "0", "A");

    // Append epoch to the first line.
    // Epoch year, the last two digits of year.
    tle[0].splice(
      18,
      2,
      ...timestamp.getFullYear().toString().slice(2, 4).split("")
    );
    // Epoch day of the year and fractional portion of the day.
    const day = this.pad(this.getDayOfYear(timestamp), 3);
    const fraction = this.getFractionalPortionOfDay(timestamp)
      .toString()
      .substring(1, 10); // Removes 0 from beginning and truncates.
    tle[0].splice(20, 12, ...(day + fraction).split(""));

    // TODO: Should be first derivative of mean motion?
    // Append ballistic coefficient.
    tle[0].splice(
      33,
      10,
      "-",
      ...this.getBallisticCoefficient().toString().substring(1, 9).split("")
    );
    // TODO: Append second derivative of mean motion.
    // Leaving at 0 for now.
    tle[0].splice(44, 8, "\xa0", "0", "0", "0", "0", "0", "-", "0");

    // TODO: Am I doing this right?
    // Append BSTAR.
    const BSTAR = this.getBSTAR();
    let BSTARString = BSTAR.toString().substring(
      BSTAR < 0 ? 3 : 2,
      BSTAR < 0 ? 8 : 7
    );
    BSTARString = BSTARString.substring(0, 5) + "-" + BSTARString.substring(6);
    tle[0].splice(53, 7, "-", ...BSTARString.split(""));

    // Append ephemeris type. Supposedly always zero.
    tle[0].splice(62, 1, "0");

    // TODO: Is there any reason to actually track this?
    // Element set number, incremented when a new TLE is generated for this object. Will leave at 1.
    tle[0].splice(64, 3, "001");

    // TODO: How to do this? Encode first, or..?
    // Calculate and append the checksum.
    tle[0].splice(68, 1, "0");

    /// LINE 2
    // Line number.
    tle[1].splice(0, 1, "2");

    // Again, satellite catalog number.
    tle[1].splice(2, 5, ...this.pad(this.satelliteCatalogNumber, 5).split(""));

    // Append inclination.
    tle[1].splice(
      8,
      6,
      ...this.pad(this.inclination, 7, true).substring(0, 7).split("")
    );

    // Append longitude.
    tle[1].splice(
      17,
      8,
      ...this.pad(this.longitude, 8, true).substring(0, 8).split("")
    );

    // Append eccentricity.
    tle[1].splice(
      26,
      7,
      ...this.eccentricity.toString().substring(2, 10).split("")
    );

    // Append argument of perigee.
    tle[1].splice(
      34,
      8,
      ...this.pad(this.perigee, 8, true).substring(0, 8).split("")
    );

    // Append mean anomaly.
    tle[1].splice(
      43,
      8,
      ...this.pad(this.anomaly, 8, true).substring(0, 8).split("")
    );

    // Append mean motion.
    let extendedMotion = this.pad(
      this.motion,
      this.motion >= 10 ? 11 : 10,
      true
    );
    if (this.motion <= 10) {
      extendedMotion = this.pad(parseInt(extendedMotion), 11);
    }
    tle[1].splice(52, 11, ...extendedMotion.substring(0, 12).split(""));

    // Append revolution number.
    tle[1].splice(63, 5, ...this.pad(this.revolution, 5).split(""));

    // TODO: How to do this? Encode first, or..?
    // Calculate and append the checksum.
    tle[1].splice(68, 1, "0");

    return [tle[0].join(""), tle[1].join("")];
  }

  private getBSTAR(): number {
    // TODO: Cross-sectional != frontal area.
    // Should be expressed as spherical cap?
    const B = (this.drag * this.getCrossSectionalArea()) / this.mass;
    return (this.density * B) / 2;
  }

  private getBallisticCoefficient(): number {
    return this.mass / (this.drag * this.getCrossSectionalArea());
  }

  private getCrossSectionalArea(): number {
    return Math.PI * (this.diameter / 2) ** 2;
  }

  private getVolume(): number {
    return (4 / 3) * Math.PI * Math.pow(this.diameter / 2, 3);
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

  private pad(num: number, size: number, reverse: boolean = false): string {
    let s = num.toString();
    while (s.length < size) {
      s = reverse ? s + "0" : "0" + s;
    }
    return s;
  }

  private random(min: number, max: number): number {
    // min and max included
    return Math.random() * (max - min + 1) + min;
  }
}
