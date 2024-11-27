import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, BookOpen, FlaskConical } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Home = () => {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to VocabMaster
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your journey to mastering English vocabulary starts here
        </p>
        <Link
          to="/auth"
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Get Started
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
        Welcome back, {user?.email ? user.email.split('@')[0] : 'User'}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link
          to="/learn"
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-col items-center text-center">
            <Brain className="h-12 w-12 text-indigo-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Learn</h2>
            <p className="text-gray-600">
              Practice vocabulary with interactive exercises
            </p>
          </div>
        </Link>

        <Link
          to="/quiz"
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-col items-center text-center">
            <FlaskConical className="h-12 w-12 text-indigo-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Quiz</h2>
            <p className="text-gray-600">
              Test your knowledge with challenging quizzes
            </p>
          </div>
        </Link>

        <Link
          to="/flashcards"
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-col items-center text-center">
            <BookOpen className="h-12 w-12 text-indigo-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Flashcards</h2>
            <p className="text-gray-600">
              Review vocabulary with spaced repetition
            </p>
          </div>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Your Progress</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">
              {user.progress.wordsLearned}
            </p>
            <p className="text-gray-600">Words Learned</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">
              {user.progress.score}
            </p>
            <p className="text-gray-600">Total Score</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600 capitalize">
              {user.progress.level}
            </p>
            <p className="text-gray-600">Current Level</p>
          </div>
        </div>
      </div>
    </div>
  );
};