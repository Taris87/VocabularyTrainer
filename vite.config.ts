import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    base: '/VocabularyTrainer/',
    build: {
      outDir: 'docs',
      emptyOutDir: true
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      'process.env': env
    }
  };
});
