import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import Select from 'react-select';
import './common/CommonStyles.css';
import './LeadDetail.css';
import Notes from './common/Notes';
import { getAssetPath } from '../utils/assetUtils';

const LeadDetail = () => {
  const { leadId } = useParams();
  const location = useLocation();
  const passedLeadData = location.state?.leadData;

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

  // Contacts related state
  const [primaryContact, setPrimaryContact] = useState({
    name: 'CTCERC Play',
    email: 'shivraj.patil@occmasadvisory.com',
    phone: '(454) 645-6456',
    initials: 'CP'
  });
  const [secondaryContact, setSecondaryContact] = useState({
    name: 'STC Play',
    email: 'coraja1431@cartep.com',
    phone: '(234) 234-2342',
    initials: 'SP'
  });

  // Projects related state
  const [project, setProject] = useState({
    id: '1709',
    businessName: 'CTCERC Play SP',
    projectName: '',
    productName: 'ERC',
    productId: '935',
    milestone: 'ERC Fulfillment',
    milestoneId: '110',
    stage: 'Success Fees Processing Client Initiate',
    stageId: '169',
    fee: '',
    maxCredit: '',
    estFee: '',
    collaborator: 'Master Ops',
    collaboratorId: '44025',
    contactId: '6441'
  });

  // Lead classification state
  const [leadGroup, setLeadGroup] = useState(null);
  const [leadCampaign, setLeadCampaign] = useState(null);
  const [leadSource, setLeadSource] = useState(null);

  // Affiliate Commission state
  const [tier1CommissionBasis, setTier1CommissionBasis] = useState({ value: 'referrer-fixed', label: 'Referrer Fixed' });
  const [tier1ReferrerType, setTier1ReferrerType] = useState({ value: 'referrer-fixed', label: 'Referrer Fixed' });
  const [tier1ReferrerFixed, setTier1ReferrerFixed] = useState('');
  const [tier1ErcChgReceived, setTier1ErcChgReceived] = useState('');
  const [tier1InvoiceAmount, setTier1InvoiceAmount] = useState('');

  const [tier2CommissionBasis, setTier2CommissionBasis] = useState({ value: 'affiliate-commission', label: 'Affiliate Commission Basis' });
  const [tier2CommissionType, setTier2CommissionType] = useState({ value: 'affiliate-commission', label: 'Affiliate Commission Type' });
  const [tier2ReferrerFixed, setTier2ReferrerFixed] = useState('');
  const [tier2ErcChgReceived, setTier2ErcChgReceived] = useState('');
  const [tier2InvoiceAmount, setTier2InvoiceAmount] = useState('');

  const [tier3CommissionBasis, setTier3CommissionBasis] = useState({ value: 'affiliate-commission', label: 'Affiliate Commission Basis' });
  const [tier3CommissionType, setTier3CommissionType] = useState({ value: 'affiliate-commission', label: 'Affiliate Commission Type' });
  const [tier3ReferrerFixed, setTier3ReferrerFixed] = useState('');
  const [tier3ErcChgReceived, setTier3ErcChgReceived] = useState('');
  const [tier3InvoiceAmount, setTier3InvoiceAmount] = useState('');

  const [currentTier, setCurrentTier] = useState({ value: '', label: 'Select Current Tier' });

  // Affiliate Slab Commission state
  const [slab1AppliedOn, setSlab1AppliedOn] = useState('');
  const [slab1CommissionType, setSlab1CommissionType] = useState({ value: '', label: 'Slab-1 Commission Type' });
  const [slab1CommissionValue, setSlab1CommissionValue] = useState('');

  const [slab2AppliedOn, setSlab2AppliedOn] = useState('');
  const [slab2CommissionType, setSlab2CommissionType] = useState({ value: '', label: 'Slab-2 Commission Type' });
  const [slab2CommissionValue, setSlab2CommissionValue] = useState('');

  const [slab3AppliedOn, setSlab3AppliedOn] = useState('');
  const [slab3CommissionType, setSlab3CommissionType] = useState({ value: '', label: 'Slab-3 Commission Type' });
  const [slab3CommissionValue, setSlab3CommissionValue] = useState('');

  // Master Affiliate Commission state
  const [masterCommissionType, setMasterCommissionType] = useState({ value: '', label: 'Master Commission Type' });
  const [masterCommissionValue, setMasterCommissionValue] = useState('');

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
      // If we have lead data passed from the report page, use it
      if (passedLeadData) {
        console.log('Using passed lead data:', passedLeadData);
        setLead(passedLeadData);

        // Set TaxNow status if available
        if (passedLeadData.taxnow_signup_status) {
          setTaxNowSignupStatus(passedLeadData.taxnow_signup_status);
        }
        if (passedLeadData.taxnow_onboarding_status) {
          setTaxNowOnboardingStatus(passedLeadData.taxnow_onboarding_status);
        }

        // Set lead classification data
        if (passedLeadData.lead_group) {
          setLeadGroup({ value: passedLeadData.lead_group.toLowerCase().replace(/\s+/g, '-'),
                         label: passedLeadData.lead_group });
        }

        if (passedLeadData.campaign) {
          setLeadCampaign({ value: passedLeadData.campaign.toLowerCase().replace(/\s+/g, '-'),
                            label: passedLeadData.campaign });
        }

        if (passedLeadData.source) {
          setLeadSource({ value: passedLeadData.source.toLowerCase().replace(/\s+/g, '-'),
                          label: passedLeadData.source });
        }

        setLoading(false);
      } else {
        // Otherwise fetch from API or use mock data
        console.log('No passed data, fetching from API or using mock data');

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
      }
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

  // Handlers for Affiliate Commission form
  const handleTier1CommissionBasisChange = (selectedOption) => {
    setTier1CommissionBasis(selectedOption);
  };

  const handleTier1ReferrerTypeChange = (selectedOption) => {
    setTier1ReferrerType(selectedOption);
  };

  const handleTier1ReferrerFixedChange = (e) => {
    setTier1ReferrerFixed(e.target.value);
  };

  const handleTier1ErcChgReceivedChange = (e) => {
    setTier1ErcChgReceived(e.target.value);
  };

  const handleTier1InvoiceAmountChange = (e) => {
    setTier1InvoiceAmount(e.target.value);
  };

  const handleTier2CommissionBasisChange = (selectedOption) => {
    setTier2CommissionBasis(selectedOption);
  };

  const handleTier2CommissionTypeChange = (selectedOption) => {
    setTier2CommissionType(selectedOption);
  };

  const handleTier2ReferrerFixedChange = (e) => {
    setTier2ReferrerFixed(e.target.value);
  };

  const handleTier2ErcChgReceivedChange = (e) => {
    setTier2ErcChgReceived(e.target.value);
  };

  const handleTier2InvoiceAmountChange = (e) => {
    setTier2InvoiceAmount(e.target.value);
  };

  // Handlers for Tier 3 Affiliate Commission
  const handleTier3CommissionBasisChange = (selectedOption) => {
    setTier3CommissionBasis(selectedOption);
  };

  const handleTier3CommissionTypeChange = (selectedOption) => {
    setTier3CommissionType(selectedOption);
  };

  const handleTier3ReferrerFixedChange = (e) => {
    setTier3ReferrerFixed(e.target.value);
  };

  const handleTier3ErcChgReceivedChange = (e) => {
    setTier3ErcChgReceived(e.target.value);
  };

  const handleTier3InvoiceAmountChange = (e) => {
    setTier3InvoiceAmount(e.target.value);
  };

  // Handler for Current Tier
  const handleCurrentTierChange = (selectedOption) => {
    setCurrentTier(selectedOption);
  };

  // Handlers for Affiliate Slab Commission
  const handleSlab1AppliedOnChange = (e) => {
    setSlab1AppliedOn(e.target.value);
  };

  const handleSlab1CommissionTypeChange = (selectedOption) => {
    setSlab1CommissionType(selectedOption);
  };

  const handleSlab1CommissionValueChange = (e) => {
    setSlab1CommissionValue(e.target.value);
  };

  const handleSlab2AppliedOnChange = (e) => {
    setSlab2AppliedOn(e.target.value);
  };

  const handleSlab2CommissionTypeChange = (selectedOption) => {
    setSlab2CommissionType(selectedOption);
  };

  const handleSlab2CommissionValueChange = (e) => {
    setSlab2CommissionValue(e.target.value);
  };

  const handleSlab3AppliedOnChange = (e) => {
    setSlab3AppliedOn(e.target.value);
  };

  const handleSlab3CommissionTypeChange = (selectedOption) => {
    setSlab3CommissionType(selectedOption);
  };

  const handleSlab3CommissionValueChange = (e) => {
    setSlab3CommissionValue(e.target.value);
  };

  // Handlers for Master Affiliate Commission
  const handleMasterCommissionTypeChange = (selectedOption) => {
    setMasterCommissionType(selectedOption);
  };

  const handleMasterCommissionValueChange = (e) => {
    setMasterCommissionValue(e.target.value);
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
              <div className="row">
                {/* Left Content Area - Changes based on active tab */}
                <div className="col-md-8">
                  {/* Business Info Tab Content */}
                  {activeTab === 'businessInfo' && (
                    <div className="mb-4 left-section-container">
                      <h5 className="section-title">Business Identity</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Legal Name*</label>
                            <input type="text" className="form-control" defaultValue={lead.business_legal_name || ''} />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Doing Business As</label>
                            <input type="text" className="form-control" defaultValue={lead.doing_business_as || ''} />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Category*</label>
                            <input type="text" className="form-control" defaultValue={lead.category || ''} />
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
                            <input type="text" className="form-control" defaultValue={lead.authorized_signatory_name || ''} />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Phone*</label>
                            <input type="text" className="form-control" defaultValue={lead.business_phone || ''} />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Email*</label>
                            <input type="email" className="form-control" defaultValue={lead.business_email || ''} />
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
                            <input type="email" className="form-control" defaultValue="shivraj.patil@occmasadvisory.com" readOnly />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input type="text" className="form-control" defaultValue="454-645-6456" readOnly />
                          </div>
                        </div>
                        <div className="col-md-2">
                          <div className="form-group">
                            <label className="form-label">Contact Ext</label>
                            <input type="text" className="form-control" defaultValue="" readOnly />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Contact Phone Type</label>
                            <input type="text" className="form-control" defaultValue="" readOnly />
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
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Registration Date*</label>
                            <input type="date" className="form-control" value="" />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">State of Registration*</label>
                            <input type="text" className="form-control" value="" />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">EIN*</label>
                            <input type="text" className="form-control" value="" />
                          </div>
                        </div>
                        <div className="col-md-3">
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
                            <input type="text" className="form-control" defaultValue={lead.internal_sales_agent || ''} readOnly />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Internal Sales Support</label>
                            <input type="text" className="form-control" defaultValue={lead.internal_sales_support || ''} readOnly />
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
                      <Notes
                        entityType="lead"
                        entityId={leadId}
                        entityName={lead?.business_legal_name || ''}
                        showButtons={false}
                        showNotes={true}
                        maxHeight={300}
                      />
                    </div>
                  )}



                  {/* Affiliate Commission Tab Content */}
                  {activeTab === 'affiliateCommission' && (
                    <div className="mb-4 left-section-container">
                      <h5 className="section-title">Tier 1 Affiliate Commission</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Affiliate Commission Basis</label>
                            <select
                              className="form-select"
                              value={tier1CommissionBasis?.value || ''}
                              onChange={(e) => handleTier1CommissionBasisChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Select Affiliate Commission Basis</option>
                              <option value="erc-chq-received">ERC Chq Received</option>
                              <option value="erc-invoice-amount">ERC Invoice Amount</option>
                              <option value="lower-of-both">Lower of Both</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Affiliate Commission Type</label>
                            <select
                              className="form-select"
                              value={tier1ReferrerType?.value || ''}
                              onChange={(e) => handleTier1ReferrerTypeChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Select Affiliate Commission Type</option>
                              <option value="referrer-fixed">Referrer Fixed</option>
                              <option value="referrer-percentage">Referrer Percentage</option>
                              <option value="fixed-percentage">Fixed + Percentage</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Referrer Fixed</label>
                            <input
                              type="text"
                              className="form-control"
                              value={tier1ReferrerFixed}
                              onChange={handleTier1ReferrerFixedChange}
                              placeholder="Enter amount"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">% On ERC Chg Received</label>
                            <input
                              type="text"
                              className="form-control"
                              value={tier1ErcChgReceived}
                              onChange={handleTier1ErcChgReceivedChange}
                              placeholder="Enter percentage"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">% On Invoice Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              value={tier1InvoiceAmount}
                              onChange={handleTier1InvoiceAmountChange}
                              placeholder="Enter percentage"
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Tier 2 Affiliate Commission</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Affiliate Commission Basis</label>
                            <select
                              className="form-select"
                              value={tier2CommissionBasis?.value || ''}
                              onChange={(e) => handleTier2CommissionBasisChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Select Affiliate Commission Basis</option>
                              <option value="affiliate-commission-basis">Affiliate Commission Basis</option>
                              <option value="erc-chq-received">ERC Chq Received</option>
                              <option value="erc-invoice-amount">ERC Invoice Amount</option>
                              <option value="lower-of-both">Lower of Both</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Affiliate Commission Type</label>
                            <select
                              className="form-select"
                              value={tier2CommissionType?.value || ''}
                              onChange={(e) => handleTier2CommissionTypeChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Select Affiliate Commission Type</option>
                              <option value="affiliate-commission-type">Affiliate Commission Type</option>
                              <option value="referrer-fixed">Referrer Fixed</option>
                              <option value="referrer-percentage">Referrer Percentage</option>
                              <option value="fixed-percentage">Fixed + Percentage</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Referrer Fixed</label>
                            <input
                              type="text"
                              className="form-control"
                              value={tier2ReferrerFixed}
                              onChange={handleTier2ReferrerFixedChange}
                              placeholder="Enter amount"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">% On ERC Chg Received</label>
                            <input
                              type="text"
                              className="form-control"
                              value={tier2ErcChgReceived}
                              onChange={handleTier2ErcChgReceivedChange}
                              placeholder="Enter percentage"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">% On Invoice Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              value={tier2InvoiceAmount}
                              onChange={handleTier2InvoiceAmountChange}
                              placeholder="Enter percentage"
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Tier 3 Affiliate Commission</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Affiliate Commission Basis</label>
                            <select
                              className="form-select"
                              value={tier3CommissionBasis?.value || ''}
                              onChange={(e) => handleTier3CommissionBasisChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Select Affiliate Commission Basis</option>
                              <option value="affiliate-commission-basis">Affiliate Commission Basis</option>
                              <option value="erc-chq-received">ERC Chq Received</option>
                              <option value="erc-invoice-amount">ERC Invoice Amount</option>
                              <option value="lower-of-both">Lower of Both</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Affiliate Commission Type</label>
                            <select
                              className="form-select"
                              value={tier3CommissionType?.value || ''}
                              onChange={(e) => handleTier3CommissionTypeChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Select Affiliate Commission Type</option>
                              <option value="affiliate-commission-type">Affiliate Commission Type</option>
                              <option value="referrer-fixed">Referrer Fixed</option>
                              <option value="referrer-percentage">Referrer Percentage</option>
                              <option value="fixed-percentage">Fixed + Percentage</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Referrer Fixed</label>
                            <input
                              type="text"
                              className="form-control"
                              value={tier3ReferrerFixed}
                              onChange={handleTier3ReferrerFixedChange}
                              placeholder="Enter amount"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">% On ERC Chg Received</label>
                            <input
                              type="text"
                              className="form-control"
                              value={tier3ErcChgReceived}
                              onChange={handleTier3ErcChgReceivedChange}
                              placeholder="Enter percentage"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">% On Invoice Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              value={tier3InvoiceAmount}
                              onChange={handleTier3InvoiceAmountChange}
                              placeholder="Enter percentage"
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Current Tier</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <select
                              className="form-select"
                              value={currentTier?.value || ''}
                              onChange={(e) => handleCurrentTierChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Select Current Tier</option>
                              <option value="tier-1">Tier 1</option>
                              <option value="tier-2">Tier 2</option>
                              <option value="tier-3">Tier 3</option>
                              <option value="slab">Slab</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Affiliate Slab Commission</h5>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Slab-1 Applied On</label>
                            <input
                              type="text"
                              className="form-control"
                              value={slab1AppliedOn}
                              onChange={handleSlab1AppliedOnChange}
                              placeholder="Slab-1 Applied On"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Slab-1 Commission Type</label>
                            <select
                              className="form-select"
                              value={slab1CommissionType?.value || ''}
                              onChange={(e) => handleSlab1CommissionTypeChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Slab-1 Commission Type</option>
                              <option value="percentage">Percentage</option>
                              <option value="fixed">Fixed</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Slab-1 Commission Value</label>
                            <input
                              type="text"
                              className="form-control"
                              value={slab1CommissionValue}
                              onChange={handleSlab1CommissionValueChange}
                              placeholder="Slab-1 Commission Value"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Slab-2 Applied On</label>
                            <input
                              type="text"
                              className="form-control"
                              value={slab2AppliedOn}
                              onChange={handleSlab2AppliedOnChange}
                              placeholder="Slab-2 Applied On"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Slab-2 Commission Type</label>
                            <select
                              className="form-select"
                              value={slab2CommissionType?.value || ''}
                              onChange={(e) => handleSlab2CommissionTypeChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Slab-2 Commission Type</option>
                              <option value="percentage">Percentage</option>
                              <option value="fixed">Fixed</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Slab-2 Commission Value</label>
                            <input
                              type="text"
                              className="form-control"
                              value={slab2CommissionValue}
                              onChange={handleSlab2CommissionValueChange}
                              placeholder="Slab-2 Commission Value"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Slab-3 Applied On</label>
                            <input
                              type="text"
                              className="form-control"
                              value={slab3AppliedOn}
                              onChange={handleSlab3AppliedOnChange}
                              placeholder="Slab-3 Applied On"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Slab-3 Commission Type</label>
                            <select
                              className="form-select"
                              value={slab3CommissionType?.value || ''}
                              onChange={(e) => handleSlab3CommissionTypeChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Slab-3 Commission Type</option>
                              <option value="percentage">Percentage</option>
                              <option value="fixed">Fixed</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Slab-3 Commission Value</label>
                            <input
                              type="text"
                              className="form-control"
                              value={slab3CommissionValue}
                              onChange={handleSlab3CommissionValueChange}
                              placeholder="Slab-3 Commission Value"
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Master Affiliate Commission</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Master Commission Type</label>
                            <select
                              className="form-select"
                              value={masterCommissionType?.value || ''}
                              onChange={(e) => handleMasterCommissionTypeChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Master Commission Type</option>
                              <option value="master-commission-type">Master Commission Type</option>
                              <option value="affiliate-fixed">Affiliate Fixed</option>
                              <option value="percentage-of-subaffiliate-commission">Percentage Of Subaffiliate Commission</option>
                              <option value="percentage-of-affiliate-invoice">Percentage Of Affiliate Invoice</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Master Commission Value</label>
                            <input
                              type="text"
                              className="form-control"
                              value={masterCommissionValue}
                              onChange={handleMasterCommissionValueChange}
                              placeholder="Master Commission Value"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contacts Tab Content */}
                  {activeTab === 'contacts' && (
                    <div className="mb-4 left-section-container">
                      <div className="row custom_opp_create_btn">
                        <a href="javascript:void(0)">
                            <i className="fa-solid fa-plus"></i> New Contact
                        </a>
                        <a className="link_contact" href="javascript:void(0)" data-bs-toggle="modal" data-bs-target="#link-contact" title="Link a contact">
                          <i className="fa-solid fa-plus"></i> Link a Contact
                        </a>
                      </div>

                      <div className="row contact_tab_data mt-4">
                        <div className="col-md-6 col-sm-12 mb-4 contact-card">
                          <div className="card-exam shadow">
                            <div className="custom_opp_tab_header">
                              <h5>
                                <i className="fas fa-star"></i> Primary
                              </h5>
                              <div className="opp_edit_dlt_btn">
                                <a className="edit_contact" href="javascript:void(0)" title="Edit" data-contact-id="6441">
                                  <i className="fas fa-pen"></i>
                                </a>
                                <a className="delete_contact" href="javascript:void(0)" data-contact-id="6441" title="Disable">
                                  <i className="fas fa-ban"></i>
                                </a>
                              </div>
                            </div>
                            <div className="d-flex w-100 mt-3 align-items-center">
                              <div className="circle">{primaryContact.initials}</div>
                              <div className="card-exam-title">
                                <p><a href="javascript:void(0)" target="_blank">{primaryContact.name}</a></p>
                                <p>{primaryContact.email}</p>
                                <p>{primaryContact.phone}</p>
                                <input type="hidden" name="hidden_contact_name" id="hidden_contact_name_6441" value={primaryContact.name} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6 col-sm-12 mb-4 contact-card">
                          <div className="card-exam shadow">
                            <div className="custom_opp_tab_header">
                              <h5>
                                <i className="fas fa-star"></i> Secondary
                              </h5>
                              <div className="opp_edit_dlt_btn">
                                <a className="edit_contact" href="javascript:void(0)" title="Edit" data-contact-id="6380">
                                  <i className="fas fa-pen"></i>
                                </a>
                                <a className="delete_contact" href="javascript:void(0)" data-contact-id="6380" title="Disable">
                                  <i className="fas fa-ban"></i>
                                </a>
                              </div>
                            </div>
                            <div className="d-flex w-100 mt-3 align-items-center">
                              <div className="circle">{secondaryContact.initials}</div>
                              <div className="card-exam-title">
                                <p><a href="javascript:void(0)" target="_blank">{secondaryContact.name}</a></p>
                                <p>{secondaryContact.email}</p>
                                <p>{secondaryContact.phone}</p>
                                <input type="hidden" name="hidden_contact_name" id="hidden_contact_name_6380" value={secondaryContact.name} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Projects Tab Content */}
                  {activeTab === 'projects' && (
                    <div className="mb-4 left-section-container">
                      <div className="row custom_opp_tab">
                        <div className="col-sm-12">
                          <div className="custom_opp_tab_header">
                            <h5><a href="javascript:void(0)"></a></h5>
                            <div className="opp_edit_dlt_btn projects-iris">
                              <a
                                className="edit_project"
                                data-projid={project.id}
                                data-projname={project.projectName}
                                data-businessname={project.businessName}
                                data-productname={project.productName}
                                data-productid={project.productId}
                                data-milestone={project.milestone}
                                data-milestoneid={project.milestoneId}
                                data-stage={project.stage}
                                data-stageid={project.stageId}
                                data-fee={project.fee}
                                data-max_credit={project.maxCredit}
                                data-est_fee={project.estFee}
                                data-collab={project.collaboratorId}
                                data-contact={project.contactId}
                                href="javascript:void(0)"
                                title="Edit"
                              >
                                <i className="fas fa-pen"></i>
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-7 text-left">
                          <div className="lead_des">
                            <p><b>Business Name:</b> {project.businessName}</p>
                            <p><b>Project Name:</b> {project.projectName}</p>
                            <p><b>Product Name:</b> {project.productName}</p>
                          </div>
                        </div>
                        <div className="col-md-5">
                          <div className="lead_des">
                            <p><b>Milestone:</b> {project.milestone}</p>
                            <p><b>Stage:</b> {project.stage}</p>
                            <p><b>Collaborator:</b> {project.collaborator}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Audit Logs Tab Content */}
                  {activeTab === 'auditLogs' && (
                    <div className="mb-4 left-section-container">
                      <h4>Audit Logs</h4>
                      <p>Audit logs will be displayed here.</p>
                    </div>
                  )}
                </div>

                {/* Right Side Section - Same for all tabs */}
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

                  <div className=" mt-4">
                      <div className="action-buttons">
                        <button className="btn save-btn">Save</button>
                        <button className="btn cancel-btn">Cancel</button>
                      </div>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;