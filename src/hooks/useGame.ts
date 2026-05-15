/// <reference types="vite/client" />
import { useState, useCallback, useRef } from 'react';
import type { Cell, GameSession, Move, Difficulty } from '../types';
import {
  createEmptyBoard,
  placeMines,
  revealCell,
  toggleFlag,
  checkWin,
  revealAllMines,
  getBoardConfig,
  countFlags,
} from '../engine/minesweeper';
import { calculateProbabilities } from '../engine/probability';
import { analyzeGame } from '../api/aiCoach';
import { useTimer } from './useTimer';

type GamePhase = 'idle' | 'playing' | 'won' | 'lost';

interface UseGameReturn {
  board: Cell[][];
  phase: GamePhase;
  difficulty: Difficulty;
  minesLeft: number;
  showProbabilities: boolean;
  session: GameSession | null;
  isAnalyzing: boolean;
  elapsed: number;
  setDifficulty: (d: Difficulty) => void;
  startGame: (d?: Difficulty, preBuiltBoard?: Cell[][]) => void;
  handleReveal: (x: number, y: number) => void;
  handleFlag: (x: number, y: number) => void;
  toggleProbabilities: () => void;
  resetGame: () => void;
}

function makeSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useGame(): UseGameReturn {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [difficulty, setDifficultyState] = useState<Difficulty>('medium');
  const [showProbabilities, setShowProbabilities] = useState(false);
  const [session, setSession] = useState<GameSession | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const firstClick = useRef(true);
  const movesRef = useRef<Move[]>([]);
  const { elapsed, start: startTimer, stop: stopTimer, reset: resetTimer } = useTimer();

  const getMinesLeft = useCallback((b: Cell[][]): number => {
    if (!b.length) return 0;
    const config = getBoardConfig(difficulty);
    return config.mines - countFlags(b);
  }, [difficulty]);

  const startGame = useCallback(
    (d?: Difficulty, preBuiltBoard?: Cell[][]) => {
      const diff = d ?? difficulty;
      const config = getBoardConfig(diff);
      const empty = preBuiltBoard ?? createEmptyBoard(config.rows, config.cols);
      const newSession: GameSession = {
        id: makeSessionId(),
        difficulty: diff,
        board: empty,
        moves: [],
        insights: [],
        status: 'playing',
        startTime: Date.now(),
        isDaily: !!preBuiltBoard,
      };
      movesRef.current = [];
      firstClick.current = !preBuiltBoard; // daily boards are pre-built
      setBoard(empty);
      setPhase('playing');
      setSession(newSession);
      resetTimer();
      startTimer();
    },
    [difficulty, resetTimer, startTimer]
  );

  const handleReveal = useCallback(
    (x: number, y: number) => {
      if (phase !== 'playing') return;

      setBoard(prev => {
        const cell = prev[y]?.[x];
        if (!cell || cell.state !== 'hidden') return prev;

        let current = prev;

        const boardConfig = getBoardConfig(difficulty);

        // First click: place mines avoiding this cell
        if (firstClick.current) {
          firstClick.current = false;
          current = placeMines(current, boardConfig.mines, x, y);
          current = calculateProbabilities(current, boardConfig.mines);
        }

        const probBefore = current[y][x].probability;
        const revealed = revealCell(current, x, y);
        const hitMine = revealed[y][x].isMine;

        const move: Move = {
          cellX: x,
          cellY: y,
          action: 'reveal',
          timestamp: Date.now(),
          probabilityAtTime: probBefore,
          wasSafe: !hitMine,
        };
        movesRef.current = [...movesRef.current, move];

        const remainingMines =
          boardConfig.mines - revealed.flat().filter(c => c.state === 'flagged').length;
        const withProb = calculateProbabilities(revealed, remainingMines);

        if (hitMine) {
          stopTimer();
          const final = revealAllMines(withProb);
          const endSession: GameSession = {
            ...(session ?? {
              id: makeSessionId(),
              difficulty,
              board: final,
              moves: movesRef.current,
              insights: [],
              status: 'lost',
              startTime: Date.now(),
              isDaily: false,
            }),
            moves: movesRef.current,
            board: final,
            status: 'lost',
            endTime: Date.now(),
          };
          setPhase('lost');
          setSession(endSession);
          runAnalysis(endSession);
          return final;
        }

        if (checkWin(withProb)) {
          stopTimer();
          const endSession: GameSession = {
            ...(session ?? {
              id: makeSessionId(),
              difficulty,
              board: withProb,
              moves: movesRef.current,
              insights: [],
              status: 'won',
              startTime: Date.now(),
              isDaily: false,
            }),
            moves: movesRef.current,
            board: withProb,
            status: 'won',
            endTime: Date.now(),
          };
          setPhase('won');
          setSession(endSession);
          runAnalysis(endSession);
        } else {
          setSession(prev2 =>
            prev2 ? { ...prev2, moves: movesRef.current } : prev2
          );
        }

        return withProb;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, difficulty, session, stopTimer]
  );

  const handleFlag = useCallback(
    (x: number, y: number) => {
      if (phase !== 'playing') return;
      setBoard(prev => {
        const cell = prev[y]?.[x];
        if (!cell || cell.state === 'revealed') return prev;

        const toggled = toggleFlag(prev, x, y);
        const isNowFlagged = toggled[y][x].state === 'flagged';
        const move: Move = {
          cellX: x,
          cellY: y,
          action: 'flag',
          timestamp: Date.now(),
          probabilityAtTime: prev[y][x].probability,
          wasSafe: !prev[y][x].isMine,
        };
        if (isNowFlagged) {
          movesRef.current = [...movesRef.current, move];
        }

        const config = getBoardConfig(difficulty);
        const remainingMines =
          config.mines - toggled.flat().filter(c => c.state === 'flagged').length;
        return calculateProbabilities(toggled, remainingMines);
      });
    },
    [phase, difficulty]
  );

  async function runAnalysis(s: GameSession) {
    if (!import.meta.env.VITE_ANTHROPIC_API_KEY) return;
    setIsAnalyzing(true);
    try {
      const insights = await analyzeGame(s);
      setSession(prev => (prev ? { ...prev, insights } : prev));
    } catch {
      // silently fail — UI shows "analysis unavailable"
    } finally {
      setIsAnalyzing(false);
    }
  }

  const toggleProbabilities = useCallback(() => {
    setShowProbabilities(p => !p);
  }, []);

  const resetGame = useCallback(() => {
    setBoard([]);
    setPhase('idle');
    setSession(null);
    movesRef.current = [];
    firstClick.current = true;
    resetTimer();
  }, [resetTimer]);

  const setDifficulty = useCallback((d: Difficulty) => {
    setDifficultyState(d);
  }, []);

  return {
    board,
    phase,
    difficulty,
    minesLeft: getMinesLeft(board),
    showProbabilities,
    session,
    isAnalyzing,
    elapsed,
    setDifficulty,
    startGame,
    handleReveal,
    handleFlag,
    toggleProbabilities,
    resetGame,
  };
}
