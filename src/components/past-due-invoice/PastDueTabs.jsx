// Past Due Tabs
import React, { useState} from "react";
import '../common/ReportStyle.css';

const pastDueTabs = [
  { label: "15 Days", value: "15 Days" },
  { label: "21 Days", value: "21 Days" },
  { label: "25 Days", value: "25 Days" },
  { label: "30 Days", value: "30 Days" },
  { label: "30+", value: "30+" },
];

const PastDueTabs = ({ activeTab, onTabChange }) => (
  <div className="past-due-tabs-bar">
    <div className="tabs-list">
      {pastDueTabs.map(tab => (
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

export default PastDueTabs;