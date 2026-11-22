// VAULTBREAK — line-of-sight geometry. Vision cones and camera sectors are
// drawn as ray fans clipped by the walls, and detection uses a single ray from
// the watcher to the thief, so what the player sees is exactly what the game
// enforces: a wall that hides you on screen hides you from the guard.

/** Smallest positive t at which segment p->p+r meets segment q->q+s, or Infinity. */
function segmentHit(px, py, rx, ry, qx, qy, sx, sy) {
  const denom = rx * sy - ry * sx;
  if (Math.abs(denom) < 1e-9) return Infinity;
  const dx = qx - px;
  const dy = qy - py;
  const t = (dx * sy - dy * sx) / denom;
  const u = (dx * ry - dy * rx) / denom;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? t : Infinity;
}

/** Distance from (ox,oy) along angle to the nearest wall segment, capped at maxDist. */
export function rayDistance(ox, oy, angle, segments, maxDist) {
  const rx = Math.cos(angle);
  const ry = Math.sin(angle);
  let best = maxDist;
  for (const seg of segments) {
    const t = segmentHit(ox, oy, rx * maxDist, ry * maxDist, seg.x1, seg.y1, seg.x2 - seg.x1, seg.y2 - seg.y1);
    if (t < 1) best = Math.min(best, t * maxDist);
  }
  return best;
}

/** True when nothing blocks the straight line from (x1,y1) to (x2,y2). */
export function lineOfSight(x1, y1, x2, y2, segments) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  for (const seg of segments) {
    if (segmentHit(x1, y1, dx, dy, seg.x1, seg.y1, seg.x2 - seg.x1, seg.y2 - seg.y1) < 1) return false;
  }
  return true;
}

/**
 * Can a watcher at (x,y) facing `facing` see the point (tx,ty)? Checks range,
 * the field-of-view wedge and occlusion, in that order.
 */
export function canSee(x, y, facing, range, halfAngle, tx, ty, segments) {
  const dx = tx - x;
  const dy = ty - y;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;
  let diff = Math.atan2(dy, dx) - facing;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  if (Math.abs(diff) > halfAngle) return false;
  return lineOfSight(x, y, tx, ty, segments);
}

/** Polygon of a vision fan: origin plus one vertex per ray, each ray wall-clipped. */
export function conePolygon(x, y, facing, range, halfAngle, segments, rays = 26) {
  const points = [{ x, y }];
  for (let i = 0; i <= rays; i += 1) {
    const angle = facing - halfAngle + (2 * halfAngle * i) / rays;
    const d = rayDistance(x, y, angle, segments, range);
    points.push({ x: x + Math.cos(angle) * d, y: y + Math.sin(angle) * d });
  }
  return points;
}

/** Distance from point (px,py) to the segment (x1,y1)-(x2,y2). */
export function pointSegmentDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}
