import React from 'react';

const AuditLogsTab = ({ 
  auditLogsData, 
  auditLogsLoading, 
  auditLogsError, 
  auditLogsSearch, 
  filterAndSortAuditData, 
  getPaginatedData, 
  renderSortIcon,
  formatAuditDate,
  renderPaginationControls,
  isAuditData,
  handleAuditLogsSearch,
  handleAuditLogsSorting
}) => {
  return (
    <div className="mb-4 left-section-container">
      <h5 className="section-title">Audit Logs</h5>

      {auditLogsLoading ? (
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
      ) : auditLogsError ? (
        <div className="alert alert-warning" role="alert">
          {auditLogsError}
          {!isAuditData && (
            <button
              className="btn btn-sm btn-primary ms-3"
              onClick={fetchProjectAuditLogs}
            >
              Retry
            </button>
          )}
        </div>
      ) : (
        <div className="audit-logs-container">

          {/* Project Fields Table */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="section-subtitle mb-0">Project Fields</h6>
              <div className="search-box" style={{ width: '300px' }}>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search project fields..."
                  value={auditLogsSearch.project_fields}
                  onChange={(e) => handleAuditLogsSearch('project_fields', e.target.value)}
                />
              </div>
            </div>
            {(() => {
              const filteredData = filterAndSortAuditData(auditLogsData.project_fields, 'project_fields');
              const paginatedData = getPaginatedData(filteredData, 'project_fields');

              return filteredData.length > 0 ? (
                <>
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleAuditLogsSorting('project_fields', 'fieldname')}
                          >
                            Field Name {renderSortIcon('project_fields', 'fieldname')}
                          </th>
                          <th
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleAuditLogsSorting('project_fields', 'from')}
                          >
                            From {renderSortIcon('project_fields', 'from')}
                          </th>
                          <th
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleAuditLogsSorting('project_fields', 'to')}
                          >
                            To {renderSortIcon('project_fields', 'to')}
                          </th>
                          <th
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleAuditLogsSorting('project_fields', 'change_date')}
                          >
                            Changed On {renderSortIcon('project_fields', 'change_date')}
                          </th>
                          <th
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleAuditLogsSorting('project_fields', 'changed_by')}
                          >
                            Changed By {renderSortIcon('project_fields', 'changed_by')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.map((record, index) => (
                          <tr key={index}>
                            <td>{record.fieldname || 'N/A'}</td>
                            <td>{record.from || 'N/A'}</td>
                            <td>{record.to || 'N/A'}</td>
                            <td>{formatAuditDate(record.change_date)}</td>
                            <td>{record.changed_by || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {renderPaginationControls(filteredData, 'project_fields')}
                </>
              ) : (
                <div className="alert alert-info">
                  {auditLogsSearch.project_fields ? 'No project field records match your search.' : 'No project field audit records found.'}
                </div>
              );
            })()}
          </div>

          {/* Milestone & Stage Table */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="section-subtitle mb-0">Milestone:</h6>
              <div className="search-box" style={{ width: '300px' }}>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search milestone & stage..."
                  value={auditLogsSearch.milestone_stage}
                  onChange={(e) => handleAuditLogsSearch('milestone_stage', e.target.value)}
                />
              </div>
            </div>
            {(() => {
              const filteredData = filterAndSortAuditData(auditLogsData.milestone_stage, 'milestone_stage');
              const paginatedData = getPaginatedData(filteredData, 'milestone_stage');

              return filteredData.length > 0 ? (
                <>
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleAuditLogsSorting('milestone_stage', 'from_milestone_name')}
                          >
                            From Milestone {renderSortIcon('milestone_stage', 'from_milestone_name')}
                          </th>
                          <th
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleAuditLogsSorting('milestone_stage', 'milestone_name')}
                          >
                            To Milestone {renderSortIcon('milestone_stage', 'milestone_name')}
                          </th>
                          <th
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleAuditLogsSorting('milestone_stage', 'from_stage_name')}
                          >
                            From Stage {renderSortIcon('milestone_stage', 'from_stage_name')}
                          </th>
                          <th
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleAuditLogsSorting('milestone_stage', 'stage_name')}
                          >
                            To Stage {renderSortIcon('milestone_stage', 'stage_name')}
                          </th>
                          <th
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleAuditLogsSorting('milestone_stage', 'change_date')}
                          >
                            Changed On {renderSortIcon('milestone_stage', 'change_date')}
                          </th>
                          <th
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleAuditLogsSorting('milestone_stage', 'changed_by')}
                          >
                            Changed By {renderSortIcon('milestone_stage', 'changed_by')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.map((record, index) => (
                          <tr key={index}>
                            <td>{record.from_milestone_name || 'N/A'}</td>
                            <td>{record.milestone_name || 'N/A'}</td>
                            <td>{record.from_stage_name || 'N/A'}</td>
                            <td>{record.stage_name || 'N/A'}</td>
                            <td>{formatAuditDate(record.change_date)}</td>
                            <td>{record.changed_by || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {renderPaginationControls(filteredData, 'milestone_stage')}
                </>
              ) : (
                <div className="alert alert-info">
                  {auditLogsSearch.milestone_stage ? 'No milestone & stage records match your search.' : 'No milestone & stage audit records found.'}
                </div>
              );
            })()}
          </div>

        {/* Invoice Changes Table */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="section-subtitle mb-0">Invoice Changes</h6>
            <div className="search-box" style={{ width: '300px' }}>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search invoice changes..."
                value={auditLogsSearch.invoices}
                onChange={(e) => handleAuditLogsSearch('invoices', e.target.value)}
              />
            </div>
          </div>
          {(() => {
            const filteredData = filterAndSortAuditData(auditLogsData.invoices, 'invoices');
            const paginatedData = getPaginatedData(filteredData, 'invoices');

              return filteredData.length > 0 ? (
                <>
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleAuditLogsSorting('invoices', 'customer_invoice_no')}
                          >
                            Invoice No {renderSortIcon('invoices', 'customer_invoice_no')}
                          </th>
                          <th
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleAuditLogsSorting('invoices', 'fieldname')}
                          >
                            Field Name {renderSortIcon('invoices', 'fieldname')}
                          </th>
                          <th
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleAuditLogsSorting('invoices', 'from')}
                          >
                            From Value {renderSortIcon('invoices', 'from')}
                          </th>
                          <th
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleAuditLogsSorting('invoices', 'to')}
                          >
                            To Value {renderSortIcon('invoices', 'to')}
                          </th>
                          <th
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleAuditLogsSorting('invoices', 'changed_date')}
                          >
                            Changed On {renderSortIcon('invoices', 'changed_date')}
                          </th>
                          <th
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleAuditLogsSorting('invoices', 'changed_by')}
                          >
                            Changed By {renderSortIcon('invoices', 'changed_by')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.map((record, index) => (
                          <tr key={index}>
                            <td>{record.customer_invoice_no || 'N/A'}</td>
                            <td>{record.fieldname || 'N/A'}</td>
                            <td>{record.from || 'N/A'}</td>
                            <td>{record.to || 'N/A'}</td>
                            <td>{formatAuditDate(record.changed_date)}</td>
                            <td>{record.changed_by || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {renderPaginationControls(filteredData, 'invoices')}
                </>
              ) : (
                <div className="alert alert-info">
                  {auditLogsSearch.invoices ? 'No invoice records match your search.' : 'No invoice audit records found.'}
                </div>
              );
            })()}
          </div>

        {/* Business Audit Log Table */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="section-subtitle mb-0">Business Audit Log</h6>
            <div className="search-box" style={{ width: '300px' }}>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search business audit log..."
                value={auditLogsSearch.business_audit_log}
                onChange={(e) => handleAuditLogsSearch('business_audit_log', e.target.value)}
              />
            </div>
          </div>
          {(() => {
            const filteredData = filterAndSortAuditData(auditLogsData.business_audit_log, 'business_audit_log');
            const paginatedData = getPaginatedData(filteredData, 'business_audit_log');

            return filteredData.length > 0 ? (
              <>
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleAuditLogsSorting('business_audit_log', 'fieldname')}
                        >
                          Field Name {renderSortIcon('business_audit_log', 'fieldname')}
                        </th>
                        <th
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleAuditLogsSorting('business_audit_log', 'from')}
                        >
                          From Value {renderSortIcon('business_audit_log', 'from')}
                        </th>
                        <th
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleAuditLogsSorting('business_audit_log', 'to')}
                        >
                          To Value {renderSortIcon('business_audit_log', 'to')}
                        </th>
                        <th
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleAuditLogsSorting('business_audit_log', 'note')}
                        >
                          Note {renderSortIcon('business_audit_log', 'note')}
                        </th>
                        <th
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleAuditLogsSorting('business_audit_log', 'change_date')}
                        >
                          Changed On {renderSortIcon('business_audit_log', 'change_date')}
                        </th>
                        <th
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleAuditLogsSorting('business_audit_log', 'changed_by')}
                        >
                          Changed By {renderSortIcon('business_audit_log', 'changed_by')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((record, index) => (
                        <tr key={index}>
                          <td>{record.fieldname || 'N/A'}</td>
                          <td>{record.from || 'N/A'}</td>
                          <td>{record.to || 'N/A'}</td>
                          <td>{record.note || 'N/A'}</td>
                          <td>{formatAuditDate(record.change_date)}</td>
                          <td>{record.changed_by || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {renderPaginationControls(filteredData, 'business_audit_log')}
              </>
            ) : (
              <div className="alert alert-info">
                {auditLogsSearch.business_audit_log ? 'No business audit records match your search.' : 'No business audit records found.'}
              </div>
            );
          })()}
        </div>

        </div>
      )}
    </div>
  );
};

export default AuditLogsTab; 