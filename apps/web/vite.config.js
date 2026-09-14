import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize chunk splitting for better Core Web Vitals
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
        },
      },
    },
    // Enable source maps for production debugging
    sourcemap: false,
    // Minify for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'recharts'],
  },
  // Server configuration
  server: {
    // Enable compression
    middlewareMode: false,
    proxy: {
      // Dev-only proxy for relative "/api" calls. Must match the backend port
      // (backend/.env defaults to 5002). Override with VITE_BACKEND_URL.
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5002',
        changeOrigin: true,
      },
    },
  },
})
