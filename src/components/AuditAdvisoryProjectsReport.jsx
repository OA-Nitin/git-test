import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import axios from 'axios';
import './common/CommonStyles.css';
import './ColumnSelector.css';
import SortableTableHeader from './common/SortableTableHeader';
import { sortArrayByKey } from '../utils/sortUtils';
import { getAssetPath } from '../utils/assetUtils';

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

const AuditAdvisoryProjectsReport = () => {
  // State for API data
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Audit Advisory Projects Report - Occams Portal"; // Set title for Audit Advisory Projects Report page

    // Fetch projects from API
    fetchProjects();
  }, []);

  // Function to fetch projects from API
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching projects from API...');

      // Use the updated endpoint provided
      const apiUrl = 'https://play.occamsadvisory.com/portal/wp-json/portalapi/v1/projects?product_id=934';

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
            setError('No projects found in API response.');
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
            setError('No projects found in API response.');
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
      const errorMsg = `Failed to fetch projects: ${err.message}. Using sample data instead.`;
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
      'AA play QA',
      'ERC play sp#12',
      'ERC Play SP99',
      'Wayne Industries',
      'Umbrella Corp',
      'Oscorp Industries'
    ];

    const productNames = ['ERC', 'STC', 'Audit Advisory', 'Tax Amendment', 'RDC'];
    const projectNames = ['None', 'Updated Comm Cal - ERC', 'Stu Bharat - STC', 'AA play qa - Audit Advisory', 'ERC play sp#12 - ERC'];
    const milestones = ['ERC Fulfillment', 'STC Enrollment', 'ERC Enrollment', 'ERC Lead Re-engagement'];
    const stageNames = [
      'Success Fees Processing Client Initiate',
      'ERC Fees Fully Paid',
      'Documents Pending',
      'Payment Processing Client Initiate',
      'Payment Returned',
      'Day 1 Follow-up Complete'
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
      const productIndex = Math.floor(Math.random() * productNames.length);
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
        product_name: 'Audit Advisory',
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
        { id: 'productName', label: 'Product', field: 'product_name', sortable: true },
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

  // Default visible columns - 10 columns as specified
  const defaultVisibleColumns = ['projectId', 'date', 'businessName', 'productName', 'projectName', 'collaborators', 'milestone', 'stageName', 'taxNowSignupStatus', 'notes'];

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
    const productName = String(project.product_name || '').toLowerCase();
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
      productName.includes(searchTermLower) ||
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

  // Handle view contact card
  const handleViewContact = (project) => {
    // Debug: Log the project object to see what data we have
    console.log('Project data for contact card:', project);

    // Only show specific fields in the contact card
    const businessName = project.business_legal_name || 'Unknown Business';
    const stage = project.stage_name || '';
    const projectName = project.project_name || 'N/A';

    // Create HTML for the specific fields we want to show
    const contactCardHTML = `
      <div class="text-start">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">${businessName}</h5>
          <span class="badge ${
            stage === 'ERC Fees Fully Paid' ? 'bg-success' :
            stage === 'Documents Pending' ? 'bg-info' :
            stage === 'Payment Processing Client Initiate' ? 'bg-primary' :
            stage === 'Success Fees Processing Client Initiate' ? 'bg-warning' :
            stage === 'Payment Returned' ? 'bg-danger' :
            'bg-secondary'
          }">${stage}</span>
        </div>

        <table class="table table-bordered">
          <tr>
            <th>Project Name</th>
            <td>${projectName}</td>
          </tr>
          <tr>
            <th>Business Phone</th>
            <td>${project.business_phone || 'N/A'}</td>
          </tr>
          <tr>
            <th>Business Email</th>
            <td>${project.business_email || 'N/A'}</td>
          </tr>
        </table>
      </div>
    `;

    Swal.fire({
      title: '<span style="font-size: 1.2rem; color: #333;">Contact Card</span>',
      html: contactCardHTML,
      width: '500px',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        container: 'swal-wide',
        popup: 'swal-popup-custom',
        header: 'swal-header-custom',
        title: 'swal-title-custom',
        closeButton: 'swal-close-button-custom',
        content: 'swal-content-custom'
      }
    });

    // Add custom CSS for the SweetAlert modal
    const style = document.createElement('style');
    style.innerHTML = `
      .swal-popup-custom {
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }
      .swal-title-custom {
        font-size: 1.5rem;
        color: #333;
        font-weight: 600;
      }
      .swal-header-custom {
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
      }
      .swal-content-custom {
        padding: 15px;
      }
      .table-bordered th {
        background-color: #f8f9fa;
        font-weight: 600;
        width: 40%;
      }
    `;
    document.head.appendChild(style);
  };

  // Handle view notes
  const handleViewNotes = (project) => {
    const projectId = project.project_id || '';
    const stage = project.stage_name || '';

    // Show loading state
    Swal.fire({
      title: `<span style="font-size: 1.2rem; color: #333;">Notes</span>`,
      html: `
        <div class="text-center py-4">
          <div class="spinner-border text-primary mb-3" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-muted">Loading notes...</p>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      allowOutsideClick: false,
      customClass: {
        container: 'swal-wide',
        popup: 'swal-popup-custom',
        header: 'swal-header-custom',
        title: 'swal-title-custom',
        closeButton: 'swal-close-button-custom',
        content: 'swal-content-custom'
      }
    });

    // Fetch notes from the API using project_id directly in the URL path
    axios.get(`https://play.occamsadvisory.com/portal/wp-json/portalapi/v1/project-notes/${projectId}`)
      .then(response => {
        console.log('Project Notes API full response:', response);
        console.log('Project ID used for fetching notes:', projectId);

        // Handle different possible response formats
        let notes = [];
        if (Array.isArray(response.data)) {
          notes = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // If response.data is an object with a data property that is an array
          if (Array.isArray(response.data.data)) {
            notes = response.data.data;
          } else {
            // If it's a single note object, wrap it in an array
            notes = [response.data];
          }
        }

        console.log('Processed notes array:', notes);

        let notesHtml = '';
        if (!notes || notes.length === 0) {
          notesHtml = `
            <div class="text-center py-4">
              <div class="mb-3">
                <i class="fas fa-sticky-note fa-3x text-muted"></i>
              </div>
              <p class="text-muted">No notes available for this project</p>
            </div>
          `;
        } else {
          notesHtml = `
            <div class="notes-list">
              ${notes.map(note => {
                // Parse the original date from the note (adjust field name based on API response)
                const originalDate = new Date(note.created_at || note.date || new Date());

                // Format the date as "Month Day, Year" (e.g., "May 6, 2025")
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                const formattedDate = originalDate.toLocaleDateString('en-US', options);

                // Format time in 12-hour format with AM/PM
                let hour12 = originalDate.getHours() % 12;
                if (hour12 === 0) hour12 = 12; // Convert 0 to 12 for 12 AM
                const ampm = originalDate.getHours() >= 12 ? 'PM' : 'AM';
                const formattedTime = `${hour12}:${String(originalDate.getMinutes()).padStart(2, '0')} ${ampm}`;

                // Get the note content (adjust field name based on API response)
                const noteContent = note.note || note.content || note.text || '';

                // Get the user who created the note (if available)
                const userName = note.user_name || note.username || note.author || 'System';

                return `
                  <div class="note-item mb-3 p-3 border rounded" style="background-color: #f8f9fa; border-color: #e9ecef;">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <div style="color: #000; font-weight: 600; font-size: 14px;">${formattedDate}</div>
                      <div style="color: #000; font-weight: 600; font-size: 14px;">${formattedTime}</div>
                    </div>
                    <p class="mb-0" style="white-space: pre-line; color: #333; line-height: 1.5; font-size: 14px;">${noteContent}</p>
                    <div class="mt-2 text-end">
                      <small class="text-muted">Added by: ${userName}</small>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }

        // Update the modal with the fetched notes
        Swal.fire({
          title: `<span style="font-size: 1.2rem; color: #333;">Notes</span>`,
          html: `
            <div class="text-start">
              <div class="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                <div>
                  <span class="text-black">Project ID: <span class="text-dark">${projectId}</span></span>
                </div>
                <div>
                  <span class="badge ${
                    stage === 'ERC Fees Fully Paid' ? 'bg-success' :
                    stage === 'Documents Pending' ? 'bg-info' :
                    stage === 'Payment Processing Client Initiate' ? 'bg-primary' :
                    stage === 'Success Fees Processing Client Initiate' ? 'bg-warning' :
                    stage === 'Payment Returned' ? 'bg-danger' :
                    'bg-secondary'
                  }">${stage || 'Unknown'}</span>
                </div>
              </div>
              <div class="notes-container" style="max-height: 450px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; background-color: white; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                ${notesHtml}
              </div>
            </div>
          `,
          width: '650px',
          showCloseButton: false,
          showConfirmButton: true,
          confirmButtonText: 'Close',
          confirmButtonColor: '#0d6efd',
          customClass: {
            container: 'swal-wide',
            popup: 'swal-popup-custom',
            header: 'swal-header-custom',
            title: 'swal-title-custom',
            closeButton: 'swal-close-button-custom',
            content: 'swal-content-custom',
            footer: 'swal-footer-custom'
          }
        });

        // Add custom CSS for the SweetAlert modal
        const style = document.createElement('style');
        style.innerHTML = `
          .swal-popup-custom {
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          .swal-title-custom {
            font-size: 1.5rem;
            color: #333;
            font-weight: 600;
          }
          .swal-header-custom {
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          .swal-content-custom {
            padding: 15px;
          }
          .swal-footer-custom {
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
          .note-item {
            transition: all 0.2s ease;
          }
          .note-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
        `;
        document.head.appendChild(style);
      })
      .catch(error => {
        console.error('Error fetching notes:', error);
        console.error('Error response:', error.response);
        console.error('Error request:', error.request);
        console.error('Error config:', error.config);
        console.error('Project ID that caused error:', projectId);

        // Show error message with more details
        Swal.fire({
          title: `<span style="font-size: 1.2rem; color: #333;">Error</span>`,
          html: `
            <div class="text-center py-3">
              <div class="mb-3">
                <i class="fas fa-exclamation-circle fa-3x text-danger"></i>
              </div>
              <p class="text-muted">There was a problem loading notes for this project.</p>
              <div class="alert alert-danger py-2 mt-2">
                <small>${error.response ? `Error: ${error.response.status} - ${error.response.statusText}` : 'Network error. Please check your connection.'}</small>
              </div>
              <p class="text-muted mt-2">Project ID: ${projectId}</p>
            </div>
          `,
          confirmButtonText: 'OK',
          customClass: {
            popup: 'swal-popup-custom',
            title: 'swal-title-custom'
          }
        });
      });
  };

  // Handle add notes
  const handleAddNotes = (project) => {
    const projectId = project.project_id || '';

    Swal.fire({
      title: `<span style="font-size: 1.2rem; color: #333;">Add Note</span>`,
      html: `
        <div class="text-start">
          <div class="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
            <div>
              <span class="text-black">Project ID: <span class="text-dark">${projectId}</span></span>
            </div>
          </div>
          <div class="mb-3">
            <textarea
              class="form-control"
              id="note-content"
              rows="5"
              placeholder="Enter your note here..."
              style="resize: vertical; min-height: 100px;"
            ></textarea>
          </div>
          <div class="text-muted small">
            <i class="fas fa-info-circle me-1"></i>
            Your note will be saved with the current date and time.
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save Note',
      cancelButtonText: 'Cancel',
      width: '650px',
      customClass: {
        container: 'swal-wide',
        popup: 'swal-popup-custom',
        header: 'swal-header-custom',
        title: 'swal-title-custom',
        closeButton: 'swal-close-button-custom',
        content: 'swal-content-custom',
        confirmButton: 'swal-confirm-button-custom',
        cancelButton: 'swal-cancel-button-custom'
      },
      preConfirm: () => {
        // Get the note content from the textarea
        const content = document.getElementById('note-content').value;

        // Validate the content
        if (!content || content.trim() === '') {
          Swal.showValidationMessage('Please enter a note');
          return false;
        }

        return {
          content: content
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Show loading state
        Swal.fire({
          title: `<span style="font-size: 1.2rem; color: #333;">Saving Note</span>`,
          html: `
            <div class="text-center py-3">
              <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="text-muted">Saving your note...</p>
            </div>
          `,
          showConfirmButton: false,
          allowOutsideClick: false,
          customClass: {
            popup: 'swal-popup-custom',
            title: 'swal-title-custom'
          }
        });

        // Prepare the data for the API
        // For POST requests, we need to include the data in the request body
        const noteData = {
          project_id: projectId, // Include project_id in the body
          note: result.value.content,
          user_id: 1  // Adding user_id parameter as required by the API
        };

        console.log('Sending project note data:', noteData); // For debugging
        console.log('Project ID for adding note:', projectId);

        // Send the data to the API - using the project_id in the URL
        axios.post('https://play.occamsadvisory.com/portal/wp-json/portalapi/v1/project-notes', noteData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
          .then((response) => {
            console.log('Note saved successfully:', response);
            // Show success message
            Swal.fire({
              title: `<span style="font-size: 1.2rem; color: #333;">Success</span>`,
              html: `
                <div class="text-center py-3">
                  <div class="mb-3">
                    <i class="fas fa-check-circle fa-3x text-success"></i>
                  </div>
                  <p class="text-muted">Your note has been saved successfully.</p>
                </div>
              `,
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: 'swal-popup-custom',
                title: 'swal-title-custom'
              }
            });

            // Refresh the notes view after a short delay
            setTimeout(() => {
              handleViewNotes(project);
            }, 2100);
          })
          .catch((error) => {
            console.error('Error saving note:', error);
            console.error('Error response:', error.response);
            console.error('Error request:', error.request);
            console.error('Error config:', error.config);

            // Show error message
            Swal.fire({
              title: `<span style="font-size: 1.2rem; color: #333;">Error</span>`,
              html: `
                <div class="text-center py-3">
                  <div class="mb-3">
                    <i class="fas fa-exclamation-circle fa-3x text-danger"></i>
                  </div>
                  <p class="text-muted">There was a problem saving your note.</p>
                  <div class="alert alert-danger py-2 mt-2">
                    <small>${error.response ? `Error: ${error.response.status} - ${error.response.statusText}` : 'Network error. Please check your connection.'}</small>
                  </div>
                </div>
              `,
              confirmButtonText: 'Try Again',
              customClass: {
                popup: 'swal-popup-custom',
                title: 'swal-title-custom'
              }
            }).then((result) => {
              if (result.isConfirmed) {
                // If user clicks "Try Again", reopen the add note dialog
                handleAddNotes(project);
              }
            });
          });
      }
    });
  };

  // Handle export to CSV
  const exportToCSV = () => {
    // Confirm export with user if there are many projects
    if (filteredProjects.length > 100) {
      if (!confirm(`You are about to export ${filteredProjects.length} projects. This may take a moment. Continue?`)) {
        return;
      }
    }

    // Get visible columns and their data, excluding action columns that shouldn't be exported
    const columnsToExclude = ['documents', 'notes', 'contactInfo'];
    const visibleColumnsData = allColumns.filter(column =>
      visibleColumns.includes(column.id) && !columnsToExclude.includes(column.id)
    );

    // Create headers from visible columns
    const headers = visibleColumnsData.map(column => column.label);

    // Create CSV data rows
    const csvData = filteredProjects.map(project => {
      return visibleColumnsData.map(column => {
        // Handle special columns with custom rendering
        if (column.id === 'date') return formatDate(project.created_at) || '';
        if (column.id === 'businessName') {
          const businessName = project.business_legal_name || '';
          // Escape quotes in CSV
          return `"${businessName.replace(/"/g, '""')}"`;
        }
        if (column.id === 'productName') return project.product_name || '';
        if (column.id === 'projectName') return project.project_name || '';
        if (column.id === 'collaborators') return project.collaborators || '';
        if (column.id === 'milestone') return project.milestone || '';
        if (column.id === 'stageName') return project.stage_name || '';
        if (column.id === 'projectId') return project.project_id || '';
        if (column.id === 'taxNowSignupStatus') return project.taxnow_signup_status || '';
        if (column.id === 'projectFee') return project.project_fee || '';

        // Default case
        return '';
      });
    });

    // Convert to CSV string
    let csvContent = headers.join(',') + '\n';
    csvData.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_advisory_projects_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle export to PDF
  const exportToPDF = () => {
    try {
      // Confirm export with user if there are many projects
      if (filteredProjects.length > 100) {
        if (!confirm(`You are about to export ${filteredProjects.length} projects to PDF. This may take a moment and result in a large file. Continue?`)) {
          return;
        }
      }

      // Get visible columns and their data, excluding action columns that shouldn't be exported
      const columnsToExclude = ['documents', 'notes', 'contactInfo'];
      const visibleColumnsData = allColumns.filter(column =>
        visibleColumns.includes(column.id) && !columnsToExclude.includes(column.id)
      );

      // Initialize jsPDF with landscape orientation
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add title and date
      const title = 'Audit Advisory Projects Report';
      const date = new Date().toLocaleDateString();
      const yPos = 15;

      doc.setFontSize(18);
      doc.text(title, 14, yPos);
      doc.setFontSize(10);
      doc.text(`Generated on: ${date}`, 14, yPos + 7);

      // Create table headers
      const tableColumn = visibleColumnsData.map(column => column.label);

      // Create table rows with data for visible columns
      const tableRows = filteredProjects.map(project => {
        return visibleColumnsData.map(column => {
          // Handle special columns with custom rendering
          if (column.id === 'date') return formatDate(project.created_at) || '';
          if (column.id === 'businessName') return project.business_legal_name || '';
          if (column.id === 'productName') return project.product_name || '';
          if (column.id === 'projectName') return project.project_name || '';
          if (column.id === 'collaborators') return project.collaborators || '';
          if (column.id === 'milestone') return project.milestone || '';
          if (column.id === 'stageName') return project.stage_name || '';
          if (column.id === 'projectId') return project.project_id || '';
          if (column.id === 'taxNowSignupStatus') return project.taxnow_signup_status || '';
          if (column.id === 'projectFee') return project.project_fee || '';

          // Default case
          return '';
        });
      });

      // Add table to document using the imported autoTable function
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yPos + 15,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 2,
          overflow: 'linebreak',
          halign: 'left'
        }
      });

      // Save the PDF with date in filename
      doc.save(`audit_advisory_projects_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  // Handle export to Excel
  const exportToExcel = () => {
    try {
      // Confirm export with user if there are many projects
      if (filteredProjects.length > 100) {
        if (!confirm(`You are about to export ${filteredProjects.length} projects to Excel. This may take a moment. Continue?`)) {
          return;
        }
      }

      // Get visible columns and their data, excluding action columns that shouldn't be exported
      const columnsToExclude = ['documents', 'notes', 'contactInfo'];
      const visibleColumnsData = allColumns.filter(column =>
        visibleColumns.includes(column.id) && !columnsToExclude.includes(column.id)
      );

      // Prepare data for Excel
      const excelData = filteredProjects.map(project => {
        const rowData = {};

        // Add data for each visible column
        visibleColumnsData.forEach(column => {
          // Handle special columns with custom rendering
          if (column.id === 'date') rowData[column.label] = formatDate(project.created_at) || '';
          else if (column.id === 'businessName') rowData[column.label] = project.business_legal_name || '';
          else if (column.id === 'productName') rowData[column.label] = project.product_name || '';
          else if (column.id === 'projectName') rowData[column.label] = project.project_name || '';
          else if (column.id === 'collaborators') rowData[column.label] = project.collaborators || '';
          else if (column.id === 'milestone') rowData[column.label] = project.milestone || '';
          else if (column.id === 'stageName') rowData[column.label] = project.stage_name || '';
          else if (column.id === 'projectId') rowData[column.label] = project.project_id || '';
          else if (column.id === 'taxNowSignupStatus') rowData[column.label] = project.taxnow_signup_status || '';
          else if (column.id === 'projectFee') rowData[column.label] = project.project_fee || '';
          else rowData[column.label] = '';
        });

        return rowData;
      });

      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Audit Advisory Projects');

      // Generate Excel file and trigger download
      XLSX.writeFile(wb, `audit_advisory_projects_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('Excel generation error:', error);
      alert('Error generating Excel file: ' + error.message);
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
                    <img src={getAssetPath('assets/images/Knowledge_Ceter_White.svg')} className="page-title-img" alt="" />
                    <h4 className="text-white">Audit Advisory Projects Report</h4>
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

                                // Show feedback toast if search term is not empty
                                if (searchTerm.trim() !== '') {
                                  Swal.fire({
                                    title: 'Searching...',
                                    text: `Searching for "${searchTerm}"`,
                                    icon: 'info',
                                    toast: true,
                                    position: 'top-end',
                                    showConfirmButton: false,
                                    timer: 1500
                                  });
                                }
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

                              // Show feedback toast if search term is not empty
                              if (searchTerm.trim() !== '') {
                                Swal.fire({
                                  title: 'Searching...',
                                  text: `Searching for "${searchTerm}"`,
                                  icon: 'info',
                                  toast: true,
                                  position: 'top-end',
                                  showConfirmButton: false,
                                  timer: 1500
                                });
                              }
                            }}
                          >
                            <i className={`fas fa-search ${isSearching ? 'fa-spin' : ''}`}></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Export buttons and Column Selector */}
                    <div className="col-md-9">
                      <div className="d-flex justify-content-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={fetchProjects}
                          disabled={loading}
                          title="Refresh Data"
                        >
                          <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                        </button>
                        <div className="dropdown me-2">
                          <button
                            className="column-selector-btn"
                            type="button"
                            id="columnSelectorDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <i className="fas fa-columns"></i> Columns
                          </button>
                          <div className="dropdown-menu dropdown-menu-end column-selector" aria-labelledby="columnSelectorDropdown">
                            <div className="column-selector-header">
                              <span>Table Columns</span>
                              <i className="fas fa-table"></i>
                            </div>
                            <div className="column-selector-content">
                              {columnGroups.map(group => (
                                <div key={group.id} className="column-group">
                                  <div className="column-group-title">{group.title}</div>
                                  {group.columns.map(column => (
                                    <div
                                      key={column.id}
                                      className={`dropdown-item ${visibleColumns.includes(column.id) ? 'active' : ''}`}
                                    >
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          id={`column-${column.id}`}
                                          checked={visibleColumns.includes(column.id)}
                                          onChange={() => toggleColumnVisibility(column.id)}
                                        />
                                        <label className="form-check-label" htmlFor={`column-${column.id}`}>
                                          {column.label}
                                        </label>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                            <div className="column-selector-footer">
                              <button className="btn btn-reset" onClick={resetToDefaultColumns}>
                                Reset
                              </button>
                              <button className="btn btn-apply" onClick={selectAllColumns}>
                                Select All
                              </button>
                            </div>
                          </div>
                        </div>
                        <button className="btn btn-sm export-btn" onClick={exportToExcel}>
                          <i className="fas fa-file-excel me-1"></i> Excel
                        </button>
                        <button className="btn btn-sm export-btn" onClick={exportToPDF}>
                          <i className="fas fa-file-pdf me-1"></i> PDF
                        </button>
                        <button className="btn btn-sm export-btn" onClick={exportToCSV}>
                          <i className="fas fa-file-csv me-1"></i> CSV
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loading indicator */}
                {loading && (
                  <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading projects data...</p>
                  </div>
                )}

                {/* Error message */}
                {error && !loading && (
                  <div className="alert alert-warning" role="alert">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-exclamation-triangle me-3 fs-4"></i>
                      <div>
                        <h5 className="alert-heading mb-1">Data Loading Error</h5>
                        <p className="mb-0">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data table */}
                {!loading && (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead>
                        <tr>
                          {allColumns.map(column => {
                            // Only render columns that are in the visibleColumns array
                            if (visibleColumns.includes(column.id)) {
                              return column.sortable ? (
                                <SortableTableHeader
                                  key={column.id}
                                  label={column.label}
                                  field={column.field}
                                  currentSortField={sortField}
                                  currentSortDirection={sortDirection}
                                  onSort={handleSort}
                                />
                              ) : (
                                <th key={column.id}>{column.label}</th>
                              );
                            }
                            return null;
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {currentProjects.length > 0 ? (
                          currentProjects.map((project, index) => (
                            <tr key={project.project_id || index}>
                              {allColumns.map(column => {
                                // Only render columns that are in the visibleColumns array
                                if (!visibleColumns.includes(column.id)) {
                                  return null;
                                }

                                // Render different cell types based on column id
                                switch (column.id) {
                                  case 'projectId':
                                    return <td key={column.id}>{project.project_id || ''}</td>;
                                  case 'date':
                                    return <td key={column.id}>{formatDate(project.created_at) || ''}</td>;
                                  case 'businessName':
                                    return <td key={column.id}>{project.business_legal_name || ''}</td>;
                                  case 'contactCard':
                                    return (
                                      <td key={column.id} className="text-center">
                                        <button
                                          className="btn btn-sm btn-outline-primary"
                                          onClick={() => handleViewContact(project)}
                                        >
                                          <i className="fas fa-address-card"></i>
                                        </button>
                                      </td>
                                    );
                                  case 'productName':
                                    return <td key={column.id}>{project.product_name || ''}</td>;
                                  case 'projectName':
                                    return <td key={column.id}>{project.project_name || ''}</td>;
                                  case 'collaborators':
                                    return <td key={column.id}>{project.collaborators || ''}</td>;
                                  case 'milestone':
                                    return <td key={column.id}>{project.milestone || ''}</td>;
                                  case 'stageName':
                                    return (
                                      <td key={column.id}>
                                        <span className={`badge ${
                                          project.stage_name === 'ERC Fees Fully Paid' ? 'bg-success' :
                                          project.stage_name === 'Documents Pending' ? 'bg-info' :
                                          project.stage_name === 'Payment Processing Client Initiate' ? 'bg-primary' :
                                          project.stage_name === 'Success Fees Processing Client Initiate' ? 'bg-warning' :
                                          project.stage_name === 'Payment Returned' ? 'bg-danger' :
                                          'bg-secondary'
                                        }`}>
                                          {project.stage_name || ''}
                                        </span>
                                      </td>
                                    );
                                  case 'taxNowSignupStatus':
                                    return <td key={column.id}>{project.taxnow_signup_status || ''}</td>;
                                  case 'projectFee':
                                    return <td key={column.id}>{project.project_fee || ''}</td>;
                                  case 'notes':
                                    return (
                                      <td key={column.id}>
                                        <div className="d-flex justify-content-center gap-2">
                                          <button
                                            className="btn btn-sm btn-outline-info"
                                            onClick={() => handleViewNotes(project)}
                                            title="View Notes"
                                          >
                                            <i className="fas fa-eye"></i>
                                          </button>
                                          <button
                                            className="btn btn-sm btn-outline-success"
                                            onClick={() => handleAddNotes(project)}
                                            title="Add Notes"
                                          >
                                            <i className="fas fa-plus"></i>
                                          </button>
                                        </div>
                                      </td>
                                    );
                                  default:
                                    return <td key={column.id}></td>;
                                }
                              })}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={visibleColumns.length} className="text-center py-4">
                              <i className="fas fa-info-circle me-2"></i>
                              No projects found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div>
                      Showing {indexOfFirstProject + 1} to {Math.min(indexOfLastProject, filteredProjects.length)} of {filteredProjects.length} entries
                    </div>
                    <nav>
                      <ul className="pagination mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={goToPreviousPage}>
                            <i className="fas fa-chevron-left"></i>
                          </button>
                        </li>
                        {[...Array(totalPages)].map((_, i) => (
                          <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => paginate(i + 1)}>
                              {i + 1}
                            </button>
                          </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={goToNextPage}>
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditAdvisoryProjectsReport;