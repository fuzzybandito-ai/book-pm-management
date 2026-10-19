import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Root dev config — the app source and index.html live at the project root
// so the dev server reads the root .env (VITE_SUPABASE_URL, VITE_BRAND, etc.)
// and serves index.html directly.
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
