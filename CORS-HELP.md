# Handling CORS Issues with the WordPress API

If you're experiencing CORS (Cross-Origin Resource Sharing) issues when connecting to the WordPress API, here are some solutions:

## Option 1: Use a Browser Extension

For development and testing purposes, you can use a browser extension to bypass CORS restrictions:

### Chrome:
1. Install [CORS Unblock](https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino)
2. Click the extension icon and toggle it on
3. Refresh your page

### Firefox:
1. Install [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/)
2. Click the extension icon to enable it
3. Refresh your page

## Option 2: Configure the WordPress Server

If you have access to the WordPress server, add the following to your .htaccess file:

```
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE"
    Header set Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, x-auth-key"
    Header set Access-Control-Allow-Credentials "true"
</IfModule>
```

Or add this to your WordPress theme's functions.php:

```php
add_action('init', 'add_cors_headers');
function add_cors_headers() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, x-auth-key");
    header("Access-Control-Allow-Credentials: true");
}
```

## Option 3: Use a Proxy Server

For a more permanent solution, you can set up a proxy server. We've included a simple Express.js proxy server in this project:

1. Install the required dependencies:
   ```
   npm install express cors http-proxy-middleware
   ```

2. Start the proxy server:
   ```
   node cors-proxy.js
   ```

3. Update the API client to use the proxy server:
   ```javascript
   this.baseUrl = 'http://localhost:3001/api';
   ```

## Troubleshooting

If you're still experiencing CORS issues:

1. Check the browser console for specific error messages
2. Verify that the API server is accessible
3. Ensure that the API key is correct
4. Try using a different browser
5. Disable any security extensions that might be blocking requests

Remember that CORS is a security feature, and bypassing it in production environments should be done carefully and only when necessary.
