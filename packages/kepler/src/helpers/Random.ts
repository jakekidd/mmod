export class Random {
  public static number(min: number, max: number): number {
    // Min and max define the range that the random value will be generated in.
    return Math.random() * (max - min + 1) + min;
  }

  public static address(): string {
    return (
      "0x" +
      [...Array(40)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")
    );
  }
}
