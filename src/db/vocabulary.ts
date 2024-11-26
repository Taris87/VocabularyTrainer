import { Vocabulary } from '../types';
import { collection, getDocs, query, where, Query, DocumentData, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const defaultVocabulary: Vocabulary[] = [
  // Beginner words
  { id: '1', german: 'Hallo', english: 'Hello', difficulty: 'beginner', category: 'Greetings' },
  { id: '2', german: 'Danke', english: 'Thank you', difficulty: 'beginner', category: 'Greetings' },
  { id: '3', german: 'Bitte', english: 'Please', difficulty: 'beginner', category: 'Greetings' },
  { id: '4', german: 'Ja', english: 'Yes', difficulty: 'beginner', category: 'Basic' },
  { id: '5', german: 'Nein', english: 'No', difficulty: 'beginner', category: 'Basic' },
  { id: '16', german: 'Guten Morgen', english: 'Good morning', difficulty: 'beginner', category: 'Greetings' },
  { id: '17', german: 'Guten Abend', english: 'Good evening', difficulty: 'beginner', category: 'Greetings' },
  { id: '18', german: 'Auf Wiedersehen', english: 'Goodbye', difficulty: 'beginner', category: 'Greetings' },
  { id: '19', german: 'Wasser', english: 'Water', difficulty: 'beginner', category: 'Food & Drinks' },
  { id: '20', german: 'Brot', english: 'Bread', difficulty: 'beginner', category: 'Food & Drinks' },
  { id: '21', german: 'Milch', english: 'Milk', difficulty: 'beginner', category: 'Food & Drinks' },
  { id: '22', german: 'Apfel', english: 'Apple', difficulty: 'beginner', category: 'Food & Drinks' },
  { id: '23', german: 'Haus', english: 'House', difficulty: 'beginner', category: 'Living' },
  { id: '24', german: 'Auto', english: 'Car', difficulty: 'beginner', category: 'Transportation' },
  { id: '25', german: 'Katze', english: 'Cat', difficulty: 'beginner', category: 'Animals' },
  { id: '26', german: 'Hund', english: 'Dog', difficulty: 'beginner', category: 'Animals' },
  { id: '27', german: 'Buch', english: 'Book', difficulty: 'beginner', category: 'Objects' },
  { id: '28', german: 'Tisch', english: 'Table', difficulty: 'beginner', category: 'Furniture' },
  { id: '29', german: 'Stuhl', english: 'Chair', difficulty: 'beginner', category: 'Furniture' },
  { id: '30', german: 'Fenster', english: 'Window', difficulty: 'beginner', category: 'House' },
  
  // Intermediate words
  { id: '6', german: 'Entwicklung', english: 'Development', difficulty: 'intermediate', category: 'Technology' },
  { id: '7', german: 'Wissenschaft', english: 'Science', difficulty: 'intermediate', category: 'Academic' },
  { id: '8', german: 'Gesellschaft', english: 'Society', difficulty: 'intermediate', category: 'Social' },
  { id: '9', german: 'Erfahrung', english: 'Experience', difficulty: 'intermediate', category: 'General' },
  { id: '10', german: 'Bedeutung', english: 'Meaning', difficulty: 'intermediate', category: 'General' },
  { id: '31', german: 'Verantwortung', english: 'Responsibility', difficulty: 'intermediate', category: 'Business' },
  { id: '32', german: 'Entscheidung', english: 'Decision', difficulty: 'intermediate', category: 'General' },
  { id: '33', german: 'Beziehung', english: 'Relationship', difficulty: 'intermediate', category: 'Social' },
  { id: '34', german: 'Umgebung', english: 'Environment', difficulty: 'intermediate', category: 'Nature' },
  { id: '35', german: 'Verhalten', english: 'Behavior', difficulty: 'intermediate', category: 'Psychology' },
  { id: '36', german: 'Ausbildung', english: 'Education', difficulty: 'intermediate', category: 'Education' },
  { id: '37', german: 'Verwaltung', english: 'Administration', difficulty: 'intermediate', category: 'Business' },
  { id: '38', german: 'Möglichkeit', english: 'Possibility', difficulty: 'intermediate', category: 'General' },
  { id: '39', german: 'Unterschied', english: 'Difference', difficulty: 'intermediate', category: 'General' },
  { id: '40', german: 'Verbindung', english: 'Connection', difficulty: 'intermediate', category: 'General' },
  { id: '41', german: 'Verständnis', english: 'Understanding', difficulty: 'intermediate', category: 'Education' },
  { id: '42', german: 'Bewegung', english: 'Movement', difficulty: 'intermediate', category: 'Action' },
  { id: '43', german: 'Förderung', english: 'Promotion', difficulty: 'intermediate', category: 'Business' },
  { id: '44', german: 'Leistung', english: 'Performance', difficulty: 'intermediate', category: 'Business' },
  { id: '45', german: 'Planung', english: 'Planning', difficulty: 'intermediate', category: 'Business' },
  
  // Advanced words
  { id: '11', german: 'Nachhaltigkeit', english: 'Sustainability', difficulty: 'advanced', category: 'Environment' },
  { id: '12', german: 'Wahrscheinlichkeit', english: 'Probability', difficulty: 'advanced', category: 'Mathematics' },
  { id: '13', german: 'Zusammenhang', english: 'Correlation', difficulty: 'advanced', category: 'Academic' },
  { id: '14', german: 'Voraussetzung', english: 'Prerequisite', difficulty: 'advanced', category: 'Education' },
  { id: '15', german: 'Auswirkung', english: 'Impact', difficulty: 'advanced', category: 'General' },
  { id: '46', german: 'Unverzichtbar', english: 'Indispensable', difficulty: 'advanced', category: 'General' },
  { id: '47', german: 'Gewährleistung', english: 'Warranty', difficulty: 'advanced', category: 'Business' },
  { id: '48', german: 'Beschleunigung', english: 'Acceleration', difficulty: 'advanced', category: 'Physics' },
  { id: '49', german: 'Rechtsprechung', english: 'Jurisdiction', difficulty: 'advanced', category: 'Legal' },
  { id: '50', german: 'Verfügbarkeit', english: 'Availability', difficulty: 'advanced', category: 'Business' },
  { id: '51', german: 'Unabhängigkeit', english: 'Independence', difficulty: 'advanced', category: 'Politics' },
  { id: '52', german: 'Gerechtigkeit', english: 'Justice', difficulty: 'advanced', category: 'Legal' },
  { id: '53', german: 'Wirtschaftlich', english: 'Economical', difficulty: 'advanced', category: 'Economics' },
  { id: '54', german: 'Vollständigkeit', english: 'Completeness', difficulty: 'advanced', category: 'General' },
  { id: '55', german: 'Berücksichtigung', english: 'Consideration', difficulty: 'advanced', category: 'Business' },
  { id: '56', german: 'Gleichgewicht', english: 'Equilibrium', difficulty: 'advanced', category: 'Science' },
  { id: '57', german: 'Wettbewerbsfähig', english: 'Competitive', difficulty: 'advanced', category: 'Business' },
  { id: '58', german: 'Zuverlässigkeit', english: 'Reliability', difficulty: 'advanced', category: 'Technology' },
  { id: '59', german: 'Herausforderung', english: 'Challenge', difficulty: 'advanced', category: 'General' },
  { id: '60', german: 'Zusammenarbeit', english: 'Collaboration', difficulty: 'advanced', category: 'Business' }
];

export const loadVocabulary = async (difficulty?: 'beginner' | 'intermediate' | 'advanced'): Promise<Vocabulary[]> => {
  try {
    const vocabularyRef = collection(db, 'vocabulary');
    
    // Check if we need to seed the vocabulary
    const existingVocab = await getDocs(vocabularyRef);
    if (existingVocab.empty) {
      console.log('No vocabulary found in Firebase, seeding...');
      // Add default vocabulary to Firebase
      for (const word of defaultVocabulary) {
        await addDoc(vocabularyRef, word);
      }
      console.log('Vocabulary seeded successfully!');
    }

    // Query vocabulary based on difficulty
    let q: Query<DocumentData> = vocabularyRef;
    if (difficulty) {
      q = query(vocabularyRef, where('difficulty', '==', difficulty));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Vocabulary));

  } catch (error) {
    console.error('Error in loadVocabulary:', error);
    throw new Error('Failed to load vocabulary');
  }
};

// Function to force reload vocabulary into Firebase
export const reloadVocabularyToFirebase = async (): Promise<void> => {
  try {
    console.log('Starting vocabulary reload...');
    const vocabularyRef = collection(db, 'vocabulary');
    
    // Clear existing vocabulary
    const existingVocab = await getDocs(vocabularyRef);
    const deletePromises = existingVocab.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log('Cleared existing vocabulary');
    
    // Add default vocabulary
    for (const word of defaultVocabulary) {
      await addDoc(vocabularyRef, word);
    }
    console.log('Successfully reloaded vocabulary to Firebase');
  } catch (error) {
    console.error('Error reloading vocabulary:', error);
    throw new Error('Failed to reload vocabulary');
  }
};

export const getVocabularyByCategory = async (category: string): Promise<Vocabulary[]> => {
  try {
    const vocabularyRef = collection(db, 'vocabulary');
    const q = query(vocabularyRef, where('category', '==', category));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Vocabulary));
  } catch (error) {
    console.error('Error loading vocabulary by category:', error);
    throw new Error('Failed to load vocabulary by category');
  }
};