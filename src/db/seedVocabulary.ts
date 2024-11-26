import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { defaultVocabulary } from './vocabulary';

const seedVocabulary = async () => {
  try {
    console.log('Starting vocabulary seeding...');
    
    // First, clear existing vocabulary
    const vocabularyRef = collection(db, 'vocabulary');
    const existingVocab = await getDocs(vocabularyRef);
    
    console.log('Clearing existing vocabulary...');
    const deletePromises = existingVocab.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log('Adding new vocabulary...');
    // Add all vocabulary items
    const addPromises = defaultVocabulary.map((word) => {
      return addDoc(vocabularyRef, {
        german: word.german,
        english: word.english,
        difficulty: word.difficulty,
        category: word.category
      });
    });
    
    await Promise.all(addPromises);
    console.log('Successfully seeded vocabulary!');
  } catch (error) {
    console.error('Error seeding vocabulary:', error);
    throw error;
  }
};

export { seedVocabulary };
