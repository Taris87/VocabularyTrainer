import { reloadVocabularyToFirebase } from '../db/vocabulary';

// Execute the reload
reloadVocabularyToFirebase()
  .then(() => {
    console.log('Vocabulary reloaded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to reload vocabulary:', error);
    process.exit(1);
  });
