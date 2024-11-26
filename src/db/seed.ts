import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { defaultVocabulary } from './vocabulary';
import { Vocabulary } from '../types';

export const seedVocabulary = async (): Promise<void> => {
  try {
    console.log('Clearing existing vocabulary...');
    const vocabRef = collection(db, 'vocabulary');
    const existingVocab = await getDocs(vocabRef);
    
    for (const doc of existingVocab.docs) {
      await deleteDoc(doc.ref);
    }

    console.log('Adding new vocabulary...');
    for (let i = 0; i < defaultVocabulary.length; i++) {
      const word = defaultVocabulary[i];
      await addDoc(collection(db, 'vocabulary'), word as Vocabulary);
    }

    console.log('Vocabulary seeding completed successfully');
  } catch (error) {
    console.error('Error seeding vocabulary:', error);
    throw error;
  }
};

export const runSeed = async (): Promise<void> => {
  console.log('Starting database seeding...');
  try {
    await seedVocabulary();
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Only run seeding if this file is executed directly
if (require.main === module) {
  runSeed().catch(console.error);
}
