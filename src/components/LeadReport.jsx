import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './common/ReportStyle.css';
import './common/DateRangePicker.css';
import SortableTableHeader from './common/SortableTableHeader';
import Notes from './common/Notes';
import ContactCard from './common/ContactCard';
import ReportFilter from './common/ReportFilter';
import ReportPagination from './common/ReportPagination';
import { sortArrayByKey } from '../utils/sortUtils';
import PageContainer from './common/PageContainer';

const productIdMap = {
 erc: 935,
  stc: 937,
  rdc: 932,
  partnership: 104,
  'tax-amendment': 936,
  'audit-advisory': 934,
  all: null, // to fetch all leads without filtering
};

const LeadReport = ({ projectType }) => {
  // State for API data
  const { product } = useParams(); // e.g. 'erc', 'stc', etc.
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

   const productId = productIdMap[product?.toLowerCase()] ?? null;

  useEffect(() => {
    // Set title based on product parameter or projectType prop
    const displayType = product || projectType;
    const reportTitle = displayType
      ? `${displayType.toUpperCase()} Lead Report - Occams Portal`
      : "Lead Report - Occams Portal";

    document.title = reportTitle;

    // Fetch leads from API
    fetchLeads();

    // Log for debugging
    console.log('LeadReport useEffect triggered with product:', product, 'productId:', productId);
  }, [product, projectType, productId]);

  // Function to fetch leads from API
  const fetchLeads = async () => {
    setLoading(true);
    setError(null);

    try {
      // Log which type of leads we're fetching (from URL param or prop)
      const reportType = product || projectType;
      console.log(`Fetching ${reportType ? reportType + ' ' : ''}leads from API...`);
      console.log('Using product ID:', productId);

      // Construct API URL - if projectType is provided, we could add it as a query parameter
      // For now, we'll fetch all leads and filter them client-side
      let apiUrl = 'https://play.occamsadvisory.com/portal/wp-json/v1/leads';
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
      if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
        // Use the data array from the API response
        let apiLeads = response.data.data;
        console.log('API Leads (before filtering):', apiLeads);

        // Filter leads by product parameter or project type prop if specified
        const filterType = product || projectType;

        // Special case for "all" - don't filter the leads
        if (filterType && filterType.toLowerCase() !== 'all') {
          console.log('Filtering leads for specific type:', filterType);
          apiLeads = apiLeads.filter(lead => {
            // Check if the lead's category or product_type matches the filterType
            // Adjust these fields based on the actual API response structure
            const category = (lead.category || '').toLowerCase();
            const productType = (lead.product_type || '').toLowerCase();
            const leadGroup = (lead.lead_group || '').toLowerCase();
            const leadProductId = lead.product_id ? String(lead.product_id).toLowerCase() : '';

            const typeToMatch = filterType.toLowerCase();
            const productIdToMatch = productId ? String(productId).toLowerCase() : '';

            // Match by text fields or product ID
            return category.includes(typeToMatch) ||
                   productType.includes(typeToMatch) ||
                   leadGroup.includes(typeToMatch) ||
                   (productIdToMatch && leadProductId === productIdToMatch);
          });

          console.log(`Filtered leads for ${filterType}:`, apiLeads);
        } else if (filterType && filterType.toLowerCase() === 'all') {
          console.log('Showing all leads without filtering by type');
        }

        if (apiLeads.length > 0) {
          setLeads(apiLeads);
          setError(null); // Clear any previous error
        } else {
          const reportType = product || projectType;
          // Show no data available message
          if (reportType && reportType.toLowerCase() === 'all') {
            console.warn('No leads found in API response');
            setLeads([]);
            setError('No data available.');
          } else {
            console.warn(`No ${reportType ? reportType + ' ' : ''}leads found in API response`);
            setLeads([]);
            setError(`No ${reportType ? reportType + ' ' : ''}data available.`);
          }
        }
      } else {
        console.error('API response format unexpected:', response);
        // If API returns unexpected format, show error message
        const reportType = product || projectType;

        // Show no data available message
        if (reportType && reportType.toLowerCase() === 'all') {
          setLeads([]);
          setError('Data is not available. API returned unexpected data format.');
        } else {
          setLeads([]);
          setError(`Data is not available. API returned unexpected ${reportType ? reportType + ' ' : ''}data format.`);
        }
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      const reportType = product || projectType;

      // Show no data available message
      if (reportType && reportType.toLowerCase() === 'all') {
        setError(`Data is not available. Failed to fetch leads: ${err.message}.`);
        setLeads([]);
      } else {
        setError(`Data is not available. Failed to fetch ${reportType ? reportType + ' ' : ''}leads: ${err.message}.`);
        setLeads([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate fallback lead data if API fails
  const generateFallbackLeads = (type = null) => {
    const companies = [
      { name: 'Acme Corporation', domain: 'acmecorp.com' },
      { name: 'Globex Industries', domain: 'globex.com' },
      { name: 'Stark Enterprises', domain: 'starkent.com' },
      { name: 'Wayne Industries', domain: 'wayneindustries.com' },
      { name: 'Umbrella Corporation', domain: 'umbrellacorp.com' },
      { name: 'Oscorp Industries', domain: 'oscorp.com' },
      { name: 'Cyberdyne Systems', domain: 'cyberdyne.com' },
      { name: 'Initech', domain: 'initech.com' },
      { name: 'Massive Dynamic', domain: 'massivedynamic.com' },
      { name: 'Soylent Corp', domain: 'soylent.com' }
    ];

    const statuses = ['New', 'Contacted', 'Qualified', 'Active', 'Converted'];
    const productTypes = ['ERC', 'STC', 'Tax Amendment', 'Audit Advisory', 'RDC', 'Partnership'];

    // Map the projectType to a product type
    let productType = null;
    if (type) {
      // Convert type to proper format (e.g., "tax-amendment" -> "Tax Amendment")
      const formattedType = type
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Find matching product type
      productType = productTypes.find(pt => pt.toLowerCase() === formattedType.toLowerCase());

      // If no exact match, try partial match
      if (!productType) {
        productType = productTypes.find(pt =>
          pt.toLowerCase().includes(type.toLowerCase()) ||
          type.toLowerCase().includes(pt.toLowerCase().replace(' ', ''))
        );
      }

      // Default to the original type if no match found
      if (!productType) {
        productType = formattedType;
      }
    }

    const dummyLeads = [];

    for (let i = 1; i <= 100; i++) {
      const companyIndex = Math.floor(Math.random() * companies.length);
      const company = companies[companyIndex];
      const statusIndex = Math.floor(Math.random() * statuses.length);

      // If no specific type is requested, assign random product type
      // Otherwise, use the specified product type
      const assignedProductType = productType || productTypes[Math.floor(Math.random() * productTypes.length)];

      dummyLeads.push({
        lead_id: `LD${String(i).padStart(3, '0')}`,
        business_legal_name: company.name,
        business_email: `info@${company.domain}`,
        business_phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        lead_status: statuses[statusIndex],
        created: new Date().toLocaleDateString(),
        employee_id: 'John Doe',
        internal_sales_agent: 'Sarah Smith',
        internal_sales_support: 'Mike Johnson',
        source: 'Website',
        campaign: 'Email Campaign',
        category: assignedProductType,
        product_type: assignedProductType,
        lead_group: assignedProductType,
        w2_count: Math.floor(Math.random() * 10) + 1
      });
    }

    // If a specific type was requested, filter the leads to only include that type
    if (type) {
      return dummyLeads;
    }

    return dummyLeads;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [sortField, setSortField] = useState('lead_id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isSearching, setIsSearching] = useState(false);


  // Define all available columns with groups based on API data structure
  const columnGroups = [
    {
      id: 'basic',
      title: 'Basic Information',
      columns: [
        { id: 'leadId', label: 'Lead #', field: 'lead_id', sortable: true },
        { id: 'date', label: 'Date', field: 'created', sortable: false },
        { id: 'businessName', label: 'Business Name', field: 'business_legal_name', sortable: true },
        { id: 'taxNowStatus', label: 'Lead Status', field: 'lead_status', sortable: true }
      ]
    },
    {
      id: 'contacts',
      title: 'Contact Information',
      columns: [
        { id: 'businessEmail', label: 'Email', field: 'business_email', sortable: false },
        { id: 'businessPhone', label: 'Phone', field: 'business_phone', sortable: false },
        { id: 'contactCard', label: 'Contact Card', field: 'contactCard', sortable: false }
      ]
    },
    {
      id: 'team',
      title: 'Team Information',
      columns: [
        { id: 'employee', label: 'Employee', field: 'employee_id', sortable: false },
        { id: 'salesAgent', label: 'Sales Agent', field: 'internal_sales_agent', sortable: false },
        { id: 'salesSupport', label: 'Sales Support', field: 'internal_sales_support', sortable: false }
      ]
    },
    {
      id: 'additional',
      title: 'Additional Information',
      columns: [
        { id: 'affiliateSource', label: 'Source', field: 'source', sortable: false },
        { id: 'leadCampaign', label: 'Campaign', field: 'campaign', sortable: false },
        { id: 'category', label: 'Category', field: 'category', sortable: false },
        { id: 'leadGroup', label: 'Lead Group', field: 'lead_group', sortable: false },
        { id: 'notes', label: 'Notes', field: 'notes', sortable: false },
        { id: 'bookACall', label: 'Book A Call', field: 'bookACall', sortable: false }
      ]
    }
  ];

  // Flatten all columns for easier access
  const allColumns = columnGroups.flatMap(group => group.columns);

  // Default visible columns
  const defaultVisibleColumns = ['leadId', 'date', 'businessName', 'taxNowStatus', 'businessEmail', 'businessPhone', 'notes', 'bookACall'];

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

  // Handle date filter application
  const handleApplyDateFilter = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1); // Reset to first page when filter changes

    // Show feedback toast
    if (start || end) {
      const message = start && end
        ? `Filtering leads from ${new Date(start).toLocaleDateString()} to ${new Date(end).toLocaleDateString()}`
        : start
          ? `Filtering leads from ${new Date(start).toLocaleDateString()}`
          : `Filtering leads until ${new Date(end).toLocaleDateString()}`;

      Swal.fire({
        title: 'Date Filter Applied',
        text: message,
        icon: 'info',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };





  // Filter leads based on search term, status, and date range
  const filteredLeads = leads.filter(lead => {
    // Skip filtering if no filters are applied
    if (searchTerm === '' && filterStatus === '' && !startDate && !endDate) {
      return true;
    }

    // Handle different possible field names in the API response
    const id = String(lead.id || lead.lead_id || '').toLowerCase();
    const name = String(lead.name || lead.business_name || lead.business_legal_name || '').toLowerCase();
    const email = String(lead.email || lead.business_email || '').toLowerCase();
    const phone = String(lead.phone || lead.business_phone || '');
    const status = String(lead.status || lead.lead_status || '');
    const signatory = String(lead.authorized_signatory_name || '').toLowerCase();
    const campaign = String(lead.campaign || '').toLowerCase();
    const source = String(lead.source || '').toLowerCase();
    const category = String(lead.category || '').toLowerCase();
    const leadGroup = String(lead.lead_group || '').toLowerCase();
    const salesAgent = String(lead.internal_sales_agent || '').toLowerCase();
    const salesSupport = String(lead.internal_sales_support || '').toLowerCase();
    const employeeId = String(lead.employee_id || '').toLowerCase();

    // Get the created date from the lead
    const createdDate = lead.created || lead.created_at || lead.date_created || '';

    // Check if search term matches any field
    const searchTermLower = searchTerm.toLowerCase().trim();

    const matchesSearch = searchTerm === '' ||
      id.includes(searchTermLower) ||
      name.includes(searchTermLower) ||
      email.includes(searchTermLower) ||
      phone.includes(searchTermLower) ||
      signatory.includes(searchTermLower) ||
      campaign.includes(searchTermLower) ||
      source.includes(searchTermLower) ||
      category.includes(searchTermLower) ||
      leadGroup.includes(searchTermLower) ||
      salesAgent.includes(searchTermLower) ||
      salesSupport.includes(searchTermLower) ||
      employeeId.includes(searchTermLower);

    // Check if status matches
    const matchesStatus = filterStatus === '' || status === filterStatus;

    // Check if date is within range
    let matchesDateRange = true;

    if (startDate || endDate) {
      // Try to parse the created date
      let leadDate;
      try {
        // First try to parse as ISO date
        leadDate = new Date(createdDate);

        // If invalid date, try to parse as MM/DD/YYYY
        if (isNaN(leadDate.getTime())) {
          const parts = createdDate.split('/');
          if (parts.length === 3) {
            // MM/DD/YYYY format
            leadDate = new Date(parts[2], parts[0] - 1, parts[1]);
          }
        }

        // If still invalid, don't include this lead in date-filtered results
        if (isNaN(leadDate.getTime())) {
          matchesDateRange = false;
        } else {
          // Set time to midnight for date comparison
          leadDate.setHours(0, 0, 0, 0);

          // Check start date
          if (startDate) {
            const startDateObj = new Date(startDate);
            startDateObj.setHours(0, 0, 0, 0);
            if (leadDate < startDateObj) {
              matchesDateRange = false;
            }
          }

          // Check end date
          if (endDate && matchesDateRange) {
            const endDateObj = new Date(endDate);
            endDateObj.setHours(0, 0, 0, 0);
            if (leadDate > endDateObj) {
              matchesDateRange = false;
            }
          }
        }
      } catch (e) {
        // If there's an error parsing the date, don't include this lead in date-filtered results
        matchesDateRange = false;
      }
    }

    // Return true if all conditions are met
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Sort the filtered leads
  const sortedLeads = sortArrayByKey(filteredLeads, sortField, sortDirection);

  // Get current leads for pagination
  const indexOfLastLead = currentPage * itemsPerPage;
  const indexOfFirstLead = indexOfLastLead - itemsPerPage;
  const currentLeads = sortedLeads.slice(indexOfFirstLead, indexOfLastLead);

  // Calculate total pages
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);

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
    // Confirm export with user if there are many leads
    if (filteredLeads.length > 100) {
      if (!confirm(`You are about to export ${filteredLeads.length} leads. This may take a moment. Continue?`)) {
        return;
      }
    }

    // Get visible columns and their data, excluding action columns that shouldn't be exported
    const columnsToExclude = ['bookACall', 'contactCard', 'notes'];
    const visibleColumnsData = allColumns.filter(column =>
      visibleColumns.includes(column.id) && !columnsToExclude.includes(column.id)
    );

    // Create headers from visible columns
    const headers = visibleColumnsData.map(column => column.label);

    // Create CSV data rows
    const csvData = filteredLeads.map(lead => {
      return visibleColumnsData.map(column => {
        // Handle special columns with custom rendering
        if (column.id === 'leadId') return lead.lead_id || '';
        if (column.id === 'date') return lead.created || '';
        if (column.id === 'businessName') {
          const businessName = lead.business_legal_name || '';
          return `"${businessName.replace(/"/g, '""')}"`; // Escape quotes
        }
        if (column.id === 'taxNowStatus') return lead.lead_status || '';
        if (column.id === 'businessEmail') return lead.business_email || '';
        if (column.id === 'businessPhone') return lead.business_phone || '';
        if (column.id === 'employee') return lead.employee_id || '';
        if (column.id === 'salesAgent') return lead.internal_sales_agent || '';
        if (column.id === 'salesSupport') return lead.internal_sales_support || '';
        if (column.id === 'affiliateSource') return lead.source || '';
        if (column.id === 'leadCampaign') return lead.campaign || '';
        if (column.id === 'category') return lead.category || '';
        if (column.id === 'leadGroup') return lead.lead_group || '';

        // Default case
        return '';
      });
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `lead_report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle export to PDF
  const exportToPDF = () => {
    try {
      // Confirm export with user if there are many leads
      if (filteredLeads.length > 100) {
        if (!confirm(`You are about to export ${filteredLeads.length} leads to PDF. This may take a moment and result in a large file. Continue?`)) {
          return;
        }
      }

      // Get visible columns and their data, excluding action columns that shouldn't be exported
      const columnsToExclude = ['bookACall', 'contactCard', 'notes'];
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
      doc.text('Lead Report', 15, 15);

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

      if (startDate || endDate) {
        const dateFilterText = startDate && endDate
          ? `Date range: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
          : startDate
            ? `Date from: ${new Date(startDate).toLocaleDateString()}`
            : `Date to: ${new Date(endDate).toLocaleDateString()}`;

        doc.text(dateFilterText, 15, yPos);
        yPos += 5;
      }

      // Create table data
      const tableColumn = visibleColumnsData.map(column => column.label);

      // Create table rows with data for visible columns
      const tableRows = filteredLeads.map(lead => {
        return visibleColumnsData.map(column => {
          // Handle special columns with custom rendering
          if (column.id === 'leadId') return lead.lead_id || '';
          if (column.id === 'date') return lead.created || '';
          if (column.id === 'businessName') return lead.business_legal_name || '';
          if (column.id === 'taxNowStatus') return lead.lead_status || '';
          if (column.id === 'businessEmail') return lead.business_email || '';
          if (column.id === 'businessPhone') return lead.business_phone || '';
          if (column.id === 'employee') return lead.employee_id || '';
          if (column.id === 'salesAgent') return lead.internal_sales_agent || '';
          if (column.id === 'salesSupport') return lead.internal_sales_support || '';
          if (column.id === 'affiliateSource') return lead.source || '';
          if (column.id === 'leadCampaign') return lead.campaign || '';
          if (column.id === 'category') return lead.category || '';
          if (column.id === 'leadGroup') return lead.lead_group || '';

          // Default case
          return '';
        });
      });

      // Calculate column widths based on number of columns
      const availableWidth = 270; // Approximate available width in mm for A4 landscape
      const defaultColumnWidth = Math.floor(availableWidth / visibleColumnsData.length);

      // Create column styles object
      const columnStyles = {};
      visibleColumnsData.forEach((_, index) => {
        columnStyles[index] = { cellWidth: defaultColumnWidth };
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
        },
        columnStyles: columnStyles
      });

      // Save the PDF with date in filename
      doc.save(`lead_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  // Handle export to Excel
  const exportToExcel = () => {
    try {
      // Confirm export with user if there are many leads
      if (filteredLeads.length > 100) {
        if (!confirm(`You are about to export ${filteredLeads.length} leads to Excel. This may take a moment. Continue?`)) {
          return;
        }
      }

      // Get visible columns and their data, excluding action columns that shouldn't be exported
      const columnsToExclude = ['bookACall', 'contactCard', 'notes'];
      const visibleColumnsData = allColumns.filter(column =>
        visibleColumns.includes(column.id) && !columnsToExclude.includes(column.id)
      );

      // Prepare data for Excel
      const excelData = filteredLeads.map(lead => {
        const rowData = {};

        // Add data for each visible column
        visibleColumnsData.forEach(column => {
          // Handle special columns with custom rendering
          if (column.id === 'leadId') rowData[column.label] = lead.lead_id || '';
          else if (column.id === 'date') rowData[column.label] = lead.created || '';
          else if (column.id === 'businessName') rowData[column.label] = lead.business_legal_name || '';
          else if (column.id === 'taxNowStatus') rowData[column.label] = lead.lead_status || '';
          else if (column.id === 'businessEmail') rowData[column.label] = lead.business_email || '';
          else if (column.id === 'businessPhone') rowData[column.label] = lead.business_phone || '';
          else if (column.id === 'employee') rowData[column.label] = lead.employee_id || '';
          else if (column.id === 'salesAgent') rowData[column.label] = lead.internal_sales_agent || '';
          else if (column.id === 'salesSupport') rowData[column.label] = lead.internal_sales_support || '';
          else if (column.id === 'affiliateSource') rowData[column.label] = lead.source || '';
          else if (column.id === 'leadCampaign') rowData[column.label] = lead.campaign || '';
          else if (column.id === 'leadCampaign') rowData[column.label] = lead.campaign || '';
          else if (column.id === 'category') rowData[column.label] = lead.category || '';
          else if (column.id === 'leadGroup') rowData[column.label] = lead.lead_group || '';
          else rowData[column.label] = '';
        });

        return rowData;
      });

      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths - default 15 characters for all columns
      const wscols = visibleColumnsData.map(() => ({ wch: 15 }));

      // Adjust specific column widths based on content type
      visibleColumnsData.forEach((column, index) => {
        if (column.id === 'leadId') wscols[index] = { wch: 10 };
        else if (column.id === 'businessName') wscols[index] = { wch: 25 };
        else if (column.id === 'date') wscols[index] = { wch: 12 };
        else if (column.id === 'taxNowStatus') wscols[index] = { wch: 15 };
        else if (column.id === 'actions') wscols[index] = { wch: 20 };
      });

      worksheet['!cols'] = wscols;

      // Add header styling
      const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellRef]) continue;

        worksheet[cellRef].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4285F4" } }
        };
      }

      // Create a workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Lead Report');

      // Add metadata
      const filterInfo = [];
      if (searchTerm) filterInfo.push(`Search: "${searchTerm}"`);
      if (filterStatus) filterInfo.push(`Status: ${filterStatus}`);
      if (startDate) filterInfo.push(`From: ${new Date(startDate).toLocaleDateString()}`);
      if (endDate) filterInfo.push(`To: ${new Date(endDate).toLocaleDateString()}`);

      const filterText = filterInfo.length > 0 ? ` (Filtered by ${filterInfo.join(', ')})` : '';

      workbook.Props = {
        Title: "Lead Report",
        Subject: `Lead Data${filterText}`,
        Author: "Occams Portal",
        CreatedDate: new Date()
      };

      // Generate Excel file and trigger download with date in filename
      XLSX.writeFile(workbook, `lead_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('Excel generation error:', error);
      alert('Error generating Excel file: ' + error.message);
    }
  };

  // The handleView function is no longer needed as we're using the ContactCard component





  return (

     <PageContainer title={`${product ? product.toUpperCase() + ' ' : ''}Lead Report`}>
                <ReportFilter
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  isSearching={isSearching}
                  setIsSearching={setIsSearching}
                  setCurrentPage={setCurrentPage}
                  startDate={startDate}
                  endDate={endDate}
                  handleApplyDateFilter={handleApplyDateFilter}
                  refreshData={fetchLeads}
                  loading={loading}
                  columnGroups={columnGroups}
                  visibleColumns={visibleColumns}
                  toggleColumnVisibility={toggleColumnVisibility}
                  resetToDefaultColumns={resetToDefaultColumns}
                  selectAllColumns={selectAllColumns}
                  exportToExcel={exportToExcel}
                  exportToPDF={exportToPDF}
                  exportToCSV={exportToCSV}
                />

                {/* Loading indicator */}
                {loading && (
                  <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading leads data...</p>
                  </div>
                )}

                {/* We've removed the error message as requested */}

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
                        {currentLeads.length > 0 ? (
                          currentLeads.map((lead, index) => (
                            <tr key={lead.lead_id || lead.id || index}>
                              {/* Render cells in the same order as the column definitions */}
                              {allColumns.map(column => {
                                // Only render columns that are in the visibleColumns array
                                if (!visibleColumns.includes(column.id)) {
                                  return null;
                                }

                                // Render different cell types based on column id
                                switch (column.id) {
                                  case 'leadId':
                                    return (
                                      <td key={column.id}>
                                        <Link
                                          to={`/lead-detail/${lead.lead_id}`}
                                          state={{ leadData: lead }}
                                          className="lead-link"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {lead.lead_id || ''}
                                        </Link>
                                      </td>
                                    );
                                  case 'date':
                                    return <td key={column.id}>{lead.created || ''}</td>;
                                  case 'businessName':
                                    return (
                                      <td key={column.id}>
                                        <Link
                                          to={`/lead-detail/${lead.lead_id}`}
                                          state={{ leadData: lead }}
                                          className="lead-link"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {lead.business_legal_name || ''}
                                        </Link>
                                      </td>
                                    );
                                  case 'businessEmail':
                                    return <td key={column.id}>{lead.business_email || ''}</td>;
                                  case 'businessPhone':
                                    return <td key={column.id}>{lead.business_phone || ''}</td>;
                                  case 'contactCard':
                                    return (
                                      <td key={column.id}>
                                        <ContactCard
                                          entity={lead}
                                          entityType="lead"
                                        />
                                      </td>
                                    );
                                  case 'affiliateSource':
                                    return <td key={column.id}>{lead.source || ''}</td>;
                                  case 'employee':
                                    return <td key={column.id}>{lead.employee_id || ''}</td>;
                                  case 'salesAgent':
                                    return <td key={column.id}>{lead.internal_sales_agent || ''}</td>;
                                  case 'salesSupport':
                                    return <td key={column.id}>{lead.internal_sales_support || ''}</td>;
                                  case 'taxNowStatus':
                                    return (
                                      <td key={column.id}>
                                        <span className={`badge ${
                                          lead.lead_status === 'New' ? 'bg-info' :
                                          lead.lead_status === 'Contacted' ? 'bg-primary' :
                                          lead.lead_status === 'Qualified' ? 'bg-warning' :
                                          lead.lead_status === 'Active' ? 'bg-success' :
                                          'bg-secondary'
                                        }`}>
                                          {lead.lead_status || ''}
                                        </span>
                                      </td>
                                    );
                                  case 'leadCampaign':
                                    return <td key={column.id}>{lead.campaign || ''}</td>;
                                  case 'category':
                                    return <td key={column.id}>{lead.category || ''}</td>;
                                  case 'leadGroup':
                                    return <td key={column.id}>{lead.lead_group || ''}</td>;
                                  case 'notes':
                                    return (
                                      <td key={column.id}>
                                        <Notes
                                          entityType="lead"
                                          entityId={lead.lead_id || lead.id || ''}
                                          entityName={lead.business_legal_name || ''}
                                        />
                                      </td>
                                    );
                                  case 'bookACall':
                                    // Get lead data for Calendly URL parameters
                                    const businessName = encodeURIComponent(lead.business_legal_name || '');
                                    const email = encodeURIComponent(lead.business_email || '');
                                    const phone = encodeURIComponent(lead.business_phone || '');

                                    // Construct Calendly URL with parameters
                                    const calendlyUrl = `https://calendly.com/occams-erc-experts/rmj?name=${businessName}&email=${email}&a1=${phone}`;

                                    return (
                                      <td key={column.id}>
                                        <div className="d-flex justify-content-center">
                                          <a
                                            href={calendlyUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-outline-primary"
                                            title="Book a Call"
                                          >
                                            <i className="fas fa-calendar-alt"></i>
                                          </a>
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
                              <div className="d-flex flex-column align-items-center">
                                <h5 className="text-dark" style={{ fontSize: '15px' }}>No records found</h5>
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
                    indexOfFirstItem={indexOfFirstLead}
                    indexOfLastItem={indexOfLastLead}
                    totalFilteredItems={filteredLeads.length}
                    totalItems={leads.length}
                    itemName="leads"
                  />
                )}
    </PageContainer>
  );
};

export default LeadReport;
