// import { Point, LabeledPoint } from "./Point";
import { Random } from "../helpers/Random";

export type Point = {
  x: number;
  y: number;
  z: number;
  C: number;
};

export type LabeledPoint = {
  label: number;
  deviation: number;
} & Point;

// The full dataset, composed of many subsets, will look like this.
export type Dataset = {
  [participant: string]: Point[];
};

export class Aggregator {
  public flatten(set: Dataset): (Point | LabeledPoint)[] {
    // Take a given dataset's subset values and return a flattened array composed of all of them.
    return Object.values(set).reduce((acc, val) => acc.concat(val), []);
  }

  public label(points: Point[], epsilon: number): LabeledPoint[] {
    // Group together points within the given `points` array that are close enough together (with tolerance epsilon) and label each point in the group with an assigned number.
    const labeledPoints: LabeledPoint[] = [];
    let currentLabel = 0;

    for (const point of points) {
      const existingLabels: Set<number> = new Set<number>();
      let totalDistance = 0;
      let pairCount = 0;

      for (const labeledPoint of labeledPoints) {
        const distance = this.distance(point, labeledPoint);
        if (distance <= epsilon) {
          existingLabels.add(labeledPoint.label);
          totalDistance += distance;
          pairCount++;
        }
      }

      // Calculate average distance to reflect the deviation.
      const deviation = pairCount > 0 ? totalDistance / pairCount : 0;

      if (existingLabels.size === 0) {
        // Assign a new label if no close points found.
        currentLabel++;
        labeledPoints.push({ ...point, label: currentLabel, deviation });
      } else {
        // Assign the smallest existing label to the point.
        const minLabel = Math.min(...Array.from(existingLabels));
        labeledPoints.push({ ...point, label: minLabel, deviation });
      }
    }

    return labeledPoints;
  }

  public aggregate(points: LabeledPoint[]): LabeledPoint[] {
    // Implement the aggregation formula to combine all points with the same label.
    const aggregatedPointsMap: Map<
      number,
      [number, number, number, number, number, number]
    > = new Map(); // label => [sumX, sumY, sumZ, sumC, count, sumDist]

    // TODO: Might be simpler to just make the Map in `label` fn.
    for (const point of points) {
      const label = point.label;
      if (!aggregatedPointsMap.has(label)) {
        aggregatedPointsMap.set(label, [0, 0, 0, 0, 0, 0]);
      }
      const [sumX, sumY, sumZ, sumC, count, sumDist] =
        aggregatedPointsMap.get(label)!;
      aggregatedPointsMap.set(label, [
        sumX + point.x,
        sumY + point.y,
        sumZ + point.z,
        // We square the confidence score to account for the weighting based on count.
        sumC + point.C ** 2 * count,
        count + 1, // TODO: Why add 1
        sumDist + point.deviation,
      ]);
    }

    // TODO: I think deviation might already be avg'd??

    const aggregatedPoints: LabeledPoint[] = [];
    for (const [label, [sumX, sumY, sumZ, sumC, count, sumDist]] of Array.from(
      aggregatedPointsMap.entries()
    )) {
      const x = sumX / count;
      const y = sumY / count;
      const z = sumZ / count;
      // We take the square root to revert the squaring operation.
      // Additionally, normalize the confidence score to stay between 0.0 and 1.0
      const C =
        count === 1
          ? 0.0
          : Math.max(0, Math.min(Math.sqrt(sumC) / (count * count), 1.0));
      const deviation = sumDist / count;
      aggregatedPoints.push({ x, y, z, C, label, deviation });
    }

    return aggregatedPoints;
  }

  public clean(points: Point[], zeta: number): Point[] {
    // Remove all points from the dataset whose confidence scores fall below zeta.
    return points.filter((point) => point.C >= zeta);
  }

  private distance(p1: Point, p2: Point): number {
    // Helper function that implements Euclidean distance formula.
    return Math.sqrt(
      (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2 + (p2.z - p1.z) ** 2
    );
  }

  // TODO: Move to tests.
  /**
   * Generates a sample dataset consisting of Identifier's subsets. Generates
   * subsets at random.
   */
  private sample(count: number = 100): void {
    for (let i = 0; i < count; i++) {
      const subset: Point[] = [];
      for (let i = 0; i < 1000; i++) {
        subset.push({
          x: Math.random() * 10,
          y: Math.random() * 10,
          z: Math.random() * 10,
          C: Math.random(),
        });
      }
    }
  }

  public static generateDataset(
    numParticipants: number,
    minPointsPerParticipant: number,
    maxPointsPerParticipant: number,
    numDimensions: number,
    chanceOfMatchingPoint: number
  ): Dataset {
    const dataset: Dataset = {};

    // Generate subsets for each participant
    for (let i = 1; i <= numParticipants; i++) {
      const participantName = `Participant_${i}`;
      const numPoints =
        Math.floor(
          Math.random() *
            (maxPointsPerParticipant - minPointsPerParticipant + 1)
        ) + minPointsPerParticipant;
      const subset: (Point | LabeledPoint)[] = [];

      // Generate points for the subset
      for (let j = 0; j < numPoints; j++) {
        // Generate random coordinates
        const coordinates: number[] = [];
        for (let k = 0; k < numDimensions; k++) {
          coordinates.push(Math.random());
        }

        // Generate random confidence score
        const confidence = Math.random();

        // Determine if the point should match with another subset
        const shouldMatch = Math.random() < chanceOfMatchingPoint;

        // Generate labeled point
        if (shouldMatch && Object.keys(dataset).length > 0) {
          // Choose a random labeled point from another subset
          const randomParticipantIndex = Math.floor(
            Math.random() * Object.keys(dataset).length
          );
          const randomParticipant =
            Object.keys(dataset)[randomParticipantIndex];
          const randomSubset = dataset[randomParticipant];
          const randomPointIndex = Math.floor(
            Math.random() * randomSubset.length
          );
          const randomPoint = randomSubset[randomPointIndex];
          subset.push(randomPoint);
        } else {
          // Generate a new point with a new label
          subset.push({
            x: coordinates[0],
            y: coordinates[1],
            z: coordinates[2],
            C: confidence,
          });
        }
      }

      // Add the subset to the dataset
      dataset[participantName] = subset;
    }

    return dataset;
  }
}
