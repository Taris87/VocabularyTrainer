import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { loadVocabulary } from '../db/vocabulary';
import { getLearnedVocabulary } from '../db/learnedVocabulary';
import { getPrivateVocabulary } from '../db/privateVocabulary'; // Import getPrivateVocabulary
import { Brain, Trophy, Target, Book, TrendingUp } from 'lucide-react';

interface LevelProgress {
  beginner: number;
  intermediate: number;
  advanced: number;
  personal: number;
}

interface UserStats {
  totalWordsLearned: number;
  quizAccuracy: number;
  streak: number;
  longestStreak: number;
  lastActive: Date | null;
}

export const Profile = () => {
  const { user, checkAndUpdateStreak } = useAuthStore();
  const [levelProgress, setLevelProgress] = useState<LevelProgress>({
    beginner: 0,
    intermediate: 0,
    advanced: 0,
    personal: 0
  });
  const [stats, setStats] = useState<UserStats>({
    totalWordsLearned: 0,
    quizAccuracy: 0,
    streak: 0,
    longestStreak: 0,
    lastActive: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;
      
      // Überprüfe und aktualisiere die Lernserie
      checkAndUpdateStreak();
      
      setLoading(true);
      try {
        // Fetch vocabulary for each level
        const [beginnerWords, intermediateWords, advancedWords, personalWords] = await Promise.all([
          loadVocabulary('beginner'),
          loadVocabulary('intermediate'),
          loadVocabulary('advanced'),
          getPrivateVocabulary(user.uid)
        ]);

        // Fetch learned vocabulary with specific difficulty
        const [learnedBeginnerWords, learnedIntermediateWords, learnedAdvancedWords, learnedPersonalWords] = await Promise.all([
          getLearnedVocabulary(user.uid, 'beginner'),
          getLearnedVocabulary(user.uid, 'intermediate'),
          getLearnedVocabulary(user.uid, 'advanced'),
          getLearnedVocabulary(user.uid, 'personal')
        ]);

        // Debug logging for personal vocabulary
        console.log('Personal vocabulary details:', {
          available: {
            count: personalWords.length,
            words: personalWords
          },
          learned: {
            count: learnedPersonalWords.length,
            words: learnedPersonalWords
          }
        });

        // Calculate progress for each level
        const calculateProgress = (learned: number, total: number, difficulty: string) => {
          console.log(`Calculating ${difficulty} progress:`, {
            learned,
            total,
            percentage: total > 0 ? Math.round((learned / total) * 100) : 0
          });
          
          if (total === 0) return 0;
          return Math.round((learned / total) * 100);
        };

        const progress = {
          beginner: calculateProgress(learnedBeginnerWords.length, beginnerWords.length, 'beginner'),
          intermediate: calculateProgress(learnedIntermediateWords.length, intermediateWords.length, 'intermediate'),
          advanced: calculateProgress(learnedAdvancedWords.length, advancedWords.length, 'advanced'),
          personal: calculateProgress(learnedPersonalWords.length, personalWords.length, 'personal')
        };

        console.log('Final progress calculations:', progress);
        setLevelProgress(progress);

        // Calculate overall stats
        const totalLearned = 
          learnedBeginnerWords.length +
          learnedIntermediateWords.length +
          learnedAdvancedWords.length +
          learnedPersonalWords.length;

        setStats({
          totalWordsLearned: totalLearned,
          quizAccuracy: Math.round(user.progress?.quizAccuracy || 0),
          streak: user.progress?.learningStreak || 0,
          longestStreak: user.progress?.longestStreak || 0,
          lastActive: new Date()
        });
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
      setLoading(false);
    };

    fetchProgress();
  }, [user, user?.progress, checkAndUpdateStreak]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.email ? user.email.split('@')[0] : 'Benutzer'}</h1>
            <p className="text-gray-600">Lernender seit {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'kürzlich'}</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-semibold">Gelernte Wörter</h3>
          </div>
          <p className="text-3xl font-bold">{stats.totalWordsLearned}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-semibold">Quiz Genauigkeit</h3>
          </div>
          <p className="text-3xl font-bold">{stats.quizAccuracy}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold">Lernserie</h3>
          </div>
          <p className="text-3xl font-bold">
            {stats.streak} Tage {""}
            <span className="text-sm text-gray-500">
              (Rekord: {user?.progress?.longestStreak || stats.streak})
            </span>
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Book className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold">Zuletzt aktiv</h3>
          </div>
          <p className="text-lg">{stats.lastActive ? new Date(stats.lastActive).toLocaleDateString() : 'Heute'}</p>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold">Level Fortschritt</h2>
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Anfänger</span>
              <span className="text-indigo-600">{levelProgress.beginner}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${levelProgress.beginner}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Fortgeschritten</span>
              <span className="text-indigo-600">{levelProgress.intermediate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${levelProgress.intermediate}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Experte</span>
              <span className="text-indigo-600">{levelProgress.advanced}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${levelProgress.advanced}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Persönlich</span>
              <span className="text-indigo-600">{levelProgress.personal}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${levelProgress.personal}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Recommendations */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Lernempfehlungen</h2>
        <div className="space-y-4">
          {levelProgress.beginner < 100 && (
            <p className="text-gray-700">
              • Konzentriere dich auf die Anfänger-Vokabeln, um eine solide Grundlage aufzubauen.
            </p>
          )}
          {levelProgress.beginner === 100 && levelProgress.intermediate < 100 && (
            <p className="text-gray-700">
              • Großartig! Du bist bereit für fortgeschrittene Vokabeln.
            </p>
          )}
          {levelProgress.intermediate === 100 && levelProgress.advanced < 100 && (
            <p className="text-gray-700">
              • Du machst ausgezeichnete Fortschritte! Zeit für Experten-Vokabeln.
            </p>
          )}
          {levelProgress.advanced === 100 && (
            <p className="text-gray-700">
              • Fantastisch! Du hast alle Level gemeistert. Versuche, dein Wissen durch regelmäßige Wiederholungen zu festigen.
            </p>
          )} {levelProgress.personal === 100 && (
            <p className="text-gray-700">
              • Fantastisch! Du hast alle deine wunsch Vokabeln gelernt. Versuche, sie weiterhin zu festigen.
            </p>
          )}
          <p className="text-gray-700">
            • Übe regelmäßig mit den Karteikarten und Quiz-Funktionen.
          </p>
          <p className="text-gray-700">
            • Versuche, jeden Tag mindestens 10 neue Wörter zu lernen.
          </p>
        </div>
      </div>
    </div>
  );
};