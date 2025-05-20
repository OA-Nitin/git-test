import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import Select from 'react-select';
import './common/CommonStyles.css';
import './LeadDetail.css';
import { getAssetPath } from '../utils/assetUtils';

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
    name: '',
    email: '',
    phone: '',
    initials: ''
  });
  const [secondaryContact, setSecondaryContact] = useState({
    name: '',
    email: '',
    phone: '',
    initials: ''
  });

  // Projects related state
  const [project, setProject] = useState({
    id: '',
    businessName: '',
    projectName: '',
    productName: '',
    productId: '',
    milestone: '',
    milestoneId: '',
    stage: '',
    stageId: '',
    fee: '',
    maxCredit: '',
    estFee: '',
    collaborator: '',
    collaboratorId: '',
    contactId: ''
  });

  // Lead classification state
  const [leadGroup, setLeadGroup] = useState(null);
  const [leadCampaign, setLeadCampaign] = useState(null);
  const [leadSource, setLeadSource] = useState(null);

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

  useEffect(() => {
    document.title = `Lead #${leadId} - Occams Portal`;

    // First fetch basic lead details
    const fetchData = async () => {
      try {
        console.log('Starting data fetch sequence for lead ID:', leadId);

        // First fetch basic lead details
        await fetchLeadDetails();
        console.log('Basic lead details fetched');

        // Then fetch business data to populate the form
        await fetchBusinessData();
        console.log('Business data fetched');

        // Also fetch affiliate commission data
        await fetchAffiliateCommissionData();
        console.log('Affiliate commission data fetched');

        console.log('All data fetched successfully for lead ID:', leadId);
      } catch (error) {
        console.error('Error in data fetch sequence:', error);
      }
    };

    fetchData();
  }, [leadId]);

  // Reset onboarding status when signup status changes
  useEffect(() => {
    setTaxNowOnboardingStatus('');
  }, [taxNowSignupStatus]);

  // Fetch notes when component loads
  useEffect(() => {
    if (lead && notes.length === 0) {
      fetchNotes();
    }
  }, [lead]);

  // Fetch user data when component loads
  useEffect(() => {
    fetchUserData();
  }, []);

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      console.log('Fetching user data');

      // In a real implementation, you would fetch users from an API
      // For example:
      // const response = await axios.get('https://play.occamsadvisory.com/portal/wp-json/v1/users');
      // if (response.data && response.data.success) {
      //   const apiUsers = response.data.data;
      //
      //   // Format options for react-select
      //   const options = apiUsers.map(user => ({
      //     value: user.id,
      //     label: (
      //       <div className="d-flex align-items-center">
      //         <span>{user.name} ({user.role})</span>
      //       </div>
      //     ),
      //     user: user
      //   }));
      //
      //   setUserOptions(options);
      //
      //   // Set assigned users if available
      //   if (lead && lead.assigned_users && lead.assigned_users.length > 0) {
      //     setAssignedUsers(lead.assigned_users);
      //   }
      // }

      // For now, we'll just set empty arrays
      setUserOptions([]);
      setAssignedUsers([]);

    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchBusinessData = async () => {
    try {
      console.log('Fetching business data for lead ID:', leadId);
      const response = await axios.get(`https://play.occamsadvisory.com/portal/wp-json/portalapi/v1/lead-business-data/${leadId}`);

      if (response.data && (response.data.success || response.data.status === 'success')) {
        console.log('Business data fetched successfully:', response.data);

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
            lead_id: leadId
          };

          console.log('Mapped business data:', mappedData);

          // Update lead state with mapped data
          setLead(prevLead => ({
            ...prevLead,
            ...mappedData
          }));

          // Update specific state variables
          setTaxNowSignupStatus(businessData.taxnow_signup_status || '');
          setTaxNowOnboardingStatus(businessData.taxnow_onboarding_status || '');

          // Update folder links if available
          if (businessData.company_folder_link) {
            setCompanyFolderLink(businessData.company_folder_link);
          }

          if (businessData.document_folder_link) {
            setDocumentFolderLink(businessData.document_folder_link);
          }

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
              phone: businessData.business_phone || prevContact.phone
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

          console.log('Lead state updated with business data:', mappedData);
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
      console.log('Fetching affiliate commission data for lead ID:', leadId);
      const response = await axios.get(`https://play.occamsadvisory.com/portal/wp-json/portalapi/v1/lead-affiliate-commission-data/${leadId}`);

      if (response.data && (response.data.status === 'success' || response.data.success)) {
        console.log('Affiliate commission data fetched successfully:', response.data);

        // Update affiliate commission state with data
        // Handle both array and object response formats
        const commissionData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data;

        console.log('Commission data to process:', commissionData);

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

          console.log('Affiliate commission state updated with data');
        }
      } else {
        console.warn('Failed to fetch affiliate commission data:', response.data);
      }
    } catch (err) {
      console.error('Error fetching affiliate commission data:', err);
    }
  };

  const fetchLeadDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // If we have lead data passed from the report page, use it
      if (passedLeadData) {
        console.log('Using passed lead data:', passedLeadData);
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
        // Otherwise set up a basic lead object with just the ID
        // The rest of the data will come from the API calls
        console.log('No passed data, setting up basic lead object');

        // Create a minimal lead object with just the ID
        const basicLead = {
          lead_id: leadId
        };

        setLead(basicLead);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching lead details:', err);
      setError(`Failed to fetch lead details: ${err.message}`);
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Function to fetch notes with pagination
  const fetchNotes = async () => {
    try {
      console.log('Fetching notes for lead ID:', leadId);

      // In a real implementation, you would fetch notes from an API
      // For example:
      // const response = await axios.get(`https://play.occamsadvisory.com/portal/wp-json/v1/lead-notes/${leadId}?page=${notesPage}`);
      // if (response.data && response.data.success) {
      //   const apiNotes = response.data.data;
      //
      //   // Format dates and times
      //   const formattedNotes = apiNotes.map(note => ({
      //     ...note,
      //     formattedDate: new Date(note.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      //     formattedTime: new Date(note.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      //   }));
      //
      //   // If this is the first page, replace notes, otherwise append
      //   if (notesPage === 1) {
      //     setNotes(formattedNotes);
      //   } else {
      //     setNotes([...notes, ...formattedNotes]);
      //   }
      //
      //   // Check if there are more notes to load
      //   setHasMoreNotes(response.data.has_more || false);
      // }

      // For now, we'll just set an empty array
      if (notesPage === 1) {
        setNotes([]);
      }
      setHasMoreNotes(false);

    } catch (err) {
      console.error('Error fetching notes:', err);
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

  // Functions to handle lead classification changes
  const handleLeadGroupChange = (selectedOption) => {
    setLeadGroup(selectedOption);
  };

  const handleLeadCampaignChange = (selectedOption) => {
    setLeadCampaign(selectedOption);
  };

  const handleLeadSourceChange = (selectedOption) => {
    setLeadSource(selectedOption);
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
      console.log(`Updated lead.${name} to:`, value);
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
    setLoading(true);
    setError(null);
    setUpdateSuccess(false);

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

      // Projects tab fields
      const projectsData = {
        project_business_name: project.businessName || '',
        project_name: project.projectName || '',
        product_name: project.productName || '',
        milestone: project.milestone || '',
        stage: project.stage || '',
        collaborator: project.collaborator || ''
      };

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
        slab1_commision_type: slab1CommissionType?.value || '',
        slab1_commision_value: slab1CommissionValue || '',
        slab1_commision_value: slab1CommissionValue || '',

        slab2_applied_on: slab2AppliedOn || '',
        slab2_commision_type: slab2CommissionType?.value || '',
        slab2_commision_type: slab2CommissionType?.value || '',
        slab2_commision_value: slab2CommissionValue || '',
        slab2_commision_value: slab2CommissionValue || '',

        slab3_applied_on: slab3AppliedOn || '',
        slab3_commision_type: slab3CommissionType?.value || '',
        slab3_commision_type: slab3CommissionType?.value || '',
        slab3_commision_value: slab3CommissionValue || '',
        slab3_commision_value: slab3CommissionValue || '',

        // Master Affiliate Commission data
        master_commision_type: masterCommissionType?.value || '',
        master_commision_type: masterCommissionType?.value || '',
        master_referrer_fixed: masterCommissionValue || '',
        master_referrer_percentage: masterCommissionValue || '',
        master_commision_value: masterCommissionValue || '',
        master_commision_value: masterCommissionValue || ''
      };

      // Combine all data from all tabs
      const allTabsData = {
        ...businessInfoData,
        ...contactsData,
        ...projectsData,
        ...feesData
      };

      // Merge with any changed form data
      const mergedData = {
        ...allTabsData,
        ...formData,
        lead_id: leadId,
        // Include all tables to update
        tables: ['business_info', 'contacts', 'projects', 'fees', 'bank_info', 'opportunity'],
        // Also include the table parameter for backward compatibility
        table: 'all'
      };

      // Make API call to update the lead
      console.log('Sending data to API:', mergedData);
      const response = await axios.post(
        'https://play.occamsadvisory.com/portal/wp-json/portalapi/v1/leads',
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
        console.log('Lead updated successfully!');

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
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center mt-5">
          <div className="col-md-8 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading lead details...</p>
          </div>
        </div>
      </div>
    );
  }

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

  if (!lead) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center mt-5">
          <div className="col-md-8 text-center">
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading">Lead Not Found</h4>
              <p>The lead with ID {leadId} could not be found.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add debugging to see what data we have
  console.log('Current lead state:', lead);
  console.log('Primary contact:', primaryContact);
  console.log('Tier1CommissionBasis:', tier1CommissionBasis);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
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
                <div className="col-md-8">
                  {/* Business Info Tab Content */}
                  {activeTab === 'businessInfo' && (
                    <div className="mb-4 left-section-container">
                      <h5 className="section-title">Business Identity</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Legal Name*</label>
                            <input
                              type="text"
                              className="form-control"
                              name="business_legal_name"
                              value={lead.business_legal_name || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Doing Business As</label>
                            <input
                              type="text"
                              className="form-control"
                              name="doing_business_as"
                              value={lead.doing_business_as || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Category*</label>
                            <input
                              type="text"
                              className="form-control"
                              name="category"
                              value={lead.category || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Website URL*</label>
                            <input
                              type="text"
                              className="form-control"
                              name="website"
                              value={lead.website || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Business Contact Info</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Authorized Signatory Name</label>
                            <input
                              type="text"
                              className="form-control"
                              name="authorized_signatory_name"
                              value={lead.authorized_signatory_name || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Phone*</label>
                            <input
                              type="text"
                              className="form-control"
                              name="business_phone"
                              value={lead.business_phone || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Email*</label>
                            <input
                              type="email"
                              className="form-control"
                              name="business_email"
                              value={lead.business_email || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Business Title*</label>
                            <input
                              type="text"
                              className="form-control"
                              name="business_title"
                              value={lead.business_title || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Street Address*</label>
                            <input
                              type="text"
                              className="form-control"
                              name="business_address"
                              value={lead.business_address || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">City*</label>
                            <input
                              type="text"
                              className="form-control"
                              name="city"
                              value={lead.city || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">State*</label>
                            <input
                              type="text"
                              className="form-control"
                              name="state"
                              value={lead.state || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">ZIP*</label>
                            <input
                              type="text"
                              className="form-control"
                              name="zip"
                              value={lead.zip || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Primary Contact Info</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                              type="email"
                              className="form-control"
                              name="primary_contact_email"
                              value={primaryContact.email || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input
                              type="text"
                              className="form-control"
                              name="primary_contact_phone"
                              value={primaryContact.phone || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-2">
                          <div className="form-group">
                            <label className="form-label">Contact Ext</label>
                            <input
                              type="text"
                              className="form-control"
                              name="primary_contact_ext"
                              value={primaryContact.ext || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Contact Phone Type</label>
                            <input
                              type="text"
                              className="form-control"
                              name="contact_phone_type"
                              value={primaryContact.phoneType || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Billing Profile</h5>
                      <div className="row mb-3">
                        <div className="col-md-12">
                          <div className="form-group">
                            <label className="form-label">Select Billing Profile</label>
                            <select
                              className="form-select"
                              name="billing_profile"
                              value={lead.billing_profile || ''}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Billing Profile</option>
                              <option value="Reporting Head - Production">Reporting Head - Production</option>
                              <option value="Quickbook Play">Quickbook Play</option>
                              <option value="Reporting Head">Reporting Head</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">TaxNow</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Select TaxNow Signup Status</label>
                            <select
                              className="form-select"
                              name="taxnow_signup_status"
                              value={taxNowSignupStatus}
                              onChange={handleInputChange}
                            >
                              <option value="">Select TaxNow Signup Status</option>
                              <option value="Complete">Complete</option>
                              <option value="Incomplete">Incomplete</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Select TaxNow Onboarding Status</label>
                            <select
                              className="form-select"
                              name="taxnow_onboarding_status"
                              value={taxNowOnboardingStatus}
                              onChange={handleInputChange}
                            >
                              <option value="">Select TaxNow Onboarding Status</option>
                              {taxNowSignupStatus === 'Complete' ? (
                                <>
                                  <option value="Awaiting IRS">Awaiting IRS</option>
                                  <option value="Active">Active</option>
                                </>
                              ) : taxNowSignupStatus === 'Incomplete' ? (
                                <>
                                  <option value="Invite Sent">Invite Sent</option>
                                  <option value="KYC Verification">KYC Verification</option>
                                  <option value="KYB Verification">KYB Verification</option>
                                  <option value="TIA Unsigned">TIA Unsigned</option>
                                  <option value="Blank">Blank</option>
                                </>
                              ) : null}
                            </select>
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Business Legal Info</h5>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Business Entity Type*</label>
                            <select
                              className="form-select"
                              name="business_type"
                              value={lead.business_type || 'N/A'}
                              onChange={handleInputChange}
                            >
                              <option value="N/A">N/A</option>
                              <option value="Sole Proprietorship">Sole Proprietorship</option>
                              <option value="Partnership">Partnership</option>
                              <option value="Limited Liability (LLC)">Limited Liability (LLC)</option>
                              <option value="Corporation (S,C,B,etc)">Corporation (S,C,B,etc)</option>
                              <option value="Trust">Trust</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">If Other*</label>
                            <input
                              type="text"
                              className="form-control"
                              name="business_type_other"
                              value={lead.business_type_other || ''}
                              onChange={handleInputChange}
                              placeholder="If other, specify type"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Registration Number*</label>
                            <input
                              type="text"
                              className="form-control"
                              name="registration_number"
                              value={lead.registration_number || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Registration Date*</label>
                            <input
                              type="date"
                              className="form-control"
                              name="registration_date"
                              value={lead.registration_date || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">State of Registration*</label>
                            <input
                              type="text"
                              className="form-control"
                              name="state_of_registration"
                              value={lead.state_of_registration || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">EIN*</label>
                            <input
                              type="text"
                              className="form-control"
                              name="ein"
                              value={lead.ein || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Tax ID Type*</label>
                            <select
                              className="form-select"
                              name="tax_id_type"
                              value={lead.tax_id_type || 'N/A'}
                              onChange={handleInputChange}
                            >
                              <option value="N/A">N/A</option>
                              <option value="EIN">EIN</option>
                              <option value="TIN">TIN</option>
                              <option value="SSN">SSN</option>
                            </select>
                          </div>
                        </div>
                      </div>


                      <h5 className="section-title mt-4">Sales User</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Internal Sales Agent</label>
                            <input
                              type="text"
                              className="form-control"
                              name="internal_sales_agent"
                              value={lead.internal_sales_agent || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Internal Sales Support</label>
                            <input
                              type="text"
                              className="form-control"
                              name="internal_sales_support"
                              value={lead.internal_sales_support || ''}
                              onChange={handleInputChange}
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
                                  <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                                  <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                                </svg>
                              </a>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="company_folder_link"
                              value={companyFolderLink}
                              onChange={handleInputChange}
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
                                  <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                                  <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                                </svg>
                              </a>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="document_folder_link"
                              value={documentFolderLink}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Notes Section */}
                      <h5 className="section-title mt-4">Notes</h5>
                      <div className="notes-container p-0">
                        <div className="d-flex justify-content-between align-items-center mb-4 notes-header">
                          <h6 className="notes-title mb-0">Lead notes and activity history</h6>
                          <button
                            className="add-note-btn"
                            onClick={toggleAddNoteModal}
                          >
                            <span className="d-flex align-items-center">
                              <i className="fas fa-plus me-2"></i>Add Note
                            </span>
                          </button>
                        </div>

                        {notes.length === 0 ? (
                          <div className="text-center py-4 bg-light rounded">
                            <div className="mb-3">
                              <i className="fas fa-sticky-note fa-3x text-muted"></i>
                            </div>
                            <p className="text-muted">No notes available for this lead</p>
                            <button
                              className="btn add-note-btn mt-3"
                              onClick={toggleAddNoteModal}
                            >
                              <span className="d-flex align-items-center">
                                <i className="fas fa-plus me-2"></i>Add First Note
                              </span>
                            </button>
                          </div>
                        ) : (
                          <div
                            id="scrollableNotesDiv"
                            style={{
                              height: '300px',
                              overflow: 'auto',
                              border: '1px solid #e9ecef',
                              borderRadius: '8px',
                              padding: '20px',
                              backgroundColor: '#f8f9fa'
                            }}
                          >
                            <InfiniteScroll
                              dataLength={notes.length}
                              next={loadMoreNotes}
                              hasMore={hasMoreNotes}
                              loader={
                                <div className="text-center py-3">
                                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                  </div>
                                  <p className="text-muted small mt-2">Loading more notes...</p>
                                </div>
                              }
                              endMessage={
                                <div className="text-center py-3">
                                  <p className="text-muted small">No more notes to load</p>
                                </div>
                              }
                              scrollableTarget="scrollableNotesDiv"
                            >
                              {notes.map((note) => (
                                <div
                                  key={note.id}
                                  className="note-item mb-3 p-3 bg-white rounded shadow-sm"
                                >
                                  <div className="d-flex justify-content-between">
                                    <div className="note-date fw-bold">{note.formattedDate}</div>
                                    <div className="note-time text-muted">{note.formattedTime}</div>
                                  </div>
                                  <div className="note-content mt-2">
                                    <span className="d-flex align-items-center">
                                      <span className="fw-bold text-dark">{note.author}</span>
                                      <span className="ms-1">added a : {note.text}</span>
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </InfiniteScroll>
                          </div>
                        )}

                        {/* Add Note Modal */}
                        {showAddNoteModal && (
                          <>
                            <div className="modal-backdrop show" style={{ display: 'block' }}></div>
                            <div className={`modal ${showAddNoteModal ? 'show' : ''}`} style={{ display: 'block' }}>
                              <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '650px' }}>
                                <div className="modal-content" style={{ borderRadius: '8px' }}>
                                  <div className="modal-header pb-2">
                                    <h5 className="modal-title">Add Note</h5>
                                    <button type="button" className="btn-close" onClick={toggleAddNoteModal}></button>
                                  </div>
                                  <div className="modal-body">
                                    <form onSubmit={handleAddNote}>

                                      <div className="mb-3">
                                        <textarea
                                          className="form-control"
                                          rows="5"
                                          placeholder="Enter your note here..."
                                          value={newNote}
                                          onChange={(e) => setNewNote(e.target.value)}
                                          style={{ resize: 'vertical', minHeight: '100px' }}
                                        ></textarea>
                                      </div>
                                      <div className="text-muted small">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Your note will be saved with the current date and time.
                                      </div>
                                      <div className="d-flex justify-content-center gap-3 mt-4">
                                        <button type="submit" className="btn modal-save-btn">Save Note</button>
                                        <button type="button" className="btn modal-cancel-btn" onClick={toggleAddNoteModal}>Cancel</button>
                                      </div>
                                    </form>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}



                  {/* Affiliate Commission Tab Content */}
                  {activeTab === 'affiliateCommission' && (
                    <div className="mb-4 left-section-container">
                      <h5 className="section-title">Tier 1 Affiliate Commission</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Affiliate Commission Basis</label>
                            <select
                              className="form-select"
                              name="affiliate_commision_basis"
                              value={tier1CommissionBasis?.value || ''}
                              onChange={(e) => handleTier1CommissionBasisChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Select Affiliate Commission Basis</option>
                              <option value="erc-chq-received">ERC Chq Received</option>
                              <option value="erc-invoice-amount">ERC Invoice Amount</option>
                              <option value="lower-of-both">Lower of Both</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Affiliate Commission Type</label>
                            <select
                              className="form-select"
                              name="affiliate_commision_type"
                              value={tier1ReferrerType?.value || ''}
                              onChange={(e) => handleTier1ReferrerTypeChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Select Affiliate Commission Type</option>
                              <option value="referrer-fixed">Referrer Fixed</option>
                              <option value="referrer-percentage">Referrer Percentage</option>
                              <option value="fixed-percentage">Fixed + Percentage</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Referrer Fixed</label>
                            <input
                              type="text"
                              className="form-control"
                              name="referrer_fixed"
                              value={tier1ReferrerFixed}
                              onChange={handleTier1ReferrerFixedChange}
                              placeholder="Enter amount"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">% On ERC Chg Received</label>
                            <input
                              type="text"
                              className="form-control"
                              name="referrer_percentage"
                              value={referrer_percentage}
                              onChange={handlereferrer_percentageChange}
                              placeholder="Enter percentage"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">% On Invoice Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              name="referrer_percentage2"
                              value={tier1InvoiceAmount}
                              onChange={handleTier1InvoiceAmountChange}
                              placeholder="Enter percentage"
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Tier 2 Affiliate Commission</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Affiliate Commission Basis</label>
                            <select
                              className="form-select"
                              name="tier2_commission_basis"
                              value={tier2CommissionBasis?.value || ''}
                              onChange={(e) => handleTier2CommissionBasisChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Select Affiliate Commission Basis</option>
                              <option value="affiliate-commission-basis">Affiliate Commission Basis</option>
                              <option value="erc-chq-received">ERC Chq Received</option>
                              <option value="erc-invoice-amount">ERC Invoice Amount</option>
                              <option value="lower-of-both">Lower of Both</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Affiliate Commission Type</label>
                            <select
                              className="form-select"
                              name="tier2_commission_type"
                              value={tier2CommissionType?.value || ''}
                              onChange={(e) => handleTier2CommissionTypeChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Select Affiliate Commission Type</option>
                              <option value="affiliate-commission-type">Affiliate Commission Type</option>
                              <option value="referrer-fixed">Referrer Fixed</option>
                              <option value="referrer-percentage">Referrer Percentage</option>
                              <option value="fixed-percentage">Fixed + Percentage</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Referrer Fixed</label>
                            <input
                              type="text"
                              className="form-control"
                              name="tier2_referrer_fixed"
                              value={tier2ReferrerFixed}
                              onChange={handleTier2ReferrerFixedChange}
                              placeholder="Enter amount"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">% On ERC Chg Received</label>
                            <input
                              type="text"
                              className="form-control"
                              name="tier2_erc_chg_received"
                              value={tier2ErcChgReceived}
                              onChange={handleTier2ErcChgReceivedChange}
                              placeholder="Enter percentage"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">% On Invoice Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              name="tier2_invoice_amount"
                              value={tier2InvoiceAmount}
                              onChange={handleTier2InvoiceAmountChange}
                              placeholder="Enter percentage"
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Tier 3 Affiliate Commission</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Affiliate Commission Basis</label>
                            <select
                              className="form-select"
                              name="tier3_affiliate_commision_basis"
                              value={tier3CommissionBasis?.value || ''}
                              onChange={(e) => handleTier3CommissionBasisChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Select Affiliate Commission Basis</option>
                              <option value="affiliate-commission-basis">Affiliate Commission Basis</option>
                              <option value="erc-chq-received">ERC Chq Received</option>
                              <option value="erc-invoice-amount">ERC Invoice Amount</option>
                              <option value="lower-of-both">Lower of Both</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Affiliate Commission Type</label>
                            <select
                              className="form-select"
                              name="tier3_commission_type"
                              value={tier3CommissionType?.value || ''}
                              onChange={(e) => handleTier3CommissionTypeChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Select Affiliate Commission Type</option>
                              <option value="affiliate-commission-type">Affiliate Commission Type</option>
                              <option value="referrer-fixed">Referrer Fixed</option>
                              <option value="referrer-percentage">Referrer Percentage</option>
                              <option value="fixed-percentage">Fixed + Percentage</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Referrer Fixed</label>
                            <input
                              type="text"
                              className="form-control"
                              name="tier3_referrer_fixed"
                              value={tier3ReferrerFixed}
                              onChange={handleTier3ReferrerFixedChange}
                              placeholder="Enter amount"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">% On ERC Chg Received</label>
                            <input
                              type="text"
                              className="form-control"
                              name="tier3_erc_chg_received"
                              value={tier3ErcChgReceived}
                              onChange={handleTier3ErcChgReceivedChange}
                              placeholder="Enter percentage"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">% On Invoice Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              name="tier3_invoice_amount"
                              value={tier3InvoiceAmount}
                              onChange={handleTier3InvoiceAmountChange}
                              placeholder="Enter percentage"
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Current Tier</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <select
                              className="form-select"
                              name="current_tier"
                              value={currentTier?.value || ''}
                              onChange={(e) => handleCurrentTierChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Select Current Tier</option>
                              <option value="Tier1">Tier 1</option>
                              <option value="Tier2">Tier 2</option>
                              <option value="Tier3">Tier 3</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Affiliate Slab Commission</h5>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Slab-1 Applied On</label>
                            <input
                              type="text"
                              className="form-control"
                              name="slab1_applied_on"
                              value={slab1AppliedOn}
                              onChange={handleSlab1AppliedOnChange}
                              placeholder="Slab-1 Applied On"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Slab-1 Commission Type</label>
                            <select
                              className="form-select"
                              name="slab1_commision_type"
                              value={slab1CommissionType?.value || ''}
                              onChange={(e) => handleSlab1CommissionTypeChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Slab-1 Commission Type</option>
                              <option value="percentage">Percentage</option>
                              <option value="fixed">Fixed</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Slab-1 Commission Value</label>
                            <input
                              type="text"
                              className="form-control"
                              name="slab1_commision_value"
                              value={slab1CommissionValue}
                              onChange={handleSlab1CommissionValueChange}
                              placeholder="Slab-1 Commission Value"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Slab-2 Applied On</label>
                            <input
                              type="text"
                              className="form-control"
                              name="slab2_applied_on"
                              value={slab2AppliedOn}
                              onChange={handleSlab2AppliedOnChange}
                              placeholder="Slab-2 Applied On"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Slab-2 Commission Type</label>
                            <select
                              className="form-select"
                              name="slab2_commision_type"
                              value={slab2CommissionType?.value || ''}
                              onChange={(e) => handleSlab2CommissionTypeChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Slab-2 Commission Type</option>
                              <option value="percentage">Percentage</option>
                              <option value="fixed">Fixed</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Slab-2 Commission Value</label>
                            <input
                              type="text"
                              className="form-control"
                              name="slab2_commision_value"
                              value={slab2CommissionValue}
                              onChange={handleSlab2CommissionValueChange}
                              placeholder="Slab-2 Commission Value"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Slab-3 Applied On</label>
                            <input
                              type="text"
                              className="form-control"
                              name="slab3_applied_on"
                              value={slab3AppliedOn}
                              onChange={handleSlab3AppliedOnChange}
                              placeholder="Slab-3 Applied On"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Slab-3 Commission Type</label>
                            <select
                              className="form-select"
                              name="slab3_commision_type"
                              value={slab3CommissionType?.value || ''}
                              onChange={(e) => handleSlab3CommissionTypeChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Slab-3 Commission Type</option>
                              <option value="percentage">Percentage</option>
                              <option value="fixed">Fixed</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Slab-3 Commission Value</label>
                            <input
                              type="text"
                              className="form-control"
                              name="slab3_commision_value"
                              value={slab3CommissionValue}
                              onChange={handleSlab3CommissionValueChange}
                              placeholder="Slab-3 Commission Value"
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Master Affiliate Commission</h5>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Master Commission Type</label>
                            <select
                              className="form-select"
                              name="master_commision_type"
                              value={masterCommissionType?.value || ''}
                              onChange={(e) => handleMasterCommissionTypeChange({
                                value: e.target.value,
                                label: e.target.options[e.target.selectedIndex].text
                              })}
                            >
                              <option value="">Master Commission Type</option>
                              <option value="master-commission-type">Master Commission Type</option>
                              <option value="affiliate-fixed">Affiliate Fixed</option>
                              <option value="percentage-of-subaffiliate-commission">Percentage Of Subaffiliate Commission</option>
                              <option value="percentage-of-affiliate-invoice">Percentage Of Affiliate Invoice</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Master Commission Value</label>
                            <input
                              type="text"
                              className="form-control"
                              name="master_commision_value"
                              value={masterCommissionValue}
                              onChange={handleMasterCommissionValueChange}
                              placeholder="Master Commission Value"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contacts Tab Content */}
                  {activeTab === 'contacts' && (
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
                                <input
                                  type="hidden"
                                  name="primary_contact_name"
                                  id="hidden_contact_name_6441"
                                  value={primaryContact.name}
                                  onChange={handleInputChange}
                                />
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
                                <input
                                  type="hidden"
                                  name="secondary_contact_name"
                                  id="hidden_contact_name_6380"
                                  value={secondaryContact.name}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Projects Tab Content */}
                  {activeTab === 'projects' && (
                    <div className="mb-4 left-section-container">
                      <div className="row custom_opp_tab">
                        <div className="col-sm-12">
                          <div className="custom_opp_tab_header">
                            <h5><a href="javascript:void(0)"></a></h5>
                            <div className="opp_edit_dlt_btn projects-iris">
                              <a
                                className="edit_project"
                                data-projid={project.id}
                                data-projname={project.projectName}
                                data-businessname={project.businessName}
                                data-productname={project.productName}
                                data-productid={project.productId}
                                data-milestone={project.milestone}
                                data-milestoneid={project.milestoneId}
                                data-stage={project.stage}
                                data-stageid={project.stageId}
                                data-fee={project.fee}
                                data-max_credit={project.maxCredit}
                                data-est_fee={project.estFee}
                                data-collab={project.collaboratorId}
                                data-contact={project.contactId}
                                href="javascript:void(0)"
                                title="Edit"
                              >
                                <i className="fas fa-pen"></i>
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-7 text-left">
                          <div className="lead_des">
                            <p>
                              <b>Business Name:</b>
                              <input
                                type="text"
                                className="form-control d-inline-block ml-2"
                                style={{width: "70%", marginLeft: "10px"}}
                                name="project_business_name"
                                defaultValue={project.businessName}
                                onChange={handleInputChange}
                              />
                            </p>
                            <p>
                              <b>Project Name:</b>
                              <input
                                type="text"
                                className="form-control d-inline-block ml-2"
                                style={{width: "70%", marginLeft: "10px"}}
                                name="project_name"
                                defaultValue={project.projectName}
                                onChange={handleInputChange}
                              />
                            </p>
                            <p>
                              <b>Product Name:</b>
                              <input
                                type="text"
                                className="form-control d-inline-block ml-2"
                                style={{width: "70%", marginLeft: "10px"}}
                                name="product_name"
                                defaultValue={project.productName}
                                onChange={handleInputChange}
                              />
                            </p>
                          </div>
                        </div>
                        <div className="col-md-5">
                          <div className="lead_des">
                            <p>
                              <b>Milestone:</b>
                              <input
                                type="text"
                                className="form-control d-inline-block ml-2"
                                style={{width: "70%", marginLeft: "10px"}}
                                name="milestone"
                                defaultValue={project.milestone}
                                onChange={handleInputChange}
                              />
                            </p>
                            <p>
                              <b>Stage:</b>
                              <input
                                type="text"
                                className="form-control d-inline-block ml-2"
                                style={{width: "70%", marginLeft: "10px"}}
                                name="stage"
                                defaultValue={project.stage}
                                onChange={handleInputChange}
                              />
                            </p>
                            <p>
                              <b>Collaborator:</b>
                              <input
                                type="text"
                                className="form-control d-inline-block ml-2"
                                style={{width: "70%", marginLeft: "10px"}}
                                name="collaborator"
                                defaultValue={project.collaborator}
                                onChange={handleInputChange}
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Audit Logs Tab Content */}
                  {activeTab === 'auditLogs' && (
                    <div className="mb-4 left-section-container">
                      <h4>Audit Logs</h4>
                      <p>Audit logs will be displayed here.</p>
                    </div>
                  )}
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
                      <h5 className="card-title">Lead Group:</h5>
                      <div className="form-group mb-4">
                        <Select
                          value={leadGroup}
                          onChange={handleLeadGroupChange}
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

                      <h5 className="card-title">Lead Campaign:</h5>
                      <div className="form-group mb-4">
                        <Select
                          value={leadCampaign}
                          onChange={handleLeadCampaignChange}
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

                      <h5 className="card-title">Lead Source:</h5>
                      <div className="form-group">
                        <Select
                          value={leadSource}
                          onChange={handleLeadSourceChange}
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

                  <div className=" mt-4">
                      <div className="action-buttons">
                        <button
                          className="btn save-btn"
                          onClick={handleSave}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Saving...
                            </>
                          ) : 'Save'}
                        </button>
                        <button
                          className="btn cancel-btn"
                          onClick={() => window.history.back()}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                      {updateSuccess && (
                        <div className="alert alert-success mt-3" role="alert">
                          <strong><i className="fas fa-check-circle me-2"></i>Lead updated successfully!</strong>
                          <p className="mb-0 mt-1">Your changes have been saved to the database.</p>
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


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;