import React from 'react';
import AuditLogsMultiSection from '../AuditLogsMultiSection';

const AuditLogsTab = ({ leadId }) => {
  return (
    <div className="mb-4 left-section-container">
      <AuditLogsMultiSection leadId={leadId || '9020'} />
    </div>
  );
};

export default AuditLogsTab;
