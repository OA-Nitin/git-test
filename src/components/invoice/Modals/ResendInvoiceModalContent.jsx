import React, { useState, useEffect } from "react";
import axios from "axios";
import EmailReviewPane from "../Helpers/EmailReviewPane";

// Resend invoice
const ResendInvoiceModalContent = ({ modalData }) => {
  const [sendEmail, setSendEmail] = useState(true);
  const [emailTo, setEmailTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("<p></p>");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const invoiceid = modalData?.invoiceId;
    const invoiceAmount = modalData?.invoiceAmount;
    if (!invoiceid || !invoiceAmount) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const payload = {
        action_type: "resend",
        invoiceid: String(invoiceid),
        invoiceAmount: String(invoiceAmount),
      };

      try {
        const response = await axios.post(
          "https://play.occamsadvisory.com/portal/wp-json/invoices/v1/get-invoice-action",
          payload
        );
        const data = response.data || {};
        setEmailTo(data.user_email || "");
        setCc(data.cc_email || "");
        setBcc(data.bcc_email || "");
        setSubject(data.subject || "");
        setEmailBody(data.main_content || "<p></p>");
      } catch (error) {
        //console.error("[ResendInvoiceModal] API error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [modalData?.invoiceId, modalData?.invoiceAmount]);

  if (loading) {
    return (
      <div className="modal-body text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading invoice data...</p>
      </div>
    );
  }

  return (
    <div className="modal-body">
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
        <button className="btn save-btn">Resend Invoice</button>
        <button className="btn cancel-btn">Cancel</button>
      </div>
    </div>
  );
};

export default ResendInvoiceModalContent;
