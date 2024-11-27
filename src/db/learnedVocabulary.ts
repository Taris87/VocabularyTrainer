import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

interface LearnedVocabulary {
  id?: string;
  userId: string;
  vocabularyId: string;
  german: string;
  english: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'personal';
  learnedAt: Date;
}

export const addLearnedVocabulary = async (
  userId: string,
  vocabulary: {
    id: string;
    german: string;
    english: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'personal';
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
    console.log('Adding learned vocabulary:', learnedVocabularyData);
    // Check if already learned
    const q = query(
      collection(db, 'learnedVocabulary'),
      where('userId', '==', userId),
      where('vocabularyId', '==', vocabulary.id),
      where('difficulty', '==', vocabulary.difficulty)
    );
    const querySnapshot = await getDocs(q);
    
    // Only add if not already learned with this difficulty
    if (querySnapshot.empty) {
      await addDoc(collection(db, 'learnedVocabulary'), learnedVocabularyData);
      console.log('Successfully added learned vocabulary');
    } else {
      console.log('Word already learned with this difficulty');
    }
  } catch (error) {
    console.error('Error adding learned vocabulary:', error);
    throw error;
  }
};

export const getLearnedVocabulary = async (userId: string, difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'personal') => {
  try {
    console.log(`Getting learned vocabulary for user ${userId} with difficulty ${difficulty}`);
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
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${results.length} learned words with difficulty ${difficulty}:`, results);
    return results;
  } catch (error) {
    console.error('Error getting learned vocabulary:', error);
    throw error;
  }
};
