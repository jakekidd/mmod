interface DataPoint {
  x: number;
  y: number;
  z: number;
  timestamp: number; // Unix timestamp in seconds
}

interface OrbitalElements {
  semiMajorAxis: number;
  eccentricity: number;
  inclination: number;
  longitudeAscendingNode: number;
  argumentPeriapsis: number;
  trueAnomaly: number;
  orbitalPeriod: number;
}

function linearRegressionOrbit(dataPoints: DataPoint[]): OrbitalElements {
  if (dataPoints.length < 3) {
    throw new Error("At least 3 data points are required.");
  }

  // Convert timestamps to elapsed time in seconds from the first data point
  const t0 = dataPoints[0].timestamp;
  const timeArray = dataPoints.map((point) => (point.timestamp - t0) / 3600); // Convert to hours

  // Fit a linear regression to the positional data
  let sumX = 0,
    sumY = 0,
    sumZ = 0,
    sumXX = 0,
    sumYY = 0,
    sumZZ = 0,
    sumXY = 0,
    sumXZ = 0,
    sumYZ = 0;
  dataPoints.forEach((point, i) => {
    const x = point.x,
      y = point.y,
      z = point.z;
    const t = timeArray[i];
    sumX += x;
    sumY += y;
    sumZ += z;
    sumXX += x * x;
    sumYY += y * y;
    sumZZ += z * z;
    sumXY += x * y;
    sumXZ += x * z;
    sumYZ += y * z;
  });

  const n = dataPoints.length;
  const matrixA = [
    [n, sumX, sumY, sumZ],
    [sumX, sumXX, sumXY, sumXZ],
    [sumY, sumXY, sumYY, sumYZ],
    [sumZ, sumXZ, sumYZ, sumZZ],
  ];

  // Perform Gaussian elimination to solve the system of linear equations.
  for (let i = 0; i < 4; i++) {
    const divisor = matrixA[i][i];
    for (let j = i; j < 4; j++) {
      matrixA[i][j] /= divisor;
    }
    for (let k = 0; k < 4; k++) {
      if (k !== i) {
        const multiplier = matrixA[k][i];
        for (let j = i; j < 4; j++) {
          matrixA[k][j] -= multiplier * matrixA[i][j];
        }
      }
    }
  }

  // Extract coefficients of the ellipse equation.
  const { semiMajorAxis, semiMinorAxis } = calculateEllipseAxes(
    matrixA[1][3],
    matrixA[2][3],
    matrixA[3][3]
  );

  // Calculate eccentricity.
  const eccentricity = Math.sqrt(
    1 - Math.pow(semiMinorAxis / semiMajorAxis, 2)
  );

  // Derive other Keplerian orbital elements.
  const orbitalPeriod = calculateOrbitalPeriod(semiMajorAxis);
  const inclination = calculateInclination(matrixA[1][1], matrixA[2][2]);
  const longitudeAscendingNode = calculateLongitudeAscendingNode(
    matrixA[1][2],
    matrixA[1][3],
    matrixA[2][3]
  );
  const argumentPeriapsis = calculateArgumentPeriapsis(
    matrixA[1][2],
    matrixA[1][3],
    matrixA[2][3],
    longitudeAscendingNode
  );
  const trueAnomaly = calculateTrueAnomaly(
    dataPoints[0],
    semiMajorAxis,
    eccentricity
  );

  return {
    semiMajorAxis,
    eccentricity,
    inclination,
    longitudeAscendingNode,
    argumentPeriapsis,
    trueAnomaly,
    orbitalPeriod,
  };
}

// Helper functions for calculating orbital elements
function calculateEllipseAxes(
  a11: number,
  a12: number,
  a13: number
): { semiMajorAxis: number; semiMinorAxis: number } {
  const semiMajorAxis = Math.sqrt(1 / a11);
  const semiMinorAxis = Math.sqrt(1 / a13);
  return { semiMajorAxis, semiMinorAxis };
}

function calculateOrbitalPeriod(semiMajorAxis: number): number {
  // In this simplified example, we'll assume a circular orbit and use Kepler's third law
  const G = 6.6743e-11; // Gravitational constant in m^3/kg/s^2
  const M = 5.972e24; // Mass of the Earth in kg
  return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis * 1000, 3) / (G * M));
}

function calculateInclination(a11: number, a22: number): number {
  return Math.acos(Math.sqrt(a11 / a22)) * (180 / Math.PI);
}

function calculateLongitudeAscendingNode(
  a12: number,
  a13: number,
  a23: number
): number {
  let omega = Math.atan2(a12, a13) * (180 / Math.PI);
  if (omega < 0) omega += 360;
  return omega;
}

function calculateArgumentPeriapsis(
  a12: number,
  a13: number,
  a23: number,
  omega: number
): number {
  let w =
    Math.atan2(a23, Math.sqrt(Math.pow(a12, 2) + Math.pow(a13, 2))) *
    (180 / Math.PI);
  if (w < 0) w += 360;
  return (w - omega) % 360;
}

function calculateTrueAnomaly(
  dataPoint: DataPoint,
  semiMajorAxis: number,
  eccentricity: number
): number {
  const r = Math.sqrt(
    Math.pow(dataPoint.x, 2) +
      Math.pow(dataPoint.y, 2) +
      Math.pow(dataPoint.z, 2)
  );
  const v = Math.acos(
    ((semiMajorAxis * (1 - Math.pow(eccentricity, 2))) / r - 1) / eccentricity
  );
  return v * (180 / Math.PI);
}
