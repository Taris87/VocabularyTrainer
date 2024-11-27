import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/VocabularyTrainer/',
  plugins: [react()],
  build: {
    outDir: 'docs',
    emptyOutDir: true
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
})
