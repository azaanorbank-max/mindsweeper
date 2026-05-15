import { useState, useEffect } from 'react';
import { GamePage } from './pages/GamePage';
import { ProfilePage } from './pages/ProfilePage';
import { loadTheme, saveTheme } from './store/gameState';

type Route = 'game' | 'profile';

export default function App() {
  const [route, setRoute] = useState<Route>('game');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => loadTheme());
  const [pendingDaily, setPendingDaily] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      saveTheme(next);
      return next;
    });
  };

  const handlePlayDaily = () => {
    setPendingDaily(true);
    setRoute('game');
  };

  if (route === 'profile') {
    return (
      <ProfilePage
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigateGame={() => setRoute('game')}
        onPlayDaily={handlePlayDaily}
      />
    );
  }

  return (
    <GamePage
      theme={theme}
      onToggleTheme={toggleTheme}
      onNavigateProfile={() => setRoute('profile')}
      pendingDaily={pendingDaily}
      onDailyConsumed={() => setPendingDaily(false)}
    />
  );
}
