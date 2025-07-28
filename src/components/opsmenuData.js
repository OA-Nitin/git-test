const opsMenuData = [
  // {
  //   key: 'home',
  //   name: 'Home',
  //   icon: 'dashicons-admin-home',
  //   path: '/dashboard'
  // },
  {
    key: 'reports',
    name: 'Reports',
    icon: 'dashicons-chart-bar',
    children: [
    { key: 'allLeads', name: 'Leads Reports', path: '/reports/leads/all' },
    { key: 'ercLeadReport', name: 'ERC Lead Report', path: '/reports/leads/erc' },
    { key: 'stcLeadReport', name: 'STC Lead Report', path: '/reports/leads/stc' },
    { key: 'rdcLeadReport', name: 'RDC Lead Report', path: '/reports/leads/rdc' },
    { key: 'partnershipLeadReport', name: 'Partnership Lead Report', path: '/reports/leads/partnership' },
    { key: 'taxAmendmentLeadReport', name: 'Tax Amendment Lead Report', path: '/reports/leads/tax-amendment' },
    { key: 'auditAdvisoryLeadReport', name: 'Audit Advisory Lead Report', path: '/reports/leads/audit-advisory' },
    ],
  },
  {
    key: 'opportunities',
    name: 'Opportunities',
    icon: 'dashicons-image-filter',
    children: [
      { key: 'opportunitiesReport', name: 'All Opportunities', path: '/reports/opportunities/all' },
      { key: 'ercOpportunities', name: 'ERC Opportunities', path: '/reports/opportunities/erc' },
      { key: 'stcOpportunities', name: 'STC Opportunities', path: '/reports/opportunities/stc' },
      { key: 'taxAmendmentOpportunities', name: 'Tax Amendment Opportunities', path: '/reports/opportunities/tax-amendment' },
      { key: 'auditAdvisoryOpportunities', name: 'Audit Advisory Opportunities', path: '/reports/opportunities/audit-advisory' },
      { key: 'rdcOpportunities', name: 'RDC Opportunities', path: '/reports/opportunities/rdc' },
      { key: 'partnershipOpportunities', name: 'Partnership Opportunities', path: '/reports/opportunities/partnership' },
      //{ key: 'milestoneStages', name: 'Milestone & Stages', path: '/reports/opportunities/milestone-stages' },
    ],
  },
  // {
  //   key: 'documents',
  //   name: 'Documents',
  //   icon: 'dashicons-upload',
  //   children: [
  //     { key: 'allDocuments', name: 'All Documents', path: '/documents/all-documents' },
  //     { key: 'allStcData', name: 'All STC Data', path: '/documents/all-stc-data' },
  //     { key: 'pendingDocuments', name: 'Pending Documents', path: '/documents/pending-documents' },
  //     { key: 'ercDocuments', name: 'ERC Documents', path: '/documents/erc-documents' },
  //     { key: 'stcDocuments', name: 'STC Documents', path: '/documents/stc-documents' },
  //     { key: 'taxDocuments', name: 'Tax Amendment Documents', path: '/documents/tax-documents' },
  //   ],
  // },
  // {
  //   key: 'newsletter',
  //   name: 'Newsletter',
  //   icon: 'dashicons-email',
  //   children: [
  //     { key: 'newsletterList', name: 'Newsletter List', path: '/newsletter/list' },
  //     { key: 'newsletterLogs', name: 'Newsletter Logs', path: '/newsletter/logs' },
  //     { key: 'sendNewsletter', name: 'Send Newsletter', path: '/newsletter/send' },
  //     { key: 'editLogs', name: 'Edit Logs', path: '/newsletter/edit-logs' },
  //     { key: 'emailScheduledList', name: 'Email Scheduled List', path: '/newsletter/email-scheduled-list' },
  //   ],
  // },
  // {
  //   key: 'ercProjects',
  //   name: 'ERC Projects',
  //   icon: 'dashicons-media-document',
  //   children: [
  //     { key: 'fileErcClaim', name: 'File ERC Claim', path: '/erc-package/file-claim' },
  //     { key: 'fpsoQuestionnaire', name: 'FPSO Questionnaire', path: '/erc-package/fpso-questionnaire' },
  //     { key: 'fpsoQuestionnaireReport', name: 'FPSO Questionnaire Report', path: '/erc-package/fpso-questionnaire-report' },
  //     { key: '941xRecords', name: '941X Records', path: '/erc-package/941x-records' },
  //     { key: 'fpsoList', name: 'FPSO List', path: '/erc-package/fpso-list' },
  //     { key: 'uploadFpso', name: 'Upload FPSO', path: '/erc-package/upload-fpso' },
  //     { key: 'ercEligibility', name: 'ERC Eligibility', path: '/erc-package/eligibility' },
  //     { key: 'eligibilityRecords', name: 'Eligibility Records', path: '/erc-package/eligibility-records' },
  //   ],
  // },
  {
    key: 'projects',
    name: 'Projects',
    icon: 'dashicons-analytics',
    children: [
      { key: 'allProjects', name: 'All Projects', path: '/reports/projects/all' },
      { key: 'ercProjects', name: 'ERC Projects', path: '/reports/projects/erc' },
      { key: 'stcProjects', name: 'STC Projects', path: '/reports/projects/stc' },
      // { key: 'taxAmendmentProjects', name: 'Tax Amendment Projects', path: '/reports/projects/tax-amendment' },
      // { key: 'auditAdvisoryProjects', name: 'Audit Advisory Projects', path: '/reports/projects/audit-advisory' },
      { key: 'rdcProjects', name: 'RDC Projects', path: '/reports/projects/rdc' },
    ],
  },
  {
      key: 'finance',
      name: 'Finance',
      icon: 'dashicons-image-filter',
      children: [
        { key: 'manageInvoice', name: 'Manage Invoices', path: '/invoice/report' },
        { key: 'pastDueInvoice', name: 'Past Due Invoice', path: '/past-due-invoice/report' },
        //{ key: 'createInvoice', name: 'Create Invoice', path: '/invoice/create-invoice' },
        //{ key: 'pastDueInvoices', name: 'Past Due Invoices', path: '/invoice/past-due-invoices' },
        //{ key: 'invoiceSettings', name: 'Invoice Settings', path: '/invoice/invoice-settings' },
      ],
    },
  // {
  //   key: 'leadCommunication',
  //   name: 'Lead Communication',
  //   icon: 'dashicons-analytics',
  //   children: [
  //     { key: 'callLogs', name: 'Call Logs', path: '/lead-communication/call-logs' },
  //     { key: 'textLogs', name: 'Text Logs', path: '/lead-communication/text-logs' },
  //     { key: 'emailLogs', name: 'Email Logs', path: '/lead-communication/email-logs' },
  //     { key: 'meetingLogs', name: 'Meeting Logs', path: '/lead-communication/meeting-logs' },
  //     { key: 'activitySummary', name: 'Activity Summary', path: '/lead-communication/activity-summary' },
  //   ],
  // },
  // {
  //   key: 'payroll',
  //   name: 'Payroll',
  //   icon: 'dashicons-welcome-widgets-menus',
  //   children: [
  //     { key: 'requestToken', name: 'Request Token', path: '/payroll/request-token' },
  //     { key: 'tokenList', name: 'Token List', path: '/payroll/token-list' },
  //     { key: 'payrollReport', name: 'Payroll Report', path: '/payroll/report' },
  //     { key: 'exportReports', name: 'Export Reports', path: '/payroll/export-reports' },
  //     { key: 'payrollSettings', name: 'Payroll Settings', path: '/payroll/settings' },
  //   ],
  // },
  // {
  //   key: 'affiliates',
  //   name: 'Affiliates',
  //   icon: 'dashicons-groups',
  //   children: [
  //     { key: 'eligibleAffiliates', name: 'Eligible Affiliates', path: '/affiliates/eligible' },
  //     { key: 'netCommission', name: 'Net Commission', path: '/affiliates/net-commission' },
  //     { key: 'affiliatesManagement', name: 'Affiliates Management', path: '/affiliates/management' },
  //   ],
  // },
  // {
  //   key: 'sales',
  //   name: 'Sales',
  //   icon: 'dashicons-chart-line',
  //   children: [
  //     { key: 'eligibleSPFP', name: 'Eligible SPFP', path: '/sales/eligible-spfp' },
  //     { key: 'allCommissions', name: 'All Commissions', path: '/sales/all-commissions' },
  //     { key: 'salesManagement', name: 'Sales Management', path: '/sales/management' },
  //   ],
  // },
  // {
  //   key: 'products',
  //   name: 'Products',
  //   icon: 'dashicons-products',
  //   children: [
  //     { key: 'productsList', name: 'Products', path: '/products/list' },
  //     { key: 'unitTypes', name: 'Unit Types', path: '/products/unit-types' },
  //     { key: 'productTypes', name: 'Product Types', path: '/products/product-types' },
  //     { key: 'productCategories', name: 'Product Categories', path: '/products/product-categories' },
  //     { key: 'currency', name: 'Currency', path: '/products/currency' },
  //   ],
  // },
  // {
  //   key: 'oneDriveSettings',
  //   name: 'OneDrive Settings',
  //   icon: 'dashicons-cloud',
  //   path: '/onedrive-settings'
  // },
  // {
  //   key: 'templates',
  //   name: 'Templates',
  //   icon: 'dashicons-welcome-widgets-menus',
  //   children: [
  //     { key: 'emailTemplates', name: 'Email Templates', path: '/templates/email-templates' },
  //     { key: 'createEmailTemplate', name: 'Create Email Template', path: '/templates/create-email-template' },
  //     { key: 'emailSentLog', name: 'Email Sent Log', path: '/templates/email-sent-log' },
  //     { key: 'smsTemplates', name: 'SMS Templates', path: '/templates/sms-templates' },
  //     { key: 'createSmsTemplate', name: 'Create SMS Templates', path: '/templates/create-sms-template' },
  //     { key: 'smsSentLogs', name: 'SMS Sent Logs', path: '/templates/sms-sent-logs' },
  //     { key: 'userUpdationForm', name: 'User Updation Form', path: '/templates/user-updation-form' },
  //   ],
  // },
  // {
  //   key: 'support',
  //   name: 'Support',
  //   icon: 'dashicons-admin-users',
  //   path: '/support'
  // },
  // {
  //   key: 'contacts',
  //   name: 'Contacts',
  //   icon: 'dashicons-smartphone',
  //   path: '/contacts'
  // },
  // {
  //   key: 'notesConfidentialSetting',
  //   name: 'Notes Confidential Setting',
  //   icon: 'dashicons-admin-generic',
  //   path: '/notes-confidential-setting'
  // },
  // {
  //   key: 'affiliateDashboardSetting',
  //   name: 'Affiliate Dashboard Setting',
  //   icon: 'dashicons-welcome-widgets-menus',
  //   path: '/affiliate-dashboard-settings'
  // },
];

export default opsMenuData;
