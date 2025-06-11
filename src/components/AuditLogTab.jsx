import { useState, useEffect } from 'react';
import axios from 'axios';
import './AuditLogTab.css';

const AuditLogTab = ({ leadId, isActive }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch audit logs when the tab becomes active or leadId changes
  useEffect(() => {
    if (isActive && leadId) {
      fetchAuditLogs();
    }
  }, [isActive, leadId]);

  // Function to fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching audit logs for lead ID: ${leadId}`);

      // Call the audit logs API
      const response = await axios.get(
        `https://portal.occamsadvisory.com/portal/wp-json/oc-api/v1/audit-logs/field-activity`,
        { params: { lead_id: leadId } }
      );

      console.log('Audit logs API response:', response.data);

      if (response.data) {
        // Process the response data
        let logs = [];

        // Handle different response formats
        if (Array.isArray(response.data)) {
          logs = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          logs = response.data.data;
        }

        console.log('Processed audit logs:', logs);
        setAuditLogs(logs);
      } else {
        setError('Failed to load audit logs. Invalid response format.');
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (err) {
      console.error('Error formatting date:', err);
      return dateString;
    }
  };

  return (
    <div className="audit-log-tab">
      <h3>Audit Log</h3>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading audit logs...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchAuditLogs}>Retry</button>
        </div>
      ) : auditLogs.length === 0 ? (
        <div className="no-logs-message">
          <p>Test</p>
        </div>
      ) : (
        <div className="audit-log-table-container">
          <table className="audit-log-table">
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
              {auditLogs.map((log, index) => (
                <tr key={log.id || `log-${index}`}>
                  <td>{formatDate(log.created_at || log.date)}</td>
                  <td>{log.user_name || log.username || 'Unknown'}</td>
                  <td>{log.field_name || log.field || 'Unknown'}</td>
                  <td>{log.old_value || '-'}</td>
                  <td>{log.new_value || '-'}</td>
                  <td>{log.action || log.activity_type || 'Update'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogTab;
