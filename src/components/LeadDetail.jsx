import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import Select from 'react-select';
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

  // Notes related state
  const [notes, setNotes] = useState([]);
  const [hasMoreNotes, setHasMoreNotes] = useState(true);
  const [notesPage, setNotesPage] = useState(1);
  const [newNote, setNewNote] = useState('');
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);

  // Assigned users related state
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOptions, setUserOptions] = useState([]);

  // Lead classification state
  const [leadGroup, setLeadGroup] = useState({ value: 'erc-fprs', label: 'ERC - FPRS' });
  const [leadCampaign, setLeadCampaign] = useState({ value: 'b2b', label: 'B2B' });
  const [leadSource, setLeadSource] = useState({ value: 'payment-cloud', label: 'Payment Cloud' });

  useEffect(() => {
    document.title = `Lead #${leadId} - Occams Portal`;
    fetchLeadDetails();
  }, [leadId]);

  // Reset onboarding status when signup status changes
  useEffect(() => {
    setTaxNowOnboardingStatus('');
  }, [taxNowSignupStatus]);

  // Fetch notes when component loads
  useEffect(() => {
    if (lead && notes.length === 0) {
      fetchNotes();
    }
  }, [lead]);

  // Fetch user data when component loads
  useEffect(() => {
    fetchUserData();
  }, []);

  // Function to fetch dummy user data
  const fetchUserData = () => {
    // Dummy user data
    const dummyUsers = [
      { id: 1, name: 'Adriana Salcedo', role: 'FPRS ERC Sales Agent', avatar: 'AS' },
      { id: 2, name: 'Alex Wasyl', role: 'Affiliate', avatar: 'AW' },
      { id: 3, name: 'Amber Kellogg', role: 'Occams Sales Agents', avatar: 'AK' },
      { id: 4, name: 'Ambur Hudson', role: 'FPRS ERC Sales Agent', avatar: 'AH' },
      { id: 5, name: 'Amit Sharma', role: 'MCT Sales Team', avatar: 'AS' },
      { id: 6, name: 'Andrew Miller', role: 'Affiliate', avatar: 'AM' },
      { id: 7, name: 'Benjamin Clark', role: 'FPRS ERC Sales Agent', avatar: 'BC' },
      { id: 8, name: 'Carla Rodriguez', role: 'Occams Sales Agents', avatar: 'CR' },
      { id: 9, name: 'David Thompson', role: 'MCT Sales Team', avatar: 'DT' },
      { id: 10, name: 'Emily Johnson', role: 'FPRS ERC Sales Agent', avatar: 'EJ' }
    ];

    // Set initial assigned user
    setAssignedUsers([dummyUsers[0]]);

    // Format options for react-select
    const options = dummyUsers.map(user => ({
      value: user.id,
      label: (
        <div className="d-flex align-items-center">
          <span>{user.name} ({user.role})</span>
        </div>
      ),
      user: user
    }));

    setUserOptions(options);
  };

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

  // Function to fetch notes with pagination
  const fetchNotes = () => {
    // Simulate API call with setTimeout
    setTimeout(() => {
      // Mock data for notes with different dates
      const mockNotes = [
        {
          id: 1,
          text: 'Occams Finance created an invoice for STC with the invoice ID - #6580',
          author: 'Occams Finance',
          date: new Date('2025-05-08T09:45:00'),
          formattedDate: 'May 8, 2025',
          formattedTime: '9:45 AM'
        },
        {
          id: 2,
          text: 'Testsng by SP',
          author: 'VB',
          date: new Date('2025-05-07T11:07:00'),
          formattedDate: 'May 7, 2025',
          formattedTime: '11:07 AM'
        },
        {
          id: 3,
          text: 'Reminder for the Invoice No.: 6571 has been paused by demomater.ops',
          author: 'demomater.ops',
          date: new Date('2025-05-06T17:40:00'),
          formattedDate: 'May 6, 2025',
          formattedTime: '5:40 PM'
        },
        {
          id: 4,
          text: 'Demo Finance sent an invoice reminder using the Invoice: Second Direct Reminder template for Invoice Id #6571',
          author: 'Demo Finance',
          date: new Date('2025-05-06T16:16:00'),
          formattedDate: 'May 6, 2025',
          formattedTime: '4:16 PM'
        },
        {
          id: 5,
          text: 'An update was made by Master ops',
          author: 'Master ops',
          date: new Date('2025-05-05T14:13:00'),
          formattedDate: 'May 5, 2025',
          formattedTime: '2:13 PM'
        }
      ];

      // If this is the first page, replace notes
      // Otherwise append to existing notes
      if (notesPage === 1) {
        setNotes(mockNotes);
      } else {
        // For demo purposes, we'll add more notes with different dates
        const moreNotes = mockNotes.map((note, index) => {
          const newDate = new Date(note.date);
          newDate.setDate(newDate.getDate() - 5); // 5 days earlier

          return {
            ...note,
            id: notes.length + index + 1,
            date: newDate,
            formattedDate: newDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            formattedTime: newDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
          };
        });

        setNotes([...notes, ...moreNotes]);
      }

      // For demo purposes, we'll stop loading more after 3 pages
      if (notesPage >= 3) {
        setHasMoreNotes(false);
      }
    }, 1000);
  };

  // Function to load more notes when scrolling
  const loadMoreNotes = () => {
    setNotesPage(prevPage => prevPage + 1);
    fetchNotes();
  };

  // Function to toggle the add note modal
  const toggleAddNoteModal = () => {
    setShowAddNoteModal(!showAddNoteModal);
    setNewNote('');
  };

  // Function to handle adding a new note
  const handleAddNote = (e) => {
    e.preventDefault();

    if (newNote.trim() === '') return;

    // Create a new note object
    const currentDate = new Date();
    const newNoteObj = {
      id: notes.length + 1,
      text: newNote,
      author: 'Current User',
      date: currentDate,
      formattedDate: currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      formattedTime: currentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    };

    // Add the new note to the beginning of the notes array
    setNotes([newNoteObj, ...notes]);

    // Close the modal and reset the new note input
    toggleAddNoteModal();
  };

  // Function to handle user selection
  const handleUserChange = (selectedOption) => {
    setSelectedUser(selectedOption);
  };

  // Function to assign a user
  const handleAssignUser = () => {
    if (selectedUser) {
      // Check if user is already assigned
      const isAlreadyAssigned = assignedUsers.some(user => user.id === selectedUser.user.id);

      if (!isAlreadyAssigned) {
        // Add the selected user to the assigned users list
        setAssignedUsers([...assignedUsers, selectedUser.user]);
      }

      // Reset the selected user
      setSelectedUser(null);
    }
  };

  // Function to remove an assigned user
  const handleRemoveUser = (userId) => {
    const updatedUsers = assignedUsers.filter(user => user.id !== userId);
    setAssignedUsers(updatedUsers);
  };

  // Functions to handle lead classification changes
  const handleLeadGroupChange = (selectedOption) => {
    setLeadGroup(selectedOption);
  };

  const handleLeadCampaignChange = (selectedOption) => {
    setLeadCampaign(selectedOption);
  };

  const handleLeadSourceChange = (selectedOption) => {
    setLeadSource(selectedOption);
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
                <div>
                  <div className="row">
                    <div className="col-md-8">
                      <div className="mb-4 left-section-container">
                      <h5 className="section-title">Business Identity</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Legal Name*</label>
                            <input type="text" className="form-control" defaultValue="CTCERC Play" />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Doing Business As</label>
                            <input type="text" className="form-control" defaultValue="" />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Category*</label>
                            <input type="text" className="form-control" defaultValue="" />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Website URL*</label>
                            <input type="text" className="form-control" defaultValue={lead.website || ''} />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Business Contact Info</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Authorized Signatory Name</label>
                            <input type="text" className="form-control" defaultValue="CTCERC Play SP" />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Phone*</label>
                            <input type="text" className="form-control" defaultValue="454-645-6456" />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Email*</label>
                            <input type="email" className="form-control" defaultValue="shivraj.patil@occmasadvisory.com" />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Title*</label>
                            <input type="text" className="form-control" defaultValue="" />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Street Address*</label>
                            <input type="text" className="form-control" defaultValue="" />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">City*</label>
                            <input type="text" className="form-control" defaultValue="" />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">State*</label>
                            <input type="text" className="form-control" defaultValue="Alabama" />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">ZIP*</label>
                            <input type="text" className="form-control" defaultValue="" />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Primary Contact Info</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Email</label>
                            <input type="email" className="form-control" defaultValue="shivraj.patil@occmasadvisory.com" />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input type="text" className="form-control" defaultValue="454-645-6456" />
                          </div>
                        </div>
                        <div className="col-md-2">
                          <div className="form-group">
                            <label className="form-label">Contact Ext</label>
                            <input type="text" className="form-control" defaultValue="" />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Contact Phone Type</label>
                            <input type="text" className="form-control" defaultValue="" />
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

                      {/* Notes Section */}
                      <h5 className="section-title mt-4">Notes</h5>
                      <div className="notes-container p-0">
                        <div className="d-flex justify-content-between align-items-center mb-4 notes-header">
                          <h6 className="notes-title mb-0">Lead notes and activity history</h6>
                          <button
                            className="btn add-note-btn"
                            onClick={toggleAddNoteModal}
                          >
                            <span className="d-flex align-items-center">
                              <i className="fas fa-plus me-2"></i>Add Note
                            </span>
                          </button>
                        </div>

                        {notes.length === 0 ? (
                          <div className="text-center py-4 bg-light rounded">
                            <div className="mb-3">
                              <i className="fas fa-sticky-note fa-3x text-muted"></i>
                            </div>
                            <p className="text-muted">No notes available for this lead</p>
                            <button
                              className="btn add-note-btn mt-3"
                              onClick={toggleAddNoteModal}
                            >
                              <span className="d-flex align-items-center">
                                <i className="fas fa-plus me-2"></i>Add First Note
                              </span>
                            </button>
                          </div>
                        ) : (
                          <div
                            id="scrollableNotesDiv"
                            style={{
                              height: '300px',
                              overflow: 'auto',
                              border: '1px solid #e9ecef',
                              borderRadius: '8px',
                              padding: '20px',
                              backgroundColor: '#f8f9fa'
                            }}
                          >
                            <InfiniteScroll
                              dataLength={notes.length}
                              next={loadMoreNotes}
                              hasMore={hasMoreNotes}
                              loader={
                                <div className="text-center py-3">
                                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                  </div>
                                  <p className="text-muted small mt-2">Loading more notes...</p>
                                </div>
                              }
                              endMessage={
                                <div className="text-center py-3">
                                  <p className="text-muted small">No more notes to load</p>
                                </div>
                              }
                              scrollableTarget="scrollableNotesDiv"
                            >
                              {notes.map((note, index) => (
                                <div
                                  key={note.id}
                                  className="note-item mb-3 p-3 bg-white rounded shadow-sm"
                                >
                                  <div className="d-flex justify-content-between">
                                    <div className="note-date fw-bold">{note.formattedDate}</div>
                                    <div className="note-time text-muted">{note.formattedTime}</div>
                                  </div>
                                  <div className="note-content mt-2">
                                    <span className="d-flex align-items-center">
                                      <span className="fw-bold text-primary">{note.author}</span>
                                      <span className="ms-1">added a : {note.text}</span>
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </InfiniteScroll>
                          </div>
                        )}

                        {/* Add Note Modal */}
                        {showAddNoteModal && (
                          <>
                            <div className="modal-backdrop show" style={{ display: 'block' }}></div>
                            <div className={`modal ${showAddNoteModal ? 'show' : ''}`} style={{ display: 'block' }}>
                              <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '650px' }}>
                                <div className="modal-content" style={{ borderRadius: '8px' }}>
                                  <div className="modal-header pb-2">
                                    <h5 className="modal-title">Add Note</h5>
                                    <button type="button" className="btn-close" onClick={toggleAddNoteModal}></button>
                                  </div>
                                  <div className="modal-body">
                                    <form onSubmit={handleAddNote}>

                                      <div className="mb-3">
                                        <textarea
                                          className="form-control"
                                          rows="5"
                                          placeholder="Enter your note here..."
                                          value={newNote}
                                          onChange={(e) => setNewNote(e.target.value)}
                                          style={{ resize: 'vertical', minHeight: '100px' }}
                                        ></textarea>
                                      </div>
                                      <div className="text-muted small">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Your note will be saved with the current date and time.
                                      </div>
                                      <div className="d-flex justify-content-center gap-3 mt-4">
                                        <button type="submit" className="btn modal-save-btn">Save Note</button>
                                        <button type="button" className="btn modal-cancel-btn" onClick={toggleAddNoteModal}>Cancel</button>
                                      </div>
                                    </form>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card mb-4">
                      <div className="card-body">
                        <h5 className="card-title">Assigned Users:</h5>

                        {/* Display assigned users */}
                        <div className="assigned-users-list mb-4">
                          {assignedUsers.map(user => (
                            <div key={user.id} className="simple-user-item d-flex align-items-center justify-content-between mb-2">
                              <div className="user-name-simple">{user.name}</div>
                              <button
                                className="btn-remove-user"
                                onClick={() => handleRemoveUser(user.id)}
                                aria-label="Remove user"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Select2 dropdown for user assignment */}
                        <div className="form-group mb-3">
                          <Select
                            value={selectedUser}
                            onChange={handleUserChange}
                            options={userOptions}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Select user to assign..."
                            isClearable
                            styles={{
                              control: (base) => ({
                                ...base,
                                borderRadius: '4px',
                                borderColor: '#ced4da',
                                boxShadow: 'none',
                                '&:hover': {
                                  borderColor: '#adb5bd'
                                }
                              }),
                              option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isSelected
                                  ? '#6c63ff'
                                  : state.isFocused
                                    ? '#f0f4ff'
                                    : 'white',
                                color: state.isSelected ? 'white' : '#333',
                                padding: '10px 12px'
                              }),
                              menu: (base) => ({
                                ...base,
                                zIndex: 9999,
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                              })
                            }}
                          />
                        </div>

                        {/* Assign user button */}
                        <button
                          className="btn assign-user-btn w-100"
                          onClick={handleAssignUser}
                          disabled={!selectedUser}
                        >
                          Assign User
                        </button>
                      </div>
                    </div>

                    <div className="card mb-4">
                      <div className="card-body">
                        <h5 className="card-title">Lead Group:</h5>
                        <div className="form-group mb-4">
                          <Select
                            value={leadGroup}
                            onChange={handleLeadGroupChange}
                            options={[
                              { value: 'erc-fprs', label: 'ERC - FPRS' },
                              { value: 'erc-referrals', label: 'ERC - Referrals' },
                              { value: 'erc-direct', label: 'ERC - Direct' },
                              { value: 'erc-partners', label: 'ERC - Partners' }
                            ]}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            isClearable
                            styles={{
                              control: (base) => ({
                                ...base,
                                borderRadius: '4px',
                                borderColor: '#ced4da',
                                boxShadow: 'none',
                                '&:hover': {
                                  borderColor: '#adb5bd'
                                }
                              })
                            }}
                          />
                        </div>

                        <h5 className="card-title">Lead Campaign:</h5>
                        <div className="form-group mb-4">
                          <Select
                            value={leadCampaign}
                            onChange={handleLeadCampaignChange}
                            options={[
                              { value: 'b2b', label: 'B2B' },
                              { value: 'referral', label: 'Referral' },
                              { value: 'direct', label: 'Direct' },
                              { value: 'partner', label: 'Partner' },
                              { value: 'social', label: 'Social Media' }
                            ]}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            isClearable
                            styles={{
                              control: (base) => ({
                                ...base,
                                borderRadius: '4px',
                                borderColor: '#ced4da',
                                boxShadow: 'none',
                                '&:hover': {
                                  borderColor: '#adb5bd'
                                }
                              })
                            }}
                          />
                        </div>

                        <h5 className="card-title">Lead Source:</h5>
                        <div className="form-group">
                          <Select
                            value={leadSource}
                            onChange={handleLeadSourceChange}
                            options={[
                              { value: 'payment-cloud', label: 'Payment Cloud' },
                              { value: 'website', label: 'Website' },
                              { value: 'cold-call', label: 'Cold Call' },
                              { value: 'email', label: 'Email Campaign' },
                              { value: 'linkedin', label: 'LinkedIn' },
                              { value: 'facebook', label: 'Facebook' }
                            ]}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            isClearable
                            styles={{
                              control: (base) => ({
                                ...base,
                                borderRadius: '4px',
                                borderColor: '#ced4da',
                                boxShadow: 'none',
                                '&:hover': {
                                  borderColor: '#adb5bd'
                                }
                              })
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                        <div className="action-buttons">
                          <button className="btn save-btn">Save</button>
                          <button className="btn cancel-btn">Cancel</button>
                        </div>
                    </div>

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