import { useParams, Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import axios from 'axios';
import './common/ReportStyle.css';
import './common/DateRangePicker.css';
import SortableTableHeader from './common/SortableTableHeader';
import { sortArrayByKey } from '../utils/sortUtils';
import Notes from './common/Notes';
import ContactCard from './common/ContactCard';
import ReportFilter from './common/ReportFilter';
import ReportPagination from './common/ReportPagination';
import PageContainer from './common/PageContainer';
import { getFormattedUserData } from '../utils/userUtils';


// Map product names to their respective IDs
// Note: Tax Amendment (936) and Partnership (938) are hidden from reports
const productIdMap = {
  erc: 935,
  stc: 937,
  rdc: 932,
  // partnership: 938, // Hidden from reports
  // 'tax-amendment': 936, // Hidden from reports
  // 'audit-advisory': 934, // Hidden from reports
  all: null // to fetch all projects without filtering
};

const user = getFormattedUserData();

// Function to format date as MM/DD/YYYY
const formatDate = (dateString) => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;

    // Format as MM/DD/YYYY
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

const AllProjectsReport = () => {
  // Get product parameter from URL
  const { product } = useParams();

  // State for API data
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get product ID from the product name in URL
  const productId = product ? productIdMap[product.toLowerCase()] : null;

  useEffect(() => {
    // Set document title based on product
    const displayType = product || 'All';
    const reportTitle = `${displayType.toUpperCase()} Projects Report - Occams Portal`;
    document.title = reportTitle;

    setSearchTerm('');
    setEndDate('');
    setStartDate('');
    setCurrentPage(1);
    setDatePickerKey(prev => prev + 1);
    // Fetch projects from API
    fetchProjects();
  }, [product, productId]);

  // Function to fetch projects from API
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      // Log which type of projects we're fetching
      console.log(`Fetching ${product ? product + ' ' : ''}projects from API...`);
      console.log('Using product ID:', productId);

      // Construct API URL with product_id parameter if available
      let apiUrl = 'https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/projects';
      if (productId) {
        apiUrl += `?product_id=${productId}`;
      }

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
        // Check if response.data has a data property that is an array
        if (response.data.data && Array.isArray(response.data.data)) {
          const apiProjects = response.data.data;
          console.log('API Projects (nested data):', apiProjects);
          console.log('Number of projects returned:', apiProjects.length);

          // Filter out projects with product IDs 936 (Tax Amendment), 938 (Partnership), and 934 (Audit Advisory)
          const filteredApiProjects = apiProjects.filter(project => {
            const productId = project.product_id;
            // Hide projects with product ID 936 (Tax Amendment), 938 (Partnership), and 934 (Audit Advisory)
            return productId !== '936' && productId !== '938' && productId !== '934';
          });

          console.log('Filtered projects (excluding 936, 938, 934):', filteredApiProjects.length);

          // Use the filtered API data
          setProjects(filteredApiProjects);

          if (filteredApiProjects.length === 0) {
            setError('No data available.');
            setProjects([]);
          }
        }
        // Check if response.data is an array directly
        else if (Array.isArray(response.data)) {
          // Use the data array from the API response
          const apiProjects = response.data;
          console.log('API Projects:', apiProjects);
          console.log('Number of projects returned:', apiProjects.length);

          // Filter out projects with product IDs 936 (Tax Amendment), 938 (Partnership), and 934 (Audit Advisory)
          const filteredApiProjects = apiProjects.filter(project => {
            const productId = project.product_id;
            // Hide projects with product ID 936 (Tax Amendment), 938 (Partnership), and 934 (Audit Advisory)
            return productId !== '936' && productId !== '938' && productId !== '934';
          });

          console.log('Filtered projects (excluding 936, 938, 934):', filteredApiProjects.length);

          // Use the filtered API data
          setProjects(filteredApiProjects);

          if (filteredApiProjects.length === 0) {
            setError('No data available.');
            setProjects([]);
          }
        }
        else {
          console.error('API response format unexpected:', response);
          // If API returns unexpected format, show error message
          const errorMsg = 'Data is not available. API returned unexpected data format.';
          setError(errorMsg);
          setProjects([]);
        }
      } else {
        console.error('API response invalid:', response);
        // If API returns invalid response, show error message
        const errorMsg = 'Data is not available. API returned invalid response.';
        setError(errorMsg);
        setProjects([]);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      const errorMsg = `Data is not available. Failed to fetch projects: ${err.message}.`;
      console.error(errorMsg);
      setError(errorMsg);
      setProjects([]);
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

    const productNames = ['ERC', 'STC', 'RDC']; // Removed 'Audit Advisory' and 'Tax Amendment'
    const projectNames = ['None', 'Updated Comm Cal - ERC', 'Stu Bharat - STC', 'ERC play sp#12 - ERC', 'RDC Project Sample']; // Removed Audit Advisory reference
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [sortField, setSortField] = useState('project_id');
  const [sortDirection, setSortDirection] = useState('desc'); // Changed to desc for latest projects first
  const [isSearching, setIsSearching] = useState(false);
  const [datePickerKey, setDatePickerKey] = useState(0);

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

  // Default visible columns - 8 columns as specified, similar to LeadReport
  const defaultVisibleColumns = ['projectId', 'date', 'businessName', 'productName', 'projectName', 'stageName', 'taxNowSignupStatus', 'notes'];

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
      // If sorting by a new field, set it and default direction based on field type
      setSortField(field);
      // For project_id, default to descending (latest first), for others default to ascending
      setSortDirection(field === 'project_id' ? 'desc' : 'asc');
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  // Handle date filter application
  const handleApplyDateFilter = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1); // Reset to first page when filter changes

    // Show feedback toast
    if (start || end) {
      const message = start && end
        ? `Filtering projects from ${new Date(start).toLocaleDateString()} to ${new Date(end).toLocaleDateString()}`
        : start
          ? `Filtering projects from ${new Date(start).toLocaleDateString()}`
          : `Filtering projects until ${new Date(end).toLocaleDateString()}`;

      Swal.fire({
        title: 'Date Filter Applied',
        text: message,
        icon: 'info',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        customClass: {
          container: 'swal-toast-container-custom'
        }
      });
    }
  };

  const getFormattedDate = () => {
    const today = new Date();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${month}-${day}-${year}`; // MM-DD-YYYY
  };

  const getFormattedDateTime = () => {
    const today = new Date();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const year = today.getFullYear();
    const time = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${month}/${day}/${year} ${time}`; // MM/DD/YYYY HH:MM
  };

  const capitalize = (str) => str.toUpperCase();

  const getProjectType = () => {
    // let type = projects.length > 0 ? projects[0].product_name : 'All';
    // type = type || 'All';

    // // Remove existing "Projects" word if already included
    // type = type.replace(/Projects$/i, '').trim(); 
    // type = type.replace(/\s+/g, '');  // remove spaces

    // return `${type}Projects`;
    const safeProduct = product?.toLowerCase() || 'all';
    return `${capitalize(safeProduct)}_Projects`;
  };

  const userName = user?.display_name || user?.username || 'User';

  const getExportFileName = () => {
    const typeName = getProjectType();
    const dateStr = getFormattedDate();
    const safeUserName = userName.replace(/\s+/g, '_');
    return `${typeName}_${safeUserName}_${dateStr}`;
  };

  const normalizePhone = (phone) => {
    return phone.replace(/\D/g, '');  // remove all non-digit characters
  };

  const normalizedSearchPhone = searchTerm.replace(/\D/g, '');

  // Filter projects based on search term, status, and date range
  const filteredProjects = projects.filter(project => {
    // Skip filtering if no filters are applied
    if (searchTerm === '' && filterStatus === '' && !startDate && !endDate) {
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
    const businessEmail = String(project.business_email || '').toLowerCase();
    const businessPhone = String(project.business_phone || '').toLowerCase();

    // Check if search term matches any field
    const searchTermLower = searchTerm.toLowerCase().trim();
    const normalizedSearchPhone = searchTerm.replace(/\D/g, '');

    const matchesSearch = searchTerm === '' ||
      id.includes(searchTermLower) ||
      businessName.includes(searchTermLower) ||
      productName.includes(searchTermLower) ||
      projectName.includes(searchTermLower) ||
      milestone.includes(searchTermLower) ||
      stageName.includes(searchTermLower) ||
      status.includes(searchTermLower) ||
      projectFee.includes(searchTermLower) ||
      businessEmail.includes(searchTermLower) ||
      businessPhone.includes(searchTermLower) ||
      (
        normalizedSearchPhone.length >= 4 &&  // 👉 Apply phone match only if search looks like a phone
        normalizePhone(businessPhone).includes(normalizedSearchPhone)
      ) || createdAt.includes(searchTermLower);

    // Check if status matches
    const matchesStatus = filterStatus === '' || status === filterStatus;

    // Check if date is within range
    let matchesDateRange = true;

    if (startDate || endDate) {
      // Try to parse the created date
      let projectDate;
      try {
        // First try to parse as ISO date
        projectDate = new Date(project.created_at);

        // If invalid date, try to parse as MM/DD/YYYY
        if (isNaN(projectDate.getTime())) {
          const parts = project.created_at.split('/');
          if (parts.length === 3) {
            // MM/DD/YYYY format
            projectDate = new Date(parts[2], parts[0] - 1, parts[1]);
          }
        }

        // If still invalid, don't include this project in date-filtered results
        if (isNaN(projectDate.getTime())) {
          matchesDateRange = false;
        } else {
          // Set time to midnight for date comparison
          projectDate.setHours(0, 0, 0, 0);

          // Check start date
          if (startDate) {
            const startDateObj = new Date(startDate);
            startDateObj.setHours(0, 0, 0, 0);
            if (projectDate < startDateObj) {
              matchesDateRange = false;
            }
          }

          // Check end date
          if (endDate && matchesDateRange) {
            const endDateObj = new Date(endDate);
            endDateObj.setHours(0, 0, 0, 0);
            if (projectDate > endDateObj) {
              matchesDateRange = false;
            }
          }
        }
      } catch (e) {
        // If there's an error parsing the date, don't include this project in date-filtered results
        matchesDateRange = false;
      }
    }

    // Return true if all conditions are met
    return matchesSearch && matchesStatus && matchesDateRange;
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
        if (column.id === 'contactCard') {
          const contactName = project.authorized_signatory_name || '';
          const phone = project.business_phone || '';
          const email = project.business_email || '';
          return `${contactName} | ${phone} | ${email}`;
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
    link.setAttribute('download', `${getExportFileName()}.csv`);
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
      doc.text(`${capitalize(product?.toLowerCase() || 'all')} Projects`, 15, 15);

      // Add generation date and filter info
      doc.setFontSize(10);
      doc.text(`Generated: ${getFormattedDateTime()}`, 15, 22);

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
          if (column.id === 'contactCard') {
            const contactName = project.authorized_signatory_name || '';
            const phone = project.business_phone || '';
            const email = project.business_email || '';
            return `${contactName} | ${phone} | ${email}`;
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
      doc.save(`${getExportFileName()}.pdf`);
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
          else if (column.id === 'contactCard') {
            const contactName = project.authorized_signatory_name || '';
            const phone = project.business_phone || '';
            const email = project.business_email || '';
            rowData[column.label] = `${contactName} | ${phone} | ${email}`;
          }
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
      XLSX.utils.book_append_sheet(workbook, worksheet, `${getProjectType()}`);

      // Generate Excel file
      XLSX.writeFile(workbook, `${getExportFileName()}.xlsx`);
    } catch (error) {
      console.error('Excel generation error:', error);
      alert('Error generating Excel file: ' + error.message);
    }
  };

  // The handleViewContact function is no longer needed as we're using the ContactCard component



  return (
    <PageContainer title={`${product ? product.toUpperCase() + ' ' : ''}Projects Report`}>
      <ReportFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isSearching={isSearching}
        setIsSearching={setIsSearching}
        setCurrentPage={setCurrentPage}
        startDate={startDate}
        endDate={endDate}
        handleApplyDateFilter={handleApplyDateFilter}
        refreshData={fetchProjects}
        loading={loading}
        columnGroups={columnGroups}
        visibleColumns={visibleColumns}
        toggleColumnVisibility={toggleColumnVisibility}
        resetToDefaultColumns={resetToDefaultColumns}
        selectAllColumns={selectAllColumns}
        exportToExcel={exportToExcel}
        exportToPDF={exportToPDF}
        exportToCSV={exportToCSV}
        datePickerKey={datePickerKey}
      />

      {/* Loading indicator */}
      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading projects data...</p>
        </div>
      )}

      {/* We've removed the error messages as requested */}

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
                          return (
                            <td key={column.id}>
                              <Link
                                to={`/project-detail/${project.project_id}`}
                                state={{ projectData: project }}
                                className="lead-link"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {project.project_id || ''}
                              </Link>
                            </td>
                          );
                        case 'businessName':
                          return (
                            <td key={column.id}>
                              <Link
                                to={`/lead-detail/${project.lead_id || project.project_id}`}
                                state={{ leadData: project }}
                                className="lead-link"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {project.business_legal_name || ''}
                              </Link>
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
                  <td colSpan={visibleColumns.length} className="text-center py-4">
                    <div className="d-flex flex-column align-items-center">
                      <i className="fas fa-database text-muted mb-3" style={{ fontSize: '2rem' }}></i>
                      <h5 className="text-muted">No records found</h5>
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
        <ReportPagination
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={paginate}
          goToPreviousPage={goToPreviousPage}
          goToNextPage={goToNextPage}
          indexOfFirstItem={indexOfFirstProject}
          indexOfLastItem={indexOfLastProject}
          totalFilteredItems={filteredProjects.length}
          totalItems={projects.length}
          itemName="projects"
        />
      )}
    </PageContainer>
  );
};

export default AllProjectsReport;