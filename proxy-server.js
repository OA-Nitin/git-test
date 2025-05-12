/**
 * Express proxy server to handle API requests to the WordPress backend
 * This avoids CORS issues when making requests from the React frontend
 *
 * This version uses axios directly instead of http-proxy-middleware
 * for more control over the requests and responses
 */

// Use CommonJS syntax since this file is not processed by Vite
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// API configuration
const API_BASE_URL = 'https://play.occamsadvisory.com/portal';
const API_PATH = '/wp-json/oc-login-api/v1';
const API_KEY = 'qV9@8kJz#2dP!mNc';
const PORT = process.env.PORT || 3001;

// Enable request logging
const logRequest = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  if (Object.keys(req.query).length > 0) {
    console.log('Query params:', req.query);
  }
  next();
};

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the 'dist' directory (for production)
app.use(express.static(path.join(__dirname, 'dist')));

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Proxy server is running',
    timestamp: new Date().toISOString()
  });
});

// Proxy middleware for invoices endpoint
app.get('/api/invoices', async (req, res) => {
  try {
    console.log('Proxy server: Received request for invoices');
    console.log('Query parameters:', req.query);

    const url = `${API_BASE_URL}${API_PATH}/invoices`;
    console.log('Forwarding to:', url);

    // Forward the request to the WordPress API
    const response = await axios({
      method: 'get',
      url: url,
      params: req.query,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-auth-key': API_KEY
      }
    });

    console.log('Proxy server: Successfully fetched invoices');
    console.log(`Received ${response.data.data ? response.data.data.length : 0} records`);

    // Send the response back to the client
    res.json(response.data);
  } catch (error) {
    console.error('Proxy server error:', error.message);

    // Forward the error response if available
    if (error.response) {
      console.error('API Error Response:', error.response.data);
      console.error('API Error Status:', error.response.status);
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
      res.status(500).json({
        success: false,
        message: 'No response received from the API server'
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Proxy server error: ${error.message}`
      });
    }
  }
});

// Proxy middleware for invoice details endpoint
app.get('/api/invoices/:id', async (req, res) => {
  try {
    const invoiceId = req.params.id;
    console.log(`Proxy server: Received request for invoice ${invoiceId}`);

    const url = `${API_BASE_URL}${API_PATH}/invoices/${invoiceId}`;
    console.log('Forwarding to:', url);

    // Forward the request to the WordPress API
    const response = await axios({
      method: 'get',
      url: url,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-auth-key': API_KEY
      }
    });

    console.log('Proxy server: Successfully fetched invoice details');

    // Send the response back to the client
    res.json(response.data);
  } catch (error) {
    console.error('Proxy server error:', error.message);

    // Forward the error response if available
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        success: false,
        message: `Proxy server error: ${error.message}`
      });
    }
  }
});

// Proxy middleware for invoice filters endpoint
app.get('/api/invoice-filters', async (req, res) => {
  try {
    console.log('Proxy server: Received request for invoice filters');

    const url = `${API_BASE_URL}${API_PATH}/invoice-filters`;
    console.log('Forwarding to:', url);

    // Forward the request to the WordPress API
    const response = await axios({
      method: 'get',
      url: url,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-auth-key': API_KEY
      }
    });

    console.log('Proxy server: Successfully fetched invoice filters');

    // Send the response back to the client
    res.json(response.data);
  } catch (error) {
    console.error('Proxy server error:', error.message);

    // Forward the error response if available
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        success: false,
        message: `Proxy server error: ${error.message}`
      });
    }
  }
});

// For any other routes, serve the React app (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`API proxy endpoint: http://localhost:${PORT}/api`);
});
