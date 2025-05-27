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
        console.log('Request body:', rawBody);
      });
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
