import React from 'react';
import { Calendar, Timer, Sparkles, HelpCircle, Volume2, VolumeX, Flame } from 'lucide-react';
import { GameMode } from '../engine/types';

interface HeaderProps {
  mode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  timeElapsed: number;
  dailyStreak: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHowToPlay: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onSelectMode,
  timeElapsed,
  dailyStreak,
  soundEnabled,
  onToggleSound,
  onOpenHowToPlay,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <header className="w-full max-w-lg mx-auto p-2 space-y-2">
      {/* Top Brand & Actions Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 text-lg">
            ⭐
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-wider text-slate-100 leading-tight">
              GENIUS STAR
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
              <span className="flex items-center gap-0.5 text-amber-400">
                <Flame className="w-3 h-3 fill-amber-400" />
                {dailyStreak} Streak
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-mono font-semibold">
                ⏱️ {formatTime(timeElapsed)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 transition-all"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={onOpenHowToPlay}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 transition-all"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game Mode Navigation Tabs */}
      <nav className="flex p-1 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => onSelectMode('daily')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all ${
            mode === 'daily'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Daily</span>
        </button>

        <button
          onClick={() => onSelectMode('timeattack')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all ${
            mode === 'timeattack'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          <span>Speed</span>
        </button>

        <button
          onClick={() => onSelectMode('practice')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all ${
            mode === 'practice'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Practice</span>
        </button>
      </nav>
    </header>
  );
};
