import React from 'react';
import { ThinkingProfile } from '../components/ThinkingProfile';
import { Leaderboard } from '../components/Leaderboard';
import { ThemeToggle } from '../components/ThemeToggle';
import { useProfile } from '../hooks/useProfile';

interface ProfilePageProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onNavigateGame: () => void;
  onPlayDaily: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  theme,
  onToggleTheme,
  onNavigateGame,
  onPlayDaily,
}) => {
  const { profile, resetProfile } = useProfile();

  const handleReset = () => {
    if (window.confirm('Reset all stats? This cannot be undone.')) {
      resetProfile();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <button
          onClick={onNavigateGame}
          className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          ← Game
        </button>
        <span className="text-base font-bold text-violet-400">My Profile</span>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </header>

      <div className="flex-1 overflow-auto">
        <ThinkingProfile
          profile={profile}
          onPlayDaily={onPlayDaily}
          onReset={handleReset}
        />
        <div className="px-4 pb-6 max-w-lg mx-auto">
          <Leaderboard profile={profile} />
        </div>
      </div>
    </div>
  );
};
