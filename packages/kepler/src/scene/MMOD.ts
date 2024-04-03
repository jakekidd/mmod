import * as THREE from "three";
import { LEO_RADIUS, MMOD_SCALE } from "../helpers/Constants.ts";
import { Random } from "../helpers/Random.ts";

export type TLE = [string, string];

// TODO: Move these to constants.
const MATERIAL_DENSITY_MAP: { [material: string]: number } = {
  Metal: 7800, // Density of metal in kg/m^3
  Plastic: 950, // Density of plastic in kg/m^3
  Composite: 1600, // Density of composite in kg/m^3
  // TODO: Add more materials as needed
};
/**
 * The gravitational parameter (μ) is a constant value for a particular
 * celestial body and represents the product of the gravitational constant (G) and the
 * mass (M) of the central body (usually a planet or a star). For Earth, μ is approximately
 * 3.986×10^14 m^3/s^2.
 */
const MU_EARTH = 3.986e14;

let COUNT = 0;

export class MMOD {
  // The three js object to be rendered.
  public mesh: THREE.Mesh | undefined;

  position: { x: number; y: number; z: number };

  // TODO: Think on this one.
  // Normally, a sequential nine-digit number assigned by the
  // USSPACECOM in order of launch or discovery.
  public catalogNumber = 0;

  // Keplerian orbital elements, plus some others used in
  // producing the TLE representation.
  // See: https://en.wikipedia.org/wiki/Orbital_elements
  // Semi-major axis is the sum of the periapsis and apoapsis
  // distances divided by two.
  // public semiMajorAxis: number;
  // Inclination is the vertical tilt of the ellipse with
  // respect to the reference plane.
  // public inclination: number;
  // The right ascension of the ascending node is the angle
  // from a specified reference direction, called the origin
  // of longitude, to the direction of the ascending node.
  // public longitude: number;
  // Eccentricity represents the shape of the orbital ellipse,
  // describing how much it is elongated compared to a circle.
  // public eccentricity: number;
  // The argument of perigee is, parametrically, the angle
  // from the body's ascending node to its periapsis, measured
  // in the direction of motion.
  // public perigee: number;
  // Mean motion is revolutions per day.
  // public motion: number;
  // Mean anomaly is the fraction of an elliptical orbit's
  // period that has elapsed since the orbiting body passed
  // periapsis.
  // public anomaly: number;
  // TODO: Again, think on this. Could be prohibitive, but
  // maybe we can exclude from target consensus data model?
  // Revolution number (typically at a given epoch) is just
  // a counter, again normally tracked by
  // This will not be tracked here.
  public revolution = 1;
  // Will leave this at unclassified for now.
  public classification: "U" | "C" | "S" = "U";

  // TODO: Comment this
  public orbit: {
    semiMajorAxis: number;
    eccentricity: number;
    inclination: number;
    longitudeAscendingNode: number;
    argumentPeriapsis: number;
    trueAnomalyAtEpoch: number;
  };

  public specs: {
    ballisticCoefficient: number;
    // Variables used to calculate the ballistic coefficient.
    volume: number; // In m^3.
    mass: number; // In kg.
    diameter: number; // In km.
    drag: number; // Drag coefficient of a sphere.
    density: number; // Density of aluminum. kg/m^3

    // TODO: Make into an enum.
    material: string;
  };

  // TODO: Move to constants.
  // Constants
  earthRadius: number = 6371; // in km

  shouldLog = false;

