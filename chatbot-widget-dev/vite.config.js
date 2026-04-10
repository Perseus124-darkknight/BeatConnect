import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => ({
  base: '/',
  build: {
    outDir: 'dist',
    lib: {
      // Use a single entry point for the UMD bundle
      entry: resolve(__dirname, 'widget-src/index.js'),
      formats: ['es', 'umd'],
      name: 'BeatConnectAI',
      fileName: (format) => `beatconnect-ai-core.${format}.js`
    },
    rollupOptions: {
      external: [], 
      output: {
        globals: {
          marked: 'marked'
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  plugins: [tsconfigPaths()]
}));
