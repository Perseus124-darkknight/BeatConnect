import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    open: true,
    hmr: {
      port: 5184,
      // Force consistent client port to avoid websocket conflicts in monorepo
      clientPort: 5184,
    },
    // Prevent Vite from watching the entire monorepo; only watch local and shared
    watch: {
      ignored: [
        '!**/src/**', 
        '!**/../ai-frontend/src/shared/**',
        '**/../ai-frontend/node_modules/**',
        '**/node_modules/**'
      ],
    },
  },
  define: {
    'process.env': {},
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@shared': resolve(__dirname, '../packages/shared/src'),
    },
  },
  build: {
    outDir: 'dist',
  },
});
