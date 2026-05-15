import React from 'react';
import type { Difficulty } from '../types';
import { DIFFICULTY_CONFIG } from '../types';

interface DifficultyPickerProps {
  current: Difficulty;
  onChange: (d: Difficulty) => void;
  disabled?: boolean;
}

const LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  expert: 'Expert',
};

export const DifficultyPicker: React.FC<DifficultyPickerProps> = ({
  current,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex gap-1">
      {(['easy', 'medium', 'expert'] as Difficulty[]).map(d => {
        const cfg = DIFFICULTY_CONFIG[d];
        return (
          <button
            key={d}
            onClick={() => onChange(d)}
            disabled={disabled}
            title={`${cfg.rows}×${cfg.cols}, ${cfg.mines} mines`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors select-none
              ${
                current === d
                  ? 'bg-violet-600 text-white border border-violet-500'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-violet-500'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {LABELS[d]}
          </button>
        );
      })}
    </div>
  );
};
