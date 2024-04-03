import { LabeledPoint, Point } from "./Aggregator";

class Proctor {
  private readonly aggregateModel: LabeledPoint[];
  private readonly zeta: number; // Threshold for diminishing returns
  private readonly stake: number;
  private readonly maxStake: number; // Maximum stake value

  constructor(
    aggregateModel: LabeledPoint[],
    zeta: number,
    stake: number,
    maxStake: number
  ) {
    this.aggregateModel = aggregateModel;
    this.zeta = zeta;
    this.maxStake = maxStake;
    this.stake = stake;
  }

  public scoreDataset(dataset: Point[]): number {
    let totalScore = 0;

    for (const point of dataset) {
      totalScore += this.scorePoint(point);
    }

    return totalScore;
  }

  private scorePoint(point: Point): number {
    const { C } = point;

    // Calculate penalty for the point
    const penalty = this.calculatePenalty(point);

    // Calculate staking modifier
    const stakingModifier = this.calculateStakingModifier(this.stake);

    // Calculate score for the point
    const score = C * (1 - penalty) * stakingModifier;

    return score;
  }

  private calculatePenalty(point: Point): number {
    // Calculate penalty based on distance and confidence
    // Implementation omitted for brevity
    const nearestPoint = this.findNearestPoint(point);
    const distance = this.distance(point, nearestPoint);
    const confidence = point.C;

    // Calculate penalty based on distance and confidence
    const penalty = Math.min(
      (distance / this.maxDistance()) * (1 - confidence),
      1
    );
    return penalty;
  }

  private calculateStakingModifier(stake: number): number {
    // Calculate staking modifier with diminishing returns.
    stake = Math.floor(stake / 1000000000000000000); // 1 wei - we will just be using the Ether value.
    if (stake >= this.maxStake) {
      stake = this.maxStake;
    }
    if (stake >= this.zeta) {
      // TODO: Double check
      return stake - this.zeta + Math.sqrt(this.zeta - stake);
    } else {
      return stake;
    }
  }

  private findNearestPoint(point: Point): LabeledPoint {
    // Find the nearest point in the aggregate model to the given point
    let nearestPoint = this.aggregateModel[0];
    let minDistance = this.distance(point, nearestPoint);

    for (const aggregatedPoint of this.aggregateModel) {
      const distance = this.distance(point, aggregatedPoint);
      if (distance < minDistance) {
        nearestPoint = aggregatedPoint;
        minDistance = distance;
      }
    }

    return nearestPoint;
  }

  // TODO: move to a utils along with same fn in Aggregator
  private distance(p1: Point, p2: Point): number {
    // Calculate Euclidean distance between two points
    return Math.sqrt(
      (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2 + (p2.z - p1.z) ** 2
    );
  }

  private maxDistance(): number {
    // Define the maximum acceptable distance threshold
    return 0.1; // Adjust as needed
  }
}

// TODO: Use to test
// Example usage:
// const aggregateModel: LabeledPoint[] = []; // Populate with aggregate model data
// const stakingAmount = 10000; // Example staking amount
// const proctor = new Proctor(aggregateModel, stakingAmount, 10000);

// // Example dataset
// const dataset: Point[] = []; // Populate with participant's dataset
// const datasetScore = proctor.scoreDataset(dataset);
// console.log("Dataset Score:", datasetScore);

// // Example usage:
// const aggregateModel: LabeledPoint[] = []; // Populate with aggregate model data
// const stakingAmount = 100; // Example staking amount
// const proctor = new Proctor(aggregateModel, stakingAmount);

// // Example dataset
// const dataset: Point[] = []; // Populate with participant's dataset
// const datasetScore = proctor.scoreDataset(dataset);
// console.log('Dataset Score:', datasetScore);

// // Define interfaces for Point and AggregatedPoint

// import { Point } from "./Point";

// export interface AggregatedPoint {
//   x: number;
//   y: number;
//   z: number;
// }

// export class Proctor {
//   public scoreDataset(set: Point[], consensus: Point[]): number {}

//   private scorePoint(point: Point, stake: number): number {
//     const dMax = 1; // Maximum allowable distance
//     const pMax = 0.5; // Maximum allowable penalty
//     const sMax = 100; // Maximum staking amount
//     const nMax = 1000; // Maximum number of points

//     const distance = Math.sqrt(
//       Math.pow(point.x - aggregatedDataset.x, 2) +
//         Math.pow(point.y - aggregatedDataset.y, 2) +
//         Math.pow(point.z - aggregatedDataset.z, 2)
//     );

//     // Check if the point is too far from the aggregate model
//     if (distance > dMax) {
//       return 0;
//     }

//     // Calculate penalty
//     const penalty = Math.min(point.C * distance, pMax);

//     // Calculate score
//     const score =
//       point.C *
//       (1 - distance / dMax) *
//       (1 - penalty / pMax) *
//       (1 + Math.sqrt(stakingAmount) / Math.sqrt(sMax)) *
//       (1 + Math.sqrt(sampleDataset.length) / Math.sqrt(nMax));

//     return score;
//   }

//   // TODO: Remove, move to testing.
//   public example() {
//     // Sample dataset with diverse point values
//     const sampleDataset: Point[] = [
//       { x: 1, y: 2, z: 3, C: 0.8 },
//       { x: 2, y: 3, z: 4, C: 0.9 },
//       // Add more points...
//     ];

//     // Aggregated dataset (provided)
//     const aggregatedDataset: AggregatedPoint = { x: 2, y: 3, z: 4 };

//     // Constants for scoring formula

//     // Scoring formula

//     // Example usage
//     const stakingAmount = 50; // Sample staking amount
//     sampleDataset.forEach((point, index) => {
//       const pointScore = scorePoint(point, stakingAmount);
//       console.log(`Point ${index + 1} score: ${pointScore}`);
//     });
//   }
// }
