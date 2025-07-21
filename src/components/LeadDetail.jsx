import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import Select from 'react-select';
import Swal from 'sweetalert2';
import Notes from './common/Notes';
import { forwardRef } from "react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// import './common/CommonStyles.css';
import { hasRoleAccess, hasSpecificRole, isAdministrator, isEcheckClient } from '../utils/accessControl';
import './common/ReportStyle.css';
import './LeadDetail.css';
import { getAssetPath, getUserId } from '../utils/assetUtils';
import EditContactModal from './EditContactModal';
import AuditLogsMultiSection from './AuditLogsMultiSection';
import { format } from 'date-fns';
import useConfidentialUser from '../hooks/useConfidentialUser';

// Import tab components
import BusinessInfoTab from './lead-tabs/BusinessInfoTab';
import AffiliateCommissionTab from './lead-tabs/AffiliateCommissionTab';
import ContactsTab from './lead-tabs/ContactsTab';
import OpportunitiesTab from './lead-tabs/OpportunitiesTab';
import ProjectsTab from './lead-tabs/ProjectsTab';
import AuditLogsTab from './lead-tabs/AuditLogsTab';
import LeadClassificationAndAssignment from './common/LeadClassificationAndAssignment';
// ...import OpportunitiesTab and AuditLogsTab if you have them


// Date utility functions
const formatDateToMMDDYYYY = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};

