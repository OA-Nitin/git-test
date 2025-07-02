import React from 'react';

const InvoicesTab = ({ invoices, setInvoices, loading, error, invoiceLoading }) => {
  return (
    <div className="mb-4 left-section-container">
      {loading ? (
        <div className="text-center my-5">
          <svg class="loader" viewBox="0 0 200 100">
            <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#007bff" />
            <stop offset="100%" stop-color="#ff6600" />
            </linearGradient>
            </defs>
            <path class="infinity-shape"
                  d="M30,50
                    C30,20 70,20 100,50
                    C130,80 170,80 170,50
                    C170,20 130,20 100,50
                    C70,80 30,80 30,50"
                />
          </svg>
          <p style={{color: '#000'}}>Processing data...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
          <button className="btn btn-sm btn-outline-danger ms-2" onClick={fetchInvoiceData}>Retry</button>
        </div>
      ) : invoiceLoading ?(
        <div className="text-center my-5">
          <svg class="loader" viewBox="0 0 200 100">
            <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#007bff" />
            <stop offset="100%" stop-color="#ff6600" />
            </linearGradient>
            </defs>
            <path class="infinity-shape"
                  d="M30,50
                    C30,20 70,20 100,50
                    C130,80 170,80 170,50
                    C170,20 130,20 100,50
                    C70,80 30,80 30,50"
                />
          </svg>
          <p style={{color: '#000'}}>Processing data...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center p-4">
          <p>No invoices found for this project.</p>
        </div>
      ) : (
        invoices.map((invoice, index) => (
          <div className="contact_tab_data" key={invoice.id || `invoice-${index}`}>
            <div className="row custom_opp_tab">
              <div className="col-sm-12">
                <div className="custom_opp_tab_header">
                  <h5>
                    <a href={invoice.invoice_url} target="_blank" data-invoiceid={invoice.id}>
                      Invoice {invoice.customer_invoice_no || `ERC-${invoice.customer_invoice_no}`}</a> -
                    <span className={`status ${invoice.invoice_status_class}`} style={{marginLeft: '5px'}}>
                      {invoice.invoice_status}
                    </span>
                  </h5>
                  <div className="opp_edit_dlt_btn projects-iris">
                    {/* Condition to show dropdown if invoice.status is not 2, 3, or 6 */}
                      {invoice.status != 2 && invoice.status != 3 && invoice.status != 6 ? (
                        <select className="react-select__control" name="invoiceActions" value={invoiceActions[invoice.id] || ''} onChange={(e) => handleInvoiceActionChange(e, invoice.id)}>
                          <option value="">Action</option>
                            {/* Conditionally render options based on invoice status */}
                              {invoice.status == 1 || invoice.status == 5 ? (
                                <>
                                  <option
                                    value="2"
                                    data-id={invoice.id}
                                    invoice-type={invoice.invoice_type}
                                    invoice-date={invoice.invoice_date}
                                    invoice-amount={invoice.total_amount}
                                  >
                                    Paid
                                  </option>
                                  <option
                                    value="3"
                                    data-id={invoice.id}
                                  >
                                    Void
                                  </option>
                                  <option
                                    value="6"
                                    data-id={invoice.id}
                                    invoice-type={invoice.invoice_type}
                                    invoice-date={invoice.invoice_date}
                                    invoice-amount={invoice.total_amount}
                                  >
                                    Payment in process
                                  </option>
                                  <option
                                    value="17"
                                    data-id={invoice.id}
                                    invoice-type={invoice.invoice_type}
                                    invoice-date={invoice.invoice_date}
                                    invoice-amount={invoice.total_amount}
                                  >
                                    Partially paid
                                  </option>
                                  <option
                                    value="share_invoice_link"
                                    data-id={invoice.id}
                                    invoice-type={invoice.invoice_type}
                                    invoice-date={invoice.invoice_date}
                                    invoice-amount={invoice.total_amount}
                                    invoice-url={invoice.invoice_url}
                                  >
                                    Share Invoice link
                                  </option>
                                </>
                              ) : null}

                              {/* Condition for status 17 (Partially paid) */}
                              {invoice.status == 17 ? (
                                <>
                                  <option
                                    value="17"
                                    data-id={invoice.id}
                                    invoice-type={invoice.invoice_type}
                                    invoice-date={invoice.invoice_date}
                                    invoice-amount={invoice.total_amount}
                                  >
                                    Partially paid
                                  </option>
                                </>
                              ) : null}

                      </select>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="col-md-8 text-left">
                <div className="lead_des">
                  <p><b>Invoice Amount:</b> ${invoice.total_amount}</p>
                  <p><b>Invoice Sent Date:</b> {invoice.invoice_date}</p>
                  <p><b>Invoice Due Date:</b> {invoice.due_date}</p>
                  <p><b>Service Name:</b> {invoice.product_names}</p>
                  <p><b>Created By: </b> {invoice.created_user}</p>
                </div>
              </div>

              <div className="col-md-4">
                <div className="lead_des">
                  <p><b>Payment Date:</b> {invoice.formatted_payment_date || 'N/A'}</p>
                  <p><b>Payment Cleared Date:</b> {invoice.formatted_payment_cleared_date || 'N/A'}</p>
                  <p><b>Payment Mode:</b> {invoice.payment_mode_string || 'N/A'}</p>
                </div>
              </div>

              {invoice.status == 17 || (invoice.status == 2 && invoice.payment_count > 1) ? (
                <a className="expand_pp_div" data-bs-toggle="collapse" href={`#invoice_pp_${invoice.id}`}
                  aria-expanded="false" aria-controls={`invoice_pp_${invoice.id}`}>
                  Payment History
                  <i className="fa-solid fa-chevron-down ms-1" style={{fontWeight: 700}}></i>
                </a>
              ) : null}

              <div className="collapse" id={`invoice_pp_${invoice.id}`}>
                <div className="card card-body" style={{ maxWidth: '100%', padding: '10px' }}>
                  <div className="row">
                    <div className="table-responsive view-partially">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Reference ID</th>
                            <th>Payment Date</th>
                            <th>Cleared Date</th>
                            <th>Payment Mode</th>
                            <th>Note</th>
                            <th>Payment Received</th>
                          </tr>
                        </thead>
                        <tbody>
                        {invoice.payment_history && invoice.payment_history.formatted_payment_history && invoice.payment_history.formatted_payment_history.length > 0 ? (
                            invoice.payment_history.formatted_payment_history.map((payment, idx) => (
                              <tr className="ppamt" key={`payment-${invoice.id}-${idx}`}>
                                <td>{payment.payment_id || '-'}</td>
                                <td>{payment.payment_date || '-'}</td>
                                <td>{payment.payment_cleared_date || '-'}</td>
                                <td>{payment.payment_mode || '-'}</td>
                                <td>{payment.payment_note || ''}</td>
                                <td className="ramt">${payment.received_amt || '0.00'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="text-center">No payment history available</td>
                            </tr>
                          )}

                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="row m-0">
                    <div className="total-payment-invoice">
                      <h4>Total Partial Payment Amount</h4>
                      <p >${invoice.total_received || '0.00'}</p>
                    </div>
                    <div className="total-payment-invoice">
                      <h4>Overdue Amount</h4>
                      <p >${invoice.overdue_amount || '0.00'}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default InvoicesTab; 