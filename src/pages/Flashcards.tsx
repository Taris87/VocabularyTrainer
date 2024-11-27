import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Vocabulary } from '../types';
import { Rotate3D, ChevronLeft, ChevronRight, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { loadVocabulary } from '../db/vocabulary';

export const Flashcards = () => {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState<string[]>([]);
  const [unknownWords, setUnknownWords] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'personal'>('beginner');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchVocabulary = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const words = await loadVocabulary(selectedDifficulty);
        setVocabulary(words);
        // Reset progress when difficulty changes
        setKnownWords([]);
        setUnknownWords([]);
        setCurrentIndex(0);
      } catch (error) {
        console.error('Error loading vocabulary:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVocabulary();
  }, [selectedDifficulty, user]);

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = () => {
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePreviousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleKnownWord = () => {
    const currentWord = vocabulary[currentIndex];
    if (!knownWords.includes(currentWord.id)) {
      const newKnownWords = [...knownWords, currentWord.id];
      setKnownWords(newKnownWords);
      
      // Check if progress is 100% and handle difficulty progression
      const progress = ((newKnownWords.length / vocabulary.length) * 100);
      if (progress === 100) {
        if (selectedDifficulty === 'beginner') {
          setSelectedDifficulty('intermediate');
        } else if (selectedDifficulty === 'intermediate') {
          setSelectedDifficulty('advanced');
        }
      }
    }
    handleNextCard();
  };

  const handleUnknownWord = () => {
    const currentWord = vocabulary[currentIndex];
    if (!unknownWords.includes(currentWord.id)) {
      setUnknownWords([...unknownWords, currentWord.id]);
    }
    handleNextCard();
  };

  const restartSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownWords([]);
    setUnknownWords([]);
  };

  const calculateProgress = () => {
    return (knownWords.length / vocabulary.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Lade Vokabeln...</h2>
          <p className="text-gray-600">Bitte warten Sie einen Moment.</p>
        </div>
      </div>
    );
  }

  if (vocabulary.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Keine Vokabeln gefunden</h2>
          <p className="text-gray-600">Füge zuerst einige Vokabeln hinzu, um mit dem Lernen zu beginnen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4">Vokabelkarten</h1>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4">
          {(['beginner', 'intermediate', 'advanced', 'personal'] as const).map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg flex-1 sm:flex-none whitespace-nowrap ${
                selectedDifficulty === difficulty
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-indigo-50'
              } transition-colors`}
            >
              {difficulty === 'personal' ? 'Persönlich' :
               difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl mx-auto mb-4 sm:mb-8">
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4">
          <div className="flex justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700">Fortschritt</span>
            <span className="text-xs sm:text-sm font-medium text-indigo-600">
              {Math.round(calculateProgress())}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs sm:text-sm text-gray-600">
            <span>Gewusst: {knownWords.length}</span>
            <span>Noch zu lernen: {vocabulary.length - knownWords.length}</span>
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="w-full max-w-2xl mx-auto mb-4 sm:mb-8">
        <div 
          className="bg-white rounded-xl shadow-lg p-4 sm:p-8 cursor-pointer min-h-[200px] sm:min-h-[300px] flex flex-col items-center justify-center relative"
          onClick={handleCardFlip}
        >
          <span className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4 absolute top-3 left-3">
            Karte {currentIndex + 1} von {vocabulary.length}
          </span>
          <h2 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-4 text-center px-4">
            {isFlipped ? vocabulary[currentIndex]?.english : vocabulary[currentIndex]?.german}
          </h2>
          <button
            className="flex items-center text-sm sm:text-base text-indigo-600 hover:text-indigo-700"
            onClick={(e) => {
              e.stopPropagation();
              handleCardFlip();
            }}
          >
            <Rotate3D className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            Karte umdrehen
          </button>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mb-4 sm:mb-8">
        <button
          onClick={handlePreviousCard}
          disabled={currentIndex === 0}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 flex items-center justify-center text-sm sm:text-base text-gray-700 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
          Zurück
        </button>
        <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={handleUnknownWord}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 flex items-center justify-center text-sm sm:text-base text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Nicht gewusst</span>
            <span className="sm:hidden">Nein</span>
          </button>
          <button
            onClick={handleKnownWord}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 flex items-center justify-center text-sm sm:text-base text-green-600 hover:text-green-700 border border-green-200 rounded-lg hover:bg-green-50"
          >
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Gewusst</span>
            <span className="sm:hidden">Ja</span>
          </button>
        </div>
        <button
          onClick={handleNextCard}
          disabled={currentIndex === vocabulary.length - 1}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 flex items-center justify-center text-sm sm:text-base text-gray-700 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Weiter
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
        </button>
      </div>

      {/* Restart Button */}
      <div className="flex justify-center">
        <button
          onClick={restartSession}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center justify-center text-sm sm:text-base"
        >
          <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          Neu starten
        </button>
      </div>
    </div>
  );
};