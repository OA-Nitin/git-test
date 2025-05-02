import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import './LeadReportStyles.css';

const LeadReport = () => {
  useEffect(() => {
    document.title = "Lead Report - Occams Portal"; // Set title for Lead Report page
  }, []);

  // Generate sample lead data
  const generateLeads = () => {
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
      { name: 'Soylent Corp', domain: 'soylent.com' },
      { name: 'Weyland-Yutani', domain: 'weyland-yutani.com' },
      { name: 'Tyrell Corporation', domain: 'tyrell.com' },
      { name: 'Rekall Inc', domain: 'rekall.com' },
      { name: 'Omni Consumer Products', domain: 'ocp.com' },
      { name: 'Nakatomi Trading Corp', domain: 'nakatomi.com' },
      { name: 'Gekko & Co', domain: 'gekko.com' },
      { name: 'Dunder Mifflin', domain: 'dundermifflin.com' },
      { name: 'Wonka Industries', domain: 'wonka.com' },
      { name: 'Oceanic Airlines', domain: 'oceanic-air.com' },
      { name: 'Virtucon', domain: 'virtucon.com' },
      { name: 'Spacely Sprockets', domain: 'spacely.com' },
      { name: 'Cogswell Cogs', domain: 'cogswell.com' },
      { name: 'Monsters Inc', domain: 'monsters.com' },
      { name: 'Buy n Large', domain: 'bnl.com' },
      { name: 'Gringotts', domain: 'gringotts.com' },
      { name: 'Ollivanders', domain: 'ollivanders.com' },
      { name: 'Weasleys Wizard Wheezes', domain: 'weasleys.com' },
      { name: 'Stark Industries', domain: 'stark.com' },
      { name: 'Hammer Industries', domain: 'hammer.com' },
      { name: 'Pied Piper', domain: 'piedpiper.com' },
      { name: 'Hooli', domain: 'hooli.com' },
      { name: 'Raviga Capital', domain: 'raviga.com' },
      { name: 'Endframe', domain: 'endframe.com' },
      { name: 'Aviato', domain: 'aviato.com' },
      { name: 'Goliath National Bank', domain: 'gnb.com' },
      { name: 'Albuquerque Crystal', domain: 'abqcrystal.com' },
      { name: 'Los Pollos Hermanos', domain: 'lospolloshermanos.com' },
      { name: 'Madrigal Electromotive', domain: 'madrigal.com' },
      { name: 'Vought International', domain: 'vought.com' },
      { name: 'Abstergo Industries', domain: 'abstergo.com' }
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
        status: statuses[statusIndex]
      });
    }

    return dummyLeads;
  };

  // Sample lead data
  const [leads, setLeads] = useState(generateLeads());

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Get current leads for pagination
  const indexOfLastLead = currentPage * itemsPerPage;
  const indexOfFirstLead = indexOfLastLead - itemsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

  // Calculate total pages
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

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

    const headers = ['Lead ID', 'Business Name', 'Business Email', 'Phone Number', 'Status'];
    const csvData = filteredLeads.map(lead => [
      lead.id,
      `"${lead.businessName.replace(/"/g, '""')}"`, // Escape quotes in business name
      lead.businessEmail,
      lead.phoneNumber,
      lead.status
    ]);

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
      const tableColumn = ['Lead ID', 'Business Name', 'Business Email', 'Phone Number', 'Status'];
      const tableRows = filteredLeads.map(lead => [
        lead.id,
        lead.businessName,
        lead.businessEmail,
        lead.phoneNumber,
        lead.status
      ]);

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
        columnStyles: {
          0: { cellWidth: 25 },  // Lead ID
          1: { cellWidth: 50 },  // Business Name
          2: { cellWidth: 70 },  // Business Email
          3: { cellWidth: 40 },  // Phone Number
          4: { cellWidth: 30 }   // Status
        }
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

      // Prepare data for Excel
      const excelData = filteredLeads.map(lead => ({
        'Lead ID': lead.id,
        'Business Name': lead.businessName,
        'Business Email': lead.businessEmail,
        'Phone Number': lead.phoneNumber,
        'Status': lead.status
      }));

      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const wscols = [
        { wch: 10 }, // Lead ID
        { wch: 25 }, // Business Name
        { wch: 30 }, // Business Email
        { wch: 15 }, // Phone Number
        { wch: 12 }  // Status
      ];
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
                    <div className="col-md-4">
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

                    {/* Rows per page */}
                    <div className="col-md-4">
                      <div className="d-flex align-items-center">
                        <span className="me-2">Rows per page:</span>
                        <select
                          className="form-select form-select-sm"
                          style={{ width: '80px' }}
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

                    {/* Export buttons */}
                    <div className="col-md-4">
                      <div className="d-flex justify-content-end">
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

                <div className="table-responsive">
                  <table className="table table-bordered table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Lead #</th>
                        <th>Date</th>
                        <th>Business Name</th>
                        <th>Contact Card</th>
                        <th>Affiliate/Source</th>
                        <th>Employee</th>
                        <th>Sales Agent</th>
                        <th>Sales Support</th>
                        <th>TaxNow Signup Status</th>
                        <th>Lead Campaign</th>
                        <th>W2 Count</th>
                        <th>Book A Call</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentLeads.length > 0 ? (
                        currentLeads.map(lead => (
                          <tr key={lead.id}>
                            <td>{lead.id}</td>
                            <td>{new Date().toLocaleDateString()}</td>
                            <td>{lead.businessName}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleView(lead)}
                                title="View Contact Card"
                              >
                                <i className="fas fa-address-card"></i>
                              </button>
                            </td>
                            <td>Website</td>
                            <td>John Doe</td>
                            <td>Sarah Smith</td>
                            <td>Mike Johnson</td>
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
                            <td>Email Campaign</td>
                            <td>{Math.floor(Math.random() * 10) + 1}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleBookCall(lead)}
                                title="Book A Call"
                              >
                                <i className="fas fa-calendar-alt"></i>
                              </button>
                            </td>
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
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="13" className="text-center">No leads found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadReport;
