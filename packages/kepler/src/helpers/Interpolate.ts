// TODO: Should go in Point?
type TimestampedPoint = { x: number; y: number; z: number; t: number };

export class Interpolate {
  public static linear(
    point1: TimestampedPoint,
    point2: TimestampedPoint,
    currentTime: number
  ): TimestampedPoint {
    if (currentTime < point1.t || currentTime > point2.t) {
      throw new Error(
        "Interpolate.linear error: Current time must be between the timestamps of the two points."
      );
    }

    const ratio = (currentTime - point1.t) / (point2.t - point1.t);

    const x = point1.x + ratio * (point2.x - point1.x);
    const y = point1.y + ratio * (point2.y - point1.y);
    const z = point1.z + ratio * (point2.z - point1.z);

    return { x, y, z, t: currentTime };
  }
}
