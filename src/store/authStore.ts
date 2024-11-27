import { create } from 'zustand';
import { User } from '../types';
import { getUser, setUser as setStorageUser, initializeUser, updateUserProgress } from '../services/storage';
import { updateUserProfile as updateUserProfileDB } from '../db/users';
import { updateStreak } from '../services/streakService';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string) => void;
  logout: () => void;
  updateProgress: (update: Partial<User['progress']>) => void;
  updateUserProfile: (userId: string, update: {
    email?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    progress?: {
      score?: number;
      wordsLearned?: number;
      learningStreak?: number;
      longestStreak?: number;
      quizAccuracy?: number;
    };
  }) => Promise<void>;
  checkAndUpdateStreak: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getUser(),
  setUser: (user) => {
    set({ user });
    if (user) {
      setStorageUser(user);
    }
  },
  login: (email) => {
    const user: User = {
      uid: '1',
      email,
      progress: {
        level: 'beginner',
        score: 0,
        wordsLearned: 0,
        learningStreak: 0,
        longestStreak: 0,
        quizAccuracy: 0,
        lastActiveDate: new Date().toISOString()
      }
    };
    set({ user });
    setStorageUser(user);
  },
  logout: () => {
    set({ user: null });
    localStorage.clear();
    initializeUser();
  },
  updateProgress: (update) => {
    const updatedUser = updateUserProgress(update);
    set({ user: updatedUser });
  },
  updateUserProfile: async (userId, update) => {
    await updateUserProfileDB(userId, update);
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        ...update,
        progress: {
          ...currentUser.progress,
          ...update.progress
        }
      };
      set({ user: updatedUser });
      setStorageUser(updatedUser);
    }
  },
  checkAndUpdateStreak: () => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = updateStreak(currentUser);
      set({ user: updatedUser });
    }
  }
}));