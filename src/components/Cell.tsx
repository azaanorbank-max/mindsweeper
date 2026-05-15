import React, { useRef } from 'react';
import type { Cell as CellType } from '../types';
import { getProbabilityColor } from '../engine/probability';

interface CellProps {
  cell: CellType;
  showProbability: boolean;
  isExploded?: boolean;
  onReveal: (x: number, y: number) => void;
  onFlag: (x: number, y: number) => void;
}

const NUMBER_COLORS: Record<number, string> = {
  1: 'text-blue-400',
  2: 'text-emerald-400',
  3: 'text-red-400',
  4: 'text-purple-400',
  5: 'text-yellow-600',
  6: 'text-cyan-400',
  7: 'text-pink-400',
  8: 'text-gray-400',
};

const CellComponent: React.FC<CellProps> = ({
  cell,
  showProbability,
  isExploded = false,
  onReveal,
  onFlag,
}) => {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks whether the 500ms threshold was reached so touchEnd knows not to reveal
  const longPressFired = useRef(false);

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent browser from treating this as a scroll gesture on the cell itself.
    // (The outer board container has touchAction:'none' for the same reason.)
    e.preventDefault();
    longPressFired.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      longPressTimer.current = null;
      onFlag(cell.x, cell.y);
    }, 500);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Suppress the synthetic mouse click the browser fires after touchend —
    // without this, onClick would fire too and reveal would be called twice.
    e.preventDefault();
    cancelLongPress();
    if (!longPressFired.current) {
      onReveal(cell.x, cell.y);
    }
    longPressFired.current = false;
  };

  const handleTouchMove = () => {
    // Finger moved away (likely scrolling the board) — cancel the long press
    // but do NOT reveal, since the touch didn't end on this cell.
    cancelLongPress();
  };

  // Desktop mouse handlers
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onReveal(cell.x, cell.y);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onFlag(cell.x, cell.y);
  };

  if (cell.state === 'revealed') {
    if (cell.isMine) {
      return (
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-sm rounded-sm select-none
            ${isExploded ? 'bg-red-600' : 'bg-gray-700 dark:bg-gray-600'}`}
        >
          💣
        </div>
      );
    }
    return (
      <div
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-sm font-bold
          rounded-sm bg-gray-200 dark:bg-gray-700 select-none border border-gray-300 dark:border-gray-600"
      >
        {cell.adjacentMines > 0 && (
          <span className={NUMBER_COLORS[cell.adjacentMines] ?? 'text-gray-400'}>
            {cell.adjacentMines}
          </span>
        )}
      </div>
    );
  }

  if (cell.state === 'flagged') {
    return (
      <button
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-sm rounded-sm
          bg-gray-400 dark:bg-gray-500 hover:bg-gray-300 dark:hover:bg-gray-400
          border-2 border-t-gray-200 border-l-gray-200 border-b-gray-600 border-r-gray-600
          select-none cursor-pointer active:scale-95 transition-transform"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        aria-label="Flagged cell"
      >
        🚩
      </button>
    );
  }

  // Hidden cell
  const probColor =
    showProbability && cell.probability >= 0
      ? getProbabilityColor(cell.probability)
      : '';

  return (
    <button
      className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-xs font-bold rounded-sm
        border-2 border-t-gray-300 border-l-gray-300 border-b-gray-500 border-r-gray-500
        hover:brightness-110 active:scale-95 transition-transform select-none cursor-pointer
        ${showProbability && cell.probability >= 0 ? probColor : 'bg-gray-400 dark:bg-gray-500'}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      aria-label={`Hidden cell at ${cell.x},${cell.y}`}
    >
      {showProbability && cell.probability >= 0 && (
        <span className="text-[10px] font-bold leading-none">
          {cell.probability}
        </span>
      )}
    </button>
  );
};

export const Cell = React.memo(CellComponent);
