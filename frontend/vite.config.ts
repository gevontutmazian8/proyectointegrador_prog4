import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        // Librerías en archivos separados: el navegador las cachea entre despliegues.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          tanstack: ['@tanstack/react-query', '@tanstack/react-form', '@tanstack/react-table'],
          datos: ['axios', 'zustand'],
        },
      },
    },
  },
})
