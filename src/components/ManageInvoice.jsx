import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import './common/CommonStyles.css';
import SortableTableHeader from './common/SortableTableHeader';
import { sortArrayByKey } from '../utils/sortUtils';

const ManageInvoice = () => {
  const [invoices, setInvoices] = useState([
    { id: 'INV-001', client: 'Acme Corp', amount: 1250.00, date: '2023-05-15', status: 'Paid' },
    { id: 'INV-002', client: 'Globex Inc', amount: 3450.75, date: '2023-05-20', status: 'Pending' },
    { id: 'INV-003', client: 'Stark Industries', amount: 7800.50, date: '2023-05-25', status: 'Overdue' },
    { id: 'INV-004', client: 'Wayne Enterprises', amount: 5200.25, date: '2023-06-01', status: 'Paid' },
    { id: 'INV-005', client: 'Umbrella Corp', amount: 1800.00, date: '2023-06-05', status: 'Pending' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    document.title = "Manage Invoices - Occams Portal"; // Set title for page
  }, []);

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
  };

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => {
    return invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
           invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Sort the filtered invoices
  const sortedInvoices = sortArrayByKey(filteredInvoices, sortField, sortDirection);

  // Get current invoices for pagination
  const indexOfLastInvoice = currentPage * itemsPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - itemsPerPage;
  const currentInvoices = sortedInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);

  // Calculate total pages
  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);

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
    // Confirm export with user if there are many invoices
    if (sortedInvoices.length > 100) {
      if (!confirm(`You are about to export ${sortedInvoices.length} invoices. This may take a moment. Continue?`)) {
        return;
      }
    }

    const headers = ['Invoice #', 'Client', 'Amount', 'Date', 'Status'];
    const csvData = sortedInvoices.map(invoice => [
      invoice.id,
      `"${invoice.client.replace(/"/g, '""')}"`, // Escape quotes in client name
      invoice.amount.toFixed(2),
      invoice.date,
      invoice.status
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle export to PDF
  const exportToPDF = () => {
    try {
      // Confirm export with user if there are many invoices
      if (sortedInvoices.length > 100) {
        if (!confirm(`You are about to export ${sortedInvoices.length} invoices to PDF. This may take a moment and result in a large file. Continue?`)) {
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
      doc.text('Invoice Report', 15, 15);

      // Add generation date and search info
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 22);
      if (searchTerm) {
        doc.text(`Search term: "${searchTerm}"`, 15, 27);
      }

      // Create table data
      const tableColumn = ['Invoice #', 'Client', 'Amount', 'Date', 'Status'];
      const tableRows = sortedInvoices.map(invoice => [
        invoice.id,
        invoice.client,
        `$${invoice.amount.toFixed(2)}`,
        invoice.date,
        invoice.status
      ]);

      // Add table to document using the imported autoTable function
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: searchTerm ? 30 : 25,
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
          0: { cellWidth: 25 },  // Invoice #
          1: { cellWidth: 50 },  // Client
          2: { cellWidth: 25 },  // Amount
          3: { cellWidth: 25 },  // Date
          4: { cellWidth: 25 }   // Status
        }
      });

      // Save the PDF with date in filename
      doc.save(`invoices_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  // Handle export to Excel
  const exportToExcel = () => {
    try {
      // Confirm export with user if there are many invoices
      if (sortedInvoices.length > 100) {
        if (!confirm(`You are about to export ${sortedInvoices.length} invoices to Excel. This may take a moment. Continue?`)) {
          return;
        }
      }

      // Prepare data for Excel
      const excelData = sortedInvoices.map(invoice => ({
        'Invoice #': invoice.id,
        'Client': invoice.client,
        'Amount': `$${invoice.amount.toFixed(2)}`,
        'Date': invoice.date,
        'Status': invoice.status
      }));

      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const wscols = [
        { wch: 15 }, // Invoice #
        { wch: 25 }, // Client
        { wch: 15 }, // Amount
        { wch: 15 }, // Date
        { wch: 15 }  // Status
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
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');

      // Add metadata
      workbook.Props = {
        Title: "Invoice Report",
        Subject: "Invoice Data",
        Author: "Occams Portal",
        CreatedDate: new Date()
      };

      // Generate Excel file and trigger download with date in filename
      XLSX.writeFile(workbook, `invoices_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('Excel generation error:', error);
      alert('Error generating Excel file: ' + error.message);
    }
  };

  // Function to get status badge class
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Paid':
        return 'bg-success';
      case 'Pending':
        return 'bg-warning';
      case 'Overdue':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  // Handle view invoice details
  const handleView = (invoice) => {
    Swal.fire({
      title: 'Invoice Details',
      html: `
        <div class="text-start">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">${invoice.client}</h5>
            <span class="badge ${getStatusBadgeClass(invoice.status)}">${invoice.status}</span>
          </div>

          <table class="table table-bordered">
            <tr>
              <th>Invoice #</th>
              <td>${invoice.id}</td>
            </tr>
            <tr>
              <th>Client</th>
              <td>${invoice.client}</td>
            </tr>
            <tr>
              <th>Amount</th>
              <td>$${invoice.amount.toFixed(2)}</td>
            </tr>
            <tr>
              <th>Date</th>
              <td>${invoice.date}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>${invoice.status}</td>
            </tr>
          </table>
        </div>
      `,
      confirmButtonText: 'Close'
    });
  };

  // Handle edit invoice
  const handleEdit = (invoice) => {
    Swal.fire({
      title: 'Edit Invoice',
      html: `
        <div class="text-start">
          <div class="form-group mb-3">
            <label class="small">Invoice #:</label>
            <input type="text" id="invoice-id" class="form-control" value="${invoice.id}" readonly>
          </div>
          <div class="form-group mb-3">
            <label class="small">Client:</label>
            <input type="text" id="invoice-client" class="form-control" value="${invoice.client}">
          </div>
          <div class="form-group mb-3">
            <label class="small">Amount:</label>
            <input type="number" id="invoice-amount" class="form-control" value="${invoice.amount}" step="0.01" min="0">
          </div>
          <div class="form-group mb-3">
            <label class="small">Date:</label>
            <input type="date" id="invoice-date" class="form-control" value="${invoice.date}">
          </div>
          <div class="form-group mb-3">
            <label class="small">Status:</label>
            <select id="invoice-status" class="form-select">
              <option value="Paid" ${invoice.status === 'Paid' ? 'selected' : ''}>Paid</option>
              <option value="Pending" ${invoice.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Overdue" ${invoice.status === 'Overdue' ? 'selected' : ''}>Overdue</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const client = document.getElementById('invoice-client').value;
        const amount = document.getElementById('invoice-amount').value;
        const date = document.getElementById('invoice-date').value;
        const status = document.getElementById('invoice-status').value;

        if (!client || !amount || !date || !status) {
          Swal.showValidationMessage('Please fill in all fields');
          return false;
        }

        return {
          id: invoice.id,
          client,
          amount: parseFloat(amount),
          date,
          status
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Update the invoice in the state
        const updatedInvoices = invoices.map(inv =>
          inv.id === invoice.id ? result.value : inv
        );
        setInvoices(updatedInvoices);

        Swal.fire('Updated!', `Invoice ${invoice.id} has been updated.`, 'success');
      }
    });
  };

  // Handle download invoice
  const handleDownload = (invoice) => {
    Swal.fire({
      title: 'Download Invoice',
      text: `Select a format to download invoice ${invoice.id}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'PDF',
      cancelButtonText: 'Cancel',
      showDenyButton: true,
      denyButtonText: 'Excel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Generate PDF for single invoice
        try {
          const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });

          // Add title and invoice info
          doc.setFontSize(20);
          doc.text('INVOICE', 105, 20, { align: 'center' });

          doc.setFontSize(12);
          doc.text(`Invoice #: ${invoice.id}`, 20, 40);
          doc.text(`Date: ${invoice.date}`, 20, 50);
          doc.text(`Client: ${invoice.client}`, 20, 60);
          doc.text(`Status: ${invoice.status}`, 20, 70);

          // Add amount
          doc.setFontSize(14);
          doc.text(`Amount Due: $${invoice.amount.toFixed(2)}`, 150, 50, { align: 'right' });

          // Add payment details
          doc.setFontSize(12);
          doc.text('Payment Details', 20, 90);
          doc.line(20, 92, 190, 92);

          // Save the PDF
          doc.save(`invoice_${invoice.id}.pdf`);

          Swal.fire('Downloaded!', `Invoice ${invoice.id} has been downloaded as PDF.`, 'success');
        } catch (error) {
          console.error('PDF generation error:', error);
          Swal.fire('Error', 'Failed to generate PDF. Please try again.', 'error');
        }
      } else if (result.isDenied) {
        // Generate Excel for single invoice
        try {
          const worksheet = XLSX.utils.json_to_sheet([{
            'Invoice #': invoice.id,
            'Client': invoice.client,
            'Amount': `$${invoice.amount.toFixed(2)}`,
            'Date': invoice.date,
            'Status': invoice.status
          }]);

          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoice');

          XLSX.writeFile(workbook, `invoice_${invoice.id}.xlsx`);

          Swal.fire('Downloaded!', `Invoice ${invoice.id} has been downloaded as Excel.`, 'success');
        } catch (error) {
          console.error('Excel generation error:', error);
          Swal.fire('Error', 'Failed to generate Excel file. Please try again.', 'error');
        }
      }
    });
  };

  // Handle delete invoice
  const handleDelete = (invoice) => {
    Swal.fire({
      title: 'Delete Invoice',
      text: `Are you sure you want to delete invoice ${invoice.id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        // Remove the invoice from the state
        const updatedInvoices = invoices.filter(inv => inv.id !== invoice.id);
        setInvoices(updatedInvoices);

        Swal.fire('Deleted!', `Invoice ${invoice.id} has been deleted.`, 'success');
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
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <div className="title_img">
                      <img src="./assets/images/Knowledge_Ceter_White.svg" className="page-title-img" alt="" />
                      <h4 className="text-white">Manage Invoices</h4>
                    </div>

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

                    {/* Rows per page and filter */}
                    <div className="col-md-4">
                      <div className="d-flex align-items-center">
                        <span className="me-2">Rows per page:</span>
                        <select
                          className="form-select form-select-sm me-3"
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

                {/* Invoices table */}
                <div className="table-responsive">
                  <table className="table table-bordered table-hover table-striped">
                    <thead>
                      <tr>
                        <SortableTableHeader
                          label="Invoice #"
                          field="id"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableTableHeader
                          label="Client"
                          field="client"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableTableHeader
                          label="Amount"
                          field="amount"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableTableHeader
                          label="Date"
                          field="date"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableTableHeader
                          label="Status"
                          field="status"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentInvoices.length > 0 ? (
                        currentInvoices.map(invoice => (
                          <tr key={invoice.id}>
                            <td>{invoice.id}</td>
                            <td>{invoice.client}</td>
                            <td>${invoice.amount.toFixed(2)}</td>
                            <td>{invoice.date}</td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(invoice.status)}`}>
                                {invoice.status}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex justify-content-center" style={{ gap: '2px' }}>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  title="View Invoice"
                                  onClick={() => handleView(invoice)}
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  title="Edit Invoice"
                                  onClick={() => handleEdit(invoice)}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-info"
                                  title="Download Invoice"
                                  onClick={() => handleDownload(invoice)}
                                >
                                  <i className="fas fa-download"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  title="Delete Invoice"
                                  onClick={() => handleDelete(invoice)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center">No invoices found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="row mt-3">
                  <div className="col-md-6">
                    <p>Showing {indexOfFirstInvoice + 1} to {Math.min(indexOfLastInvoice, sortedInvoices.length)} of {sortedInvoices.length} invoices (filtered from {invoices.length} total)</p>
                  </div>
                  <div className="col-md-6">
                    <nav aria-label="Invoice pagination">
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

export default ManageInvoice;
