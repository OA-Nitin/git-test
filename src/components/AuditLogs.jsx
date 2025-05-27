import { useState, useEffect } from 'react';
import axios from 'axios';
import './AuditLogs.css';

const AuditLogs = ({ leadId }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the specified API endpoint for audit logs
        const response = await axios.get(`https://portal.occamsadvisory.com/portal/wp-json/oc-api/v1/audit-logs/field-activity?lead_id=${leadId || '9020'}`);
        
        console.log('Audit logs API response:', response.data);
        
        if (response.data) {
          setAuditLogs(response.data);
        } else {
          setError('No audit logs found');
        }
      } catch (err) {
        console.error('Error fetching audit logs:', err);
        setError('Failed to load audit logs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [leadId]);

  // Format date and time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateTimeString;
    }
  };

  return (
    <div className="audit-logs-container">
      <h5 className="section-title">Audit Logs</h5>
      
      {loading ? (
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="loading-text">Loading audit logs...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        </div>
      ) : auditLogs.length === 0 ? (
        <div className="no-logs-container">
          <div className="alert alert-info" role="alert">
            <i className="fas fa-info-circle me-2"></i>
            No audit logs available for this lead.
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover audit-logs-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>User</th>
                <th>Field</th>
                <th>Old Value</th>
                <th>New Value</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, index) => (
                <tr key={`log-${index}`}>
                  <td>{formatDateTime(log.created_at || log.timestamp || log.date)}</td>
                  <td>{log.user_name || log.username || 'System'}</td>
                  <td>{log.field_name || log.field || 'N/A'}</td>
                  <td>{log.old_value || 'N/A'}</td>
                  <td>{log.new_value || 'N/A'}</td>
                  <td>{log.action || 'Update'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
