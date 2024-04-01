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
