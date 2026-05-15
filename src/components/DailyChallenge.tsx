import React, { useState, useEffect } from 'react';
import { getDailyId, generateDailyBoard, buildShareEmoji } from '../engine/daily';
import { getDailyResult, saveDailyResult } from '../store/gameState';
import type { DailyStoredResult } from '../store/gameState';
import type { Cell, GameSession } from '../types';

interface DailyChallengeProps {
  onStart: (board: Cell[][]) => void;
  session: GameSession | null;
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to legacy path
    }
  }
  // Legacy execCommand fallback (HTTP, older iOS Safari)
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(ta);
  return ok;
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({
  onStart,
  session,
}) => {
  const dailyId = getDailyId();
  const [result, setResult] = useState<DailyStoredResult | null>(() => getDailyResult(dailyId));
  const [copied, setCopied] = useState(false);

  // Persist result as soon as the daily game ends so Share works even after
  // the coach panel is dismissed (session → null) or after a page reload.
  useEffect(() => {
    if (!session || session.status === 'playing' || !session.isDaily) return;
    const won = session.status === 'won';
    const elapsedSeconds = session.endTime
      ? Math.round((session.endTime - session.startTime) / 1000)
      : 0;
    const moves = session.moves.map(m => ({
      cellX: m.cellX,
      cellY: m.cellY,
      wasSafe: m.wasSafe,
    }));
    saveDailyResult(dailyId, won, elapsedSeconds, moves);
    setResult({ won, date: dailyId, elapsedSeconds, moves });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, session?.status, dailyId]);

  const handleShare = async () => {
    if (!result) return;
    // Board is deterministic from the date — no live session needed.
    const board = generateDailyBoard(result.date);
    const text = buildShareEmoji(board, result.moves, result.won, result.elapsedSeconds);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStart = () => {
    const board = generateDailyBoard();
    onStart(board);
  };

  if (result) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800/50">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{result.won ? '🏆' : '💥'}</span>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Daily {dailyId}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {result.won ? 'Completed!' : 'Better luck tomorrow'}
            </p>
          </div>
        </div>
        <button
          onClick={handleShare}
          className="w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
            text-sm text-gray-700 dark:text-gray-200 font-medium border border-gray-200 dark:border-gray-600 transition-colors"
        >
          {copied ? '✅ Copied!' : '📋 Share Result'}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-violet-300 dark:border-violet-700/50 p-4 bg-violet-50 dark:bg-violet-950/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📅</span>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Daily Challenge</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{dailyId} · Medium difficulty</p>
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
