import fs from "fs";
import crypto from "crypto";
import path from "path";
import { MMOD } from "../scene/MMOD";

// Function to calculate position over time for MMOD objects and append to JSON file.
export function calculatePositionOverTimeAndAppend(
  mmod: MMOD,
  totalTime: number,
  timeStep: number,
  filePath: string
) {
  const positions: { x: number; y: number; z: number }[] = []; // Array to store positions.

  for (let t = 0; t <= totalTime; t += timeStep) {
    mmod.step(t, false); // Call the step method of MMOD with current time.
    positions.push({ ...mmod.toThreeJSPosition() }); // Store the current position.
  }

  // Generate a unique ID for the orbit.
  const orbitId = crypto
    .createHash("md5")
    .update(JSON.stringify(positions))
    .digest("hex");

  // Read existing data from the JSON file, if any.
  let orbitsData: {
    orbits: { [id: string]: { x: number; y: number; z: number }[] };
  } = { orbits: {} };
  if (fs.existsSync(filePath)) {
    orbitsData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  // Append the new orbit data to the existing JSON structure.
  orbitsData.orbits[orbitId] = positions;

  // Write the updated JSON data back to the file.
  fs.writeFileSync(filePath, JSON.stringify(orbitsData, null, 2));
}
