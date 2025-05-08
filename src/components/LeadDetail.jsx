import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './common/CommonStyles.css';
import './LeadDetail.css';
import { getAssetPath } from '../utils/assetUtils';

const LeadDetail = () => {
  const { leadId } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('businessInfo');
  const [taxNowSignupStatus, setTaxNowSignupStatus] = useState('');
  const [taxNowOnboardingStatus, setTaxNowOnboardingStatus] = useState('');
  const [companyFolderLink, setCompanyFolderLink] = useState('https://bit.ly/3SoyiO1');
  const [documentFolderLink, setDocumentFolderLink] = useState('https://bit.ly/4jZTci8');

  useEffect(() => {
    document.title = `Lead #${leadId} - Occams Portal`;
    fetchLeadDetails();
  }, [leadId]);

  // Reset onboarding status when signup status changes
  useEffect(() => {
    setTaxNowOnboardingStatus('');
  }, [taxNowSignupStatus]);

  const fetchLeadDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real application, you would fetch the lead details from your API
      // For now, we'll simulate a delay and return mock data
      setTimeout(() => {
        const mockLead = {
          lead_id: leadId,
          business_legal_name: "CTCERC Play SP",
          business_email: "shivraj.patil@occamsadvisory.com",
          business_phone: "454-645-6456",
          business_address: "123 Main St",
          city: "Birmingham",
          state: "Alabama",
          zip: "35201",
          website: "https://example.com",
          business_type: "Corporation",
          lead_status: "Active",
          created: "2023-05-15",
          source: "Referral",
          campaign: "ERC - Referrals",
          category: "ERC",
          lead_group: "ERC - Referrals",
          employee_id: "Master ops",
          internal_sales_agent: "Leonard El",
          internal_sales_support: "Varun Kumar",
          registration_type: "N/A",
          registration_number: "",
          registration_date: "",
          state_of_registration: "",
          ein: "",
          billing_profile: "",
          taxnow_signup_status: "",
          taxnow_onboarding_status: ""
        };
        setLead(mockLead);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error fetching lead details:', err);
      setError(`Failed to fetch lead details: ${err.message}`);
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center mt-5">
          <div className="col-md-8 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading lead details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center mt-5">
          <div className="col-md-8">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Error!</h4>
              <p>{error}</p>
              <hr />
              <button className="btn btn-primary" onClick={fetchLeadDetails}>
                <i className="fas fa-sync-alt me-1"></i> Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center mt-5">
          <div className="col-md-8 text-center">
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading">Lead Not Found</h4>
              <p>The lead with ID {leadId} could not be found.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="white_card card_height_100 mb_30">
            <div className="white_card_header">
              <div className="box_header m-0 justify-content-between">
                <h4 className="iris-lead-name">{lead.lead_id} - {lead.business_legal_name}</h4>
                <div>
                  <button className="btn btn-sm btn-outline-light me-2" onClick={() => window.history.back()}>
                    <i className="fas fa-arrow-left me-1"></i> Back
                  </button>
                </div>
                {/* <h4 className="lead_status">ERC Onboarding - <span>Prospecting</span></h4> */}
              </div>
              <ul className="nav nav-pills" id="pills-tab" role="tablist">
                <li className={`nav-item ${activeTab === 'businessInfo' ? 'active' : ''}`}>
                  <a
                    className="nav-link"
                    id="pills-erc-bus-info"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabChange('businessInfo');
                    }}
                    href="#pills-home"
                    role="tab"
                    aria-controls="pills-home"
                    aria-selected={activeTab === 'businessInfo'}
                  >
                    Business Info
                  </a>
                </li>
                <li className={`nav-item ${activeTab === 'affiliateCommission' ? 'active' : ''}`}>
                  <a
                    className="nav-link"
                    id="pills-affiliate-commission"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabChange('affiliateCommission');
                    }}
                    href="#pills-commission"
                    role="tab"
                    aria-controls="pills-commission"
                    aria-selected={activeTab === 'affiliateCommission'}
                  >
                    Affiliate Commission
                  </a>
                </li>
                <li className={`nav-item ${activeTab === 'contacts' ? 'active' : ''}`}>
                  <a
                    className="nav-link"
                    id="pills-affiliate-contacts"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabChange('contacts');
                    }}
                    href="#pills-contacts"
                    role="tab"
                    aria-controls="pills-contacts"
                    aria-selected={activeTab === 'contacts'}
                  >
                    Contacts
                  </a>
                </li>
                <li className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`}>
                  <a
                    className="nav-link"
                    id="pills-affiliate-projects"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabChange('projects');
                    }}
                    href="#pills-projects"
                    role="tab"
                    aria-controls="pills-projects"
                    aria-selected={activeTab === 'projects'}
                  >
                    Projects
                  </a>
                </li>
                <li className={`nav-item ${activeTab === 'auditLogs' ? 'active' : ''}`}>
                  <a
                    className="nav-link"
                    id="pills-audit-logs"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabChange('auditLogs');
                    }}
                    href="#pills-logs"
                    role="tab"
                    aria-controls="pills-logs"
                    aria-selected={activeTab === 'auditLogs'}
                  >
                    Audit Logs
                  </a>
                </li>
              </ul>
            </div>

            <div className="white_card_body">
              {/* Business Info Tab Content */}
              {activeTab === 'businessInfo' && (
                <div className="row">
                  <div className="col-md-8">
                    <div className="mb-4">
                      <h5 className="section-title">Business Identity</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Legal Name*</label>
                            <input type="text" className="form-control" value="CTCERC Play" readOnly />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Doing Business As</label>
                            <input type="text" className="form-control" value="" readOnly />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Category*</label>
                            <input type="text" className="form-control" value="" readOnly />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Website URL*</label>
                            <input type="text" className="form-control" value={lead.website || ''} readOnly />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Business Contact Info</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Authorized Signatory Name</label>
                            <input type="text" className="form-control" value="CTCERC Play SP" readOnly />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Phone*</label>
                            <input type="text" className="form-control" value="454-645-6456" readOnly />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Email*</label>
                            <input type="email" className="form-control" value="shivraj.patil@occmasadvisory.com" readOnly />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Title*</label>
                            <input type="text" className="form-control" value="" readOnly />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Street Address*</label>
                            <input type="text" className="form-control" value="" readOnly />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">City*</label>
                            <input type="text" className="form-control" value="" readOnly />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">State*</label>
                            <input type="text" className="form-control" value="Alabama" readOnly />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">ZIP*</label>
                            <input type="text" className="form-control" value="" readOnly />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Primary Contact Info</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Email</label>
                            <input type="email" className="form-control" value="shivraj.patil@occmasadvisory.com" readOnly />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input type="text" className="form-control" value="454-645-6456" readOnly />
                          </div>
                        </div>
                        <div className="col-md-2">
                          <div className="form-group">
                            <label className="form-label">Contact Ext</label>
                            <input type="text" className="form-control" value="" readOnly />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Contact Phone Type</label>
                            <input type="text" className="form-control" value="" readOnly />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Billing Profile</h5>
                      <div className="row mb-3">
                        <div className="col-md-12">
                          <div className="form-group">
                            <label className="form-label">Select Billing Profile</label>
                            <select className="form-select">
                              <option>Select Billing Profile</option>
                              <option>Reporting Head - Production</option>
                              <option>Quickbook Play</option>
                              <option>Reporting Head</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">TaxNow</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Select TaxNow Signup Status</label>
                            <select
                              className="form-select"
                              value={taxNowSignupStatus}
                              onChange={(e) => setTaxNowSignupStatus(e.target.value)}
                            >
                              <option value="">Select TaxNow Signup Status</option>
                              <option value="Complete">Complete</option>
                              <option value="Incomplete">Incomplete</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Select TaxNow Onboarding Status</label>
                            <select
                              className="form-select"
                              value={taxNowOnboardingStatus}
                              onChange={(e) => setTaxNowOnboardingStatus(e.target.value)}
                            >
                              <option value="">Select TaxNow Onboarding Status</option>
                              {taxNowSignupStatus === 'Complete' ? (
                                <>
                                  <option value="Awaiting IRS">Awaiting IRS</option>
                                  <option value="Active">Active</option>
                                </>
                              ) : taxNowSignupStatus === 'Incomplete' ? (
                                <>
                                  <option value="Invite Sent">Invite Sent</option>
                                  <option value="KYC Verification">KYC Verification</option>
                                  <option value="KYB Verification">KYB Verification</option>
                                  <option value="TIA Unsigned">TIA Unsigned</option>
                                  <option value="Blank">Blank</option>
                                </>
                              ) : null}
                            </select>
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Business Legal Info</h5>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Business Entity Type*</label>
                            <select className="form-select">
                              <option>N/A</option>
                              <option>Sole Proprietorship</option>
                              <option>Partnership</option>
                              <option>Limited Liability (LLC)</option>
                              <option>Corporation (S,C,B,etc)</option>
                              <option>Trust</option>
                              <option>Other</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">If Other*</label>
                            <input type="text" className="form-control" placeholder="asd" />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Registration Number*</label>
                            <input type="text" className="form-control" value="" />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Registration Date*</label>
                            <input type="date" className="form-control" value="" />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">State of Registration*</label>
                            <input type="text" className="form-control" value="" />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">EIN*</label>
                            <input type="text" className="form-control" value="" />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Tax ID Type*</label>
                            <select className="form-select">
                              <option>N/A</option>
                              <option>EIN</option>
                              <option>TIN</option>
                              <option>SSN</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Sales User</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Internal Sales Agent</label>
                            <input type="text" className="form-control" value={lead.internal_sales_agent || ''} readOnly />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Internal Sales Support</label>
                            <input type="text" className="form-control" value={lead.internal_sales_support || ''} readOnly />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Folder Information</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label d-flex align-items-center">
                              Company Folder Link
                              <a
                                href={companyFolderLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ms-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#0d6efd" className="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                                  <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                                  <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                                </svg>
                              </a>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={companyFolderLink}
                              onChange={(e) => setCompanyFolderLink(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label d-flex align-items-center">
                              Document Folder Link
                              <a
                                href={documentFolderLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ms-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#0d6efd" className="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                                  <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                                  <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                                </svg>
                              </a>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={documentFolderLink}
                              onChange={(e) => setDocumentFolderLink(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card mb-4">
                      <div className="card-body">
                        <h5 className="card-title">Assigned Users</h5>
                        <div className="mb-3">
                          <p className="mb-1">{lead.employee_id} <span className="badge bg-primary">master_ops</span></p>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Select User to Assign</label>
                          <select className="form-select" disabled>
                            <option>Select User to Assign</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="card mb-4">
                      <div className="card-body">
                        <h5 className="card-title">Lead Group</h5>
                        <p className="mb-2">{lead.lead_group}</p>
                        <div className="form-group">
                          <label className="form-label">ERC - Referrals</label>
                          <select className="form-select" disabled>
                            <option>ERC - Referrals</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="card mb-4">
                      <div className="card-body">
                        <h5 className="card-title">Lead Campaign</h5>
                        <div className="form-group">
                          <label className="form-label">Referral</label>
                          <select className="form-select" disabled>
                            <option>Referral</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="card mb-4">
                      <div className="card-body">
                        <h5 className="card-title">Lead Source</h5>
                        <div className="form-group">
                          <label className="form-label">None</label>
                          <select className="form-select" disabled>
                            <option>None</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <button className="btn btn-primary" disabled>Save</button>
                      <button className="btn btn-danger" disabled>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Placeholder content for other tabs */}
              {activeTab === 'affiliateCommission' && (
                <div>
                  <h4>Affiliate Commission</h4>
                  <p>Affiliate commission information will be displayed here.</p>
                </div>
              )}

              {activeTab === 'contacts' && (
                <div>
                  <h4>Contacts</h4>
                  <p>Contact information will be displayed here.</p>
                </div>
              )}

              {activeTab === 'projects' && (
                <div>
                  <h4>Projects</h4>
                  <p>Project information will be displayed here.</p>
                </div>
              )}

              {activeTab === 'auditLogs' && (
                <div>
                  <h4>Audit Logs</h4>
                  <p>Audit logs will be displayed here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;