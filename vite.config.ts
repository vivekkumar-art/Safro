import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { adminAuthPlugin } from './server/adminVitePlugin.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    adminAuthPlugin(),
  ],
  server: {
    proxy: {
      '/api/roads': 'http://localhost:5000',
      '/api/vehicles': 'http://localhost:5000',
      '/api/incidents': 'http://localhost:5000',
      '/api/route': 'http://localhost:5000',
      '/api/sync': 'http://localhost:5000',
      '/api/weather': 'http://localhost:5000',
      '/api/v1/features': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 3500,
  },
})
