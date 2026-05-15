export interface Cell {
  x: number;
  y: number;
  isMine: boolean;
  state: 'hidden' | 'revealed' | 'flagged';
  adjacentMines: number;
  probability: number;
}

export interface Move {
  cellX: number;
  cellY: number;
  action: 'reveal' | 'flag';
  timestamp: number;
  probabilityAtTime: number;
  wasSafe: boolean;
}

export interface Insight {
  moveIndex: number;
  text: string;
  type: 'good' | 'risky' | 'impulsive' | 'optimal';
  probability: number;
}

export interface GameSession {
  id: string;
  difficulty: 'easy' | 'medium' | 'expert';
  board: Cell[][];
  moves: Move[];
  insights: Insight[];
  status: 'playing' | 'won' | 'lost';
  startTime: number;
  endTime?: number;
  isDaily: boolean;
}

export interface UserProfile {
  totalGames: number;
  wins: number;
  streak: number;
  lastPlayedDate: string;
  impulsiveRatio: number;
  accurateRatio: number;
  thinkingStyle: 'impulsive' | 'calculated' | 'balanced';
  bestTimes: Record<string, number>;
  recentGames: GameSession[];
}

export type Difficulty = 'easy' | 'medium' | 'expert';

export interface DifficultyConfig {
  rows: number;
  cols: number;
  mines: number;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy:   { rows: 9,  cols: 9,  mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
};
