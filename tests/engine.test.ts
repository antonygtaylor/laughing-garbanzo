import { describe, it, expect } from 'vitest';
import { generateStarBoardGrid, coordKey, isCoordOnBoard } from '../src/engine/grid';
import { rotateCoord, flipCoordH, transformShape, PIECES } from '../src/engine/pieces';
import { generateBlockers, stringToSeed, mulberry32 } from '../src/engine/dice';
import { solveBoard } from '../src/engine/solver';

describe('Grid Math & Geometry', () => {
  it('generates a 37-cell star board', () => {
    const grid = generateStarBoardGrid();
    expect(grid.length).toBe(37);

    // Ensure all cell keys are unique
    const keySet = new Set(grid.map(c => c.id));
    expect(keySet.size).toBe(37);
  });

  it('correctly identifies valid board coordinates', () => {
    expect(isCoordOnBoard({ q: 0, r: 0 })).toBe(true);
    expect(isCoordOnBoard({ q: 2, r: -2 })).toBe(true);
    expect(isCoordOnBoard({ q: 10, r: 10 })).toBe(false);
  });
});

describe('Piece Transformations', () => {
  it('completes 60-degree rotation cycle (6 steps = 360 deg)', () => {
    const start = { q: 1, r: 2 };
    let current = start;
    for (let i = 0; i < 6; i++) {
      current = rotateCoord(current, 1);
    }
    expect(current).toEqual(start);
  });

  it('horizontal flip is self-inversing', () => {
    const start = { q: 2, r: -1 };
    const flippedOnce = flipCoordH(start);
    const flippedTwice = flipCoordH(flippedOnce);
    expect(flippedTwice).toEqual(start);
  });

  it('normalizes piece shapes correctly after transformation', () => {
    const duoPiece = PIECES.find(p => p.id === 'duo-2')!;
    const transformed = transformShape(duoPiece.shape, 2, true);
    expect(transformed.length).toBe(2);
    // Anchor should be at (0, 0) or lexicographically smallest
    expect(transformed[0]).toEqual({ q: 0, r: 0 });
  });
});

describe('Seeded PRNG & Blockers', () => {
  it('produces deterministic blockers for the same seed', () => {
    const seedStr = '2025-01-01';
    const blockers1 = generateBlockers(seedStr);
    const blockers2 = generateBlockers(seedStr);
    expect(blockers1).toEqual(blockers2);
    expect(blockers1.length).toBe(7);
  });

  it('generates solvable blocker configurations', () => {
    const blockers = generateBlockers('test-seed-123');
    const solutions = solveBoard(blockers, 1);
    expect(solutions.length).toBeGreaterThan(0);

    // Verify solution occupies all 30 remaining board cells with no overlaps
    const solMap = solutions[0];
    expect(solMap.length).toBe(PIECES.length);

    const occupiedCells = new Set<string>();
    blockers.forEach(b => occupiedCells.add(coordKey(b.q, b.r)));

    solMap.forEach((placed) => {
      placed.cells.forEach((cell) => {
        const key = coordKey(cell.q, cell.r);
        expect(occupiedCells.has(key)).toBe(false); // No overlap with blockers or other pieces
        occupiedCells.add(key);
      });
    });

    // Total occupied cells must equal total board cells (37)
    expect(occupiedCells.size).toBe(37);
  });
});
