import React from 'react';
import Modal from '../common/Modal';

// Copy the DocumentTable, STCDocumentTable, and STCImpactedDaysTable components from ProjectDetail.jsx here
// (or import them if you move them to their own files)

const DocumentsTab = ({
  ercDocuments,
  companyDocuments,
  otherDocuments,
  payrollDocuments,
  stcRequiredDocuments,
  stcImpactedDays,
  documentsLoading,
  STCDocumentTable,
  STCImpactedDaysTable,
  DocumentTable
}) => {
  return (
    <div className="mb-4 left-section-container">
      <h5 className="section-title">Documents</h5>
      {documentsLoading &&(
        <div className="text-center my-5">
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
          <p style={{color: '#000'}}>Processing data...</p>
        </div>
      )}
      {/* ERC Documents */}
      {!documentsLoading && ercDocuments?.product_id === "935" && (
        <>
          <div className="d-flex justify-content-between align-items-center section-title" style={{ paddingRight: 0 }}>
            <h5 className="mb-0">ERC Documents</h5>
            {ercDocuments?.view_document && (
              <a
                href={ercDocuments.view_document}
                className="btn btn-primary"
                title="View ERC Documents"
                style={{ fontSize: '14px', lineHeight: '1.5' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Documents
              </a>
            )}
          </div>
          <DocumentTable documents={ercDocuments?.documents} />
        </>
      )}
      {/* Company Documents */}
      {!documentsLoading && companyDocuments?.product_id === "935" && (
        <>
          <h5 className="section-title mt-5">Company Documents</h5>
          <DocumentTable documents={companyDocuments?.documents} />
        </>
      )}
      {/* Payroll Documents */}
      {!documentsLoading && payrollDocuments?.product_id === "935" && (
        <>
          <h5 className="section-title mt-5">Payroll Documents</h5>
          {payrollDocuments.groups?.length > 0 ? (
            payrollDocuments.groups.map((group, index) => (
              <div key={index} className="mb-4">
                <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">{group.heading}</h6>
                <DocumentTable documents={group.documents} />
              </div>
            ))
          ) : (
            <p>No payroll documents found.</p>
          )}
        </>
      )}
      {/* Other Documents */}
      {!documentsLoading && otherDocuments?.product_id === "935" && (
        <>
          <h5 className="section-title mt-5">Other Documents</h5>
          <DocumentTable documents={otherDocuments?.documents} />
        </>
      )}
      {/* STC Documents */}
      {!documentsLoading && stcRequiredDocuments?.product_id === "937" && (
        <>
          <div className="d-flex justify-content-between align-items-center section-title" style={{ paddingRight: 0 }}>
            <h5 className="mb-0">Required Documents</h5>
            {stcRequiredDocuments?.view_document && (
              <a
                href={stcRequiredDocuments.view_document}
                className="btn btn-primary"
                title="View ERC Documents"
                style={{ fontSize: '14px', lineHeight: '1.5' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Documents
              </a>
            )}
          </div>
          <STCDocumentTable stc_documents_groups={stcRequiredDocuments} />
        </>
      )}
      {/* STC Impacted Days */}
      {!documentsLoading && stcImpactedDays?.product_id === "937" && (
        <>
          <h5 className="section-title">Impacted Days</h5>
          <STCImpactedDaysTable impacted_days_groups={stcImpactedDays?.groups || []} />
        </>
      )}
    </div>
  );
};

export default DocumentsTab; 