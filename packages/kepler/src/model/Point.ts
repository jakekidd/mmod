import { Confidence } from "./Confidence";
import { Vector } from "./Vector";

export class Point {
  /**
   * A point in our model represents a micro-meteroid or orbital debris object greater than 10cm
   * in diameter. The location of a point is in km.
   * @param x X position.
   * @param y Y position.
   * @param z Z position.
   * @param V Velocity vector.
   * @param C Confidence scoring.
   */
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
    public readonly V: Vector,
    public readonly C: Confidence
  ) {}

  /**
   * The scalar represents the magnitude component of the velocity vector.
   * @returns Magnitude expressed as a number in km/s.
   */
  public getScalar(): number {
    return Math.sqrt(
      (this.x - this.V.a) ** 2 + (this.y - this.V.b) ** 2 + (this.z - this.V.c)
    );
  }
}
