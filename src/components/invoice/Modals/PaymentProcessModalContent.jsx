import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import EmailReviewPane from '../Helpers/EmailReviewPane';
import { handlePaymentProcessSave } from '../invoiceActionHandlers';
import { getCurrentUserInvoice, ENDPOINTS } from '../invoice-settings';

const PaymentProcessModalContent = ({ modalData }) => {
  const [sendEmail, setSendEmail] = useState(true);
  const [emailTo, setEmailTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("<p></p>");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const invoiceid = modalData?.invoiceId;
    const invoiceAmount = modalData?.invoiceAmount;
    if (!invoiceid || !invoiceAmount) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const payload = {
        action_type: "6",
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
      } catch (error) {
        console.error("[PaymentProcessModal] API error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [modalData?.invoiceId, modalData?.invoiceAmount]);

  const handleSubmit = async () => {
    setSubmitting(true);

    const user = getCurrentUserInvoice();

    const params = {
      action_type: 'payment in process',
      invoiceid: modalData?.invoiceId,
      send_email_update_to_client: sendEmail,
      email_update_note: 'Invoice has been marked as payment in process.',
      user_email: emailTo,
      cc: cc,
      bcc: bcc,
      subject: subject,
      message: emailBody,
      user_id: user?.id || "",
    };

    try {
      const res = await handlePaymentProcessSave(params);
      if (res?.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Marked In Process',
          text: res.message || 'Invoice status updated.',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error(res?.message || 'Failed to mark invoice in process.');
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
        <p className="mt-3">Loading invoice data...</p>
      </div>
    );
  }

  return (
    <div className="">
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
            'Payment in Process'
          )}
        </button>
        <button className="btn cancel-btn" onClick={modalData?.onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentProcessModalContent;
