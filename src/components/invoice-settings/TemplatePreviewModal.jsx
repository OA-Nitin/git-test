import React, { useState } from 'react';
import './TemplatePreviewModal.css';

const TemplatePreviewModal = ({ isOpen, onClose, templateData }) => {
  const [activeTab, setActiveTab] = useState('email');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4 className="modal-title" style={{color:'#1261ab'}}>Template Preview</h4>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="template-preview-modal">
          {/* Tabs */}
          <div className="template-tabs">
            <button 
              className={`tab-button ${activeTab === 'email' ? 'active' : ''}`}
              onClick={() => setActiveTab('email')}
            >
              Email Template
            </button>
            <button 
              className={`tab-button ${activeTab === 'sms' ? 'active' : ''}`}
              onClick={() => setActiveTab('sms')}
            >
              SMS Template
            </button>
          </div>
          
          {/* Email Template Tab Content */}
          {activeTab === 'email' && (
            <div className="tab-content">
              <div className="template-section">
                <label className="template-label">Subject:</label>
                <p>{templateData.subject}</p>
              </div>
              
              <div className="template-body">
                <div dangerouslySetInnerHTML={{ __html: templateData.content }} />
              </div>
            </div>
          )}
          
          {/* SMS Template Tab Content */}
          {activeTab === 'sms' && (
            <div className="tab-content">
              <div className="template-body">
                <div dangerouslySetInnerHTML={{ __html: templateData.sms_content }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewModal; 