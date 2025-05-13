import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import axios from 'axios';
import './common/ReportStyle.css';

import SortableTableHeader from './common/SortableTableHeader';
import { sortArrayByKey } from '../utils/sortUtils';
import { getAssetPath } from '../utils/assetUtils';
import Notes from './common/Notes';
import ContactCard from './common/ContactCard';

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

const AllProjectsReport = () => {
  // State for API data
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "All Projects Report - Occams Portal"; // Set title for All Projects Report page

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
      const apiUrl = 'https://play.occamsadvisory.com/portal/wp-json/portalapi/v1/projects';

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
        product_name: productNames[productIndex],
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

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `all_projects_report_${new Date().toISOString().slice(0, 10)}.csv`);
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

      // Add title
      doc.setFontSize(16);
      doc.text('All Projects Report', 15, 15);

      // Add generation date and filter info
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 22);

      let yPos = 27;

      if (filterStatus) {
        doc.text(`Filtered by status: ${filterStatus}`, 15, yPos);
        yPos += 5;
      }

      if (searchTerm) {
        doc.text(`Search term: "${searchTerm}"`, 15, yPos);
        yPos += 5;
      }

      // Create table data
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
        startY: yPos,
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
      doc.save(`all_projects_report_${new Date().toISOString().slice(0, 10)}.pdf`);
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

      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Create a workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'All Projects');

      // Generate Excel file
      XLSX.writeFile(workbook, `all_projects_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('Excel generation error:', error);
      alert('Error generating Excel file: ' + error.message);
    }
  };

  // The handleViewContact function is no longer needed as we're using the ContactCard component



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
                    <h4 className="text-white">All Projects Report</h4>
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
                    <hr />
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Please try again or contact support if the problem persists.</span>
                      <button
                        className="btn btn-primary"
                        onClick={fetchProjects}
                      >
                        <i className="fas fa-sync-alt me-1"></i> Retry
                      </button>
                    </div>
                  </div>
                )}

                {/* Fallback data warning */}
                {projects.length > 0 && projects[0].isFallbackData && !loading && (
                  <div className="alert alert-info" role="alert">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-info-circle me-3 fs-4"></i>
                      <div>
                        <h5 className="alert-heading mb-1">Sample Data</h5>
                        <p className="mb-0">Showing sample data because the API request failed or returned no results. The highlighted rows contain sample data.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data table */}
                {!loading && (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover table-striped">
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
                            <tr
                              key={project.project_id || index}
                              className={project.isFallbackData ? 'table-warning' : ''}
                            >
                              {/* Render cells in the same order as the column definitions */}
                              {allColumns.map(column => {
                                // Only render columns that are in the visibleColumns array
                                if (!visibleColumns.includes(column.id)) {
                                  return null;
                                }

                                // Render different cell types based on column id
                                switch (column.id) {
                                  case 'projectId':
                                    return <td key={column.id}>{project.project_id || ''}</td>;
                                  case 'businessName':
                                    return (
                                      <td key={column.id}>
                                        {project.isFallbackData && (
                                          <span className="badge bg-warning me-1" title="Sample data">
                                            <i className="fas fa-exclamation-triangle"></i>
                                          </span>
                                        )}
                                        {project.business_legal_name || ''}
                                      </td>
                                    );
                                  case 'contactCard':
                                    return (
                                      <td key={column.id}>
                                        <ContactCard
                                          entity={project}
                                          entityType="project"
                                        />
                                      </td>
                                    );
                                  case 'projectName':
                                    return <td key={column.id}>{project.project_name || ''}</td>;
                                  case 'productName':
                                    return <td key={column.id}>{project.product_name || ''}</td>;
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
                                  case 'date':
                                    return <td key={column.id}>{formatDate(project.created_at) || ''}</td>;
                                  case 'projectFee':
                                    return <td key={column.id}>{project.project_fee || ''}</td>;
                                  case 'taxNowSignupStatus':
                                    return (
                                      <td key={column.id}>
                                        <span className={`badge ${
                                          project.taxnow_signup_status === 'Complete' ? 'bg-success' :
                                          project.taxnow_signup_status ? 'bg-info' :
                                          'bg-secondary'
                                        }`}>
                                          {project.taxnow_signup_status || 'N/A'}
                                        </span>
                                      </td>
                                    );
                                  case 'notes':
                                    return (
                                      <td key={column.id}>
                                        <Notes
                                          entityType="project"
                                          entityId={project.project_id || ''}
                                          entityName={project.business_legal_name || ''}
                                        />
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
                            <td colSpan={visibleColumns.length} className="text-center py-5">
                              <div className="d-flex flex-column align-items-center">
                                <i className="fas fa-search fa-3x text-muted mb-3"></i>
                                <h5 className="text-muted">No projects found</h5>
                                <p className="text-muted mb-3">
                                  {searchTerm || filterStatus ?
                                    'Try adjusting your search or filter criteria' :
                                    'No project data is available from the API'}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {!loading && (
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <p>Showing {indexOfFirstProject + 1} to {Math.min(indexOfLastProject, filteredProjects.length)} of {filteredProjects.length} projects (filtered from {projects.length} total)</p>
                    </div>
                    <div className="col-md-6">
                      <nav aria-label="Project report pagination">
                        <ul className="pagination justify-content-end">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={goToPreviousPage}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </button>
                          </li>

                          {/* First page */}
                          {currentPage > 3 && (
                            <li className="page-item">
                              <button className="page-link" onClick={() => paginate(1)}>1</button>
                            </li>
                          )}

                          {/* Ellipsis */}
                          {currentPage > 4 && (
                            <li className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          )}

                          {/* Page numbers */}
                          {[...Array(totalPages)].map((_, i) => {
                            const pageNumber = i + 1;
                            // Show current page and 1 page before and after
                            if (
                              pageNumber === currentPage ||
                              pageNumber === currentPage - 1 ||
                              pageNumber === currentPage + 1
                            ) {
                              return (
                                <li
                                  key={pageNumber}
                                  className={`page-item ${pageNumber === currentPage ? 'active' : ''}`}
                                >
                                  <button
                                    className="page-link"
                                    onClick={() => paginate(pageNumber)}
                                  >
                                    {pageNumber}
                                  </button>
                                </li>
                              );
                            }
                            return null;
                          })}

                          {/* Ellipsis */}
                          {currentPage < totalPages - 3 && (
                            <li className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          )}

                          {/* Last page */}
                          {currentPage < totalPages - 2 && (
                            <li className="page-item">
                              <button
                                className="page-link"
                                onClick={() => paginate(totalPages)}
                              >
                                {totalPages}
                              </button>
                            </li>
                          )}

                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={goToNextPage}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
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

export default AllProjectsReport;