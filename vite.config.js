import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures assets resolve properly on GitHub Pages or custom subpaths
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1200
  }
});
