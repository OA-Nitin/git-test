import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AuditLogsMultiSection.css';
import DataTable from './DataTable';

const AuditLogsMultiSection = ({leadId, isAuditLogsData}) => {
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

  // Format date for display in mm/dd/yyyy H:i:s format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }

      // Format as mm/dd/yyyy H:i:s (24-hour format)
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${month}/${day}/${year} ${hours}:${minutes}`;
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
          `https://portal.occamsadvisory.com/portal/wp-json/oc-api/v1/audit-logs/field-activity`,
          { params: { lead_id: leadId } }
        );
        //console.log('Field Activity API response:', fieldActivityResponse.data);

        if (fieldActivityResponse.data) {
          isAuditLogsData = true;
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
          `https://portal.occamsadvisory.com/portal/wp-json/oc-api/v1/audit-logs/communication-lead-mapping`,
          { params: { lead_id: leadId } }
        );
        //console.log('Communication Lead Mapping API response:', communicationLeadMappingResponse.data);

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
          `https://portal.occamsadvisory.com/portal/wp-json/oc-api/v1/audit-logs/opt-in-out`,
          { params: { lead_id: leadId } }
        );
        //console.log('Opt In/Out API response:', optInOutResponse.data);

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
          `https://portal.occamsadvisory.com/portal/wp-json/oc-api/v1/audit-logs/status-changes`,
          { params: { lead_id: leadId } }
        );
        //console.log('Status Changes API response:', statusChangesResponse.data);

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
          `https://portal.occamsadvisory.com/portal/wp-json/oc-api/v1/audit-logs/campaign-changes`,
          { params: { lead_id: leadId } }
        );
        //console.log('Campaign Changes API response:', campaignChangesResponse.data);

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
          `https://portal.occamsadvisory.com/portal/wp-json/oc-api/v1/audit-logs/source-changes`,
          { params: { lead_id: leadId } }
        );
        //console.log('Source Changes API response:', sourceChangesResponse.data);

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
          `https://portal.occamsadvisory.com/portal/wp-json/oc-api/v1/communication-logs`,
          { params: { lead_id: leadId } }
        );
        //console.log('Communication Logs API response:', communicationLogsResponse.data);

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

    if(!isAuditLogsData){
      fetchAllData();
    }
  }, [leadId]);

  return (
    <>
      <h2 className="section-title">Audit Logs</h2>

      {/* Field Activity Section */}
      <div className="audit-section">
        <DataTable
          title="Field Activity"
          data={fieldActivity}
          loading={loading.fieldActivity}
          error={errors.fieldActivity}
          emptyMessage="No field activity logs found."
          columns={[
            {
              header: 'Date',
              accessor: 'created_at',
              render: (row) => formatDate(row.created_at || row.date || row.changed_time)
            },
            {
              header: 'User',
              accessor: 'user_name',
              render: (row) => row.user_name || row.username || row.changed_by || 'Unknown'
            },
            {
              header: 'Field',
              accessor: 'field_name',
              render: (row) => formatFieldName(row.field_name || row.field || '')
            },
            {
              header: 'Old Value',
              accessor: 'old_value',
              render: (row) => row.old_value || row.changed_from || '-'
            },
            {
              header: 'New Value',
              accessor: 'new_value',
              render: (row) => row.new_value || row.changed_to || '-'
            },
            {
              header: 'Action',
              accessor: 'action',
              render: (row) => row.action || row.activity_type || 'Update'
            }
          ]}
        />
      </div>

      {/* Communication Lead Mapping Section */}
      <div className="audit-section">
        <DataTable
          title="Communication Log: Lead Mapping"
          data={communicationLeadMapping}
          loading={loading.communicationLeadMapping}
          error={errors.communicationLeadMapping}
          emptyMessage="No communication lead mapping logs found."
          columns={[
            {
              header: 'Date',
              accessor: 'created_at',
              render: (row) => formatDate(row.created_at || row.date || row.changed_time)
            },
            {
              header: 'User',
              accessor: 'user_name',
              render: (row) => row.user_name || row.username || row.changed_by || 'Unknown'
            },
            {
              header: 'Communication ID',
              accessor: 'communication_id',
              render: (row) => row.communication_id || '-'
            },
            {
              header: 'Lead ID',
              accessor: 'lead_id',
              render: (row) => row.lead_id || '-'
            },
            {
              header: 'Action',
              accessor: 'action',
              render: (row) => row.action || row.activity_type || 'Map'
            }
          ]}
        />
      </div>

      {/* Opt In/Out Section */}
      <div className="audit-section">
        <DataTable
          title="Opt In/Out Log"
          data={optInOut}
          loading={loading.optInOut}
          error={errors.optInOut}
          emptyMessage="No opt in/out logs found."
          columns={[
            {
              header: 'Date',
              accessor: 'created_at',
              render: (row) => formatDate(row.created_at || row.date || row.changed_time)
            },
            {
              header: 'User',
              accessor: 'user_name',
              render: (row) => row.user_name || row.username || row.changed_by || 'Unknown'
            },
            {
              header: 'Channel',
              accessor: 'channel',
              render: (row) => formatFieldName(row.channel) || '-'
            },
            {
              header: 'Status',
              accessor: 'status',
              render: (row) => row.status || '-'
            },
            {
              header: 'Action',
              accessor: 'action',
              render: (row) => row.action || row.activity_type || 'Change'
            }
          ]}
        />
      </div>

      {/* Status Changes Section */}
      <div className="audit-section">
        <DataTable
          title="Status Changes"
          data={statusChanges}
          loading={loading.statusChanges}
          error={errors.statusChanges}
          emptyMessage="No status changes logs found."
          columns={[
            {
              header: 'Date',
              accessor: 'changed_time',
              render: (row) => formatDate(row.created_at || row.date || row.changed_time)
            },
            {
              header: 'Changed From',
              accessor: 'changed_from',
              render: (row) => formatFieldName(row.changed_from || row.old_status || row.old_value) || '-'
            },
            {
              header: 'Changed To',
              accessor: 'changed_to',
              render: (row) => formatFieldName(row.changed_to || row.new_status || row.new_value) || '-'
            },
            {
              header: 'Changed By',
              accessor: 'changed_by',
              render: (row) => row.changed_by || row.user_name || row.username || 'Unknown'
            }
          ]}
        />
      </div>

      {/* Campaign Changes Section */}
      <div className="audit-section">
        <DataTable
          title="Campaign Changes"
          data={campaignChanges}
          loading={loading.campaignChanges}
          error={errors.campaignChanges}
          emptyMessage="No campaign changes logs found."
          columns={[
            {
              header: 'Date',
              accessor: 'changed_time',
              render: (row) => formatDate(row.created_at || row.date || row.changed_time)
            },
            {
              header: 'Changed From',
              accessor: 'changed_from',
              render: (row) => formatFieldName(row.changed_from || row.old_campaign || row.old_value) || '-'
            },
            {
              header: 'Changed To',
              accessor: 'changed_to',
              render: (row) => formatFieldName(row.changed_to || row.new_campaign || row.new_value) || '-'
            },
            {
              header: 'Changed By',
              accessor: 'changed_by',
              render: (row) => row.changed_by || row.user_name || row.username || 'Unknown'
            }
          ]}
        />
      </div>

      {/* Source Changes Section */}
      <div className="audit-section">
        <DataTable
          title="Source Changes"
          data={sourceChanges}
          loading={loading.sourceChanges}
          error={errors.sourceChanges}
          emptyMessage="No source changes logs found."
          columns={[
            {
              header: 'Date',
              accessor: 'changed_time',
              render: (row) => formatDate(row.created_at || row.date || row.changed_time)
            },
            {
              header: 'Changed From',
              accessor: 'changed_from',
              render: (row) => formatFieldName(row.changed_from || row.old_source || row.old_value) || '-'
            },
            {
              header: 'Changed To',
              accessor: 'changed_to',
              render: (row) => formatFieldName(row.changed_to || row.new_source || row.new_value) || '-'
            },
            {
              header: 'Changed By',
              accessor: 'changed_by',
              render: (row) => row.changed_by || row.user_name || row.username || 'Unknown'
            }
          ]}
        />
      </div>

      {/* Communication Logs Section */}
      <div className="audit-section">
        <DataTable
          title="Communication Logs"
          data={communicationLogs}
          loading={loading.communicationLogs}
          error={errors.communicationLogs}
          emptyMessage="No communication logs found."
          columns={[
            {
              header: 'Date',
              accessor: 'created_at',
              render: (row) => formatDate(row.created_at || row.date || row.changed_time)
            },
            {
              header: 'From',
              accessor: 'from',
              render: (row) => row.from || '-'
            },
            {
              header: 'To',
              accessor: 'to',
              render: (row) => row.to || '-'
            },
            {
              header: 'Status',
              accessor: 'status',
              render: (row) => formatFieldName(row.status) || '-'
            },
            {
              header: 'Log Type',
              accessor: 'log_type',
              render: (row) => formatFieldName(row.log_type) || '-'
            }
          ]}
        />
      </div>
    </>
  );
};

export default AuditLogsMultiSection;
