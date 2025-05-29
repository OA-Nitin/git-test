/**
 * Invoice API Client
 *
 * A reusable client for interacting with the WordPress Invoice API
 * Uses sample data to demonstrate functionality
 */

import axios from 'axios';

// Sample data for demonstration
const SAMPLE_INVOICES = {
  success: true,
  message: "Invoices fetched successfully.",
  data: [
    {
      invoice_id: "1001",
      date: "2023-05-15",
      due_date: "2023-06-15",
      amount: "$1,500.00",
      customer_name: "Acme Corporation",
      business_name: "Acme Corporation",
      user: "John Smith",
      status: "Paid",
      type: "Goods or Services",
      product: "937", // STC
      billing_profile: "1",
      customer_invoice_no: "INV-1001",
      no_of_days_due: "0"
    },
    {
      invoice_id: "1002",
      date: "2023-05-20",
      due_date: "2023-06-20",
      amount: "$2,500.00",
      customer_name: "Globex Industries",
      business_name: "Globex Industries",
      user: "Jane Doe",
      status: "Invoiced",
      type: "Goods or Services",
      product: "936", // Tax Amendment
      billing_profile: "2",
      customer_invoice_no: "INV-1002",
      no_of_days_due: "15"
    },
    {
      invoice_id: "1003",
      date: "2023-06-01",
      due_date: "2023-07-01",
      amount: "$3,200.00",
      customer_name: "Stark Enterprises",
      business_name: "Stark Enterprises",
      user: "Tony Stark",
      status: "Paid",
      type: "Goods or Services",
      product: "935", // ERC
      billing_profile: "1",
      customer_invoice_no: "INV-1003",
      no_of_days_due: "0"
    },
    {
      invoice_id: "1004",
      date: "2023-06-10",
      due_date: "2023-07-10",
      amount: "$1,800.00",
      customer_name: "Wayne Industries",
      business_name: "Wayne Industries",
      user: "Bruce Wayne",
      status: "Invoiced",
      type: "Goods or Services",
      product: "934", // Audit Advisory
      billing_profile: "3",
      customer_invoice_no: "INV-1004",
      no_of_days_due: "5"
    },
    {
      invoice_id: "1005",
      date: "2023-06-15",
      due_date: "2023-07-15",
      amount: "$2,100.00",
      customer_name: "LexCorp",
      business_name: "LexCorp",
      user: "Lex Luthor",
      status: "Invoiced",
      type: "Goods or Services",
      product: "932", // RDC
      billing_profile: "2",
      customer_invoice_no: "INV-1005",
      no_of_days_due: "10"
    }
  ],
  total: 5,
  pages: 1,
  filters: {
    statuses: [
      "Invoiced",
      "Paid",
      "Cancel",
      "Draft",
      "Remind"
    ],
    types: [
      "Goods or Services"
    ],
    products: [
      "932", // RDC
      "934", // Audit Advisory
      "935", // ERC
      "936", // Tax Amendment
      "937", // STC
      "938"  // Partnership
    ],
    billing_profiles: [
      "1", // Reporting Head
      "2", // Quickbooks Play
      "3"  // Reporting Head Production
    ]
  }
};

const SAMPLE_FILTER_OPTIONS = {
  success: true,
  message: "Filters fetched successfully.",
  data: {
    statuses: [
      "Paid",
      "Invoiced",
      "Draft",
      "Remind",
      "Cancel",
      "Partially paid",
      "Payment in process",
      "Charge with quickbooks",
      "Charge with equipay",
      "First collections",
      "Second collections",
      "Demand collections",
      "Delete",
      "Void",
      "Payment Plan"
    ],
    types: [
      "Goods or Services"
    ],
    products: [
      "932", // RDC
      "934", // Audit Advisory
      "935", // ERC
      "936", // Tax Amendment
      "937", // STC
      "938"  // Partnership
    ],
    billing_profiles: [
      "1", // Reporting Head
      "2", // Quickbooks Play
      "3"  // Reporting Head Production
    ]
  }
};

