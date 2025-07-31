// Step 1: Import required libraries and helpers
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { handlePartialPaidSave } from '../invoiceActionHandlers';
import { getCurrentUserInvoice, PAYMENT_MODES, ENDPOINTS } from '../invoice-settings';
import EmailReviewPane from '../Helpers/EmailReviewPane';
import ReadOnlyDateInput from '../Helpers/ReadOnlyDateInput';
import { useInvoiceValidation } from '../Helpers/validationLibrary/useInvoiceValidation';
import { partialPaymentRowSchema } from '../Helpers/validationLibrary/InvoiceValidator';


const PartialPaidModalContent = ({ modalData }) => {
  // Step 2: Initialize states
  const [rows, setRows] = useState([]);
  const [inputRows, setInputRows] = useState([
    {
      refId: "",
      paymentDate: null,
      clearedDate: null,
      paymentMode: "",
      note: "",
      received: "",
    },
  ]);
  const [sendEmail, setSendEmail] = useState(true);
  const [emailBody, setEmailBody] = useState("<p></p>");
  const [emailTo, setEmailTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [overdueAmount, setOverdueAmount] = useState("0.00");
  const [receivedAmount, setReceivedAmount] = useState("0.00");
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [formHasErrors, setFormHasErrors] = useState(false);

  // Step 3: Initialize validation hook
  const { errors, validateAllRows, handleInputChange } = useInvoiceValidation(
    partialPaymentRowSchema,
    inputRows,
    setInputRows
  ); 

  // Step 4: Helper functions for formatting
  const formatDateToDMY = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return "NA";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };
  
  const formatCurrency = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) ? `$${num.toFixed(2)}` : "NA";
  };

  const parseDollar = (str) => parseFloat(str?.toString().replace(/[^0-9.]/g, '') || '0');
  const safeDate = (str) => {
    const d = new Date(str);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  // Step 5: Define payment modes
  const paymentModes = PAYMENT_MODES;

  const getPaymentModeLabel = (value) => {
    const match = paymentModes.find(pm => pm.value === value);
    return match ? match.label : value || "NA";
  };

  const getPaymentModeValue = (label) => {
    const match = paymentModes.find(pm => pm.label === label);
    return match ? match.value : label || "";
  };

  const fetchData = async () => {
    const invoiceid = modalData?.invoiceId;
    const invoiceAmount = modalData?.invoiceAmount;

    if (!invoiceid || !invoiceAmount) {
      setLoading(false);
      return;
    }

    const payload = {
      action_type: "17",
      invoiceid: String(invoiceid),
      invoiceAmount: String(invoiceAmount),
    };

    try {
      const response = await axios.post(
        ENDPOINTS.GET_INVOICE_ACTION,
        payload
      );
      const data = response.data || {};
      setEmailTo(data.user_email || "");
      setCc(data.cc_email || "");
      setBcc(data.bcc_email || "");
      setSubject(data.subject || "");
      setEmailBody(data.main_content || "<p></p>");
      setOverdueAmount(data.overdue_amount || "0.00");
      setReceivedAmount(data.recieved_amount || "0.00");

      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(data.payment_table_html || "", "text/html");
      const tableRows = [...htmlDoc.querySelectorAll("tr")].filter((row) =>
        row.className.includes("ppamt")
      );

      const parsedRows = tableRows.map((row) => {
        const cells = row.querySelectorAll("td");
        return {
          refId: cells[0]?.textContent?.trim() || "",
          paymentDate: safeDate(cells[1]?.textContent?.trim()),
          clearedDate: safeDate(cells[2]?.textContent?.trim()),
          paymentMode: getPaymentModeValue(cells[3]?.textContent?.trim()),
          note: cells[4]?.textContent?.trim() || "",
          service: parseDollar(cells[5]?.textContent),
          charge: parseDollar(cells[6]?.textContent),
          received: parseDollar(cells[7]?.textContent),
        };
      });

      setRows(parsedRows);
    } catch (error) {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };
  // Step 6: Fetch initial data using useEffect
  useEffect(() => {
    const invoiceid = modalData?.invoiceId;
    const invoiceAmount = modalData?.invoiceAmount;
    if (!invoiceid || !invoiceAmount) {
      setLoading(false);
      return;
    }

    fetchData();
  }, [modalData?.invoiceId, modalData?.invoiceAmount]);

  // Step 7: Handlers to manage row operations
  const handleInputAdd = () => {
    setInputRows([...inputRows, {
      refId: "",
      // paymentDate: new Date(),
      // clearedDate: new Date(),
      paymentDate: null,
      clearedDate: null,
      paymentMode: "",
      note: "",
      service: "",
      charge: "",
      received: "",
    }]);
  };

  const handleInputRemove = (index) => {
    setInputRows(inputRows.filter((_, i) => i !== index));
  };

  // Step 8: Submit handler
  const handlePartialPaidSubmit = async () => {
    const isValid = await validateAllRows();
    const user = getCurrentUserInvoice();

    setFormHasErrors(!isValid);
    if (!isValid) return;

    setFormHasErrors(false);
    setSubmitting(true);

    const params = {
      action_type: "partially paid",
      invoiceid: modalData.invoiceId,
      partial_paymentdata: JSON.stringify(inputRows.map(row => ({
        pp_payment_id: row.refId,
        pp_payment_date: formatDateToDMY(row.paymentDate),
        pp_payment_cleared_date: formatDateToDMY(row.clearedDate),
        pp_manual_payment_mode: row.paymentMode,
        pp_payment_note: row.note,
        pp_payment_recieved_amount: row.received
      }))),
      send_email_update_to_client: sendEmail,
      manual_payment_mode: inputRows[0]?.paymentMode || "",
      payment_mode_note: inputRows[0]?.paymentMode || "",
      email_update_note: `Partial payment of $${inputRows[0]?.received || 0} recorded via portal`,
      user_email: emailTo,
      cc: cc,
      bcc: bcc,
      subject: subject,
      message: emailBody,
      overdue_amount_hidden: overdueAmount || "0.00",
      user_id: user?.id || "",
    };

    try {
      const response = await handlePartialPaidSave(params);

      if (response?.result === "success") {
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response?.msg || 'Partial payment recorded successfully.',
          timer: 2000,
          showConfirmButton: false
        });

        setInputRows([{
          refId: "",
          paymentDate: null,
          clearedDate: null,
          paymentMode: "",
          note: "",
          received: "",
        }]);

        setFormHasErrors(false);
        setReceivedAmount("0.00");
        await fetchData();
      } else {
        throw new Error(response?.msg || "Failed to record partial payment");
      }
    } catch (error) {
      Swal.fire('Error', error.message || 'Something went wrong while saving.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 9: Show loading UI while fetching data
  if (loading) {
    return (
      <div className="modal-body text-center py-5">
        {fetchError ? (
          <>
            <p className="text-danger">Failed to load invoice data. Please try again.</p>
            <button className="btn btn-primary mt-3" onClick={() => window.location.reload()}>
              Retry
            </button>
          </>
        ) : (
          <>
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3">Loading invoice data...</p>
          </>
        )}
      </div>
    );
  }
  // Step 10: Render the full modal content
  return (
    <div className=""> 
      <h5 className="section-title">User Input Section</h5>

      <div className="table-responsive custom-inv-table">
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
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr key={index}>
                  <td>{row.refId || "NA"}</td>
                  <td>{formatDateToDMY(row.paymentDate)}</td>
                  <td>{formatDateToDMY(row.clearedDate)}</td>
                  <td>{getPaymentModeLabel(row.paymentMode)}</td>
                  <td>{row.note || "NA"}</td>
                  <td>{formatCurrency(row.service)}</td>
                  <td>{formatCurrency(row.charge)}</td>
                  <td>{formatCurrency(row.received)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted py-3">
                  No payments found for this invoice.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <table className="table table-bordered table-sm mt-3">
          <thead>
            <tr>
              <th>Reference ID*</th>
              <th>Payment Date*</th>
              <th>Payment Cleared Date*</th>
              <th>Payment Mode*</th>
              <th>Note</th>
              <th>Payment Received*</th>
            </tr>
          </thead>          
          <tbody className="invoicePartialInputs">
            {inputRows.map((row, index) => (
              <tr key={`input-${index}`}>
                {/* Reference ID */}
                <td>
                  <div className="field-wrapper">
                    <input
                      type="text"
                      className={`form-control form-control-sm ${errors[index]?.refId ? 'is-invalid' : ''}`}
                      value={row.refId}
                      onChange={(e) => handleInputChange(index, 'refId', e.target.value)}
                    />
                    <div className="invalid-feedback d-block">{errors[index]?.refId || '\u00A0'}</div>
                  </div>
                </td>

                {/* Payment Date */}
                <td>
                  <div className="field-wrapper">
                    <DatePicker
                      selected={row.paymentDate}
                      onChange={(date) => handleInputChange(index, 'paymentDate', date)}
                      dateFormat="MM/dd/yyyy"
                      customInput={<ReadOnlyDateInput />}
                      className={`form-control form-control-sm ${errors[index]?.paymentDate ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback d-block">{errors[index]?.paymentDate || '\u00A0'}</div>
                  </div>
                </td>

                {/* Cleared Date */}
                <td>
                  <div className="field-wrapper">
                    <DatePicker
                      selected={row.clearedDate}
                      onChange={(date) => handleInputChange(index, 'clearedDate', date)}
                      dateFormat="MM/dd/yyyy"
                      customInput={<ReadOnlyDateInput />}
                      className={`form-control form-control-sm ${errors[index]?.clearedDate ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback d-block">{errors[index]?.clearedDate || '\u00A0'}</div>
                  </div>
                </td>

                {/* Payment Mode */}
                <td>
                  <div className="field-wrapper">
                    <select
                      className={`form-select form-select-sm ${errors[index]?.paymentMode ? 'is-invalid' : ''}`}
                      value={row.paymentMode}
                      onChange={(e) => handleInputChange(index, 'paymentMode', e.target.value)}
                    >
                      <option value="">Select payment mode</option>
                      {paymentModes.map((mode) => (
                        <option key={mode.value} value={mode.value}>{mode.label}</option>
                      ))}
                    </select>
                    <div className="invalid-feedback d-block">{errors[index]?.paymentMode || '\u00A0'}</div>
                  </div>
                </td>

                {/* Note */}
                <td>
                  <div className="field-wrapper">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={row.note}
                      onChange={(e) => handleInputChange(index, 'note', e.target.value)}
                    />
                    <div className="invalid-feedback d-block">&nbsp;</div>
                  </div>
                </td>

                {/* Payment Received + Remove Button */}
                <td>
                  <div className="field-wrapper">
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="number"
                        className={`form-control form-control-sm ${errors[index]?.received ? 'is-invalid' : ''}`}
                        value={row.received}
                        onChange={(e) => handleInputChange(index, 'received', e.target.value)}
                      />
                      {inputRows.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-danger remove-btn"
                          onClick={() => handleInputRemove(index)}
                        >
                          &times;
                        </button>
                      )}
                    </div>
                    <div className="invalid-feedback d-block">{errors[index]?.received || '\u00A0'}</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      <div className="d-flex justify-content-end mb-3">
        <a
          href="javascript:void(0);"
          className="px-3 py-2 column-selector-btn"
          onClick={handleInputAdd}
        >
          <i className="fa fa-plus-circle" aria-hidden="true"></i> Add Payment
        </a>
      </div>

      
      <div className="rounded info-setup mb-3">
        <div className="d-flex justify-content-between">
          <div>
            <strong>Total Partial Payment Amount</strong>
          </div>
          <div>${receivedAmount}</div>
        </div>
      </div>
      
      <div className="rounded info-setup mb-3">
        <div className="d-flex justify-content-between">
          <div>
            <strong>Overdue Amount</strong>
            <i className="bi bi-info-circle-fill text-primary"></i>
          </div>
          <div>${overdueAmount}</div>
        </div>
      </div>

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

      <div className="d-flex justify-content-center gap-3 mt-4">
        <button className="btn save-btn" onClick={handlePartialPaidSubmit} disabled={submitting || loading}>
          {submitting ? (
            <div className="spinner-border spinner-border-sm text-light" role="status">
              <span className="visually-hidden">Processing..</span>
            </div>
          ) : "Partially Paid"}
        </button>

        <button className="btn cancel-btn" onClick={modalData.onClose}>Cancel</button>
        
      </div>
      {formHasErrors && (
        <div
          key={Date.now()} // forces re-mounting each time
          className="alert alert-danger mt-3 sts"
          role="alert"
        >
          <strong>
            <i className="fa fa-exclamation-circle me-2"></i>
            Please validate all fields.
          </strong>
        </div>
      )}
    </div>
  );
};

export default PartialPaidModalContent;
