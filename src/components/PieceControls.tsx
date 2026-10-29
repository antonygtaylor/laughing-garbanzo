import React from 'react';
import { RotateCw, RotateCcw, FlipHorizontal, Undo2, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface PieceControlsProps {
  selectedPieceId: string | null;
  onRotateCw: () => void;
  onRotateCcw: () => void;
  onFlip: () => void;
  onUnplace: () => void;
  onHint?: () => void;
  isPlaced: boolean;
}

export const PieceControls: React.FC<PieceControlsProps> = ({
  selectedPieceId,
  onRotateCw,
  onRotateCcw,
  onFlip,
  onUnplace,
  onHint,
  isPlaced,
}) => {
  if (!selectedPieceId && !onHint) {
    return (
      <div className="h-14 flex items-center justify-center text-slate-400 text-xs tracking-wide">
        Select a piece to rotate or place onto the board
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 p-2 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl max-w-md mx-auto my-1">
      {selectedPieceId ? (
        <>
          <button
            onClick={() => {
              soundFx.playRotate();
              soundFx.vibrate(15);
              onRotateCcw();
            }}
            className="flex-1 flex flex-col items-center justify-center py-2 px-3 bg-slate-800 hover:bg-slate-700 active:bg-amber-500/20 active:scale-95 text-slate-200 hover:text-amber-400 rounded-xl transition-all border border-slate-700/60"
            title="Rotate Left (60°)"
          >
            <RotateCcw className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">Rotate L</span>
          </button>

          <button
            onClick={() => {
              soundFx.playRotate();
              soundFx.vibrate(15);
              onRotateCw();
            }}
            className="flex-1 flex flex-col items-center justify-center py-2 px-3 bg-slate-800 hover:bg-slate-700 active:bg-amber-500/20 active:scale-95 text-slate-200 hover:text-amber-400 rounded-xl transition-all border border-slate-700/60"
            title="Rotate Right (60°)"
          >
            <RotateCw className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">Rotate R</span>
          </button>

          <button
            onClick={() => {
              soundFx.playRotate();
              soundFx.vibrate(15);
              onFlip();
            }}
            className="flex-1 flex flex-col items-center justify-center py-2 px-3 bg-slate-800 hover:bg-slate-700 active:bg-cyan-500/20 active:scale-95 text-slate-200 hover:text-cyan-400 rounded-xl transition-all border border-slate-700/60"
            title="Flip Horizontally"
          >
            <FlipHorizontal className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">Flip</span>
          </button>

          {isPlaced && (
            <button
              onClick={() => {
                soundFx.playSelect();
                soundFx.vibrate(15);
                onUnplace();
              }}
              className="flex-1 flex flex-col items-center justify-center py-2 px-3 bg-rose-950/40 hover:bg-rose-900/60 active:bg-rose-600/30 active:scale-95 text-rose-300 hover:text-rose-200 rounded-xl transition-all border border-rose-800/50"
              title="Return Piece to Tray"
            >
              <Undo2 className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium tracking-tight">Unplace</span>
            </button>
          )}
        </>
      ) : (
        onHint && (
          <button
            onClick={() => {
              soundFx.playSelect();
              soundFx.vibrate(20);
              onHint();
            }}
            className="flex items-center gap-2 py-2 px-4 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl transition-all border border-amber-500/40 text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Need a Hint?</span>
          </button>
        )
      )}
    </div>
  );
};
