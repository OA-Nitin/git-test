import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { handleCancelInvoiceSave } from '../invoiceActionHandlers';
import { cancelInvoiceSchema } from '../Helpers/validationLibrary/InvoiceValidator';
import { useInvoiceValidation } from '../Helpers/validationLibrary/useInvoiceValidation';
import { getCurrentUserInvoice, ENDPOINTS, PAYMENT_MODES } from '../invoice-settings';

import EmailReviewPane from '../Helpers/EmailReviewPane';
import ReadOnlyDateInput from '../Helpers/ReadOnlyDateInput';

const CancelledModalContent = ({ modalData }) => {
  const [inputRows, setInputRows] = useState([{
    paymentDate: null,
    clearedDate: null,
    paymentMode: '',
    note: '',
  }]);

  const [sendEmail, setSendEmail] = useState(true);
  const [emailTo, setEmailTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('<p></p>');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formHasErrors, setFormHasErrors] = useState(false);

  const { errors, setErrors, validateAllRows, handleInputChange } = useInvoiceValidation(
    cancelInvoiceSchema, inputRows, setInputRows
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(ENDPOINTS.GET_INVOICE_ACTION, {
          action_type: '3',
          invoiceid: modalData?.invoiceId,
          invoiceAmount: modalData?.invoiceAmount,
        });
        const data = response.data || {};
        setEmailTo(data.user_email || '');
        setCc(data.cc_email || '');
        setBcc(data.bcc_email || '');
        setSubject(data.subject || '');
        setEmailBody(data.main_content || '<p></p>');
      } catch (err) {
        console.error('[CancelModal] Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    if (modalData?.invoiceId && modalData?.invoiceAmount) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [modalData?.invoiceId, modalData?.invoiceAmount]);

  const formatDateToDMY = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return '';
    const d = new Date(date);
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const handleSubmit = async () => {
    const isValid = await validateAllRows();
    if (!isValid) {
      setFormHasErrors(true);
      return;
    }

    setFormHasErrors(false);
    setSubmitting(true);

    const user = getCurrentUserInvoice();
    const row = inputRows[0];

    const params = {
      action_type: 'cancel',
      invoiceid: modalData?.invoiceId,
      manual_payment_mode: row.paymentMode,
      payment_mode_note: row.note || row.paymentMode,
      payment_date: formatDateToDMY(row.paymentDate),
      cleared_date: formatDateToDMY(row.clearedDate),
      send_email_update_to_client: sendEmail,
      email_update_note: 'Invoice has been marked as cancelled.',
      user_email: emailTo,
      cc: cc,
      bcc: bcc,
      subject: subject,
      message: emailBody,
      user_id: user?.id || "",
    };

    try {
      const res = await handleCancelInvoiceSave(params);
      if (res?.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Cancelled',
          text: res.message || 'Invoice cancelled successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error(res?.message || 'Cancel failed.');
      }
    } catch (error) {
      Swal.fire('Error', error.message || 'Something went wrong.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-body text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading invoice details...</p>
      </div>
    );
  }

  return (
    <div className="">
      <h5 className="section-title">Cancel Invoice</h5>

      {/* Payment Mode */}
      <div className="form-group">
        <label>Payment Mode*</label>
        <select
          className={`form-select ${errors[0]?.paymentMode ? 'is-invalid' : ''}`}
          value={inputRows[0].paymentMode}
          onChange={(e) => handleInputChange(0, 'paymentMode', e.target.value)}
        >
          <option value="">Select payment mode</option>
          {PAYMENT_MODES.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
        <div className="invalid-feedback d-block">{errors[0]?.paymentMode || '\u00A0'}</div>
      </div>

      {/* Note */}
      <div className="form-group mt-3">
        <label>Note</label>
        <input
          type="text"
          className="form-control"
          value={inputRows[0].note}
          onChange={(e) => handleInputChange(0, 'note', e.target.value)}
        />
      </div>

      {/* Dates */}
      <div className="row mt-3">
        <div className="col-md-6">
          <label>Payment Date*</label>
          <DatePicker
            selected={inputRows[0].paymentDate}
            onChange={(date) => handleInputChange(0, 'paymentDate', date)}
            dateFormat="MM/dd/yyyy"
            customInput={<ReadOnlyDateInput />}
            className={`form-control ${errors[0]?.paymentDate ? 'is-invalid' : ''}`}
            placeholderText="MM/DD/YYYY"
          />
          <div className="invalid-feedback d-block">{errors[0]?.paymentDate || '\u00A0'}</div>
        </div>

        <div className="col-md-6">
          <label>Cleared Date*</label>
          <DatePicker
            selected={inputRows[0].clearedDate}
            onChange={(date) => handleInputChange(0, 'clearedDate', date)}
            dateFormat="MM/dd/yyyy"
            customInput={<ReadOnlyDateInput />}
            className={`form-control ${errors[0]?.clearedDate ? 'is-invalid' : ''}`}
            placeholderText="MM/DD/YYYY"
          />
          <div className="invalid-feedback d-block">{errors[0]?.clearedDate || '\u00A0'}</div>
        </div>
      </div>

      {/* Email Review Pane */}
      <hr className="mt-4" />
      <EmailReviewPane
        sendEmail={sendEmail}
        setSendEmail={setSendEmail}
        emailTo={emailTo}
        setEmailTo={setEmailTo}
        cc={cc}
        setCc={setCc}
        bcc={bcc}
        setBcc={setBcc}
        subject={subject}
        setSubject={setSubject}
        emailBody={emailBody}
        setEmailBody={setEmailBody}
      />

      {/* Actions */}
      <div className="d-flex justify-content-center gap-3 mt-4">
        <button
          className="btn save-btn"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <div className="spinner-border spinner-border-sm text-light" role="status">
              <span className="visually-hidden">Processing...</span>
            </div>
          ) : (
            'Cancel Invoice'
          )}
        </button>
        <button className="btn cancel-btn" onClick={modalData.onClose}>
          Close
        </button>
      </div>

      {formHasErrors && (
        <div className="alert alert-danger mt-3" role="alert">
          <strong>
            <i className="fa fa-exclamation-circle me-2"></i> Please fix all validation errors.
          </strong>
        </div>
      )}
    </div>
  );
};

export default CancelledModalContent;