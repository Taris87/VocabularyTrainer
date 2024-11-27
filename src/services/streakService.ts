import { User } from '../types';
import { updateUserProgress } from './storage';

const isNewDay = (lastActiveDate: string): boolean => {
  const last = new Date(lastActiveDate);
  const now = new Date();
  
  // Setze Uhrzeiten auf Mitternacht für den Vergleich
  last.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  return now.getTime() > last.getTime();
};

const isConsecutiveDay = (lastActiveDate: string): boolean => {
  const last = new Date(lastActiveDate);
  const now = new Date();
  
  // Setze Uhrzeiten auf Mitternacht für den Vergleich
  last.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  // Berechne den Unterschied in Tagen
  const diffTime = Math.abs(now.getTime() - last.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1;
};

export const updateStreak = (user: User): User => {
  const today = new Date().toISOString();
  const lastActiveDate = user.progress.lastActiveDate;
  
  if (!lastActiveDate) {
    // Erster Besuch des Nutzers
    return updateUserProgress({
      learningStreak: 1,
      longestStreak: 1,
      lastActiveDate: today
    });
  }
  
  if (!isNewDay(lastActiveDate)) {
    // Nutzer war heute schon aktiv, keine Änderung nötig
    return user;
  }
  
  if (isConsecutiveDay(lastActiveDate)) {
    // Nutzer war gestern aktiv, erhöhe Streak
    const newStreak = user.progress.learningStreak + 1;
    return updateUserProgress({
      learningStreak: newStreak,
      longestStreak: Math.max(newStreak, user.progress.longestStreak || 0),
      lastActiveDate: today
    });
  }
  
  // Streak unterbrochen
  return updateUserProgress({
    learningStreak: 1,
    lastActiveDate: today
  });
};