class InvoiceApiClient {
  constructor() {
    // Direct API URL - no proxy needed
    this.baseUrl = 'https://portal.occamsadvisory.com/portal/wp-json/oc-login-api/v1';
    this.apiKey = 'qV9@8kJz#2dP!mNc';

    // Create axios instance with default config - no authentication
    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        // Authentication header removed
      },
      timeout: 30000, // 30 second timeout for slower connections
      withCredentials: false // Important for CORS
    });
  }

  /**
   * Get list of invoices with filtering, sorting and pagination
   *
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search term
   * @param {string} params.status - Filter by status
   * @param {string} params.filter_type - Filter type (from tabs in UI)
   * @param {string} params.date_from - Start date (YYYY-MM-DD)
   * @param {string} params.date_to - End date (YYYY-MM-DD)
   * @param {string} params.sort_by - Field to sort by
   * @param {string} params.sort_order - Sort direction ('asc' or 'desc')
   * @param {number} params.page - Page number
   * @param {number} params.per_page - Items per page
   * @returns {Promise} - Promise resolving to invoice data
   */
  async getInvoices(params = {}) {
    try {
      // Clean up undefined parameters
      const cleanParams = {};
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          cleanParams[key] = params[key];
        }
      });

      // Ensure pagination parameters are included
      if (!cleanParams.page) cleanParams.page = 1;
      if (!cleanParams.per_page) cleanParams.per_page = 50;

      // Ensure sorting parameters are included
      if (!cleanParams.sort_by) cleanParams.sort_by = 'date';
      if (!cleanParams.sort_order) cleanParams.sort_order = 'desc';

      // Log the parameters being sent to the API
      console.log('Sending params to API:', cleanParams);
      console.log('API URL:', `${this.baseUrl}/invoices`);

      // Make a direct API request without authentication
      try {
        const response = await axios({
          method: 'get',
          url: `${this.baseUrl}/invoices`,
          params: cleanParams,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            // No authentication header
          },
          timeout: 30000,
          withCredentials: false // Important for CORS
        });

        // Log the response structure
        console.log('API response structure:', {
          success: response.data.success,
          message: response.data.message,
          dataCount: response.data.data ? response.data.data.length : 0,
          total: response.data.total,
          pages: response.data.pages,
          filters: response.data.filters ? Object.keys(response.data.filters) : []
        });

        return response.data;
      } catch (error) {
        console.error('Error making direct API request:', error);
        console.log('Falling back to sample data for demonstration');

        // Create a sample response that matches the API response structure
        // This ensures pagination and other features work correctly
        const sampleData = [];

        // Generate sample data based on the current page and items per page
        const startIndex = (cleanParams.page - 1) * cleanParams.per_page;
        for (let i = 0; i < cleanParams.per_page; i++) {
          const index = startIndex + i;
          if (index < 100) { // Limit to 100 total sample records
            sampleData.push({
              invoice_id: `${1001 + index}`,
              date: new Date(2023, 5 + Math.floor(index / 30), 1 + (index % 30)).toISOString().split('T')[0],
              due_date: new Date(2023, 6 + Math.floor(index / 30), 1 + (index % 30)).toISOString().split('T')[0],
              amount: `$${(1500 + index * 100).toLocaleString('en-US', {minimumFractionDigits: 2})}`,
              customer_name: `Customer ${1001 + index}`,
              business_name: `Business ${1001 + index}`,
              user: `User ${(index % 5) + 1}`,
              status: [
                'Paid',
                'Invoiced',
                'Draft',
                'Remind',
                'Cancel',
                'Partially paid',
                'Payment in process',
                'Charge with quickbooks',
                'Charge with equipay',
                'First collections',
                'Second collections',
                'Demand collections',
                'Delete',
                'Void',
                'Payment Plan'
              ][index % 15],
              type: 'Goods or Services',
              product: ['932', '934', '935', '936', '937', '938'][index % 6],
              billing_profile: `${(index % 3) + 1}`,
              customer_invoice_no: `INV-${1001 + index}`,
              no_of_days_due: index % 5 === 0 ? '0' : `${(index % 30) + 1}`
            });
          }
        }

        // Apply sorting if specified
        if (cleanParams.sort_by && cleanParams.sort_order) {
          sampleData.sort((a, b) => {
            const fieldA = a[cleanParams.sort_by];
            const fieldB = b[cleanParams.sort_by];

            if (cleanParams.sort_order === 'asc') {
              return fieldA > fieldB ? 1 : -1;
            } else {
              return fieldA < fieldB ? 1 : -1;
            }
          });
        }

        // Apply search filter if specified
        let filteredData = sampleData;
        if (cleanParams.search) {
          const searchTerm = cleanParams.search.toLowerCase();
          filteredData = filteredData.filter(item =>
            item.customer_name.toLowerCase().includes(searchTerm) ||
            item.business_name.toLowerCase().includes(searchTerm) ||
            item.customer_invoice_no.toLowerCase().includes(searchTerm)
          );
        }

        // Apply status filter if specified
        if (cleanParams.status) {
          filteredData = filteredData.filter(item => item.status === cleanParams.status);
        }

        // Calculate total pages
        const totalItems = filteredData.length;
        const totalPages = Math.ceil(totalItems / cleanParams.per_page);

        return {
          success: true,
          message: "Sample invoices fetched successfully",
          data: filteredData.slice(0, cleanParams.per_page),
          total: totalItems,
          pages: totalPages,
          current_page: parseInt(cleanParams.page),
          per_page: parseInt(cleanParams.per_page),
          filters: {
            statuses: [
              'Paid',
              'Invoiced',
              'Draft',
              'Remind',
              'Cancel',
              'Partially paid',
              'Payment in process',
              'Charge with quickbooks',
              'Charge with equipay',
              'First collections',
              'Second collections',
              'Demand collections',
              'Delete',
              'Void',
              'Payment Plan'
            ],
            types: ['Goods or Services'],
            products: ['932', '934', '935', '936', '937', '938'],
            billing_profiles: ['1', '2', '3']
          }
        };
      }

      // Apply filtering to sample data
      let filteredData = [...SAMPLE_INVOICES.data];

      // Apply search filter if provided
      if (cleanParams.search) {
        const searchTerm = cleanParams.search.toLowerCase();
        filteredData = filteredData.filter(invoice =>
          invoice.customer_name.toLowerCase().includes(searchTerm) ||
          invoice.business_name.toLowerCase().includes(searchTerm) ||
          invoice.customer_invoice_no.toLowerCase().includes(searchTerm)
        );
      }

      // Apply status filter if provided
      if (cleanParams.status) {
        filteredData = filteredData.filter(invoice =>
          invoice.status === cleanParams.status
        );
      }

      // Apply date filters if provided
      if (cleanParams.date_from) {
        filteredData = filteredData.filter(invoice =>
          new Date(invoice.date) >= new Date(cleanParams.date_from)
        );
      }

      if (cleanParams.date_to) {
        filteredData = filteredData.filter(invoice =>
          new Date(invoice.date) <= new Date(cleanParams.date_to)
        );
      }

      // Apply sorting
      filteredData.sort((a, b) => {
        const fieldA = a[cleanParams.sort_by];
        const fieldB = b[cleanParams.sort_by];

        if (cleanParams.sort_order === 'asc') {
          return fieldA > fieldB ? 1 : -1;
        } else {
          return fieldA < fieldB ? 1 : -1;
        }
      });

      // Apply pagination
      const startIndex = (cleanParams.page - 1) * cleanParams.per_page;
      const endIndex = startIndex + cleanParams.per_page;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      // Create response object
      const response = {
        success: true,
        message: "Invoices fetched successfully.",
        data: paginatedData,
        total: filteredData.length,
        pages: Math.ceil(filteredData.length / cleanParams.per_page),
        current_page: parseInt(cleanParams.page),
        per_page: parseInt(cleanParams.per_page),
        filters: SAMPLE_INVOICES.filters
      };

      // Log the response structure
      console.log('API response structure:', {
        success: response.success,
        message: response.message,
        dataCount: response.data.length,
        total: response.total,
        pages: response.pages,
        filters: Object.keys(response.filters)
      });

      return response;
    } catch (error) {
      this.handleError(error, 'Error fetching invoices');
      throw error;
    }
  }

  /**
   * Get detailed information for a specific invoice
   *
   * @param {number} invoiceId - Invoice ID
   * @returns {Promise} - Promise resolving to invoice details
   */
  async getInvoiceDetail(invoiceId) {
    try {
      console.log(`Fetching invoice details for ID: ${invoiceId}`);

      // Make a direct API request without authentication
      const response = await axios({
        method: 'get',
        url: `${this.baseUrl}/invoices/${invoiceId}`,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
          // No authentication header
        },
        timeout: 30000,
        withCredentials: false // Important for CORS
      });

      console.log('Invoice detail response:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, `Error fetching invoice ${invoiceId}`);
      throw error;
    }
  }

  /**
   * Get available filter options
   *
   * @returns {Promise} - Promise resolving to filter options
   */
  async getFilterOptions() {
    try {
      console.log('Fetching filter options');

      // Make a direct API request without authentication
      try {
        const response = await axios({
          method: 'get',
          url: `${this.baseUrl}/invoice-filters`,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            // No authentication header
          },
          timeout: 30000,
          withCredentials: false // Important for CORS
        });

        console.log('Filter options response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error making direct API request for filter options:', error);
        console.log('Falling back to sample filter options for demonstration');

        // Return sample filter options as fallback
        return SAMPLE_FILTER_OPTIONS;
      }
    } catch (error) {
      this.handleError(error, 'Error fetching filter options');
      throw error;
    }
  }

  /**
   * Handle API errors
   *
   * @param {Error} error - Error object
   * @param {string} defaultMessage - Default error message
   */
  handleError(error, defaultMessage = 'API Error') {
    let errorMessage = defaultMessage;

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      console.error('API Error Status:', error.response.status);
      console.error('API Error Headers:', error.response.headers);
      errorMessage = error.response.data?.message || errorMessage;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response:', error.request);
      errorMessage = 'No response from server';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Error:', error.message);
      errorMessage = error.message;
    }

    console.error(`${defaultMessage}: ${errorMessage}`);
  }
}

export default InvoiceApiClient;
