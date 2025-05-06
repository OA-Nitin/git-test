import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import axios from 'axios';
import './common/CommonStyles.css';
import './ColumnSelector.css';
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
      const response = await axios.get('https://play.occamsadvisory.com/portal/wp-json/v1/leads');

      if (response.data && Array.isArray(response.data)) {
        // Transform API data to match our expected format
        const formattedLeads = response.data.map((lead, index) => ({
          id: lead.id || `LD${String(index + 1).padStart(3, '0')}`,
          businessName: lead.business_name || 'Unknown Business',
          businessEmail: lead.email || 'no-email@example.com',
          phoneNumber: lead.phone || 'No Phone',
          status: lead.status || 'New',
          // Add any additional fields from the API that you want to use
          date: lead.date || new Date().toLocaleDateString(),
          employee: lead.employee || 'Not Assigned',
          salesAgent: lead.sales_agent || 'Not Assigned',
          salesSupport: lead.sales_support || 'Not Assigned',
          affiliateSource: lead.affiliate_source || 'Direct',
          leadCampaign: lead.lead_campaign || 'None',
          w2Count: lead.w2_count || '0'
        }));

        setLeads(formattedLeads);
      } else {
        // If API returns unexpected format, use fallback data
        setLeads(generateFallbackLeads());
        setError('API returned unexpected data format. Using fallback data.');
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to fetch leads. Using fallback data.');
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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');

  // Define all available columns with groups
  const columnGroups = [
    {
      id: 'basic',
      title: 'Basic Information',
      columns: [
        { id: 'leadId', label: 'Lead #', field: 'id', sortable: true },
        { id: 'date', label: 'Date', field: 'date', sortable: false },
        { id: 'businessName', label: 'Business Name', field: 'businessName', sortable: true },
        { id: 'taxNowStatus', label: 'TaxNow Signup Status', field: 'status', sortable: true }
      ]
    },
    {
      id: 'contacts',
      title: 'Contact Information',
      columns: [
        { id: 'contactCard', label: 'Contact Card', field: 'contactCard', sortable: false },
        { id: 'bookACall', label: 'Book A Call', field: 'bookACall', sortable: false }
      ]
    },
    {
      id: 'team',
      title: 'Team Information',
      columns: [
        { id: 'employee', label: 'Employee', field: 'employee', sortable: false },
        { id: 'salesAgent', label: 'Sales Agent', field: 'salesAgent', sortable: false },
        { id: 'salesSupport', label: 'Sales Support', field: 'salesSupport', sortable: false }
      ]
    },
    {
      id: 'additional',
      title: 'Additional Information',
      columns: [
        { id: 'affiliateSource', label: 'Affiliate/Source', field: 'affiliateSource', sortable: false },
        { id: 'leadCampaign', label: 'Lead Campaign', field: 'leadCampaign', sortable: false },
        { id: 'w2Count', label: 'W2 Count', field: 'w2Count', sortable: false },
        { id: 'actions', label: 'Actions', field: 'actions', sortable: false }
      ]
    }
  ];

  // Flatten all columns for easier access
  const allColumns = columnGroups.flatMap(group => group.columns);

  // Default visible columns (first 5)
  const defaultVisibleColumns = ['leadId', 'date', 'businessName', 'taxNowStatus', 'actions'];

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
    const matchesSearch =
      lead.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.businessEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phoneNumber.includes(searchTerm);

    const matchesStatus = filterStatus === '' || lead.status === filterStatus;

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
        if (column.id === 'leadId') return lead.id;
        if (column.id === 'date') return new Date().toLocaleDateString();
        if (column.id === 'businessName') return `"${lead.businessName.replace(/"/g, '""')}"`; // Escape quotes
        if (column.id === 'taxNowStatus') return lead.status;
        if (column.id === 'contactCard') return 'Contact Card';
        if (column.id === 'bookACall') return 'Book A Call';
        if (column.id === 'employee') return 'John Doe';
        if (column.id === 'salesAgent') return 'Sarah Smith';
        if (column.id === 'salesSupport') return 'Mike Johnson';
        if (column.id === 'affiliateSource') return 'Website';
        if (column.id === 'leadCampaign') return 'Email Campaign';
        if (column.id === 'w2Count') return Math.floor(Math.random() * 10) + 1;
        if (column.id === 'actions') return 'Actions';

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
      if (filterStatus) {
        doc.text(`Filtered by status: ${filterStatus}`, 15, 27);
      }
      if (searchTerm) {
        doc.text(`Search term: "${searchTerm}"`, 15, filterStatus ? 32 : 27);
      }

      // Create table data
      const tableColumn = visibleColumnsData.map(column => column.label);

      // Create table rows with data for visible columns
      const tableRows = filteredLeads.map(lead => {
        return visibleColumnsData.map(column => {
          // Handle special columns with custom rendering
          if (column.id === 'leadId') return lead.id;
          if (column.id === 'date') return new Date().toLocaleDateString();
          if (column.id === 'businessName') return lead.businessName;
          if (column.id === 'taxNowStatus') return lead.status;
          if (column.id === 'contactCard') return 'Contact Card';
          if (column.id === 'bookACall') return 'Book A Call';
          if (column.id === 'employee') return 'John Doe';
          if (column.id === 'salesAgent') return 'Sarah Smith';
          if (column.id === 'salesSupport') return 'Mike Johnson';
          if (column.id === 'affiliateSource') return 'Website';
          if (column.id === 'leadCampaign') return 'Email Campaign';
          if (column.id === 'w2Count') return Math.floor(Math.random() * 10) + 1;
          if (column.id === 'actions') return 'Actions';

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
        startY: (filterStatus || searchTerm) ? 35 : 25,
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
          if (column.id === 'leadId') rowData[column.label] = lead.id;
          else if (column.id === 'date') rowData[column.label] = new Date().toLocaleDateString();
          else if (column.id === 'businessName') rowData[column.label] = lead.businessName;
          else if (column.id === 'taxNowStatus') rowData[column.label] = lead.status;
          else if (column.id === 'contactCard') rowData[column.label] = 'Contact Card';
          else if (column.id === 'bookACall') rowData[column.label] = 'Book A Call';
          else if (column.id === 'employee') rowData[column.label] = 'John Doe';
          else if (column.id === 'salesAgent') rowData[column.label] = 'Sarah Smith';
          else if (column.id === 'salesSupport') rowData[column.label] = 'Mike Johnson';
          else if (column.id === 'affiliateSource') rowData[column.label] = 'Website';
          else if (column.id === 'leadCampaign') rowData[column.label] = 'Email Campaign';
          else if (column.id === 'w2Count') rowData[column.label] = Math.floor(Math.random() * 10) + 1;
          else if (column.id === 'actions') rowData[column.label] = 'Actions';
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
    Swal.fire({
      title: 'Lead Details',
      html: `
        <div class="text-start">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">${lead.businessName}</h5>
            <span class="badge ${
              lead.status === 'New' ? 'bg-info' :
              lead.status === 'Contacted' ? 'bg-primary' :
              lead.status === 'Qualified' ? 'bg-warning' :
              lead.status === 'Active' ? 'bg-success' :
              'bg-secondary'
            }">${lead.status}</span>
          </div>

          <table class="table table-bordered">
            <tr>
              <th>Lead ID</th>
              <td>${lead.id}</td>
            </tr>
            <tr>
              <th>Business Name</th>
              <td>${lead.businessName}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>${lead.businessEmail}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>${lead.phoneNumber}</td>
            </tr>
            <tr>
              <th>Created Date</th>
              <td>${new Date().toLocaleDateString()}</td>
            </tr>
          </table>
        </div>
      `,
      confirmButtonText: 'Close'
    });
  };

  const handleBookCall = (lead) => {
    Swal.fire({
      title: 'Book a Call',
      html: `
        <div class="text-start">
          <p>Schedule a call with <strong>${lead.businessName}</strong></p>
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
        Swal.fire('Call Scheduled', `Call with ${lead.businessName} scheduled for ${result.value.date} at ${result.value.time}`, 'success');
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

                    {/* Status filter */}
                    <div className="col-md-3">
                      <div className="d-flex align-items-center">
                        <span className="me-2">Status:</span>
                        <select
                          className="form-select form-select-sm"
                          value={filterStatus}
                          onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setCurrentPage(1);
                          }}
                        >
                          <option value="">All</option>
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Active">Active</option>
                          <option value="Converted">Converted</option>
                        </select>
                      </div>
                    </div>

                    {/* Rows per page */}
                    <div className="col-md-2">
                      <div className="d-flex align-items-center">
                        <span className="me-2">Rows:</span>
                        <select
                          className="form-select form-select-sm"
                          style={{ width: '70px' }}
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                        </select>
                      </div>
                    </div>

                    {/* Export buttons and Column Selector */}
                    <div className="col-md-4">
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
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button
                      className="btn btn-sm btn-outline-primary ms-3"
                      onClick={fetchLeads}
                    >
                      <i className="fas fa-sync-alt me-1"></i> Retry
                    </button>
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
                          currentLeads.map(lead => (
                            <tr key={lead.id}>
                              {visibleColumns.includes('leadId') && <td>{lead.id}</td>}
                              {visibleColumns.includes('date') && <td>{lead.date || new Date().toLocaleDateString()}</td>}
                              {visibleColumns.includes('businessName') && <td>{lead.businessName}</td>}
                              {visibleColumns.includes('contactCard') && (
                                <td>
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleView(lead)}
                                    title="View Contact Card"
                                  >
                                    <i className="fas fa-address-card"></i>
                                  </button>
                                </td>
                              )}
                              {visibleColumns.includes('affiliateSource') && <td>{lead.affiliateSource || 'Website'}</td>}
                              {visibleColumns.includes('employee') && <td>{lead.employee || 'John Doe'}</td>}
                              {visibleColumns.includes('salesAgent') && <td>{lead.salesAgent || 'Sarah Smith'}</td>}
                              {visibleColumns.includes('salesSupport') && <td>{lead.salesSupport || 'Mike Johnson'}</td>}
                              {visibleColumns.includes('taxNowStatus') && (
                                <td>
                                  <span className={`badge ${
                                    lead.status === 'New' ? 'bg-info' :
                                    lead.status === 'Contacted' ? 'bg-primary' :
                                    lead.status === 'Qualified' ? 'bg-warning' :
                                    lead.status === 'Active' ? 'bg-success' :
                                    'bg-secondary'
                                  }`}>
                                    {lead.status}
                                  </span>
                                </td>
                              )}
                              {visibleColumns.includes('leadCampaign') && <td>{lead.leadCampaign || 'Email Campaign'}</td>}
                              {visibleColumns.includes('w2Count') && <td>{lead.w2Count || '0'}</td>}
                              {visibleColumns.includes('bookACall') && (
                                <td>
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleBookCall(lead)}
                                    title="Book A Call"
                                  >
                                    <i className="fas fa-calendar-alt"></i>
                                  </button>
                                </td>
                              )}
                              {visibleColumns.includes('actions') && (
                                <td>
                                  <div className="d-flex justify-content-center" style={{ gap: '2px' }}>
                                    <button
                                      className="btn btn-sm btn-outline-primary"
                                      title="Call"
                                      onClick={() => handleCall(lead.phoneNumber, lead.businessName)}
                                    >
                                      <i className="fas fa-phone"></i>
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-info"
                                      title="Email"
                                      onClick={() => handleEmail(lead.businessEmail, lead.businessName)}
                                    >
                                      <i className="fas fa-envelope"></i>
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-success"
                                      title="Message"
                                      onClick={() => handleMessage(lead.id, lead.businessName)}
                                    >
                                      <i className="fas fa-comment"></i>
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={visibleColumns.length} className="text-center">No leads found</td>
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
