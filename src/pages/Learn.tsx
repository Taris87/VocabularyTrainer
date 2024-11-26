import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import { Vocabulary } from '../types';
import { Brain, ChevronRight, ChevronLeft } from 'lucide-react';
import { loadVocabulary } from '../db/vocabulary';

interface UserProgress {
  lastDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'all';
  lastWordIndex: number;
}

export const Learn = () => {
  const { user, updateUserProfile } = useAuthStore();
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load user progress
  useEffect(() => {
    let isMounted = true;
    
    const loadUserProgress = async () => {
      if (!user?.uid) {
        if (isMounted) {
          setSelectedDifficulty('all');
          setCurrentIndex(0);
          setIsLoading(false);
        }
        return;
      }

      try {
        const userProgressRef = doc(db, 'userProgress', user.uid);
        const userProgressDoc = await getDoc(userProgressRef);
        const data = userProgressDoc.data();

        if (!isMounted) return;

        if (userProgressDoc.exists() && data && 
            typeof data.lastDifficulty === 'string' && 
            typeof data.lastWordIndex === 'number') {
          const progress = data as UserProgress;
          const validDifficulty = ['beginner', 'intermediate', 'advanced', 'all'].includes(progress.lastDifficulty) 
            ? progress.lastDifficulty 
            : 'all';
          setSelectedDifficulty(validDifficulty);
          setCurrentIndex(progress.lastWordIndex || 0);
        } else {
          // Set default progress for new users
          await setDoc(userProgressRef, {
            lastDifficulty: 'all',
            lastWordIndex: 0
          });
          setSelectedDifficulty('all');
          setCurrentIndex(0);
        }
      } catch (error) {
        console.error('Error loading user progress:', error);
        if (isMounted) {
          setSelectedDifficulty('all');
          setCurrentIndex(0);
        }
      }
    };

    loadUserProgress();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Load vocabulary based on difficulty
  useEffect(() => {
    let isMounted = true;
    
    const loadWords = async () => {
      if (isMounted) setIsLoading(true);
      
      try {
        const words = selectedDifficulty === 'all' 
          ? await loadVocabulary() 
          : await loadVocabulary(selectedDifficulty);
          
        if (isMounted) {
          setVocabulary(words);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading vocabulary:', error);
        if (isMounted) {
          setVocabulary([]);
          setIsLoading(false);
        }
      }
    };

    loadWords();
    
    return () => {
      isMounted = false;
    };
  }, [selectedDifficulty]);

  // Save user progress
  useEffect(() => {
    if (!user?.uid || !vocabulary || vocabulary.length === 0 || !selectedDifficulty) return;

    const saveProgress = async () => {
      try {
        const userProgressRef = doc(db, 'userProgress', user.uid);
        await setDoc(userProgressRef, {
          lastDifficulty: selectedDifficulty,
          lastWordIndex: Math.min(currentIndex || 0, vocabulary.length - 1)
        });
      } catch (error) {
        console.error('Error saving user progress:', error);
      }
    };

    const debounceTimeout = setTimeout(saveProgress, 500);
    return () => clearTimeout(debounceTimeout);
  }, [user, vocabulary, selectedDifficulty, currentIndex]);

  // Reset currentIndex when vocabulary changes
  useEffect(() => {
    if (vocabulary.length > 0 && currentIndex >= vocabulary.length) {
      setCurrentIndex(0);
    }
  }, [vocabulary, currentIndex]);

  const saveUserProgress = (currentIndex: number) => {
    if (!user) return;

    // Update Firestore document with current learning progress
    const userDocRef = doc(db, 'users', user.uid);
    setDoc(userDocRef, {
      progress: {
        currentWordIndex: currentIndex,
        difficulty: selectedDifficulty
      }
    }, { merge: true });
  };

  const handleNextWord = () => {
    if (!user || currentIndex >= vocabulary.length - 1) return;

    // Update learning progress
    updateUserProfile(user.uid, {
      progress: {
        wordsLearned: (user.progress?.wordsLearned || 0) + 1,
        score: (user.progress?.score || 0) + 1
      }
    });

    setCurrentIndex(prev => prev + 1);
    setShowTranslation(false);
    saveUserProgress(currentIndex + 1);
  };

  const handlePreviousWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowTranslation(false);
      saveUserProgress(currentIndex - 1);
    }
  };

  const currentWord = vocabulary[currentIndex];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Learn Vocabulary</h1>
        <div className="flex justify-center space-x-4">
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={`px-4 py-2 rounded-lg ${
                selectedDifficulty === difficulty
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-indigo-50'
              } transition-colors`}
            >
              {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-600">
          Loading vocabulary...
        </div>
      ) : vocabulary.length > 0 && currentWord ? (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handlePreviousWord}
              disabled={currentIndex === 0}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="text-center">
              <Brain className="h-12 w-12 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Word {currentIndex + 1} of {vocabulary.length}
              </p>
            </div>
            <button
              onClick={handleNextWord}
              disabled={currentIndex === vocabulary.length - 1}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">{currentWord.german}</h2>
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
            >
              {showTranslation ? 'Hide' : 'Show'} Translation
            </button>
            {showTranslation && (
              <p className="mt-4 text-xl text-gray-700">{currentWord.english}</p>
            )}
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Category: {currentWord.category}</p>
            <p>Difficulty: {currentWord.difficulty}</p>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-600">
          <p>No vocabulary found for the selected difficulty level.</p>
        </div>
      )}
    </div>
  );
};