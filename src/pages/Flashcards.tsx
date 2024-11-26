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
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchVocabulary = async () => {
      if (!user) return;
      setIsLoading(true);
      const words = await loadVocabulary(selectedDifficulty);
      setVocabulary(words);
      setIsLoading(false);
      // Reset progress when difficulty changes
      setKnownWords([]);
      setUnknownWords([]);
      setCurrentIndex(0);
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
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4">
      {/* Difficulty Selection */}
      <div className="w-full max-w-2xl mb-8">
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <h3 className="text-lg font-semibold mb-3">Schwierigkeitsgrad:</h3>
          <div className="flex gap-2">
            {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty as 'beginner' | 'intermediate' | 'advanced')}
                className={`px-4 py-2 rounded-lg ${
                  selectedDifficulty === difficulty
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-indigo-50'
                } transition-colors`}
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Fortschritt</span>
            <span className="text-sm font-medium text-indigo-600">
              {Math.round(calculateProgress())}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Gewusst: {knownWords.length}</span>
            <span>Noch zu lernen: {vocabulary.length - knownWords.length}</span>
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="w-full max-w-2xl mb-8">
        <div 
          className="bg-white rounded-xl shadow-lg p-8 cursor-pointer min-h-[300px] flex flex-col items-center justify-center"
          onClick={handleCardFlip}
        >
          <span className="text-sm text-gray-500 mb-4">
            Karte {currentIndex + 1} von {vocabulary.length}
          </span>
          <h2 className="text-3xl font-bold mb-4">
            {isFlipped ? vocabulary[currentIndex]?.english : vocabulary[currentIndex]?.german}
          </h2>
          <button
            className="flex items-center text-indigo-600 hover:text-indigo-700"
            onClick={(e) => {
              e.stopPropagation();
              handleCardFlip();
            }}
          >
            <Rotate3D className="w-5 h-5 mr-2" />
            Karte umdrehen
          </button>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-8">
        <button
          onClick={handlePreviousCard}
          disabled={currentIndex === 0}
          className="px-4 py-2 flex items-center text-gray-700 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Zurück
        </button>
        <div className="flex gap-4">
          <button
            onClick={handleUnknownWord}
            className="px-4 py-2 flex items-center text-red-600 hover:text-red-700"
          >
            <XCircle className="w-5 h-5 mr-1" />
            Nicht gewusst
          </button>
          <button
            onClick={handleKnownWord}
            className="px-4 py-2 flex items-center text-green-600 hover:text-green-700"
          >
            <CheckCircle2 className="w-5 h-5 mr-1" />
            Gewusst
          </button>
        </div>
        <button
          onClick={handleNextCard}
          disabled={currentIndex === vocabulary.length - 1}
          className="px-4 py-2 flex items-center text-gray-700 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Weiter
          <ChevronRight className="w-5 h-5 ml-1" />
        </button>
      </div>

      {/* Restart Button */}
      <button
        onClick={restartSession}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center"
      >
        <RefreshCw className="w-5 h-5 mr-2" />
        Neu starten
      </button>
    </div>
  );
};