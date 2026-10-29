import { HexCoord } from '../engine/types';

export function hexToPixel(coord: HexCoord, radius: number, center: { x: number; y: number } = { x: 0, y: 0 }) {
  const x = center.x + radius * Math.sqrt(3) * (coord.q + coord.r / 2);
  const y = center.y + radius * 1.5 * coord.r;
  return { x, y };
}

export function pixelToHex(x: number, y: number, radius: number, center: { x: number; y: number } = { x: 0, y: 0 }): HexCoord {
  const relX = x - center.x;
  const relY = y - center.y;

  const q = (Math.sqrt(3) / 3 * relX - 1 / 3 * relY) / radius;
  const r = (2 / 3 * relY) / radius;

  // Axial rounding to nearest hex
  return hexRound({ q, r });
}

export function hexRound(coord: { q: number; r: number }): HexCoord {
  let q = Math.round(coord.q);
  let r = Math.round(coord.r);
  let s = Math.round(-coord.q - coord.r);

  const qDiff = Math.abs(q - coord.q);
  const rDiff = Math.abs(r - coord.r);
  const sDiff = Math.abs(s - (-coord.q - coord.r));

  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s;
  } else if (rDiff > sDiff) {
    r = -q - s;
  }

  return { q, r };
}

export function getHexPolygonPoints(cx: number, cy: number, radius: number, inset: number = 1.5): string {
  const effectiveRadius = Math.max(1, radius - inset);
  const points: string[] = [];

  for (let i = 0; i < 6; i++) {
    const angleRad = (Math.PI / 180) * (60 * i - 30);
    const px = cx + effectiveRadius * Math.cos(angleRad);
    const py = cy + effectiveRadius * Math.sin(angleRad);
    points.push(`${px.toFixed(2)},${py.toFixed(2)}`);
  }

  return points.join(' ');
}