  /**
   * A small point object representing orbiting debris.
   */
  constructor(scene?: THREE.Scene) {
    // TODO: test remove
    // if (COUNT === 0) {
    //   this.shouldLog = true;
    // }
    // COUNT++;

    // Generate random position in low earth orbit
    const altitude = Random.number(700, 2000); // altitude between 700-2000 km
    const longitude = Random.number(0, 360); // random longitude
    const latitude = Math.random() * 180 - 90; // random latitude

    // Convert spherical coordinates to Cartesian coordinates
    const x =
      (this.earthRadius + altitude) * Math.cos(latitude) * Math.cos(longitude);
    const y =
      (this.earthRadius + altitude) * Math.cos(latitude) * Math.sin(longitude);
    const z = (this.earthRadius + altitude) * Math.sin(latitude);

    this.position = { x, y, z };

    // Generate random elliptical orbit path
    this.orbit = {
      semiMajorAxis: Random.number(700, 2000), // semi-major axis between 1300-2000 km
      eccentricity: Random.number(0, 0.1),

      // TODO: I think more common around 80-100..?
      // Inclination between the plane of the orbit and the reference plane.
      // 80-100 is a polar orbit.
      inclination: Random.number(0, 100), // inclination between 0-180 degrees

      // Longitude (☊).
      longitudeAscendingNode: Random.number(0, 360),
      // Periapsis (ω): the angle measured along the orbit from the ascending node to
      // the periapsis.
      argumentPeriapsis: Random.number(0, 360),
      // the angle measured along the orbital path from the periapsis to the satellite's
      // current position, measured at a specific reference time known as the epoch.
      // It describes the satellite's position along its orbit at a particular point in time.
      trueAnomalyAtEpoch: Random.number(0, 360),
    };

    // Other properties (random values for demonstration)
    const material = "Metal";
    const mass = Random.number(1.0, 300.0); // random value
    const diameter = Random.number(0.1, 1); // random value
    const drag = Random.number(1.0, 2.2); // random value

    const materialDensity = MATERIAL_DENSITY_MAP[material];
    const density = Random.number(materialDensity - 100, materialDensity + 100); // random value

    // Using volume of a sphere for rough estimate.
    const volume = (4 / 3) * Math.PI * Math.pow(diameter / 2, 3); // random value

    // Derive ballistic coefficient using the density-based formula.
    const ballisticCoefficient = 0.5 * density * diameter * drag;

    this.specs = {
      material,
      mass,
      diameter,
      drag,
      density,
      volume,
      ballisticCoefficient,
    };

    // Set mean motion at random.
    // Initial speed (scalar) should be anywhere from 6-9 km/s.
    // const initialSpeed = Random.number(6000, 9000); // In m/s.
    // // Convert this to approximate (non-elliptical) revolutions per day.
    // const circumference = 46357.341; // 2pi * 7378 (mean LEO).
    // const dayDistanceTraveled = initialSpeed * 86400; // Seconds in a day.
    // this.motion = dayDistanceTraveled / circumference;

    if (scene) {
      this.initThreeJSMesh(scene);
    }
  }

