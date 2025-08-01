// Centralized settings for invoice module

export const INVOICE_API_BASE = 'https://play.occamsadvisory.com/portal/wp-json';
export const INVOICE_V1 = `${INVOICE_API_BASE}/v1`;

// Common endpoints
export const ENDPOINTS = {
  GET_EMAIL_TEMPLATES: `${INVOICE_V1}/get_invoice_reminder_email_templates`,
  GET_INVOICE_SETTINGS: `${INVOICE_API_BASE}/v1/get_invoice_setting`,
  SAVE_INVOICE_SETTINGS: `${INVOICE_API_BASE}/v1/save_invoice_setting`,
  PREVIEW_EMAIL_TEMPLATE: `${INVOICE_API_BASE}/v1/preview_email_template_invoice_setting`,
  // Add more as needed
};

// Centralized merchant ID (update as needed)
export const MERCHANT_ID = '45117';