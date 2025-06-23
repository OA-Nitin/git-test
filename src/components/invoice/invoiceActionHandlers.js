import axios from 'axios';
import Swal from 'sweetalert2';

// API base URL
const API_BASE_URL = 'https://play.occamsadvisory.com/portal/wp-json/invoices/v1';

// Action Handlers for Invoice Status Updates
export const handleUnpaidAction = async (invoiceId, merchantId, fetchInvoices) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/update-status`,
      {
        invoice_id: invoiceId,
        status_id: 1, // Unpaid status
        merchant_id: merchantId
      }
    );
    
    if (response.data.success) {
      Swal.fire('Success', 'Invoice status updated to Unpaid', 'success');
      fetchInvoices();
    } else {
      throw new Error(response.data.message || 'Failed to update status');
    }
  } catch (error) {
    Swal.fire('Error', 'Failed to update invoice status', 'error');
  }
};

export const handlePaidAction = async (invoiceId, merchantId, fetchInvoices) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/update-status`,
      {
        invoice_id: invoiceId,
        status_id: 2, // Paid status
        merchant_id: merchantId
      }
    );
    
    if (response.data.success) {
      Swal.fire('Success', 'Invoice marked as Paid', 'success');
      fetchInvoices();
    } else {
      throw new Error(response.data.message || 'Failed to update status');
    }
  } catch (error) {
    Swal.fire('Error', 'Failed to update invoice status', 'error');
  }
};

export const handleCancelledAction = async (invoiceId, merchantId, fetchInvoices) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/update-status`,
      {
        invoice_id: invoiceId,
        status_id: 3, // Cancelled status
        merchant_id: merchantId
      }
    );
    
    if (response.data.success) {
      Swal.fire('Success', 'Invoice has been cancelled', 'success');
      fetchInvoices();
    } else {
      throw new Error(response.data.message || 'Failed to cancel invoice');
    }
  } catch (error) {
    Swal.fire('Error', 'Failed to cancel invoice', 'error');
  }
};

export const handleDraftAction = async (invoiceId, merchantId, fetchInvoices) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/update-status`,
      {
        invoice_id: invoiceId,
        status_id: 4, // Draft status
        merchant_id: merchantId
      }
    );
    
    if (response.data.success) {
      Swal.fire('Success', 'Invoice saved as draft', 'success');
      fetchInvoices();
    } else {
      throw new Error(response.data.message || 'Failed to save as draft');
    }
  } catch (error) {
    Swal.fire('Error', 'Failed to save invoice as draft', 'error');
  }
};

export const handleReminderAction = async (invoiceId, merchantId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/send-reminder`,
      {
        invoice_id: invoiceId,
        merchant_id: merchantId
      }
    );
    
    if (response.data.success) {
      Swal.fire('Success', 'Reminder sent successfully', 'success');
    } else {
      throw new Error(response.data.message || 'Failed to send reminder');
    }
  } catch (error) {
    Swal.fire('Error', 'Failed to send reminder', 'error');
  }
};

export const handlePaymentProcessAction = async (invoiceId, merchantId, fetchInvoices) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/update-status`,
      {
        invoice_id: invoiceId,
        status_id: 6, // Payment in process status
        merchant_id: merchantId
      }
    );
    
    if (response.data.success) {
      Swal.fire('Success', 'Payment process initiated', 'success');
      fetchInvoices();
    } else {
      throw new Error(response.data.message || 'Failed to initiate payment process');
    }
  } catch (error) {
    Swal.fire('Error', 'Failed to initiate payment process', 'error');
  }
};

export const handleVoidAction = async (invoiceId, merchantId, fetchInvoices) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/void-invoice`,
      {
        invoice_id: invoiceId,
        merchant_id: merchantId
      }
    );
    
    if (response.data.success) {
      Swal.fire('Success', 'Invoice has been voided', 'success');
      fetchInvoices();
    } else {
      throw new Error(response.data.message || 'Failed to void invoice');
    }
  } catch (error) {
    Swal.fire('Error', 'Failed to void invoice', 'error');
  }
};

export const handlePartialPaidAction = async (invoiceId, merchantId, fetchInvoices) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/update-status`,
      {
        invoice_id: invoiceId,
        status_id: 17, // Partial paid status
        merchant_id: merchantId
      }
    );
    
    if (response.data.success) {
      Swal.fire('Success', 'Invoice marked as partially paid', 'success');
      fetchInvoices();
    } else {
      throw new Error(response.data.message || 'Failed to update status');
    }
  } catch (error) {
    Swal.fire('Error', 'Failed to update invoice status', 'error');
  }
};

export const handlePaymentPlanAction = async (invoiceId, merchantId, fetchInvoices) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/create-payment-plan`,
      {
        invoice_id: invoiceId,
        merchant_id: merchantId
      }
    );
    
    if (response.data.success) {
      Swal.fire('Success', 'Payment plan created successfully', 'success');
      fetchInvoices();
    } else {
      throw new Error(response.data.message || 'Failed to create payment plan');
    }
  } catch (error) {
    Swal.fire('Error', 'Failed to create payment plan', 'error');
  }
};

export const handleCancelReminderAction = async (invoiceId, merchantId, fetchInvoices) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/cancel-reminder`,
      {
        invoice_id: invoiceId,
        merchant_id: merchantId
      }
    );
    
    if (response.data.success) {
      Swal.fire('Success', 'Invoice reminder cancelled', 'success');
      fetchInvoices();
    } else {
      throw new Error(response.data.message || 'Failed to cancel reminder');
    }
  } catch (error) {
    Swal.fire('Error', 'Failed to cancel reminder', 'error');
  }
};