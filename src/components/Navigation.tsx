import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Brain, FlaskConical, User, LogOut, Star } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { signOut } from '../services/auth';

export const Navigation = () => {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <span className="font-bold text-xl text-indigo-600">VocabMaster</span>
          </Link>
          
          <div className="flex space-x-6">
            <Link to="/personal" className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600">
              <Star className="h-5 w-5" />
              <span>Personal</span>
            </Link>
            
            <Link to="/learn" className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600">
              <Brain className="h-5 w-5" />
              <span>Learn</span>
            </Link>
            
            <Link to="/quiz" className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600">
              <FlaskConical className="h-5 w-5" />
              <span>Quiz</span>
            </Link>
            
            <Link to="/flashcards" className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600">
              <BookOpen className="h-5 w-5" />
              <span>Flashcards</span>
            </Link>
            
            <Link to="/profile" className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600">
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};