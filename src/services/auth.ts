import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';
import { useAuthStore } from '../store/authStore';

export const signUp = async (email: string, password: string): Promise<User> => {
  const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
  
  const userData: User = {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    progress: {
      level: 'beginner',
      score: 0,
      wordsLearned: 0,
      learningStreak: 0
    }
  };

  // Create user document in Firestore
  await setDoc(doc(db, 'users', firebaseUser.uid), userData);
  
  return userData;
};

export const signIn = async (email: string, password: string): Promise<User> => {
  const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
  
  // Get user data from Firestore
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  if (!userDoc.exists()) {
    throw new Error('User data not found');
  }
  
  const userData = userDoc.data() as User;
  
  // Ensure learningStreak is initialized if not present
  if (!userData.progress.learningStreak) {
    userData.progress.learningStreak = 0;
  }
  
  return userData;
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const initializeAuth = (): void => {
  const { setUser } = useAuthStore.getState();
  
  onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
      }
    } else {
      setUser(null);
    }
  });
};