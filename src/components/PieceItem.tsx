import React from 'react';
import { Piece } from '../engine/types';
import { transformShape } from '../engine/pieces';
import { hexToPixel, getHexPolygonPoints } from '../utils/svg';

interface PieceItemProps {
  piece: Piece;
  rotation: number;
  flipped: boolean;
  isSelected: boolean;
  isPlaced: boolean;
  onSelect: (pieceId: string) => void;
  onPointerDown: (e: React.PointerEvent, pieceId: string) => void;
  miniRadius?: number;
}

export const PieceItem: React.FC<PieceItemProps> = ({
  piece,
  rotation,
  flipped,
  isSelected,
  isPlaced,
  onSelect,
  onPointerDown,
  miniRadius = 11,
}) => {
  const transformedShape = transformShape(piece.shape, rotation, flipped);

  // Compute bounding box
  const pixelCoords = transformedShape.map(c => hexToPixel(c, miniRadius));
  const minX = Math.min(...pixelCoords.map(p => p.x)) - miniRadius - 2;
  const maxX = Math.max(...pixelCoords.map(p => p.x)) + miniRadius + 2;
  const minY = Math.min(...pixelCoords.map(p => p.y)) - miniRadius - 2;
  const maxY = Math.max(...pixelCoords.map(p => p.y)) + miniRadius + 2;

  const width = Math.max(48, maxX - minX);
  const height = Math.max(48, maxY - minY);
  const offsetX = -minX + (width - (maxX - minX)) / 2;
  const offsetY = -minY + (height - (maxY - minY)) / 2;

  return (
    <div
      className={`relative flex items-center justify-center p-1.5 rounded-xl transition-all cursor-grab active:cursor-grabbing touch-none select-none ${
        isPlaced
          ? 'opacity-30 bg-slate-900/40 border border-slate-800 scale-90'
          : isSelected
          ? 'bg-amber-500/20 border-2 border-amber-400 shadow-lg shadow-amber-500/10 scale-105'
          : 'bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/60 hover:border-slate-600'
      }`}
      onClick={() => onSelect(piece.id)}
      onPointerDown={(e) => !isPlaced && onPointerDown(e, piece.id)}
    >
      <svg width={width} height={height} className="overflow-visible">
        <g transform={`translate(${offsetX}, ${offsetY})`}>
          {pixelCoords.map((pt, idx) => (
            <polygon
              key={idx}
              points={getHexPolygonPoints(pt.x, pt.y, miniRadius, 1)}
              fill={piece.color}
              stroke={isSelected ? '#ffffff' : piece.strokeColor}
              strokeWidth={isSelected ? 2 : 1.5}
              strokeLinejoin="round"
            />
          ))}
        </g>
      </svg>
      {piece.isLittleStar && (
        <span className="absolute top-0.5 right-1 text-[9px] font-bold text-amber-300 uppercase tracking-tighter">
          Bonus
        </span>
      )}
    </div>
  );
};
