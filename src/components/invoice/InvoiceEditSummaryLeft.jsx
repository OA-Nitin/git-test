import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaPen } from 'react-icons/fa';
import PaymentMethodModal from './PaymentMethodModal';
import EmailTemplateModal from './EmailTemplateModal';

const InvoiceEditSummaryLeft = ({
  paymentMethodName,
  paymentMethodType,
  paymentInstruction,
  emailTemplateName,
  onSelectPaymentMethod,
  onSelectEmailTemplate,
  customerName,
  invoiceNumber,
  leadId,
  onScrollToLeadSection,
  defaultTemplateId, // <-- add this prop
  invoiceEmailTemplateId // <-- add this prop
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    methods: '',
    type: '',
    instruction: ''
  });
  // Remove local emailTemplateId state

  // Set initial payment details from props
  useEffect(() => {
    setPaymentDetails({
      methods: paymentMethodName || '',
      type: paymentMethodType || '',
      instruction: paymentInstruction || ''
    });
  }, [paymentMethodName, paymentMethodType, paymentInstruction]);

  const handleEmailTemplateClick = () => {
    setShowTemplateModal(true);
  };

  const handlePaymentMethodSelect = (selectedMethod) => {
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
    let instruction = paymentInstruction;
    if (!instruction) {
      const instructionMatch = methodString.match(/Instructions:\s*([^)]+)/);
      instruction = instructionMatch ? instructionMatch[1].trim() : '';
    }

    // Update payment details state
    setPaymentDetails({
      methods: paymentMethods,
      type: paymentType,
      instruction: instruction
    });

    // Call the original handler with the full string or object as needed
    onSelectPaymentMethod(selectedMethod);
  };

  const handleEmailTemplateSelect = (data) => {
    // Pass title and templateId to the parent
    onSelectEmailTemplate({
      title: data.title,
      templateId: data.templateId
    });
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
          {getPaymentLabels(paymentDetails.methods) || 'Select payment method'}
        </div>
      </div>
      {paymentDetails.instruction && (
        <div className="mb-2"><strong>Instructions:</strong> {paymentDetails.instruction}</div>
      )}
      <div className="mb-1 d-flex align-items-center">
        <span>Email Template:</span>
        <span className="ms-1">{emailTemplateName || 'Select email template'}</span>
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
        value={paymentDetails.methods} 
      />
      <input 
        type="hidden" 
        name="payment_method_type" 
        value={paymentDetails.type} 
      />
      <input 
        type="hidden" 
        name="payment_instruction" 
        value={paymentDetails.instruction} 
      />
       <input 
        type="hidden" 
        name="invoice_email_template_id" 
        id="invoice_email_template_id"
        value={invoiceEmailTemplateId || ''} 
      />

      {/* Payment Method Modal */}
      <PaymentMethodModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        onSelectPaymentMethod={handlePaymentMethodSelect}
        currentPaymentMethodName={paymentMethodName}
        currentPaymentMethodType={paymentMethodType}
        currentPaymentInstruction={paymentInstruction}
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
        defaultTemplateId={defaultTemplateId || '108'}
      />
    </div>
  );
};

export default InvoiceEditSummaryLeft; 