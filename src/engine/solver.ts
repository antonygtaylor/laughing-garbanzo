import { HexCoord, PlacedPiece } from './types';
import { STAR_BOARD_CELLS, coordKey, isCoordOnBoard } from './grid';
import { PIECES, transformShape } from './pieces';

interface PieceOrientation {
  pieceId: string;
  rotation: number;
  flipped: boolean;
  coords: HexCoord[];
}

const PIECE_ORIENTATIONS: Map<string, PieceOrientation[]> = new Map();

PIECES.forEach(piece => {
  const orientations: PieceOrientation[] = [];
  const seenShapes = new Set<string>();

  for (const flipped of [false, true]) {
    for (let rotation = 0; rotation < 6; rotation++) {
      const coords = transformShape(piece.shape, rotation, flipped);
      const key = coords.map(c => `${c.q},${c.r}`).sort().join(';');
      if (!seenShapes.has(key)) {
        seenShapes.add(key);
        orientations.push({
          pieceId: piece.id,
          rotation,
          flipped,
          coords,
        });
      }
    }
  }

  PIECE_ORIENTATIONS.set(piece.id, orientations);
});

export function solveBoard(
  blockers: HexCoord[],
  maxSolutions: number = 1
): PlacedPiece[][] {
  const blockerKeys = new Set(blockers.map(b => coordKey(b.q, b.r)));
  const freeBoardCells = STAR_BOARD_CELLS.filter(c => !blockerKeys.has(c.id));

  const solutions: PlacedPiece[][] = [];
  const placedMap = new Map<string, PlacedPiece>();
  const occupiedKeys = new Set<string>(blockerKeys);

  const remainingPieces = PIECES.map(p => p.id);

  function backtrack(): boolean {
    if (solutions.length >= maxSolutions) return true;

    // MRV: Find the free cell with the FEWEST possible valid piece placements covering it
    let bestCell: HexCoord | null = null;
    let minCandidateOptions: {
      pieceIdx: number;
      orient: PieceOrientation;
      anchor: HexCoord;
      pieceCells: HexCoord[];
    }[] | null = null;

    let unassignedCount = 0;

    for (const cell of freeBoardCells) {
      if (occupiedKeys.has(cell.id)) continue;
      unassignedCount++;

      const options: {
        pieceIdx: number;
        orient: PieceOrientation;
        anchor: HexCoord;
        pieceCells: HexCoord[];
      }[] = [];

      for (let pIdx = 0; pIdx < remainingPieces.length; pIdx++) {
        const pieceId = remainingPieces[pIdx];
        const orientations = PIECE_ORIENTATIONS.get(pieceId) || [];

        for (const orient of orientations) {
          for (const rel of orient.coords) {
            const anchor: HexCoord = {
              q: cell.q - rel.q,
              r: cell.r - rel.r,
            };

            let valid = true;
            const pieceCells: HexCoord[] = [];

            for (const c of orient.coords) {
              const absQ = c.q + anchor.q;
              const absR = c.r + anchor.r;
              const key = coordKey(absQ, absR);

              if (!isCoordOnBoard({ q: absQ, r: absR }) || occupiedKeys.has(key)) {
                valid = false;
                break;
              }
              pieceCells.push({ q: absQ, r: absR });
            }

            if (valid) {
              options.push({ pieceIdx: pIdx, orient, anchor, pieceCells });
            }
          }
        }
      }

      // Zero candidates to cover this cell -> Dead end! Fail fast!
      if (options.length === 0) {
        return false;
      }

      if (minCandidateOptions === null || options.length < minCandidateOptions.length) {
        minCandidateOptions = options;
        bestCell = cell;
        if (options.length === 1) break; // Hard constraint reached
      }
    }

    // All cells occupied -> solution!
    if (unassignedCount === 0 || !bestCell || !minCandidateOptions) {
      solutions.push(Array.from(placedMap.values()));
      return solutions.length >= maxSolutions;
    }

    // Try all valid options for bestCell
    for (const opt of minCandidateOptions) {
      const pieceId = remainingPieces[opt.pieceIdx];

      // Place piece
      opt.pieceCells.forEach(c => occupiedKeys.add(coordKey(c.q, c.r)));
      const placedPiece: PlacedPiece = {
        pieceId,
        position: opt.anchor,
        rotation: opt.orient.rotation,
        flipped: opt.orient.flipped,
        cells: opt.pieceCells,
      };
      placedMap.set(pieceId, placedPiece);
      remainingPieces.splice(opt.pieceIdx, 1);

      if (backtrack()) return true;

      // Backtrack
      remainingPieces.splice(opt.pieceIdx, 0, pieceId);
      placedMap.delete(pieceId);
      opt.pieceCells.forEach(c => occupiedKeys.delete(coordKey(c.q, c.r)));
    }

    return false;
  }

  backtrack();
  return solutions;
}

export function findHint(
  blockers: HexCoord[],
  placedPieces: Map<string, PlacedPiece>
): PlacedPiece | null {
  const fixedBlockers: HexCoord[] = [...blockers];
  placedPieces.forEach(p => {
    p.cells.forEach(c => fixedBlockers.push(c));
  });

  const unplacedPieceIds = PIECES.filter(p => !placedPieces.has(p.id)).map(p => p.id);
  if (unplacedPieceIds.length === 0) return null;

  const solutions = solveBoard(fixedBlockers, 1);
  if (solutions.length > 0) {
    const solMap = solutions[0];
    for (const p of solMap) {
      if (!placedPieces.has(p.pieceId)) {
        return p;
      }
    }
  }

  return null;
}
