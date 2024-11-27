import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Vocabulary } from '../types';
import { Plus, Pencil, Trash2} from 'lucide-react';
import {
  addPrivateVocabulary,
  getPrivateVocabulary,
  deletePrivateVocabulary,
  updatePrivateVocabulary,
} from '../db/privateVocabulary';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const PersonalVocabulary: React.FC = () => {
  const { user, setUser } = useAuthStore();
  console.log('Current user:', user);  // Debug log
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVocab, setSelectedVocab] = useState<Vocabulary | null>(null);
 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          progress: user?.progress || {
            level: 'beginner',
            score: 0,
            wordsLearned: 0,
            learningStreak: 0,
            longestStreak: 0,
            quizAccuracy: undefined,
            lastActiveDate: undefined
          }
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadVocabularies = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const data = await getPrivateVocabulary(user.uid);
        setVocabularies(data);
        setError(null);
      } catch (err) {
        console.error('Error loading vocabularies:', err);
        setError('Failed to load vocabularies');
      } finally {
        setLoading(false);
      }
    };

    loadVocabularies();
  }, [user]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('Please sign in to add vocabulary');
      return;
    }

    const form = e.currentTarget;
    const formData = {
      german: (form.elements.namedItem('german') as HTMLInputElement).value,
      english: (form.elements.namedItem('english') as HTMLInputElement).value,
      category: (form.elements.namedItem('category') as HTMLInputElement).value
    };

    if (!formData.german || !formData.english) {
      setError('German and English fields are required');
      return;
    }

    try {
      if (selectedVocab) {
        // Update existing vocabulary
        await updatePrivateVocabulary(currentUser.uid, selectedVocab.id, {
          ...selectedVocab,
          ...formData,
          lastModified: new Date()
        });

        setVocabularies(vocabularies.map(vocab =>
          vocab.id === selectedVocab.id ? { ...vocab, ...formData } : vocab
        ));
      } else {
        // Add new vocabulary
        const newVocab = {
          ...formData,
          difficulty: 'beginner' as const,
          isCustom: true,
          createdAt: new Date(),
          lastModified: new Date()
        };

        console.log('Trying to add new vocabulary:', newVocab);
        const id = await addPrivateVocabulary(currentUser.uid, newVocab);
        console.log('Successfully added vocabulary with ID:', id);
        setVocabularies([...vocabularies, { ...newVocab, id }]);
      }

      // Reset form state
      handleCancel();
    } catch (err) {
      console.error('Error:', err);
      setError(selectedVocab ? 'Failed to update vocabulary' : 'Failed to add vocabulary');
    }
  };

  // Handle edit mode
  const handleEdit = (vocab: Vocabulary) => {
    setSelectedVocab(vocab);
    setIsEditing(true);
    setIsAdding(true);
  };

  // Handle cancel
  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setSelectedVocab(null);
  };

  // Handle vocabulary deletion
  const handleDelete = async (id: string) => {
    if (!user) return;
    
    try {
      await deletePrivateVocabulary(user.uid, id);
      setVocabularies(vocabularies.filter(vocab => vocab.id !== id));
    } catch (err) {
      setError('Failed to delete vocabulary');
      console.error(err);
    }
  };

  const VocabularyForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8 bg-white p-4 sm:p-5 rounded-lg shadow-md">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">German Word</label>
          <input
            type="text"
            name='german'
            defaultValue={selectedVocab?.german}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">English Translation</label>
          <input
            type="text"
            name='english'
            defaultValue={selectedVocab?.english}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            name='category'
            defaultValue={selectedVocab?.category}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
        <button
          type="button"
          onClick={handleCancel}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
        >
          {selectedVocab ? 'Update' : 'Add'} Word
        </button>
      </div>
    </form>
  );

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Personal Vocabulary</h1>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Word
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {(isAdding || isEditing) && <VocabularyForm />}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">German</th>
                <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">English</th>
                <th className="hidden sm:table-cell px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Category</th>
                <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vocabularies.map((vocab) => (
                <tr key={vocab.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
                    <div className="text-sm">{vocab.german}</div>
                    <div className="sm:hidden text-xs text-gray-500 mt-1">{vocab.category}</div>
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
                    <div className="text-sm">{vocab.english}</div>
                  </td>
                  <td className="hidden sm:table-cell px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
                    <div className="text-sm max-w-[150px] truncate" title={vocab.category}>{vocab.category}</div>
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 text-right">
                    <div className="flex justify-end items-center space-x-1 sm:space-x-2">
                      <button
                        onClick={() => handleEdit(vocab)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 sm:p-2"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(vocab.id)}
                        className="text-red-600 hover:text-red-900 p-1 sm:p-2"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {vocabularies.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-2 sm:px-4 lg:px-6 py-4 text-center text-gray-500 text-sm">
                    No vocabulary words added yet. Click "Add New Word" to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
