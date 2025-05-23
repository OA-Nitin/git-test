import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import Select from 'react-select';
import './common/ReportStyle.css';
import './LeadDetail.css'; // Reusing the same CSS
import './DocumentTable.css'; // Document table styling
import Notes from './common/Notes';
import { getAssetPath } from '../utils/assetUtils';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const passedProjectData = location.state?.projectData;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('project');
  const [taxNowSignupStatus, setTaxNowSignupStatus] = useState('');
  const [taxNowOnboardingStatus, setTaxNowOnboardingStatus] = useState('');
  const [companyFolderLink, setCompanyFolderLink] = useState('');
  const [documentFolderLink, setDocumentFolderLink] = useState('');

  // State for bank information
  const [bankInfo, setBankInfo] = useState({
    bank_name: '',
    bank_mailing_address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    bank_phone: '',
    account_holder_name: '',
    account_type: '1', // Default to "1" (N/A)
    other: '',
    aba_routing_number: '',
    account_number: '',
    swift: '',
    iban: ''
  });
  const [bankInfoLoading, setBankInfoLoading] = useState(false);
  const [bankInfoError, setBankInfoError] = useState(null);

  // State for intake information
  const [intakeInfo, setIntakeInfo] = useState({
    w2_employees_count: '',
    initial_retain_fee_amount: '',
    w2_ee_difference_count: '',
    balance_retainer_fee: '',
    total_max_erc_amount: '',
    total_estimated_fees: '',
    affiliate_referral_fees: '',
    sdgr: 'No',
    average_employee_count_2019: '',
    fee_type: '',
    custom_fee: '',
    eligible_quarters: '',
    welcome_email: '',
    invoice_initial_retainer: '',
    retainer_payment_date: '',
    retainer_payment_channel: '',
    retainer_payment_returned: '',
    ret_payment_return_reason: '',
    retainer_refund_date: '',
    retainer_refund_amount: '',
    retainer_payment_amount: '',
    retainer_payment_type: '',
    ret_retainer_invoiced: '',
    ret_retainer_sent_date: '',
    ret_retainer_pay_date: '',
    ret_retainer_clear_date: '',
    ret_retainer_return_date: '',
    ret_retainer_return_reason: '',
    interest_percentage: '',
    net_no: '',
    coi_aoi: '',
    voided_check: '',
    tax_return_2019: '',
    tax_return_2020: '',
    financials_2021: '',
    q1_2020: '',
    q2_2020: '',
    q3_2020: '',
    q4_2020: '',
    q1_2021: '',
    q2_2021: '',
    q3_2021: '',
    payroll_register_2020_q1: '',
    payroll_register_2020_q2: '',
    payroll_register_2020_q3: '',
    payroll_register_2020_q4: '',
    payroll_register_2021_q1: '',
    payroll_register_2021_q2: '',
    payroll_register_2021_q3: '',
    f911_status: '',
    ppp_2020_applied: '',
    ppp_2020_start_date: '',
    ppp_2020_forgiveness_applied: '',
    ppp_2020_end_date: '',
    ppp_2020_amount: '',
    ppp_2020_wages_allocated: '',
    ppp_2021_applied: '',
    ppp_2021_start_date: '',
    ppp_2021_forgiveness_applied: '',
    ppp_2021_end_date: '',
    ppp_2021_amount: '',
    ppp_2021_wages_allocated: '',
    additional_comments: '',
    attorney_name: '',
    call_date: '',
    call_time: '',
    memo_received_date: '',
    memo_cut_off_date: ''
  });
  const [intakeInfoLoading, setIntakeInfoLoading] = useState(false);
  const [intakeInfoError, setIntakeInfoError] = useState(null);

  // State for fees information
  const [feesInfo, setFeesInfo] = useState({
    error_discovered_date: '',
    q2_2020_941_wages: '',
    q3_2020_941_wages: '',
    q4_2020_941_wages: '',
    q1_2021_941_wages: '',
    q2_2021_941_wages: '',
    q3_2021_941_wages: '',
    q4_2021_941_wages: '',
    internal_sales_agent: '',
    internal_sales_support: '',
    affiliate_name: '',
    affiliate_percentage: '',
    erc_claim_filed: '',
    erc_amount_received: '',
    total_erc_fee: '',
    legal_fees: '',
    total_erc_fees_paid: '',
    total_erc_fees_pending: '',
    total_occams_share: '',
    total_aff_ref_share: '',
    retain_occams_share: '',
    retain_aff_ref_share: '',
    bal_retain_occams_share: '',
    total_occams_share_paid: '',
    total_aff_ref_share_paid: '',
    total_occams_share_pending: '',
    total_aff_ref_share_pending: '',
    q1_2020_max_erc_amount: '',
    q2_2020_max_erc_amount: '',
    q3_2020_max_erc_amount: '',
    q4_2020_max_erc_amount: '',
    q1_2021_max_erc_amount: '',
    q2_2021_max_erc_amount: '',
    q3_2021_max_erc_amount: '',
    q4_2021_max_erc_amount: '',
    // ERC Filed Quarter wise 2020 fields
    q1_2020_filed_status: false,
    q1_2020_filing_date: '',
    q1_2020_amount_filed: '',
    q1_2020_benefits: '',
    q1_2020_eligibility_basis: 'N/A',
    q2_2020_filed_status: false,
    q2_2020_filing_date: '',
    q2_2020_amount_filed: '',
    q2_2020_benefits: '',
    q2_2020_eligibility_basis: 'N/A',
    q3_2020_filed_status: false,
    q3_2020_filing_date: '',
    q3_2020_amount_filed: '',
    q3_2020_benefits: '',
    q3_2020_eligibility_basis: 'N/A',
    q4_2020_filed_status: false,
    q4_2020_filing_date: '',
    q4_2020_amount_filed: '',
    q4_2020_benefits: '',
    q4_2020_eligibility_basis: 'N/A',
    // ERC Filed Quarter wise 2021 fields
    q1_2021_filed_status: false,
    q1_2021_filing_date: '',
    q1_2021_amount_filed: '',
    q1_2021_benefits: '',
    q1_2021_eligibility_basis: 'N/A',
    q2_2021_filed_status: false,
    q2_2021_filing_date: '',
    q2_2021_amount_filed: '',
    q2_2021_benefits: '',
    q2_2021_eligibility_basis: 'N/A',
    q3_2021_filed_status: false,
    q3_2021_filing_date: '',
    q3_2021_amount_filed: '',
    q3_2021_benefits: '',
    q3_2021_eligibility_basis: 'N/A',
    q4_2021_filed_status: false,
    q4_2021_filing_date: '',
    q4_2021_amount_filed: '',
    q4_2021_benefits: '',
    q4_2021_eligibility_basis: 'N/A',
    // ERC Letter, Check & Amount 2020 fields
    q1_2020_loop: '',
    q1_2020_letter: false,
    q1_2020_check: false,
    q1_2020_chq_amt: '',
    q2_2020_loop: '',
    q2_2020_letter: false,
    q2_2020_check: false,
    q2_2020_chq_amt: '',
    q3_2020_loop: '',
    q3_2020_letter: false,
    q3_2020_check: false,
    q3_2020_chq_amt: '',
    q4_2020_loop: '',
    q4_2020_letter: false,
    q4_2020_check: false,
    q4_2020_chq_amt: '',
    // ERC Letter, Check & Amount 2021 fields
    q1_2021_loop: '',
    q1_2021_letter: false,
    q1_2021_check: false,
    q1_2021_chq_amt: '',
    q2_2021_loop: '',
    q2_2021_letter: false,
    q2_2021_check: false,
    q2_2021_chq_amt: '',
    q3_2021_loop: '',
    q3_2021_letter: false,
    q3_2021_check: false,
    q3_2021_chq_amt: '',
    q4_2021_loop: '',
    q4_2021_letter: false,
    q4_2021_check: false,
    q4_2021_chq_amt: '',
    // Success Fee Invoice Details - I Invoice
    i_invoice_number: '',
    i_invoice_amount: '',
    i_invoiced_qtrs: '',
    i_invoice_sent_date: '',
    i_invoice_payment_type: '',
    i_invoice_payment_date: '',
    i_invoice_pay_cleared: '',
    i_invoice_pay_returned: '',
    i_invoice_return_reason: '',
    i_invoice_occams_share: '',
    i_invoice_affref_share: '',
    // Success Fee Invoice Details - II Invoice
    ii_invoice_number: '',
    ii_invoice_amount: '',
    ii_invoiced_qtrs: '',
    ii_invoice_sent_date: '',
    ii_invoice_payment_type: '',
    ii_invoice_payment_date: '',
    ii_invoice_pay_cleared: '',
    ii_invoice_pay_returned: '',
    ii_invoice_return_reason: '',
    ii_invoice_occams_share: '',
    ii_invoice_affref_share: '',
    // Success Fee Invoice Details - III Invoice
    iii_invoice_number: '',
    iii_invoice_amount: '',
    iii_invoiced_qtrs: '',
    iii_invoice_sent_date: '',
    iii_invoice_payment_type: '',
    iii_invoice_payment_date: '',
    iii_invoice_pay_cleared: '',
    iii_invoice_pay_returned: '',
    iii_invoice_return_reason: '',
    iii_invoice_occams_share: '',
    iii_invoice_affref_share: '',
    // Success Fee Invoice Details - IV Invoice
    iv_invoice_number: '',
    iv_invoice_amount: '',
    iv_invoiced_qtrs: '',
    iv_invoice_sent_date: '',
    iv_invoice_payment_type: '',
    iv_invoice_payment_date: '',
    iv_invoice_pay_cleared: '',
    iv_invoice_pay_returned: '',
    iv_invoice_return_reason: '',
    iv_invoice_occams_share: '',
    iv_invoice_affref_share: ''
  });
  const [feesInfoLoading, setFeesInfoLoading] = useState(false);
  const [feesInfoError, setFeesInfoError] = useState(null);

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
    name: 'CTCERC Play',
    email: 'shivraj.patil@occmasadvisory.com',
    phone: '(454) 645-6456',
    initials: 'CP'
  });
  const [secondaryContact, setSecondaryContact] = useState({
    name: 'STC Play',
    email: 'coraja1431@cartep.com',
    phone: '(234) 234-2342',
    initials: 'SP'
  });

  // Project group, campaign, source, and stage state
  const [owner, setOwner] = useState({ value: 'erc-fprs', label: 'ERC - FPRS' });
  const [projectCampaign, setProjectCampaign] = useState(null);
  const [projectSource, setProjectSource] = useState(null);
  const [projectStage, setProjectStage] = useState({ value: 'client-declarations-signed', label: 'Client Declarations Signed' });

  // Milestone, Stage, Owner, and Contact edit state
  const [milestone, setMilestone] = useState({ value: 'erc-fulfillment', label: 'ERC Fulfillment' });
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [selectedContact, setSelectedContact] = useState({ value: 'sunny-shekhar', label: 'Sunny Shekhar' });
  const [isEditingContact, setIsEditingContact] = useState(false);

  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    document.title = `Project #${projectId} - Occams Portal`;
    console.log('ProjectDetail component mounted, fetching project details for ID:', projectId);
    console.log('Project ID type:', typeof projectId);
    fetchProjectDetails();
  }, [projectId]);

  // Reset onboarding status when signup status changes
  useEffect(() => {
    setTaxNowOnboardingStatus('');
  }, [taxNowSignupStatus]);

  // Fetch notes when component loads
  useEffect(() => {
    if (project && notes.length === 0) {
      fetchNotes();
    }
  }, [project]);

  // Fetch user data when component loads
  useEffect(() => {
    fetchUserData();
  }, []);

  // Update folder links based on product ID and API response
  useEffect(() => {
    if (project) {
      console.log('Project data for folder links:', project);
      console.log('Product ID for folder links:', project.product_id);

      // Log folder links from API
      console.log('Company folder link from API:', project.company_folder_link);
      console.log('ERC document folder from API:', project.erc_document_folder);
      console.log('STC document folder from API:', project.stc_document_folder);
      console.log('Agreement folder from API:', project.agreement_folder);

      if (project.product_id === "935") {
        // ERC product
        console.log('Setting ERC folder links');
        // Use API values if available, otherwise use default values
        setCompanyFolderLink(project.company_folder_link || '');
        setDocumentFolderLink(project.erc_document_folder || '');
      } else if (project.product_id === "937") {
        // STC product
        console.log('Setting STC folder links');
        // Use API values if available, otherwise use default values
        setCompanyFolderLink(project.agreement_folder || '');
        setDocumentFolderLink(project.stc_document_folder || '');
      } else {
        console.log('Product ID not recognized:', project.product_id);
        // Set default values if product ID is not recognized
        setCompanyFolderLink(project.company_folder_link || '');
        setDocumentFolderLink(project.erc_document_folder || project.stc_document_folder || '');
      }
    }
  }, [project]);

  // Handle tab visibility based on product ID
  useEffect(() => {
    if (project) {
      const productId = project.product_id;
      console.log(`Tab visibility check: Product ID ${productId}, Active Tab: ${activeTab}`);

      // Check if current active tab should be hidden for this product
      const shouldHideBankInfo = (productId === '937' || productId === '932') && activeTab === 'bankInfo';
      const shouldHideIntake = (productId === '937' || productId === '932') && activeTab === 'intake';
      const shouldHideFees = (productId === '937' || productId === '932') && activeTab === 'fees';
      const shouldHideDocuments = productId === '932' && activeTab === 'documents';

      console.log(`Tab visibility: BankInfo hidden: ${productId === '937' || productId === '932'}, Intake hidden: ${productId === '937' || productId === '932'}, Fees hidden: ${productId === '937' || productId === '932'}, Documents hidden: ${productId === '932'}`);

      // If current tab should be hidden, switch to project tab
      if (shouldHideBankInfo || shouldHideIntake || shouldHideFees || shouldHideDocuments) {
        console.log(`Switching from hidden tab ${activeTab} to project tab for product ID ${productId}`);
        setActiveTab('project');
      }
    }
  }, [project, activeTab]);

  // Function to fetch dummy user data
  const fetchUserData = () => {
    // Dummy user data
    const dummyUsers = [
      { id: 1, name: 'Adriana Salcedo', role: 'FPRS ERC Sales Agent', avatar: 'AS' },
      { id: 2, name: 'Alex Wasyl', role: 'Affiliate', avatar: 'AW' },
      { id: 3, name: 'Amber Kellogg', role: 'Occams Sales Agents', avatar: 'AK' }
    ];

    // Set initial assigned user
    setAssignedUsers([dummyUsers[0]]);

    // Format options for react-select
    const options = dummyUsers.map(user => ({
      value: user.id,
      label: (
        <div className="d-flex align-items-center">
          <span>{user.name} ({user.role})</span>
        </div>
      ),
      user: user
    }));

    setUserOptions(options);
  };

  const fetchProjectDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // If we have project data passed from the report page, use it
      if (passedProjectData) {
        console.log('Using passed project data:', passedProjectData);
        setProject(passedProjectData);

        // Set TaxNow status if available
        if (passedProjectData.taxnow_signup_status) {
          setTaxNowSignupStatus(passedProjectData.taxnow_signup_status);
        }
        if (passedProjectData.taxnow_onboarding_status) {
          setTaxNowOnboardingStatus(passedProjectData.taxnow_onboarding_status);
        }

        setLoading(false);
      } else {
        // Otherwise fetch from API
        console.log('No passed data, fetching from API');

        try {
          // Make a POST request to the project info API
          const projectIdToUse = projectId || "1700";
          console.log('Making API request with project_id:', projectIdToUse);

          console.log('Sending API request to:', 'http://localhost:3002/products-api/get-project-info');
          console.log('Request body:', JSON.stringify({ project_id: projectIdToUse }));

          let response;
          try {
            // First try the proxy server
            response = await fetch('http://localhost:3002/products-api/get-project-info', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ project_id: projectIdToUse }),
              mode: 'cors',
              credentials: 'same-origin',
            });

            console.log('API response status:', response.status);

            // Check if response is ok
            if (!response.ok) {
              throw new Error(`API request failed with status ${response.status}`);
            }

            // Try to parse the response as JSON
            const responseText = await response.text();
            console.log('API response text:', responseText);

            try {
              // Try to parse the response as JSON
              const responseData = JSON.parse(responseText);

              // Check if the response contains an error
              if (responseData.code === 'internal_server_error') {
                throw new Error(`API returned error: ${responseData.message}`);
              }

              // Set the response for further processing
              response = new Response(responseText, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
              });
            } catch (jsonError) {
              console.error('Error parsing JSON response:', jsonError);
              throw new Error('Invalid JSON response from API');
            }
          } catch (fetchError) {
            console.error('Fetch error with proxy server:', fetchError);

            // If proxy server fails, try direct API
            try {
              console.log('Trying direct API request');
              response = await fetch('https://play.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-project-info', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ project_id: projectIdToUse }),
                mode: 'cors',
              });

              console.log('Direct API response status:', response.status);

              // Check if response is ok
              if (!response.ok) {
                throw new Error(`Direct API request failed with status ${response.status}`);
              }

              // Try to parse the response as JSON
              const responseText = await response.text();
              console.log('Direct API response text:', responseText);

              try {
                // Try to parse the response as JSON
                const responseData = JSON.parse(responseText);

                // Check if the response contains an error
                if (responseData.code === 'internal_server_error') {
                  throw new Error(`API returned error: ${responseData.message}`);
                }

                // Set the response for further processing
                response = new Response(responseText, {
                  status: response.status,
                  statusText: response.statusText,
                  headers: response.headers
                });
              } catch (jsonError) {
                console.error('Error parsing JSON response from direct API:', jsonError);
                throw new Error('Invalid JSON response from direct API');
              }
            } catch (directApiError) {
              console.error('Direct API fetch error:', directApiError);
              throw directApiError;
            }
          }

          const data = await response.json();
          console.log('Project data from API:', data);

          if (data && (data.success || data.status === 1)) {
            // Map the API response to our project structure
            const projectData = data.data || data.result?.[0] || {};

            console.log('Raw project data from API:', projectData);

            // Log all available fields in the API response
            console.log('Available fields in API response:', Object.keys(projectData));

            // Check for lead ID field
            console.log('Lead ID field:', {
              lead_id: projectData.lead_id,
              leadId: projectData.leadId,
              lead: projectData.lead
            });

            // Check for folder link fields
            console.log('Folder link fields:', {
              erc_document_folder: projectData.erc_document_folder,
              company_folder: projectData.company_folder,
              company_folder_link: projectData.company_folder_link
            });

            // Check for document number related fields
            console.log('Document number fields:', {
              document_number: projectData.document_number,
              identity_document_number: projectData.identity_document_number,
              document_id: projectData.document_id,
              id_number: projectData.id_number
            });

            // Check for website and business entity type fields
            console.log('Website and business entity type fields:', {
              website_url: projectData.website_url,
              business_website: projectData.business_website,
              company_website: projectData.company_website,
              business_type: projectData.business_type,
              business_entity_type: projectData.business_entity_type
            });

            // Log the product_id from API
            console.log('Product ID from API:', projectData.product_id);

            const mappedProject = {
              // Project details
              project_id: projectData.project_id || projectIdToUse,
              product_id: projectData.product_id || "",
              project_name: projectData.project_name || "",
              product_name: projectData.product_name || "",
              project_fee: projectData.project_fee || "",
              milestone: projectData.milestone || "",
              stage_name: projectData.stage_name || "",
              created_at: projectData.created_at || "",
              collaborators: projectData.collaborators || "",
              taxnow_signup_status: projectData.taxnow_signup_status || "",

              // Lead ID - used for navigation to lead detail page
              lead_id: projectData.lead_id || projectData.leadId || projectData.lead || "",

              // Personal Info
              full_name: projectData.authorized_signatory_name || "",
              contact_no: projectData.business_phone || "",
              email: projectData.business_email || "",
              title: projectData.business_title || "",
              zip: projectData.zip || "",
              street_address: projectData.street_address || "",
              city: projectData.city || "",
              state: projectData.state || "",
              identity_document_type: projectData.identity_document_type || "",
              document_number: projectData.document_number || projectData.identity_document_number || projectData.document_id || projectData.id_number || "",

              // Business Info
              business_legal_name: projectData.business_legal_name || "",
              doing_business_as: projectData.doing_business_as || "",
              business_category: projectData.business_category || "",
              website_url: projectData.website_url || projectData.business_website || projectData.company_website || "",

              // Business Legal Info
              business_type: projectData.business_entity_type || projectData.business_type || "",
              registration_number: projectData.registration_number || "",
              registration_date: projectData.registration_date || "",
              state_of_registration: projectData.state_of_registration || "",

              // Folder Links
              company_folder_link: projectData.company_folder_link || projectData.company_folder || "",
              erc_document_folder: projectData.erc_document_folder || "",
              stc_document_folder: projectData.stc_document_folder || "",
              agreement_folder: projectData.agreement_folder || ""
            };

            console.log('Mapped project data:', mappedProject);
            console.log('Website URL:', mappedProject.website_url);
            console.log('Product ID:', mappedProject.product_id);
            setProject(mappedProject);
          } else {
            throw new Error('Invalid data received from API');
          }
        } catch (apiError) {
          console.error('Error fetching from API:', apiError);

          // Set a more user-friendly error message
          setError(`The API is currently experiencing issues. Using mock data instead. Error: ${apiError.message}`);

          // Fallback to mock data if API fails
          console.log('Falling back to mock data');
          const mockProject = {
            project_id: projectId,
            product_id: projectId === "1700" ? "935" : "937", // Keep product ID for folder links to work
            lead_id: "9020", // Default lead ID for testing
            business_legal_name: "",
            business_email: "",
            business_phone: "",
            business_address: "",
            city: "",
            state: "",
            zip: "",
            website_url: "",
            business_type: "",
            project_name: "",
            product_name: "",
            milestone: "",
            stage_name: "",
            project_fee: "",
            created_at: "",
            collaborators: "",
            taxnow_signup_status: "",

            // Folder Links - Using sample links for demonstration
            company_folder_link: projectId === "1700" ? "https://bit.ly/erc-company-folder" : "https://bit.ly/stc-agreement-folder",
            erc_document_folder: "https://bit.ly/erc-document-folder",
            stc_document_folder: "https://bit.ly/stc-document-folder",
            agreement_folder: "https://bit.ly/stc-agreement-folder"
          };
          setProject(mockProject);
        } finally {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError(`Failed to fetch project details: ${err.message}`);
      setLoading(false);
    }
  };

  // Function to fetch bank information from the API
  const fetchBankInfo = async () => {
    if (!project?.project_id) return;

    setBankInfoLoading(true);
    setBankInfoError(null);

    try {
      console.log('Fetching bank information for project ID:', project.project_id);

      // Make a POST request to the bank info API
      const response = await fetch('https://play.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-bank-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project_id: project.project_id }),
      });

      console.log('Bank info API response status:', response.status);

      if (!response.ok) {
        throw new Error(`Bank info API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Bank info data from API:', data);

      if (data && data.status === 1) {
        // Extract bank data from the response
        const bankData = data.result && Array.isArray(data.result) ? data.result[0] : data.result;

        console.log('Bank data extracted from API response:', bankData);

        if (bankData) {
          // Update bank info state with the data from API
          setBankInfo({
            bank_name: bankData.bank_name || '',
            bank_mailing_address: bankData.bank_mailing_addres || '', // Note: API has a typo in the field name
            city: bankData.city || '',
            state: bankData.state || '',
            zip: bankData.zip || '',
            country: bankData.country || '',
            bank_phone: bankData.bank_phone || '',
            account_holder_name: bankData.account_holder_name || '',
            account_type: bankData.account_type || '1', // Default to "1" (N/A) if not provided
            other: bankData.other || '',
            aba_routing_number: bankData.aba_routing_number || '',
            account_number: bankData.account_number || '',
            swift: bankData.swift || '',
            iban: bankData.iban || ''
          });
        } else {
          throw new Error('No bank data found in the API response');
        }
      } else {
        throw new Error(`API returned error status: ${data.status}, message: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching bank information:', error);
      setBankInfoError(`Failed to fetch bank information: ${error.message}`);

      // Set empty values for bank info on error
      setBankInfo({
        bank_name: '',
        bank_mailing_address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        bank_phone: '',
        account_holder_name: '',
        account_type: '1', // Default to "1" (N/A)
        other: '',
        aba_routing_number: '',
        account_number: '',
        swift: '',
        iban: ''
      });
    } finally {
      setBankInfoLoading(false);
    }
  };

  // Function to fetch intake information from the API
  const fetchIntakeInfo = async () => {
    if (!project?.project_id) return;

    setIntakeInfoLoading(true);
    setIntakeInfoError(null);

    try {
      console.log('Fetching intake information for project ID:', project.project_id);

      // Make a POST request to the intake info API
      const response = await fetch('https://play.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-project-intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project_id: project.project_id }),
      });

      console.log('Intake info API response status:', response.status);

      if (!response.ok) {
        throw new Error(`Intake info API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Intake info data from API:', data);

      if (data && data.status === 1) {
        // Extract intake data from the response
        const intakeData = data.result && Array.isArray(data.result) ? data.result[0] : data.result;

        console.log('Intake data extracted from API response:', intakeData);

        if (intakeData) {
          // Update intake info state with the data from API
          setIntakeInfo({
            w2_employees_count: intakeData.w2_employees_count || '',
            initial_retain_fee_amount: intakeData.initial_retain_fee_amount || '',
            w2_ee_difference_count: intakeData.w2_ee_difference_count || '',
            balance_retainer_fee: intakeData.balance_retainer_fee || '',
            total_max_erc_amount: intakeData.total_max_erc_amount || '',
            total_estimated_fees: intakeData.total_estimated_fees || '',
            affiliate_referral_fees: intakeData.affiliate_referral_fees || '',
            sdgr: intakeData.sdgr === 'Yes' || intakeData.sdgr === 'yes' || intakeData.sdgr === '1' || intakeData.sdgr === 'true' || intakeData.sdgr === true ? 'Yes' : 'No',
            average_employee_count_2019: intakeData.avg_emp_count_2019 || intakeData.average_employee_count_2019 || '',
            fee_type: intakeData.fee_type || '',
            custom_fee: intakeData.custom_fee || '',
            eligible_quarters: intakeData.eligible_quarters || '',
            welcome_email: intakeData.welcome_email || '',
            invoice_initial_retainer: intakeData.welcome_email || '',
            retainer_payment_date: intakeData.retainer_payment_date || '',
            retainer_payment_channel: intakeData.retainer_payment_cleared || '',
            retainer_payment_returned: intakeData.retainer_payment_returned || '',
            ret_payment_return_reason: intakeData.ret_payment_return_reason || '',
            retainer_refund_date: intakeData.retainer_refund_date || '',
            retainer_refund_amount: intakeData.retainer_refund_amount || '',
            retainer_payment_amount: intakeData.retainer_payment_amount || '',
            retainer_payment_type: intakeData.retainer_payment_type || '',
            ret_retainer_invoiced: intakeData.bal_retainer_invoice_no || intakeData.bal_retainer_invoice || intakeData.ret_retainer_invoiced || '',
            ret_retainer_sent_date: intakeData.bal_retainer_sent_date || intakeData.ret_retainer_sent_date || '',
            ret_retainer_pay_date: intakeData.bal_retainer_pay_date || intakeData.ret_retainer_pay_date || '',
            ret_retainer_clear_date: intakeData.bal_retainer_clear_date || intakeData.ret_retainer_clear_date || '',
            ret_retainer_return_date: intakeData.bal_retainer_return_date || intakeData.ret_retainer_return_date || '',
            ret_retainer_return_reason: intakeData.bal_retainer_return_reaso || intakeData.bal_retainer_return_reason || intakeData.ret_retainer_return_reason || '',
            interest_percentage: intakeData.interest_percentage || '',
            net_no: intakeData.net_no || '',
            coi_aoi: intakeData.coi_aoi || '',
            voided_check: intakeData.voided_check || '',
            tax_return_2019: intakeData['2019_tax_return'] || intakeData.tax_return_2019 || '',
            tax_return_2020: intakeData['2020_tax_return'] || intakeData.tax_return_2020 || '',
            financials_2021: intakeData['2021_financials'] || intakeData.financials_2021 || '',
            q1_2020: intakeData['941_2020_q1'] || intakeData.q1_2020 || '',
            q2_2020: intakeData['941_2020_q2'] || intakeData.q2_2020 || '',
            q3_2020: intakeData['941_2020_q3'] || intakeData.q3_2020 || '',
            q4_2020: intakeData['941_2020_q4'] || intakeData.q4_2020 || '',
            q1_2021: intakeData['941_2021_q1'] || intakeData.q1_2021 || '',
            q2_2021: intakeData['941_2021_q2'] || intakeData.q2_2021 || '',
            q3_2021: intakeData['941_2021_q3'] || intakeData.q3_2021 || '',
            payroll_register_2020_q1: intakeData.payroll_register_2020_q1 || '',
            payroll_register_2020_q2: intakeData.payroll_register_2020_q2 || '',
            payroll_register_2020_q3: intakeData.payroll_register_2020_q3 || '',
            payroll_register_2020_q4: intakeData.payroll_register_2020_q4 || '',
            payroll_register_2021_q1: intakeData.payroll_register_2021_q1 || '',
            payroll_register_2021_q2: intakeData.payroll_register_2021_q2 || '',
            payroll_register_2021_q3: intakeData.payroll_register_2021_q3 || '',
            f911_status: intakeData.f911_status || '',
            ppp_2020_applied: intakeData.ppp_2020_applied || '',
            ppp_2020_start_date: intakeData.ppp_2020_start_date || '',
            ppp_2020_forgiveness_applied: intakeData.ppp_2020_forgiveness_applied || '',
            ppp_2020_end_date: intakeData.ppp_2020_end_date || '',
            ppp_2020_amount: intakeData.ppp_2020_amount || '',
            ppp_2020_wages_allocated: intakeData.ppp_2020_wages_allocated || '',
            ppp_2021_applied: intakeData.ppp_2021_applied || '',
            ppp_2021_start_date: intakeData.ppp_2021_start_date || '',
            ppp_2021_forgiveness_applied: intakeData.ppp_2021_forgiveness_applied || '',
            ppp_2021_end_date: intakeData.ppp_2021_end_date || '',
            ppp_2021_amount: intakeData.ppp_2021_amount || '',
            ppp_2021_wages_allocated: intakeData.ppp_2021_wages_allocated || '',
            additional_comments: intakeData.additional_comment || intakeData.additional_comments || '',
            attorney_name: intakeData.attorney_name || '',
            call_date: intakeData.call_date || '',
            call_time: intakeData.call_time || '',
            memo_received_date: intakeData.memo_received_date || '',
            memo_cut_off_date: intakeData.memo_cut_off_date || ''
          });
        } else {
          throw new Error('No intake data found in the API response');
        }
      } else {
        throw new Error(`API returned error status: ${data.status}, message: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching intake information:', error);
      setIntakeInfoError(`Failed to fetch intake information: ${error.message}`);

      // Set empty values for intake info on error
      setIntakeInfo({
        w2_employees_count: '',
        initial_retain_fee_amount: '',
        w2_ee_difference_count: '',
        balance_retainer_fee: '',
        total_max_erc_amount: '',
        total_estimated_fees: '',
        affiliate_referral_fees: '',
        sdgr: 'No',
        average_employee_count_2019: '',
        fee_type: '',
        custom_fee: '',
        eligible_quarters: '',
        welcome_email: '',
        invoice_initial_retainer: '',
        retainer_payment_date: '',
        retainer_payment_channel: '',
        retainer_payment_returned: '',
        ret_payment_return_reason: '',
        retainer_refund_date: '',
        retainer_refund_amount: '',
        retainer_payment_amount: '',
        retainer_payment_type: '',
        ret_retainer_invoiced: '',
        ret_retainer_sent_date: '',
        ret_retainer_pay_date: '',
        ret_retainer_clear_date: '',
        ret_retainer_return_date: '',
        ret_retainer_return_reason: '',
        interest_percentage: '',
        net_no: '',
        coi_aoi: '',
        voided_check: '',
        tax_return_2019: '',
        tax_return_2020: '',
        financials_2021: '',
        q1_2020: '',
        q2_2020: '',
        q3_2020: '',
        q4_2020: '',
        q1_2021: '',
        q2_2021: '',
        q3_2021: '',
        payroll_register_2020_q1: '',
        payroll_register_2020_q2: '',
        payroll_register_2020_q3: '',
        payroll_register_2020_q4: '',
        payroll_register_2021_q1: '',
        payroll_register_2021_q2: '',
        payroll_register_2021_q3: '',
        f911_status: '',
        ppp_2020_applied: '',
        ppp_2020_start_date: '',
        ppp_2020_forgiveness_applied: '',
        ppp_2020_end_date: '',
        ppp_2020_amount: '',
        ppp_2020_wages_allocated: '',
        ppp_2021_applied: '',
        ppp_2021_start_date: '',
        ppp_2021_forgiveness_applied: '',
        ppp_2021_end_date: '',
        ppp_2021_amount: '',
        ppp_2021_wages_allocated: '',
        additional_comments: '',
        attorney_name: '',
        call_date: '',
        call_time: '',
        memo_received_date: '',
        memo_cut_off_date: ''
      });
    } finally {
      setIntakeInfoLoading(false);
    }
  };

  // Function to fetch fees information from the API
  const fetchFeesInfo = async () => {
    if (!project?.project_id) {
      console.log('No project ID available for fees API call');
      return;
    }

    setFeesInfoLoading(true);
    setFeesInfoError(null);

    try {
      console.log('=== FEES API CALL START ===');
      console.log('Project ID:', project.project_id);
      console.log('API Endpoint: https://play.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-project-fees');

      const requestBody = { project_id: project.project_id };
      console.log('Request Body:', JSON.stringify(requestBody));

      const response = await fetch('https://play.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-project-fees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response Status:', response.status);
      console.log('Response OK:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fees info data from API:', data);

      if (data && data.status === 1) {
        // Extract fees data from the response - following intake API pattern
        const feesData = data.result && Array.isArray(data.result) ? data.result[0] : data.result;

        console.log('Fees data extracted from API response:', feesData);

        if (feesData) {
          // Update fees info state with the data from API - following intake API pattern
          setFeesInfo({
            error_discovered_date: feesData.error_discovered_date || '',
            q2_2020_941_wages: feesData.q2_2020_941_wages || '',
            q3_2020_941_wages: feesData.q3_2020_941_wages || '',
            q4_2020_941_wages: feesData.q4_2020_941_wages || '',
            q1_2021_941_wages: feesData.q1_2021_941_wages || '',
            q2_2021_941_wages: feesData.q2_2021_941_wages || '',
            q3_2021_941_wages: feesData.q3_2021_941_wages || '',
            q4_2021_941_wages: feesData.q4_2021_941_wages || '',
            internal_sales_agent: feesData.sales_agent_name || '',
            internal_sales_support: feesData.sales_support_name || '',
            affiliate_name: feesData.affiliate_name || '',
            affiliate_percentage: feesData.affiliate_percentage || '',
            erc_claim_filed: feesData.erc_claim_filed || '',
            erc_amount_received: feesData.erc_amount_received || '',
            total_erc_fee: feesData.total_erc_fees || '',
            legal_fees: feesData.legal_fees || '',
            total_erc_fees_paid: feesData.total_erc_fees_paid || '',
            total_erc_fees_pending: feesData.total_erc_fees_pending || '',
            total_occams_share: feesData.total_occams_share || '',
            total_aff_ref_share: feesData.total_aff_ref_share || '',
            retain_occams_share: feesData.retain_occams_share || '',
            retain_aff_ref_share: feesData.retain_aff_ref_share || '',
            bal_retain_occams_share: feesData.bal_retain_occams_share || '',
            total_occams_share_paid: feesData.total_occams_share_paid || '',
            total_aff_ref_share_paid: feesData.total_aff_ref_share_paid || '',
            total_occams_share_pending: feesData.total_occams_share_pendin || '',
            total_aff_ref_share_pending: feesData.total_aff_ref_share_pend || '',
            q1_2020_max_erc_amount: feesData.q1_2020_max_erc_amount || '',
            q2_2020_max_erc_amount: feesData.q2_2020_max_erc_amount || '',
            q3_2020_max_erc_amount: feesData.q3_2020_max_erc_amount || '',
            q4_2020_max_erc_amount: feesData.q4_2020_max_erc_amount || '',
            q1_2021_max_erc_amount: feesData.q1_2021_max_erc_amount || '',
            q2_2021_max_erc_amount: feesData.q2_2021_max_erc_amount || '',
            q3_2021_max_erc_amount: feesData.q3_2021_max_erc_amount || '',
            q4_2021_max_erc_amount: feesData.q4_2021_max_erc_amount || '',
            // ERC Filed Quarter wise 2020 fields
            q1_2020_filed_status: feesData.q1_2020_filed_status === 'Yes' || feesData.q1_2020_filed_status === 'true' || feesData.q1_2020_filed_status === true || feesData.q1_2020_filed_status === 1,
            q1_2020_filing_date: feesData.q1_2020_filing_date || '',
            q1_2020_amount_filed: feesData.q1_2020_amount_filed || '',
            q1_2020_benefits: feesData.q1_2020_benefits || '',
            q1_2020_eligibility_basis: feesData.q1_2020_eligibility_basis || 'N/A',
            q2_2020_filed_status: feesData.q2_2020_filed_status === 'Yes' || feesData.q2_2020_filed_status === 'true' || feesData.q2_2020_filed_status === true || feesData.q2_2020_filed_status === 1,
            q2_2020_filing_date: feesData.q2_2020_filing_date || '',
            q2_2020_amount_filed: feesData.q2_2020_amount_filed || '',
            q2_2020_benefits: feesData.q2_2020_benefits || '',
            q2_2020_eligibility_basis: feesData.q2_2020_eligibility_basis || 'N/A',
            q3_2020_filed_status: feesData.q3_2020_filed_status === 'Yes' || feesData.q3_2020_filed_status === 'true' || feesData.q3_2020_filed_status === true || feesData.q3_2020_filed_status === 1,
            q3_2020_filing_date: feesData.q3_2020_filing_date || '',
            q3_2020_amount_filed: feesData.q3_2020_amount_filed || '',
            q3_2020_benefits: feesData.q3_2020_benefits || '',
            q3_2020_eligibility_basis: feesData.q3_2020_eligibility_basis || 'N/A',
            q4_2020_filed_status: feesData.q4_2020_filed_status === 'Yes' || feesData.q4_2020_filed_status === 'true' || feesData.q4_2020_filed_status === true || feesData.q4_2020_filed_status === 1,
            q4_2020_filing_date: feesData.q4_2020_filing_date || '',
            q4_2020_amount_filed: feesData.q4_2020_amount_filed || '',
            q4_2020_benefits: feesData.q4_2020_benefits || '',
            q4_2020_eligibility_basis: feesData.q4_2020_eligibility_basis || 'N/A',
            // ERC Filed Quarter wise 2021 fields
            q1_2021_filed_status: feesData.q1_2021_filed_status === 'Yes' || feesData.q1_2021_filed_status === 'true' || feesData.q1_2021_filed_status === true || feesData.q1_2021_filed_status === 1,
            q1_2021_filing_date: feesData.q1_2021_filing_date || '',
            q1_2021_amount_filed: feesData.q1_2021_amount_filed || '',
            q1_2021_benefits: feesData.q1_2021_benefits || '',
            q1_2021_eligibility_basis: feesData.q1_2021_eligibility_basis || 'N/A',
            q2_2021_filed_status: feesData.q2_2021_filed_status === 'Yes' || feesData.q2_2021_filed_status === 'true' || feesData.q2_2021_filed_status === true || feesData.q2_2021_filed_status === 1,
            q2_2021_filing_date: feesData.q2_2021_filing_date || '',
            q2_2021_amount_filed: feesData.q2_2021_amount_filed || '',
            q2_2021_benefits: feesData.q2_2021_benefits || '',
            q2_2021_eligibility_basis: feesData.q2_2021_eligibility_basis || 'N/A',
            q3_2021_filed_status: feesData.q3_2021_filed_status === 'Yes' || feesData.q3_2021_filed_status === 'true' || feesData.q3_2021_filed_status === true || feesData.q3_2021_filed_status === 1,
            q3_2021_filing_date: feesData.q3_2021_filing_date || '',
            q3_2021_amount_filed: feesData.q3_2021_amount_filed || '',
            q3_2021_benefits: feesData.q3_2021_benefits || '',
            q3_2021_eligibility_basis: feesData.q3_2021_eligibility_basis || 'N/A',
            q4_2021_filed_status: feesData.q4_2021_filed_status === 'Yes' || feesData.q4_2021_filed_status === 'true' || feesData.q4_2021_filed_status === true || feesData.q4_2021_filed_status === 1,
            q4_2021_filing_date: feesData.q4_2021_filing_date || '',
            q4_2021_amount_filed: feesData.q4_2021_amount_filed || '',
            q4_2021_benefits: feesData.q4_2021_benefits || '',
            q4_2021_eligibility_basis: feesData.q4_2021_eligibility_basis || 'N/A',
            // ERC Letter, Check & Amount 2020 fields
            q1_2020_loop: feesData.q1_2020_loop || '',
            q1_2020_letter: feesData.q1_2020_letter === 'Yes' || feesData.q1_2020_letter === 'true' || feesData.q1_2020_letter === true || feesData.q1_2020_letter === 1,
            q1_2020_check: feesData.q1_2020_check === 'Yes' || feesData.q1_2020_check === 'true' || feesData.q1_2020_check === true || feesData.q1_2020_check === 1,
            q1_2020_chq_amt: feesData.q1_2020_chq_amt || '',
            q2_2020_loop: feesData.q2_2020_loop || '',
            q2_2020_letter: feesData.q2_2020_letter === 'Yes' || feesData.q2_2020_letter === 'true' || feesData.q2_2020_letter === true || feesData.q2_2020_letter === 1,
            q2_2020_check: feesData.q2_2020_check === 'Yes' || feesData.q2_2020_check === 'true' || feesData.q2_2020_check === true || feesData.q2_2020_check === 1,
            q2_2020_chq_amt: feesData.q2_2020_chq_amt || '',
            q3_2020_loop: feesData.q3_2020_loop || '',
            q3_2020_letter: feesData.q3_2020_letter === 'Yes' || feesData.q3_2020_letter === 'true' || feesData.q3_2020_letter === true || feesData.q3_2020_letter === 1,
            q3_2020_check: feesData.q3_2020_check === 'Yes' || feesData.q3_2020_check === 'true' || feesData.q3_2020_check === true || feesData.q3_2020_check === 1,
            q3_2020_chq_amt: feesData.q3_2020_chq_amt || '',
            q4_2020_loop: feesData.q4_2020_loop || '',
            q4_2020_letter: feesData.q4_2020_letter === 'Yes' || feesData.q4_2020_letter === 'true' || feesData.q4_2020_letter === true || feesData.q4_2020_letter === 1,
            q4_2020_check: feesData.q4_2020_check === 'Yes' || feesData.q4_2020_check === 'true' || feesData.q4_2020_check === true || feesData.q4_2020_check === 1,
            q4_2020_chq_amt: feesData.q4_2020_chq_amt || '',
            // ERC Letter, Check & Amount 2021 fields
            q1_2021_loop: feesData.q1_2021_loop || '',
            q1_2021_letter: feesData.q1_2021_letter === 'Yes' || feesData.q1_2021_letter === 'true' || feesData.q1_2021_letter === true || feesData.q1_2021_letter === 1,
            q1_2021_check: feesData.q1_2021_check === 'Yes' || feesData.q1_2021_check === 'true' || feesData.q1_2021_check === true || feesData.q1_2021_check === 1,
            q1_2021_chq_amt: feesData.q1_2021_chq_amt || '',
            q2_2021_loop: feesData.q2_2021_loop || '',
            q2_2021_letter: feesData.q2_2021_letter === 'Yes' || feesData.q2_2021_letter === 'true' || feesData.q2_2021_letter === true || feesData.q2_2021_letter === 1,
            q2_2021_check: feesData.q2_2021_check === 'Yes' || feesData.q2_2021_check === 'true' || feesData.q2_2021_check === true || feesData.q2_2021_check === 1,
            q2_2021_chq_amt: feesData.q2_2021_chq_amt || '',
            q3_2021_loop: feesData.q3_2021_loop || '',
            q3_2021_letter: feesData.q3_2021_letter === 'Yes' || feesData.q3_2021_letter === 'true' || feesData.q3_2021_letter === true || feesData.q3_2021_letter === 1,
            q3_2021_check: feesData.q3_2021_check === 'Yes' || feesData.q3_2021_check === 'true' || feesData.q3_2021_check === true || feesData.q3_2021_check === 1,
            q3_2021_chq_amt: feesData.q3_2021_chq_amt || '',
            q4_2021_loop: feesData.q4_2021_loop || '',
            q4_2021_letter: feesData.q4_2021_letter === 'Yes' || feesData.q4_2021_letter === 'true' || feesData.q4_2021_letter === true || feesData.q4_2021_letter === 1,
            q4_2021_check: feesData.q4_2021_check === 'Yes' || feesData.q4_2021_check === 'true' || feesData.q4_2021_check === true || feesData.q4_2021_check === 1,
            q4_2021_chq_amt: feesData.q4_2021_chq_amt || '',
            // Success Fee Invoice Details - I Invoice
            i_invoice_number: feesData.i_invoice_number || '',
            i_invoice_amount: feesData.i_invoice_amount || '',
            i_invoiced_qtrs: feesData.i_invoiced_qtrs || '',
            i_invoice_sent_date: feesData.i_invoice_sent_date || '',
            i_invoice_payment_type: feesData.i_invoice_payment_type || '',
            i_invoice_payment_date: feesData.i_invoice_payment_date || '',
            i_invoice_pay_cleared: feesData.i_invoice_pay_cleared || '',
            i_invoice_pay_returned: feesData.i_invoice_pay_returned || '',
            i_invoice_return_reason: feesData.i_invoice_return_reason || '',
            i_invoice_occams_share: feesData.i_invoice_occams_share || '',
            i_invoice_affref_share: feesData.i_invoice_aff_ref_share || '',
            // Success Fee Invoice Details - II Invoice
            ii_invoice_number: feesData.ii_invoice_number || '',
            ii_invoice_amount: feesData.ii_invoice_amount || '',
            ii_invoiced_qtrs: feesData.ii_invoiced_qtrs || '',
            ii_invoice_sent_date: feesData.ii_invoice_sent_date || '',
            ii_invoice_payment_type: feesData.ii_invoice_payment_type || '',
            ii_invoice_payment_date: feesData.ii_invoice_payment_date || '',
            ii_invoice_pay_cleared: feesData.ii_invoice_pay_cleared || '',
            ii_invoice_pay_returned: feesData.ii_invoice_pay_returned || '',
            ii_invoice_return_reason: feesData.ii_invoice_return_reason || '',
            ii_invoice_occams_share: feesData.ii_invoice_occams_share || '',
            ii_invoice_affref_share: feesData.ii_invoice_aff_ref_share || '',
            // Success Fee Invoice Details - III Invoice
            iii_invoice_number: feesData.iii_invoice_number || '',
            iii_invoice_amount: feesData.iii_invoice_amount || '',
            iii_invoiced_qtrs: feesData.iii_invoiced_qtrs || '',
            iii_invoice_sent_date: feesData.iii_invoice_sent_date || '',
            iii_invoice_payment_type: feesData.iii_invoice_payment_type || '',
            iii_invoice_payment_date: feesData.iii_invoice_payment_date || '',
            iii_invoice_pay_cleared: feesData.iii_invoice_pay_cleared || '',
            iii_invoice_pay_returned: feesData.iii_invoice_pay_returned || '',
            iii_invoice_return_reason: feesData.iii_invoice_return_reason || '',
            iii_invoice_occams_share: feesData.iii_invoice_occams_share || '',
            iii_invoice_affref_share: feesData.iii_invoice_aff_ref_share || '',
            // Success Fee Invoice Details - IV Invoice
            iv_invoice_number: feesData.iv_invoice_number || '',
            iv_invoice_amount: feesData.iv_invoice_amount || '',
            iv_invoiced_qtrs: feesData.iv_invoiced_qtrs || '',
            iv_invoice_sent_date: feesData.iv_invoice_sent_date || '',
            iv_invoice_payment_type: feesData.iv_invoice_payment_type || '',
            iv_invoice_payment_date: feesData.iv_invoice_payment_date || '',
            iv_invoice_pay_cleared: feesData.iv_invoice_pay_cleared || '',
            iv_invoice_pay_returned: feesData.iv_invoice_pay_returned || '',
            iv_invoice_return_reason: feesData.iv_invoice_return_reason || '',
            iv_invoice_occams_share: feesData.iv_invoice_occams_share || '',
            iv_invoice_affref_share: feesData.iv_invoice_aff_ref_share || ''
          });

          console.log('✅ Fees data successfully loaded from API');
          setFeesInfoError(null); // Clear any previous errors
        } else {
          throw new Error('No fees data found in the API response');
        }
      } else {
        throw new Error(`API returned error status: ${data.status}, message: ${data.message || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('=== FEES API ERROR ===');
      console.error('Error details:', error);
      setFeesInfoError(`Failed to load fees data: ${error.message}`);

      // Reset to empty state on error
      setFeesInfo({
        error_discovered_date: '',
        q2_2020_941_wages: '',
        q3_2020_941_wages: '',
        q4_2020_941_wages: '',
        q1_2021_941_wages: '',
        q2_2021_941_wages: '',
        q3_2021_941_wages: '',
        q4_2021_941_wages: '',
        internal_sales_agent: '',
        internal_sales_support: '',
        affiliate_name: '',
        affiliate_percentage: '',
        erc_claim_filed: '',
        erc_amount_received: '',
        total_erc_fee: '',
        legal_fees: '',
        total_erc_fees_paid: '',
        total_erc_fees_pending: '',
        total_occams_share: '',
        total_aff_ref_share: '',
        retain_occams_share: '',
        retain_aff_ref_share: '',
        bal_retain_occams_share: '',
        total_occams_share_paid: '',
        total_aff_ref_share_paid: '',
        total_occams_share_pending: '',
        total_aff_ref_share_pending: '',
        q1_2020_max_erc_amount: '',
        q2_2020_max_erc_amount: '',
        q3_2020_max_erc_amount: '',
        q4_2020_max_erc_amount: '',
        q1_2021_max_erc_amount: '',
        q2_2021_max_erc_amount: '',
        q3_2021_max_erc_amount: '',
        q4_2021_max_erc_amount: '',
        // ERC Filed Quarter wise 2020 fields
        q1_2020_filed_status: false,
        q1_2020_filing_date: '',
        q1_2020_amount_filed: '',
        q1_2020_benefits: '',
        q1_2020_eligibility_basis: 'N/A',
        q2_2020_filed_status: false,
        q2_2020_filing_date: '',
        q2_2020_amount_filed: '',
        q2_2020_benefits: '',
        q2_2020_eligibility_basis: 'N/A',
        q3_2020_filed_status: false,
        q3_2020_filing_date: '',
        q3_2020_amount_filed: '',
        q3_2020_benefits: '',
        q3_2020_eligibility_basis: 'N/A',
        q4_2020_filed_status: false,
        q4_2020_filing_date: '',
        q4_2020_amount_filed: '',
        q4_2020_benefits: '',
        q4_2020_eligibility_basis: 'N/A',
        // ERC Filed Quarter wise 2021 fields
        q1_2021_filed_status: false,
        q1_2021_filing_date: '',
        q1_2021_amount_filed: '',
        q1_2021_benefits: '',
        q1_2021_eligibility_basis: 'N/A',
        q2_2021_filed_status: false,
        q2_2021_filing_date: '',
        q2_2021_amount_filed: '',
        q2_2021_benefits: '',
        q2_2021_eligibility_basis: 'N/A',
        q3_2021_filed_status: false,
        q3_2021_filing_date: '',
        q3_2021_amount_filed: '',
        q3_2021_benefits: '',
        q3_2021_eligibility_basis: 'N/A',
        q4_2021_filed_status: false,
        q4_2021_filing_date: '',
        q4_2021_amount_filed: '',
        q4_2021_benefits: '',
        q4_2021_eligibility_basis: 'N/A',
        // ERC Letter, Check & Amount 2020 fields
        q1_2020_loop: '',
        q1_2020_letter: false,
        q1_2020_check: false,
        q1_2020_chq_amt: '',
        q2_2020_loop: '',
        q2_2020_letter: false,
        q2_2020_check: false,
        q2_2020_chq_amt: '',
        q3_2020_loop: '',
        q3_2020_letter: false,
        q3_2020_check: false,
        q3_2020_chq_amt: '',
        q4_2020_loop: '',
        q4_2020_letter: false,
        q4_2020_check: false,
        q4_2020_chq_amt: '',
        // ERC Letter, Check & Amount 2021 fields
        q1_2021_loop: '',
        q1_2021_letter: false,
        q1_2021_check: false,
        q1_2021_chq_amt: '',
        q2_2021_loop: '',
        q2_2021_letter: false,
        q2_2021_check: false,
        q2_2021_chq_amt: '',
        q3_2021_loop: '',
        q3_2021_letter: false,
        q3_2021_check: false,
        q3_2021_chq_amt: '',
        q4_2021_loop: '',
        q4_2021_letter: false,
        q4_2021_check: false,
        q4_2021_chq_amt: '',
        // Success Fee Invoice Details - I Invoice
        i_invoice_number: '',
        i_invoice_amount: '',
        i_invoiced_qtrs: '',
        i_invoice_sent_date: '',
        i_invoice_payment_type: '',
        i_invoice_payment_date: '',
        i_invoice_pay_cleared: '',
        i_invoice_pay_returned: '',
        i_invoice_return_reason: '',
        i_invoice_occams_share: '',
        i_invoice_affref_share: '',
        // Success Fee Invoice Details - II Invoice
        ii_invoice_number: '',
        ii_invoice_amount: '',
        ii_invoiced_qtrs: '',
        ii_invoice_sent_date: '',
        ii_invoice_payment_type: '',
        ii_invoice_payment_date: '',
        ii_invoice_pay_cleared: '',
        ii_invoice_pay_returned: '',
        ii_invoice_return_reason: '',
        ii_invoice_occams_share: '',
        ii_invoice_affref_share: '',
        // Success Fee Invoice Details - III Invoice
        iii_invoice_number: '',
        iii_invoice_amount: '',
        iii_invoiced_qtrs: '',
        iii_invoice_sent_date: '',
        iii_invoice_payment_type: '',
        iii_invoice_payment_date: '',
        iii_invoice_pay_cleared: '',
        iii_invoice_pay_returned: '',
        iii_invoice_return_reason: '',
        iii_invoice_occams_share: '',
        iii_invoice_affref_share: '',
        // Success Fee Invoice Details - IV Invoice
        iv_invoice_number: '',
        iv_invoice_amount: '',
        iv_invoiced_qtrs: '',
        iv_invoice_sent_date: '',
        iv_invoice_payment_type: '',
        iv_invoice_payment_date: '',
        iv_invoice_pay_cleared: '',
        iv_invoice_pay_returned: '',
        iv_invoice_return_reason: '',
        iv_invoice_occams_share: '',
        iv_invoice_affref_share: ''
      });
    } finally {
      setFeesInfoLoading(false);
      console.log('=== FEES API CALL END ===');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // If bank info tab is selected, fetch bank information
    if (tab === 'bankInfo') {
      fetchBankInfo();
    }

    // If intake tab is selected, fetch intake information
    if (tab === 'intake') {
      fetchIntakeInfo();
    }

    // If fees tab is selected, fetch fees information
    if (tab === 'fees') {
      fetchFeesInfo();
    }
  };

  // Function to fetch notes with pagination
  const fetchNotes = () => {
    // Simulate API call with setTimeout
    setTimeout(() => {
      // Mock data for notes with different dates
      const mockNotes = [
        {
          id: 1,
          text: 'Occams Finance created an invoice for STC with the invoice ID - #6580',
          author: 'Occams Finance',
          date: new Date('2025-05-08T09:45:00'),
          formattedDate: 'May 8, 2025',
          formattedTime: '9:45 AM'
        },
        {
          id: 2,
          text: 'Testing by SP',
          author: 'VB',
          date: new Date('2025-05-07T11:07:00'),
          formattedDate: 'May 7, 2025',
          formattedTime: '11:07 AM'
        }
      ];

      setNotes(mockNotes);
      setHasMoreNotes(false);
    }, 1000);
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

  // Functions for project group, campaign, and source
  const handleProjectGroupChange = (selectedOption) => {
    // This function is kept for compatibility with other parts of the code
    console.log("Project group changed:", selectedOption);
  };

  const handleOwnerChange = (selectedOption) => {
    setOwner(selectedOption);
  };

  const handleContactChange = (selectedOption) => {
    setSelectedContact(selectedOption);
  };

  const handleProjectCampaignChange = (selectedOption) => {
    setProjectCampaign(selectedOption);
  };

  const handleProjectSourceChange = (selectedOption) => {
    setProjectSource(selectedOption);
  };

  const handleProjectStageChange = (selectedOption) => {
    setProjectStage(selectedOption);
  };

  // Function to handle milestone change
  const handleMilestoneChange = (selectedOption) => {
    setMilestone(selectedOption);

    // Update stage based on milestone selection
    if (selectedOption.value === 'erc-fulfillment') {
      setProjectStage({ value: 'payment-plan-fully-acknowledged', label: 'Payment Plan- Partially Acknowledged' });
    } else if (selectedOption.value === 'erc-enrollment') {
      setProjectStage({ value: 'pending-pre-fpso-interview', label: 'Pending Pre-FPSO Interview' });
    } else if (selectedOption.value === 'erc-cancelled') {
      setProjectStage({ value: 'computation-complete', label: 'Computation Complete' });
    } else if (selectedOption.value === 'erc-lead-lost') {
      setProjectStage({ value: 'fpso-interview-pending', label: 'FPSO Interview Pending' });
    }
  };

  // Function to toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center mt-5">
          <div className="col-md-8 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare error alert if there's an error but we're still showing mock data
  const errorAlert = error ? (
    <div className="alert alert-warning alert-dismissible fade show" role="alert">
      <strong>API Error:</strong> {error}
      <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
    </div>
  ) : null;

  return (
    <div className="container-fluid">
      {/* Display error alert if there's an error */}
      {errorAlert}

      <div className="row">
        <div className="col-12">
          <div className="white_card card_height_100 mb_30">
            <div className="white_card_header">
              <div className="box_header m-0 justify-content-between">
                <h4 className="iris-lead-name">{project?.project_name || "Project Details"}</h4>
              </div>
              <ul className="nav nav-pills" id="pills-tab" role="tablist">
                <li className={`nav-item ${activeTab === 'project' ? 'active' : ''}`}>
                  <a
                    className="nav-link"
                    id="pills-project"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabChange('project');
                    }}
                    href="#pills-project"
                    role="tab"
                    aria-controls="pills-project"
                    aria-selected={activeTab === 'project'}
                  >
                    Project
                  </a>
                </li>
                {/* Hide Bank Info tab for STC (937) and RDC (932) projects */}
                {project?.product_id !== '937' && project?.product_id !== '932' && (
                  <li className={`nav-item ${activeTab === 'bankInfo' ? 'active' : ''}`}>
                    <a
                      className="nav-link"
                      id="pills-bank-info"
                      onClick={(e) => {
                        e.preventDefault();
                        handleTabChange('bankInfo');
                      }}
                      href="#pills-bank-info"
                      role="tab"
                      aria-controls="pills-bank-info"
                      aria-selected={activeTab === 'bankInfo'}
                    >
                      Bank Info
                    </a>
                  </li>
                )}
                {/* Hide Intake tab for STC (937) and RDC (932) projects */}
                {project?.product_id !== '937' && project?.product_id !== '932' && (
                  <li className={`nav-item ${activeTab === 'intake' ? 'active' : ''}`}>
                    <a
                      className="nav-link"
                      id="pills-intake"
                      onClick={(e) => {
                        e.preventDefault();
                        handleTabChange('intake');
                      }}
                      href="#pills-intake"
                      role="tab"
                      aria-controls="pills-intake"
                      aria-selected={activeTab === 'intake'}
                    >
                      Intake
                    </a>
                  </li>
                )}
                {/* Hide Fees tab for STC (937) and RDC (932) projects */}
                {project?.product_id !== '937' && project?.product_id !== '932' && (
                  <li className={`nav-item ${activeTab === 'fees' ? 'active' : ''}`}>
                    <a
                      className="nav-link"
                      id="pills-fees"
                      onClick={(e) => {
                        e.preventDefault();
                        handleTabChange('fees');
                      }}
                      href="#pills-fees"
                      role="tab"
                      aria-controls="pills-fees"
                      aria-selected={activeTab === 'fees'}
                    >
                      Fees
                    </a>
                  </li>
                )}
                {/* Hide Documents tab for RDC (932) projects */}
                {project?.product_id !== '932' && (
                  <li className={`nav-item ${activeTab === 'documents' ? 'active' : ''}`}>
                    <a
                      className="nav-link"
                      id="pills-documents"
                      onClick={(e) => {
                        e.preventDefault();
                        handleTabChange('documents');
                      }}
                      href="#pills-documents"
                      role="tab"
                      aria-controls="pills-documents"
                      aria-selected={activeTab === 'documents'}
                    >
                      Documents
                    </a>
                  </li>
                )}
                <li className={`nav-item ${activeTab === 'invoices' ? 'active' : ''}`}>
                  <a
                    className="nav-link"
                    id="pills-invoices"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabChange('invoices');
                    }}
                    href="#pills-invoices"
                    role="tab"
                    aria-controls="pills-invoices"
                    aria-selected={activeTab === 'invoices'}
                  >
                    Invoices
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
                <div className="col-md-9">
                  {/* Project Tab */}
                  {activeTab === 'project' && (
                    <div className="mb-4 left-section-container">
                      <h5 className="section-title">Project Details</h5>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Name</label>
                            <input type="text" className="form-control" defaultValue={project?.project_name || ""} readOnly />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label d-flex align-items-center justify-content-between">
                              <span>Business</span>
                              <button
                                className="btn btn-primary"
                                style={{
                                  fontSize: '11px',
                                  padding: '2px 8px',
                                  lineHeight: '1.2',
                                  borderRadius: '3px'
                                }}
                                onClick={() => {
                                  // Open lead detail page in a new tab using the lead ID from the API response
                                  const leadId = project?.lead_id || "9020"; // Use the lead ID from the API or fallback to default
                                  const leadDetailUrl = `/reporting/lead-detail/${leadId}`;
                                  window.open(leadDetailUrl, '_blank');
                                  console.log('Opening lead detail page:', leadDetailUrl, 'with lead ID:', leadId);
                                }}
                              >
                                View
                              </button>
                            </label>
                            <input type="text" className="form-control" defaultValue={project?.business_legal_name || ""} readOnly />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Products</label>
                            <input type="text" className="form-control" defaultValue={project?.product_name || ""} readOnly />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Fee</label>
                            <input type="text" className="form-control" defaultValue={project?.project_fee || ""} readOnly />
                          </div>
                        </div>
                      </div>

                      {/* Account Info Section */}
                      <div className='d-flex align-items-center justify-content-between'>
                        <h5 className="section-title mt-4">Account Info</h5>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={toggleEditMode}
                          title={isEditMode ? "Save changes" : "Edit information"}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      </div>

                      {/* Personal Info Section */}
                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">
                        Personal Info
                      </h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue={project?.full_name || ""}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Contact No.</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue={project?.contact_no || ""}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                              type="email"
                              className="form-control"
                              defaultValue={project?.email || ""}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Title</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue={project?.title || ""}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Zip</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue={project?.zip || ""}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Street Address</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue={project?.street_address || ""}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">City</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue={project?.city || ""}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">State</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue={project?.state || ""}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Identity Document Type</label>
                            <select
                              className="form-select"
                              disabled={!isEditMode}
                              value={project?.identity_document_type || ""}
                            >
                              <option value="N/A">N/A</option>
                              <option value="SSN">SSN</option>
                              <option value="EIN">EIN</option>
                              <option value="Driver's License">Driver's License</option>
                              <option value="Passport">Passport</option>
                              <option value="State ID">State ID</option>
                              <option value="Others">Others</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Document Number</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue={project?.document_number || ""}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Business Info Section */}
                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">
                        Business Info
                      </h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Business Legal Name</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue={project?.business_legal_name || ""}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Doing Business As</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue={project?.doing_business_as || ""}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Business Category</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue={project?.business_category || ""}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Website URL</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue={project?.website_url || ""}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Business Legal Info Section */}
                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">
                        Business Legal Info
                      </h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Business Entity Type</label>
                            <select
                              className="form-select"
                              disabled={!isEditMode}
                              value={project?.business_type || ""}
                            >
                              <option value="1">N/A</option>
                              <option value="4">Sole Proprietorship</option>
                              <option value="3">Partnership</option>
                              <option value="2">Limited Liability (LLC)</option>
                              <option value="6">Corporation (S,C,B,etc)</option>
                              <option value="7">Trust</option>
                              <option value="5">Other</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Registration Number</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue={project?.registration_number || ""}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Registration Date</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue={project?.registration_date || ""}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">State of Registration</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue={project?.state_of_registration || ""}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Folder Information</h5>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label d-flex align-items-center">
                              {project?.product_id === "937" ? "Agreement Folder Link" : "Company Folder Link"}
                              <a
                                href={companyFolderLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ms-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#0d6efd" className="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                                  <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z" />
                                  <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z" />
                                </svg>
                              </a>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={companyFolderLink}
                              onChange={(e) => setCompanyFolderLink(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label d-flex align-items-center">
                              {project?.product_id === "937" ? "STC Document Folder Link" : "ERC Document Folder Link"}
                              <a
                                href={documentFolderLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ms-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#0d6efd" className="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                                  <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z" />
                                  <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z" />
                                </svg>
                              </a>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={documentFolderLink}
                              onChange={(e) => setDocumentFolderLink(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>


                    </div>
                  )}

                  {/* Bank Info Tab */}
                  {activeTab === 'bankInfo' && (
                    <div className="mb-4 left-section-container">
                      <h5 className="section-title mt-4">Bank Information</h5>

                      {bankInfoLoading ? (
                        <div className="text-center my-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2">Loading bank information...</p>
                        </div>
                      ) : bankInfoError ? (
                        <div className="alert alert-warning" role="alert">
                          {bankInfoError}
                          <button
                            className="btn btn-sm btn-primary ms-3"
                            onClick={fetchBankInfo}
                          >
                            Retry
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label className="form-label">Bank Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Bank Name"
                                  value={bankInfo.bank_name}
                                  onChange={(e) => setBankInfo({...bankInfo, bank_name: e.target.value})}
                                  readOnly={!isEditMode}
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label className="form-label">Bank Mailing Address</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Bank Mailing Address"
                                  value={bankInfo.bank_mailing_address}
                                  onChange={(e) => setBankInfo({...bankInfo, bank_mailing_address: e.target.value})}
                                  readOnly={!isEditMode}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-3">
                              <div className="form-group">
                                <label className="form-label">City</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="City"
                                  value={bankInfo.city}
                                  onChange={(e) => setBankInfo({...bankInfo, city: e.target.value})}
                                  readOnly={!isEditMode}
                                />
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="form-group">
                                <label className="form-label">State</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="State"
                                  value={bankInfo.state}
                                  onChange={(e) => setBankInfo({...bankInfo, state: e.target.value})}
                                  readOnly={!isEditMode}
                                />
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="form-group">
                                <label className="form-label">Zip</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Zip"
                                  value={bankInfo.zip}
                                  onChange={(e) => setBankInfo({...bankInfo, zip: e.target.value})}
                                  readOnly={!isEditMode}
                                />
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="form-group">
                                <label className="form-label">Country</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Country"
                                  value={bankInfo.country}
                                  onChange={(e) => setBankInfo({...bankInfo, country: e.target.value})}
                                  readOnly={!isEditMode}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-3">
                              <div className="form-group">
                                <label className="form-label">Bank Phone</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Bank Phone"
                                  value={bankInfo.bank_phone}
                                  onChange={(e) => setBankInfo({...bankInfo, bank_phone: e.target.value})}
                                  readOnly={!isEditMode}
                                />
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="form-group">
                                <label className="form-label">Account Holder Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Account Holder Name"
                                  value={bankInfo.account_holder_name}
                                  onChange={(e) => setBankInfo({...bankInfo, account_holder_name: e.target.value})}
                                  readOnly={!isEditMode}
                                />
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="form-group">
                                <label className="form-label">Account Type</label>
                                <select
                                  className="form-select"
                                  value={bankInfo.account_type}
                                  onChange={(e) => setBankInfo({...bankInfo, account_type: e.target.value})}
                                  disabled={!isEditMode}
                                >
                                  <option value="1">N/A</option>
                                  <option value="2">Savings</option>
                                  <option value="3">Checking</option>
                                  <option value="4">Other</option>
                                </select>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="form-group">
                                <label className="form-label">Other</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Other"
                                  value={bankInfo.other}
                                  onChange={(e) => setBankInfo({...bankInfo, other: e.target.value})}
                                  readOnly={!isEditMode}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-3">
                              <div className="form-group">
                                <label className="form-label">ABA Routing Number</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="ABA Routing Number"
                                  value={bankInfo.aba_routing_number}
                                  onChange={(e) => setBankInfo({...bankInfo, aba_routing_number: e.target.value})}
                                  readOnly={!isEditMode}
                                />
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="form-group">
                                <label className="form-label">Account Number</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Account Number"
                                  value={bankInfo.account_number}
                                  onChange={(e) => setBankInfo({...bankInfo, account_number: e.target.value})}
                                  readOnly={!isEditMode}
                                />
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="form-group">
                                <label className="form-label">SWIFT</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="SWIFT"
                                  value={bankInfo.swift}
                                  onChange={(e) => setBankInfo({...bankInfo, swift: e.target.value})}
                                  readOnly={!isEditMode}
                                />
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="form-group">
                                <label className="form-label">IBAN</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="IBAN"
                                  value={bankInfo.iban}
                                  onChange={(e) => setBankInfo({...bankInfo, iban: e.target.value})}
                                  readOnly={!isEditMode}
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Intake Tab Content */}
                  {activeTab === 'intake' && (
                    <div className="mb-4 left-section-container">
                      <h5 className="section-title mt-4">ERC Basic Details</h5>

                      {intakeInfoLoading ? (
                        <div className="text-center my-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2">Loading intake information...</p>
                        </div>
                      ) : intakeInfoError ? (
                        <div className="alert alert-warning" role="alert">
                          {intakeInfoError}
                          <button
                            className="btn btn-sm btn-primary ms-3"
                            onClick={fetchIntakeInfo}
                          >
                            Retry
                          </button>
                        </div>
                      ) : (
                        <>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">W2 Employee Count</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="W2 Employee Count"
                              value={intakeInfo.w2_employees_count}
                              onChange={(e) => setIntakeInfo({...intakeInfo, w2_employees_count: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Initial Retain Fee Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Initial Retain Fee Amount"
                              value={intakeInfo.initial_retain_fee_amount}
                              onChange={(e) => setIntakeInfo({...intakeInfo, initial_retain_fee_amount: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">W2 EE Difference Count</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="W2 EE Difference Count"
                              value={intakeInfo.w2_ee_difference_count}
                              onChange={(e) => setIntakeInfo({...intakeInfo, w2_ee_difference_count: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Balance Retainer Fee</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Balance Retainer Fee"
                              value={intakeInfo.balance_retainer_fee}
                              onChange={(e) => setIntakeInfo({...intakeInfo, balance_retainer_fee: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total Max ERC Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total Max ERC Amount"
                              value={intakeInfo.total_max_erc_amount}
                              onChange={(e) => setIntakeInfo({...intakeInfo, total_max_erc_amount: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total Estimated Fees</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total Estimated Fees"
                              value={intakeInfo.total_estimated_fees}
                              onChange={(e) => setIntakeInfo({...intakeInfo, total_estimated_fees: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Affiliate Referral Fees</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Affiliate Referral Fees"
                              value={intakeInfo.affiliate_referral_fees}
                              onChange={(e) => setIntakeInfo({...intakeInfo, affiliate_referral_fees: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <div className="form-check custom-checkbox">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id="sdgrCheck"
                                checked={intakeInfo.sdgr === 'Yes' || intakeInfo.sdgr === true}
                                onChange={(e) => setIntakeInfo({...intakeInfo, sdgr: e.target.checked ? 'Yes' : 'No'})}
                                disabled={!isEditMode}
                              />
                              <label className="form-check-label" htmlFor="sdgrCheck">SDGR</label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Average Employee Count in 2019</label>
                            <select
                              className="form-select"
                              value={intakeInfo.average_employee_count_2019}
                              onChange={(e) => setIntakeInfo({...intakeInfo, average_employee_count_2019: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="0">N/A</option>
                              <option value="1">Less Than 100</option>
                              <option value="2">Between 100-500</option>
                              <option value="3">More Than 500</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Fee Type</label>
                            <select
                              className="form-select"
                              value={intakeInfo.fee_type}
                              onChange={(e) => setIntakeInfo({...intakeInfo, fee_type: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="N/A">N/A</option>
                              <option value="Retainer Fee @$90 Per EE + Success Fee @15%">Retainer Fee @$90 Per EE + Success Fee @15%</option>
                              <option value="Retainer Fee $10k + Upon Completion Fees @12%">Retainer Fee $10k + Upon Completion Fees @12%</option>
                              <option value="Document Fee @$299 + Success Fee @18%">Document Fee @$299 + Success Fee @18%</option>
                              <option value="Retainer Fee @$90 Per EE + Success Fee @12.5%">Retainer Fee @$90 Per EE + Success Fee @12.5%</option>
                              <option value="Retainer Fee @$90 Per EE + Success Fee @12%">Retainer Fee @$90 Per EE + Success Fee @12%</option>
                              <option value="Retainer Fee @$90 Per EE + Success Fee @10%">Retainer Fee @$90 Per EE + Success Fee @10%</option>
                              <option value="Retainer Fee @$90 Per EE + Success Fee @13%">Retainer Fee @$90 Per EE + Success Fee @13%</option>
                              <option value="Retainer Fee @$90 Per EE + Success Fee @20%">Retainer Fee @$90 Per EE + Success Fee @20%</option>
                              <option value="Retainer Fee @$90 Per EE + Success Fee @9.75%">Retainer Fee @$90 Per EE + Success Fee @9.75%</option>
                              <option value="Retainer Fee $10k + Upon Completion Fees @10%">Retainer Fee $10k + Upon Completion Fees @10%</option>
                              <option value="Document Fee @$0 + Success Fee @12.5%">Document Fee @$0 + Success Fee @12.5%</option>
                              <option value="Document Fee @$0 + Success Fee @14.5%">Document Fee @$0 + Success Fee @14.5%</option>
                              <option value="Document Fee @$0 + Success Fee @15%">Document Fee @$0 + Success Fee @15%</option>
                              <option value="Document Fee @$450 OT + Success Fee @12.5%">Document Fee @$450 OT + Success Fee @12.5%</option>
                              <option value="Document Fee @$49 OT + Success Fee @15%">Document Fee @$49 OT + Success Fee @15%</option>
                              <option value="Document Fee @$49 OT + Success Fee @17.5%">Document Fee @$49 OT + Success Fee @17.5%</option>
                              <option value="Document Fee @$99 + Success Fee @18%">Document Fee @$99 + Success Fee @18%</option>
                              <option value="Document Fee @$99 OT + Success Fee @15%">Document Fee @$99 OT + Success Fee @15%</option>
                              <option value="Document Fee @$99 OT + Success Fee @15.75%">Document Fee @$99 OT + Success Fee @15.75%</option>
                              <option value="Document Fee @$99 OT + Success Fee @20%">Document Fee @$99 OT + Success Fee @20%</option>
                              <option value="Document Fee @$990 OT + Success Fee @15.75%">Document Fee @$990 OT + Success Fee @15.75%</option>
                              <option value="Enrollment 5 EE or less $450 Flat Fee">Enrollment 5 EE or less $450 Flat Fee</option>
                              <option value="Enrollment @$90 Per EE + Success Fee @10%">Enrollment @$90 Per EE + Success Fee @10%</option>
                              <option value="Enrollment @$90 Per EE + Success Fee @12.5%">Enrollment @$90 Per EE + Success Fee @12.5%</option>
                              <option value="Retainer @$90 Per EE - Service Fees @15%">Retainer @$90 Per EE - Service Fees @15%</option>
                              <option value="Retainer @$90 Per EE+Upon Completion Fee @10%">Retainer @$90 Per EE+Upon Completion Fee @10%</option>
                              <option value="Retainer @$90 Per EE+Upon Completion Fee @12%">Retainer @$90 Per EE+Upon Completion Fee @12%</option>
                              <option value="Retainer Fee @ $90 Per EE+Success Fee @ 17.5%">Retainer Fee @ $90 Per EE+Success Fee @ 17.5%</option>
                              <option value="Retainer @$0 Per EE + Service Fees @15%">Retainer @$0 Per EE + Service Fees @15%</option>
                              <option value="Retainer Fee @$90 Per EE + Success Fee @6.25%">Retainer Fee @$90 Per EE + Success Fee @6.25%</option>
                              <option value="Retainer Fee $100 + Success Fee @15%">Retainer Fee $100 + Success Fee @15%</option>
                              <option value="Retainer Fee @$99 + Success Fee @10%">Retainer Fee @$99 + Success Fee @10%</option>
                              <option value="Retainer Fee @$0 + Success Fee @18%">Retainer Fee @$0 + Success Fee @18%</option>
                              <option value="Retainer Fee @$0 + Success Fee @10%">Retainer Fee @$0 + Success Fee @10%</option>
                              <option value="Custom Fee - $37500 - $45000">Custom Fee - $37500 - $45000</option>
                              <option value="Retainer Fee @$3000 + Success Fee @15%">Retainer Fee @$3000 + Success Fee @15%</option>
                              <option value="Retainer Fee @$2000 + Success Fee @20%">Retainer Fee @$2000 + Success Fee @20%</option>
                              <option value="Retainer Fee @$30 Per EE + Success Fee @15%">Retainer Fee @$30 Per EE + Success Fee @15%</option>
                              <option value="Retainer Fee @$0 Per EE + Success Fee @12%">Retainer Fee @$0 Per EE + Success Fee @12%</option>
                              <option value="Retainer Fee @$2500 + Success Fee @20%">Retainer Fee @$2500 + Success Fee @20%</option>
                              <option value="Retainer Fee @$3000 + Success Fee @22%">Retainer Fee @$3000 + Success Fee @22%</option>
                              <option value="Retainer Fee @$12500 + Success Fee @15%">Retainer Fee @$12500 + Success Fee @15%</option>
                              <option value="$90 Per EE Min $2000 + Success Fee @20%">$90 Per EE Min $2000 + Success Fee @20%</option>
                              <option value="Retainer Fee @$0 + Success Fee @20%">Retainer Fee @$0 + Success Fee @20%</option>
                              <option value="Document Fee @$299 + Success Fee @20%">Document Fee @$299 + Success Fee @20%</option>
                              <option value="Completion Fee @10%">Completion Fee @10%</option>
                              <option value="Success Fee @10%">Success Fee @10%</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Custom Fee</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Custom Fee"
                              value={intakeInfo.custom_fee}
                              onChange={(e) => setIntakeInfo({...intakeInfo, custom_fee: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Company Folder Link</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Company Folder Link"
                              value={companyFolderLink}
                              onChange={(e) => setCompanyFolderLink(e.target.value)}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Document Folder Link</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Document Folder Link"
                              value={documentFolderLink}
                              onChange={(e) => setDocumentFolderLink(e.target.value)}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Eligible Quarters</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Eligible Quarters"
                              value={intakeInfo.eligible_quarters}
                              onChange={(e) => setIntakeInfo({...intakeInfo, eligible_quarters: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Welcome Email</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Welcome Email"
                              value={intakeInfo.welcome_email}
                              onChange={(e) => setIntakeInfo({...intakeInfo, welcome_email: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Invoice# Initial Retainer</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoice# Initial Retainer"
                              value={intakeInfo.invoice_initial_retainer}
                              onChange={(e) => setIntakeInfo({...intakeInfo, invoice_initial_retainer: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Retainer Payment Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={intakeInfo.retainer_payment_date}
                              onChange={(e) => setIntakeInfo({...intakeInfo, retainer_payment_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Retainer Payment Cleared</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Retainer Payment Cleared"
                              value={intakeInfo.retainer_payment_channel}
                              onChange={(e) => setIntakeInfo({...intakeInfo, retainer_payment_channel: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Retainer Payment Returned</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={intakeInfo.retainer_payment_returned}
                              onChange={(e) => setIntakeInfo({...intakeInfo, retainer_payment_returned: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Ret Payment Return Reason</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Ret Payment Return Reason"
                              value={intakeInfo.ret_payment_return_reason}
                              onChange={(e) => setIntakeInfo({...intakeInfo, ret_payment_return_reason: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Retainer Refund Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={intakeInfo.retainer_refund_date}
                              onChange={(e) => setIntakeInfo({...intakeInfo, retainer_refund_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Retainer Refund Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Retainer Refund Amount"
                              value={intakeInfo.retainer_refund_amount}
                              onChange={(e) => setIntakeInfo({...intakeInfo, retainer_refund_amount: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Retainer Payment Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Retainer Payment Amount"
                              value={intakeInfo.retainer_payment_amount}
                              onChange={(e) => setIntakeInfo({...intakeInfo, retainer_payment_amount: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Retainer Payment Type</label>
                            <select
                              className="form-select"
                              value={intakeInfo.retainer_payment_type}
                              onChange={(e) => setIntakeInfo({...intakeInfo, retainer_payment_type: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="">Select Type</option>
                              <option value="1">ACH</option>
                              <option value="2">CC/DB Card</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Bal Retainer Invoice#</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Bal Retainer Invoice#"
                              value={intakeInfo.ret_retainer_invoiced}
                              onChange={(e) => setIntakeInfo({...intakeInfo, ret_retainer_invoiced: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Bal Retainer Sent Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={intakeInfo.ret_retainer_sent_date}
                              onChange={(e) => setIntakeInfo({...intakeInfo, ret_retainer_sent_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Bal Retainer Pay Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={intakeInfo.ret_retainer_pay_date}
                              onChange={(e) => setIntakeInfo({...intakeInfo, ret_retainer_pay_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Bal Retainer Clear Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={intakeInfo.ret_retainer_clear_date}
                              onChange={(e) => setIntakeInfo({...intakeInfo, ret_retainer_clear_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Bal Retainer Return Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={intakeInfo.ret_retainer_return_date}
                              onChange={(e) => setIntakeInfo({...intakeInfo, ret_retainer_return_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Bal Retainer Return Reason</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Bal Retainer Return Reason"
                              value={intakeInfo.ret_retainer_return_reason}
                              onChange={(e) => setIntakeInfo({...intakeInfo, ret_retainer_return_reason: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Payment Terms</h5>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Interest Percentage(%)</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Interest Percentage(%)"
                              value={intakeInfo.interest_percentage}
                              onChange={(e) => setIntakeInfo({...intakeInfo, interest_percentage: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Net No.</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Net No"
                              value={intakeInfo.net_no}
                              onChange={(e) => setIntakeInfo({...intakeInfo, net_no: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">ERC Documents</h5>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">Business Docs</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">COI AOI</label>
                            <select
                              className="form-select"
                              value={intakeInfo.coi_aoi}
                              onChange={(e) => setIntakeInfo({...intakeInfo, coi_aoi: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="3">N/A</option>
                              <option value="1">YES</option>
                              <option value="2">NO</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Voided Check</label>
                            <select
                              className="form-select"
                              value={intakeInfo.voided_check}
                              onChange={(e) => setIntakeInfo({...intakeInfo, voided_check: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="3">N/A</option>
                              <option value="1">YES</option>
                              <option value="2">NO</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">Business Financial Docs</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2019 Tax Return</label>
                            <select
                              className="form-select"
                              value={intakeInfo.tax_return_2019}
                              onChange={(e) => setIntakeInfo({...intakeInfo, tax_return_2019: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="3">N/A</option>
                              <option value="1">YES</option>
                              <option value="2">NO</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2020 Tax Return</label>
                            <select
                              className="form-select"
                              value={intakeInfo.tax_return_2020}
                              onChange={(e) => setIntakeInfo({...intakeInfo, tax_return_2020: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="3">N/A</option>
                              <option value="1">YES</option>
                              <option value="2">NO</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2021 Financials</label>
                            <select
                              className="form-select"
                              value={intakeInfo.financials_2021}
                              onChange={(e) => setIntakeInfo({...intakeInfo, financials_2021: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="3">N/A</option>
                              <option value="1">YES</option>
                              <option value="2">NO</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">941's - 2020</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2020 Q1</label>
                            <select
                              className="form-select"
                              value={intakeInfo.q1_2020}
                              onChange={(e) => setIntakeInfo({...intakeInfo, q1_2020: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="1">N/A</option>
                              <option value="2">YES</option>
                              <option value="3">NO</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2020 Q2</label>
                            <select
                              className="form-select"
                              value={intakeInfo.q2_2020}
                              onChange={(e) => setIntakeInfo({...intakeInfo, q2_2020: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="1">N/A</option>
                              <option value="2">YES</option>
                              <option value="3">NO</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2020 Q3</label>
                            <select
                              className="form-select"
                              value={intakeInfo.q3_2020}
                              onChange={(e) => setIntakeInfo({...intakeInfo, q3_2020: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="1">N/A</option>
                              <option value="2">YES</option>
                              <option value="3">NO</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2020 Q4</label>
                            <select
                              className="form-select"
                              value={intakeInfo.q4_2020}
                              onChange={(e) => setIntakeInfo({...intakeInfo, q4_2020: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="1">N/A</option>
                              <option value="2">YES</option>
                              <option value="3">NO</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">941's - 2021</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2021 Q1</label>
                            <select
                              className="form-select"
                              value={intakeInfo.q1_2021}
                              onChange={(e) => setIntakeInfo({...intakeInfo, q1_2021: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="1">N/A</option>
                              <option value="2">YES</option>
                              <option value="3">NO</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2021 Q2</label>
                            <select
                              className="form-select"
                              value={intakeInfo.q2_2021}
                              onChange={(e) => setIntakeInfo({...intakeInfo, q2_2021: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="1">N/A</option>
                              <option value="2">YES</option>
                              <option value="3">NO</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">2021 Q3</label>
                            <select
                              className="form-select"
                              value={intakeInfo.q3_2021}
                              onChange={(e) => setIntakeInfo({...intakeInfo, q3_2021: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="1">N/A</option>
                              <option value="2">YES</option>
                              <option value="3">NO</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">Payroll Register - 2020</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Payroll Register 2020 Q1</label>
                            <select
                              className="form-select"
                              value={intakeInfo.payroll_register_2020_q1}
                              onChange={(e) => setIntakeInfo({...intakeInfo, payroll_register_2020_q1: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="1">N/A</option>
                              <option value="2">YES</option>
                              <option value="3">NO</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Payroll Register 2020 Q2</label>
                            <select
                              className="form-select"
                              value={intakeInfo.payroll_register_2020_q2}
                              onChange={(e) => setIntakeInfo({...intakeInfo, payroll_register_2020_q2: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="1">N/A</option>
                              <option value="2">YES</option>
                              <option value="3">NO</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Payroll Register 2020 Q3</label>
                            <select
                              className="form-select"
                              value={intakeInfo.payroll_register_2020_q3}
                              onChange={(e) => setIntakeInfo({...intakeInfo, payroll_register_2020_q3: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="1">N/A</option>
                              <option value="2">YES</option>
                              <option value="3">NO</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Payroll Register 2020 Q4</label>
                            <select
                              className="form-select"
                              value={intakeInfo.payroll_register_2020_q4}
                              onChange={(e) => setIntakeInfo({...intakeInfo, payroll_register_2020_q4: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="1">N/A</option>
                              <option value="2">YES</option>
                              <option value="3">NO</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">Payroll Register - 2021</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Payroll Register 2021 Q1</label>
                            <select
                              className="form-select"
                              value={intakeInfo.payroll_register_2021_q1}
                              onChange={(e) => setIntakeInfo({...intakeInfo, payroll_register_2021_q1: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="1">N/A</option>
                              <option value="2">YES</option>
                              <option value="3">NO</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Payroll Register 2021 Q2</label>
                            <select
                              className="form-select"
                              value={intakeInfo.payroll_register_2021_q2}
                              onChange={(e) => setIntakeInfo({...intakeInfo, payroll_register_2021_q2: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="1">N/A</option>
                              <option value="2">YES</option>
                              <option value="3">NO</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Payroll Register 2021 Q3</label>
                            <select
                              className="form-select"
                              value={intakeInfo.payroll_register_2021_q3}
                              onChange={(e) => setIntakeInfo({...intakeInfo, payroll_register_2021_q3: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="1">N/A</option>
                              <option value="2">YES</option>
                              <option value="3">NO</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">F911 Status</label>
                            <select
                              className="form-select"
                              value={intakeInfo.f911_status}
                              onChange={(e) => setIntakeInfo({...intakeInfo, f911_status: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="">N/A</option>
                              <option value="F911 Sent">F911 Sent</option>
                              <option value="F911 Signed">F911 Signed</option>
                              <option value="F911 Faxed to TAS">F911 Faxed to TAS</option>
                              <option value="In Progress with TAS">In Progress with TAS</option>
                              <option value="Resolved">Resolved</option>
                              <option value="Closed/Unresolved">Closed/Unresolved</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">PPP Details</h5>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">PPP 2020 Information</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2020 Applied</label>
                            <select
                              className="form-select"
                              value={intakeInfo.ppp_2020_applied}
                              onChange={(e) => setIntakeInfo({...intakeInfo, ppp_2020_applied: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="1">N/A</option>
                              <option value="2">YES</option>
                              <option value="3">NO</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2020 Start Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={intakeInfo.ppp_2020_start_date}
                              onChange={(e) => setIntakeInfo({...intakeInfo, ppp_2020_start_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2020 Forgiveness Applied</label>
                            <select
                              className="form-select"
                              value={intakeInfo.ppp_2020_forgiveness_applied}
                              onChange={(e) => setIntakeInfo({...intakeInfo, ppp_2020_forgiveness_applied: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="1">N/A</option>
                              <option value="2">YES</option>
                              <option value="3">NO</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2020 End Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={intakeInfo.ppp_2020_end_date}
                              onChange={(e) => setIntakeInfo({...intakeInfo, ppp_2020_end_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2020 Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="PPP 2020 Amount"
                              value={intakeInfo.ppp_2020_amount}
                              onChange={(e) => setIntakeInfo({...intakeInfo, ppp_2020_amount: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2020 Wages Allocated</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="PPP 2020 Wages Allocated"
                              value={intakeInfo.ppp_2020_wages_allocated}
                              onChange={(e) => setIntakeInfo({...intakeInfo, ppp_2020_wages_allocated: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">PPP 2021 Information</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2021 Applied</label>
                            <select
                              className="form-select"
                              value={intakeInfo.ppp_2021_applied}
                              onChange={(e) => setIntakeInfo({...intakeInfo, ppp_2021_applied: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="1">N/A</option>
                              <option value="2">YES</option>
                              <option value="3">NO</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2021 Start Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={intakeInfo.ppp_2021_start_date}
                              onChange={(e) => setIntakeInfo({...intakeInfo, ppp_2021_start_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2021 Forgiveness Applied</label>
                            <select
                              className="form-select"
                              value={intakeInfo.ppp_2021_forgiveness_applied}
                              onChange={(e) => setIntakeInfo({...intakeInfo, ppp_2021_forgiveness_applied: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="1">N/A</option>
                              <option value="2">YES</option>
                              <option value="3">NO</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2021 End Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={intakeInfo.ppp_2021_end_date}
                              onChange={(e) => setIntakeInfo({...intakeInfo, ppp_2021_end_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2021 Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="PPP 2021 Amount"
                              value={intakeInfo.ppp_2021_amount}
                              onChange={(e) => setIntakeInfo({...intakeInfo, ppp_2021_amount: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">PPP 2021 Wages Allocated</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="PPP 2021 Wages Allocated"
                              value={intakeInfo.ppp_2021_wages_allocated}
                              onChange={(e) => setIntakeInfo({...intakeInfo, ppp_2021_wages_allocated: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-12">
                          <div className="form-group">
                            <label className="form-label">Additional Comments</label>
                            <textarea
                              className="form-control"
                              rows="3" style={{ resize: 'vertical', minHeight: '70px' }}
                              placeholder="Additional Comments"
                              value={intakeInfo.additional_comments}
                              onChange={(e) => setIntakeInfo({...intakeInfo, additional_comments: e.target.value})}
                              readOnly={!isEditMode}
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">FPSO Details</h5>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Attorney Name</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Attorney Name"
                              value={intakeInfo.attorney_name}
                              onChange={(e) => setIntakeInfo({...intakeInfo, attorney_name: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Call Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={intakeInfo.call_date}
                              onChange={(e) => setIntakeInfo({...intakeInfo, call_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Call Time</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Call Time"
                              value={intakeInfo.call_time}
                              onChange={(e) => setIntakeInfo({...intakeInfo, call_time: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Memo Received Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={intakeInfo.memo_received_date}
                              onChange={(e) => setIntakeInfo({...intakeInfo, memo_received_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Memo Cut Off Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={intakeInfo.memo_cut_off_date}
                              onChange={(e) => setIntakeInfo({...intakeInfo, memo_cut_off_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Fees Tab Content */}
                  {activeTab === 'fees' && (
                    <div className="mb-4 left-section-container">
                      {/* Display loading state */}
                      {feesInfoLoading && (
                        <div className="text-center mb-3">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading fees information...</span>
                          </div>
                          <p className="mt-2">Loading fees information...</p>
                        </div>
                      )}

                      {/* Display error state */}
                      {feesInfoError && (
                        <div className="alert alert-warning alert-dismissible fade show" role="alert">
                          <strong>API Error:</strong> {feesInfoError}
                          <button type="button" className="btn-close" onClick={() => setFeesInfoError(null)} aria-label="Close"></button>
                        </div>
                      )}

                      <h5 className="section-title">941 Details</h5>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Error Discovered Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.error_discovered_date}
                              onChange={(e) => setFeesInfo({...feesInfo, error_discovered_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2020 941 Wages</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q2 2020 941 Wages"
                              value={feesInfo.q2_2020_941_wages}
                              onChange={(e) => setFeesInfo({...feesInfo, q2_2020_941_wages: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2020 941 Wages</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2020 941 Wages"
                              value={feesInfo.q3_2020_941_wages}
                              onChange={(e) => setFeesInfo({...feesInfo, q3_2020_941_wages: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2020 941 Wages</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q4 2020 941 Wages"
                              value={feesInfo.q4_2020_941_wages}
                              onChange={(e) => setFeesInfo({...feesInfo, q4_2020_941_wages: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2021 941 Wages</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q1 2021 941 Wages"
                              value={feesInfo.q1_2021_941_wages}
                              onChange={(e) => setFeesInfo({...feesInfo, q1_2021_941_wages: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2021 941 Wages</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q2 2021 941 Wages"
                              value={feesInfo.q2_2021_941_wages}
                              onChange={(e) => setFeesInfo({...feesInfo, q2_2021_941_wages: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2021 941 Wages</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2021 941 Wages"
                              value={feesInfo.q3_2021_941_wages}
                              onChange={(e) => setFeesInfo({...feesInfo, q3_2021_941_wages: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2021 941 Wages</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q4 2021 941 Wages"
                              value={feesInfo.q4_2021_941_wages}
                              onChange={(e) => setFeesInfo({...feesInfo, q4_2021_941_wages: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">TOTAL ERC AMOUNT AND FEES</h5>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Internal Sales Agent</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Internal Sales Agent"
                              value={feesInfo.internal_sales_agent}
                              onChange={(e) => setFeesInfo({...feesInfo, internal_sales_agent: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Internal Sales Support</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Internal Sales Support"
                              value={feesInfo.internal_sales_support}
                              onChange={(e) => setFeesInfo({...feesInfo, internal_sales_support: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Affiliate Name</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Affiliate Name"
                              value={feesInfo.affiliate_name}
                              onChange={(e) => setFeesInfo({...feesInfo, affiliate_name: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Affiliate Percentage</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Affiliate Percentage"
                              value={feesInfo.affiliate_percentage}
                              onChange={(e) => setFeesInfo({...feesInfo, affiliate_percentage: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">ERC Claim Filed</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="ERC Claim Filed"
                              value={feesInfo.erc_claim_filed}
                              onChange={(e) => setFeesInfo({...feesInfo, erc_claim_filed: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">ERC Amount Received</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="ERC Amount Received"
                              value={feesInfo.erc_amount_received}
                              onChange={(e) => setFeesInfo({...feesInfo, erc_amount_received: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total ERC Fee</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total ERC Fee"
                              value={feesInfo.total_erc_fee}
                              onChange={(e) => setFeesInfo({...feesInfo, total_erc_fee: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Legal Fees</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Legal Fees"
                              value={feesInfo.legal_fees}
                              onChange={(e) => setFeesInfo({...feesInfo, legal_fees: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total ERC Fees Paid</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total ERC Fees Paid"
                              value={feesInfo.total_erc_fees_paid}
                              onChange={(e) => setFeesInfo({...feesInfo, total_erc_fees_paid: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total ERC Fees Pending</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total ERC Fees Pending"
                              value={feesInfo.total_erc_fees_pending}
                              onChange={(e) => setFeesInfo({...feesInfo, total_erc_fees_pending: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total Occams Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total Occams Share"
                              value={feesInfo.total_occams_share}
                              onChange={(e) => setFeesInfo({...feesInfo, total_occams_share: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total Aff/Ref Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total Aff/Ref Share"
                              value={feesInfo.total_aff_ref_share}
                              onChange={(e) => setFeesInfo({...feesInfo, total_aff_ref_share: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Retain Occams Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Retain Occams Share"
                              value={feesInfo.retain_occams_share}
                              onChange={(e) => setFeesInfo({...feesInfo, retain_occams_share: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Retain Aff/Ref Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Retain Aff/Ref Share"
                              value={feesInfo.retain_aff_ref_share}
                              onChange={(e) => setFeesInfo({...feesInfo, retain_aff_ref_share: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Bal Retain Occams Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Bal Retain Occams Share"
                              value={feesInfo.bal_retain_occams_share}
                              onChange={(e) => setFeesInfo({...feesInfo, bal_retain_occams_share: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total Occams Share Paid</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total Occams Share Paid"
                              value={feesInfo.total_occams_share_paid}
                              onChange={(e) => setFeesInfo({...feesInfo, total_occams_share_paid: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total Aff/Ref Share Paid</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total Aff/Ref Share Paid"
                              value={feesInfo.total_aff_ref_share_paid}
                              onChange={(e) => setFeesInfo({...feesInfo, total_aff_ref_share_paid: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total Occams Share Pending</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total Occams Share Pending"
                              value={feesInfo.total_occams_share_pending}
                              onChange={(e) => setFeesInfo({...feesInfo, total_occams_share_pending: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Total Aff/Ref Share Pending</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Total Aff/Ref Share Pending"
                              value={feesInfo.total_aff_ref_share_pending}
                              onChange={(e) => setFeesInfo({...feesInfo, total_aff_ref_share_pending: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Total Max ERC Amount 2020</h5>
                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">2020</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2020 Max ERC Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q1 2020 Max ERC Amount"
                              value={feesInfo.q1_2020_max_erc_amount}
                              onChange={(e) => setFeesInfo({...feesInfo, q1_2020_max_erc_amount: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2020 Max ERC Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q2 2020 Max ERC Amount"
                              value={feesInfo.q2_2020_max_erc_amount}
                              onChange={(e) => setFeesInfo({...feesInfo, q2_2020_max_erc_amount: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2020 Max ERC Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2020 Max ERC Amount"
                              value={feesInfo.q3_2020_max_erc_amount}
                              onChange={(e) => setFeesInfo({...feesInfo, q3_2020_max_erc_amount: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2020 Max ERC Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q4 2020 Max ERC Amount"
                              value={feesInfo.q4_2020_max_erc_amount}
                              onChange={(e) => setFeesInfo({...feesInfo, q4_2020_max_erc_amount: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Total Max ERC Amount 2021</h5>
                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">2021</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2021 Max ERC Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q1 2021 Max ERC Amount"
                              value={feesInfo.q1_2021_max_erc_amount}
                              onChange={(e) => setFeesInfo({...feesInfo, q1_2021_max_erc_amount: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2021 Max ERC Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q2 2021 Max ERC Amount"
                              value={feesInfo.q2_2021_max_erc_amount}
                              onChange={(e) => setFeesInfo({...feesInfo, q2_2021_max_erc_amount: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2021 Max ERC Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2021 Max ERC Amount"
                              value={feesInfo.q3_2021_max_erc_amount}
                              onChange={(e) => setFeesInfo({...feesInfo, q3_2021_max_erc_amount: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2021 Max ERC Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q4 2021 Max ERC Amount"
                              value={feesInfo.q4_2021_max_erc_amount}
                              onChange={(e) => setFeesInfo({...feesInfo, q4_2021_max_erc_amount: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">ERC Filed Quarter wise 2020</h5>
                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">2020</h6>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <div className="form-check custom-checkbox">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="q1-2020-filed-status"
                                checked={feesInfo.q1_2020_filed_status}
                                onChange={(e) => setFeesInfo({...feesInfo, q1_2020_filed_status: e.target.checked})}
                                disabled={!isEditMode}
                              />
                              <label className="form-check-label" htmlFor="q1-2020-filed-status">
                                Q1 2020 Filed Status
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2020 Filing Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.q1_2020_filing_date}
                              onChange={(e) => setFeesInfo({...feesInfo, q1_2020_filing_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2020 Amount Filed</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q1 2020 Amount Filed"
                              value={feesInfo.q1_2020_amount_filed}
                              onChange={(e) => setFeesInfo({...feesInfo, q1_2020_amount_filed: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2020 Benefits</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q1 2020 Benefits"
                              value={feesInfo.q1_2020_benefits}
                              onChange={(e) => setFeesInfo({...feesInfo, q1_2020_benefits: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2020 Eligibility Basis</label>
                            <select
                              className="form-select"
                              value={feesInfo.q1_2020_eligibility_basis}
                              onChange={(e) => setFeesInfo({...feesInfo, q1_2020_eligibility_basis: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="N/A">N/A</option>
                              <option value="FPSO">FPSO</option>
                              <option value="SDGR">SDGR</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <div className="form-check custom-checkbox">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="q2-2020-filed-status"
                                checked={feesInfo.q2_2020_filed_status}
                                onChange={(e) => setFeesInfo({...feesInfo, q2_2020_filed_status: e.target.checked})}
                                disabled={!isEditMode}
                              />
                              <label className="form-check-label" htmlFor="q2-2020-filed-status">
                                Q2 2020 Filed Status
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2020 Filing Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.q2_2020_filing_date}
                              onChange={(e) => setFeesInfo({...feesInfo, q2_2020_filing_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2020 Amount Filed</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q2 2020 Amount Filed"
                              value={feesInfo.q2_2020_amount_filed}
                              onChange={(e) => setFeesInfo({...feesInfo, q2_2020_amount_filed: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2020 Benefits</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q2 2020 Benefits"
                              value={feesInfo.q2_2020_benefits}
                              onChange={(e) => setFeesInfo({...feesInfo, q2_2020_benefits: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2020 Eligibility Basis</label>
                            <select
                              className="form-select"
                              value={feesInfo.q2_2020_eligibility_basis}
                              onChange={(e) => setFeesInfo({...feesInfo, q2_2020_eligibility_basis: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="N/A">N/A</option>
                              <option value="FPSO">FPSO</option>
                              <option value="SDGR">SDGR</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <div className="form-check custom-checkbox">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="q3-2020-filed-status"
                                checked={feesInfo.q3_2020_filed_status}
                                onChange={(e) => setFeesInfo({...feesInfo, q3_2020_filed_status: e.target.checked})}
                                disabled={!isEditMode}
                              />
                              <label className="form-check-label" htmlFor="q3-2020-filed-status">
                                Q3 2020 Filed Status
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2020 Filing Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.q3_2020_filing_date}
                              onChange={(e) => setFeesInfo({...feesInfo, q3_2020_filing_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2020 Amount Filed</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2020 Amount Filed"
                              value={feesInfo.q3_2020_amount_filed}
                              onChange={(e) => setFeesInfo({...feesInfo, q3_2020_amount_filed: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2020 Benefits</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2020 Benefits"
                              value={feesInfo.q3_2020_benefits}
                              onChange={(e) => setFeesInfo({...feesInfo, q3_2020_benefits: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2020 Eligibility Basis</label>
                            <select
                              className="form-select"
                              value={feesInfo.q3_2020_eligibility_basis}
                              onChange={(e) => setFeesInfo({...feesInfo, q3_2020_eligibility_basis: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="N/A">N/A</option>
                              <option value="FPSO">FPSO</option>
                              <option value="SDGR">SDGR</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <div className="form-check custom-checkbox">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="q4-2020-filed-status"
                                checked={feesInfo.q4_2020_filed_status}
                                onChange={(e) => setFeesInfo({...feesInfo, q4_2020_filed_status: e.target.checked})}
                                disabled={!isEditMode}
                              />
                              <label className="form-check-label" htmlFor="q4-2020-filed-status">
                                Q4 2020 Filed Status
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2020 Filing Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.q4_2020_filing_date}
                              onChange={(e) => setFeesInfo({...feesInfo, q4_2020_filing_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2020 Amount Filed</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q4 2020 Amount Filed"
                              value={feesInfo.q4_2020_amount_filed}
                              onChange={(e) => setFeesInfo({...feesInfo, q4_2020_amount_filed: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2020 Benefits</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q4 2020 Benefits"
                              value={feesInfo.q4_2020_benefits}
                              onChange={(e) => setFeesInfo({...feesInfo, q4_2020_benefits: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2020 Eligibility Basis</label>
                            <select
                              className="form-select"
                              value={feesInfo.q4_2020_eligibility_basis}
                              onChange={(e) => setFeesInfo({...feesInfo, q4_2020_eligibility_basis: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="N/A">N/A</option>
                              <option value="FPSO">FPSO</option>
                              <option value="SDGR">SDGR</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">2021</h6>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <div className="form-check custom-checkbox">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="q1-2021-filed-status"
                                checked={feesInfo.q1_2021_filed_status}
                                onChange={(e) => setFeesInfo({...feesInfo, q1_2021_filed_status: e.target.checked})}
                                disabled={!isEditMode}
                              />
                              <label className="form-check-label" htmlFor="q1-2021-filed-status">
                                Q1 2021 Filed Status
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2021 Filing Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.q1_2021_filing_date}
                              onChange={(e) => setFeesInfo({...feesInfo, q1_2021_filing_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2021 Amount Filed</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q1 2021 Amount Filed"
                              value={feesInfo.q1_2021_amount_filed}
                              onChange={(e) => setFeesInfo({...feesInfo, q1_2021_amount_filed: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2021 Benefits</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q1 2021 Benefits"
                              value={feesInfo.q1_2021_benefits}
                              onChange={(e) => setFeesInfo({...feesInfo, q1_2021_benefits: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q1 2021 Eligibility Basis</label>
                            <select
                              className="form-select"
                              value={feesInfo.q1_2021_eligibility_basis}
                              onChange={(e) => setFeesInfo({...feesInfo, q1_2021_eligibility_basis: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="N/A">N/A</option>
                              <option value="FPSO">FPSO</option>
                              <option value="SDGR">SDGR</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <div className="form-check custom-checkbox">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="q2-2021-filed-status"
                                checked={feesInfo.q2_2021_filed_status}
                                onChange={(e) => setFeesInfo({...feesInfo, q2_2021_filed_status: e.target.checked})}
                                disabled={!isEditMode}
                              />
                              <label className="form-check-label" htmlFor="q2-2021-filed-status">
                                Q2 2021 Filed Status
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2021 Filing Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.q2_2021_filing_date}
                              onChange={(e) => setFeesInfo({...feesInfo, q2_2021_filing_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2021 Amount Filed</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q2 2021 Amount Filed"
                              value={feesInfo.q2_2021_amount_filed}
                              onChange={(e) => setFeesInfo({...feesInfo, q2_2021_amount_filed: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2021 Benefits</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q2 2021 Benefits"
                              value={feesInfo.q2_2021_benefits}
                              onChange={(e) => setFeesInfo({...feesInfo, q2_2021_benefits: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q2 2021 Eligibility Basis</label>
                            <select
                              className="form-select"
                              value={feesInfo.q2_2021_eligibility_basis}
                              onChange={(e) => setFeesInfo({...feesInfo, q2_2021_eligibility_basis: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="N/A">N/A</option>
                              <option value="FPSO">FPSO</option>
                              <option value="SDGR">SDGR</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <div className="form-check custom-checkbox">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="q3-2021-filed-status"
                                checked={feesInfo.q3_2021_filed_status}
                                onChange={(e) => setFeesInfo({...feesInfo, q3_2021_filed_status: e.target.checked})}
                                disabled={!isEditMode}
                              />
                              <label className="form-check-label" htmlFor="q3-2021-filed-status">
                                Q3 2021 Filed Status
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2021 Filing Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.q3_2021_filing_date}
                              onChange={(e) => setFeesInfo({...feesInfo, q3_2021_filing_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2021 Amount Filed</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2021 Amount Filed"
                              value={feesInfo.q3_2021_amount_filed}
                              onChange={(e) => setFeesInfo({...feesInfo, q3_2021_amount_filed: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2021 Benefits</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2021 Benefits"
                              value={feesInfo.q3_2021_benefits}
                              onChange={(e) => setFeesInfo({...feesInfo, q3_2021_benefits: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q3 2021 Eligibility Basis</label>
                            <select
                              className="form-select"
                              value={feesInfo.q3_2021_eligibility_basis}
                              onChange={(e) => setFeesInfo({...feesInfo, q3_2021_eligibility_basis: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="N/A">N/A</option>
                              <option value="FPSO">FPSO</option>
                              <option value="SDGR">SDGR</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <div className="form-check custom-checkbox">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="q4-2021-filed-status"
                                checked={feesInfo.q4_2021_filed_status}
                                onChange={(e) => setFeesInfo({...feesInfo, q4_2021_filed_status: e.target.checked})}
                                disabled={!isEditMode}
                              />
                              <label className="form-check-label" htmlFor="q4-2021-filed-status">
                                Q4 2021 Filed Status
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2021 Filing Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.q4_2021_filing_date}
                              onChange={(e) => setFeesInfo({...feesInfo, q4_2021_filing_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2021 Amount Filed</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q4 2021 Amount Filed"
                              value={feesInfo.q4_2021_amount_filed}
                              onChange={(e) => setFeesInfo({...feesInfo, q4_2021_amount_filed: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2021 Benefits</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q4 2021 Benefits"
                              value={feesInfo.q4_2021_benefits}
                              onChange={(e) => setFeesInfo({...feesInfo, q4_2021_benefits: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Q4 2021 Eligibility Basis</label>
                            <select
                              className="form-select"
                              value={feesInfo.q4_2021_eligibility_basis}
                              onChange={(e) => setFeesInfo({...feesInfo, q4_2021_eligibility_basis: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="N/A">N/A</option>
                              <option value="FPSO">FPSO</option>
                              <option value="SDGR">SDGR</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">ERC Letter, Check & Amount</h5>
                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">2020</h6>

                      <div className="row mb-3">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q1 2020 Loop</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.q1_2020_loop}
                              onChange={(e) => setFeesInfo({...feesInfo, q1_2020_loop: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-check custom-checkbox">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="q1-2020-letter"
                              checked={feesInfo.q1_2020_letter}
                              onChange={(e) => setFeesInfo({...feesInfo, q1_2020_letter: e.target.checked})}
                              disabled={!isEditMode}
                            />
                            <label className="form-check-label" htmlFor="q1-2020-letter">
                              Q1 2020 Letter
                            </label>
                          </div>
                        </div>
                        <div className='col-md-3'>
                          <div className="form-check custom-checkbox">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="q1-2020-check"
                              checked={feesInfo.q1_2020_check}
                              onChange={(e) => setFeesInfo({...feesInfo, q1_2020_check: e.target.checked})}
                              disabled={!isEditMode}
                            />
                            <label className="form-check-label" htmlFor="q1-2020-check">
                              Q1 2020 Check
                            </label>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q1 2020 Chq Amt</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q1 2020 Chq Amt"
                              value={feesInfo.q1_2020_chq_amt}
                              onChange={(e) => setFeesInfo({...feesInfo, q1_2020_chq_amt: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q2 2020 Loop</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.q2_2020_loop}
                              onChange={(e) => setFeesInfo({...feesInfo, q2_2020_loop: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-check custom-checkbox">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="q2-2020-letter"
                              checked={feesInfo.q2_2020_letter}
                              onChange={(e) => setFeesInfo({...feesInfo, q2_2020_letter: e.target.checked})}
                              disabled={!isEditMode}
                            />
                            <label className="form-check-label" htmlFor="q2-2020-letter">
                              Q2 2020 Letter
                            </label>
                          </div>
                        </div>
                        <div className='col-md-3'>
                          <div className="form-check custom-checkbox">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="q2-2020-check"
                              checked={feesInfo.q2_2020_check}
                              onChange={(e) => setFeesInfo({...feesInfo, q2_2020_check: e.target.checked})}
                              disabled={!isEditMode}
                            />
                            <label className="form-check-label" htmlFor="q2-2020-check">
                              Q2 2020 Check
                            </label>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q2 2020 Chq Amt</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q2 2020 Chq Amt"
                              value={feesInfo.q2_2020_chq_amt}
                              onChange={(e) => setFeesInfo({...feesInfo, q2_2020_chq_amt: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q3 2020 Loop</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.q3_2020_loop}
                              onChange={(e) => setFeesInfo({...feesInfo, q3_2020_loop: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-check custom-checkbox">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="q3-2020-letter"
                              checked={feesInfo.q3_2020_letter}
                              onChange={(e) => setFeesInfo({...feesInfo, q3_2020_letter: e.target.checked})}
                              disabled={!isEditMode}
                            />
                            <label className="form-check-label" htmlFor="q3-2020-letter">
                              Q3 2020 Letter
                            </label>
                          </div>
                        </div>
                        <div className='col-md-3'>
                          <div className="form-check custom-checkbox">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="q3-2020-check"
                              checked={feesInfo.q3_2020_check}
                              onChange={(e) => setFeesInfo({...feesInfo, q3_2020_check: e.target.checked})}
                              disabled={!isEditMode}
                            />
                            <label className="form-check-label" htmlFor="q3-2020-check">
                              Q3 2020 Check
                            </label>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q3 2020 Chq Amt</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2020 Chq Amt"
                              value={feesInfo.q3_2020_chq_amt}
                              onChange={(e) => setFeesInfo({...feesInfo, q3_2020_chq_amt: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q4 2020 Loop</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.q4_2020_loop}
                              onChange={(e) => setFeesInfo({...feesInfo, q4_2020_loop: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-check custom-checkbox">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="q4-2020-letter"
                              checked={feesInfo.q4_2020_letter}
                              onChange={(e) => setFeesInfo({...feesInfo, q4_2020_letter: e.target.checked})}
                              disabled={!isEditMode}
                            />
                            <label className="form-check-label" htmlFor="q4-2020-letter">
                              Q4 2020 Letter
                            </label>
                          </div>
                        </div>
                        <div className='col-md-3'>
                          <div className="form-check custom-checkbox">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="q4-2020-check"
                              checked={feesInfo.q4_2020_check}
                              onChange={(e) => setFeesInfo({...feesInfo, q4_2020_check: e.target.checked})}
                              disabled={!isEditMode}
                            />
                            <label className="form-check-label" htmlFor="q4-2020-check">
                              Q4 2020 Check
                            </label>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q4 2020 Chq Amt</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q4 2020 Chq Amt"
                              value={feesInfo.q4_2020_chq_amt}
                              onChange={(e) => setFeesInfo({...feesInfo, q4_2020_chq_amt: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">2021</h6>

                      <div className="row mb-3">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q1 2021 Loop</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.q1_2021_loop}
                              onChange={(e) => setFeesInfo({...feesInfo, q1_2021_loop: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-check custom-checkbox">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="q1-2021-letter"
                              checked={feesInfo.q1_2021_letter}
                              onChange={(e) => setFeesInfo({...feesInfo, q1_2021_letter: e.target.checked})}
                              disabled={!isEditMode}
                            />
                            <label className="form-check-label" htmlFor="q1-2021-letter">
                              Q1 2021 Letter
                            </label>
                          </div>
                        </div>
                        <div className='col-md-3'>
                          <div className="form-check custom-checkbox">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="q1-2021-check"
                              checked={feesInfo.q1_2021_check}
                              onChange={(e) => setFeesInfo({...feesInfo, q1_2021_check: e.target.checked})}
                              disabled={!isEditMode}
                            />
                            <label className="form-check-label" htmlFor="q1-2021-check">
                              Q1 2021 Check
                            </label>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q1 2021 Chq Amt</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q1 2021 Chq Amt"
                              value={feesInfo.q1_2021_chq_amt}
                              onChange={(e) => setFeesInfo({...feesInfo, q1_2021_chq_amt: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q2 2021 Loop</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.q2_2021_loop}
                              onChange={(e) => setFeesInfo({...feesInfo, q2_2021_loop: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-check custom-checkbox">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="q2-2021-letter"
                              checked={feesInfo.q2_2021_letter}
                              onChange={(e) => setFeesInfo({...feesInfo, q2_2021_letter: e.target.checked})}
                              disabled={!isEditMode}
                            />
                            <label className="form-check-label" htmlFor="q2-2021-letter">
                              Q2 2021 Letter
                            </label>
                          </div>
                        </div>
                        <div className='col-md-3'>
                          <div className="form-check custom-checkbox">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="q2-2021-check"
                              checked={feesInfo.q2_2021_check}
                              onChange={(e) => setFeesInfo({...feesInfo, q2_2021_check: e.target.checked})}
                              disabled={!isEditMode}
                            />
                            <label className="form-check-label" htmlFor="q2-2021-check">
                              Q2 2021 Check
                            </label>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q2 2021 Chq Amt</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q2 2021 Chq Amt"
                              value={feesInfo.q2_2021_chq_amt}
                              onChange={(e) => setFeesInfo({...feesInfo, q2_2021_chq_amt: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q3 2021 Loop</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.q3_2021_loop}
                              onChange={(e) => setFeesInfo({...feesInfo, q3_2021_loop: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-check custom-checkbox">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="q3-2021-letter"
                              checked={feesInfo.q3_2021_letter}
                              onChange={(e) => setFeesInfo({...feesInfo, q3_2021_letter: e.target.checked})}
                              disabled={!isEditMode}
                            />
                            <label className="form-check-label" htmlFor="q3-2021-letter">
                              Q3 2021 Letter
                            </label>
                          </div>
                        </div>
                        <div className='col-md-3'>
                          <div className="form-check custom-checkbox">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="q3-2021-check"
                              checked={feesInfo.q3_2021_check}
                              onChange={(e) => setFeesInfo({...feesInfo, q3_2021_check: e.target.checked})}
                              disabled={!isEditMode}
                            />
                            <label className="form-check-label" htmlFor="q3-2021-check">
                              Q3 2021 Check
                            </label>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q3 2021 Chq Amt</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q3 2021 Chq Amt"
                              value={feesInfo.q3_2021_chq_amt}
                              onChange={(e) => setFeesInfo({...feesInfo, q3_2021_chq_amt: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q4 2021 Loop</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.q4_2021_loop}
                              onChange={(e) => setFeesInfo({...feesInfo, q4_2021_loop: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-check custom-checkbox">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="q4-2021-letter"
                              checked={feesInfo.q4_2021_letter}
                              onChange={(e) => setFeesInfo({...feesInfo, q4_2021_letter: e.target.checked})}
                              disabled={!isEditMode}
                            />
                            <label className="form-check-label" htmlFor="q4-2021-letter">
                              Q4 2021 Letter
                            </label>
                          </div>
                        </div>
                        <div className='col-md-3'>
                          <div className="form-check custom-checkbox">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="q4-2021-check"
                              checked={feesInfo.q4_2021_check}
                              onChange={(e) => setFeesInfo({...feesInfo, q4_2021_check: e.target.checked})}
                              disabled={!isEditMode}
                            />
                            <label className="form-check-label" htmlFor="q4-2021-check">
                              Q4 2021 Check
                            </label>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">Q4 2021 Chq Amt</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Q4 2021 Chq Amt"
                              value={feesInfo.q4_2021_chq_amt}
                              onChange={(e) => setFeesInfo({...feesInfo, q4_2021_chq_amt: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <h5 className="section-title mt-4">Success Fee Invoice Details</h5>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">I - Invoice Details</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">I Invoice number</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoice number"
                              value={feesInfo.i_invoice_number}
                              onChange={(e) => setFeesInfo({...feesInfo, i_invoice_number: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">I Invoice Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoice Amount"
                              value={feesInfo.i_invoice_amount}
                              onChange={(e) => setFeesInfo({...feesInfo, i_invoice_amount: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">I Invoiced Qtrs</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoiced Qtrs"
                              value={feesInfo.i_invoiced_qtrs}
                              onChange={(e) => setFeesInfo({...feesInfo, i_invoiced_qtrs: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">I Invoice Sent Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.i_invoice_sent_date}
                              onChange={(e) => setFeesInfo({...feesInfo, i_invoice_sent_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">I Invoice Payment Type</label>
                            <select
                              className="form-select"
                              value={feesInfo.i_invoice_payment_type}
                              onChange={(e) => setFeesInfo({...feesInfo, i_invoice_payment_type: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="">Select payment type</option>
                              <option value="occams_initiated_eCheck">Occams Initiated - eCheck</option>
                              <option value="occams_initiated_ach">Occams Initiated - ACH</option>
                              <option value="occams_initiated_wire">Client Initiated - Wire</option>
                              <option value="client_initiated_ach">Client Initiated - ACH</option>
                              <option value="client_initiated_check_mailed">Client Initiated - Check Mailed</option>
                              <option value="credit_card_or_debit_card">Credit Card or Debit Card</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">I Invoice Payment Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.i_invoice_payment_date}
                              onChange={(e) => setFeesInfo({...feesInfo, i_invoice_payment_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">I Invoice Pay Cleared</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.i_invoice_pay_cleared}
                              onChange={(e) => setFeesInfo({...feesInfo, i_invoice_pay_cleared: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">I Invoice Pay Returned</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.i_invoice_pay_returned}
                              onChange={(e) => setFeesInfo({...feesInfo, i_invoice_pay_returned: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">I Invoice Return Reason</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Return Reason"
                              value={feesInfo.i_invoice_return_reason}
                              onChange={(e) => setFeesInfo({...feesInfo, i_invoice_return_reason: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">I Invoice Occams Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Occams Share"
                              value={feesInfo.i_invoice_occams_share}
                              onChange={(e) => setFeesInfo({...feesInfo, i_invoice_occams_share: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">I Invoice Aff/Ref Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Aff/Ref Share"
                              value={feesInfo.i_invoice_affref_share}
                              onChange={(e) => setFeesInfo({...feesInfo, i_invoice_affref_share: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">II - Invoice Details</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">II Invoice number</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoice number"
                              value={feesInfo.ii_invoice_number}
                              onChange={(e) => setFeesInfo({...feesInfo, ii_invoice_number: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">II Invoice Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoice Amount"
                              value={feesInfo.ii_invoice_amount}
                              onChange={(e) => setFeesInfo({...feesInfo, ii_invoice_amount: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">II Invoiced Qtrs</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoiced Qtrs"
                              value={feesInfo.ii_invoiced_qtrs}
                              onChange={(e) => setFeesInfo({...feesInfo, ii_invoiced_qtrs: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">II Invoice Sent Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.ii_invoice_sent_date}
                              onChange={(e) => setFeesInfo({...feesInfo, ii_invoice_sent_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">II Invoice Payment Type</label>
                            <select
                              className="form-select"
                              value={feesInfo.ii_invoice_payment_type}
                              onChange={(e) => setFeesInfo({...feesInfo, ii_invoice_payment_type: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="">Select payment type</option>
                              <option value="occams_initiated_eCheck">Occams Initiated - eCheck</option>
                              <option value="occams_initiated_ach">Occams Initiated - ACH</option>
                              <option value="occams_initiated_wire">Client Initiated - Wire</option>
                              <option value="client_initiated_ach">Client Initiated - ACH</option>
                              <option value="client_initiated_check_mailed">Client Initiated - Check Mailed</option>
                              <option value="credit_card_or_debit_card">Credit Card or Debit Card</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">II Invoice Payment Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.ii_invoice_payment_date}
                              onChange={(e) => setFeesInfo({...feesInfo, ii_invoice_payment_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">II Invoice Pay Cleared</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.ii_invoice_pay_cleared}
                              onChange={(e) => setFeesInfo({...feesInfo, ii_invoice_pay_cleared: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">II Invoice Pay Returned</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.ii_invoice_pay_returned}
                              onChange={(e) => setFeesInfo({...feesInfo, ii_invoice_pay_returned: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">II Invoice Return Reason</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Return Reason"
                              value={feesInfo.ii_invoice_return_reason}
                              onChange={(e) => setFeesInfo({...feesInfo, ii_invoice_return_reason: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">II Invoice Occams Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Occams Share"
                              value={feesInfo.ii_invoice_occams_share}
                              onChange={(e) => setFeesInfo({...feesInfo, ii_invoice_occams_share: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">II Invoice Aff/Ref Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Aff/Ref Share"
                              value={feesInfo.ii_invoice_affref_share}
                              onChange={(e) => setFeesInfo({...feesInfo, ii_invoice_affref_share: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">III - Invoice Details</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">III Invoice number</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoice number"
                              value={feesInfo.iii_invoice_number}
                              onChange={(e) => setFeesInfo({...feesInfo, iii_invoice_number: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">III Invoice Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoice Amount"
                              value={feesInfo.iii_invoice_amount}
                              onChange={(e) => setFeesInfo({...feesInfo, iii_invoice_amount: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">III Invoiced Qtrs</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoiced Qtrs"
                              value={feesInfo.iii_invoiced_qtrs}
                              onChange={(e) => setFeesInfo({...feesInfo, iii_invoiced_qtrs: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">III Invoice Sent Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.iii_invoice_sent_date}
                              onChange={(e) => setFeesInfo({...feesInfo, iii_invoice_sent_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">III Invoice Payment Type</label>
                            <select
                              className="form-select"
                              value={feesInfo.iii_invoice_payment_type}
                              onChange={(e) => setFeesInfo({...feesInfo, iii_invoice_payment_type: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="">Select payment type</option>
                              <option value="occams_initiated_eCheck">Occams Initiated - eCheck</option>
                              <option value="occams_initiated_ach">Occams Initiated - ACH</option>
                              <option value="occams_initiated_wire">Client Initiated - Wire</option>
                              <option value="client_initiated_ach">Client Initiated - ACH</option>
                              <option value="client_initiated_check_mailed">Client Initiated - Check Mailed</option>
                              <option value="credit_card_or_debit_card">Credit Card or Debit Card</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">III Invoice Payment Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.iii_invoice_payment_date}
                              onChange={(e) => setFeesInfo({...feesInfo, iii_invoice_payment_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">III Invoice Pay Cleared</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.iii_invoice_pay_cleared}
                              onChange={(e) => setFeesInfo({...feesInfo, iii_invoice_pay_cleared: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">III Invoice Pay Returned</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.iii_invoice_pay_returned}
                              onChange={(e) => setFeesInfo({...feesInfo, iii_invoice_pay_returned: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">III Invoice Return Reason</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Return Reason"
                              value={feesInfo.iii_invoice_return_reason}
                              onChange={(e) => setFeesInfo({...feesInfo, iii_invoice_return_reason: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">III Invoice Occams Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Occams Share"
                              value={feesInfo.iii_invoice_occams_share}
                              onChange={(e) => setFeesInfo({...feesInfo, iii_invoice_occams_share: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">III Invoice Aff/Ref Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Aff/Ref Share"
                              value={feesInfo.iii_invoice_affref_share}
                              onChange={(e) => setFeesInfo({...feesInfo, iii_invoice_affref_share: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">IV - Invoice Details</h6>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">IV Invoice number</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoice number"
                              value={feesInfo.iv_invoice_number}
                              onChange={(e) => setFeesInfo({...feesInfo, iv_invoice_number: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">IV Invoice Amount</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoice Amount"
                              value={feesInfo.iv_invoice_amount}
                              onChange={(e) => setFeesInfo({...feesInfo, iv_invoice_amount: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">IV Invoiced Qtrs</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Invoiced Qtrs"
                              value={feesInfo.iv_invoiced_qtrs}
                              onChange={(e) => setFeesInfo({...feesInfo, iv_invoiced_qtrs: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">IV Invoice Sent Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.iv_invoice_sent_date}
                              onChange={(e) => setFeesInfo({...feesInfo, iv_invoice_sent_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">IV Invoice Payment Type</label>
                            <select
                              className="form-select"
                              value={feesInfo.iv_invoice_payment_type}
                              onChange={(e) => setFeesInfo({...feesInfo, iv_invoice_payment_type: e.target.value})}
                              disabled={!isEditMode}
                            >
                              <option value="">Select payment type</option>
                              <option value="occams_initiated_eCheck">Occams Initiated - eCheck</option>
                              <option value="occams_initiated_ach">Occams Initiated - ACH</option>
                              <option value="occams_initiated_wire">Client Initiated - Wire</option>
                              <option value="client_initiated_ach">Client Initiated - ACH</option>
                              <option value="client_initiated_check_mailed">Client Initiated - Check Mailed</option>
                              <option value="credit_card_or_debit_card">Credit Card or Debit Card</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">IV Invoice Payment Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.iv_invoice_payment_date}
                              onChange={(e) => setFeesInfo({...feesInfo, iv_invoice_payment_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">IV Invoice Pay Cleared</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.iv_invoice_pay_cleared}
                              onChange={(e) => setFeesInfo({...feesInfo, iv_invoice_pay_cleared: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">IV Invoice Pay Returned</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/DD/YYYY"
                              value={feesInfo.iv_invoice_pay_returned}
                              onChange={(e) => setFeesInfo({...feesInfo, iv_invoice_pay_returned: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">IV Invoice Return Reason</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Return Reason"
                              value={feesInfo.iv_invoice_return_reason}
                              onChange={(e) => setFeesInfo({...feesInfo, iv_invoice_return_reason: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">IV Invoice Occams Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Occams Share"
                              value={feesInfo.iv_invoice_occams_share}
                              onChange={(e) => setFeesInfo({...feesInfo, iv_invoice_occams_share: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">IV Invoice Aff/Ref Share</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Aff/Ref Share"
                              value={feesInfo.iv_invoice_affref_share}
                              onChange={(e) => setFeesInfo({...feesInfo, iv_invoice_affref_share: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Documents Tab Content */}
                  {activeTab === 'documents' && (
                    <div className="mb-4 left-section-container">
                      <h5 class="section-title">ERC Documents</h5>

                      <div className="document-list">
                        <div className="table-responsive">
                          <table className="table document-table">
                            <thead>
                              <tr>
                                <th>Documents</th>
                                <th>PPP Loan <i class="fa-solid fa-circle-info" title='Did your company apply for PPP Loan in 2020 and / or 2021?'></i></th>
                                <th>Files</th>
                                <th>Status</th>
                                <th>Comments</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Form 3508 for 2020 PPP Forgiveness under CARES Act</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        defaultChecked
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-review">In Review</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Form 941 for Q1 2020</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-pending">Pending</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Form 941 for Q2 2020</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-file-pdf"></i>
                                    </div>
                                    <span>q2_form.pdf</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-approved">Approved</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Form 941 for Q3 2020</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        defaultChecked
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-rejected">Rejected</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <h5 class="section-title mt-4">Company Documents</h5>

                      <div className="document-list">
                        <div className="table-responsive">
                          <table className="table document-table">
                            <thead>
                              <tr>
                                <th>Documents</th>
                                <th>Files</th>
                                <th>Status</th>
                                <th>Comments</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Company Incorporation Document – Certificate or Articles of Incorporation</span>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-review">In Review</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Tax Id – Employee Identification Number (EIN) Issued by IRS</span>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-pending">Pending</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Additional Document 1</span>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-file-pdf"></i>
                                    </div>
                                    <span>q2_form.pdf</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-approved">Approved</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>TaxNow Sign-up</span>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-rejected">Rejected</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <h5 class="section-title mt-4">Payroll Documents</h5>
                      <h6 class="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">Quarterly Payroll Tax Return 941’s for Eligible Quarters – 2020: Q1-Q4 & 2021: Q1-Q3</h6>

                      <div className="document-list">
                        <div className="table-responsive">
                          <table className="table document-table">
                            <thead>
                              <tr>
                                <th>Quarters</th>
                                <th>W2 Employee <i class="fa-solid fa-circle-info" title='Did your Company have W2 Employee in this Quarter?	'></i></th>
                                <th>Files</th>
                                <th>Status</th>
                                <th>Comments</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q1 2020</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        defaultChecked
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-review">In Review</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q2 2020</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-pending">Pending</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q3 2020	</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-file-pdf"></i>
                                    </div>
                                    <span>q2_form.pdf</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-approved">Approved</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q4 2020</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        defaultChecked
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-rejected">Rejected</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q1 2021</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        defaultChecked
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-review">In Review</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q2 2021</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-pending">Pending</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q3 2021</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-file-pdf"></i>
                                    </div>
                                    <span>q2_form.pdf</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-approved">Approved</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <h6 class="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">Payroll Registers for all Eligible Quarters – 2020: Q1-Q4 & 2021: Q1-Q3</h6>

                      <div className="document-list">
                        <div className="table-responsive">
                          <table className="table document-table">
                            <thead>
                              <tr>
                                <th>Quarters</th>
                                <th>W2 Employee <i class="fa-solid fa-circle-info" title='Did your Company have W2 Employee in this Quarter?	'></i></th>
                                <th>Files</th>
                                <th>Status</th>
                                <th>Comments</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q1 2020</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        defaultChecked
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-review">In Review</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q2 2020</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-pending">Pending</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q3 2020	</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-file-pdf"></i>
                                    </div>
                                    <span>q2_form.pdf</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-approved">Approved</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q4 2020</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        defaultChecked
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-rejected">Rejected</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q1 2021</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        defaultChecked
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-review">In Review</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q2 2021</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-pending">Pending</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q3 2021</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-file-pdf"></i>
                                    </div>
                                    <span>q2_form.pdf</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-approved">Approved</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <h6 class="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">Total Health Care Expenses per Employee per Payroll for 2020: Q1-Q4 & 2021: Q1-Q3</h6>

                      <div className="document-list">
                        <div className="table-responsive">
                          <table className="table document-table">
                            <thead>
                              <tr>
                                <th>Quarters</th>
                                <th>W2 Employee <i class="fa-solid fa-circle-info" title='Did your Company have W2 Employee in this Quarter?	'></i></th>
                                <th>Files</th>
                                <th>Status</th>
                                <th>Comments</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q1 2020</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        defaultChecked
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-review">In Review</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q2 2020</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-pending">Pending</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q3 2020	</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-file-pdf"></i>
                                    </div>
                                    <span>q2_form.pdf</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-approved">Approved</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q4 2020</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        defaultChecked
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-rejected">Rejected</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q1 2021</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        defaultChecked
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-review">In Review</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q2 2021</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-pending">Pending</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Q3 2021</span>
                                </td>
                                <td>
                                  <div className="toggle-container">
                                    <span className="toggle-option disabled">No</span>
                                    <label className="toggle-switch disabled">
                                      <input
                                        type="checkbox"
                                        disabled
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-option disabled">Yes</span>
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-file-pdf"></i>
                                    </div>
                                    <span>q2_form.pdf</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-approved">Approved</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <h6 class="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">Payroll Additional Documents</h6>

                      <div className="document-list">
                        <div className="table-responsive">
                          <table className="table document-table">
                            <thead>
                              <tr>
                                <th>Quarters</th>
                                <th>Files</th>
                                <th>Status</th>
                                <th>Comments</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>2019 Average FTE (Full Time Employee)</span>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-review">In Review</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Additional Document 1</span>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-pending">Pending</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Additional Document 2	</span>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-file-pdf"></i>
                                    </div>
                                    <span>q2_form.pdf</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-approved">Approved</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <h5 class="section-title mt-4">Other Documents</h5>

                      <div className="document-list">
                        <div className="table-responsive">
                          <table className="table document-table">
                            <thead>
                              <tr>
                                <th>Documents</th>
                                <th>Files</th>
                                <th>Status</th>
                                <th>Comments</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>2019 - Business Tax Returns - Filed Federal Tax Return 1120, 1120 - S or 1065</span>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-review">In Review</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>2020 - Business Tax Returns - Filed Federal Tax Return 1120, 1120 - S or 1065</span>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-image"></i>
                                    </div>
                                    <span>demo.png</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-pending">Pending</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>2021 - Business Tax Returns - Filed Federal Tax Return 1120, 1120 - S or 1065</span>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-file-pdf"></i>
                                    </div>
                                    <span>q2_form.pdf</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-approved">Approved</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Additional Document 1</span>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-file-pdf"></i>
                                    </div>
                                    <span>q2_form.pdf</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-approved">Approved</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr className="document-row">
                                <td className="document-name">
                                  <span>Additional Document 2</span>
                                </td>
                                <td>
                                  <a
                                    href="#"
                                    className="file-link"
                                    target="_blank"
                                  >
                                    <div className="file-icon">
                                      <i className="fas fa-file-pdf"></i>
                                    </div>
                                    <span>q2_form.pdf</span>
                                  </a>
                                </td>
                                <td>
                                  <span className="status-badge status-approved">Approved</span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-comment"></i>
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Invoices Tab Content */}
                  {activeTab === 'invoices' && (
                    <div className="mb-4 left-section-container">
                      <div class="contact_tab_data">
                        <div class="row custom_opp_tab">
                          <div class="col-sm-12">
                            <div class="custom_opp_tab_header">
                              <h5>
                                <a href="javascript:void(0)" target="_blank" data-invoiceid="7335">
                                  Invoice ERC-7335</a> -
                                <span class="status cancel badge bg-success"> Paid</span>
                              </h5>
                              <div class="opp_edit_dlt_btn projects-iris">
                              </div>
                            </div>
                          </div>

                          <div class="col-md-8 text-left">
                            <div class="lead_des">
                              <p><b>Invoice Amount:</b> $219541.10</p>
                              <p><b>Invoice Sent Date:</b> 06/01/2024</p>
                              <p><b>Invoice Due Date:</b> 06/01/2024</p>
                              <p><b>Service Name:</b> 2020 Q4 Financial Consultancy Service Fee, Accrued Interest</p>
                              <p><b>Created By: </b> Occams Finance</p>
                              <p><b>Updated By: </b> Occams Finance</p>
                            </div>
                          </div>

                          <div class="col-md-4">
                            <div class="lead_des">
                              <p><b>Payment Date:</b> N/A</p>
                              <p>
                                <b>Payment Cleared Date:</b> N/A</p>
                              <p>
                                <b>Payment Mode:</b> N/A</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="contact_tab_data">
                        <div class="row custom_opp_tab">
                          <div class="col-sm-12">
                            <div class="custom_opp_tab_header">
                              <h5>
                                <a href="javascript:void(0)" target="_blank" data-invoiceid="7335">
                                  Invoice ERC-7335</a> -
                                <span class="status cancel badge bg-cancel"> Cancelled</span>
                              </h5>
                              <div class="opp_edit_dlt_btn projects-iris">
                              </div>
                            </div>
                          </div>

                          <div class="col-md-8 text-left">
                            <div class="lead_des">
                              <p><b>Invoice Amount:</b> $219541.10</p>
                              <p><b>Invoice Sent Date:</b> 06/01/2024</p>
                              <p><b>Invoice Due Date:</b> 06/01/2024</p>
                              <p><b>Service Name:</b> 2020 Q4 Financial Consultancy Service Fee, Accrued Interest</p>
                              <p><b>Created By: </b> Occams Finance</p>
                              <p><b>Updated By: </b> Occams Finance</p>
                            </div>
                          </div>

                          <div class="col-md-4">
                            <div class="lead_des">
                              <p><b>Payment Date:</b> N/A</p>
                              <p>
                                <b>Payment Cleared Date:</b> N/A</p>
                              <p>
                                <b>Payment Mode:</b> N/A</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="contact_tab_data">
                        <div class="row custom_opp_tab">
                          <div class="col-sm-12">
                            <div class="custom_opp_tab_header">
                              <h5>
                                <a href="javascript:void(0)" target="_blank" data-invoiceid="7335">
                                  Invoice ERC-7335</a> -
                                <span class="status cancel badge bg-success"> Paid</span>
                              </h5>
                              <div class="opp_edit_dlt_btn projects-iris">
                              </div>
                            </div>
                          </div>

                          <div class="col-md-8 text-left">
                            <div class="lead_des">
                              <p><b>Invoice Amount:</b> $219541.10</p>
                              <p><b>Invoice Sent Date:</b> 06/01/2024</p>
                              <p><b>Invoice Due Date:</b> 06/01/2024</p>
                              <p><b>Service Name:</b> 2020 Q4 Financial Consultancy Service Fee, Accrued Interest</p>
                              <p><b>Created By: </b> Occams Finance</p>
                              <p><b>Updated By: </b> Occams Finance</p>
                            </div>
                          </div>

                          <div class="col-md-4">
                            <div class="lead_des">
                              <p><b>Payment Date:</b> N/A</p>
                              <p>
                                <b>Payment Cleared Date:</b> N/A</p>
                              <p>
                                <b>Payment Mode:</b> N/A</p>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Audit Logs Tab Content */}
                  {activeTab === 'auditLogs' && (
                    <div className="mb-4 left-section-container">
                      <h5 className="section-title">Audit Logs</h5>
                      <div className="table-responsive">
                        <table className="table table-striped table-hover">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>User</th>
                              <th>Action</th>
                              <th>Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>2023-05-15 09:30 AM</td>
                              <td>System</td>
                              <td>Project Created</td>
                              <td>Project was created with ID {projectId}</td>
                            </tr>
                            <tr>
                              <td>2023-05-15 10:15 AM</td>
                              <td>Master Ops</td>
                              <td>Status Updated</td>
                              <td>Project status changed to "ERC Fulfillment"</td>
                            </tr>
                            <tr>
                              <td>2023-05-16 02:45 PM</td>
                              <td>Occams Finance</td>
                              <td>Invoice Created</td>
                              <td>Invoice #6580 created for $5,000</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="action-buttons d-flex align-items-center justify-content-center">
                      <button className="btn save-btn">Update</button>
                    </div>
                  </div>

                </div>

                {/* Right Side Section - Same for all tabs */}
                <div className="col-md-3">

                  <div className="card mb-4 p-2">
                    <div className="card-body p-2">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title mb-0">Milestone:</h5>
                        {!isEditing && (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setIsEditing(true)}
                            style={{ fontSize: '16px' }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        )}
                      </div>

                      {!isEditing ? (
                        <div className="milestone-display mb-4 d-flex align-items-center">
                          <span className="fw-medium" style={{ color: '#0000cc' }}>{milestone.label}</span>
                        </div>
                      ) : (
                        <div className="milestone-edit mb-4">
                          <div className="form-group mb-3">
                            <Select
                              value={milestone}
                              onChange={handleMilestoneChange}
                              options={[
                                { value: 'erc-cancelled', label: 'ERC Cancelled' },
                                { value: 'erc-fulfillment', label: 'ERC Fulfillment' },
                                { value: 'erc-enrollment', label: 'ERC Enrollment' },
                                { value: 'erc-lead-lost', label: 'ERC - Lead Lost' }
                              ]}
                              className="react-select-container"
                              classNamePrefix="react-select"
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
                      )}

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title mb-0">Stage:</h5>
                      </div>

                      {!isEditing ? (
                        <div className="stage-display mb-4 d-flex align-items-center">
                          <span className="fw-medium" style={{ color: '#0000cc' }}>{projectStage.label}</span>
                        </div>
                      ) : (
                        <div className="stage-edit mb-4">
                          <div className="form-group mb-3">
                            <Select
                              value={projectStage}
                              onChange={handleProjectStageChange}
                              options={[
                                { value: 'client-declarations-signed', label: 'Client Declarations Signed' },
                                { value: 'pending-pre-fpso-interview', label: 'Pending Pre-FPSO Interview' },
                                { value: 'pre-fpso-interview-scheduled', label: 'Pre FPSO Interview Scheduled' },
                                { value: 'pre-fpso-interview-completed', label: 'Pre FPSO Interview Completed' },
                                { value: 'fpso-interview-pending', label: 'FPSO Interview Pending' },
                                { value: 'fpso-interview-scheduled', label: 'FPSO Interview Scheduled' },
                                { value: 'fpso-opinion-sent', label: 'FPSO Opinion Sent' },
                                { value: 'fpso-opinion-signed', label: 'FPSO Opinion Signed' },
                                { value: 'fpso-interview-completed', label: 'FPSO Interview Completed' },
                                { value: 'prepare-941x', label: 'Prepare 941x' },
                                { value: 'send-941x', label: 'Send 941x' },
                                { value: '941-x-sent', label: '941-X\'s Sent' },
                                { value: 'client-signed-941xs-8821', label: 'Client Signed 941xs + 8821' },
                                { value: 'erc-claim-filed-peo', label: 'ERC Claim Filed - PEO' },
                                { value: 'irs-letter-of-overpay-received', label: 'IRS Letter Of Overpay Received' },
                                { value: 'financier-review-done', label: 'Financier Review Done' },
                                { value: 'erc-package-submitted', label: 'ERC Package Submitted' },
                                { value: 'computation-complete', label: 'Computation Complete' },
                                { value: 'send-declaration', label: 'Send Declaration' },
                                { value: 'payment-plan-fully-acknowledged', label: 'Payment Plan- Partially Acknowledged' }
                              ]}
                              className="react-select-container"
                              classNamePrefix="react-select"
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
                      )}

                      {/* Update/cancel buttons */}
                      {isEditing && (
                        <div className="d-flex justify-content-between mt-3">
                          <button
                            className="btn btn-sm"
                            onClick={() => setIsEditing(false)}
                            style={{
                              backgroundColor: 'white',
                              color: '#ff6a00',
                              border: '1px solid #ff6a00',
                              borderRadius: '20px',
                              padding: '5px 25px'
                            }}
                          >
                            Update
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => setIsEditing(false)}
                            style={{
                              backgroundColor: 'white',
                              color: '#ff6a00',
                              border: '1px solid #ff6a00',
                              borderRadius: '20px',
                              padding: '5px 25px'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card mb-4 p-2">
                    <div className="card-body p-2">
                      <h5 className="card-title">Assigned Collaborators::</h5>

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

                  <div className="card mb-4 p-2">
                    <div className="card-body p-2">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title mb-0">Select Owner:</h5>
                        {!isEditingOwner && (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setIsEditingOwner(true)}
                            style={{ fontSize: '16px' }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        )}
                      </div>

                      {!isEditingOwner ? (
                        <div className="owner-display mb-4 d-flex align-items-center">
                          <span className="fw-medium" style={{ color: '#0000cc' }}>{owner.label}</span>
                        </div>
                      ) : (
                        <div className="owner-edit mb-4">
                          <div className="form-group mb-3">
                            <Select
                              value={owner}
                              onChange={handleOwnerChange}
                              options={[
                                { value: 'erc-fprs', label: 'ERC - FPRS' },
                                { value: 'erc-referrals', label: 'ERC - Referrals' },
                                { value: 'erc-direct', label: 'ERC - Direct' },
                                { value: 'erc-partners', label: 'ERC - Partners' }
                              ]}
                              className="react-select-container"
                              classNamePrefix="react-select"
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
                          <div className="d-flex justify-content-between mt-3">
                            <button
                              className="btn btn-sm"
                              onClick={() => setIsEditingOwner(false)}
                              style={{
                                backgroundColor: 'white',
                                color: '#ff6a00',
                                border: '1px solid #ff6a00',
                                borderRadius: '20px',
                                padding: '5px 25px'
                              }}
                            >
                              Update
                            </button>
                            <button
                              className="btn btn-sm"
                              onClick={() => setIsEditingOwner(false)}
                              style={{
                                backgroundColor: 'white',
                                color: '#ff6a00',
                                border: '1px solid #ff6a00',
                                borderRadius: '20px',
                                padding: '5px 25px'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card mb-4 p-2">
                    <div className="card-body p-2">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title mb-0">Select Contact:</h5>
                        {!isEditingContact && (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setIsEditingContact(true)}
                            style={{ fontSize: '16px' }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        )}
                      </div>

                      {!isEditingContact ? (
                        <div className="contact-display mb-4 d-flex align-items-center">
                          <span className="fw-medium" style={{ color: '#0000cc' }}>{selectedContact.label}</span>
                        </div>
                      ) : (
                        <div className="contact-edit mb-4">
                          <div className="form-group mb-3">
                            <Select
                              value={selectedContact}
                              onChange={handleContactChange}
                              options={[
                                { value: 'sunny-shekhar', label: 'Sunny Shekhar' },
                                { value: 'rahul-sharma', label: 'Rahul Sharma' },
                                { value: 'priya-patel', label: 'Priya Patel' },
                                { value: 'amit-kumar', label: 'Amit Kumar' }
                              ]}
                              className="react-select-container"
                              classNamePrefix="react-select"
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
                          <div className="d-flex justify-content-between mt-3">
                            <button
                              className="btn btn-sm"
                              onClick={() => setIsEditingContact(false)}
                              style={{
                                backgroundColor: 'white',
                                color: '#ff6a00',
                                border: '1px solid #ff6a00',
                                borderRadius: '20px',
                                padding: '5px 25px'
                              }}
                            >
                              Update
                            </button>
                            <button
                              className="btn btn-sm"
                              onClick={() => setIsEditingContact(false)}
                              style={{
                                backgroundColor: 'white',
                                color: '#ff6a00',
                                border: '1px solid #ff6a00',
                                borderRadius: '20px',
                                padding: '5px 25px'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>


                </div>
              </div>

              <div className='row mt-4'>
                <div className='col-md-9'>
                  {/* Notes Section */}
                  <h5 className="section-title mt-4">Notes</h5>
                  <Notes
                    entityType="project"
                    entityId={projectId}
                    entityName={project?.business_legal_name || ''}
                    showButtons={false}
                    showNotes={true}
                    maxHeight={300}
                  />
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      {showAddNoteModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Note</h5>
                <button type="button" className="close" onClick={toggleAddNoteModal}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <form onSubmit={handleAddNote}>
                <div className="modal-body">
                  <div className="form-group mb-3">
                    <label htmlFor="noteText" className="form-label">Note</label>
                    <textarea
                      id="noteText"
                      className="form-control"
                      rows="4"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={toggleAddNoteModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Note</button>
                </div>
              </form>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
