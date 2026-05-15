import React from 'react';
import type { UserProfile } from '../types';

interface ThinkingProfileProps {
  profile: UserProfile;
  onPlayDaily: () => void;
  onReset: () => void;
}

const STYLE_CONFIG = {
  impulsive:  { label: 'Impulsive',   emoji: '⚡', color: 'text-red-400',    bg: 'bg-red-950/40 border-red-700' },
  balanced:   { label: 'Balanced',    emoji: '⚖️', color: 'text-yellow-400', bg: 'bg-yellow-950/40 border-yellow-700' },
  calculated: { label: 'Calculated',  emoji: '🧠', color: 'text-violet-400', bg: 'bg-violet-950/40 border-violet-700' },
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

const MiniChart: React.FC<{ games: UserProfile['recentGames'] }> = ({ games }) => {
  const last10 = [...games].reverse().slice(0, 10);
  if (last10.length === 0) {
    return (
      <div className="h-24 flex items-center justify-center text-gray-500 text-sm">
        No games yet
      </div>
    );
  }

  const maxTime = Math.max(
    ...last10.map(g =>
      g.endTime ? Math.round((g.endTime - g.startTime) / 1000) : 0
    ),
    1
  );

  const w = 280;
  const h = 80;
  const pad = 8;
  const step = last10.length > 1 ? (w - pad * 2) / (last10.length - 1) : 0;

  const points = last10.map((g, i) => {
    const t = g.endTime ? Math.round((g.endTime - g.startTime) / 1000) : 0;
    const x = pad + i * step;
    const y = pad + (1 - t / maxTime) * (h - pad * 2);
    return { x, y, won: g.status === 'won', t };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
    .join(' ');

  return (
    <svg width={w} height={h} className="w-full" viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={points.map(p => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="#7c3aed"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d={`${pathD} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`}
        fill="rgba(124,58,237,0.1)" />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3}
          fill={p.won ? '#10b981' : '#ef4444'}
        />
      ))}
    </svg>
  );
};

export const ThinkingProfile: React.FC<ThinkingProfileProps> = ({
  profile,
  onPlayDaily,
  onReset,
}) => {
  const style = STYLE_CONFIG[profile.thinkingStyle];
  const winRate =
    profile.totalGames > 0
      ? Math.round((profile.wins / profile.totalGames) * 100)
      : 0;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      {/* Thinking style badge */}
      <div className={`rounded-2xl border p-5 ${style.bg}`}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Your thinking style
        </p>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{style.emoji}</span>
          <div>
            <h2 className={`text-2xl font-bold ${style.color}`}>{style.label}</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {profile.thinkingStyle === 'impulsive' &&
                'You often open cells with >50% mine probability. Trust the numbers!'}
              {profile.thinkingStyle === 'balanced' &&
                'You balance speed and safety. Good foundation for expert play.'}
              {profile.thinkingStyle === 'calculated' &&
                'You consistently pick the lowest-risk cells. Pure probabilistic thinking.'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Games', value: profile.totalGames },
          { label: 'Wins', value: `${winRate}%` },
          { label: 'Streak', value: `${profile.streak}d` },
        ].map(s => (
          <div
            key={s.label}
            className="rounded-xl border border-gray-700 bg-gray-800/50 p-3 text-center"
          >
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Ratio bars */}
      <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-300">Decision Profile</h3>
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>⚡ Impulsive moves (&gt;50% risk)</span>
            <span className="font-mono">{profile.impulsiveRatio}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all"
              style={{ width: `${profile.impulsiveRatio}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>🧠 Accurate moves (≤25% risk)</span>
            <span className="font-mono">{profile.accurateRatio}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all"
              style={{ width: `${profile.accurateRatio}%` }}
            />
          </div>
        </div>
      </div>

      {/* Best times */}
      <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Best Times</h3>
        <div className="space-y-2">
          {(['easy', 'medium', 'expert'] as const).map(d => (
            <div key={d} className="flex justify-between text-sm">
              <span className="text-gray-400 capitalize">{d}</span>
              <span className="font-mono text-violet-400">
                {profile.bestTimes[d] != null ? formatTime(profile.bestTimes[d]) : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent games chart */}
      <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">
          Recent Games
          <span className="text-xs font-normal text-gray-500 ml-2">
            🟢 win · 🔴 loss · height = time
          </span>
        </h3>
        <MiniChart games={profile.recentGames} />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onPlayDaily}
          className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500
            text-white font-semibold text-sm transition-colors"
        >
          📅 Daily Challenge
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600
            text-gray-300 text-sm border border-gray-600 transition-colors"
          title="Reset all stats"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
