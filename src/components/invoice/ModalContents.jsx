import React, { useState, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import RichTextEditor from './RichTextEditorTiny';

// Common Invoice Details Component
// const InvoiceDetails = ({ invoiceId, invoiceDate, invoiceAmount }) => (
//   <div className="invoice-details mb-3">
//     <h5>Invoice Information</h5>
//     <div className="row">
//       <div className="col-md-6">
//         <p><strong>Invoice ID:</strong> {invoiceId}</p>
//         <p><strong>Date:</strong> {invoiceDate}</p>
//       </div>
//       <div className="col-md-6">
//         <p><strong>Amount:</strong> ${invoiceAmount}</p>
//       </div>
//     </div>
//   </div>
// );

// Custom read-only input for DatePicker
const ReadOnlyDateInput = forwardRef(({ value, onClick, onBlur }, ref) => (
  <input
    className="form-control"
    onClick={onClick}
    value={value}
    onBlur={onBlur}
    readOnly
    ref={ref}
    placeholder="MM/DD/YYYY"
    style={{ cursor: 'pointer', backgroundColor: '#fff' }}
  />
));

// Unpaid Modal Content
export const UnpaidModalContent = ({ modalData }) => (
  <div className="modal-body">
    <h5>Mark Invoice as Unpaid</h5>
    {/* <InvoiceDetails {...modalData} /> */}
    <div className="form-group">
      <label>Reason for Unpaid Status</label>
      <select className="form-select">
        <option value="">Select Reason</option>
        <option value="customer_request">Customer Request</option>
        <option value="payment_failed">Payment Failed</option>
        <option value="other">Other</option>
      </select>
    </div>
    <div className="form-group mt-3">
      <label>Additional Notes</label>
      <textarea className="form-control" rows="3"></textarea>
    </div>
  </div>
);

// Paid Modal Content
export const PaidModalContent = ({ modalData }) => {
  const [paymentDate, setPaymentDate] = useState(null);
  const [paymentClearedDate, setPaymentClearedDate] = useState(null);

  return (
    <div className="modal-body">
      <h5 className="section-title">User Input Section</h5>
      {/* <InvoiceDetails {...modalData} /> */}
      <div className="form-group">
        <label>Payment mode/invoice payment type*</label>
        <select className="form-select">
          <option value="">Select payment mode</option>
          <option value="occams_initiated_eCheck">Occams Initiated - eCheck</option>
          <option value="occams_initiated_ach">Occams Initiated - ACH</option>
          <option value="occams_initiated_wire">Client Initiated - Wire</option>
          <option value="client_initiated_ach">Client Initiated - ACH</option>
          <option value="client_initiated_check_mailed">Client Initiated - Check Mailed</option>
          <option value="credit_card_or_debit_card">Credit Card or Debit Card</option>
        </select>
      </div>

      <div className="form-group mt-3">
        <label>Note:</label>
        <input type="text" className="form-control" />
      </div>

      <div className="row mt-3">
        <div className="col-md-6">
          <label>Payment Date*</label>
          <DatePicker
            selected={paymentDate}
            onChange={date => setPaymentDate(date)}
            dateFormat="MM/dd/yyyy"
            showMonthDropdown
            showYearDropdown
            dropdownMode="scroll"
            minDate={new Date('1900-01-01')}
            //maxDate={new Date()}
            customInput={<ReadOnlyDateInput />}
            placeholderText="MM/DD/YYYY"
          />
        </div>
        <div className="col-md-6">
          <label>Payment Cleared Date*</label>
          <DatePicker
            selected={paymentClearedDate}
            onChange={date => setPaymentClearedDate(date)}
            dateFormat="MM/dd/yyyy"
            showMonthDropdown
            showYearDropdown
            dropdownMode="scroll"
            minDate={new Date('1900-01-01')}
            //maxDate={new Date()}
            customInput={<ReadOnlyDateInput />}
            placeholderText="MM/DD/YYYY"
          />
        </div>
      </div>

      <hr className="mt-4" />
      <h5 className="section-title">Email Review Pane</h5>

      <div className="form-check mb-4 d-flex align-items-center">
        <input
          className="form-check-input me-2"
          type="checkbox"
          id="sendEmailUpdate"
          defaultChecked
        />
        <label className="form-check-label" htmlFor="sendEmailUpdate">
          Send Email Update to Client
        </label>
      </div>

      <div className="d-flex justify-content-center gap-3 mt-4">
        <button className="btn save-btn">Invoice Paid</button>
        <button className="btn cancel-btn">Cancel</button>
      </div>
    </div>
  );
};

// Cancelled Modal Content
export const CancelledModalContent = ({ modalData }) => {
  return (
    <div className="modal-body">
      <h5 className="section-title">Email Review Pane</h5>
      <div className="form-check d-flex align-items-center">
        <input
          className="form-check-input me-2"
          type="checkbox"
          id="sendEmailUpdate"
          defaultChecked
        />
        <label className="form-check-label" htmlFor="sendEmailUpdate">
          Send Email Update to Client
        </label>
      </div>      
      <div className="form-group mt-3">
        <label>To*:</label>
        <input type="text" className="form-control" />
      </div>      
      <div class="row mt-3">
        <div className="col-md-6">
          <label>CC:</label>
          <input type="text" className="form-control" />
        </div>

        <div className="col-md-6">
          <label>Bcc:</label>
          <input type="text" className="form-control"/>
        </div>
      </div>

      <div className="form-group mt-3">
        <label>Subject:*</label>
        <input
          type="text"
          className="form-control"
        />
      </div>

      <div className="form-group mt-3">
        <label>Email Body</label>
        <textarea
          className="form-control"
          rows="6"
        />
        <div className="text-muted mt-1">Use up to 3000 characters</div>
      </div>

      <div className="d-flex justify-content-center gap-3 mt-4">
        <button className="btn save-btn">Partially paid</button>
        <button className="btn cancel-btn">Cancel</button>
      </div>
    </div>
  );
};

// Payment in Process Modal Content
export const PaymentProcessModalContent = ({ modalData }) => {
  return (
    <div className="modal-body">
      <h5 className="section-title">Email Review Pane</h5>
      <div className="form-check d-flex align-items-center">
        <input
          className="form-check-input me-2"
          type="checkbox"
          id="sendEmailUpdate"
          defaultChecked
        />
        <label className="form-check-label" htmlFor="sendEmailUpdate">
          Send Email Update to Client
        </label>
      </div>      
      <div className="form-group mt-3">
        <label>To*:</label>
        <input type="text" className="form-control" />
      </div>      
      <div class="row mt-3">
        <div className="col-md-6">
          <label>CC:</label>
          <input type="text" className="form-control" />
        </div>

        <div className="col-md-6">
          <label>Bcc:</label>
          <input type="text" className="form-control"/>
        </div>
      </div>

      <div className="form-group mt-3">
        <label>Subject:*</label>
        <input
          type="text"
          className="form-control"
        />
      </div>

      <div className="form-group mt-3">
        <label>Email Body</label>
        <textarea
          className="form-control"
          rows="6"
        />
        <div className="text-muted mt-1">Use up to 3000 characters</div>
      </div>

      <div className="d-flex justify-content-center gap-3 mt-4">
        <button className="btn save-btn">Partially paid</button>
        <button className="btn cancel-btn">Cancel</button>
      </div>
    </div>
  );  
}

// Void Modal Content
export const VoidModalContent = ({ modalData }) => {
  return (
    <div className="modal-body">
      <h5 className="section-title">Email Review Pane</h5>
      <div className="form-check d-flex align-items-center">
        <input
          className="form-check-input me-2"
          type="checkbox"
          id="sendEmailUpdate"
          defaultChecked
        />
        <label className="form-check-label" htmlFor="sendEmailUpdate">
          Send Email Update to Client
        </label>
      </div>      
      <div className="form-group mt-3">
        <label>To*:</label>
        <input type="text" className="form-control" />
      </div>      
      <div class="row mt-3">
        <div className="col-md-6">
          <label>CC:</label>
          <input type="text" className="form-control" />
        </div>

        <div className="col-md-6">
          <label>Bcc:</label>
          <input type="text" className="form-control"/>
        </div>
      </div>

      <div className="form-group mt-3">
        <label>Subject:*</label>
        <input
          type="text"
          className="form-control"
        />
      </div>

      <div className="form-group mt-3">
        <label>Email Body</label>
        <textarea
          className="form-control"
          rows="6"
        />
        <div className="text-muted mt-1">Use up to 3000 characters</div>
      </div>

      <div className="d-flex justify-content-center gap-3 mt-4">
        <button className="btn save-btn">Partially paid</button>
        <button className="btn cancel-btn">Cancel</button>
      </div>
    </div>
  );  
}

// Partial Paid Modal Content


export const PartialPaidModalContent = ({ modalData }) => {
  const [rows, setRows] = useState([
    {
      refId: '',
      paymentDate: new Date(),
      clearedDate: new Date(),
      paymentMode: '',
      note: '',
      service: '',
      charge: '',
      received: ''
    }
  ]);

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        refId: '',
        paymentDate: new Date(),
        clearedDate: new Date(),
        paymentMode: '',
        note: '',
        service: '',
        charge: '',
        received: ''
      }
    ]);
  };

  const handleRemoveRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const [sendEmail, setSendEmail] = useState(true);
  const [emailBody, setEmailBody] = useState('<p></p>');

  return (
    <div className="modal-body">
      <h5 className="section-title">User Input Section</h5>

      <div className="table-responsive">
        <table className="table table-bordered table-sm mb-0">
          <thead className="bg-light">
            <tr>
              <th>Reference ID*</th>
              <th>Payment Date*</th>
              <th>Payment Cleared Date*</th>
              <th>Payment Mode*</th>
              <th>Note</th>
              <th>Payment - Service</th>
              <th>Payment - Charge</th>
              <th>Payment Received*</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="8" className="text-center text-muted py-3">
                No payments found for this invoice.
              </td>
            </tr>
          </tbody>
        </table>

        <table className="table table-bordered table-sm mt-3">
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={row.refId}
                    onChange={(e) => handleChange(index, 'refId', e.target.value)}
                  />
                </td>
                <td>
                  <DatePicker
                    selected={row.paymentDate}
                    onChange={(date) => handleChange(index, 'paymentDate', date)}
                    dateFormat="MM/dd/yyyy"
                    customInput={<ReadOnlyDateInput />}
                  />
                </td>
                <td>
                  <DatePicker
                    selected={row.clearedDate}
                    onChange={(date) => handleChange(index, 'clearedDate', date)}
                    dateFormat="MM/dd/yyyy"
                    customInput={<ReadOnlyDateInput />}
                  />
                </td>
                <td>
                  <select
                    className="form-select"
                    value={row.paymentMode}
                    onChange={(e) => handleChange(index, 'paymentMode', e.target.value)}
                  >
                    <option value="">Select payment mode</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={row.note}
                    onChange={(e) => handleChange(index, 'note', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={row.service}
                    onChange={(e) => handleChange(index, 'service', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={row.charge}
                    onChange={(e) => handleChange(index, 'charge', e.target.value)}
                  />
                </td>
                <td className="d-flex align-items-center">
                  <input
                    type="number"
                    className="form-control me-2"
                    value={row.received}
                    onChange={(e) => handleChange(index, 'received', e.target.value)}
                  />
                  {rows.length > 1 && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRemoveRow(index)}
                    >
                      &#10006;
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-end mb-3">
        <a href="javascript:void(0);" class="px-3 py-2 column-selector-btn" 
          onClick={handleAddRow}
        >
          <i class="fa fa-plus-circle" aria-hidden="true"></i>
          Add Payment
        </a>
      </div>

      <div className="bg-body-secondary p-3 rounded mb-3">
        <div className="d-flex justify-content-between">
          <div><strong>Total Partial Payment Amount</strong></div>
          <div>$0.00</div>
        </div>
        <div className="d-flex justify-content-between mt-2">
          <div><strong>Overdue Amount</strong> <i className="bi bi-info-circle-fill text-primary"></i></div>
          <div>${modalData?.invoiceAmount || '0.00'}</div>
        </div>
      </div>

      <h5 className="section-title">Email Review Pane</h5>

      <div className="form-check d-flex align-items-center mb-3">
        <input
          type="checkbox"
          className="form-check-input me-2"
          id="sendEmailUpdate"
          checked={sendEmail}
          onChange={(e) => setSendEmail(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="sendEmailUpdate">
          Send Email Update to Client
        </label>
      </div>

      <div className="row mt-3">
        <div className="col-md-4">
          <label>To:</label>
          <input type="text" className="form-control" />
        </div>
        <div className="col-md-4">
          <label>CC:</label>
          <input type="text" className="form-control" />
        </div>
        <div className="col-md-4">
          <label>Bcc:</label>
          <input type="text" className="form-control" />
        </div>
      </div>

      <div className="form-group mt-3">
        <label>Subject:*</label>
        <input type="text" className="form-control" />
      </div>

      <div className="form-group mt-3">
        <label>Email Body</label>
        <RichTextEditor value={emailBody} onChange={setEmailBody} />
        <div className="text-muted mt-1">Use up to 3000 characters</div>
      </div>

      <div className="d-flex justify-content-center gap-3 mt-4">
        <button className="btn save-btn">Partially paid</button>
        <button className="btn cancel-btn">Cancel</button>
      </div>
    </div>
  );
};

// Reminder Modal Content
export const ReminderModalContent = ({ modalData }) => (
  <div className="modal-body">
    <h5 class="section-title">Send Payment Reminder</h5>
    {/* <InvoiceDetails {...modalData} /> */}
    <div className="form-group">
      <label>Reminder Type</label>
      <select className="form-select">
        <option value="">Select Reminder Type</option>
        <option value="friendly">Friendly Reminder</option>
        <option value="urgent">Urgent Payment Required</option>
        <option value="final">Final Notice</option>
      </select>
    </div>
    <div className="form-group mt-3">
      <label>Custom Message</label>
      <textarea className="form-control" rows="3" placeholder="Enter custom message (optional)"></textarea>
    </div>
  </div>
);

// Payment Plan Modal Content
export const PaymentPlanModalContent = ({ modalData }) => (
  <div className="modal-body">
    <h5 class="section-title">Create Payment Plan</h5>
    {/* <InvoiceDetails {...modalData} /> */}
    <div className="form-group">
      <label>Number of Installments</label>
      <select className="form-select">
        <option value="2">2 Installments</option>
        <option value="3">3 Installments</option>
        <option value="4">4 Installments</option>
        <option value="6">6 Installments</option>
      </select>
    </div>
    <div className="form-group mt-3">
      <label>Payment Frequency</label>
      <select className="form-select">
        <option value="weekly">Weekly</option>
        <option value="biweekly">Bi-weekly</option>
        <option value="monthly">Monthly</option>
      </select>
    </div>
  </div>
);

// Draft Modal Content
export const DraftModalContent = ({ modalData }) => (
  <div className="modal-body">
    <h5 class="section-title">Save as Draft</h5>
    <div className="confirmation-message mt-3">
      <p className="text-muted">
        Are you sure you want to save this invoice as a draft?
      </p>
    </div>
  </div>
);

// Pause Invoice Reminder Modal Content
export const PauseReminderModalContent = ({ modalData }) => (
  <div className="modal-body">
    <h5 class="section-title">Pause Invoice Reminder</h5>
    <div className="confirmation-message mt-3">
      <p className="text-muted">
        Are you sure you want to pause automatic reminders for this invoice?
      </p>
    </div>
  </div>
);

// Default Modal Content
export const DefaultModalContent = ({ modalData, actionText }) => (
  <div className="modal-body">
    <h5 class="section-title">{actionText}</h5>
    {/* <InvoiceDetails {...modalData} /> */}
    <div className="confirmation-message mt-3">
      <p className="text-muted">
        Are you sure you want to {actionText.toLowerCase()} this invoice?
      </p>
    </div>
  </div>
);

// Main Modal Content Component
const ModalContent = ({ modalData, actionsMap }) => {
  const { actionType } = modalData;
  const actionText = actionsMap[actionType]?.text || actionType;
  const sizeClass = modalData.actionType === '17' ? 'modal-xl' : 'modal-md';

  switch (actionType) {
    case '1':
      return <UnpaidModalContent modalData={modalData} />;
    case '2':
      return <PaidModalContent modalData={modalData} />;
    case '3':
      return <CancelledModalContent modalData={modalData} />;
    case '4':
      return <DraftModalContent modalData={modalData} />;
    case '5':
      return <ReminderModalContent modalData={modalData} />;
    case '6':
      return <PaymentProcessModalContent modalData={modalData} />;
    case '14':
      return <VoidModalContent modalData={modalData} />;
    case '17':
      return <PartialPaidModalContent modalData={modalData} />;
    case '19':
      return <PaymentPlanModalContent modalData={modalData} />;
    case 'cancel_auto_inv_reminder':
      return <PauseReminderModalContent modalData={modalData} />;
    default:
      return <DefaultModalContent modalData={modalData} actionText={actionText} />;
  }
};

export default ModalContent; 