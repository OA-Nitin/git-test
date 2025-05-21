import React, { useEffect, useState } from 'react';
import './common/ReportStyle.css';

const CreateInvoice = () => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: 'INV-006',
    client: '',
    clientEmail: '',
    clientAddress: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [
      { id: 1, description: '', quantity: 1, rate: 0, amount: 0 }
    ],
    subtotal: 0,
    taxRate: 10,
    taxAmount: 0,
    total: 0,
    notes: ''
  });

  // Calculate due date 30 days from issue date
  useEffect(() => {
    const issueDate = new Date(invoiceData.issueDate);
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);
    setInvoiceData(prev => ({
      ...prev,
      dueDate: dueDate.toISOString().split('T')[0]
    }));
  }, [invoiceData.issueDate]);

  useEffect(() => {
    document.title = "Create Invoice - Occams Portal"; // Set title for page
  }, []);

  // Calculate item amount when quantity or rate changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceData.items];

    if (field === 'quantity' || field === 'rate') {
      updatedItems[index][field] = parseFloat(value) || 0;
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    } else {
      updatedItems[index][field] = value;
    }

    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems
    }));

    // Recalculate totals
    calculateTotals(updatedItems);
  };

  // Add new item row
  const addItem = () => {
    const newItem = {
      id: invoiceData.items.length + 1,
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };

    const updatedItems = [...invoiceData.items, newItem];
    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  // Remove item row
  const removeItem = (index) => {
    if (invoiceData.items.length === 1) return; // Keep at least one item

    const updatedItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems
    }));

    // Recalculate totals
    calculateTotals(updatedItems);
  };

  // Calculate subtotal, tax and total
  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * invoiceData.taxRate) / 100;
    const total = subtotal + taxAmount;

    setInvoiceData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total
    }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'taxRate') {
      const newTaxRate = parseFloat(value) || 0;
      const newTaxAmount = (invoiceData.subtotal * newTaxRate) / 100;
      const newTotal = invoiceData.subtotal + newTaxAmount;

      setInvoiceData(prev => ({
        ...prev,
        taxRate: newTaxRate,
        taxAmount: newTaxAmount,
        total: newTotal
      }));
    } else {
      setInvoiceData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the invoice data to your backend
    console.log('Invoice data:', invoiceData);
    alert('Invoice created successfully!');
    // Redirect to manage invoices page
    window.location.href = '/finance/invoices';
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
                    <img src="./assets/images/Knowledge_Ceter_White.svg" className="page-title-img" alt="" />
                    <h4 className="text-white">Create Invoice</h4>
                  </div>
                </div>
              </div>
              <div className="white_card_body">
                <form onSubmit={handleSubmit}>
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Invoice Number</label>
                        <input
                          type="text"
                          className="form-control"
                          name="invoiceNumber"
                          value={invoiceData.invoiceNumber}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Issue Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="issueDate"
                          value={invoiceData.issueDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Due Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="dueDate"
                          value={invoiceData.dueDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Client Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="client"
                          value={invoiceData.client}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Client Email</label>
                        <input
                          type="email"
                          className="form-control"
                          name="clientEmail"
                          value={invoiceData.clientEmail}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Client Address</label>
                        <textarea
                          className="form-control"
                          name="clientAddress"
                          value={invoiceData.clientAddress}
                          onChange={handleInputChange}
                          rows="3"
                          required
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="table-responsive mb-4">
                    <table className="table table-bordered table-hover table-striped">
                      <thead>
                        <tr>
                          <th style={{ width: '5%' }}>#</th>
                          <th style={{ width: '45%' }}>Description</th>
                          <th style={{ width: '15%' }}>Quantity</th>
                          <th style={{ width: '15%' }}>Rate</th>
                          <th style={{ width: '15%' }}>Amount</th>
                          <th style={{ width: '5%' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceData.items.map((item, index) => (
                          <tr key={item.id}>
                            <td className="text-center">{index + 1}</td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={item.description}
                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                min="1"
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={item.rate}
                                onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                min="0"
                                step="0.01"
                                required
                              />
                            </td>
                            <td>
                              <div className="input-group input-group-sm">
                                <span className="input-group-text">$</span>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={item.amount.toFixed(2)}
                                  readOnly
                                />
                              </div>
                            </td>
                            <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeItem(index)}
                                disabled={invoiceData.items.length === 1}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mb-4">
                    <button type="button" className="btn btn-sm export-btn" onClick={addItem}>
                      <i className="fas fa-plus me-1"></i> Add Item
                    </button>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Notes</label>
                        <textarea
                          className="form-control"
                          name="notes"
                          value={invoiceData.notes}
                          onChange={handleInputChange}
                          rows="4"
                          placeholder="Payment terms, delivery information, etc."
                        ></textarea>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-body">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Subtotal:</span>
                            <span>${invoiceData.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span>Tax Rate:</span>
                            <div style={{ width: '100px' }}>
                              <div className="input-group input-group-sm">
                                <input
                                  type="number"
                                  className="form-control"
                                  name="taxRate"
                                  value={invoiceData.taxRate}
                                  onChange={handleInputChange}
                                  min="0"
                                  max="100"
                                />
                                <span className="input-group-text">%</span>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Tax Amount:</span>
                            <span>${invoiceData.taxAmount.toFixed(2)}</span>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between">
                            <h5>Total:</h5>
                            <h5>${invoiceData.total.toFixed(2)}</h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end">
                    <a href="./finance/invoices" className="btn btn-sm btn-secondary me-2">Cancel</a>
                    <button type="submit" className="btn btn-sm export-btn">
                      <i className="fas fa-save me-1"></i> Create Invoice
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
