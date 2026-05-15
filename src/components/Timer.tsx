import React from 'react';

interface TimerProps {
  elapsed: number;
}

export const Timer: React.FC<TimerProps> = ({ elapsed }) => {
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="font-mono text-lg font-bold text-gray-200 tabular-nums tracking-wider">
      {display}
    </div>
  );
};
