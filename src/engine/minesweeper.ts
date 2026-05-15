import type { Cell, Difficulty, DifficultyConfig } from '../types';
import { DIFFICULTY_CONFIG } from '../types';

export function createEmptyBoard(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, (_, y) =>
    Array.from({ length: cols }, (_, x) => ({
      x,
      y,
      isMine: false,
      state: 'hidden' as const,
      adjacentMines: 0,
      probability: 0,
    }))
  );
}

export function placeMines(
  board: Cell[][],
  mines: number,
  safeX: number,
  safeY: number
): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;
  const next = board.map(row => row.map(cell => ({ ...cell })));

  const safeZone = new Set<string>();
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const ny = safeY + dy;
      const nx = safeX + dx;
      if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
        safeZone.add(`${nx},${ny}`);
      }
    }
  }

  const candidates: [number, number][] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!safeZone.has(`${x},${y}`)) candidates.push([x, y]);
    }
  }

  // Fisher-Yates shuffle to pick mine positions
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  for (let i = 0; i < mines && i < candidates.length; i++) {
    const [x, y] = candidates[i];
    next[y][x].isMine = true;
  }

  return computeAdjacent(next);
}

export function placeMinesSeeded(
  board: Cell[][],
  mines: number,
  rng: () => number
): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;
  const next = board.map(row => row.map(cell => ({ ...cell })));

  const candidates: [number, number][] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      candidates.push([x, y]);
    }
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  for (let i = 0; i < mines; i++) {
    const [x, y] = candidates[i];
    next[y][x].isMine = true;
  }

  return computeAdjacent(next);
}

function computeAdjacent(board: Cell[][]): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!board[y][x].isMine) {
        board[y][x].adjacentMines = getNeighbors(board, x, y).filter(
          c => c.isMine
        ).length;
      }
    }
  }
  return board;
}

export function getNeighbors(board: Cell[][], x: number, y: number): Cell[] {
  const rows = board.length;
  const cols = board[0].length;
  const neighbors: Cell[] = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const ny = y + dy;
      const nx = x + dx;
      if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
        neighbors.push(board[ny][nx]);
      }
    }
  }
  return neighbors;
}

export function revealCell(board: Cell[][], x: number, y: number): Cell[][] {
  const next = board.map(row => row.map(cell => ({ ...cell })));
  const cell = next[y][x];

  if (cell.state !== 'hidden') return next;
  cell.state = 'revealed';

  if (cell.adjacentMines === 0 && !cell.isMine) {
    floodReveal(next, x, y);
  }

  return next;
}

function floodReveal(board: Cell[][], x: number, y: number): void {
  const stack: [number, number][] = [[x, y]];

  while (stack.length > 0) {
    const [cx, cy] = stack.pop()!;
    const neighbors = getNeighbors(board, cx, cy);
    for (const n of neighbors) {
      if (n.state === 'hidden') {
        board[n.y][n.x].state = 'revealed';
        if (n.adjacentMines === 0 && !n.isMine) {
          stack.push([n.x, n.y]);
        }
      }
    }
  }
}

export function toggleFlag(board: Cell[][], x: number, y: number): Cell[][] {
  const next = board.map(row => row.map(cell => ({ ...cell })));
  const cell = next[y][x];
  if (cell.state === 'hidden') cell.state = 'flagged';
  else if (cell.state === 'flagged') cell.state = 'hidden';
  return next;
}

export function checkWin(board: Cell[][]): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.isMine && cell.state !== 'revealed') return false;
    }
  }
  return true;
}

export function revealAllMines(board: Cell[][]): Cell[][] {
  return board.map(row =>
    row.map(cell =>
      cell.isMine ? { ...cell, state: 'revealed' as const } : { ...cell }
    )
  );
}

export function countFlags(board: Cell[][]): number {
  return board.flat().filter(c => c.state === 'flagged').length;
}

export function countMines(board: Cell[][]): number {
  return board.flat().filter(c => c.isMine).length;
}

export function getBoardConfig(difficulty: Difficulty): DifficultyConfig {
  return DIFFICULTY_CONFIG[difficulty];
}
