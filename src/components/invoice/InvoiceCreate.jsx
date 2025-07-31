import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../../assets/css/invoice-style.css';
import PageContainer from '../common/PageContainer';
import InvoiceHeader from './InvoiceHeader';
import InvoiceCustomerSection from './InvoiceCustomerSection';
import InvoiceProductSection from './InvoiceProductSection';
import InvoiceSummaryLeft from './InvoiceSummaryLeft';
import InvoiceSummaryRight from './InvoiceSummaryRight';
import { validateInvoiceForm } from './create-invoice-validation';

function FullScreenLoader({ show, text = "Loading..." }) {
  if (!show) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(255, 255, 255, 0.53)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column"
    }}>
      <svg className="loader" viewBox="0 0 200 100" width={100} height={50}>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#007bff" />
            <stop offset="100%" stopColor="#ff6600" />
          </linearGradient>
        </defs>
        <path className="infinity-shape"
          d="M30,50
            C30,20 70,20 100,50
            C130,80 170,80 170,50
            C170,20 130,20 100,50
            C70,80 30,80 30,50"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
        />
      </svg>
      <p style={{ color: "#000", margin: 0, fontSize: 20 }}>{text}</p>
    </div>
  );
}

const defaultProductRow = {
  product_id: '',
  description: '',
  quantity: 1,
  qty_type: 'Qty',
  price: '',
  discount: '',
  discount_type: 1, // 1 for %, 2 for $
  tax: '',
  amount: 0
};

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const today = new Date();
const tenDaysLater = new Date();
tenDaysLater.setDate(today.getDate() + 10);

