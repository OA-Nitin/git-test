import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Link } from 'react-router-dom';
import SortableTableHeader from './common/SortableTableHeader';
import { sortArrayByKey } from '../utils/sortUtils';
import './common/ReportStyle.css';
import './common/DateRangePicker.css';
import Notes from './common/Notes';
import ContactCard from './common/ContactCard';
import ReportFilter from './common/ReportFilter';
import ReportPagination from './common/ReportPagination';
import PageContainer from './common/PageContainer';
import { getFormattedUserData } from '../utils/userUtils';

// Product ID mapping
const productIdMap = {
  erc: 935,
  stc: 937,
  rdc: 932,
  partnership: 938,
  'tax-amendment': 936,
  'audit-advisory': 934,
  all: null, // to fetch all opportunities without filtering
};

const user = getFormattedUserData();

const OpportunityReport = ({ projectType }) => {
  // Get product from URL params
  const { product } = useParams();

  // State for API data
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get product ID from the product parameter or projectType prop
  const productId = productIdMap[product?.toLowerCase()] ?? productIdMap[projectType?.toLowerCase()] ?? null;

  useEffect(() => {
    // Set title based on product parameter or projectType prop
    const displayType = product || projectType;
    const reportTitle = displayType
      ? `${displayType.toUpperCase()} Opportunities Report - Occams Portal`
      : "Opportunities Report - Occams Portal";

    document.title = reportTitle;

    console.log('OpportunityReport useEffect triggered with product:', product, 'productId:', productId);
    setSearchTerm('');
    setEndDate('');
    setStartDate('');
    setCurrentPage(1);
    setDatePickerKey(prev => prev + 1);
    // Fetch opportunities from API
    fetchOpportunities();
  }, [product, projectType, productId]);

  // State to track if all records are loaded
  const [allRecordsLoaded, setAllRecordsLoaded] = useState(false);

  // Function to safely format a date
  const formatDate = (dateString) => {
    if (!dateString || dateString === '0000-00-00' || dateString === '0000-00-00 00:00:00') {
      return 'None';
    }

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'None';
      }

      return date.toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'});
    } catch (error) {
      console.error(`Error formatting date ${dateString}:`, error);
      return 'None';
    }
  };

  // Function to process API response data into our format
  const processOpportunityData = (data) => {
    if (!data) return [];

    // Log the first opportunity data for debugging
    if (data.length > 0) {
      console.log('Sample opportunity data from API:', data[0]);
    }

    return data.map(opp => {
      // Make sure we have a valid ID for the opportunity
      const opportunityId = opp.OpportunityID || '';
      if (!opportunityId) {
        console.warn('Warning: Opportunity has no ID:', opp);
      }

      return {
        id: opp.OpportunityID || '',
        opportunity_name: opp.OpportunityName || '',
        product: opp.productName || '',
        product_id: opp.product_ID || '',
        probability: opp.Probability ? `${opp.Probability}%` : '0%',
        stage: opp.milestoneName || opp.Stage || '',
        stage_status: opp.milestoneStatus || '',
        amount: opp.currencyName && opp.OpportunityAmount ?
          `${opp.currencyName}${parseFloat(opp.OpportunityAmount).toLocaleString()}` :
          opp.OpportunityAmount || '',
        created_date: formatDate(opp.CreatedAt),
        close_date: formatDate(opp.ExpectedCloseDate),
        last_activity: formatDate(opp.ModifiedAt),
        notes: opp.Description || '',
        lead_source: opp.AffiliateName || opp.LeadSource || opp.LeadGroup || '',
        business_name: opp.AccountName || opp.business_name || '',
        business_email: opp.business_email || '',
        raw_data: opp
      };
    });
  };

  // State to track retry attempts
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Generate fallback opportunity data if API fails
  const generateFallbackOpportunities = (type = null) => {
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

    const stages = ['Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
    const productTypes = ['ERC', 'STC', 'Tax Amendment', 'Audit Advisory', 'RDC', 'Partnership'];
    const currencies = ['$', '€', '£', '¥'];
    const probabilities = [0.1, 0.25, 0.5, 0.75, 0.9];

    // Map the type to a product type
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

    const dummyOpportunities = [];

    for (let i = 1; i <= 100; i++) {
      const companyIndex = Math.floor(Math.random() * companies.length);
      const company = companies[companyIndex];
      const stageIndex = Math.floor(Math.random() * stages.length);
      const probabilityIndex = Math.floor(Math.random() * probabilities.length);
      const currencyIndex = Math.floor(Math.random() * currencies.length);

      // If no specific type is requested, assign random product type
      // Otherwise, use the specified product type
      const assignedProductType = productType || productTypes[Math.floor(Math.random() * productTypes.length)];

      // Generate random dates
      const today = new Date();
      const createdDate = new Date(today);
      createdDate.setDate(today.getDate() - Math.floor(Math.random() * 90)); // Random date in last 90 days

      const closeDateOffset = Math.floor(Math.random() * 90) + 30; // 30-120 days in future
      const closeDate = new Date(today);
      closeDate.setDate(today.getDate() + closeDateOffset);

      const lastActivityDate = new Date(today);
      lastActivityDate.setDate(today.getDate() - Math.floor(Math.random() * 14)); // Random date in last 14 days

      dummyOpportunities.push({
        id: `OPP${String(i).padStart(3, '0')}`,
        opportunity_name: `${assignedProductType} Opportunity for ${company.name}`,
        business_name: company.name,
        product: assignedProductType,
        product_id: productIdMap[assignedProductType.toLowerCase().replace(' ', '-')] || '',
        probability: `${probabilities[probabilityIndex]}%`,
        stage: stages[stageIndex],
        stage_status: stages[stageIndex],
        amount: `${currencies[currencyIndex]}${(Math.floor(Math.random() * 100000) + 10000).toLocaleString()}`,
        created_date: formatDate(createdDate),
        close_date: formatDate(closeDate),
        last_activity: formatDate(lastActivityDate),
        notes: `Sample notes for ${company.name} opportunity`,
        lead_source: 'Website',
        business_email: `info@${company.domain}`
      });
    }

    // If a specific type was requested, filter the opportunities to only include that type
    if (type) {
      return dummyOpportunities;
    }

    return dummyOpportunities;
  };

  // Function to fetch opportunities from API with retry logic
  const fetchOpportunities = async (limit = 100, retryAttempt = 0) => {
    if (retryAttempt === 0) {
      setLoading(true);
      setError(null);
    }

    try {
      console.log(`Fetching opportunities from API (attempt ${retryAttempt + 1} of ${maxRetries + 1})...`);

      // Log which type of opportunities we're fetching (from URL param or prop)
      const reportType = product || projectType;
      console.log(`Fetching ${reportType ? reportType + ' ' : ''}opportunities from API...`);
      console.log('Using product ID:', productId);

      // Construct API URL with product_id parameter if available
      let apiUrl = 'https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/opportunities';
      if (productId) {
        apiUrl += `?product_id=${productId}`;
      }
      console.log(`Requesting opportunities from API endpoint: ${apiUrl}`);

      // Create a controller for aborting the request if needed
      const controller = new AbortController();

      // Set a timeout to abort the request - increase timeout with each retry
      const timeout = 10000 + (retryAttempt * 5000); // 10s, 15s, 20s, 25s
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log(`Request timed out after ${timeout/1000} seconds`);
      }, timeout);

      // Make the API request with abort controller
      const response = await axios.get(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        params: {
          _t: new Date().getTime() // Add timestamp to bust cache
        },
        signal: controller.signal,
        // Increase timeout with each retry
        timeout: timeout
      });

      // Clear the timeout since request completed successfully
      clearTimeout(timeoutId);

      // Process the response data
      let apiOpportunities = [];

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          console.log('Response.data is an array with', response.data.length, 'items');
          apiOpportunities = processOpportunityData(response.data);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          console.log('Response.data.data is an array with', response.data.data.length, 'items');
          apiOpportunities = processOpportunityData(response.data.data);
        }
      }

      console.log('Processed API Opportunities:', apiOpportunities.length);

      if (apiOpportunities.length > 0) {
        setOpportunities(apiOpportunities);
        setError(null);
        setRetryCount(0); // Reset retry count on success
        setAllRecordsLoaded(true);
      } else {
        console.log('No opportunities found in API response');
        const reportType = product || projectType;
        // Show no data available message
        if (reportType && reportType.toLowerCase() === 'all') {
          console.warn('No opportunities found in API response');
          setOpportunities([]);
          setError('No data available.');
        } else {
          console.warn(`No ${reportType ? reportType + ' ' : ''}opportunities found in API response`);
          setOpportunities([]);
          setError(`No ${reportType ? reportType + ' ' : ''}data available.`);
        }
      }

      return true; // Success
    } catch (err) {
      console.error(`Error fetching opportunities (attempt ${retryAttempt + 1}):`, err);

      // If we haven't reached max retries, try again with exponential backoff
      if (retryAttempt < maxRetries) {
        const nextRetryDelay = 1000 * Math.pow(2, retryAttempt); // 1s, 2s, 4s
        console.log(`Retrying in ${nextRetryDelay/1000} seconds...`);

        // Show retry message to user
        setError(`API request failed. Retrying (${retryAttempt + 1}/${maxRetries})...`);

        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, nextRetryDelay));
        return fetchOpportunities(limit, retryAttempt + 1);
      }

      // Max retries reached, show error
      setRetryCount(retryCount + 1);
      const reportType = product || projectType;

      // Show no data available message
      if (reportType && reportType.toLowerCase() === 'all') {
        setError(`Data is not available. Failed to fetch opportunities: ${err.message}.`);
        setOpportunities([]);
      } else {
        setError(`Data is not available. Failed to fetch ${reportType ? reportType + ' ' : ''}opportunities: ${err.message}.`);
        setOpportunities([]);
      }

      return false; // Failed
    } finally {
      if (retryAttempt === 0 || retryAttempt === maxRetries) {
        setLoading(false);
      }
    }
  };





  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isSearching, setIsSearching] = useState(false);
  const [datePickerKey, setDatePickerKey] = useState(0);

  // Define all available columns based on the image
  const columnGroups = [
    {
      id: 'basic',
      title: 'Basic Information',
      columns: [
        { id: 'id', label: 'ID', field: 'id', sortable: true },
        { id: 'opportunityName', label: 'Opportunity Name', field: 'opportunity_name', sortable: true },
        { id: 'businessName', label: 'Business Name', field: 'business_name', sortable: true },
        { id: 'product', label: 'Product', field: 'product', sortable: true },
        { id: 'probability', label: 'Probability', field: 'probability', sortable: true },
        { id: 'stage', label: 'Stage', field: 'stage_status', sortable: true },
        { id: 'amount', label: 'Amount', field: 'amount', sortable: true },
        { id: 'createdDate', label: 'Created Date', field: 'created_date', sortable: true },
        { id: 'closeDate', label: 'Close Date', field: 'close_date', sortable: true },
        { id: 'lastActivity', label: 'Last Activity', field: 'last_activity', sortable: true },
        { id: 'notes', label: 'Notes', field: 'notes', sortable: false },
        { id: 'leadSource', label: 'Lead Source', field: 'lead_source', sortable: true },
        // { id: 'action', label: 'Action', field: 'action', sortable: false }
      ]
    }
  ];

  // Flatten all columns for easier access
  const allColumns = columnGroups.flatMap(group => group.columns);

  // Default visible columns - showing only 8 columns like in LeadReport
  const defaultVisibleColumns = ['id', 'opportunityName', 'businessName', 'product', 'probability', 'stage', 'amount', 'notes'];

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
      // For id, default to descending (latest first), for others default to ascending
      setSortDirection(field === 'id' ? 'desc' : 'asc');
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
        ? `Filtering opportunities from ${new Date(start).toLocaleDateString()} to ${new Date(end).toLocaleDateString()}`
        : start
          ? `Filtering opportunities from ${new Date(start).toLocaleDateString()}`
          : `Filtering opportunities until ${new Date(end).toLocaleDateString()}`;

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

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const getProjectType = () => {
    // let type = opportunities.length > 0 ? opportunities[0].product : 'All';
    // type = type || 'All';

    // // Remove existing "Opportunities" word if already included
    // type = type.replace(/Opportunities$/i, '').trim();
    // type = type.replace(/\s+/g, '');  // remove spaces

    // return `${type}Opportunities`;
    const safeProduct = product?.toLowerCase() || 'all';
    return `${capitalize(safeProduct)}Opportunities`;
  };

  const userName = user?.display_name || user?.username || 'User';

  const getExportFileName = () => {
    const typeName = getProjectType();
    const dateStr = getFormattedDate();
    const safeUserName = userName.replace(/\s+/g, '_');
    return `${typeName}_${safeUserName}_${dateStr}`;
  };

  // Filter opportunities based on search term, status, and date range
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opportunity => {
      // Skip filtering if no filters are applied
      if (searchTerm === '' && filterStatus === '' && !startDate && !endDate) {
        return true;
      }

      // Handle different possible field names in the API response
      const id = String(opportunity.id || opportunity.opportunity_id || '').toLowerCase();
      const name = String(opportunity.opportunity_name || opportunity.name || '').toLowerCase();
      const businessName = String(opportunity.business_name || opportunity.AccountName || '').toLowerCase();
      const product = String(opportunity.product || '').toLowerCase();
      const probability = String(opportunity.probability || '').toLowerCase();
      const stage = String(opportunity.stage || '').toLowerCase();
      const stageStatus = String(opportunity.stage_status || '').toLowerCase();
      const amount = String(opportunity.amount || '').toLowerCase();
      const createdDate = String(opportunity.created_date || '').toLowerCase();
      const closeDate = String(opportunity.close_date || '').toLowerCase();
      const lastActivity = String(opportunity.last_activity || '').toLowerCase();
      const notes = String(opportunity.notes || '').toLowerCase();
      const leadSource = String(opportunity.lead_source || '').toLowerCase();

      // Check if search term matches any field
      const searchTermLower = searchTerm.toLowerCase().trim();

      // If search term contains multiple words, check if all words are present in any field
      const searchWords = searchTermLower.split(/\s+/).filter(word => word.length > 0);

      const matchesSearch = searchTerm === '' || (searchWords.length > 0 && searchWords.every(word =>
        id.includes(word) ||
        name.includes(word) ||
        businessName.includes(word) ||
        product.includes(word) ||
        probability.includes(word) ||
        stage.includes(word) ||
        stageStatus.includes(word) ||
        amount.includes(word) ||
        createdDate.includes(word) ||
        closeDate.includes(word) ||
        lastActivity.includes(word) ||
        notes.includes(word) ||
        leadSource.includes(word)
      ));

      // Check if status matches - look for the status in stage_status field
      const matchesStatus = filterStatus === '' || stageStatus.includes(filterStatus);

      // Check if date is within range
      let matchesDateRange = true;

      if (startDate || endDate) {
        // Try to parse the created date
        const createdDate = opportunity.created_date || opportunity.created_at || '';
        let opportunityDate;
        try {
          // First try to parse as ISO date
          opportunityDate = new Date(createdDate);

          // If invalid date, try to parse as MM/DD/YYYY
          if (isNaN(opportunityDate.getTime())) {
            const parts = createdDate.split('/');
            if (parts.length === 3) {
              // MM/DD/YYYY format
              opportunityDate = new Date(parts[2], parts[0] - 1, parts[1]);
            }
          }

          // If still invalid, don't include this opportunity in date-filtered results
          if (isNaN(opportunityDate.getTime())) {
            matchesDateRange = false;
          } else {
            // Set time to midnight for date comparison
            opportunityDate.setHours(0, 0, 0, 0);

            // Check start date
            if (startDate) {
              const startDateObj = new Date(startDate);
              startDateObj.setHours(0, 0, 0, 0);
              if (opportunityDate < startDateObj) {
                matchesDateRange = false;
              }
            }

            // Check end date
            if (endDate && matchesDateRange) {
              const endDateObj = new Date(endDate);
              endDateObj.setHours(0, 0, 0, 0);
              if (opportunityDate > endDateObj) {
                matchesDateRange = false;
              }
            }
          }
        } catch (e) {
          // If there's an error parsing the date, don't include this opportunity in date-filtered results
          matchesDateRange = false;
        }
      }

      // Return true if all conditions are met
      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [opportunities, searchTerm, filterStatus]);

  // Sort the filtered opportunities
  const sortedOpportunities = sortArrayByKey(filteredOpportunities, sortField, sortDirection);

  // Get current opportunities for pagination
  const indexOfLastOpportunity = currentPage * itemsPerPage;
  const indexOfFirstOpportunity = indexOfLastOpportunity - itemsPerPage;
  const currentOpportunities = sortedOpportunities.slice(indexOfFirstOpportunity, indexOfLastOpportunity);

  // Calculate total pages
  const totalPages = Math.ceil(sortedOpportunities.length / itemsPerPage);

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
    // Confirm export with user if there are many opportunities
    if (filteredOpportunities.length > 100) {
      if (!confirm(`You are about to export ${filteredOpportunities.length} opportunities. This may take a moment. Continue?`)) {
        return;
      }
    }

    // Get visible columns and their data, excluding action columns that shouldn't be exported
    const columnsToExclude = ['action', 'notes'];
    const visibleColumnsData = allColumns.filter(column =>
      visibleColumns.includes(column.id) && !columnsToExclude.includes(column.id)
    );

    // Create headers from visible columns
    const headers = visibleColumnsData.map(column => column.label);
    const escapeCSV = (value) => {
      if (value == null) return '';
      const stringValue = value.toString();
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('$')) {
        return `"${stringValue.replace(/"/g, '""')}"`;  // Escape internal quotes also
      }
      return stringValue;
    };
    // Create CSV data rows
    const csvData = filteredOpportunities.map(opportunity => {
      return visibleColumnsData.map(column => {
        // Handle special columns with custom rendering
        if (column.id === 'id') return opportunity.id || '';
        if (column.id === 'opportunityName') {
          const name = opportunity.opportunity_name || '';
          return `"${name.replace(/"/g, '""')}"`;  // Escape quotes
        }
        if (column.id === 'businessName') {
          const businessName = opportunity.business_name || '';
          return `"${businessName.replace(/"/g, '""')}"`;  // Escape quotes
        }
        if (column.id === 'product') return opportunity.product || '';
        if (column.id === 'probability') return opportunity.probability || '';
        if (column.id === 'stage') return opportunity.stage || '';
        if (column.id === 'amount') {
          const amount = opportunity.amount || '';
          return escapeCSV(amount);
        }
        if (column.id === 'createdDate') return opportunity.created_date || '';
        if (column.id === 'closeDate') return opportunity.close_date || '';
        if (column.id === 'lastActivity') return opportunity.last_activity || '';
        if (column.id === 'leadSource') return opportunity.lead_source || '';

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
      // Confirm export with user if there are many opportunities
      if (filteredOpportunities.length > 100) {
        if (!confirm(`You are about to export ${filteredOpportunities.length} opportunities to PDF. This may take a moment and result in a large file. Continue?`)) {
          return;
        }
      }

      // Get visible columns and their data, excluding action columns that shouldn't be exported
      const columnsToExclude = ['action', 'notes'];
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
      doc.text(`${capitalize(product?.toLowerCase() || 'all')} Opportunities`, 15, 15);

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
      const tableRows = filteredOpportunities.map(opportunity => {
        return visibleColumnsData.map(column => {
          // Handle special columns with custom rendering
          if (column.id === 'id') return opportunity.id || '';
          if (column.id === 'opportunityName') return opportunity.opportunity_name || '';
          if (column.id === 'businessName') return opportunity.business_name || '';
          if (column.id === 'product') return opportunity.product || '';
          if (column.id === 'probability') return opportunity.probability || '';
          if (column.id === 'stage') return opportunity.stage || '';
          if (column.id === 'amount') return opportunity.amount || '';
          if (column.id === 'createdDate') return opportunity.created_date || '';
          if (column.id === 'closeDate') return opportunity.close_date || '';
          if (column.id === 'lastActivity') return opportunity.last_activity || '';
          if (column.id === 'leadSource') return opportunity.lead_source || '';

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
      doc.save(`${getExportFileName()}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  // Handle export to Excel
  const exportToExcel = () => {
    try {
      // Confirm export with user if there are many opportunities
      if (filteredOpportunities.length > 100) {
        if (!confirm(`You are about to export ${filteredOpportunities.length} opportunities to Excel. This may take a moment. Continue?`)) {
          return;
        }
      }

      // Get visible columns and their data, excluding action columns that shouldn't be exported
      const columnsToExclude = ['action', 'notes'];
      const visibleColumnsData = allColumns.filter(column =>
        visibleColumns.includes(column.id) && !columnsToExclude.includes(column.id)
      );

      // Prepare data for Excel
      const excelData = filteredOpportunities.map(opportunity => {
        const rowData = {};

        // Add data for each visible column
        visibleColumnsData.forEach(column => {
          // Handle special columns with custom rendering
          if (column.id === 'id') rowData[column.label] = opportunity.id || '';
          else if (column.id === 'opportunityName') rowData[column.label] = opportunity.opportunity_name || '';
          else if (column.id === 'businessName') rowData[column.label] = opportunity.business_name || '';
          else if (column.id === 'product') rowData[column.label] = opportunity.product || '';
          else if (column.id === 'probability') rowData[column.label] = opportunity.probability || '';
          else if (column.id === 'stage') rowData[column.label] = opportunity.stage || '';
          else if (column.id === 'amount') rowData[column.label] = opportunity.amount || '';
          else if (column.id === 'createdDate') rowData[column.label] = opportunity.created_date || '';
          else if (column.id === 'closeDate') rowData[column.label] = opportunity.close_date || '';
          else if (column.id === 'lastActivity') rowData[column.label] = opportunity.last_activity || '';
          else if (column.id === 'leadSource') rowData[column.label] = opportunity.lead_source || '';
          else rowData[column.label] = '';
        });

        return rowData;
      });

      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, `${getProjectType()}`);

      // Generate Excel file and trigger download
      XLSX.writeFile(wb, `${getExportFileName()}.xlsx`);
    } catch (error) {
      console.error('Excel generation error:', error);
      alert('Error generating Excel file: ' + error.message);
    }
  };



  return (
    <PageContainer title={`${product ? product.toUpperCase() + ' ' : ''}Opportunities Report`}>
      <ReportFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        statusOptions={[
          { value: '', label: 'All Statuses' },
          { value: 'cancelled', label: 'Cancelled' },
          { value: 'completed', label: 'Completed' },
          { value: 'in progress', label: 'In Progress' },
          { value: 'pending', label: 'Pending' }
        ]}
        startDate={startDate}
        endDate={endDate}
        handleApplyDateFilter={handleApplyDateFilter}
        refreshData={fetchOpportunities}
        loading={loading}
        columnGroups={columnGroups}
        visibleColumns={visibleColumns}
        toggleColumnVisibility={toggleColumnVisibility}
        resetToDefaultColumns={resetToDefaultColumns}
        selectAllColumns={selectAllColumns}
        exportToExcel={exportToExcel}
        exportToPDF={exportToPDF}
        exportToCSV={exportToCSV}
        isSearching={isSearching}
        setIsSearching={setIsSearching}
        setCurrentPage={setCurrentPage}
        datePickerKey={datePickerKey}
      />

                {/* Loading indicator */}
                {loading && (
                  <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading opportunities data...</p>
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
                        {currentOpportunities.length > 0 ? (
                          currentOpportunities.map((opportunity, index) => (
                            <tr key={opportunity.id || index}>
                              {allColumns.map(column => {
                                // Only render columns that are in the visibleColumns array
                                if (!visibleColumns.includes(column.id)) {
                                  return null;
                                }

                                // Render different cell types based on column id
                                switch (column.id) {
                                  case 'id':
                                    return (
                                      <td key={column.id}>
                                        {/* <Link
                                          to={`/opportunity-detail/${opportunity.id}`}
                                          state={{ opportunityData: opportunity }}
                                          className="lead-link"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {opportunity.id || ''}
                                        </Link> */}
                                        {opportunity.id || ''}
                                      </td>
                                    );
                                  case 'opportunityName':
                                    return (
                                      <td key={column.id}>
                                        {/* <Link
                                          to={`/opportunity-detail/${opportunity.id}`}
                                          state={{ opportunityData: opportunity }}
                                          className="lead-link"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {opportunity.opportunity_name || ""}
                                        </Link> */}
                                        {opportunity.opportunity_name || ""}
                                      </td>
                                    );
                                  case 'businessName':
                                    return (
                                      <td key={column.id}>
                                        {opportunity.business_name || ""}
                                      </td>
                                    );
                                  case 'contactCard':
                                    return (
                                      <td key={column.id}>
                                        <ContactCard
                                          entity={opportunity}
                                          entityType="opportunity"
                                        />
                                      </td>
                                    );
                                  case 'product':
                                    return <td key={column.id}>{opportunity.product || ''}</td>;
                                  case 'probability':
                                    return <td key={column.id}>{opportunity.probability || ''}</td>;
                                  case 'stage':
                                    return (
                                      <td key={column.id}>
                                        <div>
                                          <span className={`badge ${
                                            opportunity.stage_status?.toLowerCase().includes('cancelled') ? 'bg-danger' :
                                            opportunity.stage_status?.toLowerCase().includes('completed') ? 'bg-success' :
                                            opportunity.stage_status?.toLowerCase().includes('in progress') ? 'bg-primary' :
                                            opportunity.stage_status?.toLowerCase().includes('pending') ? 'bg-warning' :
                                            'bg-secondary'
                                          }`}>
                                            {opportunity.stage_status || opportunity.stage || ''}
                                          </span>
                                          {opportunity.stage && opportunity.stage_status && opportunity.stage !== opportunity.stage_status && (
                                            <div className="small text-muted mt-1">{opportunity.stage}</div>
                                          )}
                                        </div>
                                      </td>
                                    );
                                  case 'amount':
                                    return <td key={column.id}>{opportunity.amount || ''}</td>;
                                  case 'createdDate':
                                    return <td key={column.id}>{opportunity.created_date || ''}</td>;
                                  case 'closeDate':
                                    return <td key={column.id}>{opportunity.close_date || ''}</td>;
                                  case 'lastActivity':
                                    return <td key={column.id}>{opportunity.last_activity || ''}</td>;
                                  case 'notes':
                                    return (
                                      <td key={column.id}>
                                        <Notes
                                          entityType="opportunity"
                                          entityId={opportunity.id || ''}
                                          entityName={opportunity.opportunity_name || opportunity.business_name || ''}
                                        />
                                      </td>
                                    );
                                  case 'leadSource':
                                    return <td key={column.id}>{opportunity.lead_source || ''}</td>;
                                  // case 'action':
                                  //   return (
                                  //     <td key={column.id} className="text-center">
                                  //       <div className="dropdown">
                                  //         <button
                                  //           className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                  //           type="button"
                                  //           data-bs-toggle="dropdown"
                                  //           aria-expanded="false"
                                  //         >
                                  //           <i className="fas fa-ellipsis-v"></i>
                                  //         </button>
                                  //         <ul className="dropdown-menu dropdown-menu-end">
                                  //           <li>
                                  //             <Link
                                  //               to={`/opportunity-detail/${opportunity.id}`}
                                  //               className="dropdown-item"
                                  //             >
                                  //               <i className="fas fa-eye me-2"></i> View Details
                                  //             </Link>
                                  //           </li>
                                  //           <li>
                                  //             <button
                                  //               className="dropdown-item"
                                  //               onClick={() => {
                                  //                 // Show a message directing the user to the Notes column
                                  //                 Swal.fire({
                                  //                   title: 'Notes',
                                  //                   text: 'Please use the Notes column to view notes for this opportunity.',
                                  //                   icon: 'info'
                                  //                 });
                                  //               }}
                                  //             >
                                  //               <i className="fas fa-eye me-2"></i> View Notes
                                  //             </button>
                                  //           </li>
                                  //           <li>
                                  //             <button
                                  //               className="dropdown-item"
                                  //               onClick={() => {
                                  //                 // Show a message directing the user to the Notes column
                                  //                 Swal.fire({
                                  //                   title: 'Notes',
                                  //                   text: 'Please use the Notes column to add notes for this opportunity.',
                                  //                   icon: 'info'
                                  //                 });
                                  //               }}
                                  //             >
                                  //               <i className="fas fa-plus me-2"></i> Add Note
                                  //             </button>
                                  //           </li>
                                  //         </ul>
                                  //       </div>
                                  //     </td>
                                  //   );
                                  default:
                                    return <td key={column.id}>{opportunity[column.field] || ''}</td>;
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
                    indexOfFirstItem={indexOfFirstOpportunity}
                    indexOfLastItem={indexOfLastOpportunity}
                    totalFilteredItems={filteredOpportunities.length}
                    totalItems={opportunities.length}
                    itemName="opportunities"
                    itemsPerPage={itemsPerPage}
                    setItemsPerPage={setItemsPerPage}
                    setCurrentPage={setCurrentPage}
                    additionalInfo={
                      <>
                        {!allRecordsLoaded && (
                          <span className="text-muted ms-1">(initial records loaded)</span>
                        )}
                        {retryCount > 0 && (
                          <span className="text-warning ms-1">(retry count: {retryCount})</span>
                        )}
                      </>
                    }
                  />
                )}
    </PageContainer>
  );
};

export default OpportunityReport;
