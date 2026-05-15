import type { Cell } from '../types';
import { getNeighbors } from './minesweeper';

export function calculateProbabilities(
  board: Cell[][],
  remainingMines: number
): Cell[][] {
  const next = board.map(row => row.map(cell => ({ ...cell })));

  const hiddenCells = next.flat().filter(c => c.state === 'hidden');
  const totalHidden = hiddenCells.length;

  if (totalHidden === 0) return next;

  // Reset probabilities
  for (const cell of hiddenCells) {
    next[cell.y][cell.x].probability = -1; // -1 = not yet constrained
  }

  // Apply constraints from revealed numbered cells
  for (const row of next) {
    for (const cell of row) {
      if (cell.state !== 'revealed' || cell.isMine) continue;

      const neighbors = getNeighbors(next, cell.x, cell.y);
      const hiddenNeighbors = neighbors.filter(n => n.state === 'hidden');
      const flaggedNeighbors = neighbors.filter(n => n.state === 'flagged');
      const effectiveMines = cell.adjacentMines - flaggedNeighbors.length;

      if (hiddenNeighbors.length === 0) continue;

      let prob: number;
      if (effectiveMines <= 0) {
        prob = 0;
      } else if (effectiveMines === hiddenNeighbors.length) {
        prob = 100;
      } else {
        prob = Math.round((effectiveMines / hiddenNeighbors.length) * 100);
      }

      for (const hn of hiddenNeighbors) {
        const cur = next[hn.y][hn.x].probability;
        next[hn.y][hn.x].probability = cur === -1 ? prob : Math.max(cur, prob);
      }
    }
  }

  // Cells with no revealed neighbours get global baseline probability
  const flaggedMines = next.flat().filter(c => c.state === 'flagged').length;
  const adjustedRemaining = Math.max(0, remainingMines - flaggedMines);
  const unconstrained = hiddenCells.filter(
    c => next[c.y][c.x].probability === -1
  );

  const baseline =
    unconstrained.length > 0
      ? Math.round((adjustedRemaining / totalHidden) * 100)
      : 0;

  for (const cell of unconstrained) {
    next[cell.y][cell.x].probability = Math.min(100, Math.max(0, baseline));
  }

  // Clamp all to [0, 100]
  for (const cell of hiddenCells) {
    const p = next[cell.y][cell.x].probability;
    next[cell.y][cell.x].probability = Math.min(100, Math.max(0, p));
  }

  return next;
}

export function getProbabilityColor(probability: number): string {
  if (probability <= 25) return 'bg-emerald-500 text-white';
  if (probability <= 60) return 'bg-yellow-400 text-black';
  return 'bg-red-500 text-white';
}

export function getProbabilityBorderColor(probability: number): string {
  if (probability <= 25) return 'border-emerald-400';
  if (probability <= 60) return 'border-yellow-400';
  return 'border-red-400';
}
