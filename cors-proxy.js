/**
 * Simple CORS proxy server for the WordPress API
 * This avoids CORS issues when making requests from the React frontend
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// API configuration
const API_BASE_URL = 'https://play.occamsadvisory.com/portal';
const API_KEY = 'qV9@8kJz#2dP!mNc';
const PORT = process.env.PORT || 3002;

// Enable CORS for all routes with more permissive options
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CORS proxy server is running',
    timestamp: new Date().toISOString()
  });
});

// Configure proxy for default API
const defaultApiProxy = createProxyMiddleware({
  target: API_BASE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/wp-json/oc-login-api/v1'
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('x-auth-key', API_KEY);
  }
});

// Configure proxy for products API
const productsApiProxy = createProxyMiddleware({
  target: API_BASE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/products-api': '/wp-json/productsplugin/v1'
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('x-auth-key', API_KEY);

    // Log the request body for POST requests
    if (req.method === 'POST') {
      let rawBody = '';
      req.on('data', chunk => {
        rawBody += chunk.toString();
      });
      req.on('end', () => {
        console.log(`Request body for ${req.path}:`, rawBody);

        // Special handling for update-project endpoint
        if (req.path === '/products-api/update-project') {
          console.log('Processing update-project request');
        }
      });
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log response for specific endpoints
    if (req.path === '/products-api/update-project') {
      let responseBody = '';
      const originalWrite = res.write;
      const originalEnd = res.end;

      res.write = function(chunk) {
        responseBody += chunk.toString('utf8');
        originalWrite.apply(res, arguments);
      };

      res.end = function() {
        try {
          console.log(`Response from ${req.path}:`, responseBody);
        } catch (error) {
          console.error('Error parsing response:', error);
        }
        originalEnd.apply(res, arguments);
      };
    }
  }
});

// Apply the proxy middleware to routes
app.use('/api', defaultApiProxy);
app.use('/products-api', productsApiProxy);

// Start the server
app.listen(PORT, () => {
  console.log(`CORS proxy server running on http://localhost:${PORT}`);
  console.log(`API proxy endpoint: http://localhost:${PORT}/api`);
  console.log(`Products API endpoint: http://localhost:${PORT}/products-api`);
});
