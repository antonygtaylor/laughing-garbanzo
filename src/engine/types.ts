export interface HexCoord {
  q: number;
  r: number;
}

export interface HexCell extends HexCoord {
  id: string; // key "q,r"
  isStarTip?: boolean;
}

export interface Piece {
  id: string;
  name: string;
  color: string;
  strokeColor: string;
  shape: HexCoord[]; // relative axial coordinates from anchor (0,0)
  isLittleStar?: boolean;
}

export interface PlacedPiece {
  pieceId: string;
  position: HexCoord; // anchor position on grid
  rotation: number; // 0, 1, 2, 3, 4, 5 (x 60 deg)
  flipped: boolean;
  cells: HexCoord[]; // absolute grid coords occupied by this piece
}

export interface PuzzleState {
  blockers: HexCoord[];
  placedPieces: Map<string, PlacedPiece>; // pieceId -> PlacedPiece
}

export type GameMode = 'daily' | 'timeattack' | 'practice';
