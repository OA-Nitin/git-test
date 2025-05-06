import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import axios from 'axios';
import './common/CommonStyles.css';
import './ColumnSelector.css';
import './DateFilter.css';
import SortableTableHeader from './common/SortableTableHeader';
import { sortArrayByKey } from '../utils/sortUtils';

const LeadReport = () => {
  // State for API data
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Lead Report - Occams Portal"; // Set title for Lead Report page

    // Fetch leads from API
    fetchLeads();
  }, []);

  // Function to fetch leads from API
  const fetchLeads = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching leads from API...');

      // Make the API request with proper headers
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
        const apiLeads = response.data.data;
        console.log('API Leads:', apiLeads);

        if (apiLeads.length > 0) {
          setLeads(apiLeads);
        } else {
          console.warn('API returned empty data array, using fallback data');
          setLeads(generateFallbackLeads());
          setError('No leads found in API response. Using sample data instead.');
        }
      } else {
        console.error('API response format unexpected:', response);
        // If API returns unexpected format, use fallback data
        setLeads(generateFallbackLeads());
        setError('API returned unexpected data format. Using sample data instead.');
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(`Failed to fetch leads: ${err.message}. Using sample data instead.`);
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
        id: `LD${String(i).padStart(3, '0')}`,
        businessName: company.name,
        businessEmail: `info@${company.domain}`,
        phoneNumber: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        status: statuses[statusIndex],
        date: new Date().toLocaleDateString(),
        employee: 'John Doe',
        salesAgent: 'Sarah Smith',
        salesSupport: 'Mike Johnson',
        affiliateSource: 'Website',
        leadCampaign: 'Email Campaign',
        w2Count: Math.floor(Math.random() * 10) + 1
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
        { id: 'leadGroup', label: 'Lead Group', field: 'lead_group', sortable: false }
      ]
    }
  ];

  // Flatten all columns for easier access
  const allColumns = columnGroups.flatMap(group => group.columns);

  // Default visible columns (first 5)
  const defaultVisibleColumns = ['leadId', 'businessName', 'taxNowStatus', 'businessEmail', 'businessPhone'];

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
    // Handle different possible field names in the API response
    const id = String(lead.id || lead.lead_id || '').toLowerCase();
    const name = String(lead.name || lead.business_name || lead.business_legal_name || '').toLowerCase();
    const email = String(lead.email || lead.business_email || '').toLowerCase();
    const phone = String(lead.phone || lead.business_phone || '');
    const status = String(lead.status || lead.lead_status || '');

    const searchTermLower = searchTerm.toLowerCase();

    const matchesSearch = searchTerm === '' ||
      id.includes(searchTermLower) ||
      name.includes(searchTermLower) ||
      email.includes(searchTermLower) ||
      phone.includes(searchTerm);

    const matchesStatus = filterStatus === '' || status === filterStatus;

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

    // Get visible columns and their data
    const visibleColumnsData = allColumns.filter(column => visibleColumns.includes(column.id));

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
        if (column.id === 'contactCard') return 'Contact Card';
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
    link.setAttribute('download', `lead_report_${new Date().toISOString().slice(0, 10)}.csv`);
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

      // Get visible columns and their data
      const visibleColumnsData = allColumns.filter(column => visibleColumns.includes(column.id));

      // Initialize jsPDF with landscape orientation
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add title
      doc.setFontSize(16);
      doc.text('Lead Report', 15, 15);

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
          if (column.id === 'contactCard') return 'Contact Card';
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
      doc.save(`lead_report_${new Date().toISOString().slice(0, 10)}.pdf`);
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

      // Get visible columns and their data
      const visibleColumnsData = allColumns.filter(column => visibleColumns.includes(column.id));

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
          else if (column.id === 'contactCard') rowData[column.label] = 'Contact Card';
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

      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths - default 15 characters for all columns
      const wscols = visibleColumnsData.map(() => ({ wch: 15 }));

      // Adjust specific column widths based on content type
      visibleColumnsData.forEach((column, index) => {
        if (column.id === 'leadId') wscols[index] = { wch: 10 };
        else if (column.id === 'businessName') wscols[index] = { wch: 25 };
        else if (column.id === 'date') wscols[index] = { wch: 12 };
        else if (column.id === 'taxNowStatus') wscols[index] = { wch: 15 };
        else if (column.id === 'actions') wscols[index] = { wch: 20 };
      });

      worksheet['!cols'] = wscols;

      // Add header styling
      const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellRef]) continue;

        worksheet[cellRef].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4285F4" } }
        };
      }

      // Create a workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Lead Report');

      // Add metadata
      workbook.Props = {
        Title: "Lead Report",
        Subject: "Lead Data",
        Author: "Occams Portal",
        CreatedDate: new Date()
      };

      // Generate Excel file and trigger download with date in filename
      XLSX.writeFile(workbook, `lead_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('Excel generation error:', error);
      alert('Error generating Excel file: ' + error.message);
    }
  };

  // Handle action buttons
  const handleCall = (phoneNumber, businessName) => {
    Swal.fire({
      title: 'Calling',
      text: `Calling ${businessName} at ${phoneNumber}`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Call',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Call Initiated', `Call to ${phoneNumber} has been initiated`, 'success');
      }
    });
  };

  const handleEmail = (email, businessName) => {
    Swal.fire({
      title: 'Compose Email',
      html: `
        <div class="form-group text-start mb-3">
          <label class="small">To:</label>
          <input type="text" class="form-control" value="${email}" readonly>
        </div>
        <div class="form-group text-start mb-3">
          <label class="small">Subject:</label>
          <input type="text" class="form-control" id="email-subject" placeholder="Enter subject">
        </div>
        <div class="form-group text-start">
          <label class="small">Message:</label>
          <textarea class="form-control" id="email-message" rows="5" placeholder="Type your message here..."></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Send Email',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const subject = document.getElementById('email-subject').value;
        const message = document.getElementById('email-message').value;
        if (!subject || !message) {
          Swal.showValidationMessage('Please fill in all fields');
          return false;
        }
        return { subject, message };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Email Sent', `Email has been sent to ${businessName} at ${email}`, 'success');
      }
    });
  };

  const handleMessage = (id, businessName) => {
    Swal.fire({
      title: 'Send Message',
      html: `
        <div class="row mb-3">
          <div class="col-md-6">
            <div class="form-group text-start">
              <label class="small">Lead ID:</label>
              <input type="text" class="form-control" value="${id}" readonly>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group text-start">
              <label class="small">Business:</label>
              <input type="text" class="form-control" value="${businessName}" readonly>
            </div>
          </div>
        </div>
        <div class="form-group text-start">
          <label class="small">Message:</label>
          <textarea class="form-control" id="message-text" rows="5" placeholder="Type your message here..."></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Send Message',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const message = document.getElementById('message-text').value;
        if (!message) {
          Swal.showValidationMessage('Please enter a message');
          return false;
        }
        return { message };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Message Sent', `Message has been sent to ${businessName}`, 'success');
      }
    });
  };

  const handleView = (lead) => {
    // Only show specific fields in the contact card
    const businessName = lead.business_legal_name || lead.business_name || lead.name || 'Unknown Business';
    const status = lead.lead_status || lead.status || '';

    // Create HTML for the specific fields we want to show
    const contactCardHTML = `
      <div class="text-start">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">${businessName}</h5>
          <span class="badge ${
            status === 'New' ? 'bg-info' :
            status === 'Contacted' ? 'bg-primary' :
            status === 'Qualified' ? 'bg-warning' :
            status === 'Active' ? 'bg-success' :
            'bg-secondary'
          }">${status}</span>
        </div>

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

  const handleBookCall = (lead) => {
    const businessName = lead.name || lead.business_name || lead.business_legal_name || 'Unknown Business';

    Swal.fire({
      title: 'Book a Call',
      html: `
        <div class="text-start">
          <p>Schedule a call with <strong>${businessName}</strong></p>
          <div class="form-group mb-3">
            <label class="small">Date:</label>
            <input type="date" class="form-control" id="call-date" min="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="form-group mb-3">
            <label class="small">Time:</label>
            <input type="time" class="form-control" id="call-time">
          </div>
          <div class="form-group">
            <label class="small">Notes:</label>
            <textarea class="form-control" id="call-notes" rows="3" placeholder="Add notes about the call..."></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Schedule',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const date = document.getElementById('call-date').value;
        const time = document.getElementById('call-time').value;
        if (!date || !time) {
          Swal.showValidationMessage('Please select date and time');
          return false;
        }
        return { date, time, notes: document.getElementById('call-notes').value };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Call Scheduled', `Call with ${businessName} scheduled for ${result.value.date} at ${result.value.time}`, 'success');
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
                    <img src="/assets/images/Knowledge_Ceter_White.svg" className="page-title-img" alt="" />
                    <h4 className="text-white">Lead Report</h4>
                  </div>
                </div>
              </div>
              <div className="white_card_body">
                <div className="mb-4">
                  <div className="row align-items-center">
                    {/* Search box */}
                    <div className="col-md-3">
                      <div className="input-group input-group-sm">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn btn-sm search-btn" type="button">
                          <i className="fas fa-search"></i>
                        </button>
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
                    <hr />
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Please try again or contact support if the problem persists.</span>
                      <button
                        className="btn btn-primary"
                        onClick={fetchLeads}
                      >
                        <i className="fas fa-sync-alt me-1"></i> Retry
                      </button>
                    </div>
                  </div>
                )}

                {/* Data table */}
                {!loading && (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover table-striped">
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
                            <tr key={lead.lead_id || lead.id || index}>
                              {/* Render cells in the same order as the column definitions */}
                              {allColumns.map(column => {
                                // Only render columns that are in the visibleColumns array
                                if (!visibleColumns.includes(column.id)) {
                                  return null;
                                }

                                // Render different cell types based on column id
                                switch (column.id) {
                                  case 'leadId':
                                    return <td key={column.id}>{lead.lead_id || ''}</td>;
                                  case 'date':
                                    return <td key={column.id}>{lead.created || ''}</td>;
                                  case 'businessName':
                                    return <td key={column.id}>{lead.business_legal_name || ''}</td>;
                                  case 'businessEmail':
                                    return <td key={column.id}>{lead.business_email || ''}</td>;
                                  case 'businessPhone':
                                    return <td key={column.id}>{lead.business_phone || ''}</td>;
                                  case 'contactCard':
                                    return (
                                      <td key={column.id}>
                                        <button
                                          className="btn btn-sm btn-outline-primary"
                                          onClick={() => handleView(lead)}
                                          title="View Contact Card"
                                        >
                                          <i className="fas fa-address-card"></i>
                                        </button>
                                      </td>
                                    );
                                  case 'affiliateSource':
                                    return <td key={column.id}>{lead.source || ''}</td>;
                                  case 'employee':
                                    return <td key={column.id}>{lead.employee_id || ''}</td>;
                                  case 'salesAgent':
                                    return <td key={column.id}>{lead.internal_sales_agent || ''}</td>;
                                  case 'salesSupport':
                                    return <td key={column.id}>{lead.internal_sales_support || ''}</td>;
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
                                  case 'leadCampaign':
                                    return <td key={column.id}>{lead.campaign || ''}</td>;
                                  case 'category':
                                    return <td key={column.id}>{lead.category || ''}</td>;
                                  case 'leadGroup':
                                    return <td key={column.id}>{lead.lead_group || ''}</td>;
                                  default:
                                    return <td key={column.id}></td>;
                                }
                              })}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={visibleColumns.length} className="text-center py-5">
                              <div className="d-flex flex-column align-items-center">
                                <i className="fas fa-search fa-3x text-muted mb-3"></i>
                                <h5 className="text-muted">No leads found</h5>
                                <p className="text-muted mb-3">
                                  {searchTerm || filterStatus ?
                                    'Try adjusting your search or filter criteria' :
                                    'No lead data is available from the API'}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {!loading && (
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <p>Showing {indexOfFirstLead + 1} to {Math.min(indexOfLastLead, filteredLeads.length)} of {filteredLeads.length} leads (filtered from {leads.length} total)</p>
                    </div>
                    <div className="col-md-6">
                      <nav aria-label="Lead report pagination">
                        <ul className="pagination justify-content-end">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={goToPreviousPage}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </button>
                          </li>

                          {/* First page */}
                          {currentPage > 3 && (
                            <li className="page-item">
                              <button className="page-link" onClick={() => paginate(1)}>1</button>
                            </li>
                          )}

                          {/* Ellipsis */}
                          {currentPage > 4 && (
                            <li className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          )}

                          {/* Page numbers */}
                          {[...Array(totalPages)].map((_, i) => {
                            const pageNumber = i + 1;
                            // Show current page and 1 page before and after
                            if (
                              pageNumber === currentPage ||
                              pageNumber === currentPage - 1 ||
                              pageNumber === currentPage + 1
                            ) {
                              return (
                                <li
                                  key={pageNumber}
                                  className={`page-item ${pageNumber === currentPage ? 'active' : ''}`}
                                >
                                  <button
                                    className="page-link"
                                    onClick={() => paginate(pageNumber)}
                                  >
                                    {pageNumber}
                                  </button>
                                </li>
                              );
                            }
                            return null;
                          })}

                          {/* Ellipsis */}
                          {currentPage < totalPages - 3 && (
                            <li className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          )}

                          {/* Last page */}
                          {currentPage < totalPages - 2 && (
                            <li className="page-item">
                              <button
                                className="page-link"
                                onClick={() => paginate(totalPages)}
                              >
                                {totalPages}
                              </button>
                            </li>
                          )}

                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={goToNextPage}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadReport;
