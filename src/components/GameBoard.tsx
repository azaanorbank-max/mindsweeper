import React from 'react';
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
  if (!board.length) return null;

  return (
    <div className="overflow-auto max-w-full">
      {/* touchAction:'none' prevents the browser interpreting swipes as
          scroll/zoom while the finger is over the board. Each Cell handles
          its own touch events (tap = reveal, long-press = flag). */}
      <div className="inline-block" style={{ touchAction: 'none' }}>
        {board.map((row, y) => (
          <div key={y} className="flex">
            {row.map(cell => (
              <Cell
                key={`${cell.x}-${cell.y}`}
                cell={cell}
                showProbability={showProbabilities}
                isExploded={
                  explodedCell?.x === cell.x && explodedCell?.y === cell.y
                }
                onReveal={onReveal}
                onFlag={onFlag}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
