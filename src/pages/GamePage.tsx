import React, { useEffect } from 'react';
import { GameBoard } from '../components/GameBoard';
import { ProbabilityOverlay } from '../components/ProbabilityOverlay';
import { AICoachPanel } from '../components/AICoachPanel';
import { Timer } from '../components/Timer';
import { DifficultyPicker } from '../components/DifficultyPicker';
import { DailyChallenge } from '../components/DailyChallenge';
import { ThemeToggle } from '../components/ThemeToggle';
import { useGame } from '../hooks/useGame';
import { generateDailyBoard } from '../engine/daily';
import { updateProfileWithSession } from '../store/gameState';
import type { Difficulty } from '../types';

interface GamePageProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onNavigateProfile: () => void;
  pendingDaily?: boolean;
  onDailyConsumed?: () => void;
}

export const GamePage: React.FC<GamePageProps> = ({
  theme,
  onToggleTheme,
  onNavigateProfile,
  pendingDaily = false,
  onDailyConsumed,
}) => {
  const {
    board,
    phase,
    difficulty,
    minesLeft,
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
  } = useGame();

  useEffect(() => {
    if (pendingDaily) {
      const board = generateDailyBoard();
      startGame('medium', board);
      onDailyConsumed?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDaily]);

  // Persist completed sessions to profile
  useEffect(() => {
    if (
      session &&
      (session.status === 'won' || session.status === 'lost') &&
      !isAnalyzing
    ) {
      updateProfileWithSession(session);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, session?.status, isAnalyzing]); // session?.id ensures once per game

  const handleDifficultyChange = (d: Difficulty) => {
    setDifficulty(d);
    resetGame();
  };

  const handlePlayAgain = () => {
    resetGame();
  };

  const showCoach =
    session &&
    (session.status === 'won' || session.status === 'lost') &&
    (session.insights.length > 0 || isAnalyzing);

  const statusEmoji =
    phase === 'won' ? '🏆' : phase === 'lost' ? '💥' : phase === 'playing' ? '😊' : '😴';

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-violet-400 tracking-tight">MindSweeper</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateProfile}
            className="px-3 py-1.5 rounded-lg text-sm text-gray-300
              bg-gray-800 border border-gray-700 hover:border-violet-500 transition-colors"
          >
            Profile
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row flex-1 gap-4 p-4 overflow-auto">
        {/* Left sidebar */}
        <div className="flex flex-col gap-3 lg:w-56 flex-shrink-0">
          <DifficultyPicker
            current={difficulty}
            onChange={handleDifficultyChange}
            disabled={phase === 'playing'}
          />
          <DailyChallenge
            onStart={preBuiltBoard => startGame('medium', preBuiltBoard)}
            session={session}
          />
          <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Mines left</span>
              <span className="font-mono font-bold text-red-400">💣 {minesLeft}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Time</span>
              <Timer elapsed={elapsed} />
            </div>
          </div>
          <div className="hidden lg:block text-xs text-gray-600 space-y-1">
            <p>Left click: reveal</p>
            <p>Right click: flag</p>
            <p>Mobile: hold to flag</p>
          </div>
        </div>

        {/* Game area */}
        <div className="flex flex-col items-center gap-3 flex-1">
          {/* Controls bar */}
          <div className="flex items-center gap-3 w-full flex-wrap">
            <ProbabilityOverlay
              show={showProbabilities}
              onToggle={toggleProbabilities}
            />
            <button
              onClick={() => {
                if (phase === 'idle') {
                  startGame();
                } else {
                  resetGame();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                bg-gray-700 border border-gray-600 hover:border-violet-500 text-gray-300 transition-colors"
            >
              <span className="text-base">{statusEmoji}</span>
              <span className="hidden sm:inline">
                {phase === 'idle' ? 'New Game' : 'Restart'}
              </span>
            </button>
          </div>

          {/* Board or start prompt */}
          {phase === 'idle' ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="text-6xl">💣</div>
              <h1 className="text-2xl font-bold text-white">MindSweeper</h1>
              <p className="text-gray-400 max-w-xs text-sm">
                Train your probabilistic thinking with AI-powered coaching.
              </p>
              <button
                onClick={() => startGame()}
                className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500
                  text-white font-semibold transition-colors"
              >
                Start Game
              </button>
            </div>
          ) : (
            <GameBoard
              board={board}
              showProbabilities={showProbabilities}
              onReveal={handleReveal}
              onFlag={handleFlag}
            />
          )}

          {/* Non-coach end state */}
          {(phase === 'won' || phase === 'lost') && !showCoach && !isAnalyzing && (
            <div className={`rounded-xl border p-4 text-center w-full max-w-sm
              ${phase === 'won' ? 'border-emerald-700 bg-emerald-950/30' : 'border-red-700 bg-red-950/30'}`}>
              <p className="text-lg font-bold text-white mb-1">
                {phase === 'won' ? '🏆 You won!' : '💥 Game over'}
              </p>
              <p className="text-sm text-gray-400 mb-3">
                {phase === 'won'
                  ? `Cleared in ${elapsed}s`
                  : 'Better luck next time'}
              </p>
              <button
                onClick={handlePlayAgain}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500
                  text-white text-sm font-semibold transition-colors"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Coach overlay */}
      {showCoach && session && (
        <AICoachPanel
          session={session}
          isAnalyzing={isAnalyzing}
          onPlayAgain={handlePlayAgain}
          onViewProfile={onNavigateProfile}
        />
      )}
    </div>
  );
};
