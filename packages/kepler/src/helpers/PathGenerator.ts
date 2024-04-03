import fs from "fs";
import crypto from "crypto";
import path from "path";
import { MMOD } from "../scene/MMOD";

// Function to calculate position over time for MMOD objects and append to JSON file.
export function calculatePositionOverTimeAndAppend(
  mmod: MMOD,
  totalTime: number,
  timeStep: number,
  dirPath: string
) {
  const positions: { x: number; y: number; z: number }[] = []; // Array to store positions.

  const start = new Date();
  for (let t = 0; t <= totalTime; t += timeStep) {
    if (t % 10000 === 0) {
      // Overwrite same line.
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(`${t} / ${totalTime} %${(t / totalTime) * 100}`);
    }

    mmod.step(t, false); // Call the step method of MMOD with current time.
    positions.push({ ...mmod.toThreeJSPosition() }); // Store the current position.
  }
  console.log(
    `Done in ${new Date().getUTCSeconds() - start.getUTCSeconds()}s.`
  );

  // Generate a unique ID for the orbit.
  console.log("Hashing ID...");
  const orbitId = crypto
    .createHash("md5")
    .update(JSON.stringify(positions))
    .digest("hex");
  const filepath = `${dirPath}/${orbitId}.json`;

  // Read existing data from the JSON file, if any.
  let orbitsData: {
    orbit: { x: number; y: number; z: number }[];
  } = { orbit: [] };
  if (fs.existsSync(filepath)) {
    orbitsData = JSON.parse(fs.readFileSync(filepath, "utf-8"));
  }

  let out =
    "[" + "\n" + positions.map((el) => JSON.stringify(el)).join(",\n") + "]";
  out = `{ \"orbit\": ${out} }`;

  // Write the updated JSON data back to the file.
  fs.writeFileSync(filepath, out);
}
