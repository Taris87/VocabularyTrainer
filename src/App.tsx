import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Learn } from './pages/Learn';
import { Quiz } from './pages/Quiz';
import { Flashcards } from './pages/Flashcards';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';
import { PersonalVocabulary } from './pages/PersonalVocabulary';
import { PrivateRoute } from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navigation />
        <main className="pt-16 min-h-screen">
          <div className="container mx-auto px-4 py-4 md:py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/personal"
                element={
                  <PrivateRoute>
                    <PersonalVocabulary />
                  </PrivateRoute>
                }
              />
              <Route
                path="/learn"
                element={
                  <PrivateRoute>
                    <Learn />
                  </PrivateRoute>
                }
              />
              <Route
                path="/quiz"
                element={
                  <PrivateRoute>
                    <Quiz />
                  </PrivateRoute>
                }
              />
              <Route
                path="/flashcards"
                element={
                  <PrivateRoute>
                    <Flashcards />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;