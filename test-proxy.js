/**
 * Test script to verify that the proxy server is working correctly
 */

const axios = require('axios');

// Test the proxy server
async function testProxy() {
  try {
    //console.log('Testing proxy server...');
    
    // Test the invoices endpoint
    //console.log('\nTesting /api/invoices endpoint:');
    const invoicesResponse = await axios.get('http://localhost:3001/api/invoices', {
      params: {
        sort_by: 'date',
        sort_order: 'desc',
        page: 1,
        per_page: 10
      }
    });
    
    //console.log('Response status:', invoicesResponse.status);
    //console.log('Success:', invoicesResponse.data.success);
    //console.log('Message:', invoicesResponse.data.message);
    //console.log('Data count:', invoicesResponse.data.data ? invoicesResponse.data.data.length : 0);
    
    // Test the invoice-filters endpoint
    //console.log('\nTesting /api/invoice-filters endpoint:');
    const filtersResponse = await axios.get('http://localhost:3001/api/invoice-filters');
    
    //console.log('Response status:', filtersResponse.status);
    //console.log('Success:', filtersResponse.data.success);
    //console.log('Message:', filtersResponse.data.message);
    
    //console.log('\nProxy server is working correctly!');
  } catch (error) {
    console.error('Error testing proxy server:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Is the proxy server running?');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
  }
}

// Run the test
testProxy();
