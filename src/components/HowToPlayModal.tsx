import React from 'react';
import { X, HelpCircle } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full text-slate-200 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-wide">How to Play</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <div className="flex gap-2">
            <div className="flex-none w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center text-[10px]">
              1
            </div>
            <p>
              <strong className="text-amber-400">The Board & Blockers:</strong> 7 red blocker gems are randomly placed on the 6-pointed star grid. Blockers cannot be covered or moved.
            </p>
          </div>

          <div className="flex gap-2">
            <div className="flex-none w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center text-[10px]">
              2
            </div>
            <p>
              <strong className="text-amber-400">The Objective:</strong> Fit all 8 polyhex puzzle pieces AND the 1-hex Little Star piece onto the remaining empty spaces of the board.
            </p>
          </div>

          <div className="flex gap-2">
            <div className="flex-none w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center text-[10px]">
              3
            </div>
            <p>
              <strong className="text-amber-400">Touch Controls:</strong> Tap or drag a piece to move it onto the board. Use the rotation (60°) and flip buttons to align the pieces.
            </p>
          </div>

          <div className="flex gap-2">
            <div className="flex-none w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center text-[10px]">
              4
            </div>
            <p>
              <strong className="text-amber-400">Guaranteed Solution:</strong> Every daily seed and random configuration is mathematically proven to have at least 1 valid solution!
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20"
        >
          Got It! Let's Play
        </button>
      </div>
    </div>
  );
};