const InvoiceCreate = () => {
  const invoiceCustomerSectionRef = useRef(null);
  const formDataRef = useRef();
  const servicesRef = useRef();
  const paymentMethodRef = useRef();
  const paymentMethodTypeRef = useRef();
  const paymentInstructionRef = useRef();
  const [formData, setFormData] = useState({
    lead: '',
    billing_profile: '',
    invoice_parent_product: '',
    template: '',
    customer_name: '',
    business_name: '',
    zip: '',
    address: '',
    country: '',
    state: '',
    city: '',
    phone_no: '',
    invoice_date: formatDateForInput(today),
    due_date: formatDateForInput(tenDaysLater),
    email: '',
    sales_email: '',
    bcc_email: '',
    note_to_recipient: 'Thanks for the payment.',
    internal_customer_notes: 'Thanks for the payment.',
    memo_on_statement: 'Thanks for the payment.',
    save_invoice: '',
  });

  const [apiResponse, setApiResponse] = useState(null);

  const [services, setServices] = useState([
    { ...defaultProductRow, description: 'Fee on ERC Claim', product_options: [] }
  ]);

  const [availableProductServiceHeads, setAvailableProductServiceHeads] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState('ach'); // Bank Transfer
  const [paymentMethodType, setPaymentMethodType] = useState('quickbook');
  const [paymentInstruction, setPaymentInstruction] = useState('');
  const [invoiceEmailTemplateId, setInvoiceEmailTemplateId] = useState('108');
  const [emailTemplate, setEmailTemplate] = useState('Standard Invoice Email Template');
  const [discountValue, setDiscountValue] = useState('');
  const [discountType, setDiscountType] = useState('%');
  const [subtotal, setSubtotal] = useState('0.00');
  const [total, setTotal] = useState('0.00');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState('');

  // Keep refs in sync with state
  useEffect(() => { formDataRef.current = formData; }, [formData]);
  useEffect(() => { servicesRef.current = services; }, [services]);
  useEffect(() => { paymentMethodRef.current = paymentMethod; }, [paymentMethod]);
  useEffect(() => { paymentMethodTypeRef.current = paymentMethodType; }, [paymentMethodType]);
  useEffect(() => { paymentInstructionRef.current = paymentInstruction; }, [paymentInstruction]);

  useEffect(() => {
    let sub = 0;
    if (services && services.length > 0) {
      sub = services.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
    }
    setSubtotal(sub.toFixed(2));

    let discount = 0;
    if (discountValue) {
      if (discountType === '%') {
        discount = sub * (parseFloat(discountValue) / 100);
      } else {
        discount = parseFloat(discountValue);
      }
    }
    let totalVal = sub - discount;
    setTotal(totalVal > 0 ? totalVal.toFixed(2) : '0.00');
  }, [services, discountValue, discountType]);

  const handleChange = (e) => {
    //console.log("handleChange triggered:", e.target.name, e.target.value);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    const errors = validateInvoiceForm(formData, services, paymentMethod);
    setFormErrors(errors);
    if (Object.keys(errors).length) {
      return;
    }
    
    // Use formData.other_emails directly
    const otherEmails = formData.other_emails || '';
    console.log('otherEmails value from formData:', otherEmails); // Log the value
    const productdata = services.map(service => ({
      product_id: service.product_id || service.product || '',
      description: service.description,
      quantity: String(service.quantity || service.qty || 1),
      qty_type: (service.unit || 'Qty').toLowerCase(),
      price: String(service.price || service.rate || ''),
      discount: String(service.discount),
      item_discount: String(service.discount),
      discount_type: String(service.discount_type),
      tax: String(service.tax),
      amount: String(service.amount)
    }));

    // Format date fields as 'mm/dd/yyyy' for API
    function formatDateToMMDDYYYY(dateStr) {
      if (!dateStr) return '';
      // If already in mm/dd/yyyy, return as is
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
      // Convert from yyyy-mm-dd
      const [year, month, day] = dateStr.split('-');
      if (year && month && day) {
        return `${month}/${day}/${year}`;
      }
      return dateStr;
    }

    const payload = {
      ...formData,
      other_emails: otherEmails,
      invoice_date: formatDateToMMDDYYYY(formData.invoice_date),
      due_date: formatDateToMMDDYYYY(formData.due_date),
      productdata: productdata,
      subtotal: subtotal,
      line_total_price:subtotal,
      total: total,
      total_amount: total,
      merchant_id: formData.merchant_id || '45117',
      invoice_status: '2',
      invoice_created_via: 'portal',
      api_type: 'create_invoice',
      payment_method: paymentMethod,
      payment_method_type: paymentMethodType,
      payment_instruction: paymentInstruction,
      invoice_email_template_id: invoiceEmailTemplateId,
      line_discount_type: discountType === '%' ? 1 : 2,
      line_discount: discountValue,
      invoice_url: invoiceUrl
    };
    //console.log(payload);
    // Ensure invoice numbers are strings
    if (payload.custom_customer_invoice_no !== undefined) {
      payload.custom_customer_invoice_no = String(payload.custom_customer_invoice_no);
    }
    if (payload.customer_invoice_no !== undefined) {
      payload.customer_invoice_no = String(payload.customer_invoice_no);
    }

    // Remove the 'template' field from the payload if it's not needed
    delete payload.template;

    // Log the complete form data in JSON format
    console.log("Submitting form data (payload):", JSON.stringify(payload, null, 2));
    
    try {
      const response = await axios.post('https://play.occamsadvisory.com/portal/wp-json/v1/create_custom_invoice_quickbook', payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      setApiResponse(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Failed to create invoice:', error);
      setApiResponse(error.response?.data || { code: 'error', message: 'An error occurred while creating the invoice' });
    }
  };

  const scrollToLeadSection = () => {
    if (invoiceCustomerSectionRef.current) {
      invoiceCustomerSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handlePaymentMethodDetails = (selectedMethod) => {
    if (typeof selectedMethod === 'object' && selectedMethod !== null) {
      setPaymentMethod(selectedMethod.method || 'ach');
      setPaymentMethodType(selectedMethod.payment_method_type || 'quickbook');
      setPaymentInstruction(selectedMethod.payment_instruction || '');
      setInvoiceUrl(selectedMethod.invoice_url || '');
    } else {
      setPaymentMethod(selectedMethod || 'ach');
      setPaymentMethodType('quickbook');
      setPaymentInstruction('');
      setInvoiceUrl('');
    }
  };

  const handleEmailTemplateDetails = (data) => {
    setEmailTemplate(data.title);
    setInvoiceEmailTemplateId(data.templateId);
  };

  // Handler to update lead after lead creation
  const handleLeadCreated = (leadId) => {
    setFormData(prev => ({
      ...prev,
      lead: leadId,
      leadId: leadId,
      'lead_id-paste': leadId
    }));
  };

  // Handler to update all customer fields from fetched lead info
  const handleLeadInfoFetched = (leadData, leadId) => {
    setFormData(prev => ({
      ...prev,
      lead: leadId,
      leadId: leadId,
      'lead_id-paste': leadId,
      customer_name: leadData.authorized_signatory_name || '',
      business_name: leadData.business_legal_name || '',
      phone_no: (leadData.business_phone || '').replace(/-/g, ''),
      email: leadData.business_email || '',
      address: leadData.street_address || '',
      city: leadData.city || '',
      state: leadData.state || '',
      zip: leadData.zip || '',
      country: leadData.country || '',
      sales_email: leadData.sales_email || '',
      bcc_email: leadData.affiliate_email || ''
    }));
  };

  // Helper to check if error should be shown
  const showError = (field) => (formErrors[field] && (touchedFields[field] || formSubmitted));

  // Handle field focus/blur
  const handleFieldFocus = (e) => {
    setTouchedFields(prev => ({ ...prev, [e.target.name]: true }));
  };
  const handleFieldBlur = (e) => {
    setTouchedFields(prev => ({ ...prev, [e.target.name]: true }));
    // Re-validate this field only
    const errors = validateInvoiceForm(formData, services, paymentMethod);
    setFormErrors(errors);
  };

  // New: Preview handler
  const handlePreview = async (e, saveInvoiceValue) => {
    e.preventDefault();
    setFormSubmitted(true);
    // Use refs to get the latest values
    const latestFormData = { ...formDataRef.current };
    const latestServices = [...(servicesRef.current || [])];
    const latestPaymentMethod = paymentMethodRef.current;
    const latestPaymentMethodType = paymentMethodTypeRef.current;
    const latestPaymentInstruction = paymentInstructionRef.current;
    const errors = validateInvoiceForm(latestFormData, latestServices, latestPaymentMethod);
    setFormErrors(errors);
    if (Object.keys(errors).length) {
      return;
    }
    setIsLoading(true);
    setShowLoader(true); // Show loader
    // Use a local variable for save_invoice instead of setting state
    const updatedFormData = { ...latestFormData, save_invoice: saveInvoiceValue };

    // Prepare productdata as in handleSubmit
    const productdata = latestServices.map(service => ({
      product_id: service.product_id || service.product || '',
      description: service.description,
      quantity: String(service.quantity || service.qty || 1),
      qty_type: (service.unit || 'Qty').toLowerCase(),
      price: String(service.price || service.rate || ''),
      discount: String(service.discount),
      item_discount: String(service.discount),
      discount_type: String(service.discount_type),
      tax: String(service.tax),
      amount: String(service.amount)
    }));

    function formatDateToMMDDYYYY(dateStr) {
      if (!dateStr) return '';
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
      const [year, month, day] = dateStr.split('-');
      if (year && month && day) {
        return `${month}/${day}/${year}`;
      }
      return dateStr;
    }

    const payload = {
      ...updatedFormData,
      invoice_date: formatDateToMMDDYYYY(updatedFormData.invoice_date),
      due_date: formatDateToMMDDYYYY(updatedFormData.due_date),
      productdata: productdata,
      subtotal: subtotal,
      line_total_price:subtotal,
      total: total,
      total_amount: total,
      merchant_id: updatedFormData.merchant_id || '45117',
      invoice_status: '2',
      invoice_created_via: 'portal',
      api_type: 'create_invoice',
      payment_method: latestPaymentMethod,
      payment_method_type: latestPaymentMethodType,
      payment_instruction: latestPaymentInstruction,
      invoice_email_template_id: invoiceEmailTemplateId,
      line_discount_type: discountType === '%' ? 1 : 2,
      line_discount: discountValue,
      invoice_url: invoiceUrl
    };
    //console.log(payload);
    if (payload.custom_customer_invoice_no !== undefined) {
      payload.custom_customer_invoice_no = String(payload.custom_customer_invoice_no);
    }
    if (payload.customer_invoice_no !== undefined) {
      payload.customer_invoice_no = String(payload.customer_invoice_no);
    }
    delete payload.template;

    // Show loader
    const previewDiv = document.getElementById('preview-invoice');
    if (previewDiv) {
      previewDiv.style.display = 'block';
      
    }

    try {
      const response = await axios.post(
        'https://play.occamsadvisory.com/portal/wp-json/v1/preview_custom_invoice',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      // Hide the form and show the preview
      if (response.data && response.data.success && response.data.data && response.data.data.pinvoice) {
        document.getElementById('custom-invoice-front-new').style.display = 'none';
        if (previewDiv) {
          previewDiv.style.display = 'block';
          previewDiv.innerHTML = response.data.data.pinvoice;
        }
        // Add event listener for Edit button in preview
        const editBtn = document.getElementById('Edit_preview_invoices');
        if (editBtn) {
          editBtn.onclick = () => {
            document.getElementById('custom-invoice-front-new').style.display = 'block';
            previewDiv.style.display = 'none';
            previewDiv.innerHTML = '';
            // Clear the API result message div
            const resultDiv = document.getElementById('invoice-create-result');
            if (resultDiv) resultDiv.innerHTML = '';
          };
        }
        // Add event listener for Submit button in preview
        const submitBtn = document.getElementById('submit_custom_invoice');
        if (submitBtn) {
          submitBtn.onclick = async () => {
            setFormSubmitted(true);
            const errors = validateInvoiceForm(formData, services, paymentMethod);
            setFormErrors(errors);
            if (Object.keys(errors).length) {
              submitBtn.disabled = false;
              if (editBtn) editBtn.disabled = false;
              setShowLoader(false);
              return;
            }
            submitBtn.disabled = true;
            // Also disable the Edit button during API call
            const editBtn = document.getElementById('Edit_preview_invoices');
            if (editBtn) editBtn.disabled = true;
            setShowLoader(true); // Show loader
            let resultDiv = document.getElementById('invoice-create-result');
            if (!resultDiv) {
              resultDiv = document.createElement('div');
              resultDiv.id = 'invoice-create-result';
              resultDiv.className = 'mt-4 p-3 rounded text-white';
              previewDiv.parentNode.appendChild(resultDiv);
            }
            resultDiv.className = 'mt-4 p-3 rounded text-white';
            resultDiv.innerHTML = '';
            try {
              const qbDndCheckbox = document.getElementById('qb_dnd');
              const email_temp_type_edited = document.getElementById('email_temp_type_edited');
              let finalPayload = { ...payload };
              if (qbDndCheckbox && qbDndCheckbox.checked) {
                finalPayload.qb_dnd = '1';
              }
              finalPayload.email_temp_type_edited = 'custom_invoice_email_edited';

              const createResponse = await axios.post(
                'https://play.occamsadvisory.com/portal/wp-json/v1/create_custom_invoice_quickbook',
                finalPayload,
                { headers: { 'Content-Type': 'application/json' } }
              );
              if (createResponse.data) {
                // Custom alert logic
                let alert_class;
                const response = createResponse.data;
                if (response.code === 'success' && response.message === "create") {
                  alert_class = 'alert-success';
                } else if (response.code === 'success' && response.message === "Success") {
                  alert_class = 'alert-success';
                } else if (response.data && response.data.error_code === 'field_error') {
                  alert_class = 'alert-danger';
                } else {
                  alert_class = 'alert-danger';
                }
                // Display the response message in the UI
                let messageHtml = '';
                if (response.data && response.data.Message) {
                  messageHtml = '<div class="alert width100 ' + alert_class + '">' + response.data.Message + '</div>';
                } else {
                  messageHtml = '<div class="alert width100' + alert_class + '">' + response.message + '</div>';
                }
                resultDiv.innerHTML = messageHtml;
                // Redirect after successful creation, if needed
                if ((response.code === 'success' && response.message === "create") ||
                    (response.code === 'success' && response.message === "Success")) {
                  setTimeout(() => {
                    window.location.replace("https://occams.ai/reporting/invoice/report");
                  }, 1000);
                }
              }
            } catch (error) {
              console.log(error);
              resultDiv.className = 'mt-4 p-3 rounded bg-danger text-white';
              resultDiv.innerHTML = `<h5>Error:</h5><pre class='text-white mb-0'>${error.response?.data?.message || error.message || 'Failed to create invoice.'}</pre>`;
            } finally {
              submitBtn.disabled = false;
              if (editBtn) editBtn.disabled = false;
              setShowLoader(false); // Hide loader
            }
          };
        }
      } else {
        alert('Preview not available.');
      }
    } catch (error) {
      alert('Failed to load preview.');
    } finally {
      setIsLoading(false);
      setShowLoader(false); // Hide loader
    }
  };

  // Function to add product line items from jsondata (replaces current rows)
  const addProductLineItemsFromJson = (jsondata) => {
    if (!Array.isArray(jsondata)) return;
    const newRows = jsondata.map(row => {
      // Find the selected product option
      const selectedOption = row.product_options.find(opt => String(opt.selected) === '1');
      return {
        product_id: selectedOption ? selectedOption.id : '',
        description: row.description || '',
        quantity: row.quantity !== undefined ? row.quantity : 1,
        qty_type: row.qty_type || 'Qty',
        price: row.price !== undefined ? row.price : '',
        discount: row.discount || '',
        discount_type: row.discount_type || 1,
        tax: row.tax || '',
        amount: row.amount || 0,
        product_options: row.product_options || [],
        product_name: row.product_name || '',
        currency: row.currency || '$',
      };
    });
    setServices(newRows);
  };

  // Function to set fee_type as price in the first product/service row
  const setFeeTypeToProductSection = (feeType) => {
    setServices(prev => {
      if (!prev.length) return prev;
      const updated = [...prev];
      updated[0] = { ...updated[0], price: feeType };
      return updated;
    });
  };

  return (
    <PageContainer title="Create Invoice">
      <FullScreenLoader show={showLoader} text="Loading..." />

      <form onSubmit={handleSubmit} id="custom-invoice-front-new">
        <InvoiceHeader />
        <InvoiceCustomerSection
          formData={formData}
          handleChange={handleChange}
          setFormData={setFormData}
          onProductServiceHeadsUpdate={setAvailableProductServiceHeads}
          onAddProductLineItems={addProductLineItemsFromJson}
          setFeeTypeToProductSection={setFeeTypeToProductSection}
          formErrors={formErrors}
          showError={showError}
          handleFieldFocus={handleFieldFocus}
          handleFieldBlur={handleFieldBlur}
          ref={invoiceCustomerSectionRef}
          onLeadInfoFetched={handleLeadInfoFetched}
        />
        <div className="row g-3">
          <InvoiceProductSection
            services={services}
            setServices={setServices}
            availableProductServiceHeads={availableProductServiceHeads}
            formErrors={formErrors}
            showError={showError}
            handleFieldFocus={handleFieldFocus}
            handleFieldBlur={handleFieldBlur}
          />
        </div>
        <div className="row mt-4 mb-4">
          <div className="col-md-6">
            <InvoiceSummaryLeft
              paymentMethodName={paymentMethod}
              paymentMethodType={paymentMethodType}
              paymentInstruction={paymentInstruction}
              otherBankInstructions={paymentInstruction} // Pass as a dedicated prop for clarity
              invoiceUrl={invoiceUrl}
              emailTemplateName={emailTemplate}
              onSelectPaymentMethod={handlePaymentMethodDetails}
              onSelectEmailTemplate={handleEmailTemplateDetails}
              customerName={formData.customer_name}
              invoiceNumber={formData.invoice_number || 'To Be Autogenerated'}
              leadId={formData.lead}
              onScrollToLeadSection={scrollToLeadSection}
              formErrors={formErrors}
              showError={showError}
            />
          </div>
          <div className="col-md-6 d-flex justify-content-end">
            <InvoiceSummaryRight
              subtotal={subtotal}
              discountValue={discountValue}
              discountType={discountType}
              onDiscountValueChange={e => setDiscountValue(e.target.value)}
              onDiscountTypeChange={e => setDiscountType(e.target.value)}
              total={total}
            />
          </div>
        </div>
        <div className="row g-3">
          <div className="col-md-4 invoice-footer-notes">
            <label className="form-label">Note To Recipient</label>
            <textarea className="form-control" name="note_to_recipient" onChange={handleChange} value={formData.note_to_recipient} placeholder='Enter any special notes you would like the customer to see with their invoice.' onFocus={handleFieldFocus} onBlur={handleFieldBlur}>Thanks for the payment.</textarea>
            {showError('note_to_recipient') && <span className="error-message">{formErrors.note_to_recipient}</span>}
          </div>
          <div className="col-md-4 invoice-footer-notes">
            <label className="form-label">Internal Customer Notes</label>
            <textarea className="form-control" name="internal_customer_notes" onChange={handleChange} value={formData.internal_customer_notes} placeholder='Internal notes about this customer for company use only.' onFocus={handleFieldFocus} onBlur={handleFieldBlur}>Thanks for the payment.</textarea>
            {showError('internal_customer_notes') && <span className="error-message">{formErrors.internal_customer_notes}</span>}
          </div>
          <div className="col-md-4 invoice-footer-notes">
            <label className="form-label">Memo On Statement</label>
            <textarea className="form-control" name="memo_on_statement" onChange={handleChange} value={formData.memo_on_statement} placeholder="Short memo or description that appears on customer statements." onFocus={handleFieldFocus} onBlur={handleFieldBlur}>Thanks for the payment.</textarea>
            {showError('memo_on_statement') && <span className="error-message">{formErrors.memo_on_statement}</span>}
          </div>
        </div>

        <input type="hidden" name="save_invoice" value={formData.save_invoice} />

        <div className="mt-5 text-center">
          <button type="button" id="submit_custom_invoices" className="nxt_btn mr-2" onClick={e => handlePreview(e, '')} disabled={isLoading}>Preview & Send</button>
          <button type="button" id="save_custom_invoices" className="nxt_btn mr-4" onClick={e => handlePreview(e, 'yes')} disabled={isLoading}>Preview & Save</button>
          <button type="button" className="nxt_btn" onClick={() => window.location.reload()} disabled={isLoading}>Reset</button>
        </div>

        {apiResponse && (
          <div className={`mt-4 p-3 rounded ${apiResponse.code === 'success' ? 'bg-success' : 'bg-danger'} text-white`}>
            <h5>API Response:</h5>
            <pre className="text-white mb-0">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}
        
      </form>
      <div id="preview-invoice" style={{ display: "none" }}></div>
      <div id="invoice-create-result"></div>
    </PageContainer>
  );
};

export default InvoiceCreate;
