import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import axios from 'axios';
import './common/CommonStyles.css';
import './ColumnSelector.css';
import './DateFilter.css';
import SortableTableHeader from './common/SortableTableHeader';
import { sortArrayByKey } from '../utils/sortUtils';

// Function to format date as mm/dd/YYYY H:i:s
const formatDate = (dateString) => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;

    // Format as mm/dd/YYYY H:i:s
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

const ERCProjectsReport = () => {
  // State for API data
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "ERC Projects Report - Occams Portal"; // Set title for ERC Projects Report page

    // Fetch projects from API
    fetchProjects();
  }, []);

  // Function to fetch projects from API
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching ERC projects from API...');

      // Use the ERC-specific endpoint with product_id=935
      const apiUrl = 'https://play.occamsadvisory.com/portal/wp-json/productsplugin/v1/projects?product_id=935';

      // Make the API request with proper headers
      const response = await axios.get(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('API Response:', response);

      // Check if we have a valid response with data
      if (response && response.data) {
        // Check if response.data has a data property that is an array (based on the actual API response structure)
        if (response.data.data && Array.isArray(response.data.data)) {
          const apiProjects = response.data.data;
          console.log('API Projects (nested data):', apiProjects);
          console.log('Number of projects returned:', apiProjects.length);

          // Use the API data even if it's just a few records
          setProjects(apiProjects);

          if (apiProjects.length === 0) {
            setError('No ERC projects found in API response.');
          }
        }
        // Check if response.data is an array directly
        else if (Array.isArray(response.data)) {
          // Use the data array from the API response
          const apiProjects = response.data;
          console.log('API Projects:', apiProjects);
          console.log('Number of projects returned:', apiProjects.length);

          // Use the API data even if it's just a few records
          setProjects(apiProjects);

          if (apiProjects.length === 0) {
            setError('No ERC projects found in API response.');
          }
        }
        else {
          console.error('API response format unexpected:', response);
          // If API returns unexpected format, use fallback data
          const errorMsg = 'API returned unexpected data format. Using sample data instead.';
          setError(errorMsg);

          // Generate fallback data with a clear indicator
          const fallbackData = generateFallbackProjects();
          // Add a flag to indicate this is fallback data
          fallbackData.forEach(project => {
            project.isFallbackData = true;
          });
          setProjects(fallbackData);
        }
      } else {
        console.error('API response invalid:', response);
        // If API returns invalid response, use fallback data
        const errorMsg = 'API returned invalid response. Using sample data instead.';
        setError(errorMsg);

        // Generate fallback data with a clear indicator
        const fallbackData = generateFallbackProjects();
        // Add a flag to indicate this is fallback data
        fallbackData.forEach(project => {
          project.isFallbackData = true;
        });
        setProjects(fallbackData);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      const errorMsg = `Failed to fetch ERC projects: ${err.message}. Using sample data instead.`;
      console.error(errorMsg);
      setError(errorMsg);

      // Generate fallback data with a clear indicator
      const fallbackData = generateFallbackProjects();
      // Add a flag to indicate this is fallback data
      fallbackData.forEach(project => {
        project.isFallbackData = true;
      });
      setProjects(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  // Generate fallback project data if API fails
  const generateFallbackProjects = () => {
    const businessNames = [
      'CTCERC Play SP',
      'ERC SP #',
      'Updated Comm Cal',
      'Stu Bharat',
      'AA play QA'
    ];

    const projectNames = ['ERC Project 1', 'ERC Project 2', 'ERC Project 3', 'ERC Project 4', 'ERC Project 5'];
    const milestones = ['ERC Fulfillment', 'ERC Enrollment', 'ERC Lead Re-engagement'];
    const stageNames = [
      'Success Fees Processing Client Initiate',
      'ERC Fees Fully Paid',
      'Documents Pending',
      'Payment Processing Client Initiate',
      'Payment Returned'
    ];
    const taxNowStatuses = [
      'Complete',
      ''
    ];
    const projectFees = [
      'Success Fee @10%',
      'Retainer Fee @$90 Per EE + Success Fee @15%',
      'Document Fee @$0 + Success Fee @12.5%',
      'CUSTM FEE',
      ''
    ];

    const dummyProjects = [];

    // Generate only 5 dummy records to make it obvious when we're using fallback data
    for (let i = 1; i <= 5; i++) {
      const businessIndex = Math.floor(Math.random() * businessNames.length);
      const projectIndex = Math.floor(Math.random() * projectNames.length);
      const milestoneIndex = Math.floor(Math.random() * milestones.length);
      const stageIndex = Math.floor(Math.random() * stageNames.length);
      const taxNowStatusIndex = Math.floor(Math.random() * taxNowStatuses.length);
      const projectFeeIndex = Math.floor(Math.random() * projectFees.length);

      // Generate random date within the last year
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 365));

      // Format date as YYYY-MM-DD HH:MM:SS
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

      const businessName = businessNames[businessIndex];

      dummyProjects.push({
        project_id: `${1700 + i}`,
        lead_id: `${9300 + i}`,
        product_id: '935',
        contact_id: `${6400 + i}`,
        project_name: projectNames[projectIndex],
        project_fee: projectFees[projectFeeIndex],
        created_at: formattedDate,
        business_legal_name: businessName,
        authorized_signatory_name: businessName,
        business_phone: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        business_email: `test${i}@example.com`,
        taxnow_signup_status: taxNowStatuses[taxNowStatusIndex],
        product_name: 'ERC',
        milestone: milestones[milestoneIndex],
        stage_name: stageNames[stageIndex],
        notes: 'Sample notes for testing purposes'
      });
    }

    return dummyProjects;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isSearching, setIsSearching] = useState(false);

  // Define all available columns with groups based on API response
  const columnGroups = [
    {
      id: 'basic',
      title: 'Basic Information',
      columns: [
        { id: 'projectId', label: 'ID', field: 'project_id', sortable: true },
        { id: 'date', label: 'Date', field: 'created_at', sortable: true },
        { id: 'businessName', label: 'Business Name', field: 'business_legal_name', sortable: true },
        { id: 'contactCard', label: 'Contact Info', field: 'contact_card', sortable: false }
      ]
    },
    {
      id: 'project',
      title: 'Project Information',
      columns: [
        { id: 'projectName', label: 'Project', field: 'project_name', sortable: true },
        { id: 'collaborators', label: 'Collaborators', field: 'collaborators', sortable: true },
        { id: 'milestone', label: 'Milestone', field: 'milestone', sortable: true },
        { id: 'stageName', label: 'Stage', field: 'stage_name', sortable: true }
      ]
    },
    {
      id: 'status',
      title: 'Status Information',
      columns: [
        { id: 'taxNowSignupStatus', label: 'TaxNow Signup Status', field: 'taxnow_signup_status', sortable: true },
        { id: 'projectFee', label: 'Project Fee', field: 'project_fee', sortable: true }
      ]
    },
    {
      id: 'actions',
      title: 'Actions',
      columns: [
        { id: 'notes', label: 'Notes', field: 'notes', sortable: false }
      ]
    }
  ];

  // Flatten all columns for easier access
  const allColumns = columnGroups.flatMap(group => group.columns);

  // Default visible columns - 9 columns as specified
  const defaultVisibleColumns = ['projectId', 'date', 'businessName', 'projectName', 'collaborators', 'milestone', 'stageName', 'taxNowSignupStatus', 'notes'];

  // State to track visible columns
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);

  // Toggle column visibility
  const toggleColumnVisibility = (columnId) => {
    if (visibleColumns.includes(columnId)) {
      // Remove column if it's already visible
      setVisibleColumns(visibleColumns.filter(id => id !== columnId));
    } else {
      // Add column if it's not visible
      setVisibleColumns([...visibleColumns, columnId]);
    }
  };

  // Reset to default columns
  const resetToDefaultColumns = () => {
    setVisibleColumns(defaultVisibleColumns);
  };

  // Select all columns
  const selectAllColumns = () => {
    setVisibleColumns(allColumns.map(col => col.id));
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // If already sorting by this field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If sorting by a new field, set it and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  // Filter projects based on search term and status
  const filteredProjects = projects.filter(project => {
    // Skip filtering if no search term or status filter is applied
    if (searchTerm === '' && filterStatus === '') {
      return true;
    }

    // Handle different possible field names in the API response
    const id = String(project.project_id || '').toLowerCase();
    const businessName = String(project.business_legal_name || '').toLowerCase();
    const projectName = String(project.project_name || '').toLowerCase();
    const milestone = String(project.milestone || '').toLowerCase();
    const stageName = String(project.stage_name || '').toLowerCase();
    const status = String(project.taxnow_signup_status || '').toLowerCase();
    const projectFee = String(project.project_fee || '').toLowerCase();
    const createdAt = String(project.created_at || '').toLowerCase();

    // Check if search term matches any field
    const searchTermLower = searchTerm.toLowerCase().trim();

    const matchesSearch = searchTerm === '' ||
      id.includes(searchTermLower) ||
      businessName.includes(searchTermLower) ||
      projectName.includes(searchTermLower) ||
      milestone.includes(searchTermLower) ||
      stageName.includes(searchTermLower) ||
      status.includes(searchTermLower) ||
      projectFee.includes(searchTermLower) ||
      createdAt.includes(searchTermLower);

    // Check if status matches
    const matchesStatus = filterStatus === '' || status === filterStatus;

    // Return true if both conditions are met
    return matchesSearch && matchesStatus;
  });

  // Sort the filtered projects
  const sortedProjects = sortArrayByKey(filteredProjects, sortField, sortDirection);

  // Get current projects for pagination
  const indexOfLastProject = currentPage * itemsPerPage;
  const indexOfFirstProject = indexOfLastProject - itemsPerPage;
  const currentProjects = sortedProjects.slice(indexOfFirstProject, indexOfLastProject);

  // Calculate total pages
  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Go to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Go to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="main_content_iner">
      <div className="container-fluid p-0">
        <div className="row justify-content-center">
          <div className="col-lg-12">
            <div className="white_card card_height_100 mb_30">
              <div className="white_card_header">
                <div className="box_header m-0 new_report_header">
                  <div className="title_img">
                    <img src="/assets/images/Knowledge_Ceter_White.svg" className="page-title-img" alt="" />
                    <h4 className="text-white">ERC Projects Report</h4>
                  </div>
                </div>
              </div>
              <div className="white_card_body">
                <div className="mb-4">
                  <div className="row align-items-center">
                    {/* Search box */}
                    <div className="col-md-3">
                      <div className="input-group input-group-sm">
                        <div className="position-relative flex-grow-1">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search projects by any field..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingRight: '30px' }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                setIsSearching(true);
                                setTimeout(() => setIsSearching(false), 500);
                                setCurrentPage(1); // Reset to first page when searching
                              }
                            }}
                          />
                          {searchTerm && (
                            <button
                              type="button"
                              className="btn btn-sm position-absolute"
                              style={{ right: '5px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none' }}
                              onClick={() => {
                                setSearchTerm('');
                                setCurrentPage(1);
                              }}
                            >
                              <i className="fas fa-times text-muted"></i>
                            </button>
                          )}
                        </div>
                        <div className="input-group-append">
                          <button
                            className="btn btn-sm search-btn"
                            type="button"
                            onClick={() => {
                              setIsSearching(true);
                              setTimeout(() => setIsSearching(false), 500);
                              setCurrentPage(1); // Reset to first page when searching
                            }}
                          >
                            <i className={`fas fa-search ${isSearching ? 'fa-spin' : ''}`}></i>
                          </button>
                        </div>
                      </div>
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
}

export default ERCProjectsReport;