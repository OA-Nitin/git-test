import React, { useState, useEffect } from 'react';
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

const ERCLeadReport = () => {
  // State for API data
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "ERC Lead Report - Occams Portal";

    // Fetch leads from API
    fetchLeads();
  }, []);

  // Function to fetch leads from API
  const fetchLeads = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching ERC leads from API...');

      // Make the API request with proper headers
      // Try without product_id filter first to get all leads
      const response = await axios.get('https://play.occamsadvisory.com/portal/wp-json/v1/leads', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('API Response:', response);

      // Check if we have a valid response with data
      if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
        // Use the data array from the API response
        let apiLeads = response.data.data;
        console.log('API Leads (before filtering):', apiLeads);

        // Filter leads for ERC
        apiLeads = apiLeads.filter(lead => {
          const category = (lead.category || '').toLowerCase();
          const productType = (lead.product_type || '').toLowerCase();
          const leadGroup = (lead.lead_group || '').toLowerCase();
          const productId = lead.product_id;

          return category.includes('erc') ||
                 productType.includes('erc') ||
                 leadGroup.includes('erc') ||
                 productId === '935' || productId === 935;
        });

        console.log('Filtered leads for ERC:', apiLeads);

        if (apiLeads.length > 0) {
          setLeads(apiLeads);
        } else {
          console.warn('No ERC leads found in API response, using fallback data');
          setLeads(generateFallbackLeads());
          setError('No ERC leads found in API response. Using sample data instead.');
        }
      } else {
        console.error('API response format unexpected:', response);
        // If API returns unexpected format, use fallback data
        setLeads(generateFallbackLeads());
        setError('API returned unexpected data format. Using sample ERC data instead.');
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(`Failed to fetch ERC leads: ${err.message}. Using sample data instead.`);
      setLeads(generateFallbackLeads());
    } finally {
      setLoading(false);
    }
  };

  // Generate fallback lead data if API fails
  const generateFallbackLeads = () => {
    const companies = [
      { name: 'Acme Corporation', domain: 'acmecorp.com' },
      { name: 'Globex Industries', domain: 'globex.com' },
      { name: 'Stark Enterprises', domain: 'starkent.com' },
      { name: 'Wayne Industries', domain: 'wayneindustries.com' },
      { name: 'Umbrella Corporation', domain: 'umbrellacorp.com' },
      { name: 'Oscorp Industries', domain: 'oscorp.com' },
      { name: 'Cyberdyne Systems', domain: 'cyberdyne.com' },
      { name: 'Initech', domain: 'initech.com' },
      { name: 'Massive Dynamic', domain: 'massivedynamic.com' },
      { name: 'Soylent Corp', domain: 'soylent.com' }
    ];

    const statuses = ['New', 'Contacted', 'Qualified', 'Active', 'Converted'];

    const dummyLeads = [];

    for (let i = 1; i <= 100; i++) {
      const companyIndex = Math.floor(Math.random() * companies.length);
      const company = companies[companyIndex];
      const statusIndex = Math.floor(Math.random() * statuses.length);

      dummyLeads.push({
        lead_id: `LD${String(i).padStart(3, '0')}`,
        business_legal_name: company.name,
        business_email: `info@${company.domain}`,
        business_phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        lead_status: statuses[statusIndex],
        created: new Date().toLocaleDateString(),
        employee_id: 'John Doe',
        internal_sales_agent: 'Sarah Smith',
        internal_sales_support: 'Mike Johnson',
        source: 'Website',
        campaign: 'Email Campaign',
        category: 'ERC',
        product_type: 'ERC',
        lead_group: 'ERC',
        w2_count: Math.floor(Math.random() * 10) + 1
      });
    }

    return dummyLeads;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [sortField, setSortField] = useState('lead_id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isSearching, setIsSearching] = useState(false);


  // Define all available columns with groups based on API data structure
  const columnGroups = [
    {
      id: 'basic',
      title: 'Basic Information',
      columns: [
        { id: 'leadId', label: 'Lead #', field: 'lead_id', sortable: true },
        { id: 'date', label: 'Date', field: 'created', sortable: false },
        { id: 'businessName', label: 'Business Name', field: 'business_legal_name', sortable: true },
        { id: 'taxNowStatus', label: 'Lead Status', field: 'lead_status', sortable: true }
      ]
    },
    {
      id: 'contacts',
      title: 'Contact Information',
      columns: [
        { id: 'businessEmail', label: 'Email', field: 'business_email', sortable: false },
        { id: 'businessPhone', label: 'Phone', field: 'business_phone', sortable: false },
        { id: 'contactCard', label: 'Contact Card', field: 'contactCard', sortable: false }
      ]
    },
    {
      id: 'team',
      title: 'Team Information',
      columns: [
        { id: 'employee', label: 'Employee', field: 'employee_id', sortable: false },
        { id: 'salesAgent', label: 'Sales Agent', field: 'internal_sales_agent', sortable: false },
        { id: 'salesSupport', label: 'Sales Support', field: 'internal_sales_support', sortable: false }
      ]
    },
    {
      id: 'additional',
      title: 'Additional Information',
      columns: [
        { id: 'affiliateSource', label: 'Source', field: 'source', sortable: false },
        { id: 'leadCampaign', label: 'Campaign', field: 'campaign', sortable: false },
        { id: 'category', label: 'Category', field: 'category', sortable: false },
        { id: 'leadGroup', label: 'Lead Group', field: 'lead_group', sortable: false },
        { id: 'notes', label: 'Notes', field: 'notes', sortable: false },
        { id: 'bookACall', label: 'Book A Call', field: 'bookACall', sortable: false }
      ]
    }
  ];

  // Flatten all columns for easier access
  const allColumns = columnGroups.flatMap(group => group.columns);

  // Default visible columns
  const defaultVisibleColumns = ['leadId', 'date', 'businessName', 'taxNowStatus', 'businessEmail', 'businessPhone', 'notes', 'bookACall'];

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



  // Filter leads based on search term and status
  const filteredLeads = leads.filter(lead => {
    // Skip filtering if no search term or status filter is applied
    if (searchTerm === '' && filterStatus === '') {
      return true;
    }

    // Handle different possible field names in the API response
    const id = String(lead.id || lead.lead_id || '').toLowerCase();
    const name = String(lead.name || lead.business_name || lead.business_legal_name || '').toLowerCase();
    const email = String(lead.email || lead.business_email || '').toLowerCase();
    const phone = String(lead.phone || lead.business_phone || '');
    const status = String(lead.status || lead.lead_status || '');
    const signatory = String(lead.authorized_signatory_name || '').toLowerCase();
    const campaign = String(lead.campaign || '').toLowerCase();
    const source = String(lead.source || '').toLowerCase();
    const category = String(lead.category || '').toLowerCase();
    const leadGroup = String(lead.lead_group || '').toLowerCase();
    const salesAgent = String(lead.internal_sales_agent || '').toLowerCase();
    const salesSupport = String(lead.internal_sales_support || '').toLowerCase();
    const employeeId = String(lead.employee_id || '').toLowerCase();

    // Check if search term matches any field
    const searchTermLower = searchTerm.toLowerCase().trim();

    const matchesSearch = searchTerm === '' ||
      id.includes(searchTermLower) ||
      name.includes(searchTermLower) ||
      email.includes(searchTermLower) ||
      phone.includes(searchTermLower) ||
      signatory.includes(searchTermLower) ||
      campaign.includes(searchTermLower) ||
      source.includes(searchTermLower) ||
      category.includes(searchTermLower) ||
      leadGroup.includes(searchTermLower) ||
      salesAgent.includes(searchTermLower) ||
      salesSupport.includes(searchTermLower) ||
      employeeId.includes(searchTermLower);

    // Check if status matches
    const matchesStatus = filterStatus === '' || status === filterStatus;

    // Return true if both conditions are met
    return matchesSearch && matchesStatus;
  });

  // Sort the filtered leads
  const sortedLeads = sortArrayByKey(filteredLeads, sortField, sortDirection);

  // Get current leads for pagination
  const indexOfLastLead = currentPage * itemsPerPage;
  const indexOfFirstLead = indexOfLastLead - itemsPerPage;
  const currentLeads = sortedLeads.slice(indexOfFirstLead, indexOfLastLead);

  // Calculate total pages
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);

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

  // Handle export to CSV
  const exportToCSV = () => {
    // Confirm export with user if there are many leads
    if (filteredLeads.length > 100) {
      if (!confirm(`You are about to export ${filteredLeads.length} leads. This may take a moment. Continue?`)) {
        return;
      }
    }

    // Get visible columns and their data, excluding action columns that shouldn't be exported
    const columnsToExclude = ['bookACall', 'contactCard', 'notes'];
    const visibleColumnsData = allColumns.filter(column =>
      visibleColumns.includes(column.id) && !columnsToExclude.includes(column.id)
    );

    // Create headers from visible columns
    const headers = visibleColumnsData.map(column => column.label);

    // Create CSV data rows
    const csvData = filteredLeads.map(lead => {
      return visibleColumnsData.map(column => {
        // Handle special columns with custom rendering
        if (column.id === 'leadId') return lead.lead_id || '';
        if (column.id === 'date') return lead.created || '';
        if (column.id === 'businessName') {
          const businessName = lead.business_legal_name || '';
          return `"${businessName.replace(/"/g, '""')}"`; // Escape quotes
        }
        if (column.id === 'taxNowStatus') return lead.lead_status || '';
        if (column.id === 'businessEmail') return lead.business_email || '';
        if (column.id === 'businessPhone') return lead.business_phone || '';
        if (column.id === 'employee') return lead.employee_id || '';
        if (column.id === 'salesAgent') return lead.internal_sales_agent || '';
        if (column.id === 'salesSupport') return lead.internal_sales_support || '';
        if (column.id === 'affiliateSource') return lead.source || '';
        if (column.id === 'leadCampaign') return lead.campaign || '';
        if (column.id === 'category') return lead.category || '';
        if (column.id === 'leadGroup') return lead.lead_group || '';

        // Default case
        return '';
      });
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `erc_lead_report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle export to PDF
  const exportToPDF = () => {
    try {
      // Confirm export with user if there are many leads
      if (filteredLeads.length > 100) {
        if (!confirm(`You are about to export ${filteredLeads.length} leads to PDF. This may take a moment and result in a large file. Continue?`)) {
          return;
        }
      }

      // Get visible columns and their data, excluding action columns that shouldn't be exported
      const columnsToExclude = ['bookACall', 'contactCard', 'notes'];
      const visibleColumnsData = allColumns.filter(column =>
        visibleColumns.includes(column.id) && !columnsToExclude.includes(column.id)
      );

      // Initialize jsPDF with landscape orientation
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add title
      doc.setFontSize(16);
      doc.text('ERC Lead Report', 15, 15);

      // Add generation date and filter info
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 22);

      let yPos = 27;

      if (filterStatus) {
        doc.text(`Filtered by status: ${filterStatus}`, 15, yPos);
        yPos += 5;
      }

      if (searchTerm) {
        doc.text(`Search term: "${searchTerm}"`, 15, yPos);
        yPos += 5;
      }

      // Create table data
      const tableColumn = visibleColumnsData.map(column => column.label);

      // Create table rows with data for visible columns
      const tableRows = filteredLeads.map(lead => {
        return visibleColumnsData.map(column => {
          // Handle special columns with custom rendering
          if (column.id === 'leadId') return lead.lead_id || '';
          if (column.id === 'date') return lead.created || '';
          if (column.id === 'businessName') return lead.business_legal_name || '';
          if (column.id === 'taxNowStatus') return lead.lead_status || '';
          if (column.id === 'businessEmail') return lead.business_email || '';
          if (column.id === 'businessPhone') return lead.business_phone || '';
          if (column.id === 'employee') return lead.employee_id || '';
          if (column.id === 'salesAgent') return lead.internal_sales_agent || '';
          if (column.id === 'salesSupport') return lead.internal_sales_support || '';
          if (column.id === 'affiliateSource') return lead.source || '';
          if (column.id === 'leadCampaign') return lead.campaign || '';
          if (column.id === 'category') return lead.category || '';
          if (column.id === 'leadGroup') return lead.lead_group || '';

          // Default case
          return '';
        });
      });

      // Calculate column widths based on number of columns
      const availableWidth = 270; // Approximate available width in mm for A4 landscape
      const defaultColumnWidth = Math.floor(availableWidth / visibleColumnsData.length);

      // Create column styles object
      const columnStyles = {};
      visibleColumnsData.forEach((_, index) => {
        columnStyles[index] = { cellWidth: defaultColumnWidth };
      });

      // Add table to document using the imported autoTable function
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 2,
          overflow: 'linebreak',
          halign: 'left'
        },
        columnStyles: columnStyles
      });

      // Save the PDF with date in filename
      doc.save(`erc_lead_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  // Handle export to Excel
  const exportToExcel = () => {
    try {
      // Confirm export with user if there are many leads
      if (filteredLeads.length > 100) {
        if (!confirm(`You are about to export ${filteredLeads.length} leads to Excel. This may take a moment. Continue?`)) {
          return;
        }
      }

      // Get visible columns and their data, excluding action columns that shouldn't be exported
      const columnsToExclude = ['bookACall', 'contactCard', 'notes'];
      const visibleColumnsData = allColumns.filter(column =>
        visibleColumns.includes(column.id) && !columnsToExclude.includes(column.id)
      );

      // Prepare data for Excel
      const excelData = filteredLeads.map(lead => {
        const rowData = {};

        // Add data for each visible column
        visibleColumnsData.forEach(column => {
          // Handle special columns with custom rendering
          if (column.id === 'leadId') rowData[column.label] = lead.lead_id || '';
          else if (column.id === 'date') rowData[column.label] = lead.created || '';
          else if (column.id === 'businessName') rowData[column.label] = lead.business_legal_name || '';
          else if (column.id === 'taxNowStatus') rowData[column.label] = lead.lead_status || '';
          else if (column.id === 'businessEmail') rowData[column.label] = lead.business_email || '';
          else if (column.id === 'businessPhone') rowData[column.label] = lead.business_phone || '';
          else if (column.id === 'employee') rowData[column.label] = lead.employee_id || '';
          else if (column.id === 'salesAgent') rowData[column.label] = lead.internal_sales_agent || '';
          else if (column.id === 'salesSupport') rowData[column.label] = lead.internal_sales_support || '';
          else if (column.id === 'affiliateSource') rowData[column.label] = lead.source || '';
          else if (column.id === 'leadCampaign') rowData[column.label] = lead.campaign || '';
          else if (column.id === 'category') rowData[column.label] = lead.category || '';
          else if (column.id === 'leadGroup') rowData[column.label] = lead.lead_group || '';
          else rowData[column.label] = '';
        });

        return rowData;
      });

      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'ERC Leads');

      // Generate Excel file and trigger download
      XLSX.writeFile(wb, `erc_lead_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('Excel generation error:', error);
      alert('Error generating Excel file: ' + error.message);
    }
  };

  // Handle view contact card
  const handleViewContact = (lead) => {
    const contactCardHTML = `
      <div class="contact-card">
        <table class="table table-bordered">
          <tr>
            <th>Lead ID</th>
            <td>${lead.lead_id || ''}</td>
          </tr>
          <tr>
            <th>Authorized Signatory Name</th>
            <td>${lead.authorized_signatory_name || ''}</td>
          </tr>
          <tr>
            <th>Business Phone</th>
            <td>${lead.business_phone || ''}</td>
          </tr>
          <tr>
            <th>Business Email</th>
            <td>${lead.business_email || ''}</td>
          </tr>
        </table>
      </div>
    `;

    Swal.fire({
      title: 'Contact Card',
      html: contactCardHTML,
      width: '500px',
      showCloseButton: true,
      showConfirmButton: false
    });
  };

  // Handle view notes
  const handleViewNotes = (lead) => {
    const leadId = lead.lead_id || '';
    const status = lead.lead_status || '';

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
      showConfirmButton: false,
      showCloseButton: true,
      allowOutsideClick: false,
      customClass: {
        container: 'swal-wide',
        popup: 'swal-popup-custom',
        header: 'swal-header-custom',
        title: 'swal-title-custom',
        closeButton: 'swal-close-button-custom',
        content: 'swal-content-custom'
      }
    });

    // Fetch notes from the API
    axios.get(`https://play.occamsadvisory.com/portal/wp-json/v1/lead-notes/${leadId}`)
      .then(response => {
        console.log('Lead Notes API Response:', response);

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
              <p class="text-muted">No notes available for this lead</p>
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
                  <span class="text-black">Lead ID: <span class="text-dark">${leadId}</span></span>
                </div>
                <div>
                  <span class="badge ${
                    status === 'New' ? 'bg-info' :
                    status === 'Contacted' ? 'bg-primary' :
                    status === 'Qualified' ? 'bg-warning' :
                    status === 'Active' ? 'bg-success' :
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
              <p class="text-muted">There was a problem loading notes for this lead.</p>
              <div class="alert alert-danger py-2 mt-2">
                <small>${error.response ? `Error: ${error.response.status} - ${error.response.statusText}` : 'Network error. Please check your connection.'}</small>
              </div>
              <p class="text-muted mt-2">Lead ID: ${leadId}</p>
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

  // Handle add notes
  const handleAddNotes = (lead) => {
    const leadId = lead.lead_id || '';

    Swal.fire({
      title: `<span style="font-size: 1.2rem; color: #333;">Add Note</span>`,
      html: `
        <div class="text-start">
          <div class="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
            <div>
              <span class="text-black">Lead ID: <span class="text-dark">${leadId}</span></span>
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
          lead_id: leadId,
          note: result.value.content
        };

        // Send the data to the API
        axios.post('https://play.occamsadvisory.com/portal/wp-json/v1/lead-notes', noteData)
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

            // Refresh the notes view after a short delay
            setTimeout(() => {
              handleViewNotes(lead);
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
                handleAddNotes(lead);
              }
            });
          });
      }
    });
  };

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
                    <h4 className="text-white">ERC Lead Report</h4>
                  </div>
                </div>
              </div>
              <div className="white_card_body">
                <div className="mb-4">
                  <div className="row align-items-center">
                    {/* Search box */}
                    <div className="col-md-3">
                      <div className="input-group input-group-sm">
                        <div className="position-relative flex-grow-1">
                          <input
                            type="text"
                            className="form-control search-input"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                              setCurrentPage(1); // Reset to first page on search
                              setIsSearching(e.target.value.trim() !== '');
                            }}
                          />
                          {isSearching && (
                            <button
                              className="btn btn-sm btn-link position-absolute end-0 top-0 bottom-0 text-secondary"
                              onClick={() => {
                                setSearchTerm('');
                                setIsSearching(false);
                                setCurrentPage(1); // Reset to first page when clearing search
                              }}
                              title="Clear search"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Export buttons and Column Selector */}
                    <div className="col-md-9">
                      <div className="d-flex justify-content-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={fetchLeads}
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
                            <div className="column-selector-content">
                              {columnGroups.map(group => (
                                <div key={group.id} className="column-group">
                                  <div className="column-group-title">{group.title}</div>
                                  {group.columns.map(column => (
                                    <div
                                      key={column.id}
                                      className={`dropdown-item ${visibleColumns.includes(column.id) ? 'active' : ''}`}
                                    >
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
                            <div className="column-selector-footer">
                              <button className="btn btn-reset" onClick={resetToDefaultColumns}>
                                Reset
                              </button>
                              <button className="btn btn-apply" onClick={selectAllColumns}>
                                Select All
                              </button>
                            </div>
                          </div>
                        </div>
                        <button className="btn btn-sm export-btn" onClick={exportToExcel}>
                          <i className="fas fa-file-excel me-1"></i> Excel
                        </button>
                        <button className="btn btn-sm export-btn" onClick={exportToPDF}>
                          <i className="fas fa-file-pdf me-1"></i> PDF
                        </button>
                        <button className="btn btn-sm export-btn" onClick={exportToCSV}>
                          <i className="fas fa-file-csv me-1"></i> CSV
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loading indicator */}
                {loading && (
                  <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading leads data...</p>
                  </div>
                )}

                {/* Error message */}
                {error && !loading && (
                  <div className="alert alert-warning" role="alert">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-exclamation-triangle me-3 fs-4"></i>
                      <div>
                        <h5 className="alert-heading mb-1">Data Loading Error</h5>
                        <p className="mb-0">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data table */}
                {!loading && (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead>
                        <tr>
                          {allColumns.map(column => {
                            // Only render columns that are in the visibleColumns array
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
                        {currentLeads.length > 0 ? (
                          currentLeads.map((lead, index) => (
                            <tr key={lead.lead_id || index}>
                              {allColumns.map(column => {
                                // Only render columns that are in the visibleColumns array
                                if (!visibleColumns.includes(column.id)) {
                                  return null;
                                }

                                // Render different cell types based on column id
                                switch (column.id) {
                                  case 'leadId':
                                    return (
                                      <td key={column.id}>
                                        <Link to={`/reporting/lead-detail/${lead.lead_id}`} className="lead-link">
                                          {lead.lead_id || ''}
                                        </Link>
                                      </td>
                                    );
                                  case 'date':
                                    return <td key={column.id}>{lead.created || ''}</td>;
                                  case 'businessName':
                                    return (
                                      <td key={column.id}>
                                        <Link
                                          to={`/lead-detail/${lead.lead_id}`}
                                          state={{ leadData: lead }}
                                          className="lead-link"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {lead.business_legal_name || ''}
                                        </Link>
                                      </td>
                                    );
                                  case 'taxNowStatus':
                                    return (
                                      <td key={column.id}>
                                        <span className={`badge ${
                                          lead.lead_status === 'New' ? 'bg-info' :
                                          lead.lead_status === 'Contacted' ? 'bg-primary' :
                                          lead.lead_status === 'Qualified' ? 'bg-warning' :
                                          lead.lead_status === 'Active' ? 'bg-success' :
                                          'bg-secondary'
                                        }`}>
                                          {lead.lead_status || ''}
                                        </span>
                                      </td>
                                    );
                                  case 'businessEmail':
                                    return <td key={column.id}>{lead.business_email || ''}</td>;
                                  case 'businessPhone':
                                    return <td key={column.id}>{lead.business_phone || ''}</td>;
                                  case 'contactCard':
                                    return (
                                      <td key={column.id} className="text-center">
                                        <button
                                          className="btn btn-sm btn-outline-primary"
                                          onClick={() => handleViewContact(lead)}
                                        >
                                          <i className="fas fa-address-card"></i>
                                        </button>
                                      </td>
                                    );
                                  case 'employee':
                                    return <td key={column.id}>{lead.employee_id || ''}</td>;
                                  case 'salesAgent':
                                    return <td key={column.id}>{lead.internal_sales_agent || ''}</td>;
                                  case 'salesSupport':
                                    return <td key={column.id}>{lead.internal_sales_support || ''}</td>;
                                  case 'affiliateSource':
                                    return <td key={column.id}>{lead.source || ''}</td>;
                                  case 'leadCampaign':
                                    return <td key={column.id}>{lead.campaign || ''}</td>;
                                  case 'category':
                                    return <td key={column.id}>{lead.category || ''}</td>;
                                  case 'leadGroup':
                                    return <td key={column.id}>{lead.lead_group || ''}</td>;
                                  case 'notes':
                                    return (
                                      <td key={column.id}>
                                        <div className="d-flex justify-content-center gap-2">
                                          <button
                                            className="btn btn-sm btn-outline-info"
                                            onClick={() => handleViewNotes(lead)}
                                            title="View Notes"
                                          >
                                            <i className="fas fa-eye"></i>
                                          </button>
                                          <button
                                            className="btn btn-sm btn-outline-success"
                                            onClick={() => handleAddNotes(lead)}
                                            title="Add Notes"
                                          >
                                            <i className="fas fa-plus"></i>
                                          </button>
                                        </div>
                                      </td>
                                    );
                                  case 'bookACall':
                                    // Get lead data for Calendly URL parameters
                                    const businessName = encodeURIComponent(lead.business_legal_name || '');
                                    const email = encodeURIComponent(lead.business_email || '');
                                    const phone = encodeURIComponent(lead.business_phone || '');

                                    // Construct Calendly URL with parameters
                                    const calendlyUrl = `https://calendly.com/occams-erc-experts/rmj?name=${businessName}&email=${email}&a1=${phone}`;

                                    return (
                                      <td key={column.id}>
                                        <div className="d-flex justify-content-center">
                                          <a
                                            href={calendlyUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-outline-primary"
                                            title="Book a Call"
                                          >
                                            <i className="fas fa-calendar-alt"></i>
                                          </a>
                                        </div>
                                      </td>
                                    );
                                  default:
                                    return <td key={column.id}></td>;
                                }
                              })}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={visibleColumns.length} className="text-center py-4">
                              <i className="fas fa-info-circle me-2"></i>
                              No leads found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div>
                      Showing {indexOfFirstLead + 1} to {Math.min(indexOfLastLead, filteredLeads.length)} of {filteredLeads.length} entries
                    </div>
                    <nav>
                      <ul className="pagination mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={goToPreviousPage}>
                            <i className="fas fa-chevron-left"></i>
                          </button>
                        </li>
                        {[...Array(totalPages)].map((_, i) => (
                          <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => paginate(i + 1)}>
                              {i + 1}
                            </button>
                          </li>
                        ))}
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
    </div>
  );
}

export default ERCLeadReport;