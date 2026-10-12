// A composition has a fixed length, not an experience level. Missing values
// keep legacy songs at three turns without rerolling saves or consuming RNG.
export const songTurns = song => song?.turns ?? 3;
export function compositionTurns(quality, random) {
  const q = Math.max(0, Math.min(100, quality)) / 100;
  const draw = random();
  return draw < .1 + .5 * q ? 5 : draw < .4 + .5 * q ? 4 : 3;
}
