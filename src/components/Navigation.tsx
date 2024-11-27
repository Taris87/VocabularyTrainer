import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Brain, FlaskConical, User, LogOut, Star, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { signOut } from '../services/auth';
import { useState } from 'react';

export const Navigation = () => {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const navLinks = [
    { to: "/personal", icon: Star, text: "Personal" },
    { to: "/learn", icon: Brain, text: "Learn" },
    { to: "/quiz", icon: FlaskConical, text: "Quiz" },
    { to: "/flashcards", icon: BookOpen, text: "Flashcards" },
    { to: "/profile", icon: User, text: "Profile" },
  ];

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <span className="font-bold text-xl text-indigo-600">VocabMaster</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            {navLinks.map(({ to, icon: Icon, text }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600"
              >
                <Icon className="h-5 w-5" />
                <span>{text}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden fixed inset-0 top-16 bg-white transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col p-4 space-y-4">
          {navLinks.map(({ to, icon: Icon, text }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 p-2 rounded-lg hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Icon className="h-5 w-5" />
              <span>{text}</span>
            </Link>
          ))}
          <button
            onClick={() => {
              handleLogout();
              setIsMenuOpen(false);
            }}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 p-2 rounded-lg hover:bg-gray-50"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};