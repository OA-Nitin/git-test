import axios from 'axios';
import Swal from 'sweetalert2';
import { ENDPOINTS } from './invoice-settings';

// API base URL
// const API_BASE_URL = 'https://play.occamsadvisory.com/portal/wp-json/invoices/v1';

// Action Handlers for Invoice Status Updates
export const handlePartialPaidSave = async (params) => {
  try {
    const response = await axios.post(
      ENDPOINTS.SEND_PARTIALLY_PAID,
      params
    );
    return response.data;
  } catch (error) {
    return { result: 'error', msg: error.message || 'Failed to save partial payment' };
  }
};


//--== Common send invoice action reusable function ==--//
const sendInvoiceStatusUpdate = async (params, actionType) => {
  const payload = { ...params, action_type: actionType };

  try {
    const response = await axios.post(`${ENDPOINTS.GET_INVOICE_ACTION.replace('get-invoice-action','send-invoice-action')}`, payload);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.message || `Failed to perform "${actionType}" action.`,
    };
  }
};

// Wrapper exports that reuse common function
export const handlePaidInvoiceSave = (params) => sendInvoiceStatusUpdate(params, 'paid');
export const handleCancelInvoiceSave = (params) => sendInvoiceStatusUpdate(params, 'cancel');
export const handlePaymentProcessSave = (params) => sendInvoiceStatusUpdate(params, 'payment in process');

//--== Common send invoice action reusable function ==--//

// Send Reminder
export const handleSendReminderSave = async (params) => {
  try {
    const res = await axios.post(
      ENDPOINTS.SEND_REMINDER_MAIL_ACTION,
      params
    );
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to send reminder.",
    };
  }
};
