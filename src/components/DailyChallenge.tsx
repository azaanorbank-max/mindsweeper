import React, { useState, useEffect } from 'react';
import { getDailyId, generateDailyBoard, buildShareEmoji } from '../engine/daily';
import { getDailyResult, saveDailyResult } from '../store/gameState';
import type { Cell, GameSession } from '../types';

interface DailyChallengeProps {
  onStart: (board: Cell[][]) => void;
  session: GameSession | null;
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({
  onStart,
  session,
}) => {
  const dailyId = getDailyId();
  const [result, setResult] = useState(() => getDailyResult(dailyId));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (session && (session.status === 'won' || session.status === 'lost') && session.isDaily) {
      const won = session.status === 'won';
      saveDailyResult(dailyId, won);
      setResult({ won, date: dailyId });
    }
  }, [session, dailyId]);

  const handleShare = () => {
    if (!session) return;
    const emoji = buildShareEmoji(
      session.board.length ? session.board : generateDailyBoard(),
      session.moves,
      session.status === 'won'
    );
    navigator.clipboard.writeText(emoji).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStart = () => {
    const board = generateDailyBoard();
    onStart(board);
  };

  if (result) {
    return (
      <div className="rounded-xl border border-gray-700 p-4 bg-gray-800/50">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{result.won ? '🏆' : '💥'}</span>
          <div>
            <p className="text-sm font-semibold text-white">
              Daily {dailyId}
            </p>
            <p className="text-xs text-gray-400">
              {result.won ? 'Completed!' : 'Better luck tomorrow'}
            </p>
          </div>
        </div>
        <button
          onClick={handleShare}
          className="w-full py-2 rounded-lg bg-gray-700 hover:bg-gray-600
            text-sm text-gray-200 font-medium border border-gray-600 transition-colors"
        >
          {copied ? '✅ Copied!' : '📋 Share Result'}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-violet-700/50 p-4 bg-violet-950/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📅</span>
        <div>
          <p className="text-sm font-semibold text-white">Daily Challenge</p>
          <p className="text-xs text-gray-400">{dailyId} · Medium difficulty</p>
        </div>
      </div>
      <button
        onClick={handleStart}
        className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-500
          text-sm text-white font-semibold transition-colors"
      >
        Play Today's Board
      </button>
    </div>
  );
};
