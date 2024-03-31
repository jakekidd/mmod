// The radius for the earth mesh object.
export const EARTH_RADIUS = 4;

// Determine the LEO radius.
// The radius of the earth in real life is 6,371 km.
// Low earth orbit is anywhere 2,000 km from the surface.
// We want to extend the given earth radius by about 30%.
export const LEO_RADIUS = EARTH_RADIUS + EARTH_RADIUS * 0.3;

// MMOD sizing scalar.
export const MMOD_SCALE = 0.1;
