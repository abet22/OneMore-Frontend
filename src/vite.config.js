import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Esto hace lo mismo que poner --host en el comando
    allowedHosts: [
      'onemore.local', 
      'all' // 'all' permite todo si onemore.local falla, útil en dev
    ] 
  }
})
