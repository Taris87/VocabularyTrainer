import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

interface LearnedVocabulary {
  id?: string;
  userId: string;
  vocabularyId: string;
  german: string;
  english: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  learnedAt: Date;
}

export const addLearnedVocabulary = async (
  userId: string,
  vocabulary: {
    id: string;
    german: string;
    english: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }
): Promise<void> => {
  const learnedVocabularyData: LearnedVocabulary = {
    userId,
    vocabularyId: vocabulary.id,
    german: vocabulary.german,
    english: vocabulary.english,
    difficulty: vocabulary.difficulty,
    learnedAt: new Date()
  };

  try {
    // Check if already learned
    const q = query(
      collection(db, 'learnedVocabulary'),
      where('userId', '==', userId),
      where('vocabularyId', '==', vocabulary.id)
    );
    const querySnapshot = await getDocs(q);
    
    // Only add if not already learned
    if (querySnapshot.empty) {
      await addDoc(collection(db, 'learnedVocabulary'), learnedVocabularyData);
    }
  } catch (error) {
    console.error('Error adding learned vocabulary:', error);
    throw error;
  }
};

export const getLearnedVocabulary = async (userId: string, difficulty?: 'beginner' | 'intermediate' | 'advanced') => {
  try {
    let q;
    if (difficulty) {
      q = query(
        collection(db, 'learnedVocabulary'),
        where('userId', '==', userId),
        where('difficulty', '==', difficulty)
      );
    } else {
      q = query(
        collection(db, 'learnedVocabulary'),
        where('userId', '==', userId)
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting learned vocabulary:', error);
    throw error;
  }
};
