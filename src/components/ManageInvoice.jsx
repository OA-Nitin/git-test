import React, { useEffect, useState } from 'react';
import './CommonTableStyles.css';

const ManageInvoice = () => {
  const [invoices, setInvoices] = useState([
    { id: 'INV-001', client: 'Acme Corp', amount: 1250.00, date: '2023-05-15', status: 'Paid' },
    { id: 'INV-002', client: 'Globex Inc', amount: 3450.75, date: '2023-05-20', status: 'Pending' },
    { id: 'INV-003', client: 'Stark Industries', amount: 7800.50, date: '2023-05-25', status: 'Overdue' },
    { id: 'INV-004', client: 'Wayne Enterprises', amount: 5200.25, date: '2023-06-01', status: 'Paid' },
    { id: 'INV-005', client: 'Umbrella Corp', amount: 1800.00, date: '2023-06-05', status: 'Pending' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    document.title = "Manage Invoices - Occams Portal"; // Set title for page
  }, []);

  // Filter invoices based on search term and status
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? invoice.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

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
                    <h4 className="text-white">Manage Invoices</h4>
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
                          placeholder="Search invoices..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn search-btn" type="button">
                          <i className="fas fa-search"></i>
                        </button>
                      </div>
                    </div>

                    {/* Filter dropdown */}
                    <div className="col-md-4">
                      <div className="d-flex align-items-center">
                        <label className="me-2 mb-0">Status:</label>
                        <select
                          className="form-select form-select-sm"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value="">All Statuses</option>
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </div>
                    </div>

                    {/* Create invoice button */}
                    <div className="col-md-4">
                      <div className="d-flex justify-content-end">
                        <a href="/finance/create-invoice" className="btn btn-sm export-btn">
                          <i className="fas fa-plus me-1"></i> Create New Invoice
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoices table */}
                <div className="table-responsive">
                  <table className="table table-bordered table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Client</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.length > 0 ? (
                        filteredInvoices.map(invoice => (
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
                                <button className="btn btn-sm btn-outline-primary" title="View">
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button className="btn btn-sm btn-outline-success" title="Edit">
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button className="btn btn-sm btn-outline-info" title="Download">
                                  <i className="fas fa-download"></i>
                                </button>
                                <button className="btn btn-sm btn-outline-danger" title="Delete">
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
                    <p>Showing {filteredInvoices.length} of {invoices.length} invoices</p>
                  </div>
                  <div className="col-md-6">
                    <nav aria-label="Invoice pagination">
                      <ul className="pagination justify-content-end">
                        <li className="page-item disabled">
                          <button className="page-link" disabled>Previous</button>
                        </li>
                        <li className="page-item active">
                          <button className="page-link">1</button>
                        </li>
                        <li className="page-item">
                          <button className="page-link">2</button>
                        </li>
                        <li className="page-item">
                          <button className="page-link">3</button>
                        </li>
                        <li className="page-item">
                          <button className="page-link">Next</button>
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
