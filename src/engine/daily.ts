import type { Cell } from '../types';
import { createEmptyBoard, placeMinesSeeded } from './minesweeper';
import { DIFFICULTY_CONFIG } from '../types';

function seededRng(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i);
    h |= 0;
  }
  // xorshift32
  let state = h >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

export function getDailyId(date?: Date): string {
  const d = date ?? new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function generateDailyBoard(dateStr?: string): Cell[][] {
  const id = dateStr ?? getDailyId();
  const config = DIFFICULTY_CONFIG.medium;
  const rng = seededRng(`mindsweeper-daily-${id}`);
  const empty = createEmptyBoard(config.rows, config.cols);
  return placeMinesSeeded(empty, config.mines, rng);
}

export function buildShareEmoji(
  board: Cell[][],
  moves: Array<{ cellX: number; cellY: number; wasSafe: boolean }>,
  won: boolean
): string {
  const rows = board.length;
  const cols = board[0].length;

  // Build a mini 5×5 representation (sample every N cells)
  const stepY = Math.floor(rows / 5);
  const stepX = Math.floor(cols / 5);

  const revealedSafe = new Set(
    moves.filter(m => m.wasSafe).map(m => `${m.cellX},${m.cellY}`)
  );
  const revealedMine = new Set(
    moves.filter(m => !m.wasSafe).map(m => `${m.cellX},${m.cellY}`)
  );

  let grid = '';
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      const cy = Math.min(y * stepY, rows - 1);
      const cx = Math.min(x * stepX, cols - 1);
      const key = `${cx},${cy}`;
      if (revealedMine.has(key)) grid += '💥';
      else if (revealedSafe.has(key)) grid += '🟩';
      else if (board[cy][cx].isMine) grid += '🟥';
      else grid += '⬜';
    }
    grid += '\n';
  }

  const id = getDailyId();
  const result = won ? '✅' : '❌';
  return `MindSweeper Daily ${id} ${result}\n${grid}\nmindsweeper.app`;
}
