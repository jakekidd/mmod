// Derived confidence score type is functionally a `number` but constrained between
// 0 and 1. Confidence depicts the point instantiator's belief in the position and velocity.
type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;
type IntRange<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;
export type Confidence = IntRange<0, 1>;

export class Vector {
  /**
   * A vector is essentially a readonly tuple of three points that represent the direction
   * of an object and its velocity, which is illustrated by how far away the vector's head
   * is from the origin point.
   * @param a X position of the head of the vector.
   * @param b Y position of the head.
   * @param c Z position of the head.
   */
  constructor(
    public readonly a: number,
    public readonly b: number,
    public readonly c: number
  ) {}
}

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
