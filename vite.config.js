import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base path ensures GitHub Pages (amarlovetips.github.io/googleformauto/) & Vercel load assets cleanly without 404 white page
  base: './',
  server: {
    port: 3000,
  },
});
