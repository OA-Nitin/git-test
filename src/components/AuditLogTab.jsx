import { useState, useEffect } from 'react';
import axios from 'axios';
import './AuditLogTab.css';

const AuditLogTab = ({ leadId, isActive }) => {
<<<<<<< HEAD
  const [auditLogs, setAuditLogs] = useState([]); 
=======
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
>>>>>>> 6d8ccd01d2ecd4c08c2853af0bfe68fc7153d1c6
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch audit logs when the tab becomes active or leadId changes
  useEffect(() => {
    if (isActive && leadId) {
      fetchAuditLogs();
    }
  }, [isActive, leadId]);

  // Filter logs when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLogs(auditLogs);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = auditLogs.filter(log => 
        (log.user_name || log.username || '').toLowerCase().includes(searchLower) ||
        (log.field_name || log.field || '').toLowerCase().includes(searchLower) ||
        (log.old_value || '').toLowerCase().includes(searchLower) ||
        (log.new_value || '').toLowerCase().includes(searchLower) ||
        (log.action || log.activity_type || '').toLowerCase().includes(searchLower)
      );
      setFilteredLogs(filtered);
    }
  }, [searchTerm, auditLogs]);

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
        setFilteredLogs(logs);
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
          <p>No audit logs found</p>
        </div>
      ) : (
        <>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search audit logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control form-control-sm"
            />
          </div>
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
                {filteredLogs.map((log, index) => (
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
            {filteredLogs.length === 0 && searchTerm && (
              <div className="no-results-message">
                <p>No results found for "{searchTerm}"</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AuditLogTab;
