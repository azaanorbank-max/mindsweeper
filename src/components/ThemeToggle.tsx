import React from 'react';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="w-9 h-9 flex items-center justify-center rounded-lg
        bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-violet-500
        text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors select-none"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
};
