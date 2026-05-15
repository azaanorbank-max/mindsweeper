import type { GameSession, UserProfile } from '../types';

const PROFILE_KEY = 'mindsweeper_profile';

const DEFAULT_PROFILE: UserProfile = {
  totalGames: 0,
  wins: 0,
  streak: 0,
  lastPlayedDate: '',
  impulsiveRatio: 0,
  accurateRatio: 0,
  thinkingStyle: 'balanced',
  bestTimes: {},
  recentGames: [],
};

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function updateProfileWithSession(session: GameSession): UserProfile {
  const profile = loadProfile();

  profile.totalGames += 1;
  if (session.status === 'won') {
    profile.wins += 1;

    const elapsed = session.endTime
      ? Math.round((session.endTime - session.startTime) / 1000)
      : 0;
    const key = session.difficulty;
    if (!profile.bestTimes[key] || elapsed < profile.bestTimes[key]) {
      profile.bestTimes[key] = elapsed;
    }
  }

  // Update streak
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (profile.lastPlayedDate === yesterday) {
    profile.streak += 1;
  } else if (profile.lastPlayedDate !== today) {
    profile.streak = 1;
  }
  profile.lastPlayedDate = today;

  // Calculate ratios from all moves
  const allMoves = session.moves.filter(m => m.action === 'reveal');
  const impulsiveMoves = allMoves.filter(
    m => m.probabilityAtTime > 50 && m.wasSafe
  ).length;
  const accurateMoves = allMoves.filter(m => m.probabilityAtTime <= 25).length;

  if (allMoves.length > 0) {
    const prevTotal = Math.max(0, profile.totalGames - 1);
    profile.impulsiveRatio = Math.round(
      (profile.impulsiveRatio * prevTotal + (impulsiveMoves / allMoves.length) * 100) /
        profile.totalGames
    );
    profile.accurateRatio = Math.round(
      (profile.accurateRatio * prevTotal + (accurateMoves / allMoves.length) * 100) /
        profile.totalGames
    );
  }

  profile.thinkingStyle =
    profile.impulsiveRatio > 40
      ? 'impulsive'
      : profile.accurateRatio > 60
      ? 'calculated'
      : 'balanced';

  // Keep last 10 games (without full board to save space)
  const light: GameSession = {
    ...session,
    board: [], // strip board data
  };
  profile.recentGames = [light, ...profile.recentGames].slice(0, 10);

  saveProfile(profile);
  return profile;
}

export interface DailyStoredResult {
  won: boolean;
  date: string;
  elapsedSeconds: number;
  moves: Array<{ cellX: number; cellY: number; wasSafe: boolean }>;
}

export function saveDailyResult(
  dateId: string,
  won: boolean,
  elapsedSeconds: number,
  moves: Array<{ cellX: number; cellY: number; wasSafe: boolean }>,
): void {
  const key = `mindsweeper_daily_${dateId}`;
  localStorage.setItem(key, JSON.stringify({ won, date: dateId, elapsedSeconds, moves }));
}

export function getDailyResult(dateId: string): DailyStoredResult | null {
  try {
    const raw = localStorage.getItem(`mindsweeper_daily_${dateId}`);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return {
      won: !!p.won,
      date: p.date ?? dateId,
      elapsedSeconds: typeof p.elapsedSeconds === 'number' ? p.elapsedSeconds : 0,
      moves: Array.isArray(p.moves) ? p.moves : [],
    };
  } catch {
    return null;
  }
}

export function loadTheme(): 'dark' | 'light' {
  return (localStorage.getItem('mindsweeper_theme') as 'dark' | 'light') ?? 'dark';
}

export function saveTheme(theme: 'dark' | 'light'): void {
  localStorage.setItem('mindsweeper_theme', theme);
}
