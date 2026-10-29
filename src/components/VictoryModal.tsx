import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Flame, Share2, RotateCcw } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface VictoryModalProps {
  isOpen: boolean;
  mode: 'daily' | 'timeattack' | 'practice';
  timeElapsed: number; // seconds
  streak: number;
  bestTime: number | null;
  onPlayNext: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  mode,
  timeElapsed,
  streak,
  bestTime,
  onPlayNext,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundFx.playWin();
      soundFx.vibrate(100);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'],
        });
      } catch {
        // Fallback if canvas confetti fails
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const shareResult = async () => {
    const text = `⭐ The Genius Star - ${mode.toUpperCase()} MODE ⭐\nI solved the puzzle in ${formatTime(timeElapsed)}! ⏱️\nCurrent Streak: ${streak} 🔥\nPlay at: https://geniusstar.app`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'The Genius Star Victory',
          text,
        });
      } catch {
        navigator.clipboard.writeText(text);
        alert('Result copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Result copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl space-y-5">
        <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
          <Trophy className="w-10 h-10 animate-bounce" />
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-wide text-white">Puzzle Solved!</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            {mode === 'daily' ? 'Daily Challenge Complete' : mode === 'timeattack' ? 'Time Attack Complete' : 'Practice Completed'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
          <div className="p-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Time</span>
            <div className="text-xl font-extrabold text-amber-400 mt-0.5">{formatTime(timeElapsed)}</div>
          </div>

          <div className="p-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">
              {mode === 'daily' ? 'Daily Streak' : 'Best Time'}
            </span>
            <div className="text-xl font-extrabold text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
              {mode === 'daily' ? (
                <>
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <span>{streak} d</span>
                </>
              ) : (
                <span>{bestTime !== null ? formatTime(bestTime) : '--:--'}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={shareResult}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <button
            onClick={onPlayNext}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 font-bold rounded-xl transition-all border border-slate-700 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{mode === 'daily' ? 'Play Again' : 'Next Puzzle'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
