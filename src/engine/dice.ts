import { HexCoord } from './types';
import { STAR_BOARD_CELLS } from './grid';
import { solveBoard } from './solver';

// Mulberry32 PRNG
export function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash >>> 0;
}

// Generate 7 valid blocker coordinates guaranteed to be solvable
export function generateBlockers(seedString?: string): HexCoord[] {
  const seed = seedString ? stringToSeed(seedString) : Math.floor(Math.random() * 1000000000);
  const rng = mulberry32(seed);

  const available = [...STAR_BOARD_CELLS];

  // Try up to 50 attempts to find a solvable set of 7 blockers
  for (let attempt = 0; attempt < 50; attempt++) {
    const shuffled = [...available];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const candidateBlockers = shuffled.slice(0, 7).map(c => ({ q: c.q, r: c.r }));

    // Check if solvable
    const solutions = solveBoard(candidateBlockers, 1);
    if (solutions.length > 0) {
      return candidateBlockers;
    }
  }

  // Fallback: A known solvable blocker configuration
  return [
    { q: 0, r: 0 },
    { q: 2, r: 0 },
    { q: -2, r: 2 },
    { q: 0, r: -2 },
    { q: 3, r: -1 },
    { q: -3, r: 3 },
    { q: -1, r: -1 },
  ];
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
