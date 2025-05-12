# CORS Proxy Extension Setup

If you're experiencing CORS issues when connecting to the WordPress API, you can use a browser extension to bypass these restrictions during development.

## Chrome Extension: CORS Unblock

1. Install the CORS Unblock extension from the Chrome Web Store:
   [CORS Unblock](https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino)

2. After installation, click on the extension icon in your browser toolbar.

3. Toggle the extension to "On" to enable CORS bypassing.

4. Refresh your application page.

## Firefox Extension: CORS Everywhere

1. Install the CORS Everywhere extension from Firefox Add-ons:
   [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/)

2. After installation, click on the extension icon in your browser toolbar.

3. Toggle the extension to enable CORS bypassing.

4. Refresh your application page.

## Important Notes

- These extensions should only be used during development and testing.
- Do not use these extensions when browsing sensitive websites as they can introduce security vulnerabilities.
- For production, a proper server-side solution should be implemented.
- Remember to disable the extension when not needed.

## Alternative: Server-Side Proxy

For a more permanent solution, consider setting up a server-side proxy using Express.js. This approach is more secure and suitable for production environments.

```javascript
// Example Express.js proxy server
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/invoices', async (req, res) => {
  try {
    const response = await axios.get('https://play.occamsadvisory.com/portal/wp-json/oc-login-api/v1/invoices', {
      headers: {
        'x-auth-key': 'qV9@8kJz#2dP!mNc'
      },
      params: req.query
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Proxy server running on port 3001');
});
```
