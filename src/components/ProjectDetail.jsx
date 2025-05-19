import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import Select from 'react-select';
import './common/ReportStyle.css';
import './LeadDetail.css'; // Reusing the same CSS
import Notes from './common/Notes';
import { getAssetPath } from '../utils/assetUtils';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const passedProjectData = location.state?.projectData;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('project');
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

  // Project group, campaign, source, and stage state
  const [owner, setOwner] = useState(null);
  const [projectCampaign, setProjectCampaign] = useState(null);
  const [projectSource, setProjectSource] = useState(null);
  const [projectStage, setProjectStage] = useState({ value: 'client-declarations-signed', label: 'Client Declarations Signed' });

  // Milestone and Stage edit state
  const [milestone, setMilestone] = useState({ value: 'erc-fulfillment', label: 'ERC Fulfillment' });
  const [isEditing, setIsEditing] = useState(false);

  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    document.title = `Project #${projectId} - Occams Portal`;
    fetchProjectDetails();
  }, [projectId]);

  // Reset onboarding status when signup status changes
  useEffect(() => {
    setTaxNowOnboardingStatus('');
  }, [taxNowSignupStatus]);

  // Fetch notes when component loads
  useEffect(() => {
    if (project && notes.length === 0) {
      fetchNotes();
    }
  }, [project]);

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
      { id: 3, name: 'Amber Kellogg', role: 'Occams Sales Agents', avatar: 'AK' }
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

  const fetchProjectDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // If we have project data passed from the report page, use it
      if (passedProjectData) {
        console.log('Using passed project data:', passedProjectData);
        setProject(passedProjectData);

        // Set TaxNow status if available
        if (passedProjectData.taxnow_signup_status) {
          setTaxNowSignupStatus(passedProjectData.taxnow_signup_status);
        }
        if (passedProjectData.taxnow_onboarding_status) {
          setTaxNowOnboardingStatus(passedProjectData.taxnow_onboarding_status);
        }

        setLoading(false);
      } else {
        // Otherwise fetch from API or use mock data
        console.log('No passed data, fetching from API or using mock data');

        // In a real application, you would fetch the project details from your API
        // For now, we'll simulate a delay and return mock data
        setTimeout(() => {
          const mockProject = {
            project_id: projectId,
            business_legal_name: "CTCERC Play SP",
            business_email: "shivraj.patil@occamsadvisory.com",
            business_phone: "454-645-6456",
            business_address: "123 Main St",
            city: "Birmingham",
            state: "Alabama",
            zip: "35201",
            website: "https://example.com",
            business_type: "Corporation",
            project_name: "ERC Project",
            product_name: "ERC",
            milestone: "ERC Fulfillment",
            stage_name: "Success Fees Processing Client Initiate",
            project_fee: "$5,000",
            created_at: "2023-05-15",
            collaborators: "Master Ops",
            taxnow_signup_status: "Complete"
          };
          setProject(mockProject);
          setLoading(false);
        }, 1000);
      }
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError(`Failed to fetch project details: ${err.message}`);
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
          text: 'Testing by SP',
          author: 'VB',
          date: new Date('2025-05-07T11:07:00'),
          formattedDate: 'May 7, 2025',
          formattedTime: '11:07 AM'
        }
      ];

      setNotes(mockNotes);
      setHasMoreNotes(false);
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

  // Functions for project group, campaign, and source
  const handleProjectGroupChange = (selectedOption) => {
    // This function is kept for compatibility with other parts of the code
    console.log("Project group changed:", selectedOption);
  };

  const handleOwnerChange = (selectedOption) => {
    setOwner(selectedOption);
  };

  const handleProjectCampaignChange = (selectedOption) => {
    setProjectCampaign(selectedOption);
  };

  const handleProjectSourceChange = (selectedOption) => {
    setProjectSource(selectedOption);
  };

  const handleProjectStageChange = (selectedOption) => {
    setProjectStage(selectedOption);
  };

  // Function to handle milestone change
  const handleMilestoneChange = (selectedOption) => {
    setMilestone(selectedOption);

    // Update stage based on milestone selection
    if (selectedOption.value === 'erc-fulfillment') {
      setProjectStage({ value: 'payment-plan-fully-acknowledged', label: 'Payment Plan- Partially Acknowledged' });
    } else if (selectedOption.value === 'erc-enrollment') {
      setProjectStage({ value: 'pending-pre-fpso-interview', label: 'Pending Pre-FPSO Interview' });
    } else if (selectedOption.value === 'erc-cancelled') {
      setProjectStage({ value: 'computation-complete', label: 'Computation Complete' });
    } else if (selectedOption.value === 'erc-lead-lost') {
      setProjectStage({ value: 'fpso-interview-pending', label: 'FPSO Interview Pending' });
    }
  };

  // Function to toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center mt-5">
          <div className="col-md-8 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mt-4">
        <div className="white_card border-danger">
          <div className="white_card_body p-4">
            <h5 className="card-title text-danger">Error</h5>
            <p className="card-text">{error}</p>
            <button
              className="btn btn-primary"
              onClick={fetchProjectDetails}
            >
              <i className="fas fa-sync-alt me-1"></i> Retry
            </button>
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
                <h4 className="iris-lead-name">{project?.project_id} - {project?.business_legal_name}</h4>
                <div>
                </div>
              </div>
              <ul className="nav nav-pills" id="pills-tab" role="tablist">
                <li className={`nav-item ${activeTab === 'project' ? 'active' : ''}`}>
                  <a
                    className="nav-link"
                    id="pills-project"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabChange('project');
                    }}
                    href="#pills-project"
                    role="tab"
                    aria-controls="pills-project"
                    aria-selected={activeTab === 'project'}
                  >
                    Project
                  </a>
                </li>
                <li className={`nav-item ${activeTab === 'bankInfo' ? 'active' : ''}`}>
                  <a
                    className="nav-link"
                    id="pills-bank-info"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabChange('bankInfo');
                    }}
                    href="#pills-bank-info"
                    role="tab"
                    aria-controls="pills-bank-info"
                    aria-selected={activeTab === 'bankInfo'}
                  >
                    Bank Info
                  </a>
                </li>
                <li className={`nav-item ${activeTab === 'intake' ? 'active' : ''}`}>
                  <a
                    className="nav-link"
                    id="pills-intake"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabChange('intake');
                    }}
                    href="#pills-intake"
                    role="tab"
                    aria-controls="pills-intake"
                    aria-selected={activeTab === 'intake'}
                  >
                    Intake
                  </a>
                </li>
                <li className={`nav-item ${activeTab === 'fees' ? 'active' : ''}`}>
                  <a
                    className="nav-link"
                    id="pills-fees"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabChange('fees');
                    }}
                    href="#pills-fees"
                    role="tab"
                    aria-controls="pills-fees"
                    aria-selected={activeTab === 'fees'}
                  >
                    Fees
                  </a>
                </li>
                <li className={`nav-item ${activeTab === 'documents' ? 'active' : ''}`}>
                  <a
                    className="nav-link"
                    id="pills-documents"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabChange('documents');
                    }}
                    href="#pills-documents"
                    role="tab"
                    aria-controls="pills-documents"
                    aria-selected={activeTab === 'documents'}
                  >
                    Documents
                  </a>
                </li>
                <li className={`nav-item ${activeTab === 'invoices' ? 'active' : ''}`}>
                  <a
                    className="nav-link"
                    id="pills-invoices"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabChange('invoices');
                    }}
                    href="#pills-invoices"
                    role="tab"
                    aria-controls="pills-invoices"
                    aria-selected={activeTab === 'invoices'}
                  >
                    Invoices
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
                  {/* Project Tab */}
                  {activeTab === 'project' && (
                    <div className="mb-4 left-section-container">
                      <h5 className="section-title">Project Details</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Legal Name*</label>
                            <input type="text" className="form-control" defaultValue={project?.business_legal_name || 'CTCERC Play SP'} readOnly />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Doing Business As</label>
                            <input type="text" className="form-control" defaultValue={project?.doing_business_as || ''} readOnly />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Category*</label>
                            <input type="text" className="form-control" defaultValue={project?.category || ''} readOnly />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Website URL*</label>
                            <input type="text" className="form-control" defaultValue={project?.website || 'https://example.com'} readOnly />
                          </div>
                        </div>
                      </div>

                      {/* Account Info Section */}
                      <div className='d-flex align-items-center justify-content-between'>
                        <h5 className="section-title mt-4">Account Info</h5>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={toggleEditMode}
                          title={isEditMode ? "Save changes" : "Edit information"}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      </div>

                      {/* Personal Info Section */}
                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">
                        Personal Info
                      </h6>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="Flow Gen test"
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Contact No.</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="989-876-5445"
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                              type="email"
                              className="form-control"
                              defaultValue="mekay61011@intady.com"
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Title</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="Test"
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Street Address</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="1231 Golf Rd"
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Zip</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="10001"
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">City</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="New York"
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">State</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="New York"
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Identity Document Type</label>
                            <select
                              className="form-select"
                              disabled={!isEditMode}
                            >
                              <option value="N/A">N/A</option>
                              <option value="Passport">Passport</option>
                              <option value="Driver's License">Driver's License</option>
                              <option value="State ID">State ID</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Document Number</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue=""
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Business Info Section */}
                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">
                        Business Info
                      </h6>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Legal Name</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="Flow Gen"
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Doing Business As</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue=""
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Category</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue=""
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Website URL</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue=""
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Business Legal Info Section */}
                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">
                        Business Legal Info
                      </h6>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Entity Type</label>
                            <select
                              className="form-select"
                              disabled={!isEditMode}
                            >
                              <option value="N/A">N/A</option>
                              <option value="LLC">LLC</option>
                              <option value="Corporation">Corporation</option>
                              <option value="Partnership">Partnership</option>
                              <option value="Sole Proprietorship">Sole Proprietorship</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Registration Number</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue=""
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Registration Date</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="MM/DD/YYYY"
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">State of Registration</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue=""
                              readOnly={!isEditMode}
                            />
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
                                  <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z" />
                                  <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z" />
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
                                  <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z" />
                                  <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z" />
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
                  )}

                  {/* Bank Info Tab */}
                  {activeTab === 'bankInfo' && (
                    <div className="mb-4 left-section-container">
                      <h5 className="section-title mt-4">Bank Information</h5>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Bank Name</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Bank Name"

                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Bank Mailing Address</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Bank Mailing Address"

                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">City</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="City"

                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">State</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="State"

                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Zip</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Zip"

                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Country</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Country"

                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">

                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Bank Phone</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Bank Phone"

                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Account Holder Name</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Account Holder Name"

                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Account Type</label>
                            <select
                              className="form-select"

                            >
                              <option value="N/A">N/A</option>
                              <option value="Checking">Checking</option>
                              <option value="Savings">Savings</option>
                              <option value="Business">Business</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Other</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Other"

                            />
                          </div>
                        </div>
                      </div>


                      <div className="row mb-3">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">ABA Routing Number</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="ABA Routing Number"

                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Account Number</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Account Number"

                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">SWIFT</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="SWIFT"

                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">IBAN</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="IBAN"

                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Intake Tab Content */}
                  {activeTab === 'intake' && (
                    <div className="mb-4 left-section-container">
                      <h5 className="section-title mt-4">ERC Basic Details</h5>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">W2 Employee Count</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="W2 Employee Count"
                              defaultValue="23"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Initial Form Fee Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Initial Form Fee Amount"
                              defaultValue="0"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">W2 EE Difference Count</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="W2 EE Difference Count"
                              defaultValue="0"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Referrer Retainer Fee</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Referrer Retainer Fee"
                              defaultValue="0.00"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total Max ERC Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total Max ERC Amount"
                              defaultValue="210,000.00"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total Estimated Fees</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total Estimated Fees"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Affiliate Referral Fees</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Affiliate Referral Fees"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <div className="form-check custom-checkbox">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id="sourCheck"
                              />
                              <label className="form-check-label" htmlFor="sourCheck">SOUR</label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Average Employee Count in 2019</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="1-10">1-10</option>
                              <option value="11-50">11-50</option>
                              <option value="51-100">51-100</option>
                              <option value="101+">101+</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Fee Type</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Fixed">Fixed</option>
                              <option value="Percentage">Percentage</option>
                              <option value="Hybrid">Hybrid</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Custom Fee</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Custom Fee"
                              defaultValue="250 Per EE Min $2,000 + Completion @15%"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Company Folder Link</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Company Folder Link"
                              defaultValue="https://bit.ly/4qJePK"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Document Folder Link</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Document Folder Link"
                              defaultValue="https://bit.ly/4qJhRmQ"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Eligible Quarters</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Eligible Quarters"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Welcome Email</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Welcome Email"
                              defaultValue="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Invoice Initial Retainer</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoice Initial Retainer"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Retainer Payment Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              defaultValue="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Retainer Payment Channel</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Retainer Payment Channel"
                              defaultValue="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Retainer Payment Returned</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              defaultValue="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Ret Payment Return Reason</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Ret Payment Return Reason"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Retainer Refund Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              defaultValue="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Retainer Refund Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Retainer Refund Amount"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Retainer Payment Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Retainer Payment Amount"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Retainer Payment Type</label>
                            <select className="form-select">
                              <option value="ACH">ACH</option>
                              <option value="Credit Card">Credit Card</option>
                              <option value="Check">Check</option>
                              <option value="Wire">Wire</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Ret Retainer Invoiced</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Ret Retainer Invoiced"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Ret Retainer Sent Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              defaultValue="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Ret Retainer Pay Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              defaultValue="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Ret Retainer Clear Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              defaultValue="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Ret Retainer Return Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              defaultValue="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Ret Retainer Return Reason</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Ret Retainer Return Reason"
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Payment Terms</h5>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Interest Percentage(%)</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Interest Percentage(%)"
                              defaultValue="0.00"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Net No.</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Net No"
                              defaultValue="0"
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">ERC Documents</h5>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">Business Docs</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">COI AOI</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Received">Received</option>
                              <option value="Pending">Pending</option>
                              <option value="Not Required">Not Required</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Voided Check</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Received">Received</option>
                              <option value="Pending">Pending</option>
                              <option value="Not Required">Not Required</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">Business Financial Docs</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2019 Tax Return</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Received">Received</option>
                              <option value="Pending">Pending</option>
                              <option value="Not Required">Not Required</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2020 Tax Return</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Received">Received</option>
                              <option value="Pending">Pending</option>
                              <option value="Not Required">Not Required</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2021 Financials</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Received">Received</option>
                              <option value="Pending">Pending</option>
                              <option value="Not Required">Not Required</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">941's - 2020</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2020 Q1</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Received">Received</option>
                              <option value="Pending">Pending</option>
                              <option value="Not Required">Not Required</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2020 Q2</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Received">Received</option>
                              <option value="Pending">Pending</option>
                              <option value="Not Required">Not Required</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2020 Q3</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Received">Received</option>
                              <option value="Pending">Pending</option>
                              <option value="Not Required">Not Required</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2020 Q4</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Received">Received</option>
                              <option value="Pending">Pending</option>
                              <option value="Not Required">Not Required</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">941's - 2021</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2021 Q1</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Received">Received</option>
                              <option value="Pending">Pending</option>
                              <option value="Not Required">Not Required</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2020 Q4</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Received">Received</option>
                              <option value="Pending">Pending</option>
                              <option value="Not Required">Not Required</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2021 Q3</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Received">Received</option>
                              <option value="Pending">Pending</option>
                              <option value="Not Required">Not Required</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">Payroll Register - 2020</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Payroll Register 2020 Q1</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Received">Received</option>
                              <option value="Pending">Pending</option>
                              <option value="Not Required">Not Required</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Payroll Register 2020 Q2</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Received">Received</option>
                              <option value="Pending">Pending</option>
                              <option value="Not Required">Not Required</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Payroll Register 2020 Q3</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Received">Received</option>
                              <option value="Pending">Pending</option>
                              <option value="Not Required">Not Required</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Payroll Register 2020 Q4</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Received">Received</option>
                              <option value="Pending">Pending</option>
                              <option value="Not Required">Not Required</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">Payroll Register - 2021</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Payroll Register 2021 Q1</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Received">Received</option>
                              <option value="Pending">Pending</option>
                              <option value="Not Required">Not Required</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2021 Q2</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Received">Received</option>
                              <option value="Pending">Pending</option>
                              <option value="Not Required">Not Required</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Payroll Register 2021 Q3</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Received">Received</option>
                              <option value="Pending">Pending</option>
                              <option value="Not Required">Not Required</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">F911 Status</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Received">Received</option>
                              <option value="Pending">Pending</option>
                              <option value="Not Required">Not Required</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">PPP Details</h5>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">PPP 2020 Information</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2020 Applied</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2020 Start Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2020 Forgiveness Applied</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2020 End Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2020 Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="PPP 2020 Amount"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2020 Wages Allocated</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="PPP 2020 Wages Allocated"
                            />
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">PPP 2021 Information</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2021 Applied</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2021 Start Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2021 Forgiveness Applied</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2021 End Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2021 Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="PPP 2021 Amount"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2021 Wages Allocated</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="PPP 2021 Wages Allocated"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-12">
                          <div className="form-group">
                            <label className="form-label">Additional Comments</label>
                            <textarea
                              className="form-control"
                              rows="3" style={{ resize: 'vertical', minHeight: '70px' }}
                              placeholder="Additional Comments"
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">FPSO Details</h5>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Attorney Name</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Attorney Name"
                              defaultValue="Michael Y Goldberg"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Call Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              defaultValue="04/02/2025"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Call Time</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Call Time"
                              defaultValue="TEST"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Memo Received Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Memo Cut Off Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fees Tab Content */}
                  {activeTab === 'fees' && (
                    <div className="mb-4 left-section-container">
                      <h5 className="section-title">941 Details</h5>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">ERC Discovered Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2020 941 Wages</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2020 941 Wages"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2021 941 Wages</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2021 941 Wages"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2020 941 Wages</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q4 2020 941 Wages"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2021 941 Wages</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q1 2021 941 Wages"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2021 941 Wages</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q2 2021 941 Wages"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2021 941 Wages</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2021 941 Wages"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2021 941 Wages</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q4 2021 941 Wages"
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">TOTAL ERC AMOUNT AND FEES</h5>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Internal Sales Agent</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Internal Sales Agent"
                              defaultValue="Lorenzo Oliver" readOnly
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Internal Sales Support</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Internal Sales Support"
                              defaultValue="Varun Kumar" readOnly
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Affiliate Name</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Affiliate Name"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Affiliate Percentage</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Affiliate Percentage"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">ERC Claim Filed</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="ERC Claim Filed"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">ERC Amount Received</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="ERC Amount Received"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total ERC Fee</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total ERC Fee"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Legal Fees</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Legal Fees"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total ERC Fees Paid</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total ERC Fees Paid"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total ERC Fees Pending</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total ERC Fees Pending"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total Occams Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total Occams Share"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total Aff_Ref Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total Aff_Ref Share"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Retain Occams Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Retain Occams Share"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Retain Aff_Ref Share  </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Retain Aff_Ref Share "
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Bal Retain Occams Share  </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Bal Retain Occams Share "
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Retain Occams Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Retain Occams Share"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total Occams Share Paid  </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total Occams Share Paid "
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total Aff_Ref Share Paid </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total Aff_Ref Share Paid"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total Occams Share Pending</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total Occams Share Pending"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total Aff_Ref Share Pending  </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total Aff_Ref Share Pending "
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Total Max ERC Amount 2020</h5>
                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">2020</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2020 Max ERC Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q1 2020 Max ERC Amount"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2020 Max ERC Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q2 2020 Max ERC Amount"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2020 Max ERC Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2020 Max ERC Amount"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2020 Max ERC Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q4 2020 Max ERC Amount"
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Total Max ERC Amount 2021</h5>
                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">2021</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2021 Max ERC Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q1 2021 Max ERC Amount"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2021 Max ERC Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q2 2021 Max ERC Amount"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2021 Max ERC Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2021 Max ERC Amount"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2021 Max ERC Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q4 2021 Max ERC Amount"
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">ERC Filed Quarter wise 2020</h5>
                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">2020</h6>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <div className="form-check custom-checkbox">
                              <input className="form-check-input" type="checkbox" id="q1-2020-filed-status" />
                              <label className="form-check-label" htmlFor="q1-2020-filed-status">
                                Q1 2020 Filed Status
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2020 Filing Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2020 Amount Filed</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q1 2020 Amount Filed"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2020 Benefits</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q1 2020 Benefits"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2020 Eligibility Basis</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Full Shutdown">Full Shutdown</option>
                              <option value="Partial Shutdown">Partial Shutdown</option>
                              <option value="Decline in Gross Receipts">Decline in Gross Receipts</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <div className="form-check custom-checkbox">
                              <input className="form-check-input" type="checkbox" id="q2-2020-filed-status" />
                              <label className="form-check-label" htmlFor="q2-2020-filed-status">
                                Q2 2020 Filed Status
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2020 Filing Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2020 Amount Filed</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q2 2020 Amount Filed"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2020 Benefits</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q2 2020 Benefits"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2020 Eligibility Basis</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Full Shutdown">Full Shutdown</option>
                              <option value="Partial Shutdown">Partial Shutdown</option>
                              <option value="Decline in Gross Receipts">Decline in Gross Receipts</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <div className="form-check custom-checkbox">
                              <input className="form-check-input" type="checkbox" id="q3-2020-filed-status" />
                              <label className="form-check-label" htmlFor="q3-2020-filed-status">
                                Q3 2020 Filed Status
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2020 Filing Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2020 Amount Filed</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2020 Amount Filed"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2020 Benefits</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2020 Benefits"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2020 Eligibility Basis</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Full Shutdown">Full Shutdown</option>
                              <option value="Partial Shutdown">Partial Shutdown</option>
                              <option value="Decline in Gross Receipts">Decline in Gross Receipts</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <div className="form-check custom-checkbox">
                              <input className="form-check-input" type="checkbox" id="q4-2020-filed-status" />
                              <label className="form-check-label" htmlFor="q4-2020-filed-status">
                                Q4 2020 Filed Status
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2020 Filing Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2020 Amount Filed</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q4 2020 Amount Filed"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2020 Benefits</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q4 2020 Benefits"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2020 Eligibility Basis</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Full Shutdown">Full Shutdown</option>
                              <option value="Partial Shutdown">Partial Shutdown</option>
                              <option value="Decline in Gross Receipts">Decline in Gross Receipts</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">2021</h6>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <div className="form-check custom-checkbox">
                              <input className="form-check-input" type="checkbox" id="q1-2021-filed-status" />
                              <label className="form-check-label" htmlFor="q1-2021-filed-status">
                                Q1 2021 Filed Status
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2021 Filing Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2021 Amount Filed</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q1 2021 Amount Filed"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2021 Benefits</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q1 2021 Benefits"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2021 Eligibility Basis</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Full Shutdown">Full Shutdown</option>
                              <option value="Partial Shutdown">Partial Shutdown</option>
                              <option value="Decline in Gross Receipts">Decline in Gross Receipts</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <div className="form-check custom-checkbox">
                              <input className="form-check-input" type="checkbox" id="q2-2021-filed-status" />
                              <label className="form-check-label" htmlFor="q2-2021-filed-status">
                                Q2 2021 Filed Status
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2021 Filing Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2021 Amount Filed</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q2 2021 Amount Filed"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2021 Benefits</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q2 2021 Benefits"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2021 Eligibility Basis</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Full Shutdown">Full Shutdown</option>
                              <option value="Partial Shutdown">Partial Shutdown</option>
                              <option value="Decline in Gross Receipts">Decline in Gross Receipts</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <div className="form-check custom-checkbox">
                              <input className="form-check-input" type="checkbox" id="q3-2021-filed-status" />
                              <label className="form-check-label" htmlFor="q3-2021-filed-status">
                                Q3 2021 Filed Status
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2021 Filing Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2021 Amount Filed</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2021 Amount Filed"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2021 Benefits</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2021 Benefits"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2021 Eligibility Basis</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Full Shutdown">Full Shutdown</option>
                              <option value="Partial Shutdown">Partial Shutdown</option>
                              <option value="Decline in Gross Receipts">Decline in Gross Receipts</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <div className="form-check custom-checkbox">
                              <input className="form-check-input" type="checkbox" id="q4-2021-filed-status" />
                              <label className="form-check-label" htmlFor="q4-2021-filed-status">
                                Q4 2021 Filed Status
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2021 Filing Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2021 Amount Filed</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q4 2021 Amount Filed"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2021 Benefits</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q4 2021 Benefits"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2021 Eligibility Basis</label>
                            <select className="form-select">
                              <option value="N/A">N/A</option>
                              <option value="Full Shutdown">Full Shutdown</option>
                              <option value="Partial Shutdown">Partial Shutdown</option>
                              <option value="Decline in Gross Receipts">Decline in Gross Receipts</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">ERC Letter, Check & Amount</h5>
                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">2020</h6>

                      <div className="row mb-3">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q1 2020 Loop</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-check custom-checkbox">
                            <input className="form-check-input" type="checkbox" id="q1-2020-letter" />
                            <label className="form-check-label" htmlFor="q1-2020-letter">
                              Q1 2020 Letter
                            </label>
                          </div>
                        </div>
                        <div className='col-md-3'>
                          <div className="form-check custom-checkbox">
                            <input className="form-check-input" type="checkbox" id="q1-2020-check" />
                            <label className="form-check-label" htmlFor="q1-2020-check">
                              Q1 2020 Check
                            </label>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q1 2020 Chq Amt</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q1 2020 Chq Amt"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q2 2020 Loop</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-check custom-checkbox">
                            <input className="form-check-input" type="checkbox" id="q2-2020-letter" />
                            <label className="form-check-label" htmlFor="q2-2020-letter">
                              Q2 2020 Letter
                            </label>
                          </div>
                        </div>
                        <div className='col-md-3'>
                          <div className="form-check custom-checkbox">
                            <input className="form-check-input" type="checkbox" id="q2-2020-check" />
                            <label className="form-check-label" htmlFor="q2-2020-check">
                              Q2 2020 Check
                            </label>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q2 2020 Chq Amt</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q2 2020 Chq Amt"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q3 2020 Loop</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-check custom-checkbox">
                            <input className="form-check-input" type="checkbox" id="q3-2020-letter" />
                            <label className="form-check-label" htmlFor="q3-2020-letter">
                              Q3 2020 Letter
                            </label>
                          </div>
                        </div>
                        <div className='col-md-3'>
                          <div className="form-check custom-checkbox">
                            <input className="form-check-input" type="checkbox" id="q3-2020-check" />
                            <label className="form-check-label" htmlFor="q3-2020-check">
                              Q3 2020 Check
                            </label>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q3 2020 Chq Amt</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2020 Chq Amt"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q4 2020 Loop</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-check custom-checkbox">
                            <input className="form-check-input" type="checkbox" id="q4-2020-letter" />
                            <label className="form-check-label" htmlFor="q4-2020-letter">
                              Q4 2020 Letter
                            </label>
                          </div>
                        </div>
                        <div className='col-md-3'>
                          <div className="form-check custom-checkbox">
                            <input className="form-check-input" type="checkbox" id="q4-2020-check" />
                            <label className="form-check-label" htmlFor="q4-2020-check">
                              Q4 2020 Check
                            </label>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q4 2020 Chq Amt</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q4 2020 Chq Amt"
                            />
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">2021</h6>

                      <div className="row mb-3">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q1 2021 Loop</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-check custom-checkbox">
                            <input className="form-check-input" type="checkbox" id="q1-2021-letter" />
                            <label className="form-check-label" htmlFor="q1-2021-letter">
                              Q1 2021 Letter
                            </label>
                          </div>
                        </div>
                        <div className='col-md-3'>
                          <div className="form-check custom-checkbox">
                            <input className="form-check-input" type="checkbox" id="q1-2021-check" />
                            <label className="form-check-label" htmlFor="q1-2021-check">
                              Q1 2021 Check
                            </label>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q1 2021 Chq Amt</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q1 2021 Chq Amt"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q2 2021 Loop</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-check custom-checkbox">
                            <input className="form-check-input" type="checkbox" id="q2-2021-letter" />
                            <label className="form-check-label" htmlFor="q2-2021-letter">
                              Q2 2021 Letter
                            </label>
                          </div>
                        </div>
                        <div className='col-md-3'>
                          <div className="form-check custom-checkbox">
                            <input className="form-check-input" type="checkbox" id="q2-2021-check" />
                            <label className="form-check-label" htmlFor="q2-2021-check">
                              Q2 2021 Check
                            </label>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q2 2021 Chq Amt</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q2 2021 Chq Amt"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q3 2021 Loop</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-check custom-checkbox">
                            <input className="form-check-input" type="checkbox" id="q3-2021-letter" />
                            <label className="form-check-label" htmlFor="q3-2021-letter">
                              Q3 2021 Letter
                            </label>
                          </div>
                        </div>
                        <div className='col-md-3'>
                          <div className="form-check custom-checkbox">
                            <input className="form-check-input" type="checkbox" id="q3-2021-check" />
                            <label className="form-check-label" htmlFor="q3-2021-check">
                              Q3 2021 Check
                            </label>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q3 2021 Chq Amt</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2021 Chq Amt"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q4 2021 Loop</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-check custom-checkbox">
                            <input className="form-check-input" type="checkbox" id="q4-2021-letter" />
                            <label className="form-check-label" htmlFor="q4-2021-letter">
                              Q4 2021 Letter
                            </label>
                          </div>
                        </div>
                        <div className='col-md-3'>
                          <div className="form-check custom-checkbox">
                            <input className="form-check-input" type="checkbox" id="q4-2021-check" />
                            <label className="form-check-label" htmlFor="q4-2021-check">
                              Q4 2021 Check
                            </label>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q4 2021 Chq Amt</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q4 2021 Chq Amt"
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Success Fee Invoice Details</h5>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">I - Invoice Details</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">I Invoice number</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoice number"
                              defaultValue="6614"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">I Invoice Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoice Amount"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">I Invoiced Qtrs</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoiced Qtrs"
                              defaultValue="Initial Retainer Fee Amount"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">I Invoice Sent Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              defaultValue="01/26/2025"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">I Invoice Payment Type</label>
                            <select className="form-select">
                              <option value="">Select payment type</option>
                              <option value="Credit Card">Credit Card</option>
                              <option value="Check">Check</option>
                              <option value="ACH">ACH</option>
                              <option value="Wire">Wire</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">I Invoice Payment Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">I Invoice Pay Cleared</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">I Invoice Pay Returned</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">I Invoice Return Reason</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Return Reason"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">I Invoice Occams Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Occams Share"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">I Invoice AffRef Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="AffRef Share"
                            />
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">II - Invoice Details</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">II Invoice number</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoice number"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">II Invoice Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoice Amount"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">II Invoiced Qtrs</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoiced Qtrs"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">II Invoice Sent Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">II Invoice Payment Type</label>
                            <select className="form-select">
                              <option value="">Select payment type</option>
                              <option value="Credit Card">Credit Card</option>
                              <option value="Check">Check</option>
                              <option value="ACH">ACH</option>
                              <option value="Wire">Wire</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">II Invoice Payment Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">II Invoice Pay Cleared</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">II Invoice Pay Returned</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">II Invoice Return Reason</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Return Reason"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">II Invoice Occams Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Occams Share"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">II Invoice AffRef Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="AffRef Share"
                            />
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">III - Invoice Details</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">III Invoice number</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoice number"
                              defaultValue="7513"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">III Invoice Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoice Amount"
                              defaultValue="0.10"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">III Invoiced Qtrs</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoiced Qtrs"
                              defaultValue="2020 Q2"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">III Invoice Sent Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              defaultValue="05/08/2025"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">III Invoice Payment Type</label>
                            <select className="form-select">
                              <option value="">Occams Initiated - eCheck</option>
                              <option value="Credit Card">Credit Card</option>
                              <option value="Check">Check</option>
                              <option value="ACH">ACH</option>
                              <option value="Wire">Wire</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">III Invoice Payment Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              defaultValue="05/08/2025"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">III Invoice Pay Cleared</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              defaultValue="05/10/2025"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">III Invoice Pay Returned</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">III Invoice Return Reason</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Return Reason"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">III Invoice Occams Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Occams Share"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">III Invoice AffRef Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="AffRef Share"
                            />
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">IV - Invoice Details</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">IV Invoice number</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoice number"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">IV Invoice Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoice Amount"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">IV Invoiced Qtrs</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoiced Qtrs"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">IV Invoice Sent Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">IV Invoice Payment Type</label>
                            <select className="form-select">
                              <option value="">Select payment type</option>
                              <option value="Credit Card">Credit Card</option>
                              <option value="Check">Check</option>
                              <option value="ACH">ACH</option>
                              <option value="Wire">Wire</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">IV Invoice Payment Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">IV Invoice Pay Cleared</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">IV Invoice Pay Returned</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">IV Invoice Return Reason</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Return Reason"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">IV Invoice Occams Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Occams Share"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">IV Invoice AffRef Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="AffRef Share"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Documents Tab Content */}
                  {activeTab === 'documents' && (
                    <div className="mb-4 left-section-container">
                      <h5 className="section-title">Project Documents</h5>
                      <div className="row mb-3">
                        <div className="col-12">
                          <div className="document-upload-area">
                            <div className="text-center p-4 border rounded">
                              <i className="fas fa-cloud-upload-alt fa-3x mb-3 text-primary"></i>
                              <h6>Drag & Drop Files Here</h6>
                              <p className="text-muted small">or</p>
                              <button className="btn btn-primary">Browse Files</button>
                              <p className="text-muted small mt-2">Maximum file size: 10MB</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="document-list mt-4">
                        <h6>Uploaded Documents</h6>
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Size</th>
                                <th>Uploaded</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Project_Contract.pdf</td>
                                <td>PDF</td>
                                <td>1.2 MB</td>
                                <td>2023-05-15</td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary me-1"><i className="fas fa-download"></i></button>
                                  <button className="btn btn-sm btn-outline-danger"><i className="fas fa-trash"></i></button>
                                </td>
                              </tr>
                              <tr>
                                <td>Requirements.docx</td>
                                <td>DOCX</td>
                                <td>0.8 MB</td>
                                <td>2023-05-16</td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary me-1"><i className="fas fa-download"></i></button>
                                  <button className="btn btn-sm btn-outline-danger"><i className="fas fa-trash"></i></button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Invoices Tab Content */}
                  {activeTab === 'invoices' && (
                    <div className="mb-4 left-section-container">
                      <div class="contact_tab_data">
                          <div class="row custom_opp_tab">
                            <div class="col-sm-12">
                              <div class="custom_opp_tab_header">
                                <h5>
                                  <a href="javascript:void(0)" target="_blank" data-invoiceid="7335">
                                    Invoice ERC-7335</a> -
                                  <span class="status cancel badge bg-success"> Paid</span>
                                </h5>
                                <div class="opp_edit_dlt_btn projects-iris">
                                </div>
                              </div>
                            </div>

                            <div class="col-md-8 text-left">
                              <div class="lead_des">
                                <p><b>Invoice Amount:</b> $219541.10</p>
                                <p><b>Invoice Sent Date:</b> 06/01/2024</p>
                                <p><b>Invoice Due Date:</b> 06/01/2024</p>
                                <p><b>Service Name:</b> 2020 Q4 Financial Consultancy Service Fee, Accrued Interest</p>
                                <p><b>Created By: </b> Occams Finance</p>
                                <p><b>Updated By: </b> Occams Finance</p>
                              </div>
                            </div>

                            <div class="col-md-4">
                              <div class="lead_des">
                                <p><b>Payment Date:</b> N/A</p>
                                <p>
                                  <b>Payment Cleared Date:</b> N/A</p>
                                <p>
                                  <b>Payment Mode:</b> N/A</p>
                              </div>
                            </div>
                          </div>
                      </div>
                      <div class="contact_tab_data">
                          <div class="row custom_opp_tab">
                            <div class="col-sm-12">
                              <div class="custom_opp_tab_header">
                                <h5>
                                  <a href="javascript:void(0)" target="_blank" data-invoiceid="7335">
                                    Invoice ERC-7335</a> -
                                  <span class="status cancel badge bg-cancel"> Cancelled</span>
                                </h5>
                                <div class="opp_edit_dlt_btn projects-iris">
                                </div>
                              </div>
                            </div>

                            <div class="col-md-8 text-left">
                              <div class="lead_des">
                                <p><b>Invoice Amount:</b> $219541.10</p>
                                <p><b>Invoice Sent Date:</b> 06/01/2024</p>
                                <p><b>Invoice Due Date:</b> 06/01/2024</p>
                                <p><b>Service Name:</b> 2020 Q4 Financial Consultancy Service Fee, Accrued Interest</p>
                                <p><b>Created By: </b> Occams Finance</p>
                                <p><b>Updated By: </b> Occams Finance</p>
                              </div>
                            </div>

                            <div class="col-md-4">
                              <div class="lead_des">
                                <p><b>Payment Date:</b> N/A</p>
                                <p>
                                  <b>Payment Cleared Date:</b> N/A</p>
                                <p>
                                  <b>Payment Mode:</b> N/A</p>
                              </div>
                            </div>
                          </div>
                      </div>
                      <div class="contact_tab_data">
                          <div class="row custom_opp_tab">
                            <div class="col-sm-12">
                              <div class="custom_opp_tab_header">
                                <h5>
                                  <a href="javascript:void(0)" target="_blank" data-invoiceid="7335">
                                    Invoice ERC-7335</a> -
                                  <span class="status cancel badge bg-success"> Paid</span>
                                </h5>
                                <div class="opp_edit_dlt_btn projects-iris">
                                </div>
                              </div>
                            </div>

                            <div class="col-md-8 text-left">
                              <div class="lead_des">
                                <p><b>Invoice Amount:</b> $219541.10</p>
                                <p><b>Invoice Sent Date:</b> 06/01/2024</p>
                                <p><b>Invoice Due Date:</b> 06/01/2024</p>
                                <p><b>Service Name:</b> 2020 Q4 Financial Consultancy Service Fee, Accrued Interest</p>
                                <p><b>Created By: </b> Occams Finance</p>
                                <p><b>Updated By: </b> Occams Finance</p>
                              </div>
                            </div>

                            <div class="col-md-4">
                              <div class="lead_des">
                                <p><b>Payment Date:</b> N/A</p>
                                <p>
                                  <b>Payment Cleared Date:</b> N/A</p>
                                <p>
                                  <b>Payment Mode:</b> N/A</p>
                              </div>
                            </div>
                          </div>
                      </div>

                    </div>
                  )}

                  {/* Audit Logs Tab Content */}
                  {activeTab === 'auditLogs' && (
                    <div className="mb-4 left-section-container">
                      <h5 className="section-title">Audit Logs</h5>
                      <div className="table-responsive">
                        <table className="table table-striped table-hover">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>User</th>
                              <th>Action</th>
                              <th>Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>2023-05-15 09:30 AM</td>
                              <td>System</td>
                              <td>Project Created</td>
                              <td>Project was created with ID {projectId}</td>
                            </tr>
                            <tr>
                              <td>2023-05-15 10:15 AM</td>
                              <td>Master Ops</td>
                              <td>Status Updated</td>
                              <td>Project status changed to "ERC Fulfillment"</td>
                            </tr>
                            <tr>
                              <td>2023-05-16 02:45 PM</td>
                              <td>Occams Finance</td>
                              <td>Invoice Created</td>
                              <td>Invoice #6580 created for $5,000</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="action-buttons d-flex align-items-center justify-content-center">
                      <button className="btn save-btn">Update</button>
                    </div>
                  </div>

                </div>

                {/* Right Side Section - Same for all tabs */}


                <div className="col-md-4">

                  <div className="card mb-4">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title mb-0">Milestone:</h5>
                        {!isEditing && (
                          <button
                            className="btn btn-sm btn-link p-0"
                            onClick={() => setIsEditing(true)}
                            style={{ fontSize: '16px' }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        )}
                      </div>

                      {!isEditing ? (
                        <div className="milestone-display mb-4 d-flex align-items-center">
                          <span className="fw-medium" style={{ color: '#0000cc' }}>{milestone.label}</span>
                        </div>
                      ) : (
                        <div className="milestone-edit mb-4">
                          <div className="form-group mb-3">
                            <Select
                              value={milestone}
                              onChange={handleMilestoneChange}
                              options={[
                                { value: 'erc-cancelled', label: 'ERC Cancelled' },
                                { value: 'erc-fulfillment', label: 'ERC Fulfillment' },
                                { value: 'erc-enrollment', label: 'ERC Enrollment' },
                                { value: 'erc-lead-lost', label: 'ERC - Lead Lost' }
                              ]}
                              className="react-select-container"
                              classNamePrefix="react-select"
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
                      )}

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title mb-0">Stage:</h5>
                      </div>

                      {!isEditing ? (
                        <div className="stage-display mb-4 d-flex align-items-center">
                          <span className="fw-medium" style={{ color: '#0000cc' }}>{projectStage.label}</span>
                        </div>
                      ) : (
                        <div className="stage-edit mb-4">
                          <div className="form-group mb-3">
                            <Select
                              value={projectStage}
                              onChange={handleProjectStageChange}
                              options={[
                                { value: 'client-declarations-signed', label: 'Client Declarations Signed' },
                                { value: 'pending-pre-fpso-interview', label: 'Pending Pre-FPSO Interview' },
                                { value: 'pre-fpso-interview-scheduled', label: 'Pre FPSO Interview Scheduled' },
                                { value: 'pre-fpso-interview-completed', label: 'Pre FPSO Interview Completed' },
                                { value: 'fpso-interview-pending', label: 'FPSO Interview Pending' },
                                { value: 'fpso-interview-scheduled', label: 'FPSO Interview Scheduled' },
                                { value: 'fpso-opinion-sent', label: 'FPSO Opinion Sent' },
                                { value: 'fpso-opinion-signed', label: 'FPSO Opinion Signed' },
                                { value: 'fpso-interview-completed', label: 'FPSO Interview Completed' },
                                { value: 'prepare-941x', label: 'Prepare 941x' },
                                { value: 'send-941x', label: 'Send 941x' },
                                { value: '941-x-sent', label: '941-X\'s Sent' },
                                { value: 'client-signed-941xs-8821', label: 'Client Signed 941xs + 8821' },
                                { value: 'erc-claim-filed-peo', label: 'ERC Claim Filed - PEO' },
                                { value: 'irs-letter-of-overpay-received', label: 'IRS Letter Of Overpay Received' },
                                { value: 'financier-review-done', label: 'Financier Review Done' },
                                { value: 'erc-package-submitted', label: 'ERC Package Submitted' },
                                { value: 'computation-complete', label: 'Computation Complete' },
                                { value: 'send-declaration', label: 'Send Declaration' },
                                { value: 'payment-plan-fully-acknowledged', label: 'Payment Plan- Partially Acknowledged' }
                              ]}
                              className="react-select-container"
                              classNamePrefix="react-select"
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
                      )}

                      {/* Update/cancel buttons */}
                      {isEditing && (
                        <div className="d-flex justify-content-between mt-3">
                          <button
                            className="btn btn-sm"
                            onClick={() => setIsEditing(false)}
                            style={{
                              backgroundColor: 'white',
                              color: '#ff6a00',
                              border: '1px solid #ff6a00',
                              borderRadius: '20px',
                              padding: '5px 25px'
                            }}
                          >
                            Update
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => setIsEditing(false)}
                            style={{
                              backgroundColor: 'white',
                              color: '#ff6a00',
                              border: '1px solid #ff6a00',
                              borderRadius: '20px',
                              padding: '5px 25px'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card mb-4">
                    <div className="card-body">
                      <h5 className="card-title">Assigned Collaborators::</h5>

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
                      <h5 className="card-title">Owner:</h5>
                      <div className="form-group mb-4">
                        <Select
                          value={owner}
                          onChange={handleOwnerChange}
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

                      <h5 className="card-title">Project Campaign:</h5>
                      <div className="form-group mb-4">
                        <Select
                          value={projectCampaign}
                          onChange={handleProjectCampaignChange}
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

                      <h5 className="card-title">Project Source:</h5>
                      <div className="form-group">
                        <Select
                          value={projectSource}
                          onChange={handleProjectSourceChange}
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


                </div>
              </div>

              <div className='row mt-4'>
                <div className='col-md-8'>
                  {/* Notes Section */}
                  <h5 className="section-title mt-4">Notes</h5>
                  <Notes
                    entityType="project"
                    entityId={projectId}
                    entityName={project?.business_legal_name || ''}
                    showButtons={false}
                    showNotes={true}
                    maxHeight={300}
                  />
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      {showAddNoteModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Note</h5>
                <button type="button" className="close" onClick={toggleAddNoteModal}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <form onSubmit={handleAddNote}>
                <div className="modal-body">
                  <div className="form-group mb-3">
                    <label htmlFor="noteText" className="form-label">Note</label>
                    <textarea
                      id="noteText"
                      className="form-control"
                      rows="4"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={toggleAddNoteModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Note</button>
                </div>
              </form>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
