import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import './common/ReportStyle.css';

import './FinanceReportStyles.css';

import SortableTableHeader from './common/SortableTableHeader';
import { getAssetPath } from '../utils/assetUtils';
import InvoiceApiClient from '../api/invoice-api-client';
import { Link } from 'react-router-dom';

/**
 * ManageFinanceReport Component
 *
 * Displays a table of finance/invoice data with sorting, filtering, and export capabilities.
 * Matches the WordPress list table style exactly.
 */
const ManageFinanceReport = () => {
  // We'll initialize the API client when needed in each function

  // State for API data
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // State for filter options from API
  const [filterOptions, setFilterOptions] = useState({
    statuses: [],
    types: [],
    products: [],
    billing_profiles: []
  });

  // State for search, filter, pagination, and sorting
  // Default sort is by date in descending order (newest first)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc'); // Default to descending order

  // No need for API access check since we're using sample data as fallback

  // Load data when component mounts
  useEffect(() => {
    document.title = "Finance Report - Occams Portal"; // Set title for Finance Report page
    console.log('Component mounted - fetching initial data');

    // Use a self-executing async function to handle async operations
    (async () => {
      try {
        // Fetch filter options first
        console.log('Calling fetchFilterOptions...');
        await fetchFilterOptions();
        console.log('fetchFilterOptions called successfully');

        // Then load initial data
        console.log('Calling fetchInvoices...');
        await fetchInvoices();
        console.log('fetchInvoices called successfully');
      } catch (error) {
        console.error('Error in useEffect:', error);

        // Show a user-friendly error message
        Swal.fire({
          icon: 'error',
          title: 'Error Loading Data',
          text: `Failed to load initial data: ${error.message}`,
          footer: '<a href="javascript:void(0)" onclick="console.log(\'Open console for more details\')">See console for more details</a>'
        });
      }
    })();

    // Return cleanup function
    return () => {
      console.log('Component unmounting - cleaning up');
    };
  }, []);

  // Create a ref to track the first render
  const isFirstRender = useRef(true);

  // Refetch invoices when sorting or filtering changes
  // We don't include currentPage here because we handle that in the paginate function
  useEffect(() => {
    // Skip the initial render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    console.log('Refetching due to sorting or filtering change');
    setCurrentPage(1); // Reset to first page when sort or filter changes
    fetchInvoices();
  }, [sortField, sortDirection, filterStatus]);

  // Function to fetch filter options from API - using the invoice-api-client
  const fetchFilterOptions = async () => {
    try {
      console.log('Fetching filter options from API...');

      // Initialize the API client
      const invoiceApi = new InvoiceApiClient();

      // Call the API using the client
      const response = await invoiceApi.getFilterOptions();
      console.log('Filter Options Response:', response);

      // Check if we have a valid response with data
      if (response && response.success && response.data) {
        setFilterOptions(response.data);
        console.log('Filter options set from API response');
      } else {
        // If API doesn't return filter options, use hardcoded defaults
        console.log('Using default filter options');
        setFilterOptions({
          statuses: [
            "Invoiced",
            "Paid",
            "Cancel",
            "Draft",
            "Remind",
            "payment in process",
            "charge with quickbooks",
            "charge with equipay",
            "First collections",
            "Second collections",
            "Demand collections",
            "Delete",
            "Void",
            "Partially paid",
            "Payment Plan"
          ],
          types: [
            "Goods or Services"
          ],
          products: [
            "932",
            "934",
            "935",
            "936",
            "937",
            "938"
          ],
          billing_profiles: [
            "1",
            "2",
            "3"
          ]
        });
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);

      // Use hardcoded defaults on error
      console.log('Using default filter options due to error');
      setFilterOptions({
        statuses: [
          "Invoiced",
          "Paid",
          "Cancel",
          "Draft",
          "Remind",
          "payment in process",
          "charge with quickbooks",
          "charge with equipay",
          "First collections",
          "Second collections",
          "Demand collections",
          "Delete",
          "Void",
          "Partially paid",
          "Payment Plan"
        ],
        types: [
          "Goods or Services"
        ],
        products: [
          "932",
          "934",
          "935",
          "936",
          "937",
          "938"
        ],
        billing_profiles: [
          "1",
          "2",
          "3"
        ]
      });
    }
  };

  // We'll only use real API data - no fallback data or sample data

  // Function to fetch invoices from API - using the invoice-api-client
  const fetchInvoices = async () => {
    console.log('fetchInvoices function called');
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching invoices from API...');

      // Initialize the API client
      const invoiceApi = new InvoiceApiClient();

      // Format dates for API if provided
      let formattedDateFrom = null;
      let formattedDateTo = null;

      if (dateFrom) {
        formattedDateFrom = dateFrom;
      }

      if (dateTo) {
        formattedDateTo = dateTo;
      }

      // Prepare API parameters - match exactly with the PHP API parameters
      const params = {
        search: searchTerm || undefined,
        status: filterStatus || undefined,
        filter_type: activeTab !== 'all' ? activeTab : undefined,
        sort_by: sortField || 'date',
        sort_order: sortDirection || 'desc',
        page: currentPage,
        per_page: itemsPerPage,
        date_from: formattedDateFrom, // API expects YYYY-MM-DD format
        date_to: formattedDateTo // API expects YYYY-MM-DD format
      };

      console.log('API params:', params);

      // Call the API using the client
      const response = await invoiceApi.getInvoices(params);
      console.log('API Response:', response);

      // Check if we have a valid response
      if (response && response.success === true) {
        // Use the data from the API
        const apiData = response.data || [];

        // Set total items and pages from API response
        setTotalItems(response.total || 0);
        setTotalPages(response.pages || 1);

        // Set the invoices state with the API data
        setInvoices(apiData);

        console.log(`API returned ${apiData.length} records, total: ${response.total}, pages: ${response.pages}`);

        // If filters are included in the response, update the filter options
        if (response.filters) {
          setFilterOptions(response.filters);
          console.log('Updated filter options from API response');
        }

        // Clear any previous error message
        setError(null);

        // If no data returned, show a message
        if (apiData.length === 0) {
          setError('No invoices found matching your criteria.');
        }
      } else {
        console.error('API returned error or invalid response:', response);
        setError(response?.message || 'Failed to fetch invoices');
        setInvoices([]); // Empty array - no fallback data
      }

    } catch (err) {
      console.error('Error fetching invoices:', err);

      // Provide more detailed error information
      let errorMessage = `Error: ${err.message}`;

      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('API Error Response:', err.response.data);
        console.error('API Error Status:', err.response.status);
        console.error('API Error Headers:', err.response.headers);
        errorMessage = `Server Error (${err.response.status}): ${err.response.data?.message || err.message}`;

        // Check for CORS issues
        if (err.response.status === 0 || err.response.status === 403) {
          console.error('Possible CORS issue detected');
          errorMessage = 'Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource. Please check the console for more details.';
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.error('API No Response:', err.request);
        errorMessage = 'No response from server. This could be due to network issues or CORS restrictions. Please check the console for more details.';
      }

      setError(errorMessage);
      setInvoices([]);

      // Show a more user-friendly error message
      Swal.fire({
        icon: 'error',
        title: 'Error Fetching Data',
        text: errorMessage,
        footer: '<a href="javascript:void(0)" onclick="console.log(\'Open console for more details\')">See console for more details</a>'
      });
    } finally {
      setLoading(false);
      console.log('fetchInvoices function completed');
    }
  };

  // Define all available columns - exactly matching the API response from Postman
  const columnGroups = [
    {
      id: 'basic',
      title: 'Basic Information',
      columns: [
        { id: 'date', label: 'Date', field: 'date', sortable: true },
        { id: 'invoiceNumber', label: 'Invoice #', field: 'customer_invoice_no', sortable: true }, // Updated to match API response
        { id: 'billingProfile', label: 'Billing Profile', field: 'billing_profile', sortable: true },
        { id: 'amount', label: 'Amount', field: 'amount', sortable: true },
        { id: 'businessName', label: 'Business Name', field: 'business_name', sortable: true },
        { id: 'customerName', label: 'Customer Name', field: 'customer_name', sortable: true },
        { id: 'user', label: 'User', field: 'user', sortable: true },
        { id: 'status', label: 'Status', field: 'status', sortable: true },
        { id: 'type', label: 'Type', field: 'type', sortable: true },
        { id: 'product', label: 'Product', field: 'product', sortable: true },
        { id: 'dueDate', label: 'Due Date', field: 'due_date', sortable: true },
        { id: 'daysDue', label: 'No. Days Due', field: 'no_of_days_due', sortable: true },
        { id: 'action', label: 'Action', field: 'action', sortable: false }
      ]
    }
  ];

  // Flatten all columns for easier access
  const allColumns = columnGroups.flatMap(group => group.columns);

  // Default visible columns - exactly matching the WordPress list table
  const defaultVisibleColumns = ['date', 'invoiceNumber', 'billingProfile', 'amount', 'businessName', 'customerName', 'user', 'status', 'type', 'product', 'dueDate', 'daysDue', 'action'];

  // State to track visible columns
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);

  // Toggle column visibility
  const toggleColumnVisibility = (columnId) => {
    if (visibleColumns.includes(columnId)) {
      // Remove column if it's already visible
      setVisibleColumns(visibleColumns.filter(id => id !== columnId));
    } else {
      // Add column if it's not visible
      setVisibleColumns([...visibleColumns, columnId]);
    }
  };

  // Reset to default columns
  const resetToDefaultColumns = () => {
    setVisibleColumns(defaultVisibleColumns);
  };

  // Select all columns
  const selectAllColumns = () => {
    setVisibleColumns(allColumns.map(col => col.id));
  };

  // Handle sorting - allows user to change sort order by clicking on column headers
  const handleSort = (field) => {
    // Find the column with this field
    const column = allColumns.find(col => col.field === field);
    if (!column) return;

    let newDirection;
    if (sortField === field) {
      // If already sorting by this field, toggle direction
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
    } else {
      // If sorting by a new field, set it and default to descending (newest/largest first)
      setSortField(field);
      newDirection = 'desc';
      setSortDirection('desc');
    }

    // Reset to first page when sorting changes
    setCurrentPage(1);

    console.log('Sorting changed:', { field, direction: newDirection });

    // Fetch new data with the updated sorting
    // We don't need setTimeout here - React will batch the state updates
    fetchInvoices();
  };

  // Update when sort field or direction changes
  useEffect(() => {
    console.log('Sort changed:', { sortField, sortDirection });
  }, [sortField, sortDirection]);

  // We're using server-side pagination, filtering, and sorting
  // So we don't need to filter or sort the invoices client-side
  // We just use the data returned from the API directly
  const filteredInvoices = invoices;
  const sortedInvoices = invoices; // No client-side sorting needed
  const currentInvoices = invoices; // No client-side pagination needed

  // Log the number of invoices for debugging
  console.log('Number of invoices to display:', filteredInvoices.length);
  console.log('Current invoices to display:', currentInvoices.length);
  console.log('First few invoices:', currentInvoices.slice(0, 3));

  // Change page and fetch new data
  const paginate = (pageNumber) => {
    // Only fetch if the page number is different from the current page
    if (pageNumber !== currentPage) {
      console.log(`Changing page from ${currentPage} to ${pageNumber}`);
      setCurrentPage(pageNumber);
      // Fetch new data when page changes
      fetchInvoices();
    }
  };

  // State for date range filter
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Function to handle date filter submission
  const handleDateFilterSubmit = () => {
    setCurrentPage(1); // Reset to first page when applying date filter
    fetchInvoices();
  };

  // Helper function to convert product ID to product name
  const getProductName = (productId) => {
    if (!productId) return '';
    switch(productId) {
      case '932': return 'RDC';
      case '934': return 'Audit Advisory';
      case '935': return 'ERC';
      case '936': return 'Tax Amendment';
      case '937': return 'STC';
      case '938': return 'Partnership';
      default: return productId;
    }
  };

  // Helper function to convert billing profile ID to name
  const getBillingProfileName = (profileId) => {
    if (!profileId) return '';
    switch(profileId) {
      case '1': return 'Reporting Head';
      case '2': return 'Quickbooks Play';
      case '3': return 'Reporting Head Production';
      default: return profileId;
    }
  };

  // Function to export to PDF - uses sortedInvoices to respect current sorting
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const tableColumn = visibleColumns.map(colId => {
        const column = allColumns.find(col => col.id === colId);
        return column ? column.label : '';
      });

      // Title
      doc.setFontSize(18);
      doc.text('Finance Report', 14, 22);

      // Date Range
      doc.setFontSize(11);
      doc.text(`Date Range: ${dateFrom || 'All'} to ${dateTo || 'All'}`, 14, 30);

      // Status Filter
      doc.text(`Status: ${filterStatus || 'All'}`, 14, 36);

      // Sort information
      doc.text(`Sort: ${sortField} (${sortDirection === 'asc' ? 'Ascending' : 'Descending'})`, 14, 42);

      // Use sortedInvoices instead of currentInvoices to include all data in the export
      const tableRows = sortedInvoices.map(invoice => {
        return visibleColumns.map(colId => {
          const column = allColumns.find(col => col.id === colId);
          if (!column) return '';

          // Use the field mapping from the column definition
          const fieldName = column.field;

          // Special handling for specific columns
          if (colId === 'product') {
            return getProductName(invoice[fieldName] || '');
          } else if (colId === 'billingProfile') {
            return getBillingProfileName(invoice[fieldName] || '');
          } else if (colId === 'businessName') {
            return invoice.business_name || invoice.customer_name || '';
          } else {
            return invoice[fieldName] || '';
          }
        });
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 50, // Increased to account for the sort information line
        theme: 'grid',
        headStyles: {
          fillColor: [16, 134, 190],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 2,
          overflow: 'linebreak',
          halign: 'left'
        }
      });

      doc.save(`finance_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      Swal.fire({
        icon: 'error',
        title: 'PDF Generation Failed',
        text: `Error: ${error.message}`
      });
    }
  };

  // Function to export to Excel - uses sortedInvoices to respect current sorting
  const exportToExcel = () => {
    try {
      // Use sortedInvoices instead of currentInvoices to include all data in the export
      const worksheet = XLSX.utils.json_to_sheet(
        sortedInvoices.map(invoice => {
          const row = {};
          visibleColumns.forEach(colId => {
            const column = allColumns.find(col => col.id === colId);
            if (!column) return;

            // Use the field mapping from the column definition
            const fieldName = column.field;
            let value = '';

            // Special handling for specific columns
            if (colId === 'product') {
              value = getProductName(invoice[fieldName] || '');
            } else if (colId === 'billingProfile') {
              value = getBillingProfileName(invoice[fieldName] || '');
            } else if (colId === 'businessName') {
              value = invoice.business_name || invoice.customer_name || '';
            } else {
              value = invoice[fieldName] || '';
            }

            // Special handling for amount to ensure $ is displayed
            if (column.id === 'amount' && value && !value.startsWith('$')) {
              value = `$${value}`;
            }

            row[column.label] = value;
          });
          return row;
        })
      );

      // Add metadata about the export
      XLSX.utils.sheet_add_aoa(worksheet, [
        [`Finance Report - Generated: ${new Date().toLocaleDateString()}`],
        [`Date Range: ${dateFrom || 'All'} to ${dateTo || 'All'}`],
        [`Status: ${filterStatus || 'All'}`],
        [`Sort: ${sortField} (${sortDirection === 'asc' ? 'Ascending' : 'Descending'})`],
        [''] // Empty row before data
      ], { origin: 'A1' });

      // Adjust column widths
      const colWidths = visibleColumns.map(colId => {
        switch(colId) {
          case 'businessName': return { wch: 30 };
          case 'customerName': return { wch: 30 };
          case 'billingProfile': return { wch: 25 };
          case 'status': return { wch: 20 };
          case 'product': return { wch: 20 };
          default: return { wch: 15 };
        }
      });
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Finance Report');
      XLSX.writeFile(workbook, `finance_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('Excel generation error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Excel Generation Failed',
        text: `Error: ${error.message}`
      });
    }
  };

  // Function to handle action dropdown selection - simplified for WordPress list table style
  const handleAction = (invoice, action) => {
    switch(action) {
      case 'view':

        Swal.fire({
          title: `Invoice #${invoice.customer_invoice_no || invoice.id}`,
          html: `
            <div class="text-start">
              <table class="table table-bordered">
                <tr>
                  <th>Invoice #</th>
                  <td>${invoice.customer_invoice_no || invoice.invoice_no || invoice.id || ''}</td>
                </tr>
                <tr>
                  <th>Date</th>
                  <td>${invoice.date || ''}</td>
                </tr>
                <tr>
                  <th>Business Name</th>
                  <td>${invoice.business_name || invoice.customer_name || ''}</td>
                </tr>
                <tr>
                  <th>Customer Name</th>
                  <td>${invoice.customer_name || ''}</td>
                </tr>
                <tr>
                  <th>Amount</th>
                  <td>${invoice.amount || invoice.total_amount || ''}</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td>${invoice.status || ''}</td>
                </tr>
                <tr>
                  <th>Type</th>
                  <td>${invoice.type || ''}</td>
                </tr>
                <tr>
                  <th>Product</th>
                  <td>${getProductName(invoice.product || invoice.parent_product)}</td>
                </tr>
                <tr>
                  <th>Billing Profile</th>
                  <td>${getBillingProfileName(invoice.billing_profile)}</td>
                </tr>
                <tr>
                  <th>Due Date</th>
                  <td>${invoice.due_date || ''}</td>
                </tr>
                <tr>
                  <th>Days Due</th>
                  <td>${invoice.no_of_days_due || 'N/A'}</td>
                </tr>
                <tr>
                  <th>User</th>
                  <td>${invoice.user || ''}</td>
                </tr>
              </table>
            </div>
          `,
          width: 600,
          confirmButtonText: 'Close'
        });
        break;
      default:
        break;
    }
  };

  // Log before rendering
  console.log('About to render ManageFinanceReport component');
  console.log('Current state:', {
    invoices: invoices.length,
    loading,
    error,
    currentPage,
    sortField,
    sortDirection,
    filteredInvoices: filteredInvoices.length,
    sortedInvoices: sortedInvoices.length,
    currentInvoices: currentInvoices.length
  });

  // Render function
  return (
    <div className="main_content_iner">
      <div className="container-fluid p-0">
        <div className="row justify-content-center">
          <div className="col-lg-12">
            <div className="white_card card_height_100 mb_30">
              <div className="white_card_header">
                <div className="box_header m-0 new_report_header">
                  <div className="title_img">
                    <img src={getAssetPath('assets/images/Knowledge_Ceter_White.svg')} className="page-title-img" alt="" />
                    <h4 className="text-white">Finance Report</h4>
                  </div>
                </div>
              </div>
              <div className="white_card_body">
                {/* Date Filter */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="me-2">Date From:</div>
                      <input
                        type="date"
                        className="form-control form-control-sm me-3"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                      />
                      <div className="me-2">Date To:</div>
                      <input
                        type="date"
                        className="form-control form-control-sm me-3"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleDateFilterSubmit}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex justify-content-end">
                      <div className="input-group input-group-sm" style={{ maxWidth: '250px' }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search invoices..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              setCurrentPage(1); // Reset to first page when searching
                              fetchInvoices();
                            }
                          }}
                        />
                        <button
                          className="btn btn-primary search-btn"
                          onClick={() => {
                            setCurrentPage(1); // Reset to first page when searching
                            fetchInvoices();
                          }}
                          title="Search"
                        >
                          <i className="fas fa-search"></i>
                        </button>
                        {searchTerm && (
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => {
                              setSearchTerm('');
                              setCurrentPage(1);
                              setTimeout(() => fetchInvoices(), 0);
                            }}
                            title="Clear search"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Tabs */}
                <div className="row mb-3">
                  <div className="col-md-8">
                    <ul className="nav nav-tabs">
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                          onClick={() => {
                            setActiveTab('all');
                            setFilterStatus('');
                            setCurrentPage(1); // Reset to first page when changing tab
                            fetchInvoices();
                          }}
                        >
                          All
                        </button>
                      </li>
                      {/* Dynamically generate status tabs from filterOptions */}
                      {filterOptions.statuses && filterOptions.statuses.slice(0, 5).map((status, index) => {
                        const tabId = status.toLowerCase().replace(/\s+/g, '_');
                        return (
                          <li className="nav-item" key={index}>
                            <button
                              className={`nav-link ${activeTab === tabId ? 'active' : ''}`}
                              onClick={() => {
                                setActiveTab(tabId);
                                setFilterStatus(status);
                                setCurrentPage(1); // Reset to first page when changing tab
                                fetchInvoices();
                              }}
                            >
                              {status}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex justify-content-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => {
                          // Keep current page and other filters, just refresh the data
                          fetchInvoices();
                        }}
                        disabled={loading}
                        title="Refresh Data"
                      >
                        <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                      </button>
                      <div className="dropdown me-2">
                        <button
                          className="column-selector-btn"
                          type="button"
                          id="columnSelectorDropdown"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i className="fas fa-columns"></i> Columns
                        </button>
                        <div className="dropdown-menu dropdown-menu-end column-selector" aria-labelledby="columnSelectorDropdown">
                          <div className="column-selector-header">
                            <span>Table Columns</span>
                            <i className="fas fa-table"></i>
                          </div>
                          <div className="column-selector-actions">
                            <button className="btn btn-sm btn-link" onClick={selectAllColumns}>Select All</button>
                            <button className="btn btn-sm btn-link" onClick={resetToDefaultColumns}>Reset</button>
                          </div>
                          <div className="column-selector-divider"></div>
                          <div className="column-selector-body">
                            {columnGroups.map(group => (
                              <div key={group.id} className="column-group">
                                <div className="column-group-title">{group.title}</div>
                                {group.columns.map(column => (
                                  <div key={column.id} className="column-item">
                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`column-${column.id}`}
                                        checked={visibleColumns.includes(column.id)}
                                        onChange={() => toggleColumnVisibility(column.id)}
                                      />
                                      <label className="form-check-label" htmlFor={`column-${column.id}`}>
                                        {column.label}
                                      </label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn btn-sm export-btn me-2"
                        onClick={exportToPDF}
                      >
                        <i className="fas fa-file-pdf"></i> PDF
                      </button>
                      <button
                        className="btn btn-sm export-btn"
                        onClick={exportToExcel}
                      >
                        <i className="fas fa-file-excel"></i> Excel
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info Banner */}
                <div className="info-banner mb-3">
                  <i className="fas fa-info-circle"></i>
                  <span>Invoices created within the selected date range.</span>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading invoices...</p>
                  </div>
                ) : (
                  <>
                    {/* Invoice table */}
                    <div className="table-responsive">
                      <table className="table table-bordered table-hover finance-table">
                        <thead>
                          <tr>
                            {allColumns.map(column => {
                              if (visibleColumns.includes(column.id)) {
                                return column.sortable ? (
                                  <SortableTableHeader
                                    key={column.id}
                                    label={column.label}
                                    field={column.field}
                                    currentSortField={sortField}
                                    currentSortDirection={sortDirection}
                                    onSort={handleSort}
                                  />
                                ) : (
                                  <th key={column.id}>{column.label}</th>
                                );
                              }
                              return null;
                            })}
                          </tr>
                        </thead>
                        <tbody>

                          {currentInvoices.length > 0 ? (
                            currentInvoices.map((invoice, index) => (
                              <tr key={invoice.id || invoice.customer_invoice_no || index}>
                                {visibleColumns.includes('date') && (
                                  <td>{invoice.date || ''}</td>
                                )}
                                {visibleColumns.includes('invoiceNumber') && (
                                  <td>{invoice.customer_invoice_no || invoice.invoice_no || ''}</td>
                                )}
                                {visibleColumns.includes('billingProfile') && (
                                  <td>
                                    {getBillingProfileName(invoice.billing_profile)}
                                  </td>
                                )}
                                {visibleColumns.includes('amount') && (
                                  <td>{invoice.amount || invoice.total_amount || ''}</td>
                                )}
                                {visibleColumns.includes('businessName') && (
                                  <td>
                                    {invoice.lead_id && invoice.business_name ? (
                                      <Link to={`/lead-detail/${invoice.lead_id}`}>
                                        {invoice.business_name}
                                      </Link>
                                    ) : (
                                      invoice.business_name || invoice.customer_name || ''
                                    )}
                                  </td>
                                )}
                                {visibleColumns.includes('customerName') && (
                                  <td>{invoice.customer_name || ''}</td>
                                )}
                                {visibleColumns.includes('user') && (
                                  <td>{invoice.user || ''}</td>
                                )}
                                {visibleColumns.includes('status') && (
                                  <td>
                                    <span className={`status-badge ${invoice.status?.toLowerCase().replace(/\s+/g, '') || ''}`}>
                                      {invoice.status || ''}
                                    </span>
                                    {invoice.status_note && (
                                      <div className="small text-muted">
                                        {invoice.status_note}
                                      </div>
                                    )}
                                  </td>
                                )}
                                {visibleColumns.includes('type') && (
                                  <td>{invoice.type || ''}</td>
                                )}
                                {visibleColumns.includes('product') && (
                                  <td>
                                    {getProductName(invoice.product || invoice.parent_product)}
                                  </td>
                                )}
                                {visibleColumns.includes('dueDate') && (
                                  <td>{invoice.due_date || ''}</td>
                                )}
                                {visibleColumns.includes('daysDue') && (
                                  <td>{invoice.no_of_days_due || ''}</td>
                                )}

                                {visibleColumns.includes('action') && (
                                  <td>
                                    <div className="dropdown">
                                      <button
                                        className="btn btn-sm btn-outline-primary dropdown-toggle"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                      >
                                        Action <i className="fas fa-chevron-down ms-1"></i>
                                      </button>
                                      <ul className="dropdown-menu">
                                        <li>
                                          <button
                                            className="dropdown-item"
                                            onClick={() => handleAction(invoice, 'view')}
                                          >
                                            <i className="fas fa-eye me-2"></i> View
                                          </button>
                                        </li>
                                      </ul>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={visibleColumns.length} className="text-center py-5">
                                <div className="d-flex flex-column align-items-center">
                                  <i className="fas fa-search fa-3x text-muted mb-3"></i>
                                  <h5 className="text-muted">No invoices found</h5>
                                  <p className="text-muted mb-3">
                                    {searchTerm || filterStatus || dateFrom || dateTo ?
                                      'Try adjusting your search or filter criteria' :
                                      'No invoice data is available from the API'}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div>
                        {totalItems > 0 ? (
                          <>
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} invoices
                          </>
                        ) : (
                          <>No invoices found</>
                        )}
                      </div>
                      {totalPages > 0 && (
                        <nav>
                          <ul className="pagination pagination-sm">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={() => paginate(1)}>First</button>
                            </li>
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={() => paginate(currentPage - 1)}>Previous</button>
                            </li>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              // Show 5 pages around current page
                              let pageNum;
                              if (totalPages <= 5) {
                                // If total pages <= 5, show all pages
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                // If current page is near the start
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                // If current page is near the end
                                pageNum = totalPages - 4 + i;
                              } else {
                                // Show 2 pages before and after current page
                                pageNum = currentPage - 2 + i;
                              }

                              return (
                                <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                  <button className="page-link" onClick={() => paginate(pageNum)}>
                                    {pageNum}
                                  </button>
                                </li>
                              );
                            })}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={() => paginate(currentPage + 1)}>Next</button>
                            </li>
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={() => paginate(totalPages)}>Last</button>
                            </li>
                          </ul>
                        </nav>
                      )}
                    </div>

                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageFinanceReport;
