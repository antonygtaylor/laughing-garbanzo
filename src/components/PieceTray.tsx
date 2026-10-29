import React from 'react';
import { PlacedPiece } from '../engine/types';
import { PIECES } from '../engine/pieces';
import { PieceItem } from './PieceItem';

interface PieceTrayProps {
  placedPieces: Map<string, PlacedPiece>;
  selectedPieceId: string | null;
  pieceStates: Map<string, { rotation: number; flipped: boolean }>;
  onSelectPiece: (pieceId: string) => void;
  onPointerDownPiece: (e: React.PointerEvent, pieceId: string) => void;
}

export const PieceTray: React.FC<PieceTrayProps> = ({
  placedPieces,
  selectedPieceId,
  pieceStates,
  onSelectPiece,
  onPointerDownPiece,
}) => {
  const unplacedCount = PIECES.length - placedPieces.size;

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-900/80 backdrop-blur-md rounded-2xl p-2.5 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
          Piece Tray
        </span>
        <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          {unplacedCount} Remaining
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-[190px] overflow-y-auto pr-1 custom-scrollbar">
        {PIECES.map((piece) => {
          const isPlaced = placedPieces.has(piece.id);
          const isSelected = selectedPieceId === piece.id;
          const state = pieceStates.get(piece.id) || { rotation: 0, flipped: false };

          return (
            <PieceItem
              key={piece.id}
              piece={piece}
              rotation={state.rotation}
              flipped={state.flipped}
              isSelected={isSelected}
              isPlaced={isPlaced}
              onSelect={onSelectPiece}
              onPointerDown={onPointerDownPiece}
            />
          );
        })}
      </div>
    </div>
  );
};
