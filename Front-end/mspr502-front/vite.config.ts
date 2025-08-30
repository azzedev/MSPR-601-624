import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  server: {
    host: '0.0.0.0', // Écouter sur toutes les interfaces
    port: 5173,      // Port par défaut de Vite
    strictPort: true, // Échouer si le port est déjà utilisé
    watch: {
      usePolling: true // Nécessaire pour Docker
    }
  }
})