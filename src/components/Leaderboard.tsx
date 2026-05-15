import React from 'react';
import type { UserProfile, Difficulty } from '../types';

interface LeaderboardProps {
  profile: UserProfile;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy (9×9)',
  medium: 'Medium (16×16)',
  expert: 'Expert (30×16)',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ profile }) => {
  const difficulties: Difficulty[] = ['easy', 'medium', 'expert'];
  const hasBestTimes = difficulties.some(d => profile.bestTimes[d] != null);

  return (
    <div className="rounded-xl border border-gray-700 dark:border-gray-600 overflow-hidden">
      <div className="px-4 py-2 bg-gray-800 dark:bg-gray-700 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300">Best Times</h3>
      </div>
      <div className="divide-y divide-gray-700">
        {difficulties.map(d => (
          <div
            key={d}
            className="flex items-center justify-between px-4 py-2.5 text-sm"
          >
            <span className="text-gray-400">{DIFFICULTY_LABELS[d]}</span>
            <span className="font-mono font-bold text-violet-400">
              {profile.bestTimes[d] != null
                ? formatTime(profile.bestTimes[d])
                : '—'}
            </span>
          </div>
        ))}
        {!hasBestTimes && (
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            Win a game to set a record
          </div>
        )}
      </div>
    </div>
  );
};
