// Define interfaces for Point and AggregatedPoint

import { Point } from "./Point";

export interface AggregatedPoint {
  x: number;
  y: number;
  z: number;
}

export class Proctor {
  public scoreDataset(set: Point[], consensus: Point[]): number {}

  private scorePoint(point: Point, stake: number): number {
    const dMax = 1; // Maximum allowable distance
    const pMax = 0.5; // Maximum allowable penalty
    const sMax = 100; // Maximum staking amount
    const nMax = 1000; // Maximum number of points

    const distance = Math.sqrt(
      Math.pow(point.x - aggregatedDataset.x, 2) +
        Math.pow(point.y - aggregatedDataset.y, 2) +
        Math.pow(point.z - aggregatedDataset.z, 2)
    );

    // Check if the point is too far from the aggregate model
    if (distance > dMax) {
      return 0;
    }

    // Calculate penalty
    const penalty = Math.min(point.C * distance, pMax);

    // Calculate score
    const score =
      point.C *
      (1 - distance / dMax) *
      (1 - penalty / pMax) *
      (1 + Math.sqrt(stakingAmount) / Math.sqrt(sMax)) *
      (1 + Math.sqrt(sampleDataset.length) / Math.sqrt(nMax));

    return score;
  }

  // TODO: Remove, move to testing.
  public example() {
    // Sample dataset with diverse point values
    const sampleDataset: Point[] = [
      { x: 1, y: 2, z: 3, C: 0.8 },
      { x: 2, y: 3, z: 4, C: 0.9 },
      // Add more points...
    ];

    // Aggregated dataset (provided)
    const aggregatedDataset: AggregatedPoint = { x: 2, y: 3, z: 4 };

    // Constants for scoring formula

    // Scoring formula

    // Example usage
    const stakingAmount = 50; // Sample staking amount
    sampleDataset.forEach((point, index) => {
      const pointScore = scorePoint(point, stakingAmount);
      console.log(`Point ${index + 1} score: ${pointScore}`);
    });
  }
}
