// src/data/menuData.js
export const menuData = [
  {
    key: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'dashicons-dashboard',
  },
  {
    key: 'createUser',
    name: 'Create User',
    path: '/create-user',
    icon: 'dashicons-admin-users',
  },
  {
    key: 'myProfile',
    name: 'My Profile',
    path: '/my-profile',
    icon: 'dashicons-id',
  },
  {
    key: 'projects',
    name: 'Projects',
    icon: 'dashicons-portfolio',
    children: [

      { key: 'projectsReport', name: 'Project Reports', path: '/reports/projects' },
      { key: 'ercProjects', name: 'ERC Projects Report', path: '/projects/erc' },
      { key: 'stcProjects', name: 'STC Projects', path: '/projects/stc' },
      { key: 'taxAmendmentProjects', name: 'Tax Amendment Projects', path: '/projects/tax-amendment' },
      { key: 'auditAdvisoryProjects', name: 'Audit Advisory Projects', path: '/projects/audit-advisory' },
      { key: 'rdcProjects', name: 'RDC Projects', path: '/projects/rdc' },
      { key: 'projectSettings', name: 'Project Settings', path: '/projects/settings' },
    ],
  },
  {
    key: 'reports',
    name: 'Reports',
    icon: 'dashicons-chart-bar',
    children: [
      { key: 'leadReports', name: 'Lead Reports', path: '/reports/leads' },
      { key: 'salesReports', name: 'Sales Reports', path: '/reports/sales' },
      { key: 'analytics', name: 'Analytics', path: '/reports/analytics' },
    ],
  },
  {
    key: 'finance',
    name: 'Finance',
    icon: 'dashicons-money-alt',
    children: [
      { key: 'manageInvoice', name: 'Manage Invoice', path: '/finance/invoices' },
      { key: 'createinvoice', name: 'Create Invoice', path: '/finance/create-invoice' }
    ],
  },
  {
    key: 'opportunities',
    name: 'Opportunities',
    icon: 'dashicons-image-filter',
    children: [
      { key: 'opportunitiesReport', name: 'Opportunities Report', path: '/opportunities/report' },
      { key: 'ercOpportunities', name: 'ERC Opportunities', path: '/opportunities/erc' },
      { key: 'stcOpportunities', name: 'STC Opportunities', path: '/opportunities/stc' },
      { key: 'taxAmendmentOpportunities', name: 'Tax Amendment Opportunities', path: '/opportunities/tax-amendment' },
      { key: 'auditAdvisoryOpportunities', name: 'Audit Advisory Opportunities', path: '/opportunities/audit-advisory' },
      { key: 'rdcOpportunities', name: 'RDC Opportunities', path: '/opportunities/rdc' },
      { key: 'partnershipOpportunities', name: 'Partnership Opportunities', path: '/opportunities/partnership' },
      { key: 'milestoneStages', name: 'Milestone & Stages', path: '/opportunities/milestone-stages' },
    ],
  },
  {
    key: 'examples',
    name: 'Examples',
    icon: 'dashicons-admin-appearance',
    children: [
      { key: 'notesExample', name: 'Notes Example', path: '/examples/notes' },
      { key: 'buttonsExample', name: 'Buttons Example', path: '/examples/buttons' },
      { key: 'pageContainerExample', name: 'Page Container', path: '/examples/page-container' }
    ],
  },
];
