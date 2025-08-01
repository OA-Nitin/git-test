import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import PageContainer from '../common/PageContainer.jsx';
import TemplatePreviewModal from './TemplatePreviewModal.jsx';
import './InvoiceSettings.css';
import { ENDPOINTS, MERCHANT_ID } from "./settings.js";

const InvoiceSettings = () => {
  // General Settings State
  const [interestRate, setInterestRate] = useState('');
  const [invoiceType, setInvoiceType] = useState('');
  
  // Invoice Reminder Settings State
  const [invoice_reminders, setInvoiceReminders] = useState([
    {
      id: 1,
      days: 2, // Changed from string to integer
      template_id: '',
      sms_template_id: '12',
      repeat_days: null,
      days_type: 'calendar'
    },
    {
      id: 2,
      days: 5, // Changed from string to integer
      template_id: '',
      sms_template_id: '14',
      repeat_days: null,
      days_type: 'calendar'
    },
    {
      id: 3,
      days: 16, // Changed from string to integer
      template_id: '',
      sms_template_id: '12',
      repeat_days: null,
      days_type: 'calendar'
    }
  ]);

  // Template Options
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [emailTemplateOptions, setEmailTemplateOptions] = useState([]);

  const smsTemplates = [
    { value: '', label: 'Select reminder sms template' },
    { value: '11', label: 'Initial Friendly SMS Reminder' },
    { value: '12', label: 'Second Direct SMS Reminder' },
    { value: '13', label: 'Firm SMS Reminder' },
    { value: '14', label: 'Final Follow-Up SMS Reminder' }
  ];

  const overdueDaysOptions = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
    '31'
  ];

  const repeatDaysOptions = [
    { value: '', label: 'Select repeat days' },
    { value: '1', label: 'Repeat every 1 day' },
    { value: '2', label: 'Repeat every 2 days' },
    { value: '3', label: 'Repeat every 3 days' },
    { value: '4', label: 'Repeat every 4 days' },
    { value: '5', label: 'Repeat every 5 days' },
    { value: '6', label: 'Repeat every 6 days' },
    { value: '7', label: 'Repeat every 7 days' },
    { value: '8', label: 'Repeat every 8 days' },
    { value: '9', label: 'Repeat every 9 days' },
    { value: '10', label: 'Repeat every 10 days' },
    { value: '11', label: 'Repeat every 11 days' },
    { value: '12', label: 'Repeat every 12 days' },
    { value: '13', label: 'Repeat every 13 days' },
    { value: '14', label: 'Repeat every 14 days' },
    { value: '15', label: 'Repeat every 15 days' },
  ];

  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templateData, setTemplateData] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(false);

  // Fetch settings on component mount
  useEffect(() => {
    fetchInvoiceSettings();
    fetchEmailTemplates();
  }, []);

  const fetchInvoiceSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(ENDPOINTS.GET_INVOICE_SETTINGS);
      if (response.data.success) {
        const data = response.data.data[0];
        setInterestRate(data.interest_rate || '25.00');
        setInvoiceType(data.invoice_type || 'IR/BR Invoices');
        
        // Parse the invoice_reminder_setting JSON string
        let parsedReminders = [];
        if (data.invoice_reminder_setting) {
          try {
            parsedReminders = JSON.parse(data.invoice_reminder_setting);
            // Add default SMS template ID and days_type to each reminder if not present
            parsedReminders = parsedReminders.map((reminder, index) => ({
              ...reminder,
              sms_template_id: reminder.sms_template_id || reminder.sms_template_id || '12', // Default to "Second Direct SMS Reminder"
              days_type: reminder.days_type || 'calendar',
              days: parseInt(reminder.days) || reminder.days // Convert days to integer if possible
            }));
            // console.log('Original reminder structure:', JSON.parse(data.invoice_reminder_setting));
            // console.log('Modified reminders:', parsedReminders);
          } catch (error) {
            console.error('Error parsing invoice_reminder_setting:', error);
            parsedReminders = [];
          }
        }
        setInvoiceReminders(parsedReminders);
        // console.log('Parsed invoice reminders with SMS templates:', parsedReminders);
        // console.log(data.invoice_reminder_setting);
      }
    } catch (error) {
      console.error('Error fetching invoice settings:', error);
      Swal.fire('Error', 'Failed to load invoice settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailTemplates = async () => {
    try {
      const response = await axios.get(ENDPOINTS.GET_EMAIL_TEMPLATES);
      if (response.data.success) {
        const templates = response.data.data;
        setEmailTemplates(templates);
        
        // Create options for dropdown
        const options = templates.map(template => ({
          value: template.templateid,
          label: template.name
        }));
        // console.log('Email template options:', options);
        setEmailTemplateOptions(options);
      }
    } catch (error) {
      console.error('Error fetching email templates:', error);
      Swal.fire('Error', 'Failed to load email templates', 'error');
    }
  };

  const saveInvoiceSettings = async () => {
    setSaving(true);
    try {
      // Remove 'id' field from each invoice reminder before submitting
      const cleanedInvoiceReminders = invoice_reminders.map(({ id, ...reminder }) => reminder);
      
      // Convert payload to FormData
      const formData = new FormData();
      formData.append('merchant_id', '45117');
      formData.append('interest_rate', parseFloat(interestRate));
      formData.append('invoice_type', invoiceType);
      formData.append('type', 'merchant_setting');
      formData.append('invoice_reminders', JSON.stringify(cleanedInvoiceReminders));
      
      const response = await axios.post(ENDPOINTS.SAVE_INVOICE_SETTINGS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.data.status === 200) {
        Swal.fire('Success', response.data.message, 'success');
      } else {
        throw new Error(response.data.message || 'Failed to save settings');
      }
    } catch (error) {
      // console.error('Error saving invoice settings:', error);
      // console.error('Error response:', error.response?.data);
      // console.error('Error status:', error.response?.status);
      Swal.fire('Error', `Failed to save invoice settings: Failed to save invoice settings}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const addInvoiceReminder = () => {
    const newInvoiceReminder = {
      id: Date.now(),
      days: 1, // Changed from string to integer
      template_id: emailTemplateOptions[0]?.value || '',
      sms_template_id: smsTemplates[1]?.value || '12', // Default to "Second Direct SMS Reminder"
      repeat_days: null,
      days_type: 'calendar'
    };
    setInvoiceReminders([...invoice_reminders, newInvoiceReminder]);
  };

  const removeInvoiceReminder = (index) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This invoice reminder will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setInvoiceReminders(invoice_reminders.filter((invoice_reminder, i) => i !== index));
      }
    });
  };

  const updateInvoiceReminder = (index, field, value) => {
    setInvoiceReminders(invoice_reminders.map((invoice_reminder, i) => 
      i === index ? { ...invoice_reminder, [field]: value } : invoice_reminder
    ));
  };

  const previewInvoiceReminder = async (invoice_reminder) => {
    setTemplateLoading(true);
    try {
      // Call the preview API
      const formData = new FormData();
      formData.append('template_id', invoice_reminder.template_id);
      formData.append('sms_template_id', invoice_reminder.sms_template_id);
      
      const response = await axios.post(ENDPOINTS.PREVIEW_EMAIL_TEMPLATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Set template data and open modal
        setTemplateData(response.data.data);
        setIsModalOpen(true);
      } else {
        Swal.fire('Error', 'Failed to load email template preview', 'error');
      }
    } catch (error) {
      console.error('Error loading email template preview:', error);
      Swal.fire('Error', 'Failed to load email template preview', 'error');
    } finally {
      setTemplateLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer title="Invoice Settings">
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading invoice settings...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Invoice Settings">
      {templateLoading && (
      <div className="overlay-loading d-flex flex-column justify-content-center align-items-center">
        <svg class="loader" viewBox="0 0 200 100">
          <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#007bff" />
          <stop offset="100%" stop-color="#ff6600" />
          </linearGradient>
          </defs>
          <path class="infinity-shape"
                d="M30,50
                  C30,20 70,20 100,50
                  C130,80 170,80 170,50
                  C170,20 130,20 100,50
                  C70,80 30,80 30,50"
              />
        </svg>
        <p className="mt-3 mb-0 text-muted">Processing data...</p>
      </div>
      )}
      <div className="invoice-settings-container">
        {/* General Invoice Settings - No Title */}
        <div className="settings-section">
          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="interestRate" className="form-label">Interest Rate(%)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  id="interestRate"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  step="0.01"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div className="col-md-8">
              <div className="form-group">
                <label htmlFor="invoiceType" className="form-label">Invoice Type</label>
                <select
                  className="form-control form-control-lg"
                  id="invoiceType"
                  value={invoiceType}
                  onChange={(e) => setInvoiceType(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="retainers">IR/BR Invoices</option>
                  <option value="success">Success Invoices</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Reminder Configuration */}
        <div className="settings-section">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="section-title mb-0">Invoice Reminder</h5>
            <button
              className="add-reminder-btn"
              onClick={addInvoiceReminder}
            >
              <i className="fas fa-plus"></i>
              Add More Reminder
            </button>
          </div>

          <div className="reminder-table">
            <div className="reminder-header">
              <div className="reminder-col">OVERDUE DAYS</div>
              <div className="reminder-col">INVOICE EMAIL TEMPLATE</div>
              <div className="reminder-col">INVOICE SMS TEMPLATE</div>
              <div className="reminder-col">ACTION</div>
            </div>

            {invoice_reminders.map((invoice_reminder, index) => (
              <div key={index} className="reminder-row">
                <div className="reminder-col">
                  <div className="d-flex">
                    <select
                      className="form-control form-control-sm"
                      value={invoice_reminder.days || ''}
                      onChange={(e) => updateInvoiceReminder(index, 'days', parseInt(e.target.value) || e.target.value)}
                    >
                      {overdueDaysOptions.map(day => (
                        <option key={day} value={day}>{day} days</option>
                      ))}
                    </select>
                    {invoice_reminder.days === 31 && (
                      <select
                        className="form-control form-control-sm"
                        value={invoice_reminder.repeat_days || ''}
                        onChange={(e) => updateInvoiceReminder(index, 'repeat_days', e.target.value)}
                      >
                        {repeatDaysOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <div className="reminder-col">
                  <select
                    className="form-control form-control-sm"
                    value={invoice_reminder.template_id || ''}
                    onChange={(e) => updateInvoiceReminder(index, 'template_id', e.target.value)}
                  >
                    <option value="">Select Email Template</option>
                    {emailTemplateOptions.map(template => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="reminder-col">
                  <select
                    className="form-control form-control-sm"
                    value={invoice_reminder.sms_template_id || '12'}
                    onChange={(e) => updateInvoiceReminder(index, 'sms_template_id', e.target.value)}
                  >
                    <option value="">Select reminder sms template</option>
                    <option value="11">Initial Friendly SMS Reminder</option>
                    <option value="12">Second Direct SMS Reminder</option>
                    <option value="13">Firm SMS Reminder</option>
                    <option value="14">Final Follow-Up SMS Reminder</option>
                  </select>
                </div>
                <div className="reminder-col">
                  <div className="d-flex gap-2">
                    <button
                      className="preview-btn"
                      onClick={() => previewInvoiceReminder(invoice_reminder)}
                      disabled={loading}
                    >
                      Preview
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => removeInvoiceReminder(index)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="save-button-container">
          <button
            className="save-settings-btn"
            onClick={saveInvoiceSettings}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </div>
      
      {/* Template Preview Modal */}
      <TemplatePreviewModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        templateData={templateData}
      />
    </PageContainer>
  );
};

export default InvoiceSettings; 