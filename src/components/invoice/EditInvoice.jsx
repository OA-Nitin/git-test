import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../../assets/css/invoice-style.css';
import PageContainer from '../common/PageContainer';
import InvoiceHeader from './InvoiceHeader';
import InvoiceEditCustomerSection from './InvoiceEditCustomerSection';
import InvoiceEditProductSection from './InvoiceEditProductSection';
import InvoiceEditSummaryLeft from './InvoiceEditSummaryLeft';
import InvoiceSummaryRight from './InvoiceSummaryRight';
import { validateInvoiceForm } from './create-invoice-validation';
import { useParams } from 'react-router-dom';
import EmailTemplateModal from './EmailTemplateModal';

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

const EditInvoice = () => {
  const { id } = useParams();
  const InvoiceEditCustomerSectionRef = useRef(null);
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
    otherEmails:'',
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

  const [paymentMethod, setPaymentMethod] = useState('Quickbook - Bank Transfer');
  const [paymentMethodType, setPaymentMethodType] = useState('');
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
  // Add loading state for initial fetch
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setInitialLoading(true);

    const fetchInvoice = fetch(`https://play.occamsadvisory.com/portal/wp-json/v1/get_invoice/${id}`).then(res => res.json());
    const fetchTemplates = axios.get('https://play.occamsadvisory.com/portal/wp-json/v1/invoice_email_templates_list');

    Promise.all([fetchInvoice, fetchTemplates])
      .then(([invoiceData, templatesResponse]) => {
        let templates = [];
        if (templatesResponse.data.success) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(templatesResponse.data.data.dropdown, 'text/html');
          const select = doc.querySelector('select');
          templates = Array.from(select.options).map(option => ({
            id: option.value,
            title: option.text,
            subject: option.getAttribute('data-subject'),
            template: option.getAttribute('data-template')
          }));
        }
        console.log("Fetch Invoice Data");
        console.log(invoiceData);
        // Map API response to formData and services
        setFormData(prev => ({
          ...prev,
          invoice_id: invoiceData.invoice.id || '',
          customer_invoice_no: invoiceData.invoice.customer_invoice_no || '',
          qb_invoice_id: invoiceData.invoice.qb_invoice_id || '',
          product_customer_invoice_no: invoiceData.invoice.product_customer_invoice_no || invoiceData.invoice.customer_invoice_no || '',
          customer_name: invoiceData.invoice.customer_name || '',
          business_name: invoiceData.customer.business_name || '',
          zip: invoiceData.customer.zip || '',
          address: invoiceData.customer.address || '',
          country: invoiceData.customer.country || '',
          state: invoiceData.customer.state || '',
          city: invoiceData.customer.city || '',
          phone_no: invoiceData.customer.phone_no || '',
          invoice_date: invoiceData.invoice.invoice_date ? invoiceData.invoice.invoice_date.split('T')[0] : formatDateForInput(today),
          due_date: invoiceData.invoice.due_date ? invoiceData.invoice.due_date.split('T')[0] : formatDateForInput(tenDaysLater),
          email: invoiceData.customer.user_email || '',
          sales_email: invoiceData.invoice.cc_email || '',
          bcc_email: invoiceData.invoice.bcc_email || '',
          otherEmails: invoiceData.invoice.other_emails || '',
          note_to_recipient: invoiceData.invoice.note_to_recipient || 'Thanks for the payment.',
          internal_customer_notes: invoiceData.invoice.internal_customer_notes || 'Thanks for the payment.',
          memo_on_statement: invoiceData.invoice.memo_on_statement || 'Thanks for the payment.',
          merchant_id: invoiceData.customer.merchant_id || '',
          lead: invoiceData.invoice.lead_id || '',
          billing_profile: invoiceData.invoice.billing_profile || '',
          invoice_parent_product: invoiceData.invoice.parent_product || '',
          products: Array.isArray(invoiceData.products) ? invoiceData.products : [],
          invoiceEmailTemplateId: invoiceData.invoice.email_template_id,
          invoice_status_id: invoiceData.invoice.status || '',
          save_invoice: '',
        }));

        setServices(Array.isArray(invoiceData.products) ? invoiceData.products : []);
        setPaymentMethod(invoiceData.invoice.payment_method || '');
        setPaymentMethodType(invoiceData.invoice.payment_method_type || '');
        setPaymentInstruction(invoiceData.invoice.payment_instruction || '');

        // Set email template id and name
        const templateId = invoiceData.invoice.email_template_id || '108';
        setInvoiceEmailTemplateId(templateId);
        if (templates.length > 0) {
          const found = templates.find(t => t.id === templateId);
          setEmailTemplate(found ? found.title : 'Standard Invoice Email Template');
        } else {
          setEmailTemplate('Standard Invoice Email Template');
        }

        // Set discount value and type from API
        setDiscountValue(invoiceData.invoice.other_discount || '');
        setDiscountType(invoiceData.invoice.other_discount_type === 1 ? '%' : invoiceData.invoice.other_discount_type === 2 ? '$' : '%');
      })
      .catch(err => {
        console.error("Failed to fetch invoice data:", err);
        setApiResponse({ code: 'error', message: 'Failed to fetch initial invoice data.' });
      })
      .finally(() => {
        setInitialLoading(false);
      });
  }, [id]);

  useEffect(() => {
    const subtotalFromAmounts = services.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);

    setSubtotal(subtotalFromAmounts.toFixed(2));

    let discount = 0;
    if (discountValue) {
      if (discountType === '%') {
        discount = subtotalFromAmounts * (parseFloat(discountValue) / 100);
      } else {
        discount = parseFloat(discountValue);
      }
    }

    const totalVal = subtotalFromAmounts - discount;
    setTotal(totalVal > 0 ? totalVal.toFixed(2) : '0.00');
  }, [services, discountValue, discountType]);

  const handleChange = (e) => {
    //console.log("handleChange triggered:", e.target.name, e.target.value);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const scrollToLeadSection = () => {
    if (InvoiceEditCustomerSectionRef.current) {
        InvoiceEditCustomerSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handlePaymentMethodDetails = (selectedMethod) => {
    // Support both string and object input
    let methodString = selectedMethod;
    let paymentInstruction = '';
    if (typeof selectedMethod === 'object' && selectedMethod !== null) {
      methodString = selectedMethod.method || '';
      paymentInstruction = selectedMethod.payment_instruction || '';
    }
    // Extract payment method type (e.g., "Quickbook")
    const typeMatch = methodString.split('-')[0];
    const paymentType = typeMatch ? typeMatch.trim() : '';
    // Extract payment methods (e.g., "Credit/Debit Card, Bank Transfer")
    const methodsMatch = methodString.split('-')[1];
    const paymentMethods = methodsMatch ? methodsMatch.split('(')[0].trim() : '';
    // Use paymentInstruction if present, otherwise try to extract from string
    let instructions = paymentInstruction;
    if (!instructions) {
      const instructionMatch = methodString.match(/Instructions:\s*([^)]+)/);
      instructions = instructionMatch ? instructionMatch[1].trim() : '';
    }
    setPaymentMethod(paymentMethods);
    setPaymentMethodType(paymentType);
    setPaymentInstruction(instructions);
  };

  const handleEmailTemplateDetails = (data) => {
    setEmailTemplate(data.title);
    setInvoiceEmailTemplateId(data.templateId);
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
    ///console.log('handlePreview called with saveInvoiceValue:', saveInvoiceValue); // Debug log
    setFormSubmitted(true);
    const errors = validateInvoiceForm(formData, services, paymentMethod);
    setFormErrors(errors);
    //console.log('Validation errors:', errors); // Debug log for validation errors
    if (Object.keys(errors).length) {
      return;
    }
    setIsLoading(true);
    setShowLoader(true); // Show loader

    // Build the payload with the correct save_invoice value directly
    const updatedFormData = { ...formData, save_invoice: saveInvoiceValue };

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
      line_total_price: subtotal,
      total: total,
      total_amount: total,
      merchant_id: updatedFormData.merchant_id || '45117',
      invoice_status: '',
      invoice_created_via: 'portal',
      api_type: 'edit_custom_invoice',
      payment_method: paymentMethod,
      payment_method_type: paymentMethodType,
      payment_instruction: paymentInstruction,
      invoice_email_template_id: invoiceEmailTemplateId,
      line_discount_type: discountType === '%' ? 1 : 2,
      line_discount: discountValue,
      getInvoiceId: updatedFormData.invoice_id,
      getCustomerId: updatedFormData.customer_invoice_no,
      qb_invoice_id: updatedFormData.qb_invoice_id,
      invoice_status_id: updatedFormData.invoice_status_id,
      leadId: updatedFormData.lead || updatedFormData.leadId || ''
    };
    // Remove 'lead' key if present
    delete payload.lead;

    // Log all data passed to API
    //console.log('Preview API Payload:', JSON.stringify(payload, null, 2));

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
        document.getElementById('update-invoice-front-new').style.display = 'none';
        if (previewDiv) {
          previewDiv.style.display = 'block';
          previewDiv.innerHTML = response.data.data.pinvoice;
        }
        // Add event listener for Edit button in preview
        const editBtn = document.getElementById('Edit_preview_invoices');
        if (editBtn) {
          editBtn.onclick = () => {
            document.getElementById('update-invoice-front-new').style.display = 'block';
            previewDiv.style.display = 'none';
            previewDiv.innerHTML = '';
            // Clear the API result message div
            const resultDiv = document.getElementById('invoice-create-result');
            if (resultDiv) resultDiv.innerHTML = '';
          };
        }
        // Add event listener for Submit button in preview
        const submitBtn = document.getElementById('update_custom_invoice');
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
              let finalPayload = { ...payload };
              if (qbDndCheckbox && qbDndCheckbox.checked) {
                finalPayload.qb_dnd = '1';
              }
              const createResponse = await axios.post(
                'https://play.occamsadvisory.com/portal/wp-json/v1/update_custom_invoice_quickbook',
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
    <PageContainer title="Edit / Update Invoice">
      <FullScreenLoader show={showLoader || initialLoading} text="Loading..." />

      <form id="update-invoice-front-new">
        <InvoiceHeader />
        <InvoiceEditCustomerSection
          formData={formData}
          handleChange={handleChange}
          setFormData={setFormData}
          onProductServiceHeadsUpdate={setAvailableProductServiceHeads}
          onAddProductLineItems={addProductLineItemsFromJson}
          setFeeTypeToProductSection={() => {}}
          formErrors={formErrors}
          showError={showError}
          handleFieldFocus={handleFieldFocus}
          handleFieldBlur={handleFieldBlur}
          ref={InvoiceEditCustomerSectionRef}
        />
        <InvoiceEditProductSection
          services={services}
          setServices={setServices}
          availableProductServiceHeads={availableProductServiceHeads}
          formData={formData}
          formErrors={formErrors}
          showError={showError}
          handleFieldFocus={handleFieldFocus}
          handleFieldBlur={handleFieldBlur}
        />
        <div className="row mt-4 mb-4">
          <div className="col-md-6">
            <InvoiceEditSummaryLeft
              paymentMethodName={paymentMethod}
              paymentMethodType={paymentMethodType}
              paymentInstruction={paymentInstruction}
              emailTemplateName={emailTemplate}
              invoiceEmailTemplateId={invoiceEmailTemplateId}
              onSelectPaymentMethod={handlePaymentMethodDetails}
              onSelectEmailTemplate={handleEmailTemplateDetails}
              customerName={formData.customer_name}
              invoiceNumber={formData.invoice_number || 'To Be Autogenerated'}
              leadId={formData.lead}
              onScrollToLeadSection={scrollToLeadSection}
              formErrors={formErrors}
              showError={showError}
              defaultTemplateId={invoiceEmailTemplateId}
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
            <textarea className="form-control" name="note_to_recipient" onChange={handleChange} value={formData.note_to_recipient || ''} placeholder='Enter any special notes you would like the customer to see with their invoice.' onFocus={handleFieldFocus} onBlur={handleFieldBlur}>Thanks for the payment.</textarea>
            {showError('note_to_recipient') && <span className="error-message">{formErrors.note_to_recipient}</span>}
          </div>
          <div className="col-md-4 invoice-footer-notes">
            <label className="form-label">Internal Customer Notes</label>
            <textarea className="form-control" name="internal_customer_notes" onChange={handleChange} value={formData.internal_customer_notes || ''} placeholder='Internal notes about this customer for company use only.' onFocus={handleFieldFocus} onBlur={handleFieldBlur}>Thanks for the payment.</textarea>
            {showError('internal_customer_notes') && <span className="error-message">{formErrors.internal_customer_notes}</span>}
          </div>
          <div className="col-md-4 invoice-footer-notes">
            <label className="form-label">Memo On Statement</label>
            <textarea className="form-control" name="memo_on_statement" onChange={handleChange} value={formData.memo_on_statement || ''} placeholder="Short memo or description that appears on customer statements." onFocus={handleFieldFocus} onBlur={handleFieldBlur}>Thanks for the payment.</textarea>
            {showError('memo_on_statement') && <span className="error-message">{formErrors.memo_on_statement}</span>}
          </div>
        </div>

        <input type="hidden" name="save_invoice" value={formData.save_invoice} />

        <input type="hidden" name="getInvoiceId" id="getInvoiceId" className="getInvoiceId" value={formData.invoice_id || ''} />
				<input type="hidden" name="getCustomerId" className="getCustomerId" id="getCustomerId" value={formData.customer_invoice_no || ''} />
				<input type="hidden" name="qb_invoice_id" className="qb_invoice_id" value={formData.qb_invoice_id || ''} />
        <input type="hidden" name="invoice_status_id" className="invoice_status_id" value={formData.invoice_status_id || ''} />          

        <div className="mt-5 text-center">
          <button type="button" id="update_custom_invoices" className="nxt_btn mr-2" onClick={e => handlePreview(e, 'update')} disabled={isLoading}>Preview & Update</button>
          <button type="button" id="save_custom_invoices" className="nxt_btn mr-4" onClick={e => handlePreview(e, 'save')} disabled={isLoading}>Preview & Save</button>
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

export default EditInvoice;
