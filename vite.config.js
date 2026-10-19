import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Root dev config — the app source lives in ./pulse, but the dev server needs
// to run from the project root so the preview can find a root package.json.
// We point root/ and publicDir at the pulse folder and keep a simple base
// path of '/' for local dev (the pulse/ config handles the GitHub Pages
// subpath for production builds).
export default defineConfig({
  plugins: [react()],
  root: fileURLToPath(new URL('./pulse', import.meta.url)),
  publicDir: false,
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./pulse/src', import.meta.url)),
    },
  },
  server: {
    fs: {
      allow: [fileURLToPath(new URL('./pulse', import.meta.url))],
    },
  },
  build: {
    outDir: fileURLToPath(new URL('./pulse/dist', import.meta.url)),
    emptyOutDir: true,
  },
});
