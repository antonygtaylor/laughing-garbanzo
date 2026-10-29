import { HexCoord, Piece } from './types';

// Rotate coordinates clockwise by step * 60 degrees
export function rotateCoord(coord: HexCoord, steps: number): HexCoord {
  let { q, r } = coord;
  const normalizedSteps = ((steps % 6) + 6) % 6;
  for (let i = 0; i < normalizedSteps; i++) {
    const nextQ = -r;
    const nextR = q + r;
    q = nextQ;
    r = nextR;
  }
  return { q, r };
}

// Flip coordinates horizontally
export function flipCoordH(coord: HexCoord): HexCoord {
  return { q: -coord.q - coord.r, r: coord.r };
}

// Normalize a set of shape coordinates so that top-left cell is at (0, 0) or lexicographically smallest
export function normalizeShape(coords: HexCoord[]): HexCoord[] {
  if (coords.length === 0) return [];

  // Sort lexicographically by r, then q
  const sorted = [...coords].sort((a, b) => a.r !== b.r ? a.r - b.r : a.q - b.q);
  const anchor = sorted[0];

  return sorted.map(c => ({
    q: c.q - anchor.q,
    r: c.r - anchor.r,
  }));
}

// Transform shape coordinates given rotation (0-5) and flipped state
export function transformShape(shape: HexCoord[], rotation: number, flipped: boolean): HexCoord[] {
  let transformed = shape.map(c => flipped ? flipCoordH(c) : { ...c });
  transformed = transformed.map(c => rotateCoord(c, rotation));
  return normalizeShape(transformed);
}

export function getAbsoluteCells(shape: HexCoord[], anchor: HexCoord, rotation: number, flipped: boolean): HexCoord[] {
  const transformed = transformShape(shape, rotation, flipped);
  return transformed.map(c => ({
    q: c.q + anchor.q,
    r: c.r + anchor.r,
  }));
}

// The 8 regular polyhex pieces + 1 Little Star piece (30 total cells)
export const PIECES: Piece[] = [
  {
    id: 'star',
    name: 'Little Star',
    color: '#F59E0B', // Amber Gold
    strokeColor: '#D97706',
    shape: [{ q: 0, r: 0 }],
    isLittleStar: true,
  },
  {
    id: 'duo-2',
    name: 'Duo',
    color: '#06B6D4', // Cyan
    strokeColor: '#0891B2',
    shape: [{ q: 0, r: 0 }, { q: 1, r: 0 }],
  },
  {
    id: 'tri-line',
    name: 'Tri Line',
    color: '#10B981', // Emerald
    strokeColor: '#059669',
    shape: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }],
  },
  {
    id: 'tri-v',
    name: 'Tri V',
    color: '#8B5CF6', // Purple
    strokeColor: '#7C3AED',
    shape: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }],
  },
  {
    id: 'tri-tri',
    name: 'Tri Compact',
    color: '#EC4899', // Pink
    strokeColor: '#DB2777',
    shape: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 1, r: -1 }],
  },
  {
    id: 'tetra-line',
    name: 'Tetra Line',
    color: '#3B82F6', // Blue
    strokeColor: '#2563EB',
    shape: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }, { q: 3, r: 0 }],
  },
  {
    id: 'tetra-y',
    name: 'Tetra Y',
    color: '#F97316', // Orange
    strokeColor: '#EA580C',
    shape: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }, { q: 1, r: 1 }],
  },
  {
    id: 'penta-ring',
    name: 'Penta Arch',
    color: '#EF4444', // Red
    strokeColor: '#DC2626',
    shape: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 2 }, { q: 0, r: 2 }],
  },
  {
    id: 'penta-star',
    name: 'Penta Diamond',
    color: '#14B8A6', // Teal
    strokeColor: '#0D9488',
    shape: [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }, { q: 1, r: 1 }, { q: 2, r: 0 }],
  },
];
