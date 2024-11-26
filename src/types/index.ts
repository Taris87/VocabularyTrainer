export interface User {
  uid: string;
  email: string;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  progress: {
    level: string;
    score: number;
    wordsLearned: number;
    learningStreak: number;
    quizAccuracy?: number;
  };
}

export interface Vocabulary {
  id: string;
  german: string;
  english: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  isCustom?: boolean;
  userId?: string;
  learned?: boolean;
  lastModified?: Date;
}

export interface FlashCard {
  id: string;
  vocabulary: Vocabulary;
  lastReviewed?: Date;
  nextReview?: Date;
  repetitions: number;
  easeFactor: number;
}

export interface QuizQuestion {
  vocabulary: Vocabulary;
  options: string[];
  correctAnswer: string;
}