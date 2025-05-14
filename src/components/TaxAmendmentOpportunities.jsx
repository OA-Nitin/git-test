import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './common/CommonStyles.css';
import './ColumnSelector.css';
import './DateFilter.css';
import './LeadLinkStyles.css';
import SortableTableHeader from './common/SortableTableHeader';
import { sortArrayByKey } from '../utils/sortUtils';
import { getAssetPath } from '../utils/assetUtils';

const TaxAmendmentOpportunities = () => {
  // State for API data
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Tax Amendment Opportunities - Occams Portal";

    // Fetch opportunities from API
    fetchOpportunities();
  }, []);

  // Function to safely format a date
  const formatDate = (dateString) => {
    if (!dateString || dateString === '0000-00-00' || dateString === '0000-00-00 00:00:00') {
      return 'None';
    }

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'None';
      }

      return date.toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'});
    } catch (error) {
      console.error(`Error formatting date ${dateString}:`, error);
      return 'None';
    }
  };

  // Function to process API response data into our format
  const processOpportunityData = (data) => {
    if (!data) return [];

    return data.map(opp => ({
      id: opp.OpportunityID || '',
      opportunity_name: opp.OpportunityName || '',
      product: opp.productName || '',
      product_id: opp.product_ID || '',
      probability: opp.Probability ? `${Math.round(parseFloat(opp.Probability) * 100)}%` : '0%',
      stage: opp.milestoneName || opp.Stage || '',
      stage_status: opp.milestoneStatus || '',
      amount: opp.currencyName && opp.OpportunityAmount ?
        `${opp.currencyName}${parseFloat(opp.OpportunityAmount).toLocaleString()}` :
        opp.OpportunityAmount || '',
      created_date: formatDate(opp.CreatedAt),
      close_date: formatDate(opp.ExpectedCloseDate),
      last_activity: formatDate(opp.ModifiedAt),
      notes: opp.Description || '',
      lead_source: opp.AffiliateName || opp.LeadSource || opp.LeadGroup || '',
      business_name: opp.AccountName || opp.business_name || '',
      business_email: opp.business_email || '',
      raw_data: opp
    }));
  };

  // State to track retry attempts
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Function to fetch opportunities from API with retry logic
  const fetchOpportunities = async (limit = 100, retryAttempt = 0) => {
    if (retryAttempt === 0) {
      setLoading(true);
      setError(null);
    }

    try {
      console.log(`Fetching Tax Amendment opportunities from API (attempt ${retryAttempt + 1} of ${maxRetries + 1})...`);

      // Use the direct API endpoint with product_id filter for Tax Amendment (936)
      const apiEndpoint = 'https://play.occamsadvisory.com/portal/wp-json/productsplugin/v1/opportunities?product_id=936';

      console.log(`Requesting Tax Amendment opportunities from API endpoint: ${apiEndpoint}`);

      // Create a controller for aborting the request if needed
      const controller = new AbortController();

      // Set a timeout to abort the request - increase timeout with each retry
      const timeout = 10000 + (retryAttempt * 5000); // 10s, 15s, 20s, 25s
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log(`Request timed out after ${timeout/1000} seconds`);
      }, timeout);

      // Make the API request with abort controller
      // Add timestamp to prevent caching without using headers that might cause CORS issues
      const timestamp = new Date().getTime();
      const response = await axios.get(apiEndpoint, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        params: {
          _t: timestamp // Add timestamp to bust cache
        },
        signal: controller.signal,
        // Increase timeout with each retry
        timeout: timeout
      });

      // Clear the timeout since request completed successfully
      clearTimeout(timeoutId);

      // Process the response data
      let apiOpportunities = [];

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          console.log('Response.data is an array with', response.data.length, 'items');
          apiOpportunities = processOpportunityData(response.data);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          console.log('Response.data.data is an array with', response.data.data.length, 'items');
          apiOpportunities = processOpportunityData(response.data.data);
        }
      }

      console.log('Processed API Opportunities:', apiOpportunities.length);

      if (apiOpportunities.length > 0) {
        setOpportunities(apiOpportunities);
        setError(null);
        setRetryCount(0); // Reset retry count on success
        setAllRecordsLoaded(true);
      } else {
        console.log('No Tax Amendment opportunities found in API response');
        setOpportunities([]);
        setError('No Tax Amendment opportunities found in API response. Please try again later.');
      }

      return true; // Success
    } catch (err) {
      console.error(`Error fetching Tax Amendment opportunities (attempt ${retryAttempt + 1}):`, err);

      // If we haven't reached max retries, try again with exponential backoff
      if (retryAttempt < maxRetries) {
        const nextRetryDelay = 1000 * Math.pow(2, retryAttempt); // 1s, 2s, 4s
        console.log(`Retrying in ${nextRetryDelay/1000} seconds...`);

        // Show retry message to user
        setError(`API request failed. Retrying (${retryAttempt + 1}/${maxRetries})...`);

        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, nextRetryDelay));
        return fetchOpportunities(limit, retryAttempt + 1);
      }

      // Max retries reached, show error
      setRetryCount(retryCount + 1);

      // Check if it's an abort error (timeout)
      if (err.name === 'AbortError' || err.code === 'ECONNABORTED' || err.name === 'CanceledError') {
        setError('Request timed out. The API is taking too long to respond. Please try again later.');
      } else if (err.message.includes('Network Error') || err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your internet connection and try again.');
      } else if (err.response && err.response.status === 403) {
        setError('Access denied. You may not have permission to access this data.');
      } else if (err.response && err.response.status === 404) {
        setError('API endpoint not found. Please contact support.');
      } else {
        setError(`Failed to fetch Tax Amendment opportunities: ${err.message}. Please try again later.`);
      }

      // Set empty array instead of sample data
      setOpportunities([]);
      return false; // Failed
    } finally {
      if (retryAttempt === 0 || retryAttempt === maxRetries) {
        setLoading(false);
      }
    }
  };

  // State to track if all records are loaded
  const [allRecordsLoaded, setAllRecordsLoaded] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');

  // Define all available columns based on the image
  const columnGroups = [
    {
      id: 'basic',
      title: 'Basic Information',
      columns: [
        { id: 'id', label: 'ID', field: 'id', sortable: true },
        { id: 'opportunityName', label: 'Opportunity Name', field: 'opportunity_name', sortable: true },
        { id: 'businessName', label: 'Business Name', field: 'business_name', sortable: true },
        { id: 'product', label: 'Product', field: 'product', sortable: true },
        { id: 'probability', label: 'Probability', field: 'probability', sortable: true },
        { id: 'stage', label: 'Stage', field: 'stage_status', sortable: true },
        { id: 'amount', label: 'Amount', field: 'amount', sortable: true },
        { id: 'createdDate', label: 'Created Date', field: 'created_date', sortable: true },
        { id: 'closeDate', label: 'Close Date', field: 'close_date', sortable: true },
        { id: 'lastActivity', label: 'Last Activity', field: 'last_activity', sortable: true },
        { id: 'notes', label: 'Notes', field: 'notes', sortable: false },
        { id: 'leadSource', label: 'Lead Source', field: 'lead_source', sortable: true },
        { id: 'action', label: 'Action', field: 'action', sortable: false }
      ]
    }
  ];

  // Flatten all columns for easier access
  const allColumns = columnGroups.flatMap(group => group.columns);

  // Default visible columns - based on the image
  const defaultVisibleColumns = ['id', 'opportunityName', 'businessName', 'product', 'probability', 'stage', 'amount', 'createdDate', 'closeDate', 'lastActivity', 'notes', 'leadSource', 'action'];

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

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // If already sorting by this field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If sorting by a new field, set it and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  // Filter opportunities based on search term and status
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opportunity => {
      // Skip filtering if no search term or status filter is applied
      if (searchTerm === '' && filterStatus === '') {
        return true;
      }

      // Handle different possible field names in the API response
      const id = String(opportunity.id || opportunity.opportunity_id || '').toLowerCase();
      const name = String(opportunity.opportunity_name || opportunity.name || '').toLowerCase();
      const businessName = String(opportunity.business_name || opportunity.AccountName || '').toLowerCase();
      const product = String(opportunity.product || '').toLowerCase();
      const probability = String(opportunity.probability || '').toLowerCase();
      const stage = String(opportunity.stage || '').toLowerCase();
      const stageStatus = String(opportunity.stage_status || '').toLowerCase();
      const amount = String(opportunity.amount || '').toLowerCase();
      const createdDate = String(opportunity.created_date || '').toLowerCase();
      const closeDate = String(opportunity.close_date || '').toLowerCase();
      const lastActivity = String(opportunity.last_activity || '').toLowerCase();
      const notes = String(opportunity.notes || '').toLowerCase();
      const leadSource = String(opportunity.lead_source || '').toLowerCase();

      // Check if search term matches any field
      const searchTermLower = searchTerm.toLowerCase().trim();

      // If search term contains multiple words, check if all words are present in any field
      const searchWords = searchTermLower.split(/\s+/).filter(word => word.length > 0);

      const matchesSearch = searchTerm === '' || (searchWords.length > 0 && searchWords.every(word =>
        id.includes(word) ||
        name.includes(word) ||
        businessName.includes(word) ||
        product.includes(word) ||
        probability.includes(word) ||
        stage.includes(word) ||
        stageStatus.includes(word) ||
        amount.includes(word) ||
        createdDate.includes(word) ||
        closeDate.includes(word) ||
        lastActivity.includes(word) ||
        notes.includes(word) ||
        leadSource.includes(word)
      ));

      // Check if status matches - look for the status in stage_status field
      const matchesStatus = filterStatus === '' || stageStatus.includes(filterStatus);

      // Return true if both conditions are met
      return matchesSearch && matchesStatus;
    });
  }, [opportunities, searchTerm, filterStatus]);

  // Sort the filtered opportunities
  const sortedOpportunities = sortArrayByKey(filteredOpportunities, sortField, sortDirection);

  // Get current opportunities for pagination
  const indexOfLastOpportunity = currentPage * itemsPerPage;
  const indexOfFirstOpportunity = indexOfLastOpportunity - itemsPerPage;
  const currentOpportunities = sortedOpportunities.slice(indexOfFirstOpportunity, indexOfLastOpportunity);

  // Calculate total pages
  const totalPages = Math.ceil(sortedOpportunities.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Go to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Go to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";

    // Add headers
    const headers = allColumns
      .filter(column => visibleColumns.includes(column.id) && column.id !== 'action' && column.id !== 'notes')
      .map(column => column.label);
    csvContent += headers.join(",") + "\r\n";

    // Add rows
    sortedOpportunities.forEach(opportunity => {
      const row = allColumns
        .filter(column => visibleColumns.includes(column.id) && column.id !== 'action' && column.id !== 'notes')
        .map(column => {
          // Get cell value based on column ID
          let cellValue = '';
          if (column.id === 'id') return opportunity.id || '';
          if (column.id === 'opportunityName') return opportunity.opportunity_name || '';
          if (column.id === 'businessName') return opportunity.business_name || '';
          if (column.id === 'product') return opportunity.product || '';
          if (column.id === 'probability') return opportunity.probability || '';
          if (column.id === 'stage') return opportunity.stage_status || '';
          if (column.id === 'amount') return opportunity.amount || '';
          if (column.id === 'createdDate') return opportunity.created_date || '';
          if (column.id === 'closeDate') return opportunity.close_date || '';
          if (column.id === 'lastActivity') return opportunity.last_activity || '';
          if (column.id === 'leadSource') return opportunity.lead_source || '';

          // Escape quotes and wrap in quotes if contains comma
          cellValue = String(cellValue).replace(/"/g, '""');
          if (cellValue.includes(',')) {
            cellValue = `"${cellValue}"`;
          }
          return cellValue;
        });
      csvContent += row.join(",") + "\r\n";
    });

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tax_amendment_opportunities.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to Excel
  const exportToExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create worksheet data
    const wsData = [
      // Headers
      allColumns
        .filter(column => visibleColumns.includes(column.id) && column.id !== 'action' && column.id !== 'notes')
        .map(column => column.label)
    ];

    // Add rows
    sortedOpportunities.forEach(opportunity => {
      const row = [];
      allColumns
        .filter(column => visibleColumns.includes(column.id) && column.id !== 'action' && column.id !== 'notes')
        .forEach(column => {
          // Get cell value based on column ID
          if (column.id === 'id') row.push(opportunity.id || '');
          else if (column.id === 'opportunityName') row.push(opportunity.opportunity_name || '');
          else if (column.id === 'businessName') row.push(opportunity.business_name || '');
          else if (column.id === 'product') row.push(opportunity.product || '');
          else if (column.id === 'probability') row.push(opportunity.probability || '');
          else if (column.id === 'stage') row.push(opportunity.stage_status || '');
          else if (column.id === 'amount') row.push(opportunity.amount || '');
          else if (column.id === 'createdDate') row.push(opportunity.created_date || '');
          else if (column.id === 'closeDate') row.push(opportunity.close_date || '');
          else if (column.id === 'lastActivity') row.push(opportunity.last_activity || '');
          else if (column.id === 'leadSource') row.push(opportunity.lead_source || '');
          else row.push('');
        });
      wsData.push(row);
    });

    // Create worksheet and add to workbook
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Tax Amendment Opportunities");

    // Save workbook
    XLSX.writeFile(wb, "tax_amendment_opportunities.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    // Create new PDF document
    const doc = new jsPDF('landscape');

    // Set title
    doc.setFontSize(18);
    doc.text("Tax Amendment Opportunities Report", 14, 22);

    // Add date
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

    // Create table data
    const tableColumn = allColumns
      .filter(column => visibleColumns.includes(column.id) && column.id !== 'action' && column.id !== 'notes')
      .map(column => column.label);

    const tableRows = [];

    sortedOpportunities.forEach(opportunity => {
      const rowData = [];
      allColumns
        .filter(column => visibleColumns.includes(column.id) && column.id !== 'action' && column.id !== 'notes')
        .forEach(column => {
          // Get cell value based on column ID
          if (column.id === 'id') rowData.push(opportunity.id || '');
          else if (column.id === 'opportunityName') rowData.push(opportunity.opportunity_name || '');
          else if (column.id === 'businessName') rowData.push(opportunity.business_name || '');
          else if (column.id === 'product') rowData.push(opportunity.product || '');
          else if (column.id === 'probability') rowData.push(opportunity.probability || '');
          else if (column.id === 'stage') rowData.push(opportunity.stage_status || '');
          else if (column.id === 'amount') rowData.push(opportunity.amount || '');
          else if (column.id === 'createdDate') rowData.push(opportunity.created_date || '');
          else if (column.id === 'closeDate') rowData.push(opportunity.close_date || '');
          else if (column.id === 'lastActivity') rowData.push(opportunity.last_activity || '');
          else if (column.id === 'leadSource') rowData.push(opportunity.lead_source || '');
          else rowData.push('');
        });
      tableRows.push(rowData);
    });

    // Add table to document
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 20 }, // ID column
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      margin: { top: 40 }
    });

    // Save document
    doc.save("tax_amendment_opportunities.pdf");
  };

  // Handle view notes
  const handleViewNotes = (opportunity) => {
    const opportunityId = opportunity.id || '';
    const status = opportunity.stage_status || '';

    // Show loading state
    Swal.fire({
      title: `<span style="font-size: 1.2rem; color: #333;">Notes</span>`,
      html: `
        <div class="text-center py-4">
          <div class="spinner-border text-primary mb-3" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-muted">Loading notes...</p>
        </div>
      `,
      width: '650px',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'swal-popup-custom',
        title: 'swal-title-custom',
        closeButton: 'swal-close-button-custom',
        content: 'swal-content-custom'
      }
    });

    // Fetch notes from the API
    axios.get(`https://play.occamsadvisory.com/portal/wp-json/portalapi/v1/opportunity-notes/${opportunityId}`)
      .then(response => {
        console.log('Opportunity Notes API Response:', response);

        // Handle different possible response formats
        let notes = [];
        if (Array.isArray(response.data)) {
          notes = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // If response.data is an object with a data property that is an array
          if (Array.isArray(response.data.data)) {
            notes = response.data.data;
          } else {
            // If it's a single note object, wrap it in an array
            notes = [response.data];
          }
        }

        let notesHtml = '';
        if (!notes || notes.length === 0) {
          notesHtml = `
            <div class="text-center py-4">
              <div class="mb-3">
                <i class="fas fa-sticky-note fa-3x text-muted"></i>
              </div>
              <p class="text-muted">No notes available for this opportunity</p>
            </div>
          `;
        } else {
          notesHtml = `
            <div class="notes-list">
              ${notes.map(note => {
                // Parse the original date from the note (adjust field name based on API response)
                const originalDate = new Date(note.created_at || note.date || new Date());

                // Format the date as "Month Day, Year" (e.g., "May 6, 2025")
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                const formattedDate = originalDate.toLocaleDateString('en-US', options);

                // Format time in 12-hour format with AM/PM
                let hour12 = originalDate.getHours() % 12;
                if (hour12 === 0) hour12 = 12; // Convert 0 to 12 for 12 AM
                const ampm = originalDate.getHours() >= 12 ? 'PM' : 'AM';
                const formattedTime = `${hour12}:${String(originalDate.getMinutes()).padStart(2, '0')} ${ampm}`;

                // Get the note content (adjust field name based on API response)
                const noteContent = note.note || note.content || note.text || '';

                // Get the user who created the note (if available)
                const userName = note.user_name || note.username || note.author || 'System';

                return `
                  <div class="note-item mb-3 p-3 border rounded" style="background-color: #f8f9fa; border-color: #e9ecef;">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <div style="color: #000; font-weight: 600; font-size: 14px;">${formattedDate}</div>
                      <div style="color: #000; font-weight: 600; font-size: 14px;">${formattedTime}</div>
                    </div>
                    <p class="mb-0" style="white-space: pre-line; color: #333; line-height: 1.5; font-size: 14px;">${noteContent}</p>
                    <div class="mt-2 text-end">
                      <small class="text-muted">Added by: ${userName}</small>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }

        // Update the modal with the fetched notes
        Swal.fire({
          title: `<span style="font-size: 1.2rem; color: #333;">Notes</span>`,
          html: `
            <div class="text-start">
              <div class="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                <div>
                  <span class="text-black">Opportunity ID: <span class="text-dark">${opportunityId}</span></span>
                </div>
                <div>
                  <span class="badge ${
                    status.toLowerCase().includes('cancelled') ? 'bg-danger' :
                    status.toLowerCase().includes('completed') || status.toLowerCase().includes('won') ? 'bg-success' :
                    status.toLowerCase().includes('in progress') ? 'bg-primary' :
                    status.toLowerCase().includes('pending') ? 'bg-warning' :
                    'bg-secondary'
                  }">${status || 'Unknown'}</span>
                </div>
              </div>
              <div class="notes-container" style="max-height: 450px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; background-color: white; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                ${notesHtml}
              </div>
            </div>
          `,
          width: '650px',
          showCloseButton: false,
          showConfirmButton: true,
          confirmButtonText: 'Close',
          confirmButtonColor: '#0d6efd',
          customClass: {
            container: 'swal-wide',
            popup: 'swal-popup-custom',
            header: 'swal-header-custom',
            title: 'swal-title-custom',
            closeButton: 'swal-close-button-custom',
            content: 'swal-content-custom',
            footer: 'swal-footer-custom'
          }
        });

        // Add custom CSS for the SweetAlert modal
        const style = document.createElement('style');
        style.innerHTML = `
          .swal-popup-custom {
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          .swal-title-custom {
            font-size: 1.5rem;
            color: #333;
            font-weight: 600;
          }
          .swal-header-custom {
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          .swal-content-custom {
            padding: 15px;
          }
          .swal-footer-custom {
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
          .note-item {
            transition: all 0.2s ease;
          }
          .note-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
        `;
        document.head.appendChild(style);
      })
      .catch(error => {
        console.error('Error fetching notes:', error);

        // Show error message
        Swal.fire({
          title: `<span style="font-size: 1.2rem; color: #333;">Error</span>`,
          html: `
            <div class="text-center py-3">
              <div class="mb-3">
                <i class="fas fa-exclamation-circle fa-3x text-danger"></i>
              </div>
              <p class="text-muted">There was a problem loading notes for this opportunity.</p>
              <div class="alert alert-danger py-2 mt-2">
                <small>${error.response ? `Error: ${error.response.status} - ${error.response.statusText}` : 'Network error. Please check your connection.'}</small>
              </div>
              <p class="text-muted mt-2">Opportunity ID: ${opportunityId}</p>
            </div>
          `,
          confirmButtonText: 'OK',
          customClass: {
            popup: 'swal-popup-custom',
            title: 'swal-title-custom'
          }
        });
      });
  };

  // Handle add note
  const handleAddNote = (opportunity) => {
    const opportunityId = opportunity.id || '';

    Swal.fire({
      title: `<span style="font-size: 1.2rem; color: #333;">Add Note</span>`,
      html: `
        <div class="text-start">
          <div class="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
            <div>
              <span class="text-black">Opportunity ID: <span class="text-dark">${opportunityId}</span></span>
            </div>
          </div>
          <div class="mb-3">
            <textarea
              class="form-control"
              id="note-content"
              rows="5"
              placeholder="Enter your note here..."
              style="resize: vertical; min-height: 100px;"
            ></textarea>
          </div>
          <div class="text-muted small">
            <i class="fas fa-info-circle me-1"></i>
            Your note will be saved with the current date and time.
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save Note',
      cancelButtonText: 'Cancel',
      width: '650px',
      customClass: {
        container: 'swal-wide',
        popup: 'swal-popup-custom',
        header: 'swal-header-custom',
        title: 'swal-title-custom',
        closeButton: 'swal-close-button-custom',
        content: 'swal-content-custom',
        confirmButton: 'swal-confirm-button-custom',
        cancelButton: 'swal-cancel-button-custom'
      },
      preConfirm: () => {
        // Get the note content from the textarea
        const content = document.getElementById('note-content').value;

        // Validate the content
        if (!content || content.trim() === '') {
          Swal.showValidationMessage('Please enter a note');
          return false;
        }

        return {
          content: content
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Show loading state
        Swal.fire({
          title: `<span style="font-size: 1.2rem; color: #333;">Saving Note</span>`,
          html: `
            <div class="text-center py-3">
              <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="text-muted">Saving your note...</p>
            </div>
          `,
          showConfirmButton: false,
          allowOutsideClick: false,
          customClass: {
            popup: 'swal-popup-custom',
            title: 'swal-title-custom'
          }
        });

        // Prepare the data for the API
        const noteData = {
          project_id: opportunityId,
          note: result.value.content,
          user_id: 1  // This should ideally come from a user context
        };

        // Send the data to the API
        axios.post('https://play.occamsadvisory.com/portal/wp-json/portalapi/v1/opportunity-notes', noteData)
          .then(() => {
            // Show success message
            Swal.fire({
              title: `<span style="font-size: 1.2rem; color: #333;">Success</span>`,
              html: `
                <div class="text-center py-3">
                  <div class="mb-3">
                    <i class="fas fa-check-circle fa-3x text-success"></i>
                  </div>
                  <p class="text-muted">Your note has been saved successfully.</p>
                </div>
              `,
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: 'swal-popup-custom',
                title: 'swal-title-custom'
              }
            });

            // Refresh the data after a short delay
            setTimeout(() => {
              fetchOpportunities();
            }, 2100);
          })
          .catch((error) => {
            console.error('Error saving note:', error);

            // Show error message
            Swal.fire({
              title: `<span style="font-size: 1.2rem; color: #333;">Error</span>`,
              html: `
                <div class="text-center py-3">
                  <div class="mb-3">
                    <i class="fas fa-exclamation-circle fa-3x text-danger"></i>
                  </div>
                  <p class="text-muted">There was a problem saving your note.</p>
                  <div class="alert alert-danger py-2 mt-2">
                    <small>${error.response ? `Error: ${error.response.status} - ${error.response.statusText}` : 'Network error. Please check your connection.'}</small>
                  </div>
                </div>
              `,
              confirmButtonText: 'Try Again',
              customClass: {
                popup: 'swal-popup-custom',
                title: 'swal-title-custom'
              }
            }).then((result) => {
              if (result.isConfirmed) {
                // If user clicks "Try Again", reopen the add note dialog
                handleAddNote(opportunity);
              }
            });
          });
      }
    });
  };

  return (
    <div className="container-fluid px-4">
      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Tax Amendment Opportunities</h5>
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => {
                    // Clear any existing data and fetch fresh data
                    setOpportunities([]);
                    setCurrentPage(1);
                    fetchOpportunities();
                  }}
                  disabled={loading}
                  title="Refresh Data"
                >
                  <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                </button>
                <div className="dropdown me-2">
                  <button
                    className="btn btn-sm btn-outline-secondary dropdown-toggle"
                    type="button"
                    id="columnSelectorDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-columns me-1"></i> Columns
                  </button>
                  <div className="dropdown-menu column-selector p-2" aria-labelledby="columnSelectorDropdown">
                    <div className="d-flex justify-content-between mb-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={selectAllColumns}>Select All</button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={resetToDefaultColumns}>Reset</button>
                    </div>
                    <div className="column-options">
                      {columnGroups.map(group => (
                        <div key={group.id} className="column-group mb-2">
                          <h6 className="dropdown-header">{group.title}</h6>
                          {group.columns.map(column => (
                            <div key={column.id} className="form-check">
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
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="btn-group me-2">
                  <button
                    className="btn btn-sm export-btn"
                    onClick={exportToExcel}
                    disabled={loading || filteredOpportunities.length === 0}
                    title={filteredOpportunities.length === 0 ? "No data to export" : "Export to Excel"}
                  >
                    <i className="fas fa-file-excel me-1"></i> Excel
                  </button>
                  <button
                    className="btn btn-sm export-btn"
                    onClick={exportToPDF}
                    disabled={loading || filteredOpportunities.length === 0}
                    title={filteredOpportunities.length === 0 ? "No data to export" : "Export to PDF"}
                  >
                    <i className="fas fa-file-pdf me-1"></i> PDF
                  </button>
                  <button
                    className="btn btn-sm export-btn"
                    onClick={exportToCSV}
                    disabled={loading || filteredOpportunities.length === 0}
                    title={filteredOpportunities.length === 0 ? "No data to export" : "Export to CSV"}
                  >
                    <i className="fas fa-file-csv me-1"></i> CSV
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6 col-lg-3 mb-2">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (e.target.value === '') {
                          setCurrentPage(1); // Reset to first page when clearing search
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setCurrentPage(1); // Reset to first page when searching
                        }
                      }}
                    />
                    <button
                      className="btn btn-sm search-btn"
                      type="button"
                      onClick={() => {
                        // Trigger search and reset to first page
                        setCurrentPage(1);
                        // Force re-render by setting the search term again
                        setSearchTerm(searchTerm);
                      }}
                    >
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3 mb-2">
                  <select
                    className="form-select form-select-sm"
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1); // Reset to first page when filtering
                    }}
                  >
                    <option value="">All Statuses</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                    <option value="in progress">In Progress</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="col-md-6 col-lg-3 mb-2">
                  <select
                    className="form-select form-select-sm"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page when changing items per page
                    }}
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted">Loading Tax Amendment opportunities...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                  <button
                    className="btn btn-sm btn-outline-danger ms-3"
                    onClick={() => fetchOpportunities()}
                  >
                    <i className="fas fa-sync-alt me-1"></i> Retry
                  </button>
                </div>
              ) : filteredOpportunities.length === 0 ? (
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  No Tax Amendment opportunities found matching your criteria.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover table-bordered">
                    <thead>
                      <tr>
                        {allColumns.map(column => {
                          if (visibleColumns.includes(column.id)) {
                            return (
                              <SortableTableHeader
                                key={column.id}
                                id={column.id}
                                label={column.label}
                                sortable={column.sortable}
                                sortField={sortField}
                                sortDirection={sortDirection}
                                onSort={() => column.sortable && handleSort(column.field)}
                              />
                            );
                          }
                          return null;
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {currentOpportunities.map((opportunity, index) => (
                        <tr key={opportunity.id || index}>
                          {allColumns.map(column => {
                            if (!visibleColumns.includes(column.id)) {
                              return null;
                            }

                            switch (column.id) {
                              case 'id':
                                return <td key={column.id}>{opportunity.id}</td>;
                              case 'opportunityName':
                                return (
                                  <td key={column.id}>
                                    <Link to={`/opportunity-detail/${opportunity.id}`} className="lead-link">
                                      {opportunity.opportunity_name}
                                    </Link>
                                  </td>
                                );
                              case 'businessName':
                                return <td key={column.id}>{opportunity.business_name}</td>;
                              case 'product':
                                return <td key={column.id}>{opportunity.product}</td>;
                              case 'probability':
                                return <td key={column.id}>{opportunity.probability}</td>;
                              case 'stage':
                                return (
                                  <td key={column.id}>
                                    <span className={`badge ${
                                      opportunity.stage_status?.toLowerCase().includes('cancelled') ? 'bg-danger' :
                                      opportunity.stage_status?.toLowerCase().includes('completed') || opportunity.stage_status?.toLowerCase().includes('won') ? 'bg-success' :
                                      opportunity.stage_status?.toLowerCase().includes('in progress') ? 'bg-primary' :
                                      opportunity.stage_status?.toLowerCase().includes('pending') ? 'bg-warning' :
                                      'bg-secondary'
                                    }`}>
                                      {opportunity.stage_status}
                                    </span>
                                  </td>
                                );
                              case 'amount':
                                return <td key={column.id}>{opportunity.amount}</td>;
                              case 'createdDate':
                                return <td key={column.id}>{opportunity.created_date}</td>;
                              case 'closeDate':
                                return <td key={column.id}>{opportunity.close_date}</td>;
                              case 'lastActivity':
                                return <td key={column.id}>{opportunity.last_activity}</td>;
                              case 'notes':
                                return (
                                  <td key={column.id} className="text-center">
                                    <div className="d-flex justify-content-center gap-2">
                                      <button
                                        className="btn btn-sm btn-outline-info"
                                        onClick={() => handleViewNotes(opportunity)}
                                        title="View Notes"
                                      >
                                        <i className="fas fa-eye"></i>
                                      </button>
                                      <button
                                        className="btn btn-sm btn-outline-success"
                                        onClick={() => handleAddNote(opportunity)}
                                        title="Add Note"
                                      >
                                        <i className="fas fa-plus"></i>
                                      </button>
                                    </div>
                                  </td>
                                );
                              case 'leadSource':
                                return <td key={column.id}>{opportunity.lead_source}</td>;
                              case 'action':
                                return (
                                  <td key={column.id} className="text-center">
                                    <div className="dropdown">
                                      <button
                                        className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                      >
                                        <i className="fas fa-ellipsis-v"></i>
                                      </button>
                                      <ul className="dropdown-menu">
                                        <li>
                                          <Link
                                            className="dropdown-item"
                                            to={`/opportunity-detail/${opportunity.id}`}
                                          >
                                            <i className="fas fa-eye me-2"></i> View Details
                                          </Link>
                                        </li>
                                        <li>
                                          <button
                                            className="dropdown-item"
                                            onClick={() => handleViewNotes(opportunity)}
                                          >
                                            <i className="fas fa-sticky-note me-2"></i> View Notes
                                          </button>
                                        </li>
                                        <li>
                                          <button
                                            className="dropdown-item"
                                            onClick={() => handleAddNote(opportunity)}
                                          >
                                            <i className="fas fa-plus me-2"></i> Add Note
                                          </button>
                                        </li>
                                      </ul>
                                    </div>
                                  </td>
                                );
                              default:
                                return <td key={column.id}></td>;
                            }
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {!loading && !error && filteredOpportunities.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    Showing {indexOfFirstOpportunity + 1} to {Math.min(indexOfLastOpportunity, filteredOpportunities.length)} of {filteredOpportunities.length} entries
                  </div>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={goToPreviousPage}>
                          <i className="fas fa-chevron-left"></i>
                        </button>
                      </li>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show pages around current page
                        let pageNum;
                        if (totalPages <= 5) {
                          // If 5 or fewer pages, show all
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          // If near start, show first 5 pages
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          // If near end, show last 5 pages
                          pageNum = totalPages - 4 + i;
                        } else {
                          // Otherwise show current page and 2 pages on each side
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
                        <button className="page-link" onClick={goToNextPage}>
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxAmendmentOpportunities;
