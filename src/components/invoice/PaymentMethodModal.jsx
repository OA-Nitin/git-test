import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const PaymentMethodModal = ({
  show,
  onHide,
  onSelectPaymentMethod,
  currentPaymentMethodName,
  currentPaymentMethodType,
  currentPaymentInstruction,
  currentOtherBankInstructions,
  currentInvoiceUrl
}) => {
  const [paymentOption, setPaymentOption] = useState(currentPaymentMethodType || 'quickbook'); // 'quickbook' or 'others'
  const [qbCreditCard, setQbCreditCard] = useState(false);
  const [qbBankTransfer, setQbBankTransfer] = useState(false);
  const [qbBankInstructions, setQbBankInstructions] = useState(currentPaymentMethodType === 'quickbook' ? currentPaymentInstruction : '');

  const [otherCreditCard, setOtherCreditCard] = useState(false);
  const [otherBankTransfer, setOtherBankTransfer] = useState(false);
  const [otherPayPal, setOtherPayPal] = useState(false);
  const [otherPayment, setOtherPayment] = useState(false);
  const [otherPaymentLink, setOtherPaymentLink] = useState(currentInvoiceUrl || '');
  const [otherBankInstructions, setOtherBankInstructions] = useState(currentOtherBankInstructions || '');

  // Initialize state based on currentPaymentMethodName and currentPaymentInstruction when modal opens or current value changes
  useEffect(() => {
    if (show) {
      setPaymentOption(currentPaymentMethodType || 'quickbook');
      // Infer payment option from currentPaymentMethodName
      if (currentPaymentMethodName && (
          currentPaymentMethodName.includes('PayPal') ||
          currentPaymentMethodName.includes('Other Payment')
        )) {
        setPaymentOption('others');
      } else {
        setPaymentOption('quickbook');
      }
      setQbCreditCard(false);
      setQbBankInstructions(currentPaymentMethodType === 'quickbook' ? currentPaymentInstruction : '');
      setOtherCreditCard(false);
      setOtherBankTransfer(false);
      setOtherPayPal(false);
      setOtherPayment(false);
      setOtherPaymentLink(currentInvoiceUrl || '');
      setOtherBankInstructions(currentOtherBankInstructions || '');

      // If no method is set, default to Bank Transfer checked
      if (!currentPaymentMethodName) {
        setQbBankTransfer(true);
      } else {
        // Parse the parent's value
        const methods = currentPaymentMethodName.split(',').map(m => m.trim());
        setQbCreditCard(methods.includes('credit_card'));
        setQbBankTransfer(methods.includes('ach'));
        // For Others payment option
        setOtherCreditCard(methods.includes('credit_card'));
        setOtherBankTransfer(methods.includes('ach'));
        setOtherPayPal(methods.includes('PayPal'));
        setOtherPayment(methods.includes('Other Payment'));
      }
    }
  }, [show, currentPaymentMethodName, currentPaymentMethodType, currentPaymentInstruction, currentOtherBankInstructions, currentInvoiceUrl]);

  // Helper to build selected method string
  const buildSelectedMethod = () => {
    if (paymentOption === 'quickbook') {
      const qbMethods = [];
      if (qbCreditCard) qbMethods.push('credit_card');
      if (qbBankTransfer) qbMethods.push('ach');
      return qbMethods.join(',');
    } else {
      const otherMethods = [];
      if (otherCreditCard) otherMethods.push('credit_card');
      if (otherBankTransfer) otherMethods.push('ach');
      if (otherPayPal) otherMethods.push('PayPal');
      if (otherPayment) otherMethods.push('Other Payment');
      return otherMethods.join(',');
    }
  };

  // On any checkbox or instruction change, only update local state
  const handleCheckboxChange = (setter) => (e) => {
    setter(e.target.checked);
  };
  const handleInstructionChange = (setter, value) => {
    setter(value);
  };

  // Change Other Payment Link to input type url with validation
  const handleSave = () => {
    let payment_instruction = '';
    let invoice_url = '';
    if (paymentOption === 'quickbook') {
      payment_instruction = qbBankInstructions;
    } else if (paymentOption === 'others' && otherBankTransfer) {
      payment_instruction = otherBankInstructions;
    }
    if (paymentOption === 'others' && otherPayment) {
      invoice_url = otherPaymentLink;
    }
    onSelectPaymentMethod({
      method: buildSelectedMethod(),
      payment_method_type: paymentOption,
      payment_instruction,
      invoice_url
    });
    setTimeout(() => {
      onHide();
    }, 100);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" dialogClassName="payment-method-modal">
      <Modal.Header closeButton>
        <Modal.Title>Payment Method</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Col>
              <Form.Check
                inline
                type="radio"
                label="Quickbook"
                name="paymentOption"
                value="quickbook"
                checked={paymentOption === 'quickbook'}
                onChange={() => setPaymentOption('quickbook')}
              />
              <Form.Check
                inline
                type="radio"
                label="Others"
                name="paymentOption"
                value="others"
                checked={paymentOption === 'others'}
                onChange={() => setPaymentOption('others')}
              />
            </Col>
          </Row>

          {paymentOption === 'quickbook' && (
            <div className="p-3 border rounded">
              <Form.Group className="mb-2">
                <Form.Check
                  type="checkbox"
                  id="qb-credit-card-check"
                  label="Credit/Debit Card"
                  checked={qbCreditCard}
                  onChange={handleCheckboxChange(setQbCreditCard)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="qb-bank-transfer-check"
                  label="Bank Transfer"
                  checked={qbBankTransfer}
                  onChange={handleCheckboxChange(setQbBankTransfer)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>QB Bank Transfer Instructions:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={qbBankInstructions}
                  onChange={(e) => handleInstructionChange(setQbBankInstructions, e.target.value)}
                />
              </Form.Group>
            </div>
          )}

          {paymentOption === 'others' && (
            <div className="p-3 border rounded">
              <Form.Group className="mb-2">
                <Form.Check
                  type="checkbox"
                  id="other-credit-card-check"
                  label="Credit/Debit Card"
                  checked={otherCreditCard}
                  onChange={handleCheckboxChange(setOtherCreditCard)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Check
                  type="checkbox"
                  id="other-bank-transfer-check"
                  label="Bank transfer"
                  checked={otherBankTransfer}
                  onChange={e => {
                    setOtherBankTransfer(e.target.checked);
                    if (!e.target.checked) setOtherBankInstructions('');
                  }}
                />
              </Form.Group>
              {/* Show instructions only if Bank transfer is checked */}
              {otherBankTransfer && (
                <Form.Group className="mb-2">
                  <Form.Label>Other Bank Transfer Instructions:</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={otherBankInstructions}
                    onChange={e => setOtherBankInstructions(e.target.value)}
                  />
                </Form.Group>
              )}
              <Form.Group className="mb-2">
                <Form.Check
                  type="checkbox"
                  id="other-paypal-check"
                  label="PayPal"
                  checked={otherPayPal}
                  onChange={handleCheckboxChange(setOtherPayPal)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="other-payment-check"
                  label="Other Payment"
                  checked={otherPayment}
                  onChange={handleCheckboxChange(setOtherPayment)}
                />
              </Form.Group>
              {otherPayment && (
                <Form.Group>
                  <Form.Label>Other Payment Link:</Form.Label>
                  <Form.Control
                    type="url"
                    value={otherPaymentLink}
                    onChange={e => setOtherPaymentLink(e.target.value)}
                    placeholder="https://quickbooks.intuit.com/in/"
                    required={otherPayment}
                    pattern="https?://.+"
                  />
                  {/* Optionally show validation error */}
                </Form.Group>
              )}
            </div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
       
        <Button className='occams_submit_btn' onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentMethodModal; 