  /**
   * Proceed to the next animation frame. Reposition the
   * @param timestamp Time in seconds since init. It's assumed that we init at 0.
   */
  public step(timestamp: number, shouldMove = true): void {
    if (this.shouldLog) {
      console.log(
        "Current position MMOD:",
        this.position.x,
        this.position.y,
        this.position.z,
        ...Array.from(Object.values(this.toThreeJSPosition()))
      );
    }

    // TODO: Move to constants!
    // Logic to calculate new position based on timestamp.
    const G = 6.6743e-11; // Gravitational constant in m^3/kg/s^2.
    const earthMass = 5.972e24; // Earth mass in kg.

    // Convert timestamp to seconds.
    const t = timestamp / 1000;

    // Validate input values: semiMajorAxis should be positive, eccentricity should be between 0 and 1.
    if (
      this.orbit.semiMajorAxis <= 0 ||
      this.orbit.eccentricity < 0 ||
      this.orbit.eccentricity >= 1
    ) {
      console.error(
        "Invalid input values for semiMajorAxis or eccentricity.",
        this.orbit.semiMajorAxis,
        this.orbit.eccentricity
      );
      return; // Exit function early to prevent further calculations with invalid inputs.
    }

    // Calculate mean anomaly (M) based on Kepler's equation.
    const n = Math.sqrt(
      (G * earthMass) / Math.pow(this.orbit.semiMajorAxis * 1000, 3)
    ); // Mean motion.
    let meanAnomaly = this.orbit.trueAnomalyAtEpoch - n * t;

    // Iteratively solve Kepler's equation for eccentric anomaly (E).
    let eccentricAnomaly = meanAnomaly; // Initial guess for eccentric anomaly.
    let delta = 1;
    const tolerance = 1e-10; // Tolerance for convergence.
    while (Math.abs(delta) > tolerance) {
      const f =
        eccentricAnomaly -
        this.orbit.eccentricity * Math.sin(eccentricAnomaly) -
        meanAnomaly;
      const fPrime = 1 - this.orbit.eccentricity * Math.cos(eccentricAnomaly);
      delta = f / fPrime;
      eccentricAnomaly -= delta;
    }

    // console.log("stuff 1", meanAnomaly, eccentricAnomaly, delta);

    // Calculate true anomaly (ν) from eccentric anomaly (E).
    const trueAnomaly =
      2 *
      Math.atan(
        Math.sqrt(
          (1 + this.orbit.eccentricity) / (1 - this.orbit.eccentricity)
        ) * Math.tan(eccentricAnomaly / 2)
      );

    // Calculate distance from center of the Earth to the satellite (r) using vis-viva equation.
    const radius =
      (this.orbit.semiMajorAxis *
        (1 - this.orbit.eccentricity * this.orbit.eccentricity)) /
      (1 + this.orbit.eccentricity * Math.cos(trueAnomaly));

    // Calculate position in orbital plane (x', y').
    const xPrime = radius * Math.cos(trueAnomaly);
    const yPrime = radius * Math.sin(trueAnomaly);

    // console.log(trueAnomaly, radius, xPrime, yPrime);

    // // Calculate true anomaly (ν) from eccentric anomaly (E).
    // const cosTrueAnomaly =
    //   (Math.cos(eccentricAnomaly) - this.orbit.eccentricity) /
    //   (1 - this.orbit.eccentricity * Math.cos(eccentricAnomaly));
    // const sinTrueAnomaly =
    //   (Math.sqrt(1 - this.orbit.eccentricity * this.orbit.eccentricity) *
    //     Math.sin(eccentricAnomaly)) /
    //   (1 - this.orbit.eccentricity * Math.cos(eccentricAnomaly));
    // const trueAnomaly = Math.atan2(sinTrueAnomaly, cosTrueAnomaly);

    // // Calculate distance from center of the Earth to the satellite (r) using vis-viva equation.
    // const radius =
    //   (this.orbit.semiMajorAxis *
    //     1000 *
    //     (1 - this.orbit.eccentricity * this.orbit.eccentricity)) /
    //   (1 + this.orbit.eccentricity * Math.cos(trueAnomaly));

    // // Calculate position in orbital plane (x', y').
    // const xPrime = radius * Math.cos(trueAnomaly);
    // const yPrime = radius * Math.sin(trueAnomaly);

    // Rotate position to align with orbital elements.
    const cosLongitudeAscendingNode = Math.cos(
      this.orbit.longitudeAscendingNode
    );
    const sinLongitudeAscendingNode = Math.sin(
      this.orbit.longitudeAscendingNode
    );
    const cosArgumentPeriapsis = Math.cos(this.orbit.argumentPeriapsis);
    const sinArgumentPeriapsis = Math.sin(this.orbit.argumentPeriapsis);
    const cosInclination = Math.cos(this.orbit.inclination);
    const sinInclination = Math.sin(this.orbit.inclination);

    // console.log(
    //   cosLongitudeAscendingNode,
    //   sinLongitudeAscendingNode,
    //   cosArgumentPeriapsis,
    //   sinArgumentPeriapsis,
    //   cosInclination,
    //   sinInclination
    // );

    const x =
      xPrime *
        (cosLongitudeAscendingNode * cosArgumentPeriapsis -
          sinLongitudeAscendingNode * sinArgumentPeriapsis * cosInclination) -
      yPrime *
        (sinLongitudeAscendingNode * cosArgumentPeriapsis +
          cosLongitudeAscendingNode * sinArgumentPeriapsis * cosInclination);
    const y =
      xPrime *
        (cosLongitudeAscendingNode * sinArgumentPeriapsis +
          sinLongitudeAscendingNode * cosArgumentPeriapsis * cosInclination) +
      yPrime *
        (cosLongitudeAscendingNode * cosArgumentPeriapsis -
          sinLongitudeAscendingNode * sinArgumentPeriapsis * cosInclination);
    const z =
      xPrime * (sinLongitudeAscendingNode * sinInclination) +
      yPrime * (cosLongitudeAscendingNode * sinInclination);

    // Update object position.
    this.position = { x, y, z };

    if (this.mesh) {
      // Finally, convert to three.js coordinate space and update the mesh's
      // position.
      const threePosition = this.toThreeJSPosition();

      if (this.shouldLog) {
        console.log(
          "New position for mmod:",
          this.position.x,
          this.position.y,
          this.position.z,
          threePosition.x,
          threePosition.y,
          threePosition.z
        );
      }

      if (shouldMove) {
        this.mesh.position.set(
          threePosition.x,
          threePosition.y,
          threePosition.z
        );
        this.mesh.updateMatrix();
      }
    }
  }

