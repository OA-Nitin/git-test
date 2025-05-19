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

  // Project group, campaign, and source state
  const [projectGroup, setProjectGroup] = useState(null);
  const [projectCampaign, setProjectCampaign] = useState(null);
  const [projectSource, setProjectSource] = useState(null);

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
    setProjectGroup(selectedOption);
  };

  const handleProjectCampaignChange = (selectedOption) => {
    setProjectCampaign(selectedOption);
  };

  const handleProjectSourceChange = (selectedOption) => {
    setProjectSource(selectedOption);
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

                  {/* Fees Tab Content */}
                  {activeTab === 'fees' && (
                    <div className="mb-4 left-section-container">
                      <h5 className="section-title">Fee Information</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Project Fee</label>
                            <input type="text" className="form-control" defaultValue={project?.project_fee || '$5,000'} />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Fee Type</label>
                            <select className="form-select">
                              <option>Fixed</option>
                              <option>Percentage</option>
                              <option>Hourly</option>
                            </select>
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
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="section-title mb-0">Project Invoices</h5>
                        <button className="btn btn-primary btn-sm">
                          <i className="fas fa-plus me-1"></i> Create Invoice
                        </button>
                      </div>

                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Invoice #</th>
                              <th>Date</th>
                              <th>Amount</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>INV-6580</td>
                              <td>2023-05-15</td>
                              <td>$5,000</td>
                              <td><span className="badge bg-success">Paid</span></td>
                              <td>
                                <button className="btn btn-sm btn-outline-primary me-1"><i className="fas fa-eye"></i></button>
                                <button className="btn btn-sm btn-outline-secondary me-1"><i className="fas fa-print"></i></button>
                                <button className="btn btn-sm btn-outline-danger"><i className="fas fa-trash"></i></button>
                              </td>
                            </tr>
                            <tr>
                              <td>INV-6581</td>
                              <td>2023-05-20</td>
                              <td>$2,500</td>
                              <td><span className="badge bg-warning">Pending</span></td>
                              <td>
                                <button className="btn btn-sm btn-outline-primary me-1"><i className="fas fa-eye"></i></button>
                                <button className="btn btn-sm btn-outline-secondary me-1"><i className="fas fa-print"></i></button>
                                <button className="btn btn-sm btn-outline-danger"><i className="fas fa-trash"></i></button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
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
                      <h5 className="card-title">Project Group:</h5>
                      <div className="form-group mb-4">
                        <Select
                          value={projectGroup}
                          onChange={handleProjectGroupChange}
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
