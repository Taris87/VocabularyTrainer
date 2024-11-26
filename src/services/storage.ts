import { User, Vocabulary, FlashCard } from '../types';
import { defaultUser } from '../db/users';
import { defaultVocabulary } from '../db/vocabulary';

const STORAGE_KEYS = {
  USER: 'vocab_user',
  VOCABULARY: 'vocab_words',
  CUSTOM_WORDS: 'vocab_custom_words',
  FLASHCARDS: 'vocab_flashcards'
};

// User Management
export const getUser = (): User | null => {
  const userData = localStorage.getItem(STORAGE_KEYS.USER);
  return userData ? JSON.parse(userData) : null;
};

export const setUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const initializeUser = (): void => {
  if (!getUser()) {
    setUser(defaultUser);
  }
};

// Vocabulary Management
export const getVocabulary = (difficulty?: string): Vocabulary[] => {
  const defaultWords = defaultVocabulary;
  const customWords: Vocabulary[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_WORDS) || '[]');
  const allWords = [...defaultWords, ...customWords];
  
  return difficulty 
    ? allWords.filter(word => word.difficulty === difficulty)
    : allWords;
};

export const addCustomWord = (word: Omit<Vocabulary, 'id'>): Vocabulary => {
  const customWords: Vocabulary[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_WORDS) || '[]');
  const newWord: Vocabulary = {
    ...word,
    id: Date.now().toString(),
    isCustom: true
  };
  
  customWords.push(newWord);
  localStorage.setItem(STORAGE_KEYS.CUSTOM_WORDS, JSON.stringify(customWords));
  return newWord;
};

// Flashcard Management
export const getFlashcards = (): FlashCard[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.FLASHCARDS) || '[]');
};

export const updateFlashcard = (flashcard: FlashCard): void => {
  const flashcards = getFlashcards();
  const index = flashcards.findIndex(f => f.id === flashcard.id);
  
  if (index !== -1) {
    flashcards[index] = flashcard;
  } else {
    flashcards.push(flashcard);
  }
  
  localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(flashcards));
};

// Progress Management
export const updateUserProgress = (
  update: Partial<User['progress']>
): User => {
  const user = getUser();
  if (!user) throw new Error('No user found');
  
  const updatedUser = {
    ...user,
    progress: {
      ...user.progress,
      ...update
    }
  };
  
  setUser(updatedUser);
  return updatedUser;
};