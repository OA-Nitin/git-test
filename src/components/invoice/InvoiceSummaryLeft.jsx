import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaPen } from 'react-icons/fa';
import PaymentMethodModal from './PaymentMethodModal';
import EmailTemplateModal from './EmailTemplateModal';

const InvoiceSummaryLeft = ({
  paymentMethodName,
  paymentMethodType,
  paymentInstruction,
  otherBankInstructions,
  invoiceUrl,
  emailTemplateName,
  onSelectPaymentMethod,
  onSelectEmailTemplate,
  customerName,
  invoiceNumber,
  leadId,
  onScrollToLeadSection
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const handleEmailTemplateClick = () => {
    setShowTemplateModal(true);
  };

  const handlePaymentMethodSelect = (selectedMethod) => {
    onSelectPaymentMethod(selectedMethod);
    setShowPaymentModal(false);
  };

  const handleEmailTemplateSelect = (data) => {
    onSelectEmailTemplate(data);
    // Set the hidden field value after successful save
    const tempTypeInput = document.getElementById('email_temp_type_edited');
    if (tempTypeInput) tempTypeInput.value = 'custom_invoice_email_edited';
    setShowTemplateModal(false);
  };

  // Helper to map API values to user-friendly labels
  const paymentLabelMap = {
    'credit_card': 'Credit/Debit Card',
    'ach': 'Bank Transfer',
    'PayPal': 'PayPal',
    'Other Payment': 'Other Payment'
  };
  function getPaymentLabels(methods) {
    if (!methods) return '';
    return methods
      .split(',')
      .map(m => paymentLabelMap[m.trim()] || m.trim())
      .join(', ');
  }

  return (
    <div>
      <div className="mb-3 d-flex align-items-center">
        <strong className="me-2">Customer Payment Options*</strong>
        <FaPen
          style={{ cursor: 'pointer' }}
          onClick={() => setShowPaymentModal(true)}
          className="text-primary"
        />
      </div>
      <div className="mb-2">
        <div className="border p-2 bg-white" style={{ display: 'inline-block' }}>
          {getPaymentLabels(paymentMethodName) || 'Select payment method'}
        </div>
      </div>
      <div className="mb-2">Contact Occams Advisory Inc. to pay.</div>
      <div className="mb-1 d-flex align-items-center">
        <span>Email Template:</span>
        <span className="ms-1 email_template_select">{emailTemplateName || 'Select email template'}</span>
        <FaPen
          style={{ cursor: 'pointer', marginLeft: 8 }}
          onClick={handleEmailTemplateClick}
          className="text-primary"
        />
      </div>

      {/* Hidden Fields */}
      <input 
        type="hidden" 
        name="payment_method" 
        value={paymentMethodName} 
      />
      <input 
        type="hidden" 
        name="payment_method_type" 
        value={''} 
      />
      <input 
        type="hidden" 
        name="payment_instruction" 
        value={''} 
      />
      <input 
        type="hidden" 
        name="invoice_email_template_id" 
        value={''} 
      />
      <input type="hidden" name="email_temp_type_edited" id="email_temp_type_edited" />
      {/* Payment Method Modal */}
      <PaymentMethodModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        onSelectPaymentMethod={handlePaymentMethodSelect}
        currentPaymentMethodName={paymentMethodName}
        currentPaymentMethodType={paymentMethodType}
        currentPaymentInstruction={paymentInstruction}
        currentOtherBankInstructions={otherBankInstructions}
        currentInvoiceUrl={invoiceUrl}
      />

      {/* Email Template Modal */}
      <EmailTemplateModal
        show={showTemplateModal}
        onHide={() => {
          setShowTemplateModal(false);
        }}
        onSubmit={handleEmailTemplateSelect}
        customerName={customerName}
        invoiceNumber={invoiceNumber}
        defaultTemplateId="108"
      />
    </div>
  );
};

export default InvoiceSummaryLeft; 