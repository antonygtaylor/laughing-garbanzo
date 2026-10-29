import { HexCoord, HexCell } from './types';

export function coordKey(q: number, r: number): string {
  return `${q},${r}`;
}

export function parseCoordKey(key: string): HexCoord {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}

export function hexDistance(a: HexCoord, b: HexCoord = { q: 0, r: 0 }): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs((a.q + a.r) - (b.q + b.r))) / 2;
}

// Generate the 37-cell Star Board
export function generateStarBoardGrid(): HexCell[] {
  const cellsMap = new Map<string, HexCell>();

  // 1. Core Hexagon (radius <= 2)
  for (let q = -2; q <= 2; q++) {
    for (let r = -2; r <= 2; r++) {
      if (hexDistance({ q, r }) <= 2) {
        const key = coordKey(q, r);
        cellsMap.set(key, { q, r, id: key, isStarTip: false });
      }
    }
  }

  // 2. Six Star Tip extensions (3 cells per point)
  // Direction vectors along the 6 axes
  const tipPatterns: HexCoord[][] = [
    [{ q: 3, r: 0 }, { q: 4, r: 0 }, { q: 3, r: -1 }], // Direction 0 (+q)
    [{ q: 0, r: 3 }, { q: 0, r: 4 }, { q: -1, r: 3 }], // Direction 1 (+r)
    [{ q: -3, r: 3 }, { q: -4, r: 4 }, { q: -3, r: 4 }], // Direction 2 (-q, +r)
    [{ q: -3, r: 0 }, { q: -4, r: 0 }, { q: -3, r: 1 }], // Direction 3 (-q)
    [{ q: 0, r: -3 }, { q: 0, r: -4 }, { q: 1, r: -3 }], // Direction 4 (-r)
    [{ q: 3, r: -3 }, { q: 4, r: -4 }, { q: 3, r: -4 }], // Direction 5 (+q, -r)
  ];

  tipPatterns.forEach((pattern) => {
    pattern.forEach(({ q, r }) => {
      const key = coordKey(q, r);
      cellsMap.set(key, { q, r, id: key, isStarTip: true });
    });
  });

  return Array.from(cellsMap.values());
}

export const STAR_BOARD_CELLS = generateStarBoardGrid();
export const STAR_BOARD_CELL_KEYS = new Set(STAR_BOARD_CELLS.map(c => c.id));

export function isCoordOnBoard(coord: HexCoord): boolean {
  return STAR_BOARD_CELL_KEYS.has(coordKey(coord.q, coord.r));
}
