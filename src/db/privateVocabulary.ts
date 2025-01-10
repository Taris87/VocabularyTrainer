import { collection, addDoc, deleteDoc, doc, getDocs, query, where, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Vocabulary } from '../types';

// Add a new private vocabulary word
export const addPrivateVocabulary = async (
  userId: string,
  word: Omit<Vocabulary, 'id'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'privateVocabulary'), {
      ...word,
      userId,
      createdAt: new Date(),
      lastModified: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding private vocabulary:', error);
    throw error;
  }
};

// Get all private vocabulary for a user
export const getPrivateVocabulary = async (userId: string): Promise<Vocabulary[]> => {
  try {
    const q = query(
      collection(db, 'privateVocabulary'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Vocabulary));
  } catch (error) {
    console.error('Error getting private vocabulary:', error);
    throw error;
  }
};

// Delete a private vocabulary word
export const deletePrivateVocabulary = async (
  userId: string,
  vocabularyId: string
): Promise<void> => {
  try {
    // First verify that this vocabulary belongs to the user
    const q = query(
      collection(db, 'privateVocabulary'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const vocab = querySnapshot.docs.find(doc => doc.id === vocabularyId);
    
    if (!vocab) {
      throw new Error('Vocabulary not found or not authorized');
    }

    await deleteDoc(doc(db, 'privateVocabulary', vocabularyId));
  } catch (error) {
    console.error('Error deleting private vocabulary:', error);
    throw error;
  }
};

// Delete all private vocabulary words for a user
export const deleteAllPrivateVocabulary = async (userId: string): Promise<void> => {
  
  try {
    // Query for all vocabulary entries belonging to the user
    const q = query(
      collection(db, 'privateVocabulary'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db); // Create a batch for deleting documents

    // Iterate over the documents and add them to the batch for deletion
    querySnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Commit the batch operation
    await batch.commit();
  } catch (error) {
    console.error('Error deleting all private vocabulary:', error);
    throw error;
  }
};

// Update a private vocabulary word
export const updatePrivateVocabulary = async (
  userId: string,
  vocabularyId: string,
  updates: Partial<Vocabulary>
): Promise<void> => {
  try {
    // First verify that this vocabulary belongs to the user
    const q = query(
      collection(db, 'privateVocabulary'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const vocab = querySnapshot.docs.find(doc => doc.id === vocabularyId);
    
    if (!vocab) {
      throw new Error('Vocabulary not found or not authorized');
    }

    await updateDoc(doc(db, 'privateVocabulary', vocabularyId), {
      ...updates,
      lastModified: new Date()
    });
  } catch (error) {
    console.error('Error updating private vocabulary:', error);
    throw error;
  }
};

// Get private vocabulary by category for a user
export const getPrivateVocabularyByCategory = async (
  userId: string,
  category: string
): Promise<Vocabulary[]> => {
  try {
    const q = query(
      collection(db, 'privateVocabulary'),
      where('userId', '==', userId),
      where('category', '==', category)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Vocabulary));
  } catch (error) {
    console.error('Error getting private vocabulary by category:', error);
    throw error;
  }
};
