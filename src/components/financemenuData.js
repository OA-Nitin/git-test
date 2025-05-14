const financeMenuData = [
  {
    key: 'home',
    name: 'Dashboard',
    icon: 'dashicons-admin-home',
    path: '/dashboard'
  },
  {
    key: 'reports',
    name: 'Reports',
    icon: 'dashicons-chart-bar',
    children: [
      { key: 'leadReports', name: 'Lead Reports', path: '/reports/leads' },
      { key: 'ercLeadReport', name: 'ERC Lead Report', path: '/reports/erc-lead-report' },
      { key: 'stcLeadReport', name: 'STC Lead Report', path: '/reports/stc-lead-report' },
      { key: 'taxAmendmentLeadReport', name: 'Tax Amendment Lead Report', path: '/reports/tax-amendment-lead-report' },
      { key: 'auditAdvisoryLeadReport', name: 'Audit Advisory Lead Report', path: '/reports/audit-advisory-lead-report' },
      { key: 'rdcLeadReport', name: 'RDC Lead Report', path: '/reports/rdc-lead-report' },
      { key: 'partnershipLeadReport', name: 'Partnership Lead Report', path: '/reports/partnership-lead-report' },
      //{ key: 'advancedReports', name: 'Advanced Reports', path: '/reports/advanced-reports' },
    ],
  },
  {
    key: 'projects',
    name: 'Projects',
    icon: 'dashicons-analytics',
    children: [
      { key: 'allProjects', name: 'All Projects', path: '/projects/all' },
      { key: 'ercProjects', name: 'ERC Projects', path: '/projects/erc' },
      { key: 'stcProjects', name: 'STC Projects', path: '/projects/stc' },
      { key: 'taxAmendmentProjects', name: 'Tax Amendment Projects', path: '/projects/tax-amendment' },
      { key: 'auditAdvisoryProjects', name: 'Audit Advisory Projects', path: '/projects/audit-advisory' },
      { key: 'rdcProjects', name: 'RDC Projects', path: '/projects/rdc' },
    ],
  },
  {
    key: 'finance',
    name: 'Finance',
    icon: 'dashicons-media-document',
    children: [
      { key: 'manageInvoices', name: 'Manage Invoices', path: '/finance/invoices' },
      //{ key: 'createInvoice', name: 'Create Invoice', path: '/finance/create-invoice' },
      //{ key: 'invoiceTemplates', name: 'Invoice Templates', path: '/finance/invoice-templates' },
      //{ key: 'overdueInvoices', name: 'Overdue Invoices', path: '/finance/past-due-invoices' },
      //{ key: 'invoiceSettings', name: 'Invoice Settings', path: '/finance/interest-automation' },
    ],
  },
  // {
  //   key: 'affiliates',
  //   name: 'Affiliates',
  //   icon: 'dashicons-groups',
  //   children: [
  //     { key: 'eligibleAffiliates', name: 'Eligible Affiliates', path: '/affiliates/eligible' },
  //     { key: 'netCommission', name: 'Net Commission', path: '/affiliates/net-commission' },
  //     { key: 'tier1Commission', name: 'Tier-1 Commission', path: '/affiliates/tier1-commission' },
  //     { key: 'tier2Commission', name: 'Tier-2 Commission', path: '/affiliates/tier2-commission' },
  //     { key: 'adjustments', name: 'Adjustments', path: '/affiliates/adjustments' },
  //     { key: 'affiliatesManagement', name: 'Affiliates Management', path: '/affiliates/management' },
  //   ],
  // },
  // {
  //   key: 'auditLogs',
  //   name: 'Audit Logs',
  //   icon: 'dashicons-media-text',
  //   path: '/audit-logs'
  // },
  // {
  //   key: 'sales',
  //   name: 'Sales',
  //   icon: 'dashicons-chart-line',
  //   children: [
  //     { key: 'eligibleSPFP', name: 'Eligible SPFP', path: '/sales/eligible-spfp' },
  //     { key: 'allCommissions', name: 'All Commissions', path: '/sales/all-commissions' },
  //     { key: 'salesAdjustments', name: 'Adjustments', path: '/sales/adjustments' },
  //     { key: 'salesManagement', name: 'Sales Management', path: '/sales/management' },
  //   ],
  // },
  // {
  //   key: 'ercProjects',
  //   name: 'ERC Projects',
  //   icon: 'dashicons-media-document',
  //   children: [
  //     { key: 'generate941X', name: 'Generate 941X', path: '/erc-package/file-claim' },
  //     { key: '941XRecords', name: '941X Records', path: '/erc-package/941x-records' },
  //     { key: 'f911', name: 'F 911', path: '/erc-package/f911' },
  //   ],
  // },
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
  //   key: 'affiliateCommunication',
  //   name: 'Affiliate Communication',
  //   icon: 'dashicons-groups',
  //   children: [
  //     { key: 'affiliateCallLogs', name: 'Call Logs', path: '/affiliate-communication/call-logs' },
  //     { key: 'affiliateTextLogs', name: 'Text Logs', path: '/affiliate-communication/text-logs' },
  //     { key: 'affiliateEmailLogs', name: 'Email Logs', path: '/affiliate-communication/email-logs' },
  //     { key: 'affiliateMeetingLogs', name: 'Meeting Logs', path: '/affiliate-communication/meeting-logs' },
  //   ],
  // },
  // {
  //   key: 'reporting',
  //   name: 'Reporting',
  //   icon: 'dashicons-chart-area',
  //   children: [
  //     { key: 'allInvoices', name: 'All Invoices', path: '/reporting/all-invoices' },
  //   ],
  // },
  {
    key: 'support',
    name: 'Support',
    icon: 'dashicons-admin-users',
    path: '/support'
  },
  {
    key: 'contact',
    name: 'Contact',
    icon: 'dashicons-smartphone',
    path: '/contact'
  },
];

export default financeMenuData;
