import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Necesario para Docker
    proxy: {
      '/api': {
        // LEEMOS LA VARIABLE, SI NO EXISTE USAMOS LOCALHOST
        target: process.env.API_TARGET || 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        // Si tu backend no espera "/api" al principio, descomenta esto:
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})