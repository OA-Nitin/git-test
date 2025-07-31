// Step 1: Import necessary dependencies and components
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
import { handlePaidInvoiceSave } from '../invoiceActionHandlers';
import { getCurrentUserInvoice, PAYMENT_MODES, ENDPOINTS } from '../invoice-settings';
import EmailReviewPane from '../Helpers/EmailReviewPane';
import ReadOnlyDateInput from '../Helpers/ReadOnlyDateInput';
import { paidInvoiceSchema } from '../Helpers/validationLibrary/InvoiceValidator';

// Step 2: Component definition
const PaidModalContent = ({ modalData }) => {
  // Step 3: Initialize form data and states
  const [formData, setFormData] = useState({
    paymentMode: "",
    note: "",
    paymentDate: null,
    clearedDate: null,
  });

  const [errors, setErrors] = useState({});
  const [sendEmail, setSendEmail] = useState(true);
  const [emailTo, setEmailTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("<p></p>");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formHasErrors, setFormHasErrors] = useState(false);

  // Step 4: Format JS Date to MM/DD/YYYY
  const formatDateToDMY = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return "";
    const d = new Date(date);
    return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d
      .getDate()
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  // Step 5: Fetch email template details
  useEffect(() => {
    const invoiceid = modalData?.invoiceId;
    const invoiceAmount = modalData?.invoiceAmount;
    if (!invoiceid || !invoiceAmount) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.post(
          ENDPOINTS.GET_INVOICE_ACTION,
          {
            action_type: "2",
            invoiceid: String(invoiceid),
            invoiceAmount: String(invoiceAmount),
          }
        );
        const data = response.data || {};
        setEmailTo(data.user_email || "");
        setCc(data.cc_email || "");
        setBcc(data.bcc_email || "");
        setSubject(data.subject || "");
        setEmailBody(data.main_content || "<p></p>");
      } catch (error) {
        console.error("[PaidModal] API error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [modalData?.invoiceId, modalData?.invoiceAmount]);

  // Step 6: Handle runtime field update + validation
  const handleChange = async (field, value) => {
    const updatedForm = { ...formData, [field]: value };
    setFormData(updatedForm);

    try {
      await paidInvoiceSchema.validateAt(field, updatedForm);
      setErrors((prev) => ({ ...prev, [field]: "" }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [field]: err.message }));
    }
  };

  // Step 7: Handle form submission
  const handleSubmit = async () => {
    try {
      await paidInvoiceSchema.validate(formData, { abortEarly: false });
      setErrors({});
      setFormHasErrors(false);
      setSubmitting(true);

      const user = getCurrentUserInvoice();

      const payload = {
        action_type: "paid",
        invoiceid: modalData?.invoiceId,
        manual_payment_mode: formData.paymentMode,
        payment_mode_note: formData.note || formData.paymentMode,
        payment_date: formatDateToDMY(formData.paymentDate),
        cleared_date: formatDateToDMY(formData.clearedDate),
        send_email_update_to_client: sendEmail,
        email_update_note: "Invoice marked as paid via portal.",
        user_email: emailTo,
        cc: cc,
        bcc: bcc,
        subject: subject,
        message: emailBody,
        user_id: user?.id || "",
      };

      const response = await handlePaidInvoiceSave(payload);

      if (response?.success) {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: response?.message || "Invoice marked as paid.",
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        throw new Error(response?.message || "Failed to mark invoice as paid.");
      }

    } catch (err) {
      if (err.name === "ValidationError") {
        const errorMap = {};
        err.inner.forEach((e) => {
          errorMap[e.path] = e.message;
        });
        setErrors(errorMap);
        setFormHasErrors(true);
      } else {
        Swal.fire("Error", err.message || "Submission failed.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Step 8: Show loading spinner if API is fetching
  if (loading) {
    return (
      <div className="modal-body text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading invoice data...</p>
      </div>
    );
  }

  // Step 9: Render the form UI
  return (
    <div className="">
      <h5 className="section-title">User Input Section</h5>

      {/* Payment Mode */}
      <div className="form-group">
        <label>Payment Mode*</label>
        <select
          className={`form-select ${errors.paymentMode ? "is-invalid" : ""}`}
          value={formData.paymentMode}
          onChange={(e) => handleChange("paymentMode", e.target.value)}
        >
          <option value="">Select payment mode</option>
          {PAYMENT_MODES.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
        <div className="invalid-feedback d-block">
          {errors.paymentMode || "\u00A0"}
        </div>
      </div>

      {/* Note */}
      <div className="form-group mt-3">
        <label>Note:</label>
        <input
          type="text"
          className="form-control"
          value={formData.note}
          onChange={(e) => handleChange("note", e.target.value)}
        />
      </div>

      {/* Dates */}
      <div className="row mt-3">
        <div className="col-md-6">
          <label>Payment Date*</label>
          <DatePicker
            selected={formData.paymentDate}
            onChange={(date) => handleChange("paymentDate", date)}
            dateFormat="MM/dd/yyyy"
            customInput={<ReadOnlyDateInput />}
            className={`form-control ${errors.paymentDate ? "is-invalid" : ""}`}
            placeholderText="MM/DD/YYYY"
          />
          <div className="invalid-feedback d-block">
            {errors.paymentDate || "\u00A0"}
          </div>
        </div>

        <div className="col-md-6">
          <label>Cleared Date*</label>
          <DatePicker
            selected={formData.clearedDate}
            onChange={(date) => handleChange("clearedDate", date)}
            dateFormat="MM/dd/yyyy"
            customInput={<ReadOnlyDateInput />}
            className={`form-control ${errors.clearedDate ? "is-invalid" : ""}`}
            placeholderText="MM/DD/YYYY"
          />
          <div className="invalid-feedback d-block">
            {errors.clearedDate || "\u00A0"}
          </div>
        </div>
      </div>

      {/* Email Review Section */}
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

      {/* Submit Buttons */}
      <div className="d-flex justify-content-center gap-3 mt-4">
        <button
          className="btn save-btn"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <div
              className="spinner-border spinner-border-sm text-light"
              role="status"
            >
              <span className="visually-hidden">Processing...</span>
            </div>
          ) : (
            "Invoice Paid"
          )}
        </button>
        <button className="btn cancel-btn" onClick={modalData.onClose}>
          Cancel
        </button>
      </div>

      {/* Validation Error Alert */}
      {formHasErrors && (
        <div className="alert alert-danger mt-3" role="alert">
          <strong>
            <i className="fa fa-exclamation-circle me-2"></i>Please validate all fields.
          </strong>
        </div>
      )}
    </div>
  );
};

// Step 10: Export component
export default PaidModalContent;
