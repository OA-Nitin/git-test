import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AuditLogsMultiSection.css';

const AuditLogsMultiSection = ({ leadId }) => {
  // State for each API section
  const [fieldActivity, setFieldActivity] = useState([]);
  const [communicationLeadMapping, setCommunicationLeadMapping] = useState([]);
  const [optInOut, setOptInOut] = useState([]);
  const [statusChanges, setStatusChanges] = useState([]);
  const [campaignChanges, setCampaignChanges] = useState([]);
  const [sourceChanges, setSourceChanges] = useState([]);
  const [communicationLogs, setCommunicationLogs] = useState([]);

  // Loading states
  const [loading, setLoading] = useState({
    fieldActivity: true,
    communicationLeadMapping: true,
    optInOut: true,
    statusChanges: true,
    campaignChanges: true,
    sourceChanges: true,
    communicationLogs: true
  });

  // Error states
  const [errors, setErrors] = useState({
    fieldActivity: null,
    communicationLeadMapping: null,
    optInOut: null,
    statusChanges: null,
    campaignChanges: null,
    sourceChanges: null,
    communicationLogs: null
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'N/A';
    }
  };

  // Format field name (convert underscores to spaces and capitalize)
  const formatFieldName = (fieldName) => {
    if (!fieldName) return '';

    // Replace underscores with spaces
    const withSpaces = fieldName.replace(/_/g, ' ');

    // Capitalize each word
    return withSpaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Function to fetch data from all APIs
  useEffect(() => {
    const fetchAllData = async () => {
      // Field Activity
      try {
        const fieldActivityResponse = await axios.get(
          `https://play.occamsadvisory.com/portal/wp-json/oc-api/v1/audit-logs/field-activity`,
          { params: { lead_id: leadId } }
        );
        console.log('Field Activity API response:', fieldActivityResponse.data);

        if (fieldActivityResponse.data) {
          let logs = [];
          if (Array.isArray(fieldActivityResponse.data)) {
            logs = fieldActivityResponse.data;
          } else if (fieldActivityResponse.data.data && Array.isArray(fieldActivityResponse.data.data)) {
            logs = fieldActivityResponse.data.data;
          }
          setFieldActivity(logs);
        }
      } catch (err) {
        console.error('Error fetching field activity logs:', err);
        setErrors(prev => ({ ...prev, fieldActivity: 'Failed to load field activity logs' }));
      } finally {
        setLoading(prev => ({ ...prev, fieldActivity: false }));
      }

      // Communication Lead Mapping
      try {
        const communicationLeadMappingResponse = await axios.get(
          `https://play.occamsadvisory.com/portal/wp-json/oc-api/v1/audit-logs/communication-lead-mapping`,
          { params: { lead_id: leadId } }
        );
        console.log('Communication Lead Mapping API response:', communicationLeadMappingResponse.data);

        if (communicationLeadMappingResponse.data) {
          let logs = [];
          if (Array.isArray(communicationLeadMappingResponse.data)) {
            logs = communicationLeadMappingResponse.data;
          } else if (communicationLeadMappingResponse.data.data && Array.isArray(communicationLeadMappingResponse.data.data)) {
            logs = communicationLeadMappingResponse.data.data;
          }
          setCommunicationLeadMapping(logs);
        }
      } catch (err) {
        console.error('Error fetching communication lead mapping logs:', err);
        setErrors(prev => ({ ...prev, communicationLeadMapping: 'Failed to load communication lead mapping logs' }));
      } finally {
        setLoading(prev => ({ ...prev, communicationLeadMapping: false }));
      }

      // Opt In/Out
      try {
        const optInOutResponse = await axios.get(
          `https://play.occamsadvisory.com/portal/wp-json/oc-api/v1/audit-logs/opt-in-out`,
          { params: { lead_id: leadId } }
        );
        console.log('Opt In/Out API response:', optInOutResponse.data);

        if (optInOutResponse.data) {
          let logs = [];
          if (Array.isArray(optInOutResponse.data)) {
            logs = optInOutResponse.data;
          } else if (optInOutResponse.data.data && Array.isArray(optInOutResponse.data.data)) {
            logs = optInOutResponse.data.data;
          }
          setOptInOut(logs);
        }
      } catch (err) {
        console.error('Error fetching opt in/out logs:', err);
        setErrors(prev => ({ ...prev, optInOut: 'Failed to load opt in/out logs' }));
      } finally {
        setLoading(prev => ({ ...prev, optInOut: false }));
      }

      // Status Changes
      try {
        const statusChangesResponse = await axios.get(
          `https://play.occamsadvisory.com/portal/wp-json/oc-api/v1/audit-logs/status-changes`,
          { params: { lead_id: leadId } }
        );
        console.log('Status Changes API response:', statusChangesResponse.data);

        if (statusChangesResponse.data) {
          let logs = [];
          if (Array.isArray(statusChangesResponse.data)) {
            logs = statusChangesResponse.data;
          } else if (statusChangesResponse.data.data && Array.isArray(statusChangesResponse.data.data)) {
            logs = statusChangesResponse.data.data;
          }
          setStatusChanges(logs);
        }
      } catch (err) {
        console.error('Error fetching status changes logs:', err);
        setErrors(prev => ({ ...prev, statusChanges: 'Failed to load status changes logs' }));
      } finally {
        setLoading(prev => ({ ...prev, statusChanges: false }));
      }

      // Campaign Changes
      try {
        const campaignChangesResponse = await axios.get(
          `https://play.occamsadvisory.com/portal/wp-json/oc-api/v1/audit-logs/campaign-changes`,
          { params: { lead_id: leadId } }
        );
        console.log('Campaign Changes API response:', campaignChangesResponse.data);

        if (campaignChangesResponse.data) {
          let logs = [];
          if (Array.isArray(campaignChangesResponse.data)) {
            logs = campaignChangesResponse.data;
          } else if (campaignChangesResponse.data.data && Array.isArray(campaignChangesResponse.data.data)) {
            logs = campaignChangesResponse.data.data;
          }
          setCampaignChanges(logs);
        }
      } catch (err) {
        console.error('Error fetching campaign changes logs:', err);
        setErrors(prev => ({ ...prev, campaignChanges: 'Failed to load campaign changes logs' }));
      } finally {
        setLoading(prev => ({ ...prev, campaignChanges: false }));
      }

      // Source Changes
      try {
        const sourceChangesResponse = await axios.get(
          `https://play.occamsadvisory.com/portal/wp-json/oc-api/v1/audit-logs/source-changes`,
          { params: { lead_id: leadId } }
        );
        console.log('Source Changes API response:', sourceChangesResponse.data);

        if (sourceChangesResponse.data) {
          let logs = [];
          if (Array.isArray(sourceChangesResponse.data)) {
            logs = sourceChangesResponse.data;
          } else if (sourceChangesResponse.data.data && Array.isArray(sourceChangesResponse.data.data)) {
            logs = sourceChangesResponse.data.data;
          }
          setSourceChanges(logs);
        }
      } catch (err) {
        console.error('Error fetching source changes logs:', err);
        setErrors(prev => ({ ...prev, sourceChanges: 'Failed to load source changes logs' }));
      } finally {
        setLoading(prev => ({ ...prev, sourceChanges: false }));
      }

      // Communication Logs
      try {
        const communicationLogsResponse = await axios.get(
          `https://play.occamsadvisory.com/portal/wp-json/oc-api/v1/communication-logs`,
          { params: { lead_id: leadId } }
        );
        console.log('Communication Logs API response:', communicationLogsResponse.data);

        if (communicationLogsResponse.data) {
          let logs = [];
          if (Array.isArray(communicationLogsResponse.data)) {
            logs = communicationLogsResponse.data;
          } else if (communicationLogsResponse.data.data && Array.isArray(communicationLogsResponse.data.data)) {
            logs = communicationLogsResponse.data.data;
          }
          setCommunicationLogs(logs);
        }
      } catch (err) {
        console.error('Error fetching communication logs:', err);
        setErrors(prev => ({ ...prev, communicationLogs: 'Failed to load communication logs' }));
      } finally {
        setLoading(prev => ({ ...prev, communicationLogs: false }));
      }
    };

    fetchAllData();
  }, [leadId]);

  return (
    <div className="audit-logs-multi-section">
      <h2 className="main-heading">Audit Logs</h2>

      {/* Field Activity Section */}
      <div className="audit-section">
        <h3 className="section-heading">Field Activity</h3>
        {loading.fieldActivity ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading field activity logs...</p>
          </div>
        ) : errors.fieldActivity ? (
          <div className="error-message">
            <p>{errors.fieldActivity}</p>
          </div>
        ) : fieldActivity.length === 0 ? (
          <div className="no-data-message">
            <p>No field activity logs found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Field</th>
                  <th>Old Value</th>
                  <th>New Value</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fieldActivity.slice(0, 10).map((log, index) => (
                  <tr key={`field-activity-${index}`}>
                    <td>{formatDate(log.created_at || log.date || log.changed_time)}</td>
                    <td>{log.user_name || log.username || log.changed_by || 'Unknown'}</td>
                    <td>{formatFieldName(log.field_name || log.field || '')}</td>
                    <td>{log.old_value || log.changed_from || log.changed_from || '-'}</td>
                    <td>{log.new_value || log.changed_to ||'-'}</td>
                    <td>{log.action || log.activity_type || 'Update'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Communication Lead Mapping Section */}
      <div className="audit-section">
        <h3 className="section-heading">Communication Log: Lead Mapping</h3>
        {loading.communicationLeadMapping ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading communication lead mapping logs...</p>
          </div>
        ) : errors.communicationLeadMapping ? (
          <div className="error-message">
            <p>{errors.communicationLeadMapping}</p>
          </div>
        ) : communicationLeadMapping.length === 0 ? (
          <div className="no-data-message">
            <p>No communication lead mapping logs found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Date2</th>
                  <th>User</th>
                  <th>Communication ID</th>
                  <th>Lead ID</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {communicationLeadMapping.slice(0, 10).map((log, index) => (
                  <tr key={`comm-lead-mapping-${index}`}>
                    <td>{formatDate(log.created_at || log.date || log.changed_time)}</td>
                    <td>{log.user_name || log.username|| log.changed_by || 'Unknown'}</td>
                    <td>{log.communication_id || '-'}</td>
                    <td>{log.lead_id || '-'}</td>
                    <td>{log.action || log.activity_type || 'Map'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Opt In/Out Section */}
      <div className="audit-section">
        <h3 className="section-heading">Opt In/Out Log</h3>
        {loading.optInOut ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading opt in/out logs...</p>
          </div>
        ) : errors.optInOut ? (
          <div className="error-message">
            <p>{errors.optInOut}</p>
          </div>
        ) : optInOut.length === 0 ? (
          <div className="no-data-message">
            <p>No opt in/out logs found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Date3</th>
                  <th>User</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {optInOut.slice(0, 10).map((log, index) => (
                  <tr key={`opt-in-out-${index}`}>
                    <td>{formatDate(log.created_at || log.date || log.changed_time)}</td>
                    <td>{log.user_name || log.username || log.changed_by || 'Unknown'}</td>
                    <td>{formatFieldName(log.channel) || '-'}</td>
                    <td>{log.status || '-'}</td>
                    <td>{log.action || log.activity_type || 'Change'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Changes Section */}
      <div className="audit-section">
        <h3 className="section-heading">Status Changes</h3>
        {loading.statusChanges ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading status changes logs...</p>
          </div>
        ) : errors.statusChanges ? (
          <div className="error-message">
            <p>{errors.statusChanges}</p>
          </div>
        ) : statusChanges.length === 0 ? (
          <div className="no-data-message">
            <p>No status changes logs found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Date4</th>
                  <th>User</th>
                  <th>Old Status</th>
                  <th>New Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {statusChanges.slice(0, 10).map((log, index) => (
                  <tr key={`status-changes-${index}`}>
                    <td>{formatDate(log.created_at || log.date || log.changed_time)}</td>
                    <td>{log.user_name || log.username || log.changed_by || 'Unknown'}</td>
                    <td>{formatFieldName(log.old_status || log.old_value || log.changed_from) || '-'}</td>
                    <td>{formatFieldName(log.new_status || log.new_value || log.changed_to) || '-'}</td>
                    <td>{log.action || log.activity_type || 'Change'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Campaign Changes Section */}
      <div className="audit-section">
        <h3 className="section-heading">Campaign Changes</h3>
        {loading.campaignChanges ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading campaign changes logs...</p>
          </div>
        ) : errors.campaignChanges ? (
          <div className="error-message">
            <p>{errors.campaignChanges}</p>
          </div>
        ) : campaignChanges.length === 0 ? (
          <div className="no-data-message">
            <p>No campaign changes logs found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Date5</th>
                  <th>User</th>
                  <th>Old Campaign</th>
                  <th>New Campaign</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {campaignChanges.slice(0, 10).map((log, index) => (
                  <tr key={`campaign-changes-${index}`}>
                    <td>{formatDate(log.created_at || log.date || log.changed_time)}</td>
                    <td>{log.user_name || log.username || log.changed_by || 'Unknown'}</td>
                    <td>{formatFieldName(log.old_campaign || log.old_value) || '-'}</td>
                    <td>{formatFieldName(log.new_campaign || log.new_value) || '-'}</td>
                    <td>{log.action || log.activity_type || 'Change'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Source Changes Section */}
      <div className="audit-section">
        <h3 className="section-heading">Source Changes</h3>
        {loading.sourceChanges ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading source changes logs...</p>
          </div>
        ) : errors.sourceChanges ? (
          <div className="error-message">
            <p>{errors.sourceChanges}</p>
          </div>
        ) : sourceChanges.length === 0 ? (
          <div className="no-data-message">
            <p>No source changes logs found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Date6</th>
                  <th>User</th>
                  <th>Old Source</th>
                  <th>New Source</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sourceChanges.slice(0, 10).map((log, index) => (
                  <tr key={`source-changes-${index}`}>
                    <td>{formatDate(log.created_at || log.date || log.changed_time)}</td>
                    <td>{log.user_name || log.username || log.changed_by || 'Unknown'}</td>
                    <td>{formatFieldName(log.old_source || log.old_value) || '-'}</td>
                    <td>{formatFieldName(log.new_source || log.new_value) || '-'}</td>
                    <td>{log.action || log.activity_type || 'Change'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Communication Logs Section */}
      <div className="audit-section">
        <h3 className="section-heading">Communication Logs</h3>
        {loading.communicationLogs ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading communication logs...</p>
          </div>
        ) : errors.communicationLogs ? (
          <div className="error-message">
            <p>{errors.communicationLogs}</p>
          </div>
        ) : communicationLogs.length === 0 ? (
          <div className="no-data-message">
            <p>No communication logs found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                  <th>Log Type</th>
                </tr>
              </thead>
              <tbody>
                {communicationLogs.slice(0, 10).map((log, index) => (
                  <tr key={`communication-logs-${index}`}>
                    <td>{formatDate(log.created_at || log.date || log.changed_time)}</td>
                    <td>{log.from || '-'}</td>
                    <td>{log.to || '-'}</td>
                    <td>{log.status || '-'}</td>
                    <td>{log.log_type || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsMultiSection;
