// Centralized settings for invoice module

export const INVOICE_API_BASE = 'https://play.occamsadvisory.com/portal/wp-json';
export const INVOICE_V1 = `${INVOICE_API_BASE}/invoices/v1`;

// Common endpoints
export const ENDPOINTS = {
  GET_INVOICE_ACTION: `${INVOICE_V1}/get-invoice-action`,
  SEND_PARTIALLY_PAID: `${INVOICE_V1}/send-partially-paid-invoice-action`,
  CUSTOM_REMINDER_TEMPLATES: `${INVOICE_V1}/custom-reminder-templates`,
  SEND_REMINDER_ACTION: `${INVOICE_V1}/send-reminder-action`,
  SEND_REMINDER_MAIL_ACTION: `${INVOICE_V1}/send-reminder-mail-action`,
  SEND_ADD_INTEREST: `${INVOICE_V1}/send-add-interest-action`,
  INVOICE_LISTING: `${INVOICE_V1}/past-due-invoices`,
  PAUSE_INVOICE_REMINDER: `${INVOICE_V1}/send-pause-invoice-reminder-action`,
  RESUME_INVOICE_REMINDER: `${INVOICE_V1}/send-resume-invoice-reminder-action`,
  // Add more as needed
};

// Common payment modes (used in PartialPaidModalContent, etc.)
export const PAYMENT_MODES = [
  { label: 'Occams Initiated - eCheck', value: 'occams_initiated_eCheck' },
  { label: 'Occams Initiated - ACH', value: 'occams_initiated_ach' },
  { label: 'Client Initiated - Wire', value: 'occams_initiated_wire' },
  { label: 'Client Initiated - ACH', value: 'client_initiated_ach' },
  { label: 'Client Initiated - Check Mailed', value: 'client_initiated_check_mailed' },
  { label: 'Credit Card or Debit Card', value: 'credit_card_or_debit_card' },
];

// Example status map (customize as needed)
export const STATUS_MAP = {
  '0': 'Draft',
  '1': 'Sent',
  '2': 'Paid',
  '3': 'Partially Paid',
  '4': 'Cancelled',
  // Add more as needed
};

// Centralized merchant ID (update as needed)
export const MERCHANT_ID = '45117';

// Centralized status map for invoices
export const STATUS_MAP_FULL = {
  1: { text: 'Unpaid', color: '#FFA500' },
  2: { text: 'Paid', color: '#008000' },
  3: { text: 'Cancelled', color: '#FF0000' },
  4: { text: 'Draft', color: '#808080' },
  5: { text: 'Reminder', color: '#FFD700' },
  6: { text: 'Payment in process', color: '#0000FF' },
  14: { text: 'Void', color: '#FF0000' },
  17: { text: 'Partial paid', color: '#FF8C00' },
  19: { text: 'Payment Plan', color: '#FF0000' },
};

// Centralized actions map for invoices
export const ACTIONS_MAP = {
  1: { text: 'Unpaid' },
  2: { text: 'Paid' },
  3: { text: 'Cancelled' },
  4: { text: 'Draft' },
  6: { text: 'Payment in process' },
  14: { text: 'Void' },
  17: { text: 'Partial paid' },
  19: { text: 'Payment Plan' },
  resend: { text: 'Resend Invoice' },
  share_invoice_link: { text: 'Share Invoice Link' },
  send_reminder: { text: 'Send Reminder' },
  update_interest: { text: 'Update Interest' },
  cancel_auto_inv_reminder: { text: 'Pause Invoice Reminder' },
  resume_auto_inv_reminder: { text: 'Resume Invoice Reminder' },
};

// gett current login user data
export const getCurrentUserInvoice = () => {
  try {
    const userObj = JSON.parse(localStorage.getItem("user"));
    return userObj?.user || userObj?.data?.user || null;
  } catch (err) {
    console.error("Failed to parse user from localStorage:", err);
    return null;
  }
};

// Temporary: Initial date range for InvoiceReport (in days before today)
export const DEFAULT_INVOICE_DATE_RANGE_DAYS = 15; // null/0