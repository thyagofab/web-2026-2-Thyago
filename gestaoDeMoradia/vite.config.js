
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // amazon-cognito-identity-js ainda referencia `global` no bundle do navegador.
  define: {
    global: 'globalThis',
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})
