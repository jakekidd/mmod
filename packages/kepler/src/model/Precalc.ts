import { calculatePositionOverTimeAndAppend } from "../helpers/PathGenerator";
import { MMOD } from "../scene/MMOD";

// Generate a bundle of stable flight paths over a given number of days.
export function precalc() {
  // Determine target count. If `count` argument is passed, we use that, otherwise
  // default is 500 MMODs.
  let targetCount = 500;
  if (process.argv.length >= 4) {
    for (let i = 0; i < process.argv.length; i++) {
      if (process.argv[i] === "--count" && i < process.argv.length - 2) {
        const argCount = parseInt(process.argv[i + 1]);
        if (!isNaN(argCount)) {
          console.log(`Adjusting count to match argument: ${argCount}`);
          targetCount = argCount;
        }
      }
    }
  }

  // Determine target time period. If `days` is passed in, we use that, otherwise the
  // default is 50 days.
  let targetDays = 50;
  if (process.argv.length >= 4) {
    for (let i = 0; i < process.argv.length; i++) {
      if (process.argv[i] === "--days" && i < process.argv.length - 2) {
        const argDays = parseInt(process.argv[i + 1]);
        if (!isNaN(argDays)) {
          console.log(`Adjusting days to match argument: ${argDays}`);
          targetDays = argDays;
        }
      }
    }
  }
  // Convert targetDays to ms.
  const targetTime = targetDays * 24 * 60 * 60 * 1000;

  // Determine target time parity. This will determine the "framerate" of the sim. If `parity`
  // is passed in, we use that, otherwise the default is 1 second.
  let targetParity = 1000; // In ms to match targetTime.
  if (process.argv.length >= 4) {
    for (let i = 0; i < process.argv.length; i++) {
      if (process.argv[i] === "--days" && i < process.argv.length - 2) {
        const argParity = parseInt(process.argv[i + 1]);
        if (!isNaN(argParity)) {
          console.log(`Adjusting days to match argument: ${argParity}`);
          targetParity = argParity;
        }
      }
    }
  }

  const mmods: MMOD[] = [];
  for (let i = 0; i < targetCount; i++) {
    const mmod = new MMOD();
    mmods.push(mmod);
  }

  // Go through each MMOD and run the path generator.
  for (let i = 0; i < mmods.length; i++) {
    console.log(`Calculating path for MMOD ${i}...`);
    // calculatePositionOverTimeAndAppend(
    //   mmods[i],
    //   targetTime,
    //   targetParity,
    //   "../precalc.json"
    // );
  }

  // Example usage
  // const mmod = new MMOD(scene); // Assuming you have a THREE.Scene object named 'scene'
  // const totalTime = 3600; // Total simulation time in seconds (e.g., 1 hour)
  // const timeStep = 60; // Time step for each iteration in seconds (e.g., 60 seconds)
  // const filePath = path.join(__dirname, 'orbits.json'); // Path to the JSON file
  // calculatePositionOverTimeAndAppend(mmod, totalTime, timeStep, filePath);
}

precalc();
