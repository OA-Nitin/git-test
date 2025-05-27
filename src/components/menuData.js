// src/data/menuData.js
export const menuData = [
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
];
