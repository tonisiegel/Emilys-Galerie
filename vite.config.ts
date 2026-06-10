import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Firebase ist groß und ändert sich selten — eigener Chunk → besser cacheable
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // React-Core ebenfalls separat
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})