import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './createContact.css';
import Select from 'react-select';

const API_BASE_URL = 'https://portal.occamsadvisory.com/portal/wp-json';

// Dynamic config generator
const getApiConfig = (needsAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (needsAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return { headers };
};

const CreateContact = () => {
  const [searchParams] = useSearchParams();
  const contactId = searchParams.get('id');
  const isEditMode = !!contactId;

  const [userRoles, setUserRoles] = useState([]);
  const [readonly, setReadonly] = useState('');
  const [disabled, setDisabled] = useState('');
  const [isAffiliateUser, setIsAffiliateUser] = useState(0);

  const [sources, setSources] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [businessLeads, setBusinessLeads] = useState([]);
  const [salesUsers, setSalesUsers] = useState([]);
  const [affiliateUsers, setAffiliateUsers] = useState([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    title: '',
    alias: '',
    businessName: '',
    jobTitle: '',
    email: '',
    phone: '',
    phoneType: 'Office',
    phoneExt: '',
    secondaryPhone: '',
    secondaryPhoneType: 'Mobile',
    secondaryEmail: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    contactType: 'primary',
    birthdate: '',
    department: '',
    aptSuiteHouse: '',
    dnd: 'No',
    referralType: '',
    contactReferral: '',
    zipCode: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Add new state for selected leads
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [leadId, setLeadId] = useState(null);

  useEffect(() => {
    document.title = "Create Contact - Occams Portal";
  }, []);

  // Unified error handler
  const handleApiError = (error, contextMessage = 'Error') => {
    console.error(`${contextMessage}:`, error);
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred. Please try again later.';

    setError(`${contextMessage} ${errorMessage}`);
    setIsLoading(false);

    if (error.response?.status === 401) {
      setError("Your session has expired. Please log in again.");
    }
  };

  // 1. User Authentication Check
  const checkUserAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to access this page');
        return false;
      }
      return true;
    } catch (error) {
      handleApiError(error, 'Authentication check failed:');
      return false;
    }
  };

  // 2. User Roles and Permissions Check
  const checkUserPermissions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/oc/v1/current-user`, getApiConfig());
      if (response.data?.data) {
        const userData = response.data.data;
        setUserRoles(userData.roles || []);
        setReadonly(userData.readonly || '');
        setDisabled(userData.disabled || '');
        setIsAffiliateUser(userData.affiliate_user || 0);

        // Check if user has required permissions
        const hasEditPermission = userData.roles?.includes('administrator') || 
                                userData.roles?.includes('editor');
        const hasCreatePermission = hasEditPermission || 
                                  userData.roles?.includes('author');

        if (isEditMode && !hasEditPermission) {
          setError('You do not have permission to edit contacts');
          return false;
        }
        if (!isEditMode && !hasCreatePermission) {
          setError('You do not have permission to create contacts');
          return false;
        }
        return true;
      }
      return false;
    } catch (error) {
      handleApiError(error, 'Permission check failed:');
      return false;
    }
  };

  // 3. Contact Access Check (for edit mode)
  const checkContactAccess = async () => {
    if (!isEditMode) return true;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/portalapi/v1/lead-contact-data/${contactId}`,
        getApiConfig()
      );
      if (response.data?.data) {
        // Check if user has access to this contact
        const contactData = response.data.data;
        const isAdmin = userRoles.includes('administrator');
        const isEditor = userRoles.includes('editor');
        const isAuthor = userRoles.includes('author');
        
        if (isAdmin || isEditor) return true;
        if (isAuthor && contactData.created_by === userData.id) return true;
        
        setError('You do not have access to this contact');
        return false;
      }
      return false;
    } catch (error) {
      handleApiError(error, 'Contact access check failed:');
      return false;
    }
  };

  // 4. Initialize Data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoadingData(true);
      try {
        // 1. Check Authentication
        const isAuthenticated = await checkUserAuth();
        if (!isAuthenticated) return;

        // 2. Check Permissions
        const hasPermissions = await checkUserPermissions();
        if (!hasPermissions) return;

        // 3. Check Contact Access (if in edit mode)
        const hasAccess = await checkContactAccess();
        if (!hasAccess) return;

        // 4. Fetch All Required Data
        await Promise.all([
          fetchSources(),
          fetchCampaigns(),
          fetchBusinessLeads(),
          fetchSalesUsers(),
          fetchAffiliateUsers()
        ]);

        // 5. Fetch Contact Data (if in edit mode)
        if (isEditMode) {
          await fetchContactData();
        }

      } catch (error) {
        handleApiError(error, 'Error initializing data:');
      } finally {
        setIsLoadingData(false);
      }
    };

    initializeData();
  }, [contactId]);

  const fetchSources = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/portalapi/v1/sources`, getApiConfig(false));
      if (response.data?.data) {
        setSources(response.data.data);
      }
    } catch (error) {
      handleApiError(error, 'Error fetching sources:');
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/portalapi/v1/iris-campaigns`, getApiConfig(false));
      if (response.data?.data) {
        setCampaigns(response.data.data);
      }
    } catch (error) {
      handleApiError(error, 'Error fetching campaigns:');
    }
  };

  const fetchBusinessLeads = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/oc/v1/business-leads`, getApiConfig());
      if (response.data?.data) {
        const options = response.data.data.map(business => ({
          value: business.lead_id,
          label: business.business_legal_name
        }));
        setBusinessLeads(options);
      }
    } catch (error) {
      handleApiError(error, 'Error fetching business leads:');
    }
  };

  const fetchSalesUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/oc/v1/sales-users`, getApiConfig());
      if (response.data?.data) {
        setSalesUsers(response.data.data);
      }
    } catch (error) {
      handleApiError(error, 'Error fetching sales users:');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchAffiliateUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/oc/v1/affiliate-users`, getApiConfig());
      if (response.data?.data) {
        setAffiliateUsers(response.data.data);
      }
    } catch (error) {
      handleApiError(error, 'Error fetching affiliate users:');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchContactData = async () => {
    if (!contactId) return;
    setIsLoading(true);
    try {
      // Fetch contact data
      const response = await axios.get(
        `${API_BASE_URL}/portalapi/v1/lead-contact-data/${contactId}`,
        getApiConfig()
      );
      
      if (response.data?.data) {
        setFormData(response.data.data);
      }

      // Fetch selected leads for this contact
      const leadsResponse = await axios.get(
        `${API_BASE_URL}/portalapi/v1/contact-leads/${contactId}`,
        getApiConfig()
      );
      
      if (leadsResponse.data?.data) {
        const leadIds = leadsResponse.data.data.map(lead => lead.lead_id);
        const selectedLeads = leadIds.map(id => {
          const lead = businessLeads.find(l => l.value === id);
          return lead || { value: id, label: `Business ${id}` };
        });
        setFormData(prev => ({
          ...prev,
          businessName: selectedLeads
        }));
      }
    } catch (error) {
      handleApiError(error, 'Error fetching contact data:');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isAffiliateUser === 1 && ["businessName", "jobTitle"].includes(name)) {
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update handleSelectChange
  const handleSelectChange = (selectedOption, actionMeta) => {
    const { name } = actionMeta;
    if (name === 'businessName') {
      // Filter out 'new_lead' if other options are selected
      const filteredOptions = selectedOption?.filter(option => 
        option.value === 'new_lead' || !selectedOption.some(opt => 
          opt.value !== 'new_lead' && opt.value !== option.value
        )
      ) || [];
      
      setFormData(prev => ({
        ...prev,
        [name]: filteredOptions
      }));
    } else {
      // For other selects, handle single selection
      setFormData(prev => ({
        ...prev,
        [name]: selectedOption ? selectedOption.value : ''
      }));
    }
  };

  // 5. Form Submission with Security Checks
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      // Check permissions again before submission
      const hasPermissions = await checkUserPermissions();
      if (!hasPermissions) {
        setIsLoading(false);
        return;
      }

      // Prepare data for submission
      const submitData = {
        ...formData,
        user_id: userData?.id,
        is_affiliate: isAffiliateUser
      };

      const url = isEditMode
        ? `${API_BASE_URL}/portalapi/v1/leads/${contactId}`
        : `${API_BASE_URL}/portalapi/v1/leads`;

      const method = isEditMode ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data: submitData,
        ...getApiConfig()
      });

      if (response.data?.status === 'success') {
        setMessage(isEditMode ? 'Contact updated successfully!' : 'Contact created successfully!');
        if (!isEditMode) {
          // Reset form with all fields
          setFormData({
            firstName: '',
            lastName: '',
            middleName: '',
            title: '',
            alias: '',
            businessName: '',
            jobTitle: '',
            email: '',
            phone: '',
            phoneType: 'Office',
            phoneExt: '',
            secondaryPhone: '',
            secondaryPhoneType: 'Mobile',
            secondaryEmail: '',
            address: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
            contactType: 'primary',
            birthdate: '',
            department: '',
            aptSuiteHouse: '',
            dnd: 'No',
            referralType: '',
            contactReferral: '',
            zipCode: '',
          });
        }
      }
    } catch (error) {
      handleApiError(error, 'Error saving contact:');
    } finally {
      setIsLoading(false);
    }
  };

  // Title options
  const titleOptions = [
    { value: 'Mr', label: 'Mr' },
    { value: 'Mrs', label: 'Mrs' },
    { value: 'Miss', label: 'Miss' }
  ];

  // Phone type options
  const phoneTypeOptions = [
    { value: 'Office', label: 'Office' },
    { value: 'Mobile', label: 'Mobile' },
    { value: 'Home', label: 'Home' },
    { value: 'Other', label: 'Other' }
  ];

  // DND options
  const dndOptions = [
    { value: 'No', label: 'No' },
    { value: 'Yes', label: 'Yes' }
  ];

  // Referral type options
  const referralTypeOptions = [
    { value: '', label: 'Select Referral Type' },
    { value: 'Internal Users', label: 'Internal Users' },
    { value: 'Affiliate Users', label: 'Affiliate Users' }
  ];

  if (isLoadingData) {
    return <div>Loading...</div>;
  }

  return (
    <div id="user-creation-form-container">
      <div className="main_content_iner">
        <div className="container-fluid p-0">
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div className="white_card card_height_100 mb_30">
                <div className="white_card_header">
                  <div className="box_header m-0 new_report_header">
                    <div className="title_img">
                      <img src="/reporting/assets/images/Knowledge_Ceter_White.svg" className="page-title-img" alt="" />
                      <h4 className="text-white">Create Contact</h4>
                    </div>
                  </div>
                </div>
                <div className="white_card_body">
                  <form onSubmit={handleSubmit} id="user-creation-form">
                    <div className="row">

                      {/* PROFESSIONAL INFO SECTION */}
                      <div className="form-section">
                        <h4 className="section-title">Professional Info</h4>
                        <div className="row">
                          <div className="floating col-sm-4">
                            <label>First Name*</label>
                            <div className="input-group">
                              <select
                                name="title"
                                id="title"
                                className="form-select title-select"
                                value={formData.title}
                                onChange={handleChange}
                                required
                              >
                                <option value="">Select Title</option>
                                {titleOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <input
                                className="floating__input form-control wmd_editor wmm"
                                name="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="floating col-sm-4">
                            <label>Middle Name</label>
                            <input
                              className="floating__input form-control wmd_editor wmm"
                              name="middleName"
                              type="text"
                              value={formData.middleName}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="floating col-sm-4">
                            <label>Last Name*</label>
                            <input
                              className="floating__input form-control wmd_editor wmm"
                              name="lastName"
                              type="text"
                              value={formData.lastName}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="floating col-sm-4">
                            <label>Alias</label>
                            <input
                              className="floating__input form-control wmd_editor wmm"
                              name="alias"
                              type="text"
                              value={formData.alias}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="floating col-sm-4">
                            <label>Business Name*</label>
                            <Select
                              name="businessName"
                              id="businessName"
                              options={[
                                ...businessLeads,
                                { value: 'new_lead', label: 'Send Lead (New Business)' }
                              ]}
                              value={formData.businessName}
                              onChange={handleSelectChange}
                              isMulti
                              className="basic-multi-select"
                              classNamePrefix="select"
                              isDisabled={isAffiliateUser === 1}
                              placeholder="Select Lead"
                              required
                            />
                          </div>
                          <div className="floating col-sm-4">
                            <label>Job Title</label>
                            <input
                              className="floating__input form-control wmd_editor wmm"
                              name="jobTitle"
                              type="text"
                              value={formData.jobTitle}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>

                      {/* PERSONAL INFO SECTION */}
                      <div className="form-section">
                        <h4 className="section-title">Personal Info</h4>
                        <div className="row">
                          <div className="floating col-sm-4">
                            <label>Birth Date</label>
                            <input
                              type="text"
                              className="floating__input form-control wmd_editor wmm"
                              name="birthdate"
                              value={formData.birthdate}
                              onChange={handleChange}
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                      </div>

                      {/* CONTACT INFO SECTION */}
                      <div className="form-section">
                        <h4 className="section-title">Contact Info</h4>
                        <div className="row">
                          <div className="floating col-sm-4">
                            <label>Primary Email*</label>
                            <input
                              type="email"
                              className="floating__input form-control wmd_editor wmm"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="floating col-sm-4">
                            <label>Primary Phone*</label>
                            <div className="input-group">
                              <span className="input-group-text">+1</span>
                              <input
                                type="tel"
                                className="floating__input form-control wmd_editor wmm"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="floating col-sm-4">
                            <label>Ext.</label>
                            <input
                              type="text"
                              className="floating__input form-control wmd_editor wmm"
                              name="phoneExt"
                              value={formData.phoneExt}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="floating col-sm-4">
                            <label>Primary Phone Type</label>
                            <Select
                              name="phoneType"
                              id="phoneType"
                              options={phoneTypeOptions}
                              value={phoneTypeOptions.find(option => option.value === formData.phoneType)}
                              onChange={handleSelectChange}
                              className="basic-single-select"
                              classNamePrefix="select"
                              isSearchable={false}
                              required
                            />
                          </div>
                          <div className="floating col-sm-4">
                            <label>Secondary Email</label>
                            <input
                              type="email"
                              className="floating__input form-control wmd_editor wmm"
                              name="secondaryEmail"
                              value={formData.secondaryEmail}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="floating col-sm-4">
                            <label>Secondary Phone</label>
                            <div className="input-group">
                              <span className="input-group-text">+1</span>
                              <input
                                type="tel"
                                className="floating__input form-control wmd_editor wmm"
                                name="secondaryPhone"
                                value={formData.secondaryPhone}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                          <div className="floating col-sm-4">
                            <label>Secondary Phone Type</label>
                            <Select
                              name="secondaryPhoneType"
                              id="secondaryPhoneType"
                              options={phoneTypeOptions}
                              value={phoneTypeOptions.find(option => option.value === formData.secondaryPhoneType)}
                              onChange={handleSelectChange}
                              className="basic-single-select"
                              classNamePrefix="select"
                              isSearchable={false}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* MAILING INFO SECTION */}
                      <div className="form-section">
                        <h4 className="section-title">Mailing Info</h4>
                        <div className="row">
                          {/* First Row */}
                          <div className="floating col-sm-4">
                            <label>Zip Code</label>
                            <input
                              type="text"
                              className="floating__input form-control wmd_editor wmm"
                              name="zipCode"
                              value={formData.zipCode}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="floating col-sm-4">
                            <label>City</label>
                            <input
                              type="text"
                              className="floating__input form-control wmd_editor wmm"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="floating col-sm-4">
                            <label>State</label>
                            <input
                              type="text"
                              className="floating__input form-control wmd_editor wmm"
                              name="state"
                              value={formData.state}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="row">
                           {/* Second Row */}
                           <div className="floating col-sm-4">
                            <label>Country</label>
                            <input
                              type="text"
                              className="floating__input form-control wmd_editor wmm"
                              name="country"
                              value={formData.country}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="floating col-sm-4">
                            <label>Street Address</label>
                            <input
                              type="text"
                              className="floating__input form-control wmd_editor wmm"
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="floating col-sm-4">
                            <label>Apt/Suite/House</label>
                            <input
                              type="text"
                              className="floating__input form-control wmd_editor wmm"
                              name="aptSuiteHouse"
                              value={formData.aptSuiteHouse}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>

                      {/* CONTACT PREFERENCES SECTION */}
                      <div className="form-section">
                        <h4 className="section-title">Contact Preferences</h4>
                        <div className="row">
                          <div className="floating col-sm-4">
                            <label>DND*</label>
                            <Select
                              name="dnd"
                              id="dnd"
                              options={dndOptions}
                              value={dndOptions.find(option => option.value === formData.dnd)}
                              onChange={handleSelectChange}
                              className="basic-single-select"
                              classNamePrefix="select"
                              isSearchable={false}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* REFERRAL INFO SECTION */}
                      <div className="form-section">
                        <h4 className="section-title">Referral Info</h4>
                        <div className="row">
                          <div className="floating col-sm-4">
                            <label>Referral Type*</label>
                            <Select
                              name="referralType"
                              id="referralType"
                              options={referralTypeOptions}
                              value={referralTypeOptions.find(option => option.value === formData.referralType)}
                              onChange={handleSelectChange}
                              className="basic-single-select"
                              classNamePrefix="select"
                              isSearchable={false}
                              required
                              isDisabled={disabled === 'disabled'}
                            />
                          </div>
                           <div className="floating col-sm-4">
                            <label>Contact Referral*</label>
                            <Select
                              name="contactReferral"
                              id="contactReferral"
                              options={formData.referralType === 'Internal Users' ? salesUsers : affiliateUsers}
                              value={formData.contactReferral}
                              onChange={handleSelectChange}
                              className="basic-single-select"
                              classNamePrefix="select"
                              isLoading={isLoadingUsers}
                              isDisabled={isLoadingUsers || disabled === 'disabled' || !formData.referralType}
                              placeholder="Select Contact Referral"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Submit button */}
                      <div className="floating col-sm-12">
                        <button type="submit" id="create-contact-button" className="sendDoc" disabled={isLoading}>
                          {isLoading ? 'Creating...' : 'Create Contact'}
                        </button>
                      </div>

                    </div>
                  </form>
                  {isLoading && (
                    <div id="waiter">
                      <img src="/assets/images/waiter.gif" alt="Loading..." />
                    </div>
                  )}
                  {message && <div id="creation-message" className="alert alert-success mt-3">{message}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContact; 

