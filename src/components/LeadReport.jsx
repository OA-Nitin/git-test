import { useParams, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
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
import { getFormattedUserData } from '../utils/userUtils';

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

const productIdMap = {
 erc: 935,
  stc: 937,
  rdc: 932,
  partnership: 938,
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

    setSearchTerm('');
    setEndDate('');
    setStartDate('');
    setCurrentPage(1);
    setDatePickerKey(prev => prev + 1);
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

      // Define filterType early so it can be used throughout the function
      const filterType = product || projectType;

      // Construct API URL - always fetch all leads first, then filter client-side
      // This ensures we get data even if the server-side filtering has issues
      let apiUrl = 'https://portal.occamsadvisory.com/portal/wp-json/v1/leads';

      // For debugging: try with product_id parameter first, but fallback to all leads
      if (productId && filterType && filterType.toLowerCase() !== 'all') {
        apiUrl += `?product_id=${productId}`;
        console.log('Trying API call with product_id filter:', apiUrl);
      } else {
        console.log('Fetching all leads without server-side filtering:', apiUrl);
      }

      // Make the API request with proper headers
      let response;
      try {
        response = await axios.get(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 80000 // 80 second timeout
        });
        console.log('API Response:', response);
      } catch (apiError) {
        // If API call with product_id fails, try without it
        if (productId && apiUrl.includes('product_id')) {
          console.warn('API call with product_id failed, trying without filter:', apiError.message);
          const fallbackUrl = 'https://portal.occamsadvisory.com/portal/wp-json/v1/leads';
          response = await axios.get(fallbackUrl, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            timeout: 80000 // 80 second timeout
          });
          console.log('Fallback API Response:', response);
        } else {
          throw apiError; // Re-throw if it's not a product_id related issue
        }
      }

      // Check if we have a valid response with data
      if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
        // Use the data array from the API response
        let apiLeads = response.data.data;
        console.log('API Leads (before filtering):', apiLeads);

        // Filter leads by product parameter or project type prop if specified
        // filterType is already defined earlier in the function

        // Special case for "all" - don't filter the leads
        if (filterType && filterType.toLowerCase() !== 'all') {
          console.log('Filtering leads for specific type:', filterType);
          console.log('Product ID to match:', productId);
          console.log('Sample lead data for debugging:', apiLeads[0]);

          // If we have a specific product ID, filter by that first
          if (productId) {
            apiLeads = apiLeads.filter(lead => {
              const leadProductId = lead.product_id ? String(lead.product_id) : '';
              const matches = leadProductId === String(productId);
              if (!matches) {
                console.log(`Lead ${lead.lead_id} product_id: ${leadProductId} doesn't match expected: ${productId}`);
              }
              return matches;
            });
            console.log(`Filtered leads by product_id ${productId}:`, apiLeads.length, 'leads found');
          } else {
            // Fallback to text-based filtering if no product ID
            const originalCount = apiLeads.length;
            apiLeads = apiLeads.filter(lead => {
              // Check if the lead's category or product_type matches the filterType
              const category = (lead.category || '').toLowerCase();
              const productType = (lead.product_type || '').toLowerCase();
              const leadGroup = (lead.lead_group || '').toLowerCase();

              const typeToMatch = filterType.toLowerCase();

              // Match by text fields
              const matches = category.includes(typeToMatch) ||
                             productType.includes(typeToMatch) ||
                             leadGroup.includes(typeToMatch);

              if (!matches) {
                console.log(`Lead ${lead.lead_id} - category: "${category}", productType: "${productType}", leadGroup: "${leadGroup}" doesn't match: "${typeToMatch}"`);
              }

              return matches;
            });
            console.log(`Text-based filtering: ${originalCount} -> ${apiLeads.length} leads`);
          }

          console.log(`Final filtered leads for ${filterType}:`, apiLeads);
        } else if (filterType && filterType.toLowerCase() === 'all') {
          console.log('Showing all leads without filtering by type');
        }

        if (apiLeads.length > 0) {
          setLeads(apiLeads);
          setError(null); // Clear any previous error
        } else {
          // If filtering resulted in no leads, but we had original data, show all leads as fallback
          const originalLeads = response.data.data;
          if (originalLeads && originalLeads.length > 0 && filterType && filterType.toLowerCase() !== 'all') {
            console.warn(`No leads found after filtering for ${filterType}, showing all leads as fallback`);
            setLeads(originalLeads);
            setError(null);
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
  const [sortDirection, setSortDirection] = useState('desc'); // Changed to desc for latest leads first
  const [isSearching, setIsSearching] = useState(false);
  const [datePickerKey, setDatePickerKey] = useState(0);

  // Add a useEffect hook to reset search term when product/report type changes
  useEffect(() => {
    // Reset search term when product changes
    setSearchTerm('');
    setIsSearching(false);
    
    // Also reset other filters if needed
    setFilterStatus('');
    
    // Reset to first page
    setCurrentPage(1);
    
    console.log('Reset search and filters due to product change:', product);
  }, [product]); // This will run whenever the product/report type changes

  // Add another useEffect to reset search when the URL path changes
  const location = useLocation();
  useEffect(() => {
    // Reset search term when URL changes
    setSearchTerm('');
    setIsSearching(false);
    setFilterStatus('');
    setCurrentPage(1);
    
    console.log('Reset search and filters due to URL change');
  }, [location.pathname]); // This will run whenever the URL path changes

  // Add useEffect to log when date filters change
  useEffect(() => {
    console.log('Date filter changed - startDate:', startDate, 'endDate:', endDate);
    console.log('Total leads:', leads.length);
    
    if (startDate || endDate) {
      // Count how many leads match the date filter
      const matchingLeads = leads.filter(lead => {
        try {
          const createdDate = lead.created_at || lead.date_created || '';
          let leadDate = new Date(createdDate);
          
          if (isNaN(leadDate.getTime())) {
            const parts = createdDate.split('/');
            if (parts.length === 3) {
              leadDate = new Date(parts[2], parts[0] - 1, parts[1]);
            }
          }
          
          if (isNaN(leadDate.getTime())) {
            return false;
          }
          
          leadDate.setHours(0, 0, 0, 0);
          
          let matches = true;
          
          if (startDate) {
            const startDateObj = new Date(startDate);
            startDateObj.setHours(0, 0, 0, 0);
            if (leadDate < startDateObj) {
              matches = false;
            }
          }
          
          if (endDate && matches) {
            const endDateObj = new Date(endDate);
            endDateObj.setHours(23, 59, 59, 999);
            if (leadDate > endDateObj) {
              matches = false;
            }
          }
          
          return matches;
        } catch (e) {
          return false;
        }
      });
      
      console.log(`Date filter matches ${matchingLeads.length} leads out of ${leads.length}`);
      
      // Log a few sample leads with their dates for debugging
      if (leads.length > 0) {
        console.log('Sample lead dates:');
        leads.slice(0, 5).forEach(lead => {
          const createdDate = lead.created_at || lead.date_created || '';
          console.log(`Lead ${lead.lead_id}: ${createdDate}`);
        });
      }
    }
  }, [startDate, endDate, leads]);

  // Define all available columns with groups based on API data structure
  const columnGroups = [
    {
      id: 'basic',
      title: 'Basic Information',
      columns: [
        { id: 'leadId', label: 'Lead #', field: 'lead_id', sortable: true },
        { id: 'date', label: 'Date', field: 'created', sortable: false },
        { id: 'businessName', label: 'Business Name', field: 'business_legal_name', sortable: true },
        { id: 'currentMilestone', label: 'Current Milestone', field: 'current_milestone', sortable: true },
        { id: 'currentStage', label: 'Current Stage', field: 'current_stage', sortable: true }
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
        { id: 'leadGroup', label: 'Lead Group', field: 'lead_group', sortable: false },
        { id: 'notes', label: 'Notes', field: 'notes', sortable: false },
        // { id: 'bookACall', label: 'Book A Call', field: 'bookACall', sortable: false }
      ]
    }
  ];

  // Flatten all columns for easier access
  const allColumns = columnGroups.flatMap(group => group.columns);

  // Default visible columns - conditionally exclude milestone and stage for "all" reports
  const isAllReport = product?.toLowerCase() === 'all';
  const defaultVisibleColumns = isAllReport
    ? ['leadId', 'date', 'businessName', 'businessEmail', 'businessPhone', 'notes', 'bookACall']
    : ['leadId', 'date', 'businessName', 'currentMilestone', 'currentStage', 'businessEmail', 'businessPhone', 'notes', 'bookACall'];

  // State to track visible columns
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);

  // Update visible columns when product changes (to handle navigation between different report types)
  useEffect(() => {
    const isAllReport = product?.toLowerCase() === 'all';
    const newDefaultColumns = isAllReport
      ? ['leadId', 'date', 'businessName', 'businessEmail', 'businessPhone', 'notes', 'bookACall']
      : ['leadId', 'date', 'businessName', 'currentMilestone', 'currentStage', 'businessEmail', 'businessPhone', 'notes', 'bookACall'];
    setVisibleColumns(newDefaultColumns);
  }, [product]); // Re-run when product parameter changes

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
    const isAllReport = product?.toLowerCase() === 'all';
    const newDefaultColumns = isAllReport
      ? ['leadId', 'date', 'businessName', 'businessEmail', 'businessPhone', 'notes', 'bookACall']
      : ['leadId', 'date', 'businessName', 'currentMilestone', 'currentStage', 'businessEmail', 'businessPhone', 'notes', 'bookACall'];
    setVisibleColumns(newDefaultColumns);
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
      // For lead_id, default to descending (latest first), for others default to ascending
      setSortDirection(field === 'lead_id' ? 'desc' : 'asc');
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  // Handle date filter application
  const handleApplyDateFilter = (start, end) => {
    console.log('Raw date inputs:', { start, end });
    
    // Format dates consistently as YYYY-MM-DD
    let formattedStart = '';
    let formattedEnd = '';
    
    if (start) {
      try {
        const startDate = new Date(start);
        if (!isNaN(startDate.getTime())) {
          formattedStart = startDate.toISOString().split('T')[0];
        } else {
          console.error('Invalid start date:', start);
        }
      } catch (error) {
        console.error('Error parsing start date:', error);
      }
    }
    
    if (end) {
      try {
        const endDate = new Date(end);
        if (!isNaN(endDate.getTime())) {
          formattedEnd = endDate.toISOString().split('T')[0];
        } else {
          console.error('Invalid end date:', end);
        }
      } catch (error) {
        console.error('Error parsing end date:', error);
      }
    }
    
    console.log('Formatted dates:', { formattedStart, formattedEnd });
    
    // Update state with formatted dates
    setStartDate(formattedStart);
    setEndDate(formattedEnd);
    
    // Reset to first page
    setCurrentPage(1);
    
    // Show feedback toast
    if (formattedStart || formattedEnd) {
      let message;
      
      if (formattedStart && formattedEnd) {
        const startDisplay = new Date(formattedStart).toLocaleDateString();
        const endDisplay = new Date(formattedEnd).toLocaleDateString();
        message = `Filtering leads from ${startDisplay} to ${endDisplay}`;
      } else if (formattedStart) {
        const startDisplay = new Date(formattedStart).toLocaleDateString();
        message = `Filtering leads from ${startDisplay}`;
      } else {
        const endDisplay = new Date(formattedEnd).toLocaleDateString();
        message = `Filtering leads until ${endDisplay}`;
      }
      
      Swal.fire({
        title: 'Date Filter Applied',
        text: message,
        icon: 'info',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } else {
      // If both dates are cleared, show a message
      Swal.fire({
        title: 'Date Filter Cleared',
        text: 'Showing all leads without date filtering',
        icon: 'info',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
    
    // Log the filter application
    console.log(`Date filter applied: ${formattedStart} to ${formattedEnd}`);
  };

  // Add this debugging code near the top of your component
  useEffect(() => {
    if (searchTerm && leads.length > 0) {
      // Log the first few leads to see their structure
      console.log('Sample leads for debugging search:', leads.slice(0, 3));
      
      // Check if any leads have the search term in their ID
      const searchTermLower = searchTerm.toLowerCase().trim();
      const matchingLeads = leads.filter(lead => 
        String(lead.lead_id || lead.id || '').toLowerCase().includes(searchTermLower)
      );
      
      console.log(`Found ${matchingLeads.length} leads with ID matching "${searchTerm}":`, 
        matchingLeads.length > 0 ? matchingLeads.slice(0, 3) : 'None');
    }
  }, [searchTerm, leads]);

  // Add a helper function to parse dates consistently
  const parseLeadDate = (dateString) => {
    if (!dateString) return null;
    
    console.log(`Parsing date: "${dateString}"`);
    
    // Try different date formats
    let date;
    
    // Try as ISO date (YYYY-MM-DD)
    date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      console.log(`  Parsed as ISO: ${date.toISOString().split('T')[0]}`);
      return date;
    }
    
    // Try as MM/DD/YYYY
    const mmddyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const mmddyyyyMatch = dateString.match(mmddyyyy);
    if (mmddyyyyMatch) {
      const [_, month, day, year] = mmddyyyyMatch;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        console.log(`  Parsed as MM/DD/YYYY: ${date.toISOString().split('T')[0]}`);
        return date;
      }
    }
    
    // Try as M/D/YYYY
    const mdyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const mdyyyyMatch = dateString.match(mdyyyy);
    if (mdyyyyMatch) {
      const [_, month, day, year] = mdyyyyMatch;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        console.log(`  Parsed as M/D/YYYY: ${date.toISOString().split('T')[0]}`);
        return date;
      }
    }
    
    // Try as YYYY/MM/DD
    const yyyymmdd = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;
    const yyyymmddMatch = dateString.match(yyyymmdd);
    if (yyyymmddMatch) {
      const [_, year, month, day] = yyyymmddMatch;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        console.log(`  Parsed as YYYY/MM/DD: ${date.toISOString().split('T')[0]}`);
        return date;
      }
    }
    
    console.log(`  Failed to parse date: "${dateString}"`);
    return null;
  };

  const getFormattedDate = () => {
    const today = new Date();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${month}-${day}-${year}`; // MM-DD-YYYY
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  
  const getProjectType = () => {
    const safeProduct = product?.toLowerCase() || 'all';
    return `${capitalize(safeProduct)}Leads`;
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

  // Update the filteredLeads function to use our new date parsing helper
  const filteredLeads = useMemo(() => {
    console.log('Filtering leads with:', {
      searchTerm,
      filterStatus,
      startDate,
      endDate,
      totalLeads: leads.length
    });
    
    // Convert filter dates to Date objects once
    const startDateObj = startDate ? new Date(startDate) : null;
    const endDateObj = endDate ? new Date(endDate) : null;
    
    if (startDateObj) startDateObj.setHours(0, 0, 0, 0);
    if (endDateObj) endDateObj.setHours(23, 59, 59, 999);
    
    console.log('Filter date objects:', {
      startDate: startDateObj ? startDateObj.toISOString() : null,
      endDate: endDateObj ? endDateObj.toISOString() : null
    });
    
    return leads.filter(lead => {
      // Skip filtering if no filters are applied
      if (!searchTerm && !filterStatus && !startDate && !endDate) {
        return true;
      }
      
      // Search term filtering
      let matchesSearch = true;
      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase().trim();
        const normalizedSearchPhone = searchTerm.replace(/\D/g, '');
        const leadId = String(lead.lead_id || lead.id || '').toLowerCase();
        const name = String(lead.name || lead.business_name || lead.business_legal_name || '').toLowerCase();
        const email = String(lead.email || lead.business_email || '').toLowerCase();
        const phone = String(lead.business_phone || '').toLowerCase();
        const createdDate = String(lead.created_at || lead.date_created || lead.created || '').toLowerCase();
        const milestone = String(lead.current_milestone || '').toLowerCase();
        const stage = String(lead.current_stage || '').toLowerCase();
        const employee = String(lead.employee_id || '').toLowerCase();
        const salesAgent = String(lead.InternalSalesAgent || '').toLowerCase();
        const salesSupport = String(lead.InternalSalesSupport || '').toLowerCase();
        const affiliateSource = String(lead.source || '').toLowerCase();
        const leadCampaign = String(lead.campaign || '').toLowerCase();
        const leadGroup = String(lead.lead_group || '').toLowerCase();

        
        matchesSearch = 
          leadId.includes(searchTermLower) || 
          name.includes(searchTermLower) || 
          phone.includes(searchTermLower) ||
          (
            normalizedSearchPhone.length >= 4 &&  // 👉 Apply phone match only if search looks like a phone
            normalizePhone(phone).includes(normalizedSearchPhone)
          ) || email.includes(searchTermLower)
          || createdDate.includes(searchTermLower) ||
          milestone.includes(searchTermLower) ||
          stage.includes(searchTermLower) ||
          employee.includes(searchTermLower) ||
          salesAgent.includes(searchTermLower) ||
          salesSupport.includes(searchTermLower) ||
          affiliateSource.includes(searchTermLower) ||
          leadCampaign.includes(searchTermLower) ||
          leadGroup.includes(searchTermLower);
      }

      // Status filtering
      let matchesStatus = true;
      if (filterStatus) {
        const leadStatus = String(lead.status || '').toLowerCase();
        matchesStatus = leadStatus === filterStatus.toLowerCase();
      }
      
      // Date range filtering
      let matchesDateRange = true;
      if (startDateObj || endDateObj) {
        // Get the created date from various possible fields
        const createdDateStr = lead.created_at || lead.date_created || lead.created || '';
        const leadDate = parseLeadDate(createdDateStr);
        
        if (!leadDate) {
          console.log(`Lead ${lead.lead_id}: Invalid date "${createdDateStr}"`);
          matchesDateRange = false;
        } else {
          // Set to midnight for date comparison
          leadDate.setHours(0, 0, 0, 0);
          
          // Check if date is within range
          if (startDateObj && leadDate < startDateObj) {
            console.log(`Lead ${lead.lead_id}: Date ${leadDate.toISOString().split('T')[0]} is before start date ${startDateObj.toISOString().split('T')[0]}`);
            matchesDateRange = false;
          }
          
          if (endDateObj && leadDate > endDateObj) {
            console.log(`Lead ${lead.lead_id}: Date ${leadDate.toISOString().split('T')[0]} is after end date ${endDateObj.toISOString().split('T')[0]}`);
            matchesDateRange = false;
          }
        }
      }
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [leads, searchTerm, filterStatus, startDate, endDate]);

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
    // Use sorted leads to maintain the same order as displayed in the table
    const leadsToExport = sortedLeads;

    // Confirm export with user if there are many leads
    if (leadsToExport.length > 100) {
      if (!confirm(`You are about to export ${leadsToExport.length} leads. This may take a moment. Continue?`)) {
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

    // Create CSV data rows (using sorted leads to maintain descending order by lead_id)
    const csvData = leadsToExport.map(lead => {
      return visibleColumnsData.map(column => {
        // Handle special columns with custom rendering
        if (column.id === 'leadId') return lead.lead_id || '';
        if (column.id === 'date') return formatDate(lead.created) || '';
        if (column.id === 'businessName') {
          const businessName = lead.business_legal_name || '';
          return `"${businessName.replace(/"/g, '""')}"`; // Escape quotes
        }
        if (column.id === 'currentMilestone') return lead.current_milestone || '';
        if (column.id === 'currentStage') return lead.current_stage || '';
        if (column.id === 'businessEmail') return lead.business_email || '';
        if (column.id === 'businessPhone') return lead.business_phone || '';
        if (column.id === 'employee') return lead.employee_id || '';
        if (column.id === 'salesAgent') return lead.InternalSalesAgent || '';
        if (column.id === 'salesSupport') return lead.InternalSalesSupport || '';
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
    link.setAttribute('download', `${getExportFileName()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle export to PDF
  const exportToPDF = () => {
    try {
      // Use sorted leads to maintain the same order as displayed in the table
      const leadsToExport = sortedLeads;

      // Confirm export with user if there are many leads
      if (leadsToExport.length > 100) {
        if (!confirm(`You are about to export ${leadsToExport.length} leads to PDF. This may take a moment and result in a large file. Continue?`)) {
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

      // Create table rows with data for visible columns (using sorted leads to maintain descending order by lead_id)
      const tableRows = leadsToExport.map(lead => {
        return visibleColumnsData.map(column => {
          // Handle special columns with custom rendering
          if (column.id === 'leadId') return lead.lead_id || '';
          if (column.id === 'date') return formatDate(lead.created) || '';
          if (column.id === 'businessName') return lead.business_legal_name || '';
          if (column.id === 'currentMilestone') return lead.current_milestone || '';
          if (column.id === 'currentStage') return lead.current_stage || '';
          if (column.id === 'businessEmail') return lead.business_email || '';
          if (column.id === 'businessPhone') return lead.business_phone || '';
          if (column.id === 'employee') return lead.employee_id || '';
          if (column.id === 'salesAgent') return lead.InternalSalesAgent || '';
          if (column.id === 'salesSupport') return lead.InternalSalesSupport || '';
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
      doc.save(`${getExportFileName()}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  // Handle export to Excel
  const exportToExcel = () => {
    try {
      // Use sorted leads to maintain the same order as displayed in the table
      const leadsToExport = sortedLeads;

      // Confirm export with user if there are many leads
      if (leadsToExport.length > 100) {
        if (!confirm(`You are about to export ${leadsToExport.length} leads to Excel. This may take a moment. Continue?`)) {
          return;
        }
      }

      // Get visible columns and their data, excluding action columns that shouldn't be exported
      const columnsToExclude = ['bookACall', 'contactCard', 'notes'];
      const visibleColumnsData = allColumns.filter(column =>
        visibleColumns.includes(column.id) && !columnsToExclude.includes(column.id)
      );

      // Prepare data for Excel (using sorted leads to maintain descending order by lead_id)
      const excelData = leadsToExport.map(lead => {
        const rowData = {};

        // Add data for each visible column
        visibleColumnsData.forEach(column => {
          // Handle special columns with custom rendering
          if (column.id === 'leadId') rowData[column.label] = lead.lead_id || '';
          else if (column.id === 'date') rowData[column.label] = formatDate(lead.created) || '';
          else if (column.id === 'businessName') rowData[column.label] = lead.business_legal_name || '';
          else if (column.id === 'currentMilestone') rowData[column.label] = lead.current_milestone || '';
          else if (column.id === 'currentStage') rowData[column.label] = lead.current_stage || '';
          else if (column.id === 'businessEmail') rowData[column.label] = lead.business_email || '';
          else if (column.id === 'businessPhone') rowData[column.label] = lead.business_phone || '';
          else if (column.id === 'employee') rowData[column.label] = lead.employee_id || '';
          else if (column.id === 'salesAgent') rowData[column.label] = lead.InternalSalesAgent || '';
          else if (column.id === 'salesSupport') rowData[column.label] = lead.InternalSalesSupport || '';
          else if (column.id === 'affiliateSource') rowData[column.label] = lead.source || '';
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
        else if (column.id === 'currentMilestone') wscols[index] = { wch: 20 };
        else if (column.id === 'currentStage') wscols[index] = { wch: 20 };
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
      XLSX.writeFile(workbook, `${getExportFileName()}.xlsx`);
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
                  datePickerKey={datePickerKey}
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
                                    return <td key={column.id}>{formatDate(lead.created) || ''}</td>;
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
                                    return <td key={column.id}>{lead.InternalSalesAgent || ''}</td>;
                                  case 'salesSupport':
                                    return <td key={column.id}>{lead.InternalSalesSupport || ''}</td>;
                                  case 'currentMilestone':
                                    return <td key={column.id}>{lead.current_milestone || ''}</td>;
                                  case 'currentStage':
                                    return <td key={column.id}>{lead.current_stage || ''}</td>;
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
                                  // case 'bookACall':
                                  //   // Get lead data for Calendly URL parameters
                                  //   const businessName = encodeURIComponent(lead.business_legal_name || '');
                                  //   const email = encodeURIComponent(lead.business_email || '');
                                  //   const phone = encodeURIComponent(lead.business_phone || '');

                                  //   // Construct Calendly URL with parameters
                                  //   const calendlyUrl = `https://calendly.com/occams-erc-experts/rmj?name=${businessName}&email=${email}&a1=${phone}`;

                                  //   return (
                                  //     <td key={column.id}>
                                  //       <div className="d-flex justify-content-center">
                                  //         <a
                                  //           href={calendlyUrl}
                                  //           target="_blank"
                                  //           rel="noopener noreferrer"
                                  //           className="btn btn-sm btn-outline-primary"
                                  //           title="Book a Call"
                                  //         >
                                  //           <i className="fas fa-calendar-alt"></i>
                                  //         </a>
                                  //       </div>
                                  //     </td>
                                  //   );
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
