import { useState, useCallback } from 'react';
import type { UserProfile } from '../types';
import { loadProfile, saveProfile, updateProfileWithSession } from '../store/gameState';
import type { GameSession } from '../types';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());

  const refreshProfile = useCallback(() => {
    setProfile(loadProfile());
  }, []);

  const recordSession = useCallback((session: GameSession) => {
    const updated = updateProfileWithSession(session);
    setProfile(updated);
    return updated;
  }, []);

  const resetProfile = useCallback(() => {
    const fresh: UserProfile = {
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
    saveProfile(fresh);
    setProfile(fresh);
  }, []);

  return { profile, refreshProfile, recordSession, resetProfile };
}
