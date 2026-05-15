import React from 'react';

interface ProbabilityOverlayProps {
  show: boolean;
  onToggle: () => void;
}

export const ProbabilityOverlay: React.FC<ProbabilityOverlayProps> = ({
  show,
  onToggle,
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
          border transition-colors select-none
          ${
            show
              ? 'bg-violet-600 border-violet-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-violet-500'
          }`}
        aria-pressed={show}
        title="Toggle probability overlay"
      >
        <span>%</span>
        <span className="hidden sm:inline">
          {show ? 'Hide Probs' : 'Show Probs'}
        </span>
      </button>
      {show && (
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
          <span>Safe</span>
          <span className="w-3 h-3 rounded-sm bg-yellow-400 inline-block ml-1" />
          <span>Risky</span>
          <span className="w-3 h-3 rounded-sm bg-red-500 inline-block ml-1" />
          <span>Danger</span>
        </div>
      )}
    </div>
  );
};
