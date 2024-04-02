// TODO move to right place
import { Aggregator, Dataset, Point } from "./Aggregator";

// Set parameters for generating the dataset
const numParticipants = 5;
const minPointsPerParticipant = 10;
const maxPointsPerParticipant = 20;
const numDimensions = 3;
const chanceOfMatchingPoint = 0.3;

// Generate the dataset
const dataset: Dataset = Aggregator.generateDataset(
  numParticipants,
  minPointsPerParticipant,
  maxPointsPerParticipant,
  numDimensions,
  chanceOfMatchingPoint
);

// Instantiate the Aggregator class
const aggregator = new Aggregator();

// Flatten the dataset
const flattenedDataset = aggregator.flatten(dataset);

// Label the points in the flattened dataset
const labeledPoints = aggregator.label(flattenedDataset, 0.1);

// Aggregate the labeled points
const aggregatedPoints = aggregator.aggregate(labeledPoints);

// Clean the aggregated points based on a threshold confidence score
const threshold = 0.5;
const cleanedPoints = aggregator.clean(aggregatedPoints, threshold);

// Display the resulting aggregate array of points
console.log("Aggregated Points:");
console.log(cleanedPoints);
