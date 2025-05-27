/**
 * Simple Express proxy server to handle API requests to the WordPress backend
 * This avoids CORS issues when making requests from the React frontend
 */

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// API configuration
const API_BASE_URL = 'https://portal.occamsadvisory.com/portal/wp-json/oc-login-api/v1';
const API_KEY = 'qV9@8kJz#2dP!mNc';

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the 'dist' directory (for production)
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy middleware for API requests
app.use('/api', async (req, res) => {
  try {
    // Get the path after /api
    const endpoint = req.path;

    // Build the full URL to the WordPress API
    const url = `${API_BASE_URL}${endpoint}`;

    // Forward the request method and query parameters
    const method = req.method.toLowerCase();
    const params = req.query;

    console.log(`Proxying ${method.toUpperCase()} request to: ${url}`);
    console.log('With params:', params);

    // Make the request to the WordPress API
    const response = await axios({
      method,
      url,
      params,
      data: method !== 'get' ? req.body : undefined,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-auth-key': API_KEY
      }
    });

    // Send the response back to the client
    res.status(response.status).json(response.data);

  } catch (error) {
    console.error('Proxy error:', error.message);

    // Forward the error response if available
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        success: false,
        message: `Proxy error: ${error.message}`
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
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`API proxy endpoint: http://localhost:${PORT}/api`);
});
