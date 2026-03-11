import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Set the base directory
  base: '/',

  // Set the project root directory (relative to the config file)
  root: './src',

  // Set the directory to serve static files from (relative to the root)
  publicDir: './public',

  // Set the build output directory
  build: {
    outDir: './dist',
    emptyOutDir: true
  },

  plugins: [react()],

  resolve: {
    alias: {
      '@': '/src'
    }
  }
});