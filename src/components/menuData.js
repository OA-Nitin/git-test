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
    key: 'contact',
    name: 'Contact',
    icon: 'dashicons-smartphone',
    children: [
      { key: 'contacts', name: 'Contacts', path: '/contacts' },
      { key: 'contactSettings', name: 'Settings', path: '/contact-settings' },
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
];
