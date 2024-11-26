import { User } from '../types';
import { doc, updateDoc, FieldValue, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Default user data
export const defaultUser: User = {
  uid: '1',
  email: 'demo@example.com',
  progress: {
    level: 'beginner',
    score: 0,
    wordsLearned: 0,
    learningStreak: 0,
    quizAccuracy: 0
  }
};

export const updateUserProgress = async (
  userId: string, 
  correctAnswers: number, 
  newWordsLearned: number,
  learningStreak: number = 0,
  quizAccuracy: number = 0
) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Check if the document exists
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      // Create the document with default values if it doesn't exist
      await setDoc(userRef, defaultUser);
    }

    await updateDoc(userRef, {
      'progress.score': correctAnswers,
      'progress.wordsLearned': newWordsLearned,
      'progress.learningStreak': learningStreak,
      'progress.quizAccuracy': quizAccuracy
    });
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
};

export const saveUserSession = async (userId: string, sessionData: {
  timeSpent?: number;
  lastActive?: Date;
  lastProgress?: {
    score: number;
    wordsLearned: number;
    level: string;
  };
}) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Check if the document exists
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      // Create the document with default values if it doesn't exist
      await setDoc(userRef, defaultUser);
    }

    await updateDoc(userRef, {
      lastSession: {
        ...sessionData,
        lastActive: sessionData.lastActive || new Date(),
      }
    });
  } catch (error) {
    console.error('Error saving user session:', error);
    throw error;
  }
};

// Function to initialize user session tracking
export const initializeUserSession = (userId: string) => {
  const sessionStartTime = new Date();
  
  // Save session data when user leaves/closes the page
  const handleBeforeUnload = async () => {
    const sessionEndTime = new Date();
    const timeSpent = sessionEndTime.getTime() - sessionStartTime.getTime();
    
    try {
      await saveUserSession(userId, {
        timeSpent,
        lastActive: sessionEndTime
      });
    } catch (error) {
      console.error('Error saving session on unload:', error);
    }
  };

  // Add event listener for page unload
  window.addEventListener('beforeunload', handleBeforeUnload);

  // Return cleanup function
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
};

export const updateUserProfile = async (userId: string, profileData: {
  email?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  progress?: {
    score?: number;
    wordsLearned?: number;
    learningStreak?: number;
    quizAccuracy?: number;
  };
}) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Check if the document exists
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      // Create the document with default values if it doesn't exist
      await setDoc(userRef, {
        email: profileData.email || defaultUser.email,
        progress: {
          level: profileData.level || defaultUser.progress.level,
          score: profileData.progress?.score || defaultUser.progress.score,
          wordsLearned: profileData.progress?.wordsLearned || defaultUser.progress.wordsLearned,
          learningStreak: profileData.progress?.learningStreak || defaultUser.progress.learningStreak,
          quizAccuracy: profileData.progress?.quizAccuracy || defaultUser.progress.quizAccuracy
        }
      });
      return;
    }

    // Update existing document
    const updates: { [key: string]: FieldValue | string | number | undefined } = {};
    
    if (profileData.email) {
      updates.email = profileData.email;
    }
    if (profileData.level) {
      updates['progress.level'] = profileData.level;
    }
    if (profileData.progress) {
      if (typeof profileData.progress.score === 'number') {
        updates['progress.score'] = profileData.progress.score;
      }
      if (typeof profileData.progress.wordsLearned === 'number') {
        updates['progress.wordsLearned'] = profileData.progress.wordsLearned;
      }
      if (typeof profileData.progress.learningStreak === 'number') {
        updates['progress.learningStreak'] = profileData.progress.learningStreak;
      }
      if (typeof profileData.progress.quizAccuracy === 'number') {
        updates['progress.quizAccuracy'] = profileData.progress.quizAccuracy;
      }
    }

    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};