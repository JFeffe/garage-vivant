// Screen-space bodies include their labels so nearby UI moves as one unit.
export function clampBody(b, width, height, margin = 8) {
  b.x = Math.max(b.w / 2 + margin, Math.min(width - b.w / 2 - margin, b.x));
  b.y = Math.max(b.h / 2 + margin, Math.min(height - b.h / 2 - margin, b.y));
}
export function overlaps(a, b, gap = 8) {
  return Math.abs(a.x - b.x) < (a.w + b.w) / 2 + gap - .1 &&
    Math.abs(a.y - b.y) < (a.h + b.h) / 2 + gap - .1;
}
export function resolveBodies(bodies, held, width, height, passes = 18) {
  bodies.forEach(b => clampBody(b, width, height));
  for (let pass = 0; pass < passes; pass++) {
    let changed = false;
    for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i], b = bodies[j], dx = b.x - a.x, dy = b.y - a.y;
      const px = (a.w + b.w) / 2 + 8 - Math.abs(dx);
      const py = (a.h + b.h) / 2 + 8 - Math.abs(dy);
      if (px <= .05 || py <= .05) continue;
      changed = true;
      const axis = px < py ? 'x' : 'y', amount = (axis === 'x' ? px : py) + .05;
      const sign = (axis === 'x' ? dx : dy) >= 0 ? 1 : -1;
      const ma = a === held ? 0 : b === held ? 1 : .5;
      const mb = b === held ? 0 : a === held ? 1 : .5;
      a[axis] -= sign * amount * ma; b[axis] += sign * amount * mb;
      clampBody(a, width, height); clampBody(b, width, height);
    }
    if (!changed) return true;
  }
  return !bodies.some((a, i) => bodies.slice(i + 1).some(b => overlaps(a, b)));
}
export function serializeLayout(bodies, width, height) {
  return { version: 1, items: bodies.map(b => ({ id: b.id, x: b.x / width, y: b.y / height })) };
}
export function readLayout(raw) {
  try {
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (value?.version !== 1 || !Array.isArray(value.items)) return null;
    const ids = new Set();
    for (const p of value.items) {
      if (typeof p.id !== 'string' || ids.has(p.id) || !Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1) return null;
      ids.add(p.id);
    }
    return value;
  } catch { return null; }
}
