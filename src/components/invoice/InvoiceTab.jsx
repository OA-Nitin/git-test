// Past Due Tabs
import React, { useState} from "react";
import '../common/ReportStyle.css';

const invoiceTabs = [
  { label: 'All', value: 'all' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Payment In Process', value: 'in_process' },
  { label: 'Partially Paid', value: 'partially_paid' },
  { label: 'Paid', value: 'paid' },
  { label: 'Over Due', value: 'overdue' }
];

const InvoiceTabs = ({ activeTab, onTabChange }) => (
  <div className="manage-invoices-tabs-bar">
    <div className="tabs-list">
      {invoiceTabs.map(tab => (
        <button
          key={tab.value}
          className={`tab-btn${activeTab === tab.value ? " active" : ""}`}
          onClick={() => onTabChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  </div>
);


export default InvoiceTabs;