const parseDateFromMMDDYYYY = (dateString) => {
  if (!dateString) return null;

  // Handle MM/DD/YYYY format
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Try parsing as regular date
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const ReadOnlyDateInput = forwardRef(({ value, onClick, onBlur }, ref) => (
  <input
    className="form-control"
    onClick={onClick}         // Calendar opens
    value={value}             // Show selected date
    onBlur={onBlur}
    readOnly                 // Prevent typing
    ref={ref}
    placeholder="MM/DD/YYYY"
    // style={{ cursor: "pointer", backgroundColor: "#fff" }}
  />
));

// Custom DateInput component
// const DateInput = ({ value, onChange, placeholder = "MM/DD/YYYY", className = "form-control", ...props }) => {
//   const [selectedDate, setSelectedDate] = useState(parseDateFromMMDDYYYY(value));

//   useEffect(() => {
//     setSelectedDate(parseDateFromMMDDYYYY(value));
//   }, [value]);

//   const handleDateChange = (date) => {
//     setSelectedDate(date);
//     const formattedDate = date ? formatDateToMMDDYYYY(date) : '';
//     onChange(formattedDate);
//   };
//   return (
//       <DatePicker
//         selected={selectedDate}
//         onChange={handleDateChange}
//         dateFormat="MM/dd/yyyy"
//         placeholderText={placeholder}
//         className={className}
//         autoComplete="off"
//         showPopperArrow={false}
//         popperClassName="custom-datepicker-popper"
//         {...props}
//       />
//     );
// };




// validations
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { leadDetailSchema } from './validationSchemas/leadSchema';
import { projectSchema } from './validationSchemas/leadSchema';




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
  const [companyFolderLink, setCompanyFolderLink] = useState('');
  const [documentFolderLink, setDocumentFolderLink] = useState('');
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [showLinkContactModal, setShowLinkContactModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactOptions, setContactOptions] = useState([]);
  const [linkContactError, setLinkContactError] = useState(null);
  const [linkContactLoading, setLinkContactLoading] = useState(false);
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
  const [unassignLoading, setUnassignLoading] = useState(false);
  const [isAssigningUser, setIsAssigningUser] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);
  const [isBusinessInfoData, setIsBusinessInfoData] = useState(false);
  const [isContactsData, setIsContactsData] = useState(false);
  const [isOpportunitiesData, setIsOpportunitiesData] = useState(false);
  const [isProjectsData, setIsProjectsData] = useState(false);

  const { confidenceUser } = useConfidentialUser();


  // Contacts related state
  const [primaryContact, setPrimaryContact] = useState({
    name: '',
    email: '',
    phone: '',
    ext: '',
    phoneType: '',
    title: '',
    middleName: '',
    initials: ''
  });
  const [secondaryContact, setSecondaryContact] = useState({
    name: '',
    email: '',
    phone: '',
    ext: '',
    phoneType: '',
    title: '',
    middleName: '',
    initials: ''
  });

  // State for all contacts
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);

  // State for edit contact modal
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [currentContactId, setCurrentContactId] = useState(null);

  // Projects related state
  const [projects, setProjects] = useState([]);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [projectFormData, setProjectFormData] = useState({
    projectID: '',
    project_name: '',
    project_fee: '',
    maximum_credit: '',
    estimated_fee: '',
    Milestone: '',
    MilestoneStage: '',
    ContactList: '',
    collaborators: []
  });

  // State for milestone stages
  const [milestoneStages, setMilestoneStages] = useState([]);
  const [projectUpdateLoading, setProjectUpdateLoading] = useState(false);
  const [projectUpdateSuccess, setProjectUpdateSuccess] = useState(false);
  const [projectUpdateError, setProjectUpdateError] = useState(null);

  // Opportunities related state
  const [opportunities, setOpportunities] = useState([]);
  const [showEditOpportunityModal, setShowEditOpportunityModal] = useState(false);
  const [currentOpportunity, setCurrentOpportunity] = useState(null);
  const [opportunityFormData, setOpportunityFormData] = useState({
    id: '',
    opportunity_name: '',
    lead_name: '',
    product: '',
    milestone: '',
    created_date: '',
    created_by: '',
    stage: '',
    currency: '',
    opportunity_amount: '',
    probability: '',
    expected_close_date: '',
    next_step: '',
    description: ''
  });
  const [opportunityUpdateLoading, setOpportunityUpdateLoading] = useState(false);
  const [opportunityUpdateSuccess, setOpportunityUpdateSuccess] = useState(false);
  const [opportunityUpdateError, setOpportunityUpdateError] = useState(null);
  const [milestones, setMilestones] = useState([]);

  // Delete opportunity related state
  const [deleteOpportunityLoading, setDeleteOpportunityLoading] = useState(false);

  // Notes related state (already defined above)
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState(null);

  // Lead classification state
  const [leadGroup, setLeadGroup] = useState(null);
  const [leadCampaign, setLeadCampaign] = useState(null);
  const [leadSource, setLeadSource] = useState(null);

  // Options for dropdowns
  const [groupOptions, setGroupOptions] = useState([]);
  const [campaignOptions, setCampaignOptions] = useState([]);
  const [sourceOptions, setSourceOptions] = useState([]);
  const [billingProfileOptions, setBillingProfileOptions] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Affiliate Commission state
  const [tier1CommissionBasis, setTier1CommissionBasis] = useState({ value: '', label: 'Select Commission Basis' });
  const [tier1ReferrerType, setTier1ReferrerType] = useState({ value: '', label: 'Select Commission Type' });
  const [tier1ReferrerFixed, setTier1ReferrerFixed] = useState('');
  const [referrer_percentage, setreferrer_percentage] = useState('');
  const [tier1InvoiceAmount, setTier1InvoiceAmount] = useState('');

  const [tier2CommissionBasis, setTier2CommissionBasis] = useState({ value: '', label: 'Select Commission Basis' });
  const [tier2CommissionType, setTier2CommissionType] = useState({ value: '', label: 'Select Commission Type' });
  const [tier2ReferrerFixed, setTier2ReferrerFixed] = useState('');
  const [tier2ErcChgReceived, setTier2ErcChgReceived] = useState('');
  const [tier2InvoiceAmount, setTier2InvoiceAmount] = useState('');

  const [tier3CommissionBasis, setTier3CommissionBasis] = useState({ value: '', label: 'Select Commission Basis' });
  const [tier3CommissionType, setTier3CommissionType] = useState({ value: '', label: 'Select Commission Type' });
  const [tier3ReferrerFixed, setTier3ReferrerFixed] = useState('');
  const [tier3ErcChgReceived, setTier3ErcChgReceived] = useState('');
  const [tier3InvoiceAmount, setTier3InvoiceAmount] = useState('');

  const [currentTier, setCurrentTier] = useState({ value: '', label: 'Select Current Tier' });

  // Affiliate Slab Commission state
  const [slab1AppliedOn, setSlab1AppliedOn] = useState('');
  const [slab1CommissionType, setSlab1CommissionType] = useState({ value: '', label: 'Select Commission Type' });
  const [slab1CommissionValue, setSlab1CommissionValue] = useState('');

  const [slab2AppliedOn, setSlab2AppliedOn] = useState('');
  const [slab2CommissionType, setSlab2CommissionType] = useState({ value: '', label: 'Select Commission Type' });
  const [slab2CommissionValue, setSlab2CommissionValue] = useState('');

  const [slab3AppliedOn, setSlab3AppliedOn] = useState('');
  const [slab3CommissionType, setSlab3CommissionType] = useState({ value: '', label: 'Select Commission Type' });
  const [slab3CommissionValue, setSlab3CommissionValue] = useState('');

  // Master Affiliate Commission state
  const [masterCommissionType, setMasterCommissionType] = useState({ value: '', label: 'Select Commission Type' });
  const [masterCommissionValue, setMasterCommissionValue] = useState('');

  // First, let's create a ref to store the contact data that won't be affected by re-renders
  const contactDataRef = useRef({
    primary: {
      name: '',
      middleName: '',
      title: '',
      email: '',
      phone: '',
      ext: '',
      phoneType: '',
      initials: ''
    },
    secondary: {
      name: '',
      middleName: '',
      title: '',
      email: '',
      phone: '',
      ext: '',
      phoneType: '',
      initials: ''
    }
  });

  // validation
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
    trigger,
  } = useForm({
    resolver: yupResolver(leadDetailSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    if (lead) {
      Object.keys(lead).forEach((key) => {
        setValue(key, lead[key], { shouldValidate: true });
      });

      // Also set primary contact form values if they exist
      if (primaryContact.email) {
        setValue('primary_contact_email', primaryContact.email, { shouldValidate: false });
      }
      if (primaryContact.phone) {
        setValue('primary_contact_phone', primaryContact.phone, { shouldValidate: false });
      }
      if (primaryContact.ext) {
        setValue('primary_contact_ext', primaryContact.ext, { shouldValidate: false });
      }
      if (primaryContact.phoneType) {
        setValue('contact_phone_type', primaryContact.phoneType, { shouldValidate: false });
      }
      if (lead) {
        setFormData({
          registration_date: lead.registration_date || '',
        });
      }

    }
  }, [lead, setValue, primaryContact]);



  const {
    register: registerProject,
    handleSubmit: handleSubmitProject,
    formState: { errors: projectErrors },
    setValue: setProjectValue,
    reset: resetProjectForm,
    watch: watchProject
  } = useForm({
    resolver: yupResolver(projectSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

    // Modify your useEffect to set form values based on the currently opened project edit form
    useEffect(() => {
      if (currentProject) {
      Object.keys(currentProject).forEach((key) => {
        // Map the field names if they are different
        const mappedKey = {
        id: 'projectID',
        projectName: 'project_name',
        fee: 'project_fee',
        maxCredit: 'maximum_credit',
        estFee: 'estimated_fee',
        milestone: 'Milestone',
        stage: 'MilestoneStage',
        contactId: 'ContactList',
        collaborator: 'collaborators'
        }[key] || key; // Use the mapped key or fallback to the original key

        setProjectValue(mappedKey, currentProject[key]);
      });
      }
    }, [currentProject, setProjectValue]);


  // Fetch lead data when leadId changes
  // Function to fetch groups from API
  const fetchGroups = async () => {
    try {
      setIsLoadingOptions(true);
      //console.log('Fetching groups...');
      const response = await axios.get('https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/iris-groups');

      //console.log('Groups API response:', response);

      //console.log('Groups API response structure:', JSON.stringify(response.data, null, 2));

      // Check if the response has data directly or nested under a data property
      if (response.data) {
        let groupsData = [];

        if (response.data.success && Array.isArray(response.data.data)) {
          // Format: { success: true, data: [...] }
          groupsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          // Format: [...]
          groupsData = response.data;
        } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          // Format: { key1: {...}, key2: {...} }
          groupsData = Object.values(response.data);
        }

        if (groupsData.length > 0) {
          // Try to map the data based on expected field names
          const groups = groupsData.map(group => ({
            value: group.group_id || group.id || '',
            label: group.group_name || group.name || group.title || ''
          }));

          //console.log('Setting group options:', groups);
          setGroupOptions(groups);

          // Prevent other API calls from overwriting the state
          await new Promise(resolve => setTimeout(resolve, 100));

          //console.log('Group options after setting:', groupOptions);
        } else {
          console.warn('No groups data found in response');
        }
      } else {
        console.warn('Failed to fetch groups:', response.data);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // function to fectch link contact list
  const fetchAvailableContacts = async () => {
    try {
      const response = await axios.get('https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/contacts');

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const contactOptions = response.data.data.map(contact => ({
          value: contact.contact_id,
          label: `${contact.name} (${contact.contact_id})`
        }));
        return contactOptions;
      }
      return [];
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
  };

  // State to track newly added contact ID
  const [newContactId, setNewContactId] = useState(null);

  // function to create link contact to lead
  const handleLinkContact = async () => {
    if (!selectedContact) {
      setLinkContactError('Please select a contact to link');
      return;
    }

    try {
      setLinkContactLoading(true);
      setLinkContactError(null);

      const requestData = {
        lead_id: leadId,
        contact_id: selectedContact.value
      };

      //console.log('Linking contact with data:', requestData);

      const response = await axios.post(
        'https://portal.occamsadvisory.com/portal/wp-json/eccom-op-contact/v1/link_contact_to_lead',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      //console.log('Link contact response:', response.data);

      // Store the newly added contact ID to highlight it
      setNewContactId(selectedContact.value);

      // Parse the response if it's a string (JSON)
      let responseData = response.data;
      if (typeof responseData === 'string') {
        try {
          responseData = JSON.parse(responseData);
        } catch (e) {
          console.error('Error parsing response:', e);
        }
      }

      if (responseData && responseData.code === 'success') {
        // Close the modal first
        setShowLinkContactModal(false);

        // Show success message immediately
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: responseData.message || 'Contact linked successfully'
        });

        // Highlight the contacts tab if not already active
        if (activeTab !== 'contacts') {
          setActiveTab('contacts');
        }

        // Refresh contacts list in the background
        // Store the contact ID to highlight after refresh
        const contactIdToHighlight = selectedContact.value;

        setTimeout(async () => {
          await fetchContactData(); // Refresh contacts list

          // Set the newContactId after the refresh to ensure it's highlighted
          setNewContactId(contactIdToHighlight);
        }, 500);
      } else if (response.data && response.data.success) {
        // Alternative success check
        // Close the modal first
        setShowLinkContactModal(false);

        // Show success message immediately
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Contact linked successfully'
        });

        // Highlight the contacts tab if not already active
        if (activeTab !== 'contacts') {
          setActiveTab('contacts');
        }

        // Refresh contacts list in the background
        // Store the contact ID to highlight after refresh
        const contactIdToHighlight = selectedContact.value;

        setTimeout(async () => {
          await fetchContactData(); // Refresh contacts list

          // Set the newContactId after the refresh to ensure it's highlighted
          setNewContactId(contactIdToHighlight);
        }, 500);
      } else {
        // Show error message
        setLinkContactError(responseData?.message || 'Failed to link contact');
      }
    } catch (error) {
      console.error('Error linking contact:', error);
      setLinkContactError(error.response?.data?.message || error.message || 'Failed to link contact. Please try again.');
    } finally {
      setLinkContactLoading(false);
    }
  };

  // Function to fetch campaigns from API
  const fetchCampaigns = async () => {
    try {
      setIsLoadingOptions(true);
      //console.log('Fetching campaigns...');
      const response = await axios.get('https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/iris-campaigns');

      //console.log('Campaigns API response:', response);

      //console.log('Campaigns API response structure:', JSON.stringify(response.data, null, 2));

      // Check if the response has data directly or nested under a data property
      if (response.data) {
        let campaignsData = [];

        if (response.data.success && Array.isArray(response.data.data)) {
          // Format: { success: true, data: [...] }
          campaignsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          // Format: [...]
          campaignsData = response.data;
        } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          // Format: { key1: {...}, key2: {...} }
          campaignsData = Object.values(response.data);
        }

        if (campaignsData.length > 0) {
          // Try to map the data based on expected field names
          const campaigns = campaignsData.map(campaign => ({
            value: campaign.campaign_id || campaign.id || '',
            label: campaign.campaign || campaign.name || campaign.title || ''
          }));

          //console.log('Setting campaign options:', campaigns);
          setCampaignOptions(campaigns);

          // Prevent other API calls from overwriting the state
          await new Promise(resolve => setTimeout(resolve, 100));

          //console.log('Campaign options after setting:', campaignOptions);
        } else {
          console.warn('No campaigns data found in response');
        }
      } else {
        console.warn('Failed to fetch campaigns:', response.data);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // Function to fetch sources from API
  const fetchSources = async () => {
    try {
      setIsLoadingOptions(true);
      //console.log('Fetching sources...');
      const response = await axios.get('https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/sources');

      //console.log('Sources API response:', response);

      //console.log('Sources API response structure:', JSON.stringify(response.data, null, 2));

      // Check if the response has data directly or nested under a data property
      if (response.data) {
        let sourcesData = [];

        if (response.data.success && Array.isArray(response.data.data)) {
          // Format: { success: true, data: [...] }
          sourcesData = response.data.data;
        } else if (Array.isArray(response.data)) {
          // Format: [...]
          sourcesData = response.data;
        } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          // Format: { key1: {...}, key2: {...} }
          sourcesData = Object.values(response.data);
        }

        if (sourcesData.length > 0) {
          // Try to map the data based on expected field names
          const sources = sourcesData.map(source => ({
            value: source.source_id || source.id || '',
            label: source.source || source.name || source.title || ''
          }));

          //console.log('Setting source options:', sources);
          setSourceOptions(sources);

          // Prevent other API calls from overwriting the state
          await new Promise(resolve => setTimeout(resolve, 100));

          //console.log('Source options after setting:', sourceOptions);
        } else {
          console.warn('No sources data found in response');
        }
      } else {
        console.warn('Failed to fetch sources:', response.data);
      }
    } catch (err) {
      console.error('Error fetching sources:', err);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // Function to fetch billing profiles from API
  const fetchBillingProfiles = async () => {
    try {
      setIsLoadingOptions(true);
      //console.log('Fetching billing profiles...');
      const response = await axios.get('https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/billing-profiles');

      //console.log('Billing Profiles API response:', response);

      if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
        const profilesData = response.data.data;

        if (profilesData.length > 0) {
          // Map the data using id as value and profile_name as label
          const profiles = profilesData.map(profile => ({
            value: profile.id.toString(),
            label: profile.profile_name
          }));

          //console.log('Setting billing profile options:', profiles);
          setBillingProfileOptions(profiles);
        } else {
          console.warn('No billing profiles found in response');
        }
      } else {
        console.warn('Failed to fetch billing profiles:', response.data);
      }
    } catch (err) {
      console.error('Error fetching billing profiles:', err);
    } finally {
      setIsLoadingOptions(false);
    }
  };



  useEffect(() => {
    document.title = `Lead #${leadId} - Occams Portal`;

    // Fetch dropdown options first, then fetch lead details
    const fetchAllData = async () => {
      try {
        //console.log('Starting to fetch dropdown options...');

        // First fetch all dropdown options
        await fetchGroups();
        //console.log('Groups fetched, now fetching campaigns...');

        await fetchCampaigns();
        //console.log('Campaigns fetched, now fetching sources...');

        await fetchSources();
        //console.log('Sources fetched, now fetching billing profiles...');

        await fetchBillingProfiles();
        //console.log('All dropdown options fetched successfully');

        // Add a small delay to ensure state updates have completed
        // await new Promise(resolve => setTimeout(resolve, 500));

        //console.log('Current dropdown options state:');
        //console.log('Group options:', groupOptions);
        //console.log('Campaign options:', campaignOptions);
        //console.log('Source options:', sourceOptions);
        //console.log('Billing profile options:', billingProfileOptions);

        // Then fetch lead details after dropdown options are loaded
        //console.log('Starting data fetch sequence for lead ID:', leadId);

        // Fetch basic lead details
        await fetchLeadDetails();
        //console.log('Basic lead details fetched');

        // Then fetch business data to populate the form
        
        await fetchBusinessData();
        
        //console.log('Business data fetched');

        // Fetch contact data
        await fetchContactData();
        //console.log('Contact data fetched');

        // Fetch project data
        // await fetchProjectData();
        //console.log('Project data fetched');

        // Also fetch affiliate commission data
        // await fetchAffiliateCommissionData();
        //console.log('Affiliate commission data fetched');

        // Fetch opportunities data
        // await fetchOpportunities();
        //console.log('Opportunities data fetched');

        // Fetch milestones data with default product_id
        // await fetchOpportunityMilestones('');
        //console.log('Opportunity milestones data fetched');

        //console.log('All data fetched successfully for lead ID:', leadId);

        // Check if the dropdown values are set correctly
        //console.log('Final state of dropdown values:');
        //console.log('SELECTED Lead Group:', leadGroup);
        //console.log('Lead Campaign:', leadCampaign);
        //console.log('Lead Source:', leadSource);
      } catch (error) {
        console.error('Error in data fetch sequence:', error);
      }
    };

    fetchAllData();
  }, [leadId]);

  // Add a useEffect to fetch group options separately to ensure they're loaded
  useEffect(() => {
    const loadGroupOptions = async () => {
      if (groupOptions.length === 0) {
        //console.log('Fetching group options separately...');
        try {
          await fetchGroups();
          //console.log('Group options loaded separately:', groupOptions);
        } catch (error) {
          console.error('Error loading group options separately:', error);
        }
      } else {
        //console.log('Group options already loaded:', groupOptions);
      }
    };

    loadGroupOptions();
  }, []);

  // Add a useEffect to log when dropdown values change
  useEffect(() => {
    //console.log('Dropdown values changed:');
    //console.log('Lead Group:', leadGroup);
    //console.log('Lead Campaign:', leadCampaign);
    //console.log('Lead Source:', leadSource);
  }, [leadGroup, leadCampaign, leadSource]);

  // Add a cleanup function to prevent state updates after unmounting
  useEffect(() => {
    let isMounted = true;

    // Return a cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // Ensure form values are synchronized with primaryContact state
  useEffect(() => {
    if (primaryContact.email) {
      setValue('primary_contact_email', primaryContact.email);
    }
    if (primaryContact.phone) {
      setValue('primary_contact_phone', primaryContact.phone);
    }
    if (primaryContact.ext) {
      setValue('primary_contact_ext', primaryContact.ext);
    }
    if (primaryContact.phoneType) {
      setValue('contact_phone_type', primaryContact.phoneType);
    }
  }, [primaryContact, setValue]);

  // We no longer need to fetch milestones when component loads
  // They are now fetched when the edit modals are opened

  // Reset onboarding status when signup status changes
  useEffect(() => {
    setTaxNowOnboardingStatus('');
  }, [taxNowSignupStatus]);

  // Ensure primary contact state is preserved during tab changes
  useEffect(() => {
    if (lead && lead.primary_contact_email && !primaryContact.email) {
      setPrimaryContact(prev => ({
        ...prev,
        email: lead.primary_contact_email || '',
        phone: lead.primary_contact_phone || '',
        ext: lead.primary_contact_ext || '',
        phoneType: lead.contact_phone_type || ''
      }));
    }
  }, [lead, primaryContact.email]);

  // Fetch notes when component loads
  useEffect(() => {
    if (lead && notes.length === 0) {
      fetchNotes();
    }
  }, [lead]);

  // Fetch user data when component loads
  useEffect(() => {
    if (leadId) {
      fetchUserData();
      fetchAssignedUsers();
      fetchOpportunities();
    }
  }, [leadId]);

  // Function to fetch assigned users
  const fetchAssignedUsers = async () => {
    try {
      //console.log('Fetching assigned users for lead ID:', leadId);
      setUnassignLoading(true);

      const response = await axios.get(`https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/lead-assign-user?lead_id=${leadId}`);

      //console.log('Assigned users API response:', response);
      //  && response.data.success && Array.isArray(response.data.data)
      if (response.data) {
        // Format the assigned users data
        const assignedUsersData = response.data.assign_user.map(user => ({
          id: user.user_id,
          name: user.display_name+" ("+user.user_role+") " || '',
          role: user.role || 'User'
        }));

        //console.log('Setting assigned users:', assignedUsersData);
        setAssignedUsers(assignedUsersData);
      } else {
        console.warn('No assigned users found or invalid response format');
        setAssignedUsers([]);
      }
    } catch (err) {
      console.error('Error fetching assigned users:', err);
      setAssignedUsers([]);
    } finally {
      setUnassignLoading(false);
    }
  };

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      //console.log('Fetching user data');
      setIsLoadingOptions(true);

      // Use the same API endpoint as the sales team
      const response = await axios.get('https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/erc-sales-team');

      //console.log('User data API response:', response);

      if (response.data) {
        let userData = [];

        if (response.data.success && Array.isArray(response.data.data)) {
          userData = response.data.data;
        } else if (Array.isArray(response.data)) {
          userData = response.data;
        } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          userData = Object.values(response.data);
        }

        if (userData.length > 0) {
          // Format options for react-select
          const options = userData.map(user => {
            // Use full_name if available, otherwise fall back to other name fields
            const displayName = user.full_name || user.name || user.display_name || user.user_name || '';

            // Make sure to use user_id as the primary identifier
            const userId = user.user_id || user.id || '';

            // Create the user object first for clarity
            const userObject = {
              id: userId,
              name: displayName,
              role: user.role || 'User'
            };

            // Log for debugging
            // console.log('Creating option for user:', {
            //   userId,
            //   displayName,
            //   userObject
            // });

            // Use plain text for label to make search work properly
            return {
              value: userId,
              label: displayName, // Plain text label for better search
              user: userObject
            };
          });

          //console.log('Setting user options:', options);
          setUserOptions(options);

          // Set assigned users if available in the lead data
          if (lead && lead.assigned_users && lead.assigned_users.length > 0) {
            setAssignedUsers(lead.assigned_users);
          }
        } else {
          console.warn('No user data found in response');
          setUserOptions([]);
          setAssignedUsers([]);
        }
      } else {
        console.warn('Failed to fetch user data:', response.data);
        setUserOptions([]);
        setAssignedUsers([]);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setUserOptions([]);
      setAssignedUsers([]);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const fetchBusinessData = async () => {

    try {
      // console.log('Fetching business data for lead ID:', leadId);
      const response = await axios.get(`https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/lead-business-data/${leadId}`);

      if (response.data && (response.data.success || response.data.status === 'success')) {
        // console.log('Business data fetched successfully:', response.data);
        setIsBusinessInfoData(true);
        // console.log(isBusinessInfoData);
        // Update lead state with business data
        const businessData = response.data.data;

        if (businessData) {
          // Map API response fields to lead state fields
          const mappedData = {
            business_legal_name: businessData.business_legal_name || '',
            doing_business_as: businessData.doing_business_as || '',
            category: businessData.business_category || '',
            website: businessData.website_url || '',
            authorized_signatory_name: businessData.authorized_signatory_name || '',
            business_phone: businessData.business_phone || '',
            business_email: businessData.business_email || '',
            business_title: businessData.business_title || '',
            business_address: businessData.street_address || businessData.business_address || '',
            city: businessData.city || businessData.business_city || '',
            state: businessData.state || businessData.business_state || '',
            zip: businessData.zip || businessData.business_zip || '',
            business_type: businessData.business_entity_type || '',
            business_type_other: businessData.if_other || '',
            registration_number: businessData.registration_number || '',
            registration_date: businessData.registration_date || '',
            state_of_registration: businessData.state_of_registration || '',
            ein: businessData.ein || '',
            tax_id_type: businessData.tax_id_type || '',
            billing_profile: businessData.billing_profile || '',
            taxnow_signup_status: businessData.taxnow_signup_status || '',
            taxnow_onboarding_status: businessData.taxnow_onboarding_status || '',
            company_folder_link: businessData.company_folder_link || '',
            document_folder_link: businessData.document_folder_link || '',
            lead_id: leadId
          };

          //console.log('Mapped business data:', mappedData);

          // Update lead state with mapped data
          setLead(prevLead => ({
            ...prevLead,
            ...mappedData
          }));

          // Update specific state variables
          setTaxNowSignupStatus(businessData.taxnow_signup_status || '');
          setTimeout(() => {
            setTaxNowOnboardingStatus(businessData.taxnow_onboarding_status || '');
          }, 100);
          // setTaxNowOnboardingStatus(businessData.taxnow_onboarding_status || '');

          // Update folder links if available
          setCompanyFolderLink(businessData.company_folder_link || '');
          setDocumentFolderLink(businessData.document_folder_link || '');

          // Update primary contact info if available
          if (businessData.primary_contact) {
            setPrimaryContact(prevContact => ({
              ...prevContact,
              name: businessData.primary_contact.name || prevContact.name,
              email: businessData.primary_contact.email || prevContact.email,
              phone: businessData.primary_contact.phone || prevContact.phone,
              ext: businessData.primary_contact.ext || prevContact.ext,
              phoneType: businessData.primary_contact.phone_type || prevContact.phoneType,
              initials: businessData.primary_contact.name ? businessData.primary_contact.name.split(' ').map(n => n[0]).join('') : prevContact.initials
            }));
          } else {
            // If no primary contact in API, try to create one from business data
            setPrimaryContact(prevContact => ({
              ...prevContact,
              email: businessData.business_email || prevContact.email,
              phone: businessData.business_phone || prevContact.phone,
            }));
          }

          // Update secondary contact info if available
          if (businessData.secondary_contact) {
            setSecondaryContact(prevContact => ({
              ...prevContact,
              name: businessData.secondary_contact.name || prevContact.name,
              email: businessData.secondary_contact.email || prevContact.email,
              phone: businessData.secondary_contact.phone || prevContact.phone,
              initials: businessData.secondary_contact.name ? businessData.secondary_contact.name.split(' ').map(n => n[0]).join('') : prevContact.initials
            }));
          }

          //console.log('Lead state updated with business data:', mappedData);
        }
      } else {
        console.warn('Failed to fetch business data:', response.data);
      }
    } catch (err) {
      console.error('Error fetching business data:', err);
    }
  };

  // Helper function to format API values into readable labels
  const formatLabel = (value) => {
    if (!value) return '';

    // Convert snake_case or kebab-case to Title Case
    return value
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const fetchAffiliateCommissionData = async () => {
    try {
      //console.log('Fetching affiliate commission data for lead ID:', leadId);
      const response = await axios.get(`https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/lead-affiliate-commission-data/${leadId}`);

      if (response.data && (response.data.status === 'success' || response.data.success)) {
        //console.log('Affiliate commission data fetched successfully:', response.data);

        // Update affiliate commission state with data
        // Handle both array and object response formats
        const commissionData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data;

        //console.log('Commission data to process:', commissionData);

        if (commissionData) {
          // Update Tier 1 Commission data
          if (commissionData.affiliate_commision_basis) {
            setTier1CommissionBasis({
              value: commissionData.affiliate_commision_basis,
              label: formatLabel(commissionData.affiliate_commision_basis)
            });
          }

          if (commissionData.affiliate_commision_type) {
            setTier1ReferrerType({
              value: commissionData.affiliate_commision_type,
              label: formatLabel(commissionData.affiliate_commision_type)
            });
          }

          setTier1ReferrerFixed(commissionData.referrer_fixed || '');
          setreferrer_percentage(commissionData.referrer_percentage || '');
          setTier1InvoiceAmount(commissionData.referrer_percentage2 || '');

          // Update Tier 2 Commission data
          if (commissionData.tier2_affiliate_commision_basis) {
            setTier2CommissionBasis({
              value: commissionData.tier2_affiliate_commision_basis,
              label: formatLabel(commissionData.tier2_affiliate_commision_basis)
            });
          }

          if (commissionData.tier2_affiliate_commision_type) {
            setTier2CommissionType({
              value: commissionData.tier2_affiliate_commision_type,
              label: formatLabel(commissionData.tier2_affiliate_commision_type)
            });
          }

          setTier2ReferrerFixed(commissionData.tier2_referrer_fixed || '');
          setTier2ErcChgReceived(commissionData.tier2_referrer_percentage || '');
          setTier2InvoiceAmount(commissionData.tier2_referrer_percentage2 || '');

          // Update Tier 3 Commission data
          if (commissionData.tier3_affiliate_commision_basis) {
            setTier3CommissionBasis({
              value: commissionData.tier3_affiliate_commision_basis,
              label: formatLabel(commissionData.tier3_affiliate_commision_basis)
            });
          }

          if (commissionData.tier3_affiliate_commision_type) {
            setTier3CommissionType({
              value: commissionData.tier3_affiliate_commision_type,
              label: formatLabel(commissionData.tier3_affiliate_commision_type)
            });
          }

          setTier3ReferrerFixed(commissionData.tier3_referrer_fixed || '');
          setTier3ErcChgReceived(commissionData.tier3_referrer_percentage || '');
          setTier3InvoiceAmount(commissionData.tier3_referrer_percentage2 || '');

          // Update Current Tier
          if (commissionData.current_tier) {
            setCurrentTier({
              value: commissionData.current_tier,
              label: formatLabel(commissionData.current_tier)
            });
          }

          // Update Slab 1 Commission data
          setSlab1AppliedOn(commissionData.slab1_applied_on || '');
          if (commissionData.slab1_commision_type) {
            setSlab1CommissionType({
              value: commissionData.slab1_commision_type,
              label: formatLabel(commissionData.slab1_commision_type)
            });
          }
          setSlab1CommissionValue(commissionData.slab1_commision_value || '');

          // Update Slab 2 Commission data
          setSlab2AppliedOn(commissionData.slab2_applied_on || '');
          if (commissionData.slab2_commision_type) {
            setSlab2CommissionType({
              value: commissionData.slab2_commision_type,
              label: formatLabel(commissionData.slab2_commision_type)
            });
          }
          setSlab2CommissionValue(commissionData.slab2_commision_value || '');

          // Update Slab 3 Commission data
          setSlab3AppliedOn(commissionData.slab3_applied_on || '');
          if (commissionData.slab3_commision_type) {
            setSlab3CommissionType({
              value: commissionData.slab3_commision_type,
              label: formatLabel(commissionData.slab3_commision_type)
            });
          }
          setSlab3CommissionValue(commissionData.slab3_commision_value || '');

          // Update Master Affiliate Commission data
          if (commissionData.master_commision_type) {
            setMasterCommissionType({
              value: commissionData.master_commision_type,
              label: formatLabel(commissionData.master_commision_type)
            });
          }
          setMasterCommissionValue(commissionData.master_referrer_fixed || commissionData.master_referrer_percentage || '');

          //console.log('Affiliate commission state updated with data');
        }
      } else {
        console.warn('Failed to fetch affiliate commission data:', response.data);
      }
    } catch (err) {
      console.error('Error fetching affiliate commission data:', err);
    }
  };

  // Function to handle edit contact
  const handleEditContact = (contactId) => {
    // Set the contact ID
    setCurrentContactId(contactId);

    // Show the modal
    setShowEditContactModal(true);

    // The loading overlay is handled within the EditContactModal component
  };

  // Function to close the edit contact modal
  const handleCloseEditContactModal = () => {
    setShowEditContactModal(false);
    setCurrentContactId(null);
    // Refresh contact data after closing the modal
    fetchContactData();
  };

  // Function to handle disable contact
  const handleDisableContact = (contactId, contactName) => {
    // Show confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      html: `You want to disable the contact '${contactName}'?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF6B00',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, disable it!',
      cancelButtonText: 'Cancel',
      buttonsStyling: true,
      customClass: {
        actions: 'swal2-actions-custom',
        confirmButton: 'swal2-styled swal2-confirm',
        cancelButton: 'swal2-styled swal2-cancel'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Call API to disable contact
        disableContact(contactId);
      }
    });
  };

  // Function to disable contact via API
  const disableContact = async (contactId) => {
    try {
      // Show loading state
      Swal.fire({
        title: 'Disabling contact...',
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Call the API to disable the contact
      const response = await axios.delete(`https://portal.occamsadvisory.com/portal/wp-json/eccom-op-contact/v1/contactinone/${contactId}`);

      //console.log('Disable contact API response:', response);

      // Check if the API call was successful
      if (response.data && JSON.parse(response.data).code=="success") {
        // Show success message
        Swal.fire({
          title: 'Success!',
          text: 'Contact has been disabled successfully.',
          icon: 'success',
          confirmButtonColor: '#4CAF50'
        });

        // Refresh contact data
        fetchContactData();
      } else {
        // Show error message
        Swal.fire({
          title: 'Error!',
          text: response.data?.message || 'Failed to disable contact.',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error('Error disabling contact:', error);

      // Show error message
      Swal.fire({
        title: 'Error!',
        text: error.message || 'An error occurred while disabling the contact.',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  };

  const fetchContactData = async () => {
    try {
      //console.log('Fetching contact data for lead ID:', leadId);
      setContactsLoading(true);

      // Make the API call with a cache-busting parameter to ensure fresh data
      const timestamp = new Date().getTime();
      const response = await axios.get(
        `https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/lead-contact-data/${leadId}?_=${timestamp}`
      );

      if (response.data && response.data.status === 'success') {
        setIsContactsData(true);
        console.log('Contact data fetched successfully satya:', response.data);

        // Store all contacts in state
        if (response.data.contacts && Array.isArray(response.data.contacts)) {
          // Filter out duplicate contacts based on contact_id
          const uniqueContacts = response.data.contacts.reduce((acc, current) => {
            const x = acc.find(item => item.contact_id === current.contact_id);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, []);

          //console.log('Filtered unique contacts:', uniqueContacts);

          // Update the contacts state with the unique contacts
          setContacts(uniqueContacts);

          // Find primary contact
          const primaryContactData = uniqueContacts.find(contact =>
            contact.contact_type === 'primary');

          //console.log('Found primary contact data:', primaryContactData);

          // Update primary contact state if found
          if (primaryContactData) {
            const updatedPrimaryContact = {
              name: primaryContactData.name || '',
              middleName: primaryContactData.middle_name || '',
              title: primaryContactData.title || '',
              email: primaryContactData.email || '',
              phone: primaryContactData.phone || '',
              ext: primaryContactData.ph_extension || '',
              phoneType: primaryContactData.phone_type || '',
              initials: primaryContactData.name ? primaryContactData.name.split(' ').map(n => n[0]).join('') : ''
            };
            
            //console.log('Updating primary contact to:', updatedPrimaryContact);
            setPrimaryContact(updatedPrimaryContact);
            
            // Also update the ref
            contactDataRef.current.primary = updatedPrimaryContact;
            //console.log('Updated primary contact ref:', contactDataRef.current.primary);
          }

          // Find secondary contact
          const secondaryContactData = uniqueContacts.find(contact =>
            contact.contact_type === 'secondary');

          // Update secondary contact state if found
          if (secondaryContactData) {
            const updatedSecondaryContact = {
              name: secondaryContactData.name || '',
              middleName: secondaryContactData.middle_name || '',
              title: secondaryContactData.title || '',
              email: secondaryContactData.email || '',
              phone: secondaryContactData.phone || '',
              ext: secondaryContactData.ph_extension || '',
              phoneType: secondaryContactData.phone_type || '',
              initials: secondaryContactData.name ? secondaryContactData.name.split(' ').map(n => n[0]).join('') : ''
            };
            
            setSecondaryContact(updatedSecondaryContact);
            
            // Also update the ref
            contactDataRef.current.secondary = updatedSecondaryContact;
          }
        }
        
        setContactsLoading(false);
        return true;
      } else {
        console.warn('Failed to fetch contact data:', response.data);
        setContactsLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Error fetching contact data:', err);
      setContactsLoading(false);
      return false;
    }
  };

  const fetchProjectData = async () => {
    try {
      //console.log('Fetching project data for lead ID:', leadId);
      const response = await axios.get(`https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/lead-project-data/${leadId}/0`);

      //console.log('Project API raw response:', response);

      // Check for success in different response formats
      if (response.data && (response.data.status === 'success' || response.data.success)) {
        setIsProjectsData(true);
        //console.log('Project data fetched successfully');

        // Log the raw data structure to understand the API response format
        //console.log('Raw project data structure:', JSON.stringify(response.data, null, 2));

        // Get the data array from the response
        let projectsData = [];
        if (response.data.data && Array.isArray(response.data.data)) {
          projectsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          projectsData = response.data;
        }

        if (projectsData.length > 0) {
          // Log the first project to understand its structure
          //console.log('First project raw data:', JSON.stringify(projectsData[0], null, 2));

          // Filter out projects with product IDs 936 (Tax Amendment), 938 (Partnership), and 934 (Audit Advisory)
          const filteredProjectsData = projectsData.filter(project => {
            const productId = project.product_id || project.productId;
            //console.log(productId);
            // Hide projects with product ID 936 (Tax Amendment), 938 (Partnership), and 934 (Audit Advisory)
            return productId;
          });

          //console.log('Filtered projects (excluding 936, 934):', filteredProjectsData.length);

          // Map API response to our projects state format with careful field mapping
          const mappedProjects = filteredProjectsData.map(project => {
            // Create a mapped project object with all possible field names
            const mappedProject = {
              id: project.project_id || project.id || '',
              businessName: project.business_legal_name || project.business_name || project.businessName || '',
              projectName: project.project_name || project.name || '',
              productName: project.product_name || project.productName || '',
              productId: project.product_id || project.productId || '',
              milestone: project.milestone || project.milestoneName || '',
              milestoneId: project.milestone_id || project.milestoneId || '',
              stage: project.stage_name || project.stageName || project.stage || '',
              stageId: project.milestone_stage_id || project.stageId || '',
              fee: project.project_fee || project.fee || '',
              maxCredit: project.maximum_credit || project.maxCredit || '',
              estFee: project.estimated_fee || project.estFee || '',
              actualFee: project.actual_fee || project.actualFee || '',
              actualCredit: project.actual_credit || project.actualCredit || '',
              collaborator: project.collaborator || project.collaboratorName || '',
              contactId: project.contact_id || project.contactId || ''
            };

            //console.log('Mapped project:', mappedProject);
            return mappedProject;
          });

          setProjects(mappedProjects);
          //console.log('Projects state updated with mapped data:', mappedProjects);
        } else {
          console.warn('No projects found in the response');
          setProjects([]);
        }
      } else {
        console.warn('Failed to fetch project data:', response.data);
        setProjects([]);
      }
    } catch (err) {
      console.error('Error fetching project data:', err);
      setProjects([]);
    }
  };

  // We've removed the duplicate functions for fetching dropdown options
  // These options are now fetched using fetchGroups, fetchCampaigns, and fetchSources functions

  // Add state for product_id
  const [leadProductId, setLeadProductId] = useState('');

  const fetchLeadDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // If we have lead data passed from the report page, use it
      if (passedLeadData) {
        //console.log('Using passed lead data:', passedLeadData);
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
        // Fetch lead data from the API
        //console.log('Fetching lead data from API for lead ID:', leadId);

        try {
          //console.log('Fetching lead data from API with lead_id:', leadId);

          // Use a more direct approach with explicit configuration
          const apiUrl = `https://portal.occamsadvisory.com/portal/wp-json/v1/leads?lead_id=${leadId}`;
          //console.log('API URL:', apiUrl);

          const response = await axios({
            method: 'GET',
            url: apiUrl,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 seconds timeout
          });

          //console.log('Lead API response status:', response.status);
          //console.log('Lead API response data:', response.data);

          if (response.data) {
            const leadData = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;

            //console.log('Lead data from API:', leadData);
            //console.log('Lead group from API:', leadData.lead_group);

            // Create a lead object with the data from the API
            const apiLead = {
              lead_id: leadId,
              ...leadData
            };

            setLead(apiLead);

            // Extract product_id from the response
            if (leadData.product_id) {
              //console.log('Found product_id in lead data:', leadData.product_id);
              setLeadProductId(leadData.product_id);
            }

            // DIRECT APPROACH: Get lead_group key value from API and set to dropdown
            //console.log('Setting lead_group value directly from API response');

            try {
              // For lead ID 9020, the API shows lead_group: "ERC - FPRS"
              // We need to extract this value and set it to the dropdown

              // Get lead_group key value from API
              if (leadData.lead_group) {
                const leadGroupValue = String(leadData.lead_group);
                //console.log('Lead group value from API:', leadGroupValue);

                // IMPORTANT: First check if groupOptions are loaded
                //console.log('Available group options:', groupOptions);

                // Find matching option in groupOptions if available
                if (groupOptions && groupOptions.length > 0) {
                  // Try to find exact match first
                  let matchingOption = groupOptions.find(option =>
                    option.label === leadGroupValue || option.value === leadGroupValue.toLowerCase().replace(/\s+/g, '-')
                  );

                  // If no exact match, try case-insensitive match
                  if (!matchingOption) {
                    matchingOption = groupOptions.find(option =>
                      option.label.toLowerCase() === leadGroupValue.toLowerCase()
                    );
                  }

                  if (matchingOption) {
                    //console.log('Found matching option in groupOptions:', matchingOption);
                    setLeadGroup(matchingOption);

                    // Update form data
                    setFormData(prevData => {
                      const newData = {
                        ...prevData,
                        lead_group: matchingOption.label
                      };
                      //console.log('Updated form data with matching lead_group:', newData);
                      return newData;
                    });
                  } else {
                    // If no match found, create a new option
                    //console.log('No matching option found, creating new one');
                    const newOption = {
                      value: leadGroupValue.toLowerCase().replace(/\s+/g, '-'),
                      label: leadGroupValue
                    };

                    //console.log('Created new lead group option:', newOption);
                    setLeadGroup(newOption);

                    // Update form data
                    setFormData(prevData => {
                      const newData = {
                        ...prevData,
                        lead_group: leadGroupValue
                      };
                      //console.log('Updated form data with new lead_group:', newData);
                      return newData;
                    });
                  }
                } else {
                  // If groupOptions not loaded yet, create temporary option
                  //console.log('Group options not loaded yet, creating temporary option');
                  const tempOption = {
                    value: leadGroupValue.toLowerCase().replace(/\s+/g, '-'),
                    label: leadGroupValue
                  };

                  //console.log('Created temporary lead group option:', tempOption);
                  setLeadGroup(tempOption);

                  // Update form data
                  setFormData(prevData => {
                    const newData = {
                      ...prevData,
                      lead_group: leadGroupValue
                    };
                    //console.log('Updated form data with temporary lead_group:', newData);
                    return newData;
                  });
                }

                // Log for confirmation
                //console.log('Lead group dropdown set with value from API:', leadGroupValue);
              } else {
                //console.log('No lead_group key found in API response');
              }

              // Set campaign from API
              if (leadData.campaign) {
                const campaignValue = String(leadData.campaign);
                //console.log('Setting lead campaign from API to:', campaignValue);

                const campaignOption = {
                  value: campaignValue.toLowerCase().replace(/\s+/g, '-'),
                  label: campaignValue
                };

                //console.log('Created campaign option:', campaignOption);

                // Set the state directly with the campaign from API
                setLeadCampaign(campaignOption);

                // Update form data with the campaign from API
                setFormData(prevData => {
                  const newData = {
                    ...prevData,
                    lead_campaign: campaignValue
                  };
                  //console.log('Updated form data with lead_campaign from API:', newData);
                  return newData;
                });

                // Log for debugging
                //console.log('Campaign value set from API:', campaignValue);
              } else {
                //console.log('No campaign value found in API response');
              }

              // Set source from API
              if (leadData.source) {
                const sourceValue = String(leadData.source);
                //console.log('Setting lead source from API to:', sourceValue);

                const sourceOption = {
                  value: sourceValue.toLowerCase().replace(/\s+/g, '-'),
                  label: sourceValue
                };

                //console.log('Created source option:', sourceOption);

                // Set the state directly with the source from API
                setLeadSource(sourceOption);

                // Update form data with the source from API
                setFormData(prevData => {
                  const newData = {
                    ...prevData,
                    lead_source: sourceValue
                  };
                  //console.log('Updated form data with lead_source from API:', newData);
                  return newData;
                });

                // Log for debugging
                //console.log('Source value set from API:', sourceValue);
              } else {
                //console.log('No source value found in API response');
              }

              // Log all values set from API
              //console.log('All values set from API:');
              //console.log('- lead_group:', leadData.lead_group || 'Not provided, defaulted to Reseller');
              //console.log('- campaign:', leadData.campaign || 'Not provided');
              //console.log('- source:', leadData.source || 'Not provided');
            } catch (error) {
              console.error('Error setting dropdown values:', error);
            }

            // Log available options for debugging
            //console.log('Available group options:', groupOptions);
            //console.log('Available campaign options:', campaignOptions);
            //console.log('Available source options:', sourceOptions);

            // We've already set the dropdown values directly above, so we don't need to do any matching here
          } else {
            console.warn('Failed to fetch lead data from API:', response.data);

            // Create a minimal lead object with just the ID and default values for campaign and source
            const basicLead = {
              lead_id: leadId,
              campaign: "Canvassing",  // Set default campaign to Canvassing
              source: "Reseller"       // Set default source to Reseller
            };

            setLead(basicLead);

            // Set default campaign to Canvassing
            const defaultCampaignOption = {
              value: "canvassing",
              label: "Canvassing"
            };

            //console.log('Setting default campaign to Canvassing');
            setLeadCampaign(defaultCampaignOption);

            // Set default source to Reseller
            const defaultSourceOption = {
              value: "reseller",
              label: "Reseller"
            };

            //console.log('Setting default source to Reseller');
            setLeadSource(defaultSourceOption);

            // Update form data with default values
            setFormData(prevData => {
              const newData = {
                ...prevData,
                lead_campaign: "Canvassing",
                lead_source: "Reseller"
              };
              //console.log('Updated form data with default values:', newData);
              return newData;
            });
          }
        } catch (apiErr) {
          console.error('Error fetching lead data from API:', apiErr);

          // Create a minimal lead object with just the ID and default values for campaign and source
          const basicLead = {
            lead_id: leadId,
            campaign: "Canvassing",  // Set default campaign to Canvassing
            source: "Reseller"       // Set default source to Reseller
          };

          setLead(basicLead);

          // Set default campaign to Canvassing
          const defaultCampaignOption = {
            value: "canvassing",
            label: "Canvassing"
          };

          //console.log('Setting default campaign to Canvassing due to API error');
          setLeadCampaign(defaultCampaignOption);

          // Set default source to Reseller
          const defaultSourceOption = {
            value: "reseller",
            label: "Reseller"
          };

          //console.log('Setting default source to Reseller due to API error');
          setLeadSource(defaultSourceOption);

          // Update form data with default values
          setFormData(prevData => {
            const newData = {
              ...prevData,
              lead_campaign: "Canvassing",
              lead_source: "Reseller"
            };
            //console.log('Updated form data with default values due to API error:', newData);
            return newData;
          });
        }

        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching lead details:', err);
      setError(`Failed to fetch lead details: ${err.message}`);
      setLoading(false);
    }
  };

  const handleTabChange = async (tab) => {
    // Store current primary contact state before tab change
    const currentPrimaryContact = { ...primaryContact };

    if (tab === 'businessInfo') {
      setTabLoading(true);
      if(!isBusinessInfoData){
        await fetchBusinessData();
      }
      setTabLoading(false);
    } else if (tab === 'contacts') {
      setTabLoading(true);
      if(!isContactsData){
        await fetchContactData();
      }
      setTabLoading(false);
    } else if (tab === 'projects') {
      setTabLoading(true);
      if(!isProjectsData){
        await fetchProjectData();
      }
      setTabLoading(false);
    } else if (tab === 'affiliateCommission') {
      setTabLoading(true);
      await fetchAffiliateCommissionData();
      setTabLoading(false);
    } else if (tab === 'opportunities') {
      setTabLoading(true);
      if(!isOpportunitiesData){
        await fetchOpportunities();
      }
      setTabLoading(false);
    }else if (tab === 'auditLogs') {
      setTabLoading(true);
      setTimeout(() => {
        setTabLoading(false);
      }, 2500);
      // setLoadingContent(false);
    }

    setActiveTab(tab);

    // Ensure primary contact state is preserved after tab change
    setTimeout(() => {
      // If primary contact state was lost, restore it
      if (currentPrimaryContact.email && !primaryContact.email) {
        setPrimaryContact(currentPrimaryContact);
      }
    }, 100);
  };

  // Function to fetch notes with pagination
  const fetchNotes = async () => {
    try {
      //console.log('Fetching notes for lead ID:', leadId);
      setNotesLoading(true);
      setNotesError(null);

      // Fetch notes from the API
      const response = await axios.get(`https://portal.occamsadvisory.com/portal/wp-json/v1/lead-notes/${leadId}`);
      //console.log('Notes API response:', response);

      let notesData = [];

      // Handle different possible response formats
      if (Array.isArray(response.data)) {
        notesData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        notesData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // If it's a single note object, wrap it in an array
        notesData = [response.data];
      }

      //console.log('Processed notes data:', notesData);

      // Format dates in MM/DD/YYYY format (no time)
      const formattedNotes = notesData.map(note => ({
        id: note.id || note.note_id || Math.random().toString(36).substring(2, 9),
        text: note.note || note.text || note.content || '',
        author: note.user_name || note.author || 'User',
        date: note.created_at || note.date || new Date().toISOString(),
        formattedDate: formatDateToMMDDYYYY(note.created_at || note.date || new Date())
      }));

      //console.log('Formatted notes:', formattedNotes);

      // If this is the first page, replace notes, otherwise append
      if (notesPage === 1) {
        setNotes(formattedNotes);
      } else {
        setNotes(prevNotes => [...prevNotes, ...formattedNotes]);
      }

      // Check if there are more notes to load
      setHasMoreNotes(response.data && response.data.has_more ? true : false);

    } catch (err) {
      console.error('Error fetching notes:', err);
      setNotesError('Failed to load notes. Please try again later.');
      // Set empty array if there's an error
      if (notesPage === 1) {
        setNotes([]);
      }
      setHasMoreNotes(false);
    } finally {
      setNotesLoading(false);
    }
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

  // Function to handle adding a note
  const handleAddNote = () => {
    //console.log('handleAddNote called');

    // Use a flag to prevent multiple calls
    if (window.isAddingNote) {
      //console.log('Add note modal is already open, ignoring duplicate call');
      return;
    }

    window.isAddingNote = true;

    // Use SweetAlert2 for the add note popup
    Swal.fire({
      title: `<span style="font-size: 1.2rem; color: #333;">Add Note</span>`,
      html: `
        <div class="text-start">
          <div class="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
            <div>
              <span class="text-black">Lead ID: <span class="text-dark">${leadId}</span></span>
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
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-secondary'
      },
      preConfirm: async () => {
        const content = document.getElementById('note-content').value.trim();
        //console.log('content' + content);
        try {
          const validated = await noteFormSchema.validate({ note: content });
          //console.log('validated' + validated);
          return validated; // returns { note: "..." }
        } catch (err) {
          Swal.showValidationMessage(err.message);
          return false;
        }
      },
      willClose: () => {
        // Reset the flag when the modal is closed
        window.isAddingNote = false;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        saveNote(result.value.content);
      } else {
        // Reset the flag if the user cancels
        window.isAddingNote = false;
      }
    });
  };

  // Function to save a note to the API
  const saveNote = async (noteContent) => {
    try {
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
      const noteData = {
        lead_id: leadId,
        note: noteContent,
        user_id: 1,  // Adding user_id parameter as required by the API
        user_name: 'Current User' // Adding user_name parameter
      };

      //console.log('Sending note data:', noteData); // For debugging

      // Send the data to the API
      const response = await axios.post('https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/lead-notes', noteData);
      //console.log('Add note API response:', response);

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

      // Refresh the notes
      setTimeout(() => {
        setNotesPage(1);
        fetchNotes();
      }, 2100);
    } catch (error) {
      console.error('Error saving note:', error);

      // Show error message
      Swal.fire({
        title: `<span style="font-size: 1.2rem; color: #333;">Error</span>`,
        html: `
          <div class="text-center py-3">
            <div class="mb-3">
              <i class="fas fa-exclamation-circle fa-3x text-danger"></i>
            </div>
            <p class="text-muted">There was a problem saving your note. Please try again.</p>
            <p class="text-danger small">${error.message || 'Unknown error'}</p>
          </div>
        `,
        confirmButtonText: 'OK',
        customClass: {
          popup: 'swal-popup-custom',
          title: 'swal-title-custom',
          confirmButton: 'btn btn-primary'
        }
      });
    }
  };

  // Function to view all notes
  const handleViewNotes = () => {
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

    // Fetch notes from the API
    axios.get(`https://portal.occamsadvisory.com/portal/wp-json/v1/lead-notes/${leadId}`)
      .then(response => {
        const notes = response.data || [];
        //console.log('Notes API response for modal:', notes);

        let notesData = [];

        // Handle different possible response formats
        if (Array.isArray(response.data)) {
          notesData = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          notesData = response.data.data;
        } else if (response.data && typeof response.data === 'object') {
          // If it's a single note object, wrap it in an array
          notesData = [response.data];
        }

        // Format the notes for display in MM/DD/YYYY format (no time)
        const formattedNotes = notesData.map(note => ({
          id: note.id || note.note_id || Math.random().toString(36).substring(2, 9),
          text: note.note || note.text || note.content || '',
          author: note.user_name || note.author || 'User',
          date: note.created_at || note.date || new Date().toISOString(),
          formattedDate: formatDateToMMDDYYYY(note.created_at || note.date || new Date())
        }));

        // Generate HTML for the notes
        let notesHtml = '';
        if (formattedNotes.length === 0) {
          notesHtml = `
            <div class="text-center py-4">
              <div class="mb-3">
                <i class="fas fa-sticky-note fa-3x text-muted"></i>
              </div>
              <p class="text-muted">No notes available for this lead</p>
              <button id="add-first-note-btn" class="btn btn-primary mt-3">
                <i class="fas fa-plus me-2"></i>Add First Note
              </button>
            </div>
          `;
        } else {
          notesHtml = formattedNotes.map(note => `
            <div class="note-item mb-3 p-3 bg-white rounded shadow-sm">
              <div class="d-flex justify-content-between">
                <div class="note-date fw-bold">${note.formattedDate}</div>
              </div>
              <div class="note-content mt-2">
                <div class="d-flex align-items-center mb-1">
                  <span class="fw-bold text-dark">${note.author}</span>
                </div>
                <div class="note-text">${note.text}</div>
              </div>
            </div>
          `).join('');
        }

        // Show the notes in a modal
        Swal.fire({
          title: `<span style="font-size: 1.2rem; color: #333;">Notes</span>`,
          html: `
            <div class="text-start">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <span class="text-black">Lead ID: <span class="text-dark">${leadId}</span></span>
                </div>
                <button id="add-note-btn" class="btn btn-primary btn-sm">
                  <i class="fas fa-plus me-1"></i>Add Note
                </button>
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
          },
          didOpen: () => {
            // Remove any existing event listeners first
            const addNoteBtn = document.getElementById('add-note-btn');
            const addFirstNoteBtn = document.getElementById('add-first-note-btn');

            // Clone and replace the buttons to remove any existing event listeners
            if (addNoteBtn) {
              const newAddNoteBtn = addNoteBtn.cloneNode(true);
              addNoteBtn.parentNode.replaceChild(newAddNoteBtn, addNoteBtn);

              // Add event listener to the new button
              newAddNoteBtn.addEventListener('click', () => {
                //console.log('Add Note button clicked');
                Swal.close();
                setTimeout(() => {
                  handleAddNote();
                }, 300);
              });
            }

            // Do the same for the Add First Note button if it exists
            if (addFirstNoteBtn) {
              const newAddFirstNoteBtn = addFirstNoteBtn.cloneNode(true);
              addFirstNoteBtn.parentNode.replaceChild(newAddFirstNoteBtn, addFirstNoteBtn);

              // Add event listener to the new button
              newAddFirstNoteBtn.addEventListener('click', () => {
                //console.log('Add First Note button clicked');
                Swal.close();
                setTimeout(() => {
                  handleAddNote();
                }, 300);
              });
            }
          }
        });
      })
      .catch(error => {
        console.error('Error fetching notes:', error);

        // Show error message
        Swal.fire({
          title: `<span style="font-size: 1.2rem; color: #333;">Error</span>`,
          html: `
            <div class="text-center py-3">
              <div class="mb-3">
                <i class="fas fa-exclamation-circle fa-3x text-danger"></i>
              </div>
              <p class="text-muted">There was a problem loading notes for this lead.</p>
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

  // This function is replaced by the SweetAlert2 version above

  // Function to handle user selection
  const handleUserChange = (selectedOption) => {
    setSelectedUser(selectedOption);
  };

  // Function to assign a user
  const handleAssignUser = async () => {
    if (selectedUser) {
      try {
        setIsAssigningUser(true);

        // Check if user is already assigned
        const isAlreadyAssigned = assignedUsers.some(user => user.id === selectedUser.user.id);

        if (!isAlreadyAssigned) {
          //console.log('Assigning user:', selectedUser.user);

          // Call the API to assign the user
          //console.log('Assigning user with user_id:', selectedUser.user.id);
          const response = await axios.post(
            'https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/lead-assign-user',
            {
              lead_id: leadId,
              user_id: selectedUser.user.id,
              operation: 'assign_user'
            }
          );

          //console.log('API response:', response);

          if (response.data && response.data.success) {
            // Add the selected user to the assigned users list
            const newAssignedUsers = [...assignedUsers, selectedUser.user];
            setAssignedUsers(newAssignedUsers);

            // Update form data with assigned users
            setFormData(prevData => ({
              ...prevData,
              assigned_users: newAssignedUsers.map(user => user.id)
            }));

            //console.log('User assigned successfully:', selectedUser.user);
            //console.log('Updated assigned users:', newAssignedUsers);

            // Show success message in console
            //console.log('Success: User assigned successfully');
          } else {
            console.error('Failed to assign user:', response.data?.message || 'Unknown error');

            // Add the user locally if the API fails
            const newAssignedUsers = [...assignedUsers, selectedUser.user];
            setAssignedUsers(newAssignedUsers);

            // Update form data with assigned users
            setFormData(prevData => ({
              ...prevData,
              assigned_users: newAssignedUsers.map(user => user.id)
            }));

            console.warn('API response indicates failure, but user was assigned locally');
          }
        } else {
          //console.log('User already assigned:', selectedUser.user);
          console.warn('User is already assigned to this lead');
        }

        // Reset the selected user
        setSelectedUser(null);
      } catch (error) {
        console.error('Error assigning user:', error);
        console.error('Error assigning user: ' + (error.response?.data?.message || error.message));

        // Add the user locally if the API fails
        const newAssignedUsers = [...assignedUsers, selectedUser.user];
        setAssignedUsers(newAssignedUsers);

        // Update form data with assigned users
        setFormData(prevData => ({
          ...prevData,
          assigned_users: newAssignedUsers.map(user => user.id)
        }));

        // Reset the selected user
        setSelectedUser(null);
      } finally {
        setIsAssigningUser(false);

        // Refresh the assigned users list
        fetchAssignedUsers();
      }
    }
  };

  // Function to remove an assigned user
  const handleRemoveUser = async (userId) => {
    try {
      setUnassignLoading(true);
      //console.log('Removing user with ID:', userId);

      // Call the API to unassign the user
      //console.log('Unassigning user with user_id:', userId);
      const response = await axios.post(
        'https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/lead-assign-user',
        {
          lead_id: leadId,
          user_id: userId,
          operation: 'unassign_user'
        }
      );

      //console.log('API response:', response);

      if (response.data && response.data.success) {
        // Remove the user from the assigned users list
        const updatedUsers = assignedUsers.filter(user => user.id !== userId);
        setAssignedUsers(updatedUsers);

        // Update form data with the updated assigned users
        setFormData(prevData => ({
          ...prevData,
          assigned_users: updatedUsers.map(user => user.id)
        }));

        //console.log('User removed successfully. Updated assigned users:', updatedUsers);
        //console.log('Success: User unassigned successfully');
      } else {
        console.error('Failed to unassign user:', response.data?.message || 'Unknown error');

        // Remove the user locally if the API fails
        const updatedUsers = assignedUsers.filter(user => user.id !== userId);
        setAssignedUsers(updatedUsers);

        // Update form data with the updated assigned users
        setFormData(prevData => ({
          ...prevData,
          assigned_users: updatedUsers.map(user => user.id)
        }));

        console.warn('API response indicates failure, but user was unassigned locally');
      }
    } catch (error) {
      console.error('Error unassigning user:', error);
      console.error('Error unassigning user: ' + (error.response?.data?.message || error.message));

      // Remove the user locally if the API fails
      const updatedUsers = assignedUsers.filter(user => user.id !== userId);
      setAssignedUsers(updatedUsers);

      // Update form data with the updated assigned users
      setFormData(prevData => ({
        ...prevData,
        assigned_users: updatedUsers.map(user => user.id)
      }));
    } finally {
      setUnassignLoading(false);

      // Refresh the assigned users list
      fetchAssignedUsers();
    }
  };

  // Functions to handle lead classification changes
  const handleLeadGroupChange = (selectedOption) => {
    //console.log('Lead group changed:', selectedOption);
    setLeadGroup(selectedOption);
    setFormData(prevData => ({
      ...prevData,
      lead_group: selectedOption ? selectedOption.label : '' // Use label instead of value
    }));
  };

  const handleLeadCampaignChange = (selectedOption) => {
    //console.log('Lead campaign changed:', selectedOption);
    setLeadCampaign(selectedOption);
    setFormData(prevData => ({
      ...prevData,
      lead_campaign: selectedOption ? selectedOption.label : '' // Use label instead of value
    }));
  };

  const handleLeadSourceChange = (selectedOption) => {
    //console.log('Lead source changed:', selectedOption);
    setLeadSource(selectedOption);
    setFormData(prevData => ({
      ...prevData,
      lead_source: selectedOption ? selectedOption.label : '' // Use label instead of value
    }));
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

  const handlereferrer_percentageChange = (e) => {
    setreferrer_percentage(e.target.value);
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

  // Function to fetch milestone stages from API
  const fetchMilestoneStages = async (milestone_id = '', product_id = '') => {
    try {
      //console.log('Fetching milestone stages for milestone_id:', milestone_id, 'and product_id:', product_id);

      // Set default milestone stages in case API fails
      const defaultMilestoneStages = [
        { id: '1', name: 'Stage 1' },
        { id: '2', name: 'Stage 2' },
        { id: '3', name: 'Stage 3' }
      ];

      // If no milestone_id is provided, return default stages
      if (!milestone_id) {
        //console.log('No milestone_id provided, returning default milestone stages');
        return defaultMilestoneStages;
      }

      // Build the API URL with the milestone_id parameter
      let apiUrl = `https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/milestone-stages?milestone_id=${encodeURIComponent(milestone_id)}`;

      // Add product_id parameter if provided
      if (product_id) {
        apiUrl += `&product_id=${encodeURIComponent(product_id)}`;
      }

      //console.log('Calling milestone stages API with URL1:', apiUrl);

      // Make the API call
      const response = await axios.get(apiUrl);

      //console.log('Milestone stages API response:', response);
      //console.log('Milestone stages API response data type:', typeof response.data);
      //console.log('Milestone stages API response data:', JSON.stringify(response.data, null, 2));

      // Process the response similar to milestones
      let formattedStages = [];

      if (response.data && response.data.success && response.data.data && response.data.data.data) {
        // This is the expected format from the API
        //console.log('Response has the expected format with data.data.data');

        const stagesData = response.data.data.data;
        //console.log('stagesData=');
        //console.log(stagesData);
        if (Array.isArray(stagesData)) {
          formattedStages = stagesData.map(stage => ({
            id: stage.milestone_stage_id || stage.id || '',
            name: stage.stage_name || stage.name || ''
          })).filter(s => s.id && s.name);

          //console.log('Formatted milestone stages from API data:', formattedStages);
        }
      } else if (response.data && response.data.data) {
        // Alternative format where data is directly in response.data.data
        //console.log('Response has data in response.data.data');

        const stagesData = response.data.data;
        if (Array.isArray(stagesData)) {
          formattedStages = stagesData.map(stage => ({
            id: stage.stage_id || stage.id || '',
            name: stage.stage_name || stage.name || ''
          })).filter(s => s.id && s.name);

          //console.log('Formatted milestone stages from data array:', formattedStages);
        } else if (typeof stagesData === 'object') {
          // Handle case where data is an object with stage objects
          formattedStages = Object.values(stagesData)
            .filter(stage => stage && typeof stage === 'object')
            .map(stage => ({
              id: stage.stage_id || stage.id || '',
              name: stage.stage_name || stage.name || stage.title || ''
            }))
            .filter(s => s.id && s.name);

          //console.log('Formatted milestone stages from data object:', formattedStages);
        }
      } else if (Array.isArray(response.data)) {
        // Direct array in response.data
        //console.log('Response data is a direct array with length:', response.data.length);

        formattedStages = response.data.map(stage => ({
          id: stage.stage_id || stage.id || '',
          name: stage.stage_name || stage.name || ''
        })).filter(s => s.id && s.name);

        //console.log('Formatted milestone stages from direct array:', formattedStages);
      } else if (typeof response.data === 'object') {
        // Response.data is an object, try to extract stages
        //console.log('Response data is an object, checking its properties');

        formattedStages = Object.values(response.data)
          .filter(stage => stage && typeof stage === 'object')
          .map(stage => ({
            id: stage.stage_id || stage.id || '',
            name: stage.stage_name || stage.name || stage.title || ''
          }))
          .filter(s => s.id && s.name);

        //console.log('Formatted milestone stages from object:', formattedStages);
      }

      //console.log('Final formatted milestone stages:', formattedStages);

      // If we couldn't extract any valid stages, use the default ones
      if (formattedStages.length === 0) {
        //console.log('No valid milestone stages extracted, using default stages');
        return defaultMilestoneStages;
      } else {
        return formattedStages;
      }
    } catch (err) {
      console.error('Error fetching milestone stages:', err);
      // Return default milestone stages in case of error
      const defaultMilestoneStages = [
        { id: '1', name: 'Stage 1' },
        { id: '2', name: 'Stage 2' },
        { id: '3', name: 'Stage 3' }
      ];
      return defaultMilestoneStages;
    }
  };

  // Function to fetch project milestones from API
  const fetchProjectMilestones = async (product_id = '') => {
    try {
      //console.log('Fetching milestones for projects with product_id:', product_id);

      // Set default milestones in case API fails
      const defaultMilestones = [
        { id: '1', name: 'ERC Onboarding' },
        { id: '2', name: 'STC Onboarding' },
        { id: '3', name: 'R&D Onboarding' }
      ];

      //console.log('product_id====='+product_id);
      
      // Build the API URL with the product_id parameter if provided
      let apiUrl = 'https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/milestones?type=project';
      if (product_id) {
        apiUrl += `&product_id=${encodeURIComponent(product_id)}`;
      }

      //console.log('Calling project milestones API with URL:', apiUrl);

      // Make the API call with the project-specific endpoint
      const response = await axios.get(apiUrl);

      //console.log('Project milestones API response:', response);
      //console.log('Project milestones API response data type:', typeof response.data);
      //console.log('Project milestones API response data:', JSON.stringify(response.data, null, 2));

      // Direct approach - assume the API returns an array of objects with milestone_id and milestone_name
      let formattedMilestones = [];

      if (response.data && response.data.success && response.data.data && response.data.data.data) {
        // This is the expected format from the API
        //console.log('Response has the expected format with data.data.data');

        const milestonesData = response.data.data.data;
        if (Array.isArray(milestonesData)) {
          formattedMilestones = milestonesData.map(milestone => ({
            id: milestone.milestone_id || milestone.id || '',
            name: milestone.milestone_name || milestone.name || ''
          })).filter(m => m.id && m.name);

          //console.log('Formatted project milestones from API data:', formattedMilestones);
        }
      } else if (response.data && response.data.data) {
        // Alternative format where data is directly in response.data.data
        //console.log('Response has data in response.data.data');

        const milestonesData = response.data.data;
        if (Array.isArray(milestonesData)) {
          formattedMilestones = milestonesData.map(milestone => ({
            id: milestone.milestone_id || milestone.id || '',
            name: milestone.milestone_name || milestone.name || ''
          })).filter(m => m.id && m.name);

          //console.log('Formatted project milestones from data array:', formattedMilestones);
        } else if (typeof milestonesData === 'object') {
          // Handle case where data is an object with milestone objects
          formattedMilestones = Object.values(milestonesData)
            .filter(milestone => milestone && typeof milestone === 'object')
            .map(milestone => ({
              id: milestone.milestone_id || milestone.id || '',
              name: milestone.milestone_name || milestone.name || milestone.title || ''
            }))
            .filter(m => m.id && m.name);

          //console.log('Formatted project milestones from data object:', formattedMilestones);
        }
      } else if (Array.isArray(response.data)) {
        // Direct array in response.data
        //console.log('Response data is a direct array with length:', response.data.length);

        formattedMilestones = response.data.map(milestone => ({
          id: milestone.milestone_id || milestone.id || '',
          name: milestone.milestone_name || milestone.name || ''
        })).filter(m => m.id && m.name);

        //console.log('Formatted project milestones from direct array:', formattedMilestones);
      } else if (typeof response.data === 'object') {
        // Response.data is an object, try to extract milestones
        //console.log('Response data is an object, checking its properties');

        formattedMilestones = Object.values(response.data)
          .filter(milestone => milestone && typeof milestone === 'object')
          .map(milestone => ({
            id: milestone.milestone_id || milestone.id || '',
            name: milestone.milestone_name || milestone.name || milestone.title || ''
          }))
          .filter(m => m.id && m.name);

        //console.log('Formatted project milestones from object:', formattedMilestones);
      }

      //console.log('Final formatted project milestones:', formattedMilestones);

      // If we couldn't extract any valid milestones, use the default ones
      if (formattedMilestones.length === 0) {
        //console.log('No valid project milestones extracted, using default milestones');
        setMilestones(defaultMilestones);
      } else {
        setMilestones(formattedMilestones);
      }
    } catch (err) {
      console.error('Error fetching project milestones:', err);
      // Set default milestones in case of error
      const defaultMilestones = [
        { id: '1', name: 'ERC Onboarding' },
        { id: '2', name: 'STC Onboarding' },
        { id: '3', name: 'R&D Onboarding' }
      ];
      setMilestones(defaultMilestones);
    }
  };

  // Function to open the edit project modal
  const handleEditProject = async (project) => {
    //console.log('Opening edit project modal for project:', project);

    // Set loading state immediately when edit icon is clicked
    setProjectUpdateLoading(true);

    // Show the modal first so the loading overlay is visible
    setShowEditProjectModal(true);

    // Log the project object to see its structure
    //console.log('Project object structure:', JSON.stringify(project, null, 2));

    // Always fetch fresh milestones when opening the modal
    try {
      setMilestones([]); // Clear existing milestones
      setMilestoneStages([]); // Clear existing milestone stages

      // Map product names to product IDs
      const productIdMap = {
                                                      'ERC': '935',
                                                      'STC': '937',
                                                      'RDC': '932',
                                                      'TAX': '936',
                                                      'AA':'934'
                                                    };
      
      // Get the product_id from the project if available, or map from the product name, or use a fallback
      let product_id = project.product_id || project.productId;
      
      // If no product_id is available, try to map from the product name
      
      //console.log('Fetching fresh milestones for project modal with product_id:', product_id);

      // Pass the product_id to the fetchProjectMilestones function
      await fetchProjectMilestones(product_id);
      //console.log('Project milestones fetched successfully for project modal');

      // If the project has a milestone_id, fetch the milestone stages
      if (project.milestone_id || project.milestoneId) {
        const milestone_id = project.milestone_id || project.milestoneId;
        //console.log('Fetching milestone stages for project modal with milestone_id:', milestone_id, 'and product_id:', product_id);

        // Fetch milestone stages
        const stages = await fetchMilestoneStages(milestone_id, product_id);
        setMilestoneStages(stages);
        //console.log('Milestone stages fetched successfully for project modal:', stages);
      }
    } catch (error) {
      console.error('Error fetching data for project modal:', error);
    }

    setCurrentProject(project);

    // Set the project form data with proper field mapping
    setProjectFormData({
      user_id:getUserId(),
      projectID: project.id || '',
      project_name: project.projectName || '',
      project_fee: project.fee || '',
      maximum_credit: project.maxCredit || '',
      estimated_fee: project.estFee || '',
      Milestone: project.milestone || '',
      MilestoneStage: project.stage || '',
      ContactList: project.contactId || '',
      collaborators: project.collaborator ? [project.collaborator] : []
    });

    // Data is loaded, set loading state to false
    setProjectUpdateLoading(false);
  };

  // Function to close the edit project modal
  const handleCloseEditProjectModal = () => {
    setShowEditProjectModal(false);
    setCurrentProject(null);
    setProjectUpdateSuccess(false);
    setProjectUpdateError(null);
    resetProjectForm();
  };

  // All input change handlers have been replaced with inline functions

  // Function to update the project
  const handleUpdateProject = async () => {
    try {
      setProjectUpdateLoading(true);
      setProjectUpdateError(null);
      setProjectUpdateSuccess(false);

      //console.log('Updating project with data:', projectFormData);

      // Make the API call
      const response = await axios.post(
        'https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/edit-project-optional-field-v1',
        projectFormData
      );

      //console.log('Project update API response:', response);

      if (response.data && response.data.status) {
        // Update the project in the projects array
        const selectedMilestone = milestones.find(m => m.name === projectFormData.Milestone);
        const selectedStage = milestoneStages.find(s => s.name === projectFormData.MilestoneStage);
        const updatedProjects = projects.map(project => {
          if (project.id === projectFormData.projectID) {
            return {
              ...project,
              projectName: projectFormData.project_name,
              fee: projectFormData.project_fee,
              maxCredit: projectFormData.maximum_credit,
              estFee: projectFormData.estimated_fee,
              milestone: projectFormData.Milestone,
              milestoneId: selectedMilestone ? selectedMilestone.id : project.milestoneId,
              stage: projectFormData.MilestoneStage,
              stageId: selectedStage ? selectedStage.id : project.stageId,
              contactId: projectFormData.ContactList,
              collaborator: projectFormData.collaborators.length > 0 ? projectFormData.collaborators[0] : ''
            };
          }
          return project;
        });

        setProjects(updatedProjects);
        setProjectUpdateSuccess(true);

        // Close the modal after a delay
        setTimeout(() => {
          handleCloseEditProjectModal();
          fetchProjectData();
        }, 2000);
      } else {
        setProjectUpdateError(response.data?.message || 'Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      setProjectUpdateError(error.response?.data?.message || error.message || 'An error occurred while updating the project');
    } finally {
      setProjectUpdateLoading(false);
    }
  };



  // Function to fetch opportunities
  const fetchOpportunities = async () => {
    try {
      //console.log('Fetching opportunities for lead ID:', leadId);

      const response = await axios.get(`https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/lead-opportunity-data/${leadId}/0`);

      //console.log('Opportunities API response:', response);

      if (response.data && response.data.status == 'success' && Array.isArray(response.data.data)) {
        setIsOpportunitiesData(true);
        setOpportunities(response.data.data);
        //console.log('Opportunities set:', response.data.data);
      } else {
        console.warn('No opportunities found or invalid response format');
        setOpportunities([]);
      }
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setOpportunities([]);
    }
  };

  // Function to fetch opportunity milestones from API
  const fetchOpportunityMilestones = async (product_id = '') => {
    try {
      //console.log('Fetching milestones for opportunities with product_id:', product_id);

      // Set default milestones in case API fails
      const defaultMilestones = [
        { id: '1', name: 'ERC Onboarding' },
        { id: '2', name: 'STC Onboarding' },
        { id: '3', name: 'R&D Onboarding' }
      ];


      // Build the API URL with the lead_id and product_id parameters
      let apiUrl = `https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/lead-opportunity-data/${leadId}/0`;

      if (product_id) {
        apiUrl += `&product_id=${encodeURIComponent(product_id)}`;
      }


      //console.log('Calling opportunity milestones API with URL:', apiUrl);

      // Make the API call with the opportunity-specific endpoint
      const response = await axios.get(apiUrl);

      //console.log('Opportunity milestones API response:', response);
      //console.log('Opportunity milestones API response data type:', typeof response.data);
      //console.log('Opportunity milestones API response data:', JSON.stringify(response.data, null, 2));

      // Direct approach - assume the API returns an array of objects with milestone_id and milestone_name
      let formattedMilestones = [];

      if (response.data && response.data.success && response.data.data && response.data.data.data) {
        // This is the expected format from the API
        //console.log('Response has the expected format with data.data.data');

        const milestonesData = response.data.data.data;
        if (Array.isArray(milestonesData)) {
          formattedMilestones = milestonesData.map(milestone => ({
            id: milestone.milestone_id || milestone.id || '',
            name: milestone.milestone_name || milestone.name || ''
          })).filter(m => m.id && m.name);

          //console.log('Formatted opportunity milestones from API data:', formattedMilestones);
        }
      } else if (response.data && response.data.data) {
        // Alternative format where data is directly in response.data.data
        //console.log('Response has data in response.data.data');

        const milestonesData = response.data.data;
        if (Array.isArray(milestonesData)) {
          formattedMilestones = milestonesData.map(milestone => ({
            id: milestone.milestone_id || milestone.id || '',
            name: milestone.milestone_name || milestone.name || ''
          })).filter(m => m.id && m.name);

          //console.log('Formatted opportunity milestones from data array:', formattedMilestones);
        } else if (typeof milestonesData === 'object') {
          // Handle case where data is an object with milestone objects
          formattedMilestones = Object.values(milestonesData)
            .filter(milestone => milestone && typeof milestone === 'object')
            .map(milestone => ({
              id: milestone.milestone_id || milestone.id || '',
              name: milestone.milestone_name || milestone.name || milestone.title || ''
            }))
            .filter(m => m.id && m.name);

          //console.log('Formatted opportunity milestones from data object:', formattedMilestones);
        }
      } else if (Array.isArray(response.data)) {
        // Direct array in response.data
        //console.log('Response data is a direct array with length:', response.data.length);

        formattedMilestones = response.data.map(milestone => ({
          id: milestone.milestone_id || milestone.id || '',
          name: milestone.milestone_name || milestone.name || ''
        })).filter(m => m.id && m.name);

        //console.log('Formatted opportunity milestones from direct array:', formattedMilestones);
      } else if (typeof response.data === 'object') {
        // Response.data is an object, try to extract milestones
        //console.log('Response data is an object, checking its properties');

        formattedMilestones = Object.values(response.data)
          .filter(milestone => milestone && typeof milestone === 'object')
          .map(milestone => ({
            id: milestone.milestone_id || milestone.id || '',
            name: milestone.milestone_name || milestone.name || milestone.title || ''
          }))
          .filter(m => m.id && m.name);

        //console.log('Formatted opportunity milestones from object:', formattedMilestones);
      }

      //console.log('Final formatted opportunity milestones:', formattedMilestones);

      // If we couldn't extract any valid milestones, use the default ones
      if (formattedMilestones.length === 0) {
        //console.log('No valid opportunity milestones extracted, using default milestones');
        setMilestones(defaultMilestones);
      } else {
        setMilestones(formattedMilestones);
      }
    } catch (err) {
      console.error('Error fetching opportunity milestones:', err);
      // Set default milestones in case of error
      const defaultMilestones = [
        { id: '1', name: 'ERC Onboarding' },
        { id: '2', name: 'STC Onboarding' },
        { id: '3', name: 'R&D Onboarding' }
      ];
      setMilestones(defaultMilestones);
    }
  };

  // Function to open the edit opportunity modal
  const handleEditOpportunity = async (opportunity) => {
    //console.log('Opening edit opportunity modal for opportunity:', opportunity);

    // Set loading state immediately when edit icon is clicked
    setOpportunityUpdateLoading(true);

    // Show the modal first so the loading overlay is visible
    setShowEditOpportunityModal(true);

    // Log the opportunity object to see its structure
    //console.log('Opportunity object structure:', JSON.stringify(opportunity, null, 2));

    // Always fetch fresh milestones when opening the modal
    try {
      setMilestones([]); // Clear existing milestones
      setMilestoneStages([]); // Clear existing milestone stages

      // Map product names to product IDs
      const productIdMap = {
                                                      'ERC': '935',
                                                      'STC': '937',
                                                      'RDC': '932',
                                                      'TAX': '936',
                                                      'AA':'934'
                                                    };

      // Get the product_id from the opportunity if available, or map from the product name, or use a fallback
      let product_id = opportunity.product_id || opportunity.productId;

      // If no product_id is available, try to map from the product name
      if (!product_id && opportunity.product) {
        product_id = productIdMap[opportunity.product] || '936'; // Use 936 (ERC) as a fallback
        //console.log('Mapped product name', opportunity.product, 'to product_id:', product_id);
      } else {
        product_id = '936'; // Default fallback to ERC product ID
      }

      //console.log('Fetching fresh milestones for opportunity modal with product_id:', product_id);

      // Pass the product_id to the fetchOpportunityMilestones function
      await fetchOpportunityMilestones(product_id);
      //console.log('Opportunity milestones fetched successfully for opportunity modal');

      // If the opportunity has a milestone_id, fetch the milestone stages
      if (opportunity.milestone_id || opportunity.milestoneId) {
        const milestone_id = opportunity.milestone_id || opportunity.milestoneId;
        //console.log('Fetching milestone stages for opportunity modal with milestone_id:', milestone_id, 'and product_id:', product_id);

        // Fetch milestone stages
        const stages = await fetchMilestoneStages(milestone_id, product_id);
        setMilestoneStages(stages);
        //console.log('Milestone stages fetched successfully for opportunity modal:', stages);
      }
    } catch (error) {
      console.error('Error fetching data for opportunity modal:', error);
    }

    setCurrentOpportunity(opportunity);

    // Set the opportunity form data
    // Use the milestone name directly
    const milestoneName = opportunity.milestone || '';

    //console.log('Original opportunity milestone name:', milestoneName);
    //console.log('Available milestones:', milestones);

    setOpportunityFormData({
      id: opportunity.id || '',
      opportunity_name: opportunity.opportunity_name || '',
      lead_name: opportunity.lead_name || '',
      product: opportunity.product || '',
      milestone: milestoneName,
      created_date: opportunity.created_date || '',
      created_by: opportunity.created_by || '',
      stage: opportunity.stage || '',
      currency: opportunity.currency || '',
      opportunity_amount: opportunity.opportunity_amount || '',
      probability: opportunity.probability || '',
      expected_close_date: opportunity.expected_close_date || '',
      next_step: opportunity.next_step || '',
      description: opportunity.description || ''
    });

    // Data is loaded, set loading state to false
    setOpportunityUpdateLoading(false);
  };

  // Function to close the edit opportunity modal
  const handleCloseEditOpportunityModal = () => {
    setShowEditOpportunityModal(false);
    setCurrentOpportunity(null);
    setOpportunityUpdateSuccess(false);
    setOpportunityUpdateError(null);
  };

  // Function to update the opportunity
  const handleUpdateOpportunity = async () => {
    try {
      setOpportunityUpdateLoading(true);
      setOpportunityUpdateError(null);
      setOpportunityUpdateSuccess(false);

      //console.log('Updating opportunity with data:', opportunityFormData);

      const response = await axios.post(
        'https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/update-opportunity',
        opportunityFormData
      );

      //console.log('Opportunity update API response:', response);

      if (response.data && response.data.success) {
        // Update the opportunity in the opportunities array
        const updatedOpportunities = opportunities.map(opp => {
          if (opp.id === opportunityFormData.id) {
            return {
              ...opp,
              ...opportunityFormData
            };
          }
          return opp;
        });

        setOpportunities(updatedOpportunities);
        setOpportunityUpdateSuccess(true);

        // Close the modal after a delay
        setTimeout(() => {
          handleCloseEditOpportunityModal();
        }, 2000);
      } else {
        setOpportunityUpdateError(response.data?.message || 'Failed to update opportunity');
      }

      setOpportunityUpdateLoading(false);
    } catch (error) {
      console.error('Error updating opportunity:', error);
      setOpportunityUpdateError(error.message || 'An error occurred while updating the opportunity');
      setOpportunityUpdateLoading(false);
    }
  };

  // Function to show delete confirmation dialog using SweetAlert
  const showDeleteConfirmation = (opportunity) => {
    Swal.fire({
      title: 'Are you sure?',
      html: `You want to delete the opportunity <strong>"${opportunity.opportunity_name}"</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF6B00',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      buttonsStyling: true,
      customClass: {
        actions: 'swal2-actions-custom',
        confirmButton: 'swal2-styled swal2-confirm',
        cancelButton: 'swal2-styled swal2-cancel'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        deleteOpportunity(opportunity.id);
      }
    });
  };

  // Function to handle deleting an opportunity
  const deleteOpportunity = async (opportunityId) => {
    try {
      //console.log('Deleting opportunity with ID:', opportunityId);
      setDeleteOpportunityLoading(true);

      // Show loading indicator with SweetAlert
      Swal.fire({
        title: 'Deleting...',
        html: 'Please wait while we delete the opportunity.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Make the DELETE request to the API
      const response = await axios.delete('https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/opportunities', {
        data: { id: opportunityId }
      });

      //console.log('Delete opportunity API response:', response);

      // Check if the deletion was successful
      if (response.data && response.data.success) {
        //console.log('Opportunity deleted successfully');

        // Remove the deleted opportunity from the state
        const updatedOpportunities = opportunities.filter(opp => opp.id !== opportunityId);
        setOpportunities(updatedOpportunities);

        // Show success message with SweetAlert
        Swal.fire({
          title: 'Deleted!',
          text: 'The opportunity has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#4CAF50',
          confirmButtonText: 'OK'
        });
      } else {
        console.error('Failed to delete opportunity:', response.data);

        // Show error message with SweetAlert
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete opportunity. Please try again.',
          icon: 'error',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'OK'
        });
      }
    } catch (err) {
      console.error('Error deleting opportunity:', err);

      // Show error message with SweetAlert
      Swal.fire({
        title: 'Error!',
        text: err.message || 'An error occurred while deleting the opportunity.',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
    } finally {
      // Close any loading indicators
      setDeleteOpportunityLoading(false);
    }
  };

  // Handle input changes for all form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update the formData state
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // Update the lead state for business info fields
    if (name.startsWith('business_') ||
        name === 'doing_business_as' ||
        name === 'category' ||
        name === 'website' ||
        name === 'authorized_signatory_name' ||
        name === 'city' ||
        name === 'state' ||
        name === 'zip' ||
        name === 'registration_number' ||
        name === 'registration_date' ||
        name === 'state_of_registration' ||
        name === 'ein' ||
        name === 'tax_id_type' ||
        name === 'business_type' ||
        name === 'business_type_other' ||
        name === 'internal_sales_agent' ||
        name === 'internal_sales_support' ||
        name === 'billing_profile') {
      setLead(prevLead => ({
        ...prevLead,
        [name]: value
      }));
      //console.log(`Updated lead.${name} to:`, value);
    }

    // Update primary contact fields
    if (name === 'primary_contact_email') {
      setPrimaryContact(prev => ({ ...prev, email: value }));
    } else if (name === 'primary_contact_phone') {
      setPrimaryContact(prev => ({ ...prev, phone: value }));
    } else if (name === 'primary_contact_ext') {
      setPrimaryContact(prev => ({ ...prev, ext: value }));
    } else if (name === 'contact_phone_type') {
      setPrimaryContact(prev => ({ ...prev, phoneType: value }));
    }

    // For fields that also have a state variable, update that too
    if (name === 'taxnow_signup_status') {
      setTaxNowSignupStatus(value);
    } else if (name === 'taxnow_onboarding_status') {
      setTaxNowOnboardingStatus(value);
    } else if (name === 'company_folder_link') {
      setCompanyFolderLink(value);
    } else if (name === 'document_folder_link') {
      setDocumentFolderLink(value);
    }
  };

  // Handle form submission
  const handleSave = async () => {
    // setLoading(true);
    setError(null);
    setUpdateSuccess(false);
    setLoadingContent(true); 

    try {
      // Collect all field values from all tabs regardless of which tab is active

      // Business Info tab fields
      const businessInfoData = {
        business_legal_name: lead.business_legal_name || '',
        doing_business_as: lead.doing_business_as || '',
        category: lead.category || '',
        business_category: lead.category || '',
        website: lead.website || '',
        website_url: lead.website || '',
        authorized_signatory_name: lead.authorized_signatory_name || '',
        business_phone: lead.business_phone || '',
        business_email: lead.business_email || '',
        business_title: lead.business_title || '',
        business_address: lead.business_address || '',
        street_address: lead.business_address || '',
        city: lead.city || '',
        business_city: lead.city || '',
        state: lead.state || '',
        business_state: lead.state || '',
        zip: lead.zip || '',
        business_zip: lead.zip || '',
        country: lead.country || 'US',
        primary_contact_email: primaryContact.email || '',
        primary_contact_phone: primaryContact.phone || '',
        primary_contact_ext: primaryContact.ext || '',
        contact_phone_type: primaryContact.phoneType || '',
        phone_type: primaryContact.phoneType || '',
        billing_profile: lead.billing_profile || '',
        taxnow_signup_status: taxNowSignupStatus || '',
        taxnow_onboarding_status: taxNowOnboardingStatus || '',
        business_entity_type: lead.business_type || '',
        business_type: lead.business_type || '',
        if_other: lead.business_type_other || '',
        business_type_other: lead.business_type_other || '',
        registration_number: lead.registration_number || '',
        registration_date: lead.registration_date || '',
        state_of_registration: lead.state_of_registration || '',
        ein: lead.ein || '',
        tax_id_type: lead.tax_id_type || '',
        internal_sales_agent: lead.internal_sales_agent || '',
        internal_sales_support: lead.internal_sales_support || '',
        company_folder_link: companyFolderLink || '',
        document_folder_link: documentFolderLink || ''
      };

      // Contacts tab fields
      const contactsData = {
        primary_contact_name: primaryContact.name || '',
        primary_contact_email: primaryContact.email || '',
        primary_contact_phone: primaryContact.phone || '',
        secondary_contact_name: secondaryContact.name || '',
        secondary_contact_email: secondaryContact.email || '',
        secondary_contact_phone: secondaryContact.phone || ''
      };

      // Projects tab fields - now using the projects array
      const projectsData = projects.length > 0 ? {
        projects: projects.map(project => ({
          project_id: project.id,
          business_legal_name: project.businessName,
          project_name: project.projectName,
          product_name: project.productName,
          product_id: project.productId,
          milestone: project.milestone,
          milestone_id: project.milestoneId,
          stage_name: project.stage,
          milestone_stage_id: project.stageId,
          project_fee: project.fee,
          maximum_credit: project.maxCredit,
          estimated_fee: project.estFee,
          actual_fee: project.actualFee,
          actual_credit: project.actualCredit,
          collaborator: project.collaborator,
          contact_id: project.contactId
        }))
      } : {};

      // Affiliate Commission tab fields
      const feesData = {
        // Tier 1 Commission data - using both API field names and original field names for compatibility
        affiliate_commision_basis: tier1CommissionBasis?.value || '',
        affiliate_commision_type: tier1ReferrerType?.value || '',
        referrer_fixed: tier1ReferrerFixed || '',
        referrer_percentage: referrer_percentage || '',
        referrer_percentage2: tier1InvoiceAmount || '',

        // Tier 2 Commission data
        tier2_affiliate_commision_basis: tier2CommissionBasis?.value || '',
        tier2_commission_basis: tier2CommissionBasis?.value || '',
        tier2_affiliate_commision_type: tier2CommissionType?.value || '',
        tier2_commission_type: tier2CommissionType?.value || '',
        tier2_referrer_fixed: tier2ReferrerFixed || '',
        tier2_referrer_percentage: tier2ErcChgReceived || '',
        tier2_referrer_percentage2: tier2InvoiceAmount || '',

        // Tier 3 Commission data
        tier3_affiliate_commision_basis: tier3CommissionBasis?.value || '',
        tier3_affiliate_commision_type: tier3CommissionType?.value || '',
        tier3_commission_type: tier3CommissionType?.value || '',
        tier3_referrer_fixed: tier3ReferrerFixed || '',
        tier3_referrer_percentage: tier3ErcChgReceived || '',
        tier3_referrer_percentage2: tier3InvoiceAmount || '',

        // Current Tier
        current_tier: currentTier?.value || '',

        // Slab Commission data
        slab1_applied_on: slab1AppliedOn || '',
        slab1_commision_type: slab1CommissionType?.value || '',
        slab1_commision_value: slab1CommissionValue || '',

        slab2_applied_on: slab2AppliedOn || '',
        slab2_commision_type: slab2CommissionType?.value || '',
        slab2_commision_value: slab2CommissionValue || '',

        slab3_applied_on: slab3AppliedOn || '',
        slab3_commision_type: slab3CommissionType?.value || '',
        slab3_commision_value: slab3CommissionValue || '',

        // Master Affiliate Commission data
        master_commision_type: masterCommissionType?.value || '',
        master_referrer_fixed: masterCommissionValue || '',
        master_referrer_percentage: masterCommissionValue || '',
        master_commision_value: masterCommissionValue || ''
      };

      // Lead classification data - using names/labels instead of IDs
      const classificationData = {
        lead_group: leadGroup ? leadGroup.label : '',
        lead_campaign: leadCampaign ? leadCampaign.label : '',
        lead_source: leadSource ? leadSource.label : ''
      };

      //console.log('Lead classification data (using names):', classificationData);

      // Combine all data from all tabs
      const allTabsData = {
        ...businessInfoData,
        ...contactsData,
        ...projectsData,
        ...feesData,
        ...classificationData
      };

      // Merge with any changed form data
      const mergedData = {
        ...allTabsData,
        ...formData,
        lead_id: leadId,
        user_id: getUserId(), // Add user_id to the form data
        // Include all tables to update
        tables: ['business_info', 'contacts', 'projects', 'fees', 'bank_info', 'opportunity'],
        // Also include the table parameter for backward compatibility
        table: 'all'
      };

      // Log user_id for debugging
      //console.log('Current user_id being sent:', getUserId());

      // Make API call to update the lead
      //console.log('Sending data to API:', mergedData);
      const response = await axios.post(
        'https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/leads',
        mergedData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && (response.data.success || response.status === 200)) {
        setUpdateSuccess(true);

        // Update the lead state with the new data
        setLead(prevLead => ({
          ...prevLead,
          ...formData
        }));

        // Show success message in the UI
        //console.log('Lead updated successfully!');

        // Scroll to the success message if the element exists
        const actionButtons = document.querySelector('.action-buttons');
        if (actionButtons) {
          window.scrollTo({
            top: actionButtons.offsetTop - 100,
            behavior: 'smooth'
          });
        }

        // Hide success message after 5 seconds
        setTimeout(() => {
          setUpdateSuccess(false);
        }, 5000);
      } else {
        const errorMessage = response.data && response.data.message
          ? response.data.message
          : 'Unknown error occurred while updating lead';
        setError('Failed to update lead: ' + errorMessage);
        console.error('API Error:', errorMessage);
      }
    } catch (err) {
      console.error('Error updating lead:', err);
      const errorMessage = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message || 'Unknown error occurred';
      setError(`Failed to update lead: ${errorMessage}`);
      console.error(`API Error: ${errorMessage}`);
    } finally {
      // setLoading(false);
      setLoadingContent(false); 
    }
  };

  // Add these functions after fetchAvailableContacts
  const handleOpenLinkContactModal = async () => {
    try {
      setShowLinkContactModal(true);
      setLinkContactError(null);
      setSelectedContact(null);
      const contacts = await fetchAvailableContacts();
      setContactOptions(contacts);
    } catch (error) {
      console.error('Error opening link contact modal:', error);
      setLinkContactError('Failed to load contacts. Please try again.');
    }
  };

  const handleCloseLinkContactModal = () => {
    setShowLinkContactModal(false);
    setSelectedContact(null);
    setLinkContactError(null);
    setLinkContactLoading(false);
  };

  const handleContactSelection = (selectedOption) => {
    setSelectedContact(selectedOption);
    setLinkContactError(null);
  };

  const shouldShowAffiliateTab = hasRoleAccess(['administrator', 'echeck_client']);

  // if (loading) {
  //   return (
  //     <div className="container-fluid">
  //       <div className="row justify-content-center mt-5">
  //         <div className="col-md-8 text-center">
  //           <div className="spinner-border text-primary" role="status">
  //             <span className="visually-hidden">Loading...</span>
  //           </div>
  //           <p className="mt-2">Loading lead details...</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

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

  // if (!lead) {
  //   return (
  //     <div className="container-fluid">
  //       <div className="row justify-content-center mt-5">
  //         <div className="col-md-8 text-center">
  //           <div className="alert alert-warning" role="alert">
  //             <h4 className="alert-heading">Lead Not Found</h4>
  //             <p>The lead with ID {leadId} could not be found.</p>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // Add debugging to see what data we have
  //console.log('Current lead state:', lead);
  // console.log('Primary contact:', primaryContact);
  //console.log('Tier1CommissionBasis:', tier1CommissionBasis);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          {/* Overlay */}
          {loadingContent && (
            <div className="overlay-loading d-flex flex-column justify-content-center align-items-center">
              <svg class="loader" viewBox="0 0 200 100">
                <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#007bff" />
                <stop offset="100%" stopColor="#ff6600" />
                </linearGradient>
                </defs>
                <path class="infinity-shape"
                      d="M30,50
                        C30,20 70,20 100,50
                        C130,80 170,80 170,50
                        C170,20 130,20 100,50
                        C70,80 30,80 30,50"
                    />
              </svg>
              <p className="mt-3 mb-0 text-muted">Processing data...</p>
            </div>
          )}
          {loading &&(
            <div className="white_card card_height_100 mb_30">
              <div className="white_card_header">
                <div className="box_header m-0 justify-content-between">
                  <h4 className="iris-lead-name">Lead Details</h4>
                  <div>
                  </div>
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
                  {shouldShowAffiliateTab && (
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
                  )}

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
                  <li className={`nav-item ${activeTab === 'opportunities' ? 'active' : ''}`}>
                    <a
                      className="nav-link"
                      id="pills-opportunities"
                      onClick={(e) => {
                        e.preventDefault();
                        handleTabChange('opportunities');
                      }}
                      href="#pills-opportunities"
                      role="tab"
                      aria-controls="pills-opportunities"
                      aria-selected={activeTab === 'opportunities'}
                    >
                      Opportunities
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
                    <div className="col-md-12">
                      <div className="text-center my-5">
                        <svg class="loader" viewBox="0 0 200 100">
                          <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#007bff" />
                          <stop offset="100%" stopColor="#ff6600" />
                          </linearGradient>
                          </defs>
                          <path class="infinity-shape"
                                d="M30,50
                                  C30,20 70,20 100,50
                                  C130,80 170,80 170,50
                                  C170,20 130,20 100,50
                                  C70,80 30,80 30,50"
                              />
                        </svg>
                        <p style={{color: '#000'}}>Processing data...</p>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          )}
          {lead && (
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
                  {shouldShowAffiliateTab && (
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
                  )}

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
                  <li className={`nav-item ${activeTab === 'opportunities' ? 'active' : ''}`}>
                    <a
                      className="nav-link"
                      id="pills-opportunities"
                      onClick={(e) => {
                        e.preventDefault();
                        handleTabChange('opportunities');
                      }}
                      href="#pills-opportunities"
                      role="tab"
                      aria-controls="pills-opportunities"
                      aria-selected={activeTab === 'opportunities'}
                    >
                      Opportunities
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
                  {tabLoading && (
                    <div className="col-md-8">
                      <div className="text-center my-5">
                        <svg class="loader" viewBox="0 0 200 100">
                          <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#007bff" />
                          <stop offset="100%" stopColor="#ff6600" />
                          </linearGradient>
                          </defs>
                          <path class="infinity-shape"
                                d="M30,50
                                  C30,20 70,20 100,50
                                  C130,80 170,80 170,50
                                  C170,20 130,20 100,50
                                  C70,80 30,80 30,50"
                              />
                        </svg>
                        <p style={{color: '#000'}}>Processing data...</p>
                      </div>
                    </div>
                  )}
                  {!tabLoading && (
                    <div className="col-md-8">
                      {/* Business Info Tab Content */}
                      {activeTab === 'businessInfo' && (
                        <BusinessInfoTab
                          lead={lead}
                          errors={errors}
                          register={register}
                          handleInputChange={handleInputChange}
                          taxNowSignupStatus={taxNowSignupStatus}
                          taxNowOnboardingStatus={taxNowOnboardingStatus}
                          companyFolderLink={companyFolderLink}
                          documentFolderLink={documentFolderLink}
                          primaryContact={primaryContact}
                          billingProfileOptions={billingProfileOptions}
                          leadId={leadId}
                          formData={formData}
                          setFormData={setFormData}
                        />
                      )}

                      {shouldShowAffiliateTab && activeTab === 'affiliateCommission' && (
                        <AffiliateCommissionTab
                          tier1CommissionBasis={tier1CommissionBasis}
                          tier1ReferrerType={tier1ReferrerType}
                          tier1ReferrerFixed={tier1ReferrerFixed}
                          referrer_percentage={referrer_percentage}
                          tier1InvoiceAmount={tier1InvoiceAmount}
                          tier2CommissionBasis={tier2CommissionBasis}
                          tier2CommissionType={tier2CommissionType}
                          tier2ReferrerFixed={tier2ReferrerFixed}
                          tier2ErcChgReceived={tier2ErcChgReceived}
                          tier2InvoiceAmount={tier2InvoiceAmount}
                          tier3CommissionBasis={tier3CommissionBasis}
                          tier3CommissionType={tier3CommissionType}
                          tier3ReferrerFixed={tier3ReferrerFixed}
                          tier3ErcChgReceived={tier3ErcChgReceived}
                          tier3InvoiceAmount={tier3InvoiceAmount}
                          currentTier={currentTier}
                          slab1AppliedOn={slab1AppliedOn}
                          slab1CommissionType={slab1CommissionType}
                          slab1CommissionValue={slab1CommissionValue}
                          slab2AppliedOn={slab2AppliedOn}
                          slab2CommissionType={slab2CommissionType}
                          slab2CommissionValue={slab2CommissionValue}
                          slab3AppliedOn={slab3AppliedOn}
                          slab3CommissionType={slab3CommissionType}
                          slab3CommissionValue={slab3CommissionValue}
                          masterCommissionType={masterCommissionType}
                          masterCommissionValue={masterCommissionValue}
                          handleTier1CommissionBasisChange={handleTier1CommissionBasisChange}
                          handleTier1ReferrerTypeChange={handleTier1ReferrerTypeChange}
                          handleTier1ReferrerFixedChange={handleTier1ReferrerFixedChange}
                          handlereferrer_percentageChange={handlereferrer_percentageChange}
                          handleTier1InvoiceAmountChange={handleTier1InvoiceAmountChange}
                          handleTier2CommissionBasisChange={handleTier2CommissionBasisChange}
                          handleTier2CommissionTypeChange={handleTier2CommissionTypeChange}
                          handleTier2ReferrerFixedChange={handleTier2ReferrerFixedChange}
                          handleTier2ErcChgReceivedChange={handleTier2ErcChgReceivedChange}
                          handleTier2InvoiceAmountChange={handleTier2InvoiceAmountChange}
                          handleTier3CommissionBasisChange={handleTier3CommissionBasisChange}
                          handleTier3CommissionTypeChange={handleTier3CommissionTypeChange}
                          handleTier3ReferrerFixedChange={handleTier3ReferrerFixedChange}
                          handleTier3ErcChgReceivedChange={handleTier3ErcChgReceivedChange}
                          handleTier3InvoiceAmountChange={handleTier3InvoiceAmountChange}
                          handleCurrentTierChange={handleCurrentTierChange}
                          handleSlab1AppliedOnChange={handleSlab1AppliedOnChange}
                          handleSlab1CommissionTypeChange={handleSlab1CommissionTypeChange}
                          handleSlab1CommissionValueChange={handleSlab1CommissionValueChange}
                          handleSlab2AppliedOnChange={handleSlab2AppliedOnChange}
                          handleSlab2CommissionTypeChange={handleSlab2CommissionTypeChange}
                          handleSlab2CommissionValueChange={handleSlab2CommissionValueChange}
                          handleSlab3AppliedOnChange={handleSlab3AppliedOnChange}
                          handleSlab3CommissionTypeChange={handleSlab3CommissionTypeChange}
                          handleSlab3CommissionValueChange={handleSlab3CommissionValueChange}
                          handleMasterCommissionTypeChange={handleMasterCommissionTypeChange}
                          handleMasterCommissionValueChange={handleMasterCommissionValueChange}
                        />
                      )}
                        
                        {/* Contacts Tab Content */}
                      {activeTab === 'contacts' && (
                        <ContactsTab
                          leadId={leadId}
                          handleOpenLinkContactModal={handleOpenLinkContactModal}
                          contacts={contacts}
                          handleEditContact={handleEditContact}
                          handleDisableContact={handleDisableContact}
                          contactsLoading={contactsLoading}
                          newContactId={newContactId}
                        />
                      )}

                      {activeTab === 'projects' && (
                        <ProjectsTab
                          projects={projects}
                          showEditProjectModal={showEditProjectModal}
                          projectUpdateLoading={projectUpdateLoading}
                          projectUpdateSuccess={projectUpdateSuccess}
                          projectUpdateError={projectUpdateError}
                          projectFormData={projectFormData}
                          currentProject={currentProject}
                          projectErrors={projectErrors}
                          milestones={milestones}
                          milestoneStages={milestoneStages}
                          contacts={contacts}
                          handleEditProject={handleEditProject}
                          handleCloseEditProjectModal={handleCloseEditProjectModal}
                          handleUpdateProject={handleUpdateProject}
                          handleSubmitProject={handleSubmitProject}
                          registerProject={registerProject}
                          setProjectFormData={setProjectFormData}
                          setMilestoneStages={setMilestoneStages}
                          fetchMilestoneStages={fetchMilestoneStages}
                          setProjectValue={setProjectValue}
                        />
                      )}

                      {/* Opportunities Tab Content */}
                      {activeTab === 'opportunities' && (
                        <OpportunitiesTab
                          opportunities={opportunities}
                          handleEditOpportunity={handleEditOpportunity}
                          showDeleteConfirmation={showDeleteConfirmation}
                          showEditOpportunityModal={showEditOpportunityModal}
                          opportunityUpdateLoading={opportunityUpdateLoading}
                          opportunityUpdateSuccess={opportunityUpdateSuccess}
                          opportunityUpdateError={opportunityUpdateError}
                          opportunityFormData={opportunityFormData}
                          currentOpportunity={currentOpportunity}
                          milestones={milestones}
                          milestoneStages={milestoneStages}
                          handleCloseEditOpportunityModal={handleCloseEditOpportunityModal}
                          handleUpdateOpportunity={handleUpdateOpportunity}
                          setOpportunityFormData={setOpportunityFormData}
                          setMilestoneStages={setMilestoneStages}
                          fetchMilestoneStages={fetchMilestoneStages}
                        />
                      )}

                      {/* Audit Logs Tab Content */}
                      {activeTab === 'auditLogs' && (
                        <div className="mb-4 left-section-container">
                          <AuditLogsMultiSection leadId={leadId || '9020'} />
                        </div>
                      )}
                    </div>
                  )}
                  {/* Right Side Section - Same for all tabs */}
                  <div className="col-md-4">
                    <LeadClassificationAndAssignment
                        leadId={leadId}
                        setFormData={setFormData}
                        leadGroup={leadGroup}
                        leadCampaign={leadCampaign}
                        leadSource={leadSource}
                        groupOptions={groupOptions}
                        campaignOptions={campaignOptions}
                        sourceOptions={sourceOptions}
                        isLoadingOptions={isLoadingOptions}
                        onLeadGroupChange={handleLeadGroupChange}
                        onLeadCampaignChange={handleLeadCampaignChange}
                        onLeadSourceChange={handleLeadSourceChange}
                      />

                    <div className=" mt-4">
                        <div className="action-buttons">
                          <button
                            className="btn save-btn"
                            onClick={handleSubmit(handleSave)}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Saving...
                              </>
                            ) : 'Save'}
                          </button>
                          <a
                            className="btn cancel-btn"
                            href="../reports/leads/all"
                            disabled={loading}
                          >
                            Cancel
                          </a>
                        </div>
                        {updateSuccess && (
                          <div className="alert alert-success mt-3" role="alert">
                            <strong><i className="fas fa-check-circle me-2"></i>Lead updated successfully!</strong>
                          </div>
                        )}
                        {error && (
                          <div className="alert alert-danger mt-3" role="alert">
                            <strong><i className="fas fa-exclamation-triangle me-2"></i>Error!</strong>
                            <p className="mb-0 mt-1">{error}</p>
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                  {/* Debug Panel */}
                  <div style={{
                    position: 'fixed',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    maxWidth: '300px',
                    maxHeight: '200px',
                    overflow: 'auto',
                    zIndex: 9999,
                    display: 'none' // Set to 'block' to show
                  }}>
                    <h6>Debug Info</h6>
                    <p>Active Tab: {activeTab}</p>
                    <p>Primary Contact Email: {primaryContact.email}</p>
                    <p>Primary Contact Phone: {primaryContact.phone}</p>
                    <p>Ref Primary Email: {contactDataRef.current.primary.email}</p>
                    <p>Ref Primary Phone: {contactDataRef.current.primary.phone}</p>
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Contact Modal */}
      <EditContactModal
        isOpen={showEditContactModal}
        onClose={handleCloseEditContactModal}
        contactId={currentContactId}
        leadId={leadId}
      />

      {/* Link Contact Modal */}
      {showLinkContactModal && (
        <>
          <div className="modal-backdrop show" style={{ display: 'block', zIndex: 1040 }}></div>
          <div className="modal fade show" style={{ display: 'block', zIndex: 1050 }} tabIndex="-1" aria-modal="true" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Link a Contact</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseLinkContactModal}
                    disabled={linkContactLoading}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="form-group mb-4">
                    <label htmlFor="contact-select" className="form-label">Contact Name*:</label>
                    <Select
                      id="contact-select"
                      value={selectedContact}
                      onChange={handleContactSelection}
                      options={contactOptions}
                      className="contact-select-container"
                      classNamePrefix="react-select"
                      placeholder={contactOptions.length === 0 ? "Loading contacts..." : "Select Contact"}
                      isClearable
                      isSearchable
                      isDisabled={linkContactLoading}
                      isLoading={contactOptions.length === 0}
                      noOptionsMessage={() => contactOptions.length === 0 ? "Loading contacts..." : "No matching contacts found"}
                      formatOptionLabel={option => (
                        <div className="contact-option">
                          <span className="contact-name">{option.label.split('(')[0].trim()}</span>
                          <span className="contact-id">({option.label.split('(')[1]}</span>
                        </div>
                      )}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      menuPlacement="auto"
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 })
                      }}
                      components={{
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null
                      }}
                    />
                    <small className="text-muted">Search or select a contact from the dropdown list</small>
                  </div>

                  {linkContactError && (
                    <div className="alert alert-danger" role="alert">
                      {linkContactError}
                    </div>
                  )}
                </div>
                <div className="modal-footer">

                  <button
                    className="btn save-btn"
                    onClick={handleLinkContact}
                    disabled={!selectedContact || linkContactLoading}
                  >
                    {linkContactLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Linking...
                      </>
                    ) : 'Link'}
                  </button>
                   <button
                    className="btn cancel-btn"
                    onClick={handleCloseLinkContactModal}
                    disabled={linkContactLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LeadDetail;

// Add custom CSS for DatePicker styling
const style = document.createElement('style');
style.textContent = `
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container input {
    width: 100%;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #212529;
    background-color: #fff;
    background-image: none;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .react-datepicker__input-container input:focus {
    color: #212529;
    background-color: #fff;
    border-color: #86b7fe;
    outline: 0;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  }

  .react-datepicker__input-container input::placeholder {
    color: #6c757d;
    opacity: 1;
  }

  .custom-datepicker-popper {
    z-index: 9999;
  }

  .react-datepicker {
    font-family: inherit;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  }

  .react-datepicker__header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
  }

  .react-datepicker__current-month {
    color: #495057;
    font-weight: 600;
  }

  .react-datepicker__day-name {
    color: #6c757d;
    font-weight: 600;
  }

  .react-datepicker__day:hover {
    background-color: #e9ecef;
  }

  .react-datepicker__day--selected {
    background-color: #0d6efd;
    color: white;
  }

  .react-datepicker__day--selected:hover {
    background-color: #0b5ed7;
  }

  .react-datepicker__day--today {
    background-color: #fff3cd;
    color: #856404;
  }

  /* Loading Overlay Styles */
  .loading-overlay {
    animation: fadeIn 0.3s ease-in-out;
  }

  .loading-content {
    animation: slideIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Custom PlaceholderLoading styles */
  .react-placeholder-loading {
    border-radius: 50%;
  }
  .overlay-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255,255,255,0.6);
    z-index: 10;
  }
  .overlay-loading-2 {
    position: absolute;
    top: 200px;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
  }
  .loader {
    width: 120px;
    height: 100px;
  }
 
  .infinity-shape {
    fill: none;
    stroke: url(#gradient);
    stroke-width: 12;
    stroke-linecap: round;
    stroke-dasharray: 220 60;
    stroke-dashoffset: 0;
    animation: dashMove 2s linear infinite;
  }
 
  @keyframes dashMove {
    0% {
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dashoffset: -280;
    }
  }
`;

if (!document.head.querySelector('style[data-datepicker-styles]')) {
  style.setAttribute('data-datepicker-styles', 'true');
  document.head.appendChild(style);
}