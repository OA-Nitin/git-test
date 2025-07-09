import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import RichTextEditor from "../RichTextEditorTiny";
import { handleSendReminderSave } from "../invoiceActionHandlers";
import { useInvoiceValidation } from "../Helpers/validationLibrary/useInvoiceValidation";
import { reminderInvoiceSchema } from "../Helpers/validationLibrary/InvoiceValidator";
import { ENDPOINTS, getCurrentUserInvoice } from '../invoice-settings';

const ReminderModalContent = ({ modalData }) => {
  const [sendEmail, setSendEmail] = useState(modalData?.userEmail || "");
  const [cc, setCc] = useState(modalData?.ccEmail || "");
  const [bcc, setBcc] = useState(modalData?.bccEmail || "");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("<p></p>");
  const [templateId, setTemplateId] = useState("");
  const [templateList, setTemplateList] = useState([]);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateSelected, setTemplateSelected] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const user = getCurrentUserInvoice();

  const [inputRows, setInputRows] = useState([{ template_id: "" }]);
  const { errors, validateAllRows, handleInputChange } =
  useInvoiceValidation(reminderInvoiceSchema, inputRows, setInputRows);

  const [dynamicReminderMeta, setDynamicReminderMeta] = useState({
    customer_name: "",
    lead_id: "",
    product_id: "",
    template_name: "",
    customer_invoice_number: "",
  });

  // Fetch templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axios.get(ENDPOINTS.CUSTOM_REMINDER_TEMPLATES);
        const rawHtml = res?.data?.data?.dropdown || "";
        const tempDom = document.createElement("div");
        tempDom.innerHTML = rawHtml;

        const options = [...tempDom.querySelectorAll("option")]
          .filter(opt => opt.value)
          .map(opt => ({
            id: opt.value,
            name: opt.textContent.trim()
          }));

        setTemplateList(options);
      } catch (err) {
        console.error("Error loading templates:", err);
        Swal.fire("Error", "Failed to fetch reminder templates.", "error");
      } finally {
        setInitLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleTemplateChange = async (e) => {
    const selectedId = e.target.value;
    setTemplateId(selectedId);
    setTemplateSelected(false);
    handleInputChange(0, "template_id", selectedId);

    if (!selectedId || !modalData?.invoiceId) return;

    setTemplateLoading(true);

    try {
      const res = await axios.post(ENDPOINTS.SEND_REMINDER_ACTION, {
        invoice_id: modalData.invoiceId,
        template_id: selectedId,
      });

      const data = res?.data || {};
      setSubject(data.subject || "");
      setEmailBody(data.main_content || "<p></p>");
      setTemplateSelected(true);

      setDynamicReminderMeta({
        customer_name: data.customer_name || "",
        lead_id: data.lead_id || "",
        product_id: data.product_id || "",
        template_name: data.template_name || "",
        customer_invoice_number: data.customer_invoice_no || "",
      });
    } catch (err) {
      console.error("Failed to load template content", err);
      Swal.fire("Error", "Failed to load selected template content.", "error");
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleReminderSend = async () => {
    //console.log("Modal Data:", modalData);

    const isValid = await validateAllRows();
    if (!isValid) {
      Swal.fire("Validation Error", "Please select a reminder template.", "warning");
      return;
    }

    setSending(true);

    const payload = {
      invoiceid: modalData?.invoiceId,
      template_id: templateId,
      to_email: sendEmail,
      cc_email: cc,
      bcc_email: bcc,
      subject: subject,
      message: emailBody,
      logged_in_user_id: user?.id || "",
      customer_name: dynamicReminderMeta.customer_name,
      lead_id: dynamicReminderMeta.lead_id,
      product_id: dynamicReminderMeta.product_id,
      template_name: dynamicReminderMeta.template_name,
      customer_invoice_number: dynamicReminderMeta.customer_invoice_number,
    };

    //console.log("Payload:", payload);
    //return;
    try {
      const res = await handleSendReminderSave(payload);
      if (res?.success || res?.message?.includes("successfully")) {
        Swal.fire("Success", "Reminder sent successfully.", "success");
      } else {
        Swal.fire("Error", res.message || "Reminder failed.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "An error occurred while sending reminder.", "error");
    } finally {
      setSending(false);
    }
  };

  if (initLoading) {
    return (
      <div className="modal-body text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">Loading templates...</p>
      </div>
    );
  }

  return (
    <div className="">
      <h5 className="section-title">Send Payment Reminder</h5>

      <div className="form-group mb-3">
        <label>To *</label>
        <input
          type="text"
          className="form-control"
          value={sendEmail}
          onChange={(e) => setSendEmail(e.target.value)}
        />
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label>CC</label>
          <input
            type="text"
            className="form-control"
            value={cc}
            onChange={(e) => setCc(e.target.value)}
          />
        </div>
        <div className="col-md-6 mb-3">
          <label>Bcc</label>
          <input
            type="text"
            className="form-control"
            value={bcc}
            onChange={(e) => setBcc(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group mb-3">
        <label>Select Template *</label>
        <select
          className={`form-select ${errors?.[0]?.template_id ? 'is-invalid' : ''}`}
          value={templateId}
          onChange={handleTemplateChange}
        >
          <option value="">Select Template</option>
          {templateList.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
          ))}
        </select>
        {errors?.[0]?.template_id && (
          <div className="invalid-feedback">{errors[0].template_id}</div>
        )}
      </div>

      {templateLoading && (
        <div className="text-muted mb-2">Loading template content...</div>
      )}

      {templateSelected && (
        <>
          <div className="form-group mt-3">
            <label>Subject *</label>
            <input
              type="text"
              className="form-control"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="form-group mt-3">
            <label>Email Body *</label>
            <RichTextEditor value={emailBody} onChange={setEmailBody} />
          </div>
        </>
      )}

      <div className="d-flex justify-content-center gap-3 mt-4">
        <button
          className="btn save-btn"
          disabled={!templateSelected || sending}
          onClick={handleReminderSend}
        >
          {sending ? "Sending..." : "Send"}
        </button>
        <button className="btn cancel-btn" data-bs-dismiss="modal">Cancel</button>
      </div>
    </div>
  );
};

export default ReminderModalContent;
