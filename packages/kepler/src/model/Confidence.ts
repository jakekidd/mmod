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
