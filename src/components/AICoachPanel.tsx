/// <reference types="vite/client" />
import React from 'react';
import type { Insight, GameSession } from '../types';

interface AICoachPanelProps {
  session: GameSession;
  isAnalyzing: boolean;
  onPlayAgain: () => void;
  onViewProfile: () => void;
}

const TYPE_CONFIG: Record<
  Insight['type'],
  { icon: string; label: string; className: string }
> = {
  good:      { icon: '✅', label: 'Good move',    className: 'border-emerald-600 bg-emerald-950/40' },
  optimal:   { icon: '🎯', label: 'Optimal',      className: 'border-violet-600 bg-violet-950/40' },
  risky:     { icon: '⚠️', label: 'Risky move',   className: 'border-yellow-600 bg-yellow-950/40' },
  impulsive: { icon: '💥', label: 'Impulsive',    className: 'border-red-600 bg-red-950/40' },
};

export const AICoachPanel: React.FC<AICoachPanelProps> = ({
  session,
  isAnalyzing,
  onPlayAgain,
  onViewProfile,
}) => {
  const won = session.status === 'won';
  const elapsed = session.endTime
    ? Math.round((session.endTime - session.startTime) / 1000)
    : 0;
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  const revealMoves = session.moves.filter(m => m.action === 'reveal');
  const impulsiveMoves = revealMoves.filter(m => m.probabilityAtTime > 50).length;
  const safeMoves = revealMoves.filter(m => m.probabilityAtTime <= 25).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl
        bg-gray-900 border border-gray-700 shadow-2xl flex flex-col">

        {/* Header */}
        <div className={`px-6 py-5 rounded-t-2xl ${won ? 'bg-emerald-900/60' : 'bg-red-900/60'}`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{won ? '🏆' : '💥'}</span>
            <div>
              <h2 className="text-xl font-bold text-white">
                {won ? 'You won!' : 'Game over'}
              </h2>
              <p className="text-sm text-gray-300">
                {session.difficulty} · {timeStr} · {session.moves.length} moves
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-3 flex gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
              <span className="text-gray-300">
                {impulsiveMoves} risky opens ({revealMoves.length > 0
                  ? Math.round((impulsiveMoves / revealMoves.length) * 100)
                  : 0}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span className="text-gray-300">
                {safeMoves} safe opens ({revealMoves.length > 0
                  ? Math.round((safeMoves / revealMoves.length) * 100)
                  : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="px-6 py-4 flex-1">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            AI Coach Analysis
          </h3>

          {isAnalyzing ? (
            <div className="flex items-center gap-3 py-6 justify-center text-gray-400">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Analyzing your decisions…</span>
            </div>
          ) : session.insights.length === 0 ? (
            <div className="py-4 text-center text-gray-500 text-sm">
              {import.meta.env.VITE_ANTHROPIC_API_KEY
                ? 'Analysis unavailable'
                : 'Add VITE_ANTHROPIC_API_KEY to enable AI coaching'}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {session.insights.map((insight, i) => {
                const cfg = TYPE_CONFIG[insight.type];
                return (
                  <div
                    key={i}
                    className={`rounded-xl border p-3 ${cfg.className}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base mt-0.5">{cfg.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-400 uppercase">
                            {cfg.label}
                          </span>
                          {insight.moveIndex >= 0 && (
                            <span className="text-xs text-gray-500">
                              move #{insight.moveIndex + 1}
                            </span>
                          )}
                          {insight.probability > 0 && (
                            <span className="text-xs font-mono text-violet-400">
                              {insight.probability}%
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-200 leading-snug">
                          {insight.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-700 flex gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500
              text-white font-semibold text-sm transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={onViewProfile}
            className="flex-1 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600
              text-gray-200 font-semibold text-sm transition-colors border border-gray-600"
          >
            My Profile
          </button>
        </div>
      </div>
    </div>
  );
};
