// Ceiling anchors stay fixed; only the two bottom corners follow the musician.
export function spotlightVertices(ceiling, target, halfWidth = 1.15, out = new Float32Array(9)) {
  out.set([
    ceiling.x, ceiling.y, ceiling.z,
    target.x - halfWidth, target.y, target.z,
    target.x + halfWidth, target.y, target.z,
  ]);
  return out;
}
