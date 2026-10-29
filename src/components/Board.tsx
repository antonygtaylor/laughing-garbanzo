import React from 'react';
import { HexCoord, PlacedPiece } from '../engine/types';
import { STAR_BOARD_CELLS, coordKey } from '../engine/grid';
import { PIECES, getAbsoluteCells } from '../engine/pieces';
import { hexToPixel, getHexPolygonPoints } from '../utils/svg';

interface BoardProps {
  blockers: HexCoord[];
  placedPieces: Map<string, PlacedPiece>;
  selectedPieceId: string | null;
  dragPreview: {
    pieceId: string;
    hoverAnchor: HexCoord | null;
    rotation: number;
    flipped: boolean;
    isValid: boolean;
  } | null;
  onCellClick?: (coord: HexCoord) => void;
  onPieceSelect?: (pieceId: string) => void;
  radius?: number;
}

export const Board: React.FC<BoardProps> = ({
  blockers,
  placedPieces,
  selectedPieceId,
  dragPreview,
  onPieceSelect,
  radius = 26,
}) => {
  const center = { x: 220, y: 220 };
  const blockerSet = new Set(blockers.map(b => coordKey(b.q, b.r)));

  // Map of coordKey -> piece occupying it
  const cellOccupantMap = new Map<string, { pieceId: string; color: string; strokeColor: string; isSelected: boolean }>();

  placedPieces.forEach((placed) => {
    const pieceDef = PIECES.find(p => p.id === placed.pieceId);
    if (!pieceDef) return;

    placed.cells.forEach((cell) => {
      const key = coordKey(cell.q, cell.r);
      cellOccupantMap.set(key, {
        pieceId: placed.pieceId,
        color: pieceDef.color,
        strokeColor: pieceDef.strokeColor,
        isSelected: placed.pieceId === selectedPieceId,
      });
    });
  });

  // Calculate drag preview cells if dragging
  const dragPreviewCells: { key: string; isValid: boolean; color: string }[] = [];
  if (dragPreview && dragPreview.hoverAnchor) {
    const pieceDef = PIECES.find(p => p.id === dragPreview.pieceId);
    if (pieceDef) {
      const absCells = getAbsoluteCells(pieceDef.shape, dragPreview.hoverAnchor, dragPreview.rotation, dragPreview.flipped);
      absCells.forEach((c) => {
        dragPreviewCells.push({
          key: coordKey(c.q, c.r),
          isValid: dragPreview.isValid,
          color: dragPreview.isValid ? '#10B981' : '#EF4444',
        });
      });
    }
  }

  const dragPreviewMap = new Map(dragPreviewCells.map(c => [c.key, c]));

  return (
    <div className="relative flex justify-center items-center select-none w-full max-w-[440px] aspect-square mx-auto p-1">
      <svg
        viewBox="0 0 440 440"
        className="w-full h-full drop-shadow-2xl overflow-visible"
        style={{ touchAction: 'none' }}
      >
        <defs>
          {/* Subtle grid cell gradients & filters */}
          <radialGradient id="starBoardBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>

          <filter id="neonGlowValid" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="neonGlowInvalid" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="blockerGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#ef4444" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Board Background Grid Cells */}
        <g id="board-cells">
          {STAR_BOARD_CELLS.map((cell) => {
            const { x, y } = hexToPixel(cell, radius, center);
            const key = cell.id;
            const isBlocker = blockerSet.has(key);
            const occupant = cellOccupantMap.get(key);
            const preview = dragPreviewMap.get(key);

            // Hide normal cell rendering if piece is currently placed here unless it's being previewed
            let fillColor = cell.isStarTip ? '#1e293b' : '#334155';
            let strokeColor = cell.isStarTip ? '#334155' : '#475569';
            let strokeWidth = 1.5;
            let opacity = 0.9;
            let filter: string | undefined = undefined;

            if (isBlocker) {
              fillColor = '#451a03'; // Warm dark mahogany blocker
              strokeColor = '#f59e0b'; // Amber border
              strokeWidth = 2;
            } else if (occupant) {
              fillColor = occupant.color;
              strokeColor = occupant.isSelected ? '#ffffff' : occupant.strokeColor;
              strokeWidth = occupant.isSelected ? 3 : 2;
              opacity = 1;
            }

            if (preview) {
              fillColor = preview.color;
              strokeColor = preview.isValid ? '#34d399' : '#f87171';
              strokeWidth = 3;
              opacity = 0.85;
              filter = preview.isValid ? 'url(#neonGlowValid)' : 'url(#neonGlowInvalid)';
            }

            return (
              <g
                key={key}
                className="transition-all duration-150 cursor-pointer"
                onClick={() => occupant && onPieceSelect && onPieceSelect(occupant.pieceId)}
              >
                <polygon
                  points={getHexPolygonPoints(x, y, radius, 1.5)}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                  filter={filter}
                  strokeLinejoin="round"
                />

                {/* Blocker Icon */}
                {isBlocker && (
                  <g transform={`translate(${x - 8}, ${y - 8})`} filter="url(#blockerGlow)">
                    <circle cx="8" cy="8" r="7" fill="#dc2626" />
                    <text x="8" y="11.5" textAnchor="middle" fontSize="10" fill="#ffffff" fontWeight="bold">✕</text>
                  </g>
                )}

                {/* Star tip highlight dot if empty */}
                {!isBlocker && !occupant && !preview && cell.isStarTip && (
                  <circle cx={x} cy={y} r="2" fill="#64748b" opacity="0.6" />
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
