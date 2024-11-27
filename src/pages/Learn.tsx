import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import { Vocabulary } from '../types';
import { Brain, ChevronRight, ChevronLeft } from 'lucide-react';
import { loadVocabulary } from '../db/vocabulary';

interface UserProgress {
  lastDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'all' | 'personal';
  lastWordIndex: number;
}

export const Learn = () => {
  const { user } = useAuthStore();
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'all' | 'personal'>('all');
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
          const validDifficulty = ['beginner', 'intermediate', 'advanced', 'all', 'personal'].includes(progress.lastDifficulty) 
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
        let words;
        if (selectedDifficulty === 'personal') {
          words = await loadVocabulary('personal');
        } else {
          words = selectedDifficulty === 'all' 
            ? await loadVocabulary() 
            : await loadVocabulary(selectedDifficulty);
        }
          
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

  // Reset currentIndex when difficulty changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedDifficulty]);

  const handleNextWord = () => {
    if (!user || currentIndex >= vocabulary.length - 1) return;
    setCurrentIndex(prev => prev + 1);
    setShowTranslation(false);
  };

  const handlePreviousWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowTranslation(false);
    }
  };

  const currentWord = vocabulary[currentIndex];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Learn Vocabulary</h1>
        
        <div className="w-full flex flex-wrap justify-center gap-2 px-4">
          {(['all','beginner', 'intermediate', 'advanced', 'personal'] as const).map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={`px-3 py-2 rounded-lg text-sm md:text-base transition-colors ${
                selectedDifficulty === difficulty
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-indigo-50'
              }`}
            >
              {difficulty === 'personal' ? 'Personal' :
               difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : vocabulary.length > 0 ? (
        <div className="space-y-6 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm md:text-base text-gray-600">
                Word {currentIndex + 1} of {vocabulary.length}
              </span>
              <span className="text-sm md:text-base font-medium text-indigo-600">
                {selectedDifficulty}
              </span>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold mb-4">
                  {currentWord.german}
                </h2>
                {showTranslation ? (
                  <p className="text-lg md:text-xl text-gray-600">
                    {currentWord.english}
                  </p>
                ) : (
                  <button
                    onClick={() => setShowTranslation(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm md:text-base"
                  >
                    Show Translation
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={handlePreviousWord}
                  disabled={currentIndex === 0}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm md:text-base transition-colors ${
                    currentIndex === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleNextWord}
                  disabled={currentIndex === vocabulary.length - 1}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm md:text-base transition-colors ${
                    currentIndex === vocabulary.length - 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
              <Brain className="h-5 w-5 text-indigo-600 mr-2" />
              Learning Progress
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm md:text-base text-gray-600">
                <span>Words Learned</span>
                <span>{currentIndex + 1} / {vocabulary.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${((currentIndex + 1) / vocabulary.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-lg md:text-xl text-gray-600">No vocabulary words available for this difficulty level.</p>
        </div>
      )}
    </div>
  );
};