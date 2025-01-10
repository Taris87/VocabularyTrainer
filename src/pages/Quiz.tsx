import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useVocabularyStore } from '../store/vocabularyStore';
import { RefreshCw } from 'lucide-react';
import { QuizQuestion, Vocabulary } from '../types';
import { addLearnedVocabulary } from '../db/learnedVocabulary';

interface QuizResult {
  correct: number;
  total: number;
  correctWords: Array<{
    german: string;
    english: string;
    userAnswer: string;
  }>;
  incorrectWords: Array<{
    german: string;
    english: string;
    userAnswer: string;
  }>;
}

export const Quiz = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const { user, updateUserProfile } = useAuthStore();
  const { 
    vocabulary, 
    loading, 
    error, 
    selectedDifficulty, 
    setSelectedDifficulty,
    fetchVocabulary,
  } = useVocabularyStore();

  const getScoreMessage = (correct: number, total: number) => {
    const percentage = (correct / total) * 100;
    if (percentage === 100) return "Perfekt! Du hast alle Fragen richtig beantwortet! 🎉";
    if (percentage >= 80) return "Sehr gut gemacht! 🌟";
    if (percentage >= 60) return "Gut gemacht! Weiter so! 👍";
    if (percentage >= 40) return "Du bist auf dem richtigen Weg! 💪";
    return "Übe weiter, du schaffst das! 📚";
  };

  useEffect(() => {
    if (user) {
      fetchVocabulary();
    }
  }, [user, selectedDifficulty, fetchVocabulary]);

  useEffect(() => {
    if (vocabulary.length >= 4 && questions.length === 0) {
      generateQuestions(vocabulary);
    }
  }, [vocabulary]);

  const handleDifficultyChange = (difficulty: 'beginner' | 'intermediate' | 'advanced' | 'personal') => {
    setSelectedDifficulty(difficulty);
    setQuizResult(null);
    setSelectedAnswer('');
    setCurrentQuestionIndex(0);
    setQuestions([]); // Clear questions to trigger regeneration
  };

  const generateQuestions = (vocabulary: Vocabulary[]) => {
    if (vocabulary.length < 4) {
      return;
    }

    const questions: QuizQuestion[] = vocabulary.map(word => {
      // Get 3 random wrong answers
      const wrongAnswers = vocabulary
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.english);

      // Add correct answer and shuffle all options
      const options = [...wrongAnswers, word.english].sort(() => Math.random() - 0.5);

      return {
        vocabulary: word,
        options,
        correctAnswer: word.english
      };
    }); 

    setQuestions(questions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setQuizResult(null);
  };

  const handleOptionSelect = (option: string) => {
    setSelectedAnswer(option);
  };

  const handleAnswer = (answer: string) => {
    if (!questions[currentQuestionIndex] || !user) return;

    const isCorrect = answer === questions[currentQuestionIndex].correctAnswer;
    const currentWord = questions[currentQuestionIndex].vocabulary;

    const answerData = {
      german: currentWord.german,
      english: currentWord.english,
      userAnswer: answer
    };

    const updatedQuizResult = !quizResult
      ? {
          correct: isCorrect ? 1 : 0,
          total: 1,
          correctWords: isCorrect ? [answerData] : [],
          incorrectWords: isCorrect ? [] : [answerData]
        }
      : {
          ...quizResult,
          total: quizResult.total + 1,
          correct: isCorrect ? quizResult.correct + 1 : quizResult.correct,
          correctWords: isCorrect 
            ? [...quizResult.correctWords, answerData]
            : quizResult.correctWords,
          incorrectWords: !isCorrect
            ? [...quizResult.incorrectWords, answerData]
            : quizResult.incorrectWords
        };
    
    if (currentQuestionIndex < questions.length - 1) {
      // If not the last question, just move to next question without setting final result
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswer('');
      // Store the running tally but don't display it yet
      setQuizResult(updatedQuizResult);
    } else {
      // Show results immediately and update profile in the background
      setQuizResult(updatedQuizResult);
      setCurrentQuestionIndex(questions.length);
      setSelectedAnswer('');
      // Update profile after showing results
      handleFinishQuiz(updatedQuizResult);
    }
  };

  const handleFinishQuiz = async (finalResult: QuizResult) => {
    if (!user) {
      console.error('No user found');
      return;
    }

    const correctAnswers = finalResult.correct;
    const accuracy = (correctAnswers / questions.length) * 100;

    try {
      // Update user profile with quiz results
      await updateUserProfile(user.uid, {
        progress: {
          score: (user.progress?.score || 0) + correctAnswers,
          quizAccuracy: accuracy,
          wordsLearned: (user.progress?.wordsLearned || 0) + finalResult.correctWords.length,
          learningStreak: user.progress?.learningStreak || 0
        }
      });

      console.log('Quiz results:', {
        correctWords: finalResult.correctWords,
        selectedDifficulty,
        userId: user.uid
      });

      // Add correct words to learned vocabulary collection
      for (const word of finalResult.correctWords) {
        const vocabWord = vocabulary.find(v => v.german === word.german);
        if (vocabWord) {
          try {
            const learnedWord = {
              id: vocabWord.id,
              german: word.german,
              english: word.english,
              difficulty: selectedDifficulty
            };
            console.log('Saving word as learned:', learnedWord);
            await addLearnedVocabulary(user.uid, learnedWord);
          } catch (error) {
            console.error('Error saving learned word:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error in handleFinishQuiz:', error);
    }
  };

  const handleRestart = () => {
    if (vocabulary.length >= 4) {
      setQuizResult(null);
      setSelectedAnswer('');
      setCurrentQuestionIndex(0);
      generateQuestions(vocabulary);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Vokabeln...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center text-red-600">
          <p>Fehler beim Laden der Vokabeln</p>
          <button 
            onClick={() => fetchVocabulary()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  if (vocabulary.length < 4) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Nicht genügend Vokabeln</h2>
          <p className="text-gray-600">Füge mindestens 4 Vokabeln hinzu, um das Quiz zu starten.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl">
      {/* Difficulty Selection */}
      <div className="flex justify-center mb-4 sm:mb-8">
        <div className="inline-flex flex-wrap justify-center gap-2 sm:gap-0 sm:flex-nowrap rounded-lg border border-gray-200 bg-white p-1 w-full sm:w-auto">
          {(['beginner', 'intermediate', 'advanced', 'personal'] as const).map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => handleDifficultyChange(difficulty)}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg flex-1 sm:flex-none whitespace-nowrap ${
                selectedDifficulty === difficulty
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              {difficulty === 'personal' ? 'Persönlich' :
               difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Questions */}
      {currentQuestionIndex < questions.length && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs sm:text-sm text-gray-500">
                Frage {currentQuestionIndex + 1} von {questions.length}
              </span>
              <span className="text-xs sm:text-sm font-medium text-indigo-600">
                {selectedDifficulty}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">
              {questions[currentQuestionIndex]?.vocabulary.german}
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {questions[currentQuestionIndex]?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full p-3 sm:p-4 text-left text-sm sm:text-base rounded-lg transition-colors ${
                    selectedAnswer === option
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => handleAnswer(selectedAnswer)}
              disabled={!selectedAnswer}
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg transition-colors ${
                selectedAnswer
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Quiz beenden' : 'Nächste Frage'}
            </button>
          </div>
        </div>
      )}

      {/* Quiz Result */}
      {currentQuestionIndex >= questions.length && quizResult && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Quiz beendet!</h2>
            <p className="text-lg sm:text-xl mb-2">
              {getScoreMessage(quizResult.correct, quizResult.total)}
            </p>
            <p className="text-base sm:text-lg text-gray-600">
              Richtig beantwortet: {quizResult.correct} von {quizResult.total}
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {quizResult.correctWords.length > 0 && (
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-green-700 flex items-center">
                  <span className="mr-2">✓</span> Richtige Antworten ({quizResult.correctWords.length})
                </h3>
                <div className="grid gap-3 sm:gap-4">
                  {quizResult.correctWords.map((word, index) => (
                    <div key={index} className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-100">
                      <p className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Deutsches Wort: {word.german}</p>
                      <p className="text-sm sm:text-base text-green-700">Englische Übersetzung: {word.english}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {quizResult.incorrectWords.length > 0 && (
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-red-700 flex items-center">
                  <span className="mr-2">✗</span> Falsche Antworten ({quizResult.incorrectWords.length})
                </h3>
                <div className="grid gap-3 sm:gap-4">
                  {quizResult.incorrectWords.map((word, index) => (
                    <div key={index} className="bg-red-50 p-3 sm:p-4 rounded-lg border border-red-100">
                      <p className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Deutsches Wort: {word.german}</p>
                      <p className="text-sm sm:text-base text-green-700 mb-1">Richtige Lösung: {word.english}</p>
                      <p className="text-sm sm:text-base text-red-700">Deine Antwort: {word.userAnswer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="text-center mt-6 sm:mt-8">
            <button
              onClick={handleRestart}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Quiz neu starten
            </button>
          </div>
        </div>
      )}
    </div>
  );
};