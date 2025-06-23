import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

/**
 * Test component to verify Project Audit Logs API parameters
 * This can be temporarily added to any page to test the API URL construction
 */
const ProjectAuditLogsTest = ({ project }) => {
  const { projectId } = useParams();

  useEffect(() => {
    //console.log('=== PROJECT AUDIT LOGS API TEST ===');
    //console.log('Project ID from URL:', projectId);
    //console.log('Project data:', project);
    
    if (project) {
      //console.log('Lead ID:', project.lead_id);
      //console.log('Product ID:', project.product_id);
      
      // Build the API URL
      const apiUrl = new URL('https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-audit-logs');
      apiUrl.searchParams.append('project_id', projectId);
      apiUrl.searchParams.append('lead_id', project.lead_id);
      apiUrl.searchParams.append('product_id', project.product_id);
      
      //console.log('Constructed API URL:', apiUrl.toString());
      
      // Check if all required parameters are present
      const hasAllParams = projectId && project.lead_id && project.product_id;
      //console.log('All required parameters present:', hasAllParams);
      
      if (!hasAllParams) {
        console.warn('Missing required parameters:');
        if (!projectId) console.warn('- project_id is missing');
        if (!project.lead_id) console.warn('- lead_id is missing');
        if (!project.product_id) console.warn('- product_id is missing');
      }
    } else {
      console.warn('Project data not available yet');
    }
    //console.log('=====================================');
  }, [projectId, project]);

  if (!project) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        left: '10px', 
        background: '#fff3cd', 
        border: '1px solid #ffeaa7', 
        padding: '10px', 
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px'
      }}>
        <strong>API Test:</strong><br />
        <span style={{ color: '#856404' }}>Waiting for project data...</span>
      </div>
    );
  }

  const apiUrl = new URL('https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-audit-logs');
  apiUrl.searchParams.append('project_id', projectId);
  apiUrl.searchParams.append('lead_id', project.lead_id);
  apiUrl.searchParams.append('product_id', project.product_id);

  const hasAllParams = projectId && project.lead_id && project.product_id;

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      left: '10px', 
      background: hasAllParams ? '#d4edda' : '#f8d7da', 
      border: `1px solid ${hasAllParams ? '#c3e6cb' : '#f5c6cb'}`, 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '11px',
      zIndex: 9999,
      maxWidth: '400px',
      fontFamily: 'monospace'
    }}>
      <strong>Project Audit Logs API Test:</strong><br />
      <strong>Status:</strong> <span style={{ color: hasAllParams ? '#155724' : '#721c24' }}>
        {hasAllParams ? '✅ Ready' : '❌ Missing Parameters'}
      </span><br />
      <strong>Project ID:</strong> {projectId || 'N/A'}<br />
      <strong>Lead ID:</strong> {project.lead_id || 'N/A'}<br />
      <strong>Product ID:</strong> {project.product_id || 'N/A'}<br />
      <strong>API URL:</strong><br />
      <div style={{ 
        background: '#f8f9fa', 
        padding: '5px', 
        borderRadius: '3px', 
        marginTop: '5px',
        wordBreak: 'break-all',
        fontSize: '10px'
      }}>
        {apiUrl.toString()}
      </div>
    </div>
  );
};

export default ProjectAuditLogsTest;
