import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@stitch': path.resolve(__dirname, './src/design/stitch'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Serve the backend-generated SEO infrastructure from the storefront
      // origin too so crawlers hitting http://localhost:5173/ find the same
      // sitemap/robots as the API origin. The root paths are rewritten onto
      // the backend's /api/* routes (see backend/routes/seoRoutes.js).
      '/sitemap.xml': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => '/api/sitemap.xml',
      },
      '/robots.txt': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => '/api/robots.txt',
      },
    },
  },
});