  public stepMesh(newPos: { x: number; y: number; z: number }) {
    if (!this.mesh) {
      console.warn("`stepMesh` was called with no mesh instiantiated.");
      return;
    }
    this.mesh.position.set(newPos.x, newPos.y, newPos.z);
    this.mesh.updateMatrix();
  }

  public tle(timestamp: Date): TLE {
    // Line 1
    const firstDerivativeMeanMotion = this.getFirstDerivativeMeanMotion();
    const secondDerivativeMeanMotion = this.getSecondDerivativeMeanMotion();
    const BSTARDragTerm = this.getBSTARDragTerm();
    const line1 = `1 ${this.catalogNumber}U 00000A ${timestamp
      .toISOString()
      .slice(2, 10)
      .replace(/-/g, "")} .${firstDerivativeMeanMotion
      .toString()
      .replace(/-/g, " ")
      .padStart(8, " ")}${
      secondDerivativeMeanMotion > 0
        ? secondDerivativeMeanMotion.toFixed(8).padStart(8, " ")
        : "  .00000000"
    }-${BSTARDragTerm.toFixed(4).replace(/-/g, " ").padStart(6, " ")} 0`;

    // Line 2
    const line2 = `2 ${this.catalogNumber} ${this.orbit.inclination
      .toFixed(4)
      .padStart(8, " ")}${this.orbit.longitudeAscendingNode
      .toFixed(4)
      .padStart(8, " ")}${(this.orbit.eccentricity * 1e7)
      .toFixed(7)
      .replace(/\.?0+$/, "")
      .padStart(7, " ")}${this.orbit.argumentPeriapsis
      .toFixed(4)
      .padStart(8, " ")}${this.getMeanAnomaly(timestamp.getUTCMilliseconds())
      .toFixed(4)
      .padStart(8, " ")}${this.getMeanMotion(this.orbit.semiMajorAxis, MU_EARTH)
      .toFixed(11)
      .replace(".", "")}`;

    return [line1, line2];
  }

  // Function to convert position to three.js coordinates
  public toThreeJSPosition(): { x: number; y: number; z: number } {
    // Scaling down the position to fit with three.js coordinates (assuming earth sphere radius is 16)
    const scaleFactor = 20 / 6371; // TODO: Should be constants!
    return {
      x: this.position.x * scaleFactor,
      y: this.position.y * scaleFactor,
      z: this.position.z * scaleFactor,
    };
  }

