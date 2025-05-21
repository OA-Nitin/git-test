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
const API_PATH = '/wp-json/oc-login-api/v1';
const API_KEY = 'qV9@8kJz#2dP!mNc';
const PORT = process.env.PORT || 3002;

// Enable CORS for all routes
app.use(cors());

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CORS proxy server is running',
    timestamp: new Date().toISOString()
  });
});

// Configure proxy middleware
const proxyOptions = {
  target: API_BASE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': API_PATH
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add the API key to all requests
    proxyReq.setHeader('x-auth-key', API_KEY);

    // Log the request details
    console.log(`Proxying ${req.method} request to: ${API_BASE_URL}${API_PATH}${req.url.replace('/api', '')}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log the response status
    console.log(`Received response for ${req.url}: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({
      success: false,
      message: `Proxy error: ${err.message}`
    });
  }
};

// Apply the proxy middleware to all /api routes
app.use('/api', createProxyMiddleware(proxyOptions));

// Start the server
app.listen(PORT, () => {
  console.log(`CORS proxy server running on http://localhost:${PORT}`);
  console.log(`API proxy endpoint: http://localhost:${PORT}/api`);
});
