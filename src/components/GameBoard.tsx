import React, { useRef } from 'react';
import type { Cell as CellType } from '../types';
import { Cell } from './Cell';

interface GameBoardProps {
  board: CellType[][];
  showProbabilities: boolean;
  explodedCell?: { x: number; y: number };
  onReveal: (x: number, y: number) => void;
  onFlag: (x: number, y: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  showProbabilities,
  explodedCell,
  onReveal,
  onFlag,
}) => {
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTarget = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (x: number, y: number) => {
    longPressTarget.current = { x, y };
    longPressRef.current = setTimeout(() => {
      if (longPressTarget.current) {
        onFlag(longPressTarget.current.x, longPressTarget.current.y);
        longPressTarget.current = null;
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  if (!board.length) return null;

  return (
    <div className="overflow-auto max-w-full">
      <div
        className="inline-block"
        style={{ touchAction: 'none' }}
      >
        {board.map((row, y) => (
          <div key={y} className="flex">
            {row.map(cell => (
              <div
                key={`${cell.x}-${cell.y}`}
                onTouchStart={() => handleTouchStart(cell.x, cell.y)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchEnd}
              >
                <Cell
                  cell={cell}
                  showProbability={showProbabilities}
                  isExploded={
                    explodedCell?.x === cell.x && explodedCell?.y === cell.y
                  }
                  onReveal={onReveal}
                  onFlag={onFlag}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