  public initThreeJSMesh(scene: THREE.Scene) {
    if (this.mesh) {
      console.warn("Mesh already exists for object. Reinitializing.");
      // TODO: Remove the previous mesh from the scene (assuming it's in this scene).
    }

    const geometry = new THREE.SphereGeometry(5, 4, 4);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(0.9, 0.9, 0.9, THREE.SRGBColorSpace),
      side: THREE.DoubleSide,
      alphaToCoverage: true,
    });
    this.mesh = new THREE.Mesh(geometry, material);

    scene.add(this.mesh);

    // Determine the initial position of the MMOD at random.
    // Points on the surface of a sphere can be expressed using two
    // spherical coordinates, theta and phi with 0 < theta < 2pi and
    // 0 < phi < pi.
    // Generate random values for theta and phi.
    // const theta = Random.number(0.01, 2 * Math.PI);
    // const phi = Math.acos(Random.number(-1, 1));
    // TODO: Vary the radius slightly.
    // Convert theta and phi into cartesian coordinates for the mesh.
    // The LEO radius will be varied slightly by a modifier, targeting
    // anywhere from 1000 km to 2000 km above the surface of the earth.
    const threePosition = this.toThreeJSPosition();
    this.mesh.position.x = threePosition.x; //LEO_RADIUS * Math.cos(theta) * Math.sin(phi);
    this.mesh.position.y = threePosition.y; //LEO_RADIUS * Math.sin(theta) * Math.sin(phi);
    this.mesh.position.z = threePosition.z; //LEO_RADIUS * Math.cos(phi);
    this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = MMOD_SCALE;
  }

  private getMeanMotion(a: number, mu: number): number {
    // Semi-major axis 'a' in meters
    // Gravitational parameter 'mu' in m^3/s^2

    // Calculate mean motion (n)
    const n = Math.sqrt(mu / Math.pow(a, 3));

    // Convert mean motion to revolutions per day
    const meanMotionRevPerDay = n * (86400 / (2 * Math.PI));

    return meanMotionRevPerDay;
  }

  private getFirstDerivativeMeanMotion(): number {
    // Constants
    const G = 6.6743e-11; // Gravitational constant in m^3/kg/s^2
    const earthMass = 5.972e24; // Earth mass in kg

    // Calculate the semi-major axis of the orbit in meters
    const semiMajorAxisMeters = this.orbit.semiMajorAxis * 1000;

    // Calculate the mean motion (n) in radians per second
    const meanMotion = Math.sqrt(
      (G * earthMass) / Math.pow(semiMajorAxisMeters, 3)
    );

    // Return the first derivative of mean motion
    return -1.5 * meanMotion * this.orbit.eccentricity ** 2;
  }

  // Function to calculate the second derivative of mean motion
  private getSecondDerivativeMeanMotion(): number {
    // Constants
    const G = 6.6743e-11; // Gravitational constant in m^3/kg/s^2
    const earthMass = 5.972e24; // Earth mass in kg

    // Calculate the semi-major axis of the orbit in meters
    const semiMajorAxisMeters = this.orbit.semiMajorAxis * 1000;

    // Calculate the mean motion (n) in radians per second
    const meanMotion = Math.sqrt(
      (G * earthMass) / Math.pow(semiMajorAxisMeters, 3)
    );

    // Calculate the eccentricity squared
    const eccentricitySquared =
      this.orbit.eccentricity * this.orbit.eccentricity;

    // Return the second derivative of mean motion
    return (
      (-meanMotion * eccentricitySquared * (4 * eccentricitySquared - 5)) /
      semiMajorAxisMeters
    );
  }

  private getBSTARDragTerm(): number {
    // Constants
    // TODO: Move to constants!
    const earthRadius = 6371; // Earth radius in kilometers
    // const earthMass = 5.972e24; // Earth mass in kg
    // const dragCoefficient = 2.2; // Example drag coefficient

    // Calculate the cross-sectional area of the object
    // const crossSectionalArea = Math.PI * Math.pow(this.specs.diameter / 2, 2); // Assuming spherical object

    // Calculate the atmospheric density at the object's altitude
    const altitudeFromEarthCenter = this.getPositionMagnitude() - earthRadius;
    const altitudeFromSurface = altitudeFromEarthCenter - this.earthRadius;
    const density = this.getAtmosphericDensity(altitudeFromSurface); // Example call to get atmospheric density

    // Calculate the BSTAR drag term
    return -0.5 * this.specs.ballisticCoefficient * density;
  }

  private getMeanAnomaly(timestamp: number): number {
    // Constants
    // TODO: Move to constants
    const G = 6.6743e-11; // Gravitational constant in m^3/kg/s^2
    const earthMass = 5.972e24; // Earth mass in kg

    // Convert timestamp to seconds
    const t = timestamp / 1000;

    // Calculate mean motion (n) in radians per second
    const semiMajorAxisMeters = this.orbit.semiMajorAxis * 1000;
    const n = Math.sqrt((G * earthMass) / Math.pow(semiMajorAxisMeters, 3));

    // Calculate mean anomaly (M) based on Kepler's equation
    const M = this.orbit.trueAnomalyAtEpoch - n * t;

    return M;
  }

  private getPositionMagnitude(): number {
    return Math.sqrt(
      this.position.x * this.position.x +
        this.position.y * this.position.y +
        this.position.z * this.position.z
    );
  }

  // Function to estimate atmospheric density at a given altitude
  private getAtmosphericDensity(altitude: number): number {
    // TODO: Move to constants.
    // Constants for US Standard Atmosphere model.
    // NOTE: This is just for the troposphere (up to 11k km).
    const T0 = 288.15; // Sea level temperature in Kelvin
    const lapseRate = 0.0065; // Temperature lapse rate in Kelvin per meter
    const R = 8.31447; // Universal gas constant in J/(mol*K)
    const g0 = 9.80665; // Standard gravity in m/s^2
    const M = 0.0289644; // Molar mass of dry air in kg/mol

    // Calculate temperature at given altitude using lapse rate model.
    const temperature = T0 - lapseRate * altitude;

    // Calculate pressure at given altitude using hydrostatic equation.
    const pressure =
      101325 *
      Math.pow(1 - (lapseRate * altitude) / T0, (g0 * M) / (R * lapseRate));

    // Calculate density using ideal gas law.
    return (pressure * M) / (R * temperature);
  }
}
