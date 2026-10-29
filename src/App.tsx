import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameMode, HexCoord, PlacedPiece } from './engine/types';
import { generateBlockers, getTodayDateString } from './engine/dice';
import { PIECES, getAbsoluteCells } from './engine/pieces';
import { isCoordOnBoard, coordKey } from './engine/grid';
import { findHint } from './engine/solver';
import { Board } from './components/Board';
import { PieceTray } from './components/PieceTray';
import { PieceControls } from './components/PieceControls';
import { Header } from './components/Header';
import { VictoryModal } from './components/VictoryModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { soundFx } from './utils/audio';
import { loadUserStats, recordDailyCompletion, recordTimeAttackResult, saveUserStats, UserStats } from './utils/storage';
import { pixelToHex } from './utils/svg';

export default function App() {
  const [stats, setStats] = useState<UserStats>(loadUserStats);
  const [mode, setMode] = useState<GameMode>('daily');
  const [blockers, setBlockers] = useState<HexCoord[]>([]);
  const [placedPieces, setPlacedPieces] = useState<Map<string, PlacedPiece>>(new Map());
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);

  // Per-piece rotation and flip orientation states (pieceId -> { rotation, flipped })
  const [pieceOrientations, setPieceOrientations] = useState<Map<string, { rotation: number; flipped: boolean }>>(() => {
    const initial = new Map();
    PIECES.forEach(p => initial.set(p.id, { rotation: 0, flipped: false }));
    return initial;
  });

  // Timer state
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Modals
  const [isVictoryOpen, setIsVictoryOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);

  // Pointer drag state
  const [dragPreview, setDragPreview] = useState<{
    pieceId: string;
    hoverAnchor: HexCoord | null;
    rotation: number;
    flipped: boolean;
    isValid: boolean;
  } | null>(null);

  const activeDragRef = useRef<{
    pieceId: string;
    pointerId: number;
  } | null>(null);

  // Initialize or change game puzzle
  const startNewGame = useCallback((newMode: GameMode) => {
    setMode(newMode);
    setPlacedPieces(new Map());
    setSelectedPieceId(null);
    setIsVictoryOpen(false);
    setTimeElapsed(0);
    setTimerActive(true);

    // Reset piece orientations
    const resetOr = new Map();
    PIECES.forEach(p => resetOr.set(p.id, { rotation: 0, flipped: false }));
    setPieceOrientations(resetOr);

    let seedString: string | undefined;
    if (newMode === 'daily') {
      seedString = getTodayDateString();
    } else {
      seedString = undefined; // Random for timeattack / practice
    }

    const newBlockers = generateBlockers(seedString);
    setBlockers(newBlockers);
  }, []);

  useEffect(() => {
    startNewGame('daily');
  }, [startNewGame]);

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  // Check victory whenever placedPieces updates
  useEffect(() => {
    if (placedPieces.size === PIECES.length && PIECES.length > 0) {
      setTimerActive(false);

      if (mode === 'daily') {
        const dateStr = getTodayDateString();
        const updatedStats = recordDailyCompletion(dateStr);
        setStats(updatedStats);
      } else if (mode === 'timeattack') {
        const updatedStats = recordTimeAttackResult(timeElapsed);
        setStats(updatedStats);
      }

      setIsVictoryOpen(true);
    }
  }, [placedPieces, mode, timeElapsed]);

  // Piece transformation controls
  const handleRotateCw = () => {
    if (!selectedPieceId) return;
    setPieceOrientations(prev => {
      const next = new Map(prev);
      const curr = next.get(selectedPieceId) || { rotation: 0, flipped: false };
      next.set(selectedPieceId, { ...curr, rotation: (curr.rotation + 1) % 6 });
      return next;
    });

    // Update placed piece if currently placed
    setPlacedPieces(prev => {
      const placed = prev.get(selectedPieceId);
      if (!placed) return prev;
      const pieceDef = PIECES.find(p => p.id === selectedPieceId);
      if (!pieceDef) return prev;

      const currOrient = pieceOrientations.get(selectedPieceId) || { rotation: 0, flipped: false };
      const nextRot = (currOrient.rotation + 1) % 6;
      const newAbs = getAbsoluteCells(pieceDef.shape, placed.position, nextRot, currOrient.flipped);

      // Check collision
      const blockerKeys = new Set(blockers.map(b => coordKey(b.q, b.r)));
      let valid = true;
      for (const cell of newAbs) {
        if (!isCoordOnBoard(cell) || blockerKeys.has(coordKey(cell.q, cell.r))) {
          valid = false;
          break;
        }
        for (const [otherId, otherPiece] of prev.entries()) {
          if (otherId === selectedPieceId) continue;
          if (otherPiece.cells.some(c => c.q === cell.q && c.r === cell.r)) {
            valid = false;
            break;
          }
        }
      }

      if (valid) {
        const nextMap = new Map(prev);
        nextMap.set(selectedPieceId, { ...placed, rotation: nextRot, cells: newAbs });
        return nextMap;
      }
      return prev;
    });
  };

  const handleRotateCcw = () => {
    if (!selectedPieceId) return;
    setPieceOrientations(prev => {
      const next = new Map(prev);
      const curr = next.get(selectedPieceId) || { rotation: 0, flipped: false };
      next.set(selectedPieceId, { ...curr, rotation: (curr.rotation + 5) % 6 });
      return next;
    });
  };

  const handleFlip = () => {
    if (!selectedPieceId) return;
    setPieceOrientations(prev => {
      const next = new Map(prev);
      const curr = next.get(selectedPieceId) || { rotation: 0, flipped: false };
      next.set(selectedPieceId, { ...curr, flipped: !curr.flipped });
      return next;
    });
  };

  const handleUnplace = () => {
    if (!selectedPieceId) return;
    setPlacedPieces(prev => {
      const next = new Map(prev);
      next.delete(selectedPieceId);
      return next;
    });
  };

  // Hint button
  const handleHint = () => {
    const hintPlacement = findHint(blockers, placedPieces);
    if (hintPlacement) {
      soundFx.playPlace();
      soundFx.vibrate(30);

      setPlacedPieces(prev => new Map(prev).set(hintPlacement.pieceId, hintPlacement));
      setSelectedPieceId(hintPlacement.pieceId);

      setPieceOrientations(prev => {
        const next = new Map(prev);
        next.set(hintPlacement.pieceId, { rotation: hintPlacement.rotation, flipped: hintPlacement.flipped });
        return next;
      });
    } else {
      soundFx.playError();
      alert('No valid hint available for the current board state! Try moving or removing some pieces.');
    }
  };

  // Pointer drag events for smooth touch drag-and-drop
  const handlePointerDownPiece = (e: React.PointerEvent, pieceId: string) => {
    setSelectedPieceId(pieceId);
    soundFx.playSelect();
    soundFx.vibrate(10);

    activeDragRef.current = {
      pieceId,
      pointerId: e.pointerId,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDragRef.current) return;

    const pieceId = activeDragRef.current.pieceId;
    const pieceDef = PIECES.find(p => p.id === pieceId);
    if (!pieceDef) return;

    // Convert mouse/touch screen coords to SVG board coords
    const boardSvg = document.querySelector('svg');
    if (!boardSvg) return;

    const rect = boardSvg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 440;
    const svgY = ((e.clientY - rect.top) / rect.height) * 440;

    const hoverCell = pixelToHex(svgX, svgY, 26, { x: 220, y: 220 });

    if (isCoordOnBoard(hoverCell)) {
      const orient = pieceOrientations.get(pieceId) || { rotation: 0, flipped: false };
      const absCells = getAbsoluteCells(pieceDef.shape, hoverCell, orient.rotation, orient.flipped);

      // Check collision
      const blockerKeys = new Set(blockers.map(b => coordKey(b.q, b.r)));
      let valid = true;

      for (const cell of absCells) {
        const key = coordKey(cell.q, cell.r);
        if (!isCoordOnBoard(cell) || blockerKeys.has(key)) {
          valid = false;
          break;
        }

        for (const [placedId, placedPiece] of placedPieces.entries()) {
          if (placedId === pieceId) continue;
          if (placedPiece.cells.some(c => c.q === cell.q && c.r === cell.r)) {
            valid = false;
            break;
          }
        }
      }

      setDragPreview({
        pieceId,
        hoverAnchor: hoverCell,
        rotation: orient.rotation,
        flipped: orient.flipped,
        isValid: valid,
      });
    } else {
      setDragPreview(null);
    }
  };

  const handlePointerUp = () => {
    if (!activeDragRef.current) return;

    if (dragPreview && dragPreview.hoverAnchor && dragPreview.isValid) {
      const pieceId = dragPreview.pieceId;
      const pieceDef = PIECES.find(p => p.id === pieceId);

      if (pieceDef) {
        const absCells = getAbsoluteCells(pieceDef.shape, dragPreview.hoverAnchor, dragPreview.rotation, dragPreview.flipped);

        soundFx.playPlace();
        soundFx.vibrate(25);

        setPlacedPieces(prev => {
          const next = new Map(prev);
          next.set(pieceId, {
            pieceId,
            position: dragPreview.hoverAnchor!,
            rotation: dragPreview.rotation,
            flipped: dragPreview.flipped,
            cells: absCells,
          });
          return next;
        });
      }
    } else if (dragPreview && !dragPreview.isValid) {
      soundFx.playError();
      soundFx.vibrate(40);
    }

    activeDragRef.current = null;
    setDragPreview(null);
  };

  const isSelectedPlaced = selectedPieceId ? placedPieces.has(selectedPieceId) : false;

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-2 select-none touch-none overflow-hidden font-sans"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <Header
        mode={mode}
        onSelectMode={startNewGame}
        timeElapsed={timeElapsed}
        dailyStreak={stats.dailyStreak}
        soundEnabled={stats.soundEnabled}
        onToggleSound={() => {
          const updated = { ...stats, soundEnabled: !stats.soundEnabled };
          setStats(updated);
          saveUserStats(updated);
          soundFx.setEnabled(updated.soundEnabled);
        }}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
      />

      <main className="flex-1 flex flex-col items-center justify-center space-y-1 my-auto">
        <Board
          blockers={blockers}
          placedPieces={placedPieces}
          selectedPieceId={selectedPieceId}
          dragPreview={dragPreview}
          onPieceSelect={(pId) => {
            setSelectedPieceId(pId);
            soundFx.playSelect();
          }}
        />

        <PieceControls
          selectedPieceId={selectedPieceId}
          onRotateCw={handleRotateCw}
          onRotateCcw={handleRotateCcw}
          onFlip={handleFlip}
          onUnplace={handleUnplace}
          onHint={handleHint}
          isPlaced={isSelectedPlaced}
        />
      </main>

      <footer className="w-full">
        <PieceTray
          placedPieces={placedPieces}
          selectedPieceId={selectedPieceId}
          pieceStates={pieceOrientations}
          onSelectPiece={(pId) => {
            setSelectedPieceId(pId);
            soundFx.playSelect();
          }}
          onPointerDownPiece={handlePointerDownPiece}
        />
      </footer>

      <VictoryModal
        isOpen={isVictoryOpen}
        mode={mode}
        timeElapsed={timeElapsed}
        streak={stats.dailyStreak}
        bestTime={stats.timeAttackBestSeconds}
        onPlayNext={() => startNewGame(mode)}
      />

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />
    </div>
  );
}
