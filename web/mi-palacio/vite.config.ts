import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Mi Palacio corre siempre en el puerto 5173: Palacio.Returns.Api ya tiene habilitado
// CORS específicamente para http://localhost:5173 (ver Program.cs del backend).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
});
