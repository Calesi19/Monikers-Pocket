import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the app from /monikers/; local dev stays at /.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Monikers-Pocket/' : '/',
  plugins: [react(), tailwindcss()],
}))
