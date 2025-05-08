import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/reporting/', // Set base path for deployment in a subdirectory (with trailing slash)
  build: {
    assetsDir: 'assets', // Directory to output assets relative to outDir
  },
  publicDir: 'public', // Directory to serve as plain static assets
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  },
  resolve: {
    alias: {
      '@': '/src', // Add alias for easier imports
      '@assets': '/assets'
    }
  }
})
