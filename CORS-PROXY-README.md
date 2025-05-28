# CORS Proxy Setup for WordPress API

This project includes a CORS proxy server to handle API requests to the WordPress backend. This avoids CORS issues when making requests from the React frontend.

## Why a CORS Proxy?

The WordPress API at `https://portal.occamsadvisory.com/portal/wp-json/oc-login-api/v1` does not include the necessary CORS headers to allow direct requests from a browser-based application running on a different domain (like localhost during development). The proxy server acts as a middleware that adds the required CORS headers to the responses.

## Running the Application with the CORS Proxy

There are two ways to run the application with the CORS proxy:

### Option 1: Run the Development Server and Proxy Separately

1. Start the CORS proxy server:
   ```
   npm run proxy
   ```

2. In a separate terminal, start the development server:
   ```
   npm run dev
   ```

### Option 2: Run Both Servers Concurrently

Run both the development server and the CORS proxy with a single command:
```
npm run dev:proxy
```

## How It Works

1. The React application makes API requests to `http://localhost:3001/api/...`
2. The CORS proxy server receives these requests and forwards them to the WordPress API at `https://portal.occamsadvisory.com/portal/wp-json/oc-login-api/v1/...`
3. The proxy server adds the necessary authentication headers (`x-auth-key`) to the requests
4. The proxy server receives the responses from the WordPress API and forwards them back to the React application with the appropriate CORS headers

## Troubleshooting

If you see CORS-related errors in the browser console, make sure:

1. The CORS proxy server is running (`npm run proxy`)
2. The React application is making requests to `http://localhost:3001/api/...` instead of directly to the WordPress API
3. There are no network connectivity issues

You can check if the proxy server is running by visiting `http://localhost:3001/api/health` in your browser. You should see a JSON response indicating that the proxy server is running.

## Production Deployment

For production deployment, you have several options:

1. Deploy the CORS proxy server alongside your React application
2. Configure your production server (e.g., Nginx, Apache) to proxy the API requests
3. Ask the WordPress API administrators to add the necessary CORS headers to the API responses

The most secure and reliable option is to have the WordPress API administrators add the CORS headers directly to the API responses.
