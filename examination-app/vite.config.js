import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config for the Pre-Exam module demo.
// The dev server runs on port 5173 by default (`npm run dev`).
export default defineConfig({
  plugins: [react()],
})
