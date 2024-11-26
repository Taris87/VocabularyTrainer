import { create } from 'zustand';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Vocabulary } from '../types';

interface VocabularyStore {
  vocabulary: Vocabulary[];
  loading: boolean;
  error: string | null;
  selectedDifficulty: 'beginner' | 'intermediate' | 'advanced';
  setSelectedDifficulty: (difficulty: 'beginner' | 'intermediate' | 'advanced') => void;
  fetchVocabulary: () => Promise<void>;
  addVocabulary: (newWord: Omit<Vocabulary, 'id'>) => Promise<void>;
  deleteVocabulary: (id: string) => Promise<void>;
  updateVocabulary: (id: string, updates: Partial<Vocabulary>) => Promise<void>;
}

export const useVocabularyStore = create<VocabularyStore>((set, get) => ({
  vocabulary: [],
  loading: false,
  error: null,
  selectedDifficulty: 'beginner',

  setSelectedDifficulty: (difficulty) => {
    set({ selectedDifficulty: difficulty });
    get().fetchVocabulary();
  },

  fetchVocabulary: async () => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'vocabulary'),
        where('difficulty', '==', get().selectedDifficulty)
      );
      
      const querySnapshot = await getDocs(q);
      const vocabData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Vocabulary));
      
      set({ vocabulary: vocabData });
    } catch (error) {
      set({ error: 'Failed to fetch vocabulary' });
      console.error('Error fetching vocabulary:', error);
    } finally {
      set({ loading: false });
    }
  },

  addVocabulary: async (newWord) => {
    set({ loading: true, error: null });
    try {
      await addDoc(collection(db, 'vocabulary'), {
        ...newWord,
        difficulty: get().selectedDifficulty
      });
      await get().fetchVocabulary();
    } catch (error) {
      set({ error: 'Failed to add vocabulary' });
      console.error('Error adding vocabulary:', error);
    } finally {
      set({ loading: false });
    }
  },

  deleteVocabulary: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'vocabulary', id));
      await get().fetchVocabulary();
    } catch (error) {
      set({ error: 'Failed to delete vocabulary' });
      console.error('Error deleting vocabulary:', error);
    } finally {
      set({ loading: false });
    }
  },

  updateVocabulary: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const vocabRef = doc(db, 'vocabulary', id);
      
      // Check if the document exists
      const docSnap = await getDoc(vocabRef);
      
      if (!docSnap.exists()) {
        // If the document doesn't exist, create it with the updates
        const currentVocab = get().vocabulary.find(v => v.id === id);
        if (!currentVocab) {
          throw new Error('Vocabulary not found');
        }
        
        await setDoc(vocabRef, {
          ...currentVocab,
          ...updates
        });
      } else {
        // Update existing document
        await updateDoc(vocabRef, updates);
      }
      
      await get().fetchVocabulary();
    } catch (error) {
      set({ error: 'Failed to update vocabulary' });
      console.error('Error updating vocabulary:', error);
    } finally {
      set({ loading: false });
    }
  }
}));
