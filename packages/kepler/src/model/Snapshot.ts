import { Point } from "./Point";
import { Vector } from "./Vector";

// export class Snapshot {
//   private _set: Set<Point> = new Set<Point>();
//   public get set(): Set<Point> {
//     // Create a deep copy of the privately-held point set.
//     const derivedSet: Set<Point> = new Set<Point>();
//     for (const point of Array.from(this._set.values())) {
//       derivedSet.add(
//         new Point(
//           point.x,
//           point.y,
//           point.z,
//           new Vector(point.V.a, point.V.b, point.V.c),
//           point.C
//         )
//       );
//     }
//     return derivedSet;
//   }

//   /**
//    * Add a point to the series.
//    * @param p Point object, representing coordinates of an MMOD.
//    */
//   public addPoint(p: Point) {
//     this._set.add(p);
//   }
// }
