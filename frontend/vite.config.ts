import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { OutgoingHttpHeaders } from 'http'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    },
    headers: {
      'Cache-Control': 'public, max-age=31536000',
      'Vary': 'Accept-Encoding'
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'terser' : false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          // Handle font files
          if (assetInfo.name?.match(/\.(woff2?|ttf|eot)$/)) {
            return 'fonts/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      }
    },
    cssMinify: true,
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "./src/styles/variables.scss";
        `
      }
    },
    devSourcemap: true,
  },
  // Add proper handling of public assets
  publicDir: 'public',
  resolve: {
    alias: {
      '@fonts': '/fonts'
    }
  }
}))
