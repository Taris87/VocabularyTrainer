import { reloadVocabularyToFirebase } from '../db/vocabulary';

console.log('Starting vocabulary reload script...');
reloadVocabularyToFirebase()
  .then(() => {
    console.log('Vocabulary reload completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to reload vocabulary:', error);
    process.exit(1);
  });
