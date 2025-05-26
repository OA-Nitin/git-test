import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/reporting/', // Set base path for deployment in a subdirectory (with trailing slash)
  build: {
    assetsDir: 'assets', // Directory to output assets relative to outDir
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@mui/material', '@emotion/react', '@emotion/styled'],
        },
      },
    },
  },
  publicDir: 'public', // Directory to serve as plain static assets
  server: {
    port: 5174, // Set the server port to 5174
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    },
    hmr: {
      // Fix WebSocket connection issues
      clientPort: 5185,
      path: '',
    },
    proxy: {
      '/api': {
        target: 'https://play.occamsadvisory.com/portal',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/wp-json/oc-login-api/v1'),
        secure: false,
        headers: {
          'x-auth-key': 'qV9@8kJz#2dP!mNc'
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      },
      '/api/opportunities': {
        target: 'https://play.occamsadvisory.com/portal',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/opportunities/, '/wp-json/productsplugin/v1/opportunities'),
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('opportunities proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Opportunities Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Opportunities Response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src', // Add alias for easier imports
      '@assets': '/assets'
    }
  }
})
