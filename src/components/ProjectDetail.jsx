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
import Swal from 'sweetalert2';
import Modal from './common/Modal';


// validations
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { projectDetailSchema } from './validationSchemas/projectDetailSchema';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const passedProjectData = location.state?.projectData;

  const [project, setProject] = useState({
    project_id: '',
    project_fee: '',
    authorized_signatory_name: '',
    business_phone: '',
    business_email: '',
    business_title: '',
    zip: '',
    street_address: '',
    city: '',
    state: '',
    identity_document_type: '',
    identity_document_number: '',
    business_legal_name: '',
    doing_business_as: '',
    business_category: '',
    website_url: '',
    business_entity_type: '',
    registration_number: '',
    registration_date: '',
    state_of_registration :''

  });
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
    aba_routing_no: '',
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
    q4_2021_letter: '',
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
    iv_invoice_aff_ref_share: ''
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

  //Documents API
  const [ercDocuments, setERCDocuments] = useState(null);
  const [companyDocuments, setCompanyDocuments] = useState(null);
  const [otherDocuments, setOtherDocuments] = useState(null);
  const [payrollDocuments, setPayrollDocuments] = useState(null);

  const [stcRequiredDocuments, setSTCRequiredDocuments] = useState(null);
  const [stcImpactedDays, setSTCImpactedDays] = useState(null);

  const [documentsLoading, setDocumentsLoading] = useState(false);


    // validation 
    const {
      register,
      handleSubmit,
      setValue,
      formState: { errors },
      getValues,
      trigger,
    } = useForm({
      resolver: yupResolver(projectDetailSchema),
      mode: 'onSubmit',
      reValidateMode: 'onChange',
    });
  
    useEffect(() => {
      if (project) {
        Object.keys(project).forEach((key) => {
          setValue(key, project[key]);
        });
        trigger(); // <- validate after setting
      }
    }, [project, setValue, trigger]);
    


  const fetchERCDocuments = async (id, formId) => {
    try {
      setDocumentsLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('project_id', id);
      formData.append('form_id', formId);

      const response = await axios.post(
        'https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-erc-documents',
        formData,
        {
          headers: { Accept: 'application/json' },
          validateStatus: () => true,
        }
      );

      if (response.status >= 200 && response.status < 300) {
        setERCDocuments(response.data);
      } else {
        setError('Failed to fetch ERC documents.');
      }
    } catch (err) {
      setError('Fetch error: ' + err.message);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const fetchCompanyDocuments = async (id, formId) => {
    try {
      setDocumentsLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('project_id', id);
      formData.append('form_id', formId);

      const response = await axios.post(
        'https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-erc-documents',
        formData,
        {
          headers: { Accept: 'application/json' },
          validateStatus: () => true,
        }
      );

      if (response.status >= 200 && response.status < 300) {
        setCompanyDocuments(response.data);
      } else {
        setError('Failed to fetch company documents.');
      }
    } catch (err) {
      setError('Fetch error: ' + err.message);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const fetchOtherDocuments = async (id, formId) => {
    try {
      setDocumentsLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('project_id', id);
      formData.append('form_id', formId);

      const response = await axios.post(
        'https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-erc-documents',
        formData,
        {
          headers: { Accept: 'application/json' },
          validateStatus: () => true,
        }
      );

      if (response.status >= 200 && response.status < 300) {
        setOtherDocuments(response.data);
      } else {
        setError('Failed to fetch other documents.');
      }
    } catch (err) {
      setError('Fetch error: ' + err.message);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const fetchPayrollDocuments = async (id) => {
    try {
      setDocumentsLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('project_id', id);

      const response = await axios.post(
        'https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-erc-payroll-documents',
        formData,
        {
          headers: { Accept: 'application/json' },
          validateStatus: () => true,
        }
      );

      if (response.status >= 200 && response.status < 300) {
        setPayrollDocuments(response.data);
      } else {
        setError('Failed to fetch payroll documents.');
      }
    } catch (err) {
      setError('Fetch error: ' + err.message);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const fetchSTCRequiredDocuments = async (id) => {
    try {
      setDocumentsLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('project_id', id);

      const response = await axios.post(
        'https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-stc-required-documents',
        formData,
        {
          headers: { Accept: 'application/json' },
          validateStatus: () => true,
        }
      );

      if (response.status >= 200 && response.status < 300) {
        setSTCRequiredDocuments(response.data);
      } else {
        setError('Failed to fetch STC Required documents.');
      }
    } catch (err) {
      setError('Fetch error: ' + err.message);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const fetchSTCImpactedDays = async (id) => {
    try {
      setDocumentsLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('project_id', id);

      const response = await axios.post(
        'https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-stc-impacted-days',
        formData,
        {
          headers: { Accept: 'application/json' },
          validateStatus: () => true,
        }
      );

      if (response.status >= 200 && response.status < 300) {
        setSTCImpactedDays(response.data);
      } else {
        setError('Failed to fetch STC Impacted Days.');
      }
    } catch (err) {
      setError('Fetch error: ' + err.message);
    } finally {
      setDocumentsLoading(false);
    }
  };
  // Collaborators related state
  const [collaborators, setCollaborators] = useState([]);
  const [currentCollaborators, setCurrentCollaborators] = useState([]);
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);
  const [collaboratorOptions, setCollaboratorOptions] = useState([]);
  const [collaboratorLoading, setCollaboratorLoading] = useState(false);

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
  const [contacts, setContacts] = useState([]);
  const [contactOptions, setContactOptions] = useState([]);
  const [contactLoading, setContactLoading] = useState(false);

  // Project group, campaign, source, and stage state
  const [owner, setOwner] = useState({ value: 'erc-fprs', label: 'ERC - FPRS' });
  const [owners, setOwners] = useState([]);
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [projectCampaign, setProjectCampaign] = useState(null);
  const [projectSource, setProjectSource] = useState(null);
  const [projectStage, setProjectStage] = useState(null);

  // Milestone, Stage, Owner, and Contact edit state
  const [milestone, setMilestone] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [selectedContact, setSelectedContact] = useState({ value: 'sunny-shekhar', label: 'Sunny Shekhar' });
  const [isEditingContact, setIsEditingContact] = useState(false);


  const [invoices, setInvoices] = useState([]);
   // Initialize state to store selected invoice actions
   const [invoiceActions, setInvoiceActions] = useState({});

   // Log the updated invoiceActions when it changes
   useEffect(() => {
     // This effect will run when invoiceActions is updated
     console.log(invoiceActions);
   }, [invoiceActions]);  // The effect runs whenever invoiceActions is updated

   // Handle the change event when an action is selected
   const handleInvoiceActionChange = (e, invoiceId) => {
     const { value } = e.target;

     // Use the previous state to ensure the update is done properly
     setInvoiceActions(prev => {
       const updatedActions = { ...prev, [invoiceId]: value };
       console.log(`Invoice ${invoiceId} action changed to: ${value}`);
       return updatedActions;
     });
   };

  // API data for milestones and stages
  const [milestones, setMilestones] = useState([]);
  const [milestoneStages, setMilestoneStages] = useState([]);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);
  const [isLoadingStages, setIsLoadingStages] = useState(false);
  const [selectedProductId] = useState('935'); // Default to ERC


  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);

  // State for update process
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Audit Logs state
  const [auditLogsData, setAuditLogsData] = useState({
    project_fields: [],
    milestone_stage: [],
    invoices: [],
    business_audit_log: []
  });
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);
  const [auditLogsError, setAuditLogsError] = useState(null);

  // Audit Logs search, pagination, and sorting state
  const [auditLogsSearch, setAuditLogsSearch] = useState({
    project_fields: '',
    milestone_stage: '',
    invoices: '',
    business_audit_log: ''
  });
  const [auditLogsPagination, setAuditLogsPagination] = useState({
    project_fields: { currentPage: 1, itemsPerPage: 10 },
    milestone_stage: { currentPage: 1, itemsPerPage: 10 },
    invoices: { currentPage: 1, itemsPerPage: 10 },
    business_audit_log: { currentPage: 1, itemsPerPage: 10 }
  });
  const [auditLogsSorting, setAuditLogsSorting] = useState({
    project_fields: { column: 'change_date', direction: 'desc' },
    milestone_stage: { column: 'change_date', direction: 'desc' },
    invoices: { column: 'changed_date', direction: 'desc' },
    business_audit_log: { column: 'change_date', direction: 'desc' }
  });
  // Fulfilment tab state
  const [fulfilmentData, setFulfilmentData] = useState({
    // Input section
    income_2019: '',
    income_2020: '',
    income_2021: '',
    // Bank Information
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    routing_number: '',
    // Output section
    stc_amount_2020: '',
    stc_amount_2021: '',
    // Credit Amount & Fee
    maximum_credit: '',
    actual_credit: '',
    estimated_fee: '',
    actual_fee: '',
    years: ''
  });
  const [fulfilmentLoading, setFulfilmentLoading] = useState(false);
  const [fulfilmentError, setFulfilmentError] = useState(null);
  useEffect(() => {
    document.title = `Project #${projectId} - Occams Portal`;
    console.log('ProjectDetail component mounted, fetching project details for ID:', projectId);
    console.log('Project ID type:', typeof projectId);
    fetchProjectDetails();

    console.log('Initial useEffect - Fetching milestones for product ID 936');
    fetchMilestones();
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

  useEffect(() => {
    if (activeTab === 'documents') {
      fetchERCDocuments(projectId, 3);
      fetchCompanyDocuments(projectId, 1);
      fetchOtherDocuments(projectId, 4);
      fetchPayrollDocuments(projectId);

      fetchSTCRequiredDocuments(projectId);
      fetchSTCImpactedDays(projectId);
    }
  }, [activeTab]);

    const DocumentTable = ({ documents }) => {
        const [showModal, setShowModal] = useState(false);
        const [selectedComments, setSelectedComments] = useState([]);
        const [selectedDocLabel, setSelectedDocLabel] = useState('');

        const openModal = (doc) => {
            setSelectedComments(doc.comments || []);
            setSelectedDocLabel(doc.doc_label || 'Comments');
            setShowModal(true);
        };

        const closeModal = () => {
            setShowModal(false);
            setSelectedComments([]);
            setSelectedDocLabel('');
        };

        return (
            <div className="document-list">
                <div className="table-responsive">
                    <table className="table document-table">
                        <thead>
                        <tr>
                            <th style={{width: '480px'}}>Documents</th>
                            <th>Files</th>
                            <th>Status</th>
                            <th>Comments</th>
                        </tr>
                        </thead>
                        <tbody>
                        {documents?.map((doc, index) => (
                            <tr className="document-row" key={index}>
                                <td>
                  <span
                      dangerouslySetInnerHTML={{ __html: doc.doc_label || 'N/A' }}
                  ></span>
                                </td>
                                <td>
                                    {doc.file_url ? (
                                        <a
                                            href={doc.file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <span>{doc.file_name || 'View File'}</span>
                                        </a>
                                    ) : (
                                        <label
                                            className="custom-file-upload"
                                            style={
                                                doc.required === '1'
                                                    ? {
                                                        filter: 'grayscale(100%)',
                                                        pointerEvents: 'none',
                                                    }
                                                    : {}
                                            }
                                        >
                                            No file uploaded
                                        </label>
                                    )}
                                </td>
                                <td>
                                    {doc.doc_key === 'quarterly_gross_receipt_csv' ? (
                                        <label>
                                            <a className='status-badge status-approved'
                                                href={`#`}
                                                target="_self"
                                                rel="noreferrer"
                                            >
                                                SDGR &amp; Owner&apos;s Information
                                            </a>
                                        </label>
                                    ) : (
                                        <span
                                            className={`status-badge status-${doc.status?.toLowerCase() || 'pending'}`}
                                        >
                      {doc.status || 'Yet to upload'}
                    </span>
                                    )}
                                </td>
                                <td>
                                    {doc.comments && doc.comments.length > 0 && (
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => openModal(doc)}
                                        >
                                            <i className="fas fa-comment"></i>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal */}
                <Modal
                    show={showModal}
                    onClose={closeModal}
                    title={selectedDocLabel}
                    showFooter={false} // change to true if you need footer buttons
                >
                    {selectedComments.length > 0 ? (
                        <ul className="list-group" style={{ maxHeight: '575px', overflow: 'auto' }}>
                            {selectedComments.map((comment, index) => (
                                <li key={index} className="list-group-item">
                                    <small>Username - {comment.username}</small>
                                    <br /><br />
                                    <strong>{comment.comments}</strong>
                                    <br />
                                    <small>Date & Time - {comment.update_datetime}</small>
                                </li>
                            ))}
                        </ul>

                    ) : (
                        <p>No comments available.</p>
                    )}
                </Modal>

            </div>
        );
    };

    const STCDocumentTable = ({ stc_documents_groups }) => {
        const [showModal, setShowModal] = useState(false);
        const [selectedComments, setSelectedComments] = useState([]);
        const [selectedDocLabel, setSelectedDocLabel] = useState('');

        const openModal = (doc) => {
            setSelectedComments(doc.comments || []);
            setSelectedDocLabel(doc.doc_label || doc.question || 'Document');
            setShowModal(true);
        };

        const closeModal = () => {
            setShowModal(false);
            setSelectedComments([]);
            setSelectedDocLabel('');
        };

        console.log('STCDocumentTable data:', stc_documents_groups);

        // If no data or empty groups array
        if (!stc_documents_groups || !stc_documents_groups.groups || stc_documents_groups.groups.length === 0) {
            return (
                <div className="stc-document-list">
                    <div className="alert alert-info">
                        <i className="fas fa-info-circle mr-2"></i>
                        No STC required documents are available for this project.
                    </div>
                </div>
            );
        }

        const { groups } = stc_documents_groups;

        return (
            <div className="stc-document-list">
                {groups.map((group, groupIndex) => (
                    <div key={groupIndex} className="document-group">
                        <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">{group.heading}</h6>
                        <div className="table-responsive mb-5">

                            {Array.isArray(group.documents) &&
                            group.documents.some(doc => doc.doc_type_id === "40" || doc.doc_type_id === "41") && (
                                <table className="table document-table">
                                    <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th>Mandatory</th>
                                        <th>Tax Returns - 1040(Mandatory)</th>
                                        <th>Status</th>
                                        <th>Comments</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {group.documents
                                        .filter(doc => doc.doc_type_id === "40" || doc.doc_type_id === "41")
                                        .map((doc, index) => (
                                            <tr className="document-row" key={index}>
                                                <td dangerouslySetInnerHTML={{ __html: doc.doc_label || 'N/A' }}></td>
                                                <td>{doc.mandatory}</td>
                                                <td>
                                                    {doc.file_url ? (
                                                        <a
                                                            href={doc.file_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            <span>{doc.file_name || 'View File'}</span>
                                                        </a>
                                                    ) : (
                                                        <label
                                                            className="custom-file-upload"
                                                            style={
                                                                doc.required === '1'
                                                                    ? {
                                                                        filter: 'grayscale(100%)',
                                                                        pointerEvents: 'none',
                                                                    }
                                                                    : {}
                                                            }
                                                        >
                                                            No file uploaded
                                                        </label>
                                                    )}
                                                </td>
                                                <td>
                            <span className={`status-badge status-${doc.status?.toLowerCase() || 'pending'}`}>
                              {doc.status || doc.file_status || 'Yet to upload'}
                            </span>
                                                </td>
                                                <td>
                                                    {doc.comments && doc.comments.length > 0 && (
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => openModal(doc)}
                                                        >
                                                            <i className="fas fa-comment"></i>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {Array.isArray(group.documents) &&
                            group.documents.some(doc => doc.doc_type_id === "43") && (
                                <table className="table document-table">
                                    <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th>Were you a W2 employee in 2020/2021?</th>
                                        <th>W2 (If Applicable)</th>
                                        <th>Status</th>
                                        <th>Comments</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {group.documents
                                        .filter(doc => doc.doc_type_id === "43")
                                        .map((doc, index) => (
                                            <tr className="document-row" key={index}>
                                                <td
                                                    dangerouslySetInnerHTML={{
                                                        __html: doc.doc_label || 'N/A',
                                                    }}
                                                ></td>

                                                <td>
                                                    <div className="d-flex">
                                                        <label style={{ marginRight: '10px' }}>
                                                            <input
                                                                type="radio"
                                                                name={`w2_applicable_${index}`}
                                                                value="Yes"
                                                                checked={doc.applicable === 'Yes'}
                                                                readOnly
                                                            />{' '}
                                                            Yes
                                                        </label>
                                                        <label>
                                                            <input
                                                                type="radio"
                                                                name={`w2_applicable_${index}`}
                                                                value="No"
                                                                checked={doc.applicable === 'No'}
                                                                readOnly
                                                            />{' '}
                                                            No
                                                        </label>
                                                    </div>
                                                </td>

                                                <td>
                                                    {doc.file_url ? (
                                                        <a href={doc.file_url} target="_blank" rel="noreferrer">
                                                            <span>{doc.file_name || 'View File'}</span>
                                                        </a>
                                                    ) : (
                                                        <label
                                                            className="custom-file-upload"
                                                            style={
                                                                doc.required === '1'
                                                                    ? {
                                                                        filter: 'grayscale(100%)',
                                                                        pointerEvents: 'none',
                                                                    }
                                                                    : {}
                                                            }
                                                        >
                                                            No file uploaded
                                                        </label>
                                                    )}
                                                </td>

                                                <td>
                              <span
                                  className={`status-badge status-${doc.file_status?.toLowerCase() || 'pending'}`}
                              >
                                {doc.status || doc.file_status || 'Yet to upload'}
                              </span>
                                                </td>

                                                <td>
                                                    {doc.comments && doc.comments.length > 0 && (
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => openModal(doc)}
                                                        >
                                                            <i className="fas fa-comment"></i>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {Array.isArray(group.documents) &&
                            group.documents.some(doc => doc.doc_type_id === "49") && (
                                <table className="table document-table">
                                    <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th>Do you have 1099 - G for 2020/2021?</th>
                                        <th>Form - 1099 G (If Applicable)</th>
                                        <th>Status</th>
                                        <th>Comments</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {group.documents
                                        .filter(doc => doc.doc_type_id === "49")
                                        .map((doc, index) => (
                                            <tr className="document-row" key={index}>
                                                <td
                                                    dangerouslySetInnerHTML={{
                                                        __html: doc.doc_label || 'N/A',
                                                    }}
                                                ></td>

                                                <td>
                                                    <div className="d-flex">
                                                        <label style={{ marginRight: '10px' }}>
                                                            <input
                                                                type="radio"
                                                                name={`form_1099_applicable_${index}`}
                                                                value="Yes"
                                                                checked={doc.applicable === 'Yes'}
                                                                readOnly
                                                            />{' '}
                                                            Yes
                                                        </label>
                                                        <label>
                                                            <input
                                                                type="radio"
                                                                name={`form_1099_applicable_${index}`}
                                                                value="No"
                                                                checked={doc.applicable === 'No'}
                                                                readOnly
                                                            />{' '}
                                                            No
                                                        </label>
                                                    </div>
                                                </td>

                                                <td>
                                                    {doc.file_url ? (
                                                        <a href={doc.file_url} target="_blank" rel="noreferrer">
                                                            <span>{doc.file_name || 'View File'}</span>
                                                        </a>
                                                    ) : (
                                                        <label
                                                            className="custom-file-upload"
                                                            style={
                                                                doc.required === '1'
                                                                    ? {
                                                                        filter: 'grayscale(100%)',
                                                                        pointerEvents: 'none',
                                                                    }
                                                                    : {}
                                                            }
                                                        >
                                                            No file uploaded
                                                        </label>
                                                    )}
                                                </td>

                                                <td>
                              <span
                                  className={`status-badge status-${doc.status?.toLowerCase() || 'pending'}`}
                              >
                                {doc.status || doc.file_status || 'Yet to upload'}
                              </span>
                                                </td>

                                                <td>
                                                    {doc.comments && doc.comments.length > 0 && (
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => openModal(doc)}
                                                        >
                                                            <i className="fas fa-comment"></i>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {Array.isArray(group.documents) &&
                            group.documents.some(doc => doc.doc_type_id === 139) && (
                                <table className="table document-table border">
                                    <tbody>
                                    {group.documents
                                        .filter(doc => doc.doc_type_id === 139)
                                        .map((doc, index) => (
                                            <React.Fragment key={index}>
                                                <tr className="document-row">
                                                    <td
                                                        dangerouslySetInnerHTML={{
                                                            __html: doc.question || 'N/A',
                                                        }}
                                                    ></td>

                                                    <td>
                                                        <div className="d-flex">
                                                            <label style={{ marginRight: '10px' }}>
                                                                <input
                                                                    type="radio"
                                                                    name={`claimed_${index}`}
                                                                    value="Yes"
                                                                    checked={doc.claimed === 'Yes'}
                                                                    readOnly
                                                                />{' '}
                                                                Yes
                                                            </label>
                                                            <label>
                                                                <input
                                                                    type="radio"
                                                                    name={`claimed_${index}`}
                                                                    value="No"
                                                                    checked={doc.claimed === 'No'}
                                                                    readOnly
                                                                />{' '}
                                                                No
                                                            </label>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Conditionally show amounts if claimed is 'Yes' */}
                                                {doc.claimed === 'Yes' && (
                                                    <tr className="document-row">
                                                        <td colSpan="2">
                                                            <div className="d-flex justify-content-around">
                                                                <div className="tax_credit d-flex align-items-center">
                                                                    <label style={{ paddingRight: '15px' }}>
                                                                        2020 Amount
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={doc.amount_2020 || ''}
                                                                        readOnly
                                                                    />
                                                                </div>
                                                                <div className="tax_credit d-flex align-items-center">
                                                                    <label style={{ paddingRight: '15px' }}>
                                                                        2021 Amount
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={doc.amount_2021 || ''}
                                                                        readOnly
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            )}


                            {Array.isArray(group.documents) &&
                            group.documents.some(doc => doc.doc_type_id === 138) && (
                                <table className="table document-table border">
                                    <thead>
                                    <tr>
                                        <th>Document</th>
                                        <th>Have you signed up?</th>
                                        <th>Signed up as per TaxNow file?</th>
                                        <th>Status</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {group.documents
                                        .filter(doc => doc.doc_type_id === 138)
                                        .map((doc, index) => (
                                            <tr className="document-row" key={index}>
                                                <td
                                                    dangerouslySetInnerHTML={{
                                                        __html: doc.doc_label
                                                            ? `<a href="https://apps.taxnow.com/signup?utm_source=occams&utm_medium=email&utm_campaign=sign-up" target="_blank" rel="noopener noreferrer">${doc.doc_label}</a>`
                                                            : 'N/A',
                                                    }}
                                                ></td>

                                                <td>{doc.signed_up}</td>
                                                <td>
                                                    <div className="d-flex">
                                                        <label style={{ marginRight: '10px' }}>
                                                            <input
                                                                type="radio"
                                                                name={`signed_up_taxnow_file_${index}`}
                                                                value="Yes"
                                                                checked={doc.signed_up_taxnow_file === '1'}
                                                                readOnly
                                                            />{' '}
                                                            Yes
                                                        </label>
                                                        <label>
                                                            <input
                                                                type="radio"
                                                                name={`signed_up_taxnow_file_${index}`}
                                                                value="No"
                                                                checked={doc.signed_up_taxnow_file === '0'}
                                                                readOnly
                                                            />{' '}
                                                            No
                                                        </label>
                                                    </div>
                                                </td>
                                                <td>
                              <span
                                  className={`status-badge status-${doc.status?.toLowerCase() || 'pending'}`}
                              >
                                {doc.status || doc.file_status || 'Yet to upload'}
                              </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}


                        </div>
                    </div>
                ))}

                {/* Modal */}
                <Modal show={showModal} onClose={closeModal} title={selectedDocLabel} showFooter={false}>
                    {selectedComments.length > 0 ? (
                        <ul className="list-group" style={{ maxHeight: '575px', overflow: 'auto' }}>
                            {selectedComments.map((comment, index) => (
                                <li key={index} className="list-group-item">
                                    <small>Username - {comment.username}</small>
                                    <br /><br />
                                    <strong>{comment.comments}</strong>
                                    <br />
                                    <small>Date & Time - {comment.update_datetime}</small>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No comments available.</p>
                    )}
                </Modal>
            </div>
        );
    };

    const STCImpactedDaysTable = ({ impacted_days_groups }) => {
        const groups = impacted_days_groups || [];
        const [showModal, setShowModal] = useState(false);
        const [selectedComments, setSelectedComments] = useState([]);
        const [selectedDocLabel, setSelectedDocLabel] = useState('');
        const [undertakingChecked, setUndertakingChecked] = useState(
            groups[0]?.undertaking_checked || false
        );

        const openModal = (doc) => {
            setSelectedComments(doc.comments || []);
            setSelectedDocLabel(doc.doc_label || doc.question || 'Document');
            setShowModal(true);
        };

        const closeModal = () => {
            setShowModal(false);
            setSelectedComments([]);
            setSelectedDocLabel('');
        };

        const handleCheckboxChange = (e) => {
            setUndertakingChecked(e.target.checked);
        };

        return (
            <div className="impacted-days-list">
                {groups.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-5">
                        <h5 className="mb-3">{group.group_heading}</h5>

                        <div className="table-responsive">
                            <table className="table impacted-days-table">
                                <thead>
                                <tr>
                                    <th>Documents</th>
                                    <th>Period (No. of Days)</th>
                                    <th>Supporting Documents (Optional)</th>
                                    <th>Status</th>
                                    <th>Comments</th>
                                </tr>
                                </thead>
                                <tbody>
                                {group.documents?.map((doc, docIndex) => (
                                    <React.Fragment key={`${groupIndex}-${docIndex}`}>
                                        <tr className="document-row">
                                            <td>
                                                <span dangerouslySetInnerHTML={{ __html: doc.doc_label || doc.question || 'N/A' }} />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={doc.no_of_days || ''}
                                                    readOnly
                                                    className="form-control"
                                                />
                                            </td>
                                            <td>
                                                {doc.file_url ? (
                                                    <a href={doc.file_url} target="_blank" rel="noreferrer">
                                                        <span>{doc.file_name || 'View File'}</span>
                                                    </a>
                                                ) : (
                                                    <label
                                                        className="custom-file-upload"
                                                        style={doc.required === '1' ? { filter: 'grayscale(100%)', pointerEvents: 'none' } : {}}
                                                    >
                                                        No file uploaded
                                                    </label>
                                                )}
                                            </td>
                                            <td>
                          <span className={`status-badge status-${(doc.status || doc.file_status || 'pending').toLowerCase()}`}>
                            {doc.status || doc.file_status || 'Yet to upload'}
                          </span>
                                            </td>
                                            <td>
                                                {doc.comments && doc.comments.length > 0 && (
                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => openModal(doc)}>
                                                        <i className="fas fa-comment"></i>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>

                                        {/* Dates row - only for first group */}
                                        {groupIndex === 0 && doc.dates && Array.isArray(doc.dates) && doc.dates.length > 0 && (
                                            <tr className="dates-row">
                                                <td colSpan={5} style={{ paddingLeft: '20px' }}>
                                                    <div className="d-flex flex-column gap-2">
                                                        <label className="form-label"><strong>Impacted Date Ranges:</strong></label>
                                                        {doc.dates.map((range, idx) => (
                                                            <input
                                                                key={idx}
                                                                type="text"
                                                                readOnly
                                                                className="form-control mb-2"
                                                                value={range || ''}
                                                            />
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}


                                        {/* New row with checkbox only for first group */}
                                        {groupIndex === 0 && (
                                            <tr className="undertaking-row">
                                                <td colSpan={5} style={{ paddingLeft: '20px' }}>
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            checked={doc.undertaking_checked || false}
                                                            readOnly
                                                            style={{ marginRight: '8px' }}
                                                        />
                                                        I did not claim unemployment benefits on these dates
                                                    </label>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Existing checkbox below second group or wherever you want it */}
                        {groupIndex === 1 && (
                            <div className="form-check mt-3">
                                <input
                                    className="form-check-input" style={{marginTop :'0px'}}
                                    type="checkbox"
                                    id="undertakingCheck"
                                    checked={undertakingChecked}
                                    onChange={handleCheckboxChange}
                                />
                                <label className="form-check-label" htmlFor="undertakingCheck" style={{marginBottom :'0px'}}>
                                    I did not claim unemployment benefits on these dates
                                </label>
                            </div>
                        )}
                    </div>
                ))}


                {/* Comments Modal */}
                <Modal show={showModal} onClose={closeModal} title={selectedDocLabel} showFooter={false}>
                    {selectedComments.length > 0 ? (
                        <ul className="list-group" style={{ maxHeight: '575px', overflow: 'auto' }}>
                            {selectedComments.map((comment, index) => (
                                <li key={index} className="list-group-item">
                                    <small>Username - {comment.username}</small>
                                    <br /><br />
                                    <strong>{comment.comments}</strong>
                                    <br />
                                    <small>Date & Time - {comment.update_datetime}</small>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No comments available.</p>
                    )}
                </Modal>
            </div>
        );
    };

  // Fetch collaborators when component loads
  useEffect(() => {
    if (projectId) {
      fetchCollaborators();
    }
  }, [projectId]);

  // Fetch owners when component loads
  useEffect(() => {
    if (projectId) {
      fetchOwners();
    }
  }, [projectId]);

  // Fetch contacts when component loads
  useEffect(() => {
    if (projectId && project?.lead_id) {
      fetchContacts();
    }
  }, [projectId, project?.lead_id]);

  // Fetch project milestone and stage when component loads
  useEffect(() => {
    if (projectId) {
      // Then fetch all available milestones for the dropdown
      // We'll do this with a slight delay to ensure the specific milestone is set first
      setTimeout(() => {
        fetchAllMilestones();
      }, 400);

      // First fetch the specific milestone and stage for this project
      setTimeout(() => {
        fetchProjectMilestoneAndStage();
      }, 3000);
    }
  }, [projectId]);

  // Fetch invoice data
  useEffect(() => {
    fetchInvoiceData();
  }, []);

    // Modify the fetchInvoiceData function
    const fetchInvoiceData = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await axios.post(
          "https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-project-invoices",
          { project_id: projectId }
        );

        if (response.data.status == 200) {
          setInvoices(response.data.data || []);
        } else {
          setError(response.data.message || 'Failed to fetch invoices');
        }
      } catch (err) {
        // setError('Error fetching invoice data: ' + (err.message || 'Unknown error'));
        console.error('Error fetching invoice data:', err);
      } finally {
        setLoading(false);
      }
    };


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

  // Function to fetch collaborators
  const fetchCollaborators = async () => {
    try {
      console.log('Fetching collaborators for project ID:', projectId);
      setCollaboratorLoading(true);

      const response = await axios.get(`https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-collaborators?project_id=${projectId}`);

      console.log('Collaborators API response:', response);

      if (response.data && response.data.status === 1) {
        // Set available collaborators
        const collaboratorsData = response.data.data || [];
        setCollaborators(collaboratorsData);

        // Set current collaborators
        const currentCollaboratorsData = response.data.current_collaborators || [];
        setCurrentCollaborators(currentCollaboratorsData);

        // Format options for react-select
        const options = collaboratorsData.map(collaborator => ({
          value: collaborator.user_id,
          label: (
            <div className="d-flex align-items-center">
              <span>{collaborator.display_name}</span>
            </div>
          ),
          collaborator: {
            id: collaborator.user_id,
            name: collaborator.display_name
          }
        }));

        setCollaboratorOptions(options);
      } else {
        console.warn('No collaborators found or invalid response format');
        setCollaborators([]);
        setCurrentCollaborators([]);
        setCollaboratorOptions([]);
      }
    } catch (err) {
      console.error('Error fetching collaborators:', err);
      setCollaborators([]);
      setCurrentCollaborators([]);
      setCollaboratorOptions([]);
    } finally {
      setCollaboratorLoading(false);
    }
  };

  // Function to fetch owners
  const fetchOwners = async () => {
    try {
      console.log('Fetching owners for project ID:', projectId);
      setOwnerLoading(true);

      const response = await axios.get(`https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-owners?project_id=${projectId}`);

      console.log('Owners API response:', response);

      if (response.data && response.data.status === 1) {
        // Set available owners
        const ownersData = response.data.data || [];
        setOwners(ownersData);

        // Set current owner if available
        if (response.data.current_owner_name) {
          const currentOwner = {
            value: response.data.current_owner_id,
            label: response.data.current_owner_name
          };
          setOwner(currentOwner);
        }

        // Format options for react-select
        const options = ownersData.map(owner => ({
          value: owner.user_id,
          label: owner.display_name
        }));

        setOwnerOptions(options);
      } else {
        console.warn('No owners found or invalid response format');
        setOwners([]);

        // Set default options if API fails
        const defaultOptions = [
          { value: 'erc-fprs', label: 'ERC - FPRS' },
          { value: 'erc-referrals', label: 'ERC - Referrals' },
          { value: 'erc-direct', label: 'ERC - Direct' },
          { value: 'erc-partners', label: 'ERC - Partners' }
        ];
        setOwnerOptions(defaultOptions);
      }
    } catch (err) {
      console.error('Error fetching owners:', err);
      setOwners([]);

      // Set default options if API fails
      const defaultOptions = [
        { value: 'erc-fprs', label: 'ERC - FPRS' },
        { value: 'erc-referrals', label: 'ERC - Referrals' },
        { value: 'erc-direct', label: 'ERC - Direct' },
        { value: 'erc-partners', label: 'ERC - Partners' }
      ];
      setOwnerOptions(defaultOptions);
    } finally {
      setOwnerLoading(false);
    }
  };

  // Function to fetch contacts
  const fetchContacts = async () => {
    try {
      console.log('Fetching contacts for project ID:', projectId, 'and lead ID:', project?.lead_id);
      setContactLoading(true);

      const response = await axios.get(`https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-contacts?project_id=${projectId}&lead_id=${project?.lead_id}`);

      console.log('Contacts API response:', response);

      if (response.data && response.data.status === 1) {
        // Set available contacts
        const contactsData = response.data.data || [];
        setContacts(contactsData);

        // Set current contact if available
        if (response.data.current_contact && response.data.current_contact_id) {
          const currentContact = {
            value: response.data.current_contact_id,
            label: response.data.current_contact
          };
          setSelectedContact(currentContact);
        }

        // Format options for react-select
        const options = contactsData.map(contact => ({
          value: contact.id,
          label: `${contact.first_name} ${contact.last_name}`.trim()
        }));

        setContactOptions(options);
      } else {
        console.warn('No contacts found or invalid response format');
        setContacts([]);

        // Set default options if API fails
        const defaultOptions = [
          { value: 'sunny-shekhar', label: 'Sunny Shekhar' },
          { value: 'rahul-sharma', label: 'Rahul Sharma' },
          { value: 'priya-patel', label: 'Priya Patel' },
          { value: 'amit-kumar', label: 'Amit Kumar' }
        ];
        setContactOptions(defaultOptions);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setContacts([]);

      // Set default options if API fails
      const defaultOptions = [
        { value: 'sunny-shekhar', label: 'Sunny Shekhar' },
        { value: 'rahul-sharma', label: 'Rahul Sharma' },
        { value: 'priya-patel', label: 'Priya Patel' },
        { value: 'amit-kumar', label: 'Amit Kumar' }
      ];
      setContactOptions(defaultOptions);
    } finally {
      setContactLoading(false);
    }
  };

  // Function to fetch project milestone and stage
  const fetchProjectMilestoneAndStage = async () => {
    try {
      console.log('Fetching milestone and stage for project ID:', projectId);
      setIsLoadingMilestones(true);

      const response = await axios.get(`https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-milestones?project_id=${projectId}`);

      console.log('Milestone API response:', response);

      if (response.data && response.data.status === 1) {
        console.log('Milestone data received:', response.data);

        // Set milestone
        if (response.data.milestone_id && response.data.milestone_name) {
          const milestoneData = {
            value: response.data.milestone_id,
            label: response.data.milestone_name
          };
          setMilestone(milestoneData);
          console.log('Setting milestone:', milestoneData);
        }

        // Set stage
        if (response.data.milestone_stage_id && response.data.milestone_stage_name) {
          const stageData = {
            value: response.data.milestone_stage_id,
            label: response.data.milestone_stage_name
          };
          setProjectStage(stageData);
          console.log('Setting stage:', stageData);

          // Also update the milestoneStages array with this stage
          setMilestoneStages([stageData]);
        }
      } else {
        console.warn('No milestone/stage found or invalid response format');

        // Set default milestone and stage if API fails
        const defaultMilestone = { value: '100', label: 'ERC Fulfillment' };
        const defaultStage = { value: '200', label: 'ERC Fees Written Off' };

        setMilestone(defaultMilestone);
        setProjectStage(defaultStage);
        setMilestoneStages([defaultStage]);
      }
    } catch (err) {
      console.error('Error fetching milestone and stage:', err);

      // Set default milestone and stage if API fails
      const defaultMilestone = { value: '100', label: 'ERC Fulfillment' };
      const defaultStage = { value: '200', label: 'ERC Fees Written Off' };

      setMilestone(defaultMilestone);
      setProjectStage(defaultStage);
      setMilestoneStages([defaultStage]);
    } finally {
      setIsLoadingMilestones(false);
    }
  };

  // Function to fetch all available milestones for the dropdown
  const fetchAllMilestones = async () => {
    try {
      console.log('Fetching all available milestones');

      // Build the API URL with the product_id parameter
      const apiUrl = `https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/milestones?type=project&product_id=${selectedProductId}`;
      console.log('All milestones API URL:', apiUrl);

      // Make the API call
      const response = await axios.get(apiUrl);
      console.log('All milestones API response:', response.data);

      // Process the response data based on the actual structure
      if (response.data) {
        let formattedMilestones = [];

        // Check if the response is an array directly
        if (Array.isArray(response.data)) {
          formattedMilestones = response.data.map(milestone => ({
            value: milestone.milestone_id,
            label: milestone.milestone_name
          }));
        }
        // Check if the response has the expected nested structure
        else if (response.data.success && response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
          formattedMilestones = response.data.data.data.map(milestone => ({
            value: milestone.milestone_id,
            label: milestone.milestone_name
          }));
        }
        // If we have a valid list of milestones
        if (formattedMilestones.length > 0) {
          console.log('Setting all available milestones:', formattedMilestones);

          // Preserve the currently selected milestone
          const currentMilestone = milestone;

          // Update the milestones array with all available options
          setMilestones(formattedMilestones);

          // Make sure the current milestone is still selected
          if (currentMilestone) {
            setMilestone(currentMilestone);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching all milestones:', err);
      // Don't set default milestones here, as we already have the current milestone
    }
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
              response = await fetch('https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-project-info', {
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
              authorized_signatory_name: projectData.authorized_signatory_name || "",
              business_phone: projectData.business_phone || "",
              business_email: projectData.business_email || "",
              business_title: projectData.business_title || "",
              zip: projectData.zip || "",
              street_address: projectData.street_address || "",
              city: projectData.city || "",
              state: projectData.state || "",
              identity_document_type: projectData.identity_document_type || "",
              identity_document_number: projectData.document_number || projectData.identity_document_number || projectData.document_id || projectData.id_number || "",

              // Business Info
              business_legal_name: projectData.business_legal_name || "",
              doing_business_as: projectData.doing_business_as || "",
              business_category: projectData.business_category || "",
              website_url: projectData.website_url || projectData.business_website || projectData.company_website || "",

              // Business Legal Info
              business_entity_type: projectData.business_entity_type || projectData.business_type || "",
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
      const response = await fetch('https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-bank-info', {
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
            aba_routing_no: bankData.aba_routing_no || '',
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
        aba_routing_no: '',
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
      const response = await fetch('https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-project-intake', {
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
      console.log('API Endpoint: https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-project-fees');

      const requestBody = { project_id: project.project_id };
      console.log('Request Body:', JSON.stringify(requestBody));

      const response = await fetch('https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-project-fees', {
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
            iv_invoice_aff_ref_share: feesData.iv_invoice_aff_ref_share || ''
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
        q4_2021_letter: '',
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
        iv_invoice_aff_ref_share: ''
      });
    } finally {
      setFeesInfoLoading(false);
      console.log('=== FEES API CALL END ===');
    }
  };

  // Function to fetch project audit logs
  const fetchProjectAuditLogs = async () => {
    try {
      setAuditLogsLoading(true);
      setAuditLogsError(null);
      console.log('=== PROJECT AUDIT LOGS API CALL START ===');
      console.log('Project ID:', projectId);
      console.log('Lead ID:', project?.lead_id);
      console.log('Product ID:', project?.product_id);

      // Validate required parameters
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      if (!project?.lead_id) {
        throw new Error('Lead ID is required but not available');
      }
      if (!project?.product_id) {
        throw new Error('Product ID is required but not available');
      }

      // Build API URL with query parameters
      const apiUrl = new URL('https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-audit-logs');
      apiUrl.searchParams.append('project_id', projectId);
      apiUrl.searchParams.append('lead_id', project.lead_id);
      apiUrl.searchParams.append('product_id', project.product_id);

      console.log('API URL:', apiUrl.toString());

      // Make API call to fetch audit logs
      const response = await axios.get(apiUrl.toString());

      console.log('Project Audit Logs API Response:', response.data);

      if (response.data && response.data.status) {
        // Set the audit logs data
        setAuditLogsData({
          project_fields: response.data.project_fields || [],
          milestone_stage: response.data.milestone_stage || [],
          invoices: response.data.invoices || [],
          business_audit_log: response.data.business_audit_log || []
        });
        console.log('Audit logs data set successfully');
      } else {
        console.warn('Unexpected audit logs API response structure:', response.data);
        setAuditLogsError('Unexpected response format from audit logs API');
      }
    } catch (error) {
      console.error('Error fetching project audit logs:', error);
      setAuditLogsError('Failed to fetch audit logs: ' + (error.response?.data?.message || error.message));
    } finally {
      setAuditLogsLoading(false);
      console.log('=== PROJECT AUDIT LOGS API CALL END ===');
    }
  };
  // Function to fetch fulfilment information from the API
  const fetchFulfilmentInfo = async () => {
    if (!project?.project_id) {
      console.log('No project ID available for fulfilment API call');
      return;
    }

    setFulfilmentLoading(true);
    setFulfilmentError(null);

    try {
      console.log('=== FULFILMENT API CALL START ===');
      console.log('Project ID:', project.project_id);
      console.log('API Endpoint: https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-project-fulfilment');

      const requestBody = { project_id: project.project_id };
      console.log('Request Body:', JSON.stringify(requestBody));

      const response = await fetch('https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-project-fulfilment', {
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
      console.log('Raw API Response:', data);
      console.log('Response Type:', typeof data);
      console.log('Response Keys:', Object.keys(data));

      // Check if the API response has the expected structure
      if (data && data.result) {
        const apiData = data.result && Array.isArray(data.result) ? data.result[0] : data.result;
        console.log('Fulfilment Data from API:', apiData);

        if (apiData) {
          // Update fulfilment info state with the data from API - following fees API pattern
          setFulfilmentData({
            income_2019: apiData.income_2019 || '',
            income_2020: apiData.income_2020 || '',
            income_2021: apiData.income_2021 || '',
            bank_name: apiData.bank_name || '',
            account_holder_name: apiData.account_holder_name || '',
            account_number: apiData.account_number || '',
            routing_number: apiData.aba_routing_no || '',
            stc_amount_2020: apiData.stc_amount_2020 || '',
            stc_amount_2021: apiData.stc_amount_2021 || '',
            maximum_credit: apiData.maximum_credit || '',
            actual_credit: apiData.actual_credit || '',
            estimated_fee: apiData.estimated_fee || '',
            actual_fee: apiData.actual_fee || '',
            years: apiData.years || ''
          });

          console.log('✅ Fulfilment data successfully loaded from API');
          setFulfilmentError(null); // Clear any previous errors
        } else {
          throw new Error('No fulfilment data found in the API response');
        }
      } else {
        throw new Error(`API returned error status: ${data.status}, message: ${data.message || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('❌ Error fetching fulfilment information:', error);
      setFulfilmentError(`Failed to fetch fulfilment information: ${error.message}`);

      // Clear the form on error
      setFulfilmentData({
        income_2019: '',
        income_2020: '',
        income_2021: '',
        bank_name: '',
        account_holder_name: '',
        account_number: '',
        routing_number: '',
        stc_amount_2020: '',
        stc_amount_2021: '',
        maximum_credit: '',
        actual_credit: '',
        estimated_fee: '',
        actual_fee: '',
        years: ''
      });
    } finally {
      setFulfilmentLoading(false);
      console.log('=== FULFILMENT API CALL END ===');
    }
  };
  // Helper function to format date for audit logs
  const formatAuditDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';

      // Format as mm/dd/yyyy H:i:s (24-hour format)
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    } catch (err) {
      console.error('Error formatting audit date:', err);
      return 'N/A';
    }
  };

  // Helper functions for audit logs search, pagination, and sorting
  const handleAuditLogsSearch = (tableType, searchValue) => {
    setAuditLogsSearch(prev => ({
      ...prev,
      [tableType]: searchValue
    }));
    // Reset to first page when searching
    setAuditLogsPagination(prev => ({
      ...prev,
      [tableType]: { ...prev[tableType], currentPage: 1 }
    }));
  };

  const handleAuditLogsPagination = (tableType, page) => {
    setAuditLogsPagination(prev => ({
      ...prev,
      [tableType]: { ...prev[tableType], currentPage: page }
    }));
  };

  const handleAuditLogsSorting = (tableType, column) => {
    setAuditLogsSorting(prev => {
      const currentSort = prev[tableType];
      const newDirection = currentSort.column === column && currentSort.direction === 'asc' ? 'desc' : 'asc';
      return {
        ...prev,
        [tableType]: { column, direction: newDirection }
      };
    });
  };

  const filterAndSortAuditData = (data, tableType) => {
    if (!data || !Array.isArray(data)) return [];

    const searchTerm = auditLogsSearch[tableType].toLowerCase();
    const sorting = auditLogsSorting[tableType];

    // Filter data based on search term
    let filteredData = data.filter(item => {
      const searchableFields = Object.values(item).join(' ').toLowerCase();
      return searchableFields.includes(searchTerm);
    });

    // Sort data
    filteredData.sort((a, b) => {
      let aValue = a[sorting.column] || '';
      let bValue = b[sorting.column] || '';

      // Handle date sorting
      if (sorting.column.includes('date')) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }

      if (sorting.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredData;
  };

  const getPaginatedData = (data, tableType) => {
    const pagination = auditLogsPagination[tableType];
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data, tableType) => {
    const pagination = auditLogsPagination[tableType];
    return Math.ceil(data.length / pagination.itemsPerPage);
  };

  const renderPaginationControls = (data, tableType) => {
    const totalPages = getTotalPages(data, tableType);
    const currentPage = auditLogsPagination[tableType].currentPage;

    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return (
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-muted">
          Showing {((currentPage - 1) * auditLogsPagination[tableType].itemsPerPage) + 1} to{' '}
          {Math.min(currentPage * auditLogsPagination[tableType].itemsPerPage, data.length)} of {data.length} entries
        </div>
        <nav>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handleAuditLogsPagination(tableType, currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>
            {pages.map(page => (
              <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handleAuditLogsPagination(tableType, page)}
                >
                  {page}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handleAuditLogsPagination(tableType, currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  };

  const renderSortIcon = (tableType, column) => {
    const sorting = auditLogsSorting[tableType];
    if (sorting.column !== column) {
      return <i className="fas fa-sort text-muted ms-1"></i>;
    }
    return sorting.direction === 'asc'
      ? <i className="fas fa-sort-up text-primary ms-1"></i>
      : <i className="fas fa-sort-down text-primary ms-1"></i>;
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
    // If fulfilment tab is selected, fetch fulfilment information
    if (tab === 'fulfilment') {
      fetchFulfilmentInfo();
    }
    // If audit logs tab is selected, fetch audit logs
    if (tab === 'auditLogs') {
      // Only fetch if project data is available
      if (project && project.lead_id && project.product_id) {
        fetchProjectAuditLogs();
      } else {
        console.warn('Cannot fetch audit logs: project data not fully loaded');
        setAuditLogsError('Project data not fully loaded. Please wait and try again.');
      }
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

  // Function to handle collaborator selection
  const handleCollaboratorChange = (selectedOption) => {
    setSelectedCollaborator(selectedOption);
  };

  // Function to assign a collaborator
  const handleAssignCollaborator = async () => {
    if (selectedCollaborator) {
      try {
        setCollaboratorLoading(true);

        // Check if collaborator is already assigned
        const isAlreadyAssigned = currentCollaborators.some(
          collaborator => collaborator.collaborators_name_id === selectedCollaborator.collaborator.id
        );

        if (!isAlreadyAssigned) {
          console.log('Assigning collaborator:', selectedCollaborator.collaborator);

          // Call the API to assign the collaborator
          const response = await axios.post(
            'https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-collaborators',
            {
              project_id: projectId,
              user_id: selectedCollaborator.collaborator.id,
              operation: 'assign_collabs_user'
            }
          );

          console.log('API response:', response);

          if (response.data && response.data.status === 1) {
            // Add the collaborator to the current collaborators list
            const newCollaborator = {
              collaborators_name_id: selectedCollaborator.collaborator.id,
              collaborators_name: selectedCollaborator.collaborator.name
            };

            const newCollaborators = [...currentCollaborators, newCollaborator];
            setCurrentCollaborators(newCollaborators);

            console.log('Collaborator assigned successfully:', selectedCollaborator.collaborator);
            console.log('Updated collaborators:', newCollaborators);

            // Show success message
            Swal.fire({
              title: 'Success!',
              text: 'Collaborator assigned successfully',
              icon: 'success',
              confirmButtonColor: '#4CAF50'
            });
          } else {
            console.error('Failed to assign collaborator:', response.data?.message || 'Unknown error');

            // Show error message
            Swal.fire({
              title: 'Error!',
              text: response.data?.message || 'Failed to assign collaborator',
              icon: 'error',
              confirmButtonColor: '#d33'
            });
          }
        } else {
          console.log('Collaborator already assigned:', selectedCollaborator.collaborator);

          // Show warning message
          Swal.fire({
            title: 'Warning',
            text: 'This collaborator is already assigned to the project',
            icon: 'warning',
            confirmButtonColor: '#f8bb86'
          });
        }

        // Reset the selected collaborator
        setSelectedCollaborator(null);
      } catch (error) {
        console.error('Error assigning collaborator:', error);

        // Show error message
        Swal.fire({
          title: 'Error!',
          text: 'Error assigning collaborator: ' + (error.response?.data?.message || error.message),
          icon: 'error',
          confirmButtonColor: '#d33'
        });

        // Reset the selected collaborator
        setSelectedCollaborator(null);
      } finally {
        setCollaboratorLoading(false);

        // Refresh the collaborators list
        fetchCollaborators();
      }
    }
  };

  // Function to remove an assigned collaborator
  const handleRemoveCollaborator = async (collaboratorId) => {
    try {
      setCollaboratorLoading(true);
      console.log('Removing collaborator with ID:', collaboratorId);

      // Call the API to unassign the collaborator
      const response = await axios.post(
        'https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-collaborators',
        {
          project_id: projectId,
          user_id: collaboratorId,
          operation: 'unassign_collabs_user'
        }
      );

      console.log('API response:', response);

      if (response.data && response.data.status === 1) {
        // Remove the collaborator from the current collaborators list
        const updatedCollaborators = currentCollaborators.filter(
          collaborator => collaborator.collaborators_name_id !== collaboratorId
        );

        setCurrentCollaborators(updatedCollaborators);

        console.log('Collaborator removed successfully. Updated collaborators:', updatedCollaborators);

        // Show success message
        Swal.fire({
          title: 'Success!',
          text: 'Collaborator removed successfully',
          icon: 'success',
          confirmButtonColor: '#4CAF50'
        });
      } else {
        console.error('Failed to remove collaborator:', response.data?.message || 'Unknown error');

        // Show error message
        Swal.fire({
          title: 'Error!',
          text: response.data?.message || 'Failed to remove collaborator',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error('Error removing collaborator:', error);

      // Show error message
      Swal.fire({
        title: 'Error!',
        text: 'Error removing collaborator: ' + (error.response?.data?.message || error.message),
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    } finally {
      setCollaboratorLoading(false);

      // Refresh the collaborators list
      fetchCollaborators();
    }
  };

  // Functions for project group, campaign, and source
  const handleProjectGroupChange = (selectedOption) => {
    // This function is kept for compatibility with other parts of the code
    console.log("Project group changed:", selectedOption);
  };

  // Function to handle owner selection change (only updates state, doesn't call API)
  const handleOwnerChange = (selectedOption) => {
    console.log('Owner selection changed to:', selectedOption);
    setOwner(selectedOption);
  };

  // Function to save owner changes to the API
  const saveOwner = async () => {
    try {
      setOwnerLoading(true);
      console.log('Saving owner:', owner);

      // Call the API to update the owner
      const response = await axios.post(
        'https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-owners',
        {
          project_id: projectId,
          owner_id: owner.value
        }
      );

      console.log('API response:', response);

      if (response.data && response.data.status === 1) {
        // Show success message
        Swal.fire({
          title: 'Success!',
          text: 'Project owner updated successfully',
          icon: 'success',
          confirmButtonColor: '#4CAF50'
        });

        // Close the editing mode
        setIsEditingOwner(false);
      } else {
        console.error('Failed to update owner:', response.data?.message || 'Unknown error');

        // Show error message
        Swal.fire({
          title: 'Error!',
          text: response.data?.message || 'Failed to update owner',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error('Error updating owner:', error);

      // Show error message
      Swal.fire({
        title: 'Error!',
        text: 'Error updating owner: ' + (error.response?.data?.message || error.message),
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    } finally {
      setOwnerLoading(false);
    }
  };

  // Function to handle contact selection change (only updates state, doesn't call API)
  const handleContactChange = (selectedOption) => {
    console.log('Contact selection changed to:', selectedOption);
    setSelectedContact(selectedOption);
  };

  // Function to save contact changes to the API
  const saveContact = async () => {
    try {
      setContactLoading(true);
      console.log('Saving contact:', selectedContact);

      // Call the API to update the contact
      const response = await axios.post(
        'https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-contacts',
        {
          project_id: projectId,
          contact_id: selectedContact.value
        }
      );

      console.log('API response:', response);

      if (response.data && response.data.status === 1) {
        // Show success message
        Swal.fire({
          title: 'Success!',
          text: 'Project contact updated successfully',
          icon: 'success',
          confirmButtonColor: '#4CAF50'
        });

        // Close the editing mode
        setIsEditingContact(false);
      } else {
        console.error('Failed to update contact:', response.data?.message || 'Unknown error');

        // Show error message
        Swal.fire({
          title: 'Error!',
          text: response.data?.message || 'Failed to update contact',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error('Error updating contact:', error);

      // Show error message
      Swal.fire({
        title: 'Error!',
        text: 'Error updating contact: ' + (error.response?.data?.message || error.message),
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    } finally {
      setContactLoading(false);
    }
  };

  const handleProjectCampaignChange = (selectedOption) => {
    setProjectCampaign(selectedOption);
  };

  const handleProjectSourceChange = (selectedOption) => {
    setProjectSource(selectedOption);
  };

  const handleProjectStageChange = (selectedOption) => {
    console.log('Stage changed to:', selectedOption);
    setProjectStage(selectedOption);
  };

  // Function to fetch milestones from API
  const fetchMilestones = async () => {
    try {
      setIsLoadingMilestones(true);
      console.log('Fetching milestones for product ID:', selectedProductId);

      // Build the API URL with the product_id parameter
      const apiUrl = `https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/milestones?type=project&product_id=${selectedProductId}`;
      console.log('Milestones API URL:', apiUrl);

      // Make the API call
      const response = await axios.get(apiUrl);
      console.log('Milestones API response:', response.data);

      // Log the entire response for debugging
      console.log('Complete API response:', response);
      console.log('Response data type:', typeof response.data);
      console.log('Response data structure:', JSON.stringify(response.data, null, 2));

      // Process the response data based on the actual structure
      if (response.data) {
        console.log('Response data exists');

        // Check if the response has a success property
        if ('success' in response.data) {
          console.log('Response has success property:', response.data.success);
        } else {
          console.log('Response does not have a success property');
        }

        // Check if the response is an array directly
        if (Array.isArray(response.data)) {
          console.log('Response data is an array with length:', response.data.length);

          // Map the API response to the format needed for the dropdown
          const formattedMilestones = response.data.map(milestone => ({
            value: milestone.milestone_id,
            label: milestone.milestone_name
          }));

          console.log('Formatted milestones from array:', formattedMilestones);
          setMilestones(formattedMilestones);

          // If we have milestones, fetch stages for the first milestone
          if (formattedMilestones.length > 0) {
            const firstMilestone = formattedMilestones[0];
            setMilestone(firstMilestone);
            fetchMilestoneStages(firstMilestone.value);
          } else {
            // No milestones found
            console.log('No milestones found in array');
            setMilestone(null);
            setMilestoneStages([]);
            setProjectStage(null);
          }
        }
        // Check if the response has the expected nested structure
        else if (response.data.success && response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
          console.log('Response has the expected nested structure');

          // Map the API response to the format needed for the dropdown
          const formattedMilestones = response.data.data.data.map(milestone => ({
            value: milestone.milestone_id,
            label: milestone.milestone_name
          }));

          console.log('Formatted milestones from nested structure:', formattedMilestones);
          setMilestones(formattedMilestones);

          // If we have milestones, fetch stages for the first milestone
          if (formattedMilestones.length > 0) {
            const firstMilestone = formattedMilestones[0];
            setMilestone(firstMilestone);
            fetchMilestoneStages(firstMilestone.value);
          } else {
            // No milestones found
            console.log('No milestones found in nested structure');
            setMilestone(null);
            setMilestoneStages([]);
            setProjectStage(null);
          }
        } else {
          console.warn('Unexpected API response structure for milestones');
          console.log('Response data structure details:', JSON.stringify(response.data, null, 2));

          // Set default milestones for testing
          const defaultMilestones = [
            { value: '100', label: 'Default Milestone 1' },
            { value: '101', label: 'Default Milestone 2' }
          ];
          console.log('Setting default milestones:', defaultMilestones);
          setMilestones(defaultMilestones);
          setMilestone(defaultMilestones[0]);
        }
      } else {
        console.warn('API request returned no data');
        setMilestones([]);
        setMilestone(null);
      }
    } catch (error) {
      console.error('Error fetching milestones:', error);
      console.error('Error details:', error.response ? error.response.data : 'No response data');

      // Set default milestones for testing if API fails
      const defaultMilestones = [
        { value: '100', label: 'Default Milestone 1' },
        { value: '101', label: 'Default Milestone 2' },
        { value: '102', label: 'Default Milestone 3' }
      ];
      console.log('Setting default milestones due to error:', defaultMilestones);
      setMilestones(defaultMilestones);
      setMilestone(defaultMilestones[0]);

      // Also fetch stages for the first default milestone
      fetchMilestoneStages('100');
    } finally {
      setIsLoadingMilestones(false);
    }
  };

  // Function to fetch milestone stages from API
  const fetchMilestoneStages = async (milestoneId, isUserSelection = false) => {
    if (!milestoneId) {
      console.warn('No milestone ID provided for fetching stages');
      setMilestoneStages([]);
      setProjectStage(null);
      setIsLoadingStages(false);
      return;
    }

    try {
      setIsLoadingStages(true);
      console.log('Fetching milestone stages for milestone ID:', milestoneId, 'isUserSelection:', isUserSelection);

      // Store the current stage if we need to preserve it
      const currentStage = !isUserSelection ? projectStage : null;

      // Build the API URL with the milestone_id parameter
      const apiUrl = `https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/milestone-stages?milestone_id=${milestoneId}`;
      console.log('Milestone stages API URL:', apiUrl);

      // Make the API call
      const response = await axios.get(apiUrl);
      console.log('Milestone stages API response:', response.data);
      console.log('Milestone stages API response structure:', JSON.stringify(response.data, null, 2));

      // Log the entire response for debugging
      console.log('Complete stages API response:', response);
      console.log('Stages response data type:', typeof response.data);
      console.log('Stages response data structure:', JSON.stringify(response.data, null, 2));

      // Process the response data based on the actual structure
      if (response.data) {
        console.log('Stages response data exists');

        // Check if the response is an array directly
        if (Array.isArray(response.data)) {
          console.log('Stages response data is an array with length:', response.data.length);

          // Map the API response to the format needed for the dropdown
          const formattedStages = response.data.map(stage => ({
            value: stage.milestone_stage_id,
            label: stage.stage_name
          }));

          console.log('Formatted stages from array:', formattedStages);
          setMilestoneStages(formattedStages);

          // If this is a user selection, set the first stage as selected
          // Otherwise, preserve the current stage if it exists
          if (isUserSelection) {
            if (formattedStages.length > 0) {
              setProjectStage(formattedStages[0]);
            } else {
              setProjectStage(null);
            }
          } else if (currentStage) {
            setProjectStage(currentStage);
          } else if (formattedStages.length > 0) {
            setProjectStage(formattedStages[0]);
          } else {
            setProjectStage(null);
          }
        }
        // Check if the response has the expected nested structure
        else if (response.data.success && response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
          console.log('Stages response has the expected nested structure');

          // Map the API response to the format needed for the dropdown
          const formattedStages = response.data.data.data.map(stage => ({
            value: stage.milestone_stage_id,
            label: stage.stage_name
          }));

          console.log('Formatted stages from nested structure:', formattedStages);
          setMilestoneStages(formattedStages);

          // If this is a user selection, set the first stage as selected
          // Otherwise, preserve the current stage if it exists
          if (isUserSelection) {
            if (formattedStages.length > 0) {
              setProjectStage(formattedStages[0]);
            } else {
              setProjectStage(null);
            }
          } else if (currentStage) {
            setProjectStage(currentStage);
          } else if (formattedStages.length > 0) {
            setProjectStage(formattedStages[0]);
          } else {
            setProjectStage(null);
          }
        } else {
          console.warn('Unexpected API response structure for milestone stages');
          console.log('Stages response data structure details:', JSON.stringify(response.data, null, 2));

          // Set default stages for testing
          const defaultStages = [
            { value: '200', label: 'Default Stage 1' },
            { value: '201', label: 'Default Stage 2' },
            { value: '202', label: 'Default Stage 3' }
          ];
          console.log('Setting default stages:', defaultStages);
          setMilestoneStages(defaultStages);
          setProjectStage(defaultStages[0]);
        }
      } else {
        console.warn('API request for stages returned no data');
        setMilestoneStages([]);
        setProjectStage(null);
      }
    } catch (error) {
      console.error('Error fetching milestone stages:', error);
      console.error('Error details:', error.response ? error.response.data : 'No response data');

      // Set default stages for testing if API fails
      const defaultStages = [
        { value: '200', label: 'Default Stage 1' },
        { value: '201', label: 'Default Stage 2' },
        { value: '202', label: 'Default Stage 3' }
      ];
      console.log('Setting default stages due to error:', defaultStages);
      setMilestoneStages(defaultStages);
      setProjectStage(defaultStages[0]);
    } finally {
      setIsLoadingStages(false);
    }
  };

  // Function to handle milestone change
  const handleMilestoneChange = (selectedOption) => {
    console.log('Milestone changed to:', selectedOption);
    setMilestone(selectedOption);

    // Fetch stages for the selected milestone
    if (selectedOption && selectedOption.value) {
      fetchMilestoneStages(selectedOption.value, true); // true means this is from user selection
    } else {
      // Clear stages if no milestone is selected
      setMilestoneStages([]);
      setProjectStage(null);
    }
  };

  // Function to save milestone and stage changes
  const saveMilestoneAndStage = async () => {
    try {
      setIsLoadingMilestones(true);
      console.log('Saving milestone and stage changes:');
      console.log('Milestone:', milestone);
      console.log('Stage:', projectStage);

      if (!milestone) {
        Swal.fire({
          title: 'Error!',
          text: 'Please select a milestone',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
        return;
      }

      if (!projectStage) {
        Swal.fire({
          title: 'Error!',
          text: 'Please select a stage',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
        return;
      }

      // Call the API to update the milestone and stage
      const response = await axios.post(
        'https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-milestones',
        {
          project_id: projectId,
          milestone_id: milestone.value,
          milestone_stage_id: projectStage.value
        }
      );

      console.log('API response:', response);

      if (response.data && response.data.status === 1) {
        // Show success message
        Swal.fire({
          title: 'Success!',
          text: 'Milestone and stage updated successfully',
          icon: 'success',
          confirmButtonColor: '#4CAF50'
        });

        // Close the editing mode
        setIsEditing(false);
      } else {
        console.error('Failed to update milestone and stage:', response.data?.message || 'Unknown error');

        // Show error message
        Swal.fire({
          title: 'Error!',
          text: response.data?.message || 'Failed to update milestone and stage',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error('Error updating milestone and stage:', error);

      // Show error message
      Swal.fire({
        title: 'Error!',
        text: 'Error updating milestone and stage: ' + (error.response?.data?.message || error.message),
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    } finally {
      setIsLoadingMilestones(false);
    }
  };

  // Function to toggle edit mode
  const toggleEditMode = () => {
    if (isEditMode) {
      // If we're currently in edit mode, this is a save action
      handleSaveChanges();
    } else {
      // Otherwise, just enter edit mode
      setIsEditMode(true);
    }
  };

  // Function to collect form data from the current tab
  const collectFormData = () => {
    const data = {
      project_id: project?.project_id,
      tab: activeTab,
    };

    // Add data based on active tab
    if (activeTab === 'project') {
      // Get all input values from the project tab
      const inputs = document.querySelectorAll('.left-section-container input, .left-section-container select');
      inputs.forEach(input => {
        if (input.name) {
          data[input.name] = input.value;
        } else {
          // For inputs without name attribute, use their id or a data attribute
          const fieldName = input.getAttribute('data-field') || input.id;
          if (fieldName) {
            data[fieldName] = input.value;
          }
        }
      });
      data.authorized_signatory_name = project?.authorized_signatory_name;
      data.business_phone = project?.business_phone;
      data.business_email = project?.business_email;
      data.business_title = project?.business_title;
      data.zip = project?.zip;
      data.street_address = project?.street_address;
      data.city = project?.city;
      data.state = project?.state;
      data.identity_document_type = project?.identity_document_type;
      data.identity_document_number = project?.identity_document_number;

      data.business_legal_name = project?.business_legal_name;
      data.doing_business_as = project?.doing_business_as;
      data.business_category = project?.business_category;
      data.website_url = project?.website_url;
      data.business_entity_type = project?.business_entity_type;
      data.registration_number = project?.registration_number;
      data.registration_date = project?.registration_date;
      data.state_of_registration = project?.state_of_registration;
      // Add folder links
      // data.company_folder_link = companyFolderLink;
      // data.erc_document_folder = documentFolderLink;
      // data.stc_document_folder = documentFolderLink;
      // data.agreement_folder = agreementFolderLink;

      // Add milestone and stage
      data.milestone = milestone?.value || project?.milestone;
      data.milestone_stage = projectStage?.value || project?.stage_name;
      data.owner = owner?.value || '';
      data.contact = selectedContact?.value || '';
    } else if (activeTab === 'bankInfo') {
      // Add bank info data
      data.bank_name = bankInfo.bank_name;
      data.bank_mailing_address = bankInfo.bank_mailing_address;
      data.bank_city = bankInfo.city;
      data.bank_state = bankInfo.state;
      data.bank_zip = bankInfo.zip;
      data.bank_country = bankInfo.country;
      data.bank_phone = bankInfo.bank_phone;
      data.account_holder_name = bankInfo.account_holder_name;
      data.account_type = bankInfo.account_type;
      data.other = bankInfo.other;
      data.aba_routing_no = bankInfo.aba_routing_no;
      data.account_number = bankInfo.account_number;
      data.swift = bankInfo.swift;
      data.iban = bankInfo.iban;
    } else if (activeTab === 'intake') {
      // Add intake info data
      Object.assign(data, intakeInfo);
    }

    return data;
  };

  // Function to handle project update
  const handleUpdateProject = async (data) => {
    try {
      // Set loading state
      setIsUpdating(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      console.log('Updating project with data:', data);

      // Always include project ID
      const baseData = {
        project_id: project?.project_id,
        tab: activeTab,
      };

      // Combine the base data with the tab-specific data
      const combinedData = { ...baseData, ...data };
      console.log('Combined data:', data);

      // Map the data to the correct database column names
      const mappedData = {
        project_id: combinedData.project_id,
        tab: combinedData.tab,

        // Personal Info - Map to the database column names
        authorized_signatory_name: project.authorized_signatory_name,
        business_phone: project.business_phone,
        business_email: project.business_email,
        business_title: project.business_title,
        zip: project.zip,
        street_address: project.street_address,
        city: project.city,
        state: project.state,
        identity_document_type: project.identity_document_type,
        identity_document_number: project.identity_document_number,

        // Business Info
        business_legal_name: project.business_legal_name,
        doing_business_as: project.doing_business_as,
        business_category: project.business_category,
        website_url: project.website_url,

        // Business Legal Info
        business_entity_type: project.business_entity_type,
        registration_number: project.registration_number,
        registration_date: project.registration_date,
        state_of_registration: project.state_of_registration,

        // Folder Links
        // company_folder_link: combinedData.company_folder_link || companyFolderLink,
        // erc_document_folder: combinedData.erc_document_folder || documentFolderLink,
        // stc_document_folder: combinedData.stc_document_folder || documentFolderLink,
        // agreement_folder: combinedData.agreement_folder,

        // Bank Info - Always include bank info regardless of active tab
        bank_name: bankInfo.bank_name,
        bank_mailing_address: bankInfo.bank_mailing_address,
        bank_city: bankInfo.city,
        bank_state: bankInfo.state,
        bank_zip: bankInfo.zip,
        bank_country: bankInfo.country,
        bank_phone: bankInfo.bank_phone,
        account_holder_name: bankInfo.account_holder_name,
        account_type: bankInfo.account_type,
        other: bankInfo.other,
        aba_routing_no: bankInfo.aba_routing_no,
        account_number: bankInfo.account_number,
        swift: bankInfo.swift,
        iban: bankInfo.iban,

        // Intake Info
        w2_employees_count: intakeInfo.w2_employees_count,
        initial_retain_fee_amount: intakeInfo.initial_retain_fee_amount,
        w2_ee_difference_count: intakeInfo.w2_ee_difference_count,
        balance_retainer_fee: intakeInfo.balance_retainer_fee,
        total_max_erc_amount: intakeInfo.total_max_erc_amount,
        total_estimated_fees: intakeInfo.total_estimated_fees,
        affiliate_referral_fees: intakeInfo.affiliate_referral_fees,
        sdgr: intakeInfo.sdgr,
        average_employee_count_2019: intakeInfo.average_employee_count_2019,
        fee_type: intakeInfo.fee_type,
        custom_fee: intakeInfo.custom_fee,
        eligible_quarters: intakeInfo.eligible_quarters,

        // Fees Info
        error_discovered_date: feesInfo.error_discovered_date,
        q2_2020_941_wages: feesInfo.q2_2020_941_wages,
        q3_2020_941_wages: feesInfo.q3_2020_941_wages,
        q4_2020_941_wages: feesInfo.q4_2020_941_wages,
        q1_2021_941_wages: feesInfo.q1_2021_941_wages,
        q2_2021_941_wages: feesInfo.q2_2021_941_wages,
        q3_2021_941_wages: feesInfo.q3_2021_941_wages,
        q4_2021_941_wages: feesInfo.q4_2021_941_wages,
        internal_sales_agent: feesInfo.internal_sales_agent,
        internal_sales_support: feesInfo.internal_sales_support,
        affiliate_name: feesInfo.affiliate_name,
        affiliate_percentage: feesInfo.affiliate_percentage,
        erc_claim_filed: feesInfo.erc_claim_filed,
        erc_amount_received: feesInfo.erc_amount_received,
        total_erc_fee: feesInfo.total_erc_fee,
        legal_fees: feesInfo.legal_fees,
        total_erc_fees_paid: feesInfo.total_erc_fees_paid,
        total_erc_fees_pending: feesInfo.total_erc_fees_pending,
        total_occams_share: feesInfo.total_occams_share,
        total_aff_ref_share: feesInfo.total_aff_ref_share,
        retain_occams_share: feesInfo.retain_occams_share,
        retain_aff_ref_share: feesInfo.retain_aff_ref_share,
        bal_retain_occams_share: feesInfo.bal_retain_occams_share,
        total_occams_share_paid: feesInfo.total_occams_share_paid,
        total_aff_ref_share_paid: feesInfo.total_aff_ref_share_paid,
        total_occams_share_pending: feesInfo.total_occams_share_pending,
        total_aff_ref_share_pending: feesInfo.total_aff_ref_share_pending,
        q1_2020_max_erc_amount: feesInfo.q1_2020_max_erc_amount,
        q2_2020_max_erc_amount: feesInfo.q2_2020_max_erc_amount,
        q3_2020_max_erc_amount: feesInfo.q3_2020_max_erc_amount,
        q4_2020_max_erc_amount: feesInfo.q4_2020_max_erc_amount,
        q1_2021_max_erc_amount: feesInfo.q1_2021_max_erc_amount,
        q2_2021_max_erc_amount: feesInfo.q2_2021_max_erc_amount,
        q3_2021_max_erc_amount: feesInfo.q3_2021_max_erc_amount,
        q4_2021_max_erc_amount: feesInfo.q4_2021_max_erc_amount,
        q1_2020_filed_status: feesInfo.q1_2020_filed_status,
        q1_2020_filing_date: feesInfo.q1_2020_filing_date,
        q1_2020_amount_filed: feesInfo.q1_2020_amount_filed,
        q1_2020_benefits: feesInfo.q1_2020_benefits,
        q1_2020_eligibility_basis: feesInfo.q1_2020_eligibility_basis,
        q2_2020_filed_status: feesInfo.q2_2020_filed_status,
        q2_2020_filing_date: feesInfo.q2_2020_filing_date,
        q2_2020_amount_filed: feesInfo.q2_2020_amount_filed,
        q2_2020_benefits: feesInfo.q2_2020_benefits,
        q2_2020_eligibility_basis: feesInfo.q2_2020_eligibility_basis,
        q3_2020_filed_status: feesInfo.q3_2020_filed_status,
        q3_2020_filing_date: feesInfo.q3_2020_filing_date,
        q3_2020_amount_filed: feesInfo.q3_2020_amount_filed,
        q3_2020_benefits: feesInfo.q3_2020_benefits,
        q3_2020_eligibility_basis: feesInfo.q3_2020_eligibility_basis,
        q4_2020_filed_status: feesInfo.q4_2020_filed_status,
        q4_2020_filing_date: feesInfo.q4_2020_filing_date,
        q4_2020_amount_filed: feesInfo.q4_2020_amount_filed,
        q4_2020_benefits: feesInfo.q4_2020_benefits,
        q4_2020_eligibility_basis: feesInfo.q4_2020_eligibility_basis,
        // ERC Filed Quarter wise 2021 fields
        q1_2021_filed_status: feesInfo.q1_2021_filed_status,
        q1_2021_filing_date: feesInfo.q1_2021_filing_date,
        q1_2021_amount_filed: feesInfo.q1_2021_amount_filed,
        q1_2021_benefits: feesInfo.q1_2021_benefits,
        q1_2021_eligibility_basis: feesInfo.q1_2021_eligibility_basis,
        q2_2021_filed_status: feesInfo.q2_2021_filed_status,
        q2_2021_filing_date: feesInfo.q2_2021_filing_date,
        q2_2021_amount_filed: feesInfo.q2_2021_amount_filed,
        q2_2021_benefits: feesInfo.q2_2021_benefits,
        q2_2021_eligibility_basis: feesInfo.q2_2021_eligibility_basis,
        q3_2021_filed_status: feesInfo.q3_2021_filed_status,
        q3_2021_filing_date: feesInfo.q3_2021_filing_date,
        q3_2021_amount_filed: feesInfo.q3_2021_amount_filed,
        q3_2021_benefits: feesInfo.q3_2021_benefits,
        q3_2021_eligibility_basis: feesInfo.q3_2021_eligibility_basis,
        q4_2021_filed_status: feesInfo.q4_2021_filed_status,
        q4_2021_filing_date: feesInfo.q4_2021_filing_date,
        q4_2021_amount_filed: feesInfo.q4_2021_amount_filed,
        q4_2021_benefits: feesInfo.q4_2021_benefits,
        q4_2021_eligibility_basis: feesInfo.q4_2021_eligibility_basis,
        // ERC Letter, Check & Amount 2020 fields
        q1_2020_loop: feesInfo.q1_2020_loop,
        q1_2020_letter: feesInfo.q1_2020_letter,
        q1_2020_check: feesInfo.q1_2020_check,
        q1_2020_chq_amt: feesInfo.q1_2020_chq_amt,
        q2_2020_loop: feesInfo.q2_2020_loop,
        q2_2020_letter: feesInfo.q2_2020_letter,
        q2_2020_check: feesInfo.q2_2020_check,
        q2_2020_chq_amt: feesInfo.q2_2020_chq_amt,
        q3_2020_loop: feesInfo.q3_2020_loop,
        q3_2020_letter: feesInfo.q3_2020_letter,
        q3_2020_check: feesInfo.q3_2020_check,
        q3_2020_chq_amt: feesInfo.q3_2020_chq_amt,
        q4_2020_loop: feesInfo.q4_2020_loop,
        q4_2020_letter: feesInfo.q4_2020_letter,
        q4_2020_check: feesInfo.q4_2020_check,
        q4_2020_chq_amt: feesInfo.q4_2020_chq_amt,
        // ERC Letter, Check & Amount 2021 fields
        q1_2021_loop: feesInfo.q1_2021_loop,
        q1_2021_letter: feesInfo.q1_2021_letter,
        q1_2021_check: feesInfo.q1_2021_check,
        q1_2021_chq_amt: feesInfo.q1_2021_chq_amt,
        q2_2021_loop: feesInfo.q2_2021_loop,
        q2_2021_letter: feesInfo.q2_2021_letter,
        q2_2021_check: feesInfo.q2_2021_check,
        q2_2021_chq_amt: feesInfo.q2_2021_chq_amt,
        q3_2021_loop: feesInfo.q3_2021_loop,
        q3_2021_letter: feesInfo.q3_2021_letter,
        q3_2021_check: feesInfo.q3_2021_check,
        q3_2021_chq_amt: feesInfo.q3_2021_chq_amt,
        q4_2021_loop: feesInfo.q4_2021_loop,
        q4_2021_letter: feesInfo.q4_2021_letter,
        q4_2021_check: feesInfo.q4_2021_check,
        q4_2021_chq_amt: feesInfo.q4_2021_chq_amt,
        // Success Fee Invoice Details - I Invoice
        i_invoice_number: feesInfo.i_invoice_number,
        i_invoice_amount: feesInfo.i_invoice_amount,
        i_invoiced_qtrs: feesInfo.i_invoiced_qtrs,
        i_invoice_sent_date: feesInfo.i_invoice_sent_date,
        i_invoice_payment_type: feesInfo.i_invoice_payment_type,
        i_invoice_payment_date: feesInfo.i_invoice_payment_date,
        i_invoice_received_date: feesInfo.i_invoice_received_date,
        i_invoice_pay_cleared: feesInfo.i_invoice_pay_cleared,
        i_invoice_pay_returned: feesInfo.i_invoice_pay_returned,
        i_invoice_return_reason: feesInfo.i_invoice_return_reason,
        i_invoice_occams_share: feesInfo.i_invoice_occams_share,
        i_invoice_affref_share: feesInfo.i_invoice_affref_share,
        // Success Fee Invoice Details - II Invoice
        ii_invoice_number: feesInfo.ii_invoice_number,
        ii_invoice_amount: feesInfo.ii_invoice_amount,
        ii_invoiced_qtrs: feesInfo.ii_invoiced_qtrs,
        ii_invoice_sent_date: feesInfo.ii_invoice_sent_date,
        ii_invoice_payment_type: feesInfo.ii_invoice_payment_type,
        ii_invoice_payment_date: feesInfo.ii_invoice_payment_date,
        ii_invoice_pay_cleared: feesInfo.ii_invoice_pay_cleared,
        ii_invoice_pay_returned: feesInfo.ii_invoice_pay_returned,
        ii_invoice_return_reason: feesInfo.ii_invoice_return_reason,
        ii_invoice_occams_share: feesInfo.ii_invoice_occams_share,
        ii_invoice_affref_share: feesInfo.ii_invoice_affref_share,
        // Success Fee Invoice Details - III Invoice
        iii_invoice_number: feesInfo.iii_invoice_number,
        iii_invoice_amount: feesInfo.iii_invoice_amount,
        iii_invoiced_qtrs: feesInfo.iii_invoiced_qtrs,
        iii_invoice_sent_date: feesInfo.iii_invoice_sent_date,
        iii_invoice_payment_type: feesInfo.iii_invoice_payment_type,
        iii_invoice_payment_date: feesInfo.iii_invoice_payment_date,
        iii_invoice_pay_cleared: feesInfo.iii_invoice_pay_cleared,
        iii_invoice_pay_returned: feesInfo.iii_invoice_pay_returned,
        iii_invoice_return_reason: feesInfo.iii_invoice_return_reason,
        iii_invoice_occams_share: feesInfo.iii_invoice_occams_share,
        iii_invoice_affref_share: feesInfo.iii_invoice_affref_share,
        // Success Fee Invoice Details - IV Invoice
        iv_invoice_number: feesInfo.iv_invoice_number,
        iv_invoice_amount: feesInfo.iv_invoice_amount,
        iv_invoiced_qtrs: feesInfo.iv_invoiced_qtrs,
        iv_invoice_sent_date: feesInfo.iv_invoice_sent_date,
        iv_invoice_payment_type: feesInfo.iv_invoice_payment_type,
        iv_invoice_payment_date: feesInfo.iv_invoice_payment_date,
        iv_invoice_pay_cleared: feesInfo.iv_invoice_pay_cleared,
        iv_invoice_pay_returned: feesInfo.iv_invoice_pay_returned,
        iv_invoice_return_reason: feesInfo.iv_invoice_return_reason,
        iv_invoice_occams_share: feesInfo.iv_invoice_occams_share,
        iv_invoice_aff_ref_share: feesInfo.iv_invoice_aff_ref_share,


        // Other Info
        milestone: milestone?.value || project?.milestone,
        milestone_stage: projectStage?.value || project?.stage_name,
        owner: owner?.value || '',
        contact: selectedContact?.value || ''
      };

      console.log('Mapped data for API:', mappedData);

      // Make a direct API call instead of form submission
      const response = await fetch('https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/update-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappedData),
      });

      // Parse the response
      const responseData = await response.json();
      console.log('API response:', responseData);

      // Check if the response indicates success
      if (response.ok && (responseData.success || responseData.status === 1)) {
        // Set success state
        setUpdateSuccess(true);

        // Exit edit mode if we're in edit mode
        if (isEditMode) {
          setIsEditMode(false);
        }

        // Scroll to the success message
        setTimeout(() => {
          const successElement = document.querySelector('.alert-success');
          if (successElement) {
            successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      } else {
        // Handle API error
        const errorMessage = responseData.message || 'Server returned an error';
        throw new Error(errorMessage);
      }
    } catch (error) {
      // Handle any errors that occurred during the process
      console.error('Error updating project:', error);
      setUpdateError(error.message || 'An unknown error occurred');

      // Scroll to the error message
      setTimeout(() => {
        const errorElement = document.querySelector('.alert-danger');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } finally {
      // Reset loading state
      setIsUpdating(false);
    }
  };

  const handlePersonalInfoUpdateProject = async (data) => {
    try {
      // Set loading state
      setIsUpdating(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      console.log('Updating project with data:', data);

      // Always include project ID
      const baseData = {
        project_id: project?.project_id,
        tab: activeTab,
      };

      // Combine the base data with the tab-specific data
      const combinedData = { ...baseData, ...data };
      console.log('Combined data:', data);

      // Map the data to the correct database column names
      const mappedData = {
        project_id: combinedData.project_id,
        tab: combinedData.tab,

        // Personal Info - Map to the database column names
        authorized_signatory_name: project.authorized_signatory_name,
        business_phone: project.business_phone,
        business_email: project.business_email,
        business_title: project.business_title,
        zip: project.zip,
        street_address: project.street_address,
        city: project.city,
        state: project.state,
        identity_document_type: project.identity_document_type,
        identity_document_number: project.identity_document_number,

        // Business Info
        business_legal_name: project.business_legal_name,
        doing_business_as: project.doing_business_as,
        business_category: project.business_category,
        website_url: project.website_url,

        // Business Legal Info
        business_entity_type: project.business_entity_type,
        registration_number: project.registration_number,
        registration_date: project.registration_date,
        state_of_registration: project.state_of_registration,
      };

      console.log('Mapped data for API:', mappedData);

      // Make a direct API call instead of form submission
      const response = await fetch('https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/update-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappedData),
      });

      // Parse the response
      const responseData = await response.json();
      console.log('API response:', responseData);

      // Check if the response indicates success
      if (response.ok && (responseData.success || responseData.status === 1)) {
        // Set success state
        setUpdateSuccess(true);

        // Exit edit mode if we're in edit mode
        if (isEditMode) {
          setIsEditMode(false);
        }

        // Scroll to the success message
        setTimeout(() => {
          const successElement = document.querySelector('.alert-success');
          if (successElement) {
            successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      } else {
        // Handle API error
        const errorMessage = responseData.message || 'Server returned an error';
        throw new Error(errorMessage);
      }
    } catch (error) {
      // Handle any errors that occurred during the process
      console.error('Error updating project:', error);
      setUpdateError(error.message || 'An unknown error occurred');

      // Scroll to the error message
      setTimeout(() => {
        const errorElement = document.querySelector('.alert-danger');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } finally {
      // Reset loading state
      setIsUpdating(false);
    }
  };

  // Function to handle saving changes
  const handleSaveChanges = () => {
    // Collect form data
    const data = collectFormData();

    // Call the update function
    handlePersonalInfoUpdateProject(data);
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
                {/* Show Fulfilment tab only for STC (937) projects */}
                {project?.product_id === '937' && (
                  <li className={`nav-item ${activeTab === 'fulfilment' ? 'active' : ''}`}>
                    <a
                      className="nav-link"
                      id="pills-fulfilment"
                      onClick={(e) => {
                        e.preventDefault();
                        handleTabChange('fulfilment');
                      }}
                      href="#pills-fulfilment"
                      role="tab"
                      aria-controls="pills-fulfilment"
                      aria-selected={activeTab === 'fulfilment'}
                    >
                      Fulfilment
                    </a>
                  </li>
                )}

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
                            <div className="d-flex">
                              <input type="text" className="form-control" defaultValue={project?.business_legal_name || ""} readOnly />
                            </div>
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
                              className={`form-control ${errors.authorized_signatory_name ? 'is-invalid' : ''}`}
                              {...register('authorized_signatory_name')}
                              value={project.authorized_signatory_name}
                              onChange={(e) => setProject({...project, authorized_signatory_name: e.target.value})}
                              readOnly={!isEditMode}
                            />
                            {errors.authorized_signatory_name && (
                                <div className="invalid-feedback">{errors.authorized_signatory_name.message}</div>
                              )}
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Contact No.</label>
                            <input
                              type="text"
                              className={`form-control ${errors.business_phone ? 'is-invalid' : ''}`}
                              {...register('business_phone')}
                              value={project.business_phone}
                              onChange={(e) => setProject({...project, business_phone: e.target.value})}
                              readOnly={!isEditMode}
                            />
                            {errors.business_phone && (
                                <div className="invalid-feedback">{errors.business_phone.message}</div>
                              )}
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                              type="email"
                              className={`form-control ${errors.business_email ? 'is-invalid' : ''}`}
                              {...register('business_email')}
                              value={project.business_email}
                              onChange={(e) => setProject({...project, business_email: e.target.value})}
                              readOnly={!isEditMode}
                            />
                            {errors.business_email && (
                                <div className="invalid-feedback">{errors.business_email.message}</div>
                              )}
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Title</label>
                            <input
                              type="text"
                              className={`form-control ${errors.business_title ? 'is-invalid' : ''}`}
                              {...register('business_title')}
                              value={project.business_title}
                              onChange={(e) => setProject({...project, business_title: e.target.value})}
                              readOnly={!isEditMode}
                            />
                            {errors.business_title && (
                                <div className="invalid-feedback">{errors.business_title.message}</div>
                              )}
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Zip</label>
                            <input
                              type="text"
                              className={`form-control ${errors.zip ? 'is-invalid' : ''}`}
                              {...register('zip')}
                              value={project.zip}
                              onChange={(e) => setProject({...project, zip: e.target.value})}
                              readOnly={!isEditMode}
                            />
                            {errors.zip && (
                                <div className="invalid-feedback">{errors.zip.message}</div>
                              )}
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Street Address</label>
                            <input
                              type="text"
                              className={`form-control ${errors.street_address ? 'is-invalid' : ''}`}
                              {...register('street_address')}
                              value={project.street_address}
                              onChange={(e) => setProject({...project, street_address: e.target.value})}
                              readOnly={!isEditMode}
                            />
                            {errors.street_address && (
                                <div className="invalid-feedback">{errors.street_address.message}</div>
                              )}
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">City</label>
                            <input
                              type="text"
                              className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                              {...register('city')}
                              value={project.city}
                              onChange={(e) => setProject({...project, city: e.target.value})}
                              readOnly={!isEditMode}
                            />
                            {errors.city && (
                                <div className="invalid-feedback">{errors.city.message}</div>
                              )}
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">State</label>
                            <input
                              type="text"
                              className={`form-control ${errors.state ? 'is-invalid' : ''}`}
                              {...register('state')}
                              value={project.state}
                              onChange={(e) => setProject({...project, state: e.target.value})}
                              readOnly={!isEditMode}
                            />
                            {errors.state && (
                                <div className="invalid-feedback">{errors.state.message}</div>
                              )}
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Identity Document Type</label>
                            <select
                              className={`form-select ${errors.identity_document_type ? 'is-invalid' : ''}`}
                              {...register('identity_document_type')}

                              value={project.identity_document_type || ""}
                              onChange={(e) => setProject({...project, identity_document_type: e.target.value})}
                            >
                              <option value="N/A">N/A</option>
                              <option value="SSN">SSN</option>
                              <option value="EIN">EIN</option>
                              <option value="Driver's License">Driver's License</option>
                              <option value="Passport">Passport</option>
                              <option value="State ID">State ID</option>
                              <option value="Others">Others</option>
                            </select>
                            {errors.identity_document_type && (
                                <div className="invalid-feedback">{errors.identity_document_type.message}</div>
                              )}
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Document Number</label>
                            <input
                              type="text"
                              className={`form-control ${errors.identity_document_number ? 'is-invalid' : ''}`}
                              {...register('identity_document_number')}
                              value={project.identity_document_number}
                              onChange={(e) => setProject({...project, identity_document_number: e.target.value})}
                              readOnly={!isEditMode}
                            />
                            {errors.identity_document_number && (
                                <div className="invalid-feedback">{errors.identity_document_number.message}</div>
                              )}
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
                              className={`form-control ${errors.business_legal_name ? 'is-invalid' : ''}`}
                              {...register('business_legal_name')}
                              value={project.business_legal_name}
                              onChange={(e) => setProject({...project, business_legal_name: e.target.value})}
                              readOnly={!isEditMode}
                            />
                            {errors.business_legal_name && (
                                <div className="invalid-feedback">{errors.business_legal_name.message}</div>
                              )}
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Doing Business As</label>
                            <input
                              type="text"
                              className={`form-control ${errors.doing_business_as ? 'is-invalid' : ''}`}
                              {...register('doing_business_as')}
                              value={project.doing_business_as}
                              onChange={(e) => setProject({...project, doing_business_as: e.target.value})}
                              readOnly={!isEditMode}
                            />
                            {errors.doing_business_as && (
                                <div className="invalid-feedback">{errors.doing_business_as.message}</div>
                              )}
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Business Category</label>
                            <input
                              type="text"
                              className={`form-control ${errors.business_category ? 'is-invalid' : ''}`}
                              {...register('business_category')}
                              value={project.business_category}
                              onChange={(e) => setProject({...project, business_category: e.target.value})}
                              readOnly={!isEditMode}
                            />
                            {errors.business_category && (
                                <div className="invalid-feedback">{errors.business_category.message}</div>
                              )}
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Website URL</label>
                            <input
                              type="text"
                              className={`form-control ${errors.website_url ? 'is-invalid' : ''}`}
                              {...register('website_url')}
                              value={project.website_url}
                              onChange={(e) => setProject({...project, website_url: e.target.value})}
                              readOnly={!isEditMode}
                            />
                            {errors.website_url && (
                                <div className="invalid-feedback">{errors.website_url.message}</div>
                              )}
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
                              className={`form-select ${errors.business_entity_type ? 'is-invalid' : ''}`}
                              {...register('business_entity_type')}

                              value={project.business_entity_type || ""}
                              onChange={(e) => setProject({...project, business_entity_type: e.target.value})}
                            >
                              <option value="1">N/A</option>
                              <option value="4">Sole Proprietorship</option>
                              <option value="3">Partnership</option>
                              <option value="2">Limited Liability (LLC)</option>
                              <option value="6">Corporation (S,C,B,etc)</option>
                              <option value="7">Trust</option>
                              <option value="5">Other</option>
                            </select>
                            {errors.business_entity_type && (
                                <div className="invalid-feedback">{errors.business_entity_type.message}</div>
                              )}
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Registration Number</label>
                            <input
                              type="text"
                              className="form-control"
                              value={project.registration_number}
                              onChange={(e) => setProject({...project, registration_number: e.target.value})}
                              readOnly={!isEditMode}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">Registration Date</label>
                            <input
                              type="date"
                              className={`form-control ${errors.registration_date ? 'is-invalid' : ''}`}
                              {...register('registration_date')}
                              value={project.registration_date}
                              onChange={(e) => setProject({...project, registration_date: e.target.value})}
                              readOnly={!isEditMode}
                            />
                            {errors.registration_date && (
                                <div className="invalid-feedback">{errors.registration_date.message}</div>
                              )}
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">State of Registration</label>
                            <input
                              type="text"
                              className={`form-control ${errors.state_of_registration ? 'is-invalid' : ''}`}
                              {...register('state_of_registration')}
                              value={project.state_of_registration}
                              onChange={(e) => setProject({...project, state_of_registration: e.target.value})}
                              readOnly={!isEditMode}
                            />
                            {errors.state_of_registration && (
                                <div className="invalid-feedback">{errors.state_of_registration.message}</div>
                              )}
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
                              className={`form-control ${errors.company_folder_link ? 'is-invalid' : ''}`}
                              {...register('company_folder_link')}
                              value={companyFolderLink}
                              onChange={(e) => setCompanyFolderLink(e.target.value)}
                            />
                            {errors.company_folder_link && (
                                <div className="invalid-feedback">{errors.company_folder_link.message}</div>
                              )}
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
                              className={`form-control ${errors.document_folder_link ? 'is-invalid' : ''}`}
                              {...register('document_folder_link')}
                              value={documentFolderLink}
                              onChange={(e) => setDocumentFolderLink(e.target.value)}
                            />
                            {errors.document_folder_link && (
                                <div className="invalid-feedback">{errors.document_folder_link.message}</div>
                              )}
                          </div>
                        </div>
                      </div>


                    </div>
                  )}
                  {/* Fulfilment Tab Content */}
                  {activeTab === 'fulfilment' && (
                    <div className="mb-4 left-section-container">
                      {/* Display loading state */}
                      {fulfilmentLoading && (
                        <div className="text-center mb-3">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading fulfilment information...</span>
                          </div>
                          <p className="mt-2">Loading fulfilment information...</p>
                        </div>
                      )}

                      {/* Display error state */}
                      {fulfilmentError && (
                        <div className="alert alert-warning alert-dismissible fade show" role="alert">
                          <strong>API Error:</strong> {fulfilmentError}
                          <button type="button" className="btn-close" onClick={() => setFulfilmentError(null)} aria-label="Close"></button>
                        </div>
                      )}



                          {/* Input Section */}
                          <h5 className="section-title">Input</h5>

                          {/* Annual Income Section */}
                          <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">
                            Annual Income
                          </h6>
                          <div className="row mb-3">
                            <div className="col-md-4">
                              <div className="form-group">
                                <label className="form-label">2019 Income</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={fulfilmentData.income_2019}
                                  onChange={(e) => setFulfilmentData({...fulfilmentData, income_2019: e.target.value})}
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="form-group">
                                <label className="form-label">2020 Income</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={fulfilmentData.income_2020}
                                  onChange={(e) => setFulfilmentData({...fulfilmentData, income_2020: e.target.value})}
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="form-group">
                                <label className="form-label">2021 Income</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={fulfilmentData.income_2021}
                                  onChange={(e) => setFulfilmentData({...fulfilmentData, income_2021: e.target.value})}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Bank Information Section */}
                          <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">
                            Bank Information
                          </h6>
                          <div className="row mb-3">
                            <div className="col-md-4">
                              <div className="form-group">
                                <label className="form-label">Bank Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={fulfilmentData.bank_name}
                                  onChange={(e) => setFulfilmentData({...fulfilmentData, bank_name: e.target.value})}
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="form-group">
                                <label className="form-label">Account Holder Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={fulfilmentData.account_holder_name}
                                  onChange={(e) => setFulfilmentData({...fulfilmentData, account_holder_name: e.target.value})}
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="form-group">
                                <label className="form-label">Account Number</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={fulfilmentData.account_number}
                                  onChange={(e) => setFulfilmentData({...fulfilmentData, account_number: e.target.value})}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-md-4">
                              <div className="form-group">
                                <label className="form-label">Routing Number</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={fulfilmentData.routing_number}
                                  onChange={(e) => setFulfilmentData({...fulfilmentData, routing_number: e.target.value})}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Output Section */}
                          <h5 className="section-title mt-4">Output</h5>

                          {/* STC Amount Section */}
                          <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">
                            STC Amount
                          </h6>
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label className="form-label">2020 STC Amount</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={fulfilmentData.stc_amount_2020}
                                  onChange={(e) => setFulfilmentData({...fulfilmentData, stc_amount_2020: e.target.value})}
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label className="form-label">2021 STC Amount</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={fulfilmentData.stc_amount_2021}
                                  onChange={(e) => setFulfilmentData({...fulfilmentData, stc_amount_2021: e.target.value})}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Credit Amount & Fee Section */}
                          <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">
                            Credit Amount & Fee
                          </h6>
                          <div className="row mb-3">
                            <div className="col-md-4">
                              <div className="form-group">
                                <label className="form-label">Maximum Credit</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={fulfilmentData.maximum_credit}
                                  onChange={(e) => setFulfilmentData({...fulfilmentData, maximum_credit: e.target.value})}
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="form-group">
                                <label className="form-label">Actual Credit</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={fulfilmentData.actual_credit}
                                  onChange={(e) => setFulfilmentData({...fulfilmentData, actual_credit: e.target.value})}
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="form-group">
                                <label className="form-label">Estimated Fee</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={fulfilmentData.estimated_fee}
                                  onChange={(e) => setFulfilmentData({...fulfilmentData, estimated_fee: e.target.value})}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-md-4">
                              <div className="form-group">
                                <label className="form-label">Actual Fee</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={fulfilmentData.actual_fee}
                                  onChange={(e) => setFulfilmentData({...fulfilmentData, actual_fee: e.target.value})}
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="form-group">
                                <label className="form-label">Years</label>
                                <select
                                  className="form-select"
                                  value={fulfilmentData.years}
                                  onChange={(e) => setFulfilmentData({...fulfilmentData, years: e.target.value})}
                                >
                                  <option value="2020">2020</option>
                                  <option value="2021">2021</option>
                                  <option value="2020,2021">2020,2021</option>
                                </select>
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
                                  value={bankInfo.aba_routing_no}
                                  onChange={(e) => setBankInfo({...bankInfo, aba_routing_no: e.target.value})}
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
                              value={feesInfo.iv_invoice_aff_ref_share}
                              onChange={(e) => setFeesInfo({...feesInfo, iv_invoice_aff_ref_share: e.target.value})}

                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Documents Tab Content */}
                  {activeTab === 'documents' && (
                    <div className="mb-4 left-section-container">
                      {/* Centralized loading spinner for documents only */}
                      {documentsLoading && (
                        <div className="text-center mb-3">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading documents...</span>
                          </div>
                          <p className="mt-2">Loading documents...</p>
                        </div>
                      )}

                      {/* Error message */}
                      {error && !documentsLoading && (
                        <p className="text-danger text-center">{error}</p>
                      )}

                      {!documentsLoading && ercDocuments?.product_id === "935" && (
                        <>
                          <div className="d-flex justify-content-between align-items-center section-title" style={{ paddingRight: 0 }}>
                            <h5 className="mb-0">ERC Documents</h5>
                            {ercDocuments?.view_document && (
                                <a
                                    href={ercDocuments.view_document}
                                    className="btn btn-primary"
                                    title="View ERC Documents"
                                    style={{ fontSize: '14px', lineHeight: '1.5' }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                  View Documents
                                </a>
                            )}
                          </div>
                          <DocumentTable documents={ercDocuments?.documents} />
                        </>
                      )}

                      {!documentsLoading && companyDocuments?.product_id === "935" && (
                        <>
                          <h5 className="section-title mt-5">Company Documents</h5>
                          <DocumentTable documents={companyDocuments?.documents} />
                        </>
                      )}

                      {!documentsLoading && payrollDocuments?.product_id === "935" && (
                        <>
                          <h5 className="section-title mt-5">Payroll Documents</h5>
                          {payrollDocuments.groups?.length > 0 ? (
                            payrollDocuments.groups.map((group, index) => (
                              <div key={index} className="mb-4">
                                <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">{group.heading}</h6>
                                <DocumentTable documents={group.documents} />
                              </div>
                            ))
                          ) : (
                            <p>No payroll documents found.</p>
                          )}
                        </>
                      )}

                      {!documentsLoading && otherDocuments?.product_id === "935" && (
                        <>
                          <h5 className="section-title mt-5">Other Documents</h5>
                          <DocumentTable documents={otherDocuments?.documents} />
                        </>
                      )}

                      {/* STC Documents */}
                      {!documentsLoading && stcRequiredDocuments?.product_id === "937" && (
                        <>
                          <div className="d-flex justify-content-between align-items-center section-title" style={{ paddingRight: 0 }}>
                            <h5 className="mb-0">Required Documents</h5>
                            {stcRequiredDocuments?.view_document && (
                                <a
                                    href={stcRequiredDocuments.view_document}
                                    className="btn btn-primary"
                                    title="View ERC Documents"
                                    style={{ fontSize: '14px', lineHeight: '1.5' }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                  View Documents
                                </a>
                            )}
                          </div>
                          <STCDocumentTable stc_documents_groups={stcRequiredDocuments} />
                        </>
                      )}

                      {/* STC Impacted Days */}
                      {!documentsLoading && stcImpactedDays?.product_id === "937" && (
                        <>
                          <h5 className="section-title">Impacted Days</h5>
                          <STCImpactedDaysTable impacted_days_groups={stcImpactedDays?.groups || []} />
                        </>
                      )}
                    </div>
                  )}

                   {/* Invoices Tab Content */}
                    {activeTab === 'invoices' && (
                      <div className="mb-4 left-section-container">
                        {loading ? (
                          <div className="text-center p-4">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        ) : error ? (
                          <div className="alert alert-danger" role="alert">
                            {error}
                            <button className="btn btn-sm btn-outline-danger ms-2" onClick={fetchInvoiceData}>Retry</button>
                          </div>
                        ) : invoices.length === 0 ? (
                          <div className="text-center p-4">
                            <p>No invoices found for this project.</p>
                          </div>
                        ) : (
                          invoices.map((invoice, index) => (
                            <div className="contact_tab_data" key={invoice.id || `invoice-${index}`}>
                              <div className="row custom_opp_tab">
                                <div className="col-sm-12">
                                  <div className="custom_opp_tab_header">
                                    <h5>
                                      <a href="javascript:void(0)" target="_blank" data-invoiceid={invoice.id}>
                                        Invoice {invoice.customer_invoice_no || `ERC-${invoice.customer_invoice_no}`}</a> -
                                      <span className={`status ${invoice.invoice_status_class}`} style={{marginLeft: '5px'}}>
                                        {invoice.invoice_status}
                                      </span>
                                    </h5>
                                    <div className="opp_edit_dlt_btn projects-iris">
                                      {/* Condition to show dropdown if invoice.status is not 2, 3, or 6 */}
                                        {invoice.status != 2 && invoice.status != 3 && invoice.status != 6 ? (
                                          <select className="react-select__control" name="invoiceActions" value={invoiceActions[invoice.id] || ''} onChange={(e) => handleInvoiceActionChange(e, invoice.id)}>
                                            <option value="">Action</option>
                                              {/* Conditionally render options based on invoice status */}
                                                {invoice.status == 1 || invoice.status == 5 ? (
                                                  <>
                                                    <option
                                                      value="2"
                                                      data-id={invoice.id}
                                                      invoice-type={invoice.invoice_type}
                                                      invoice-date={invoice.invoice_date}
                                                      invoice-amount={invoice.total_amount}
                                                    >
                                                      Paid
                                                    </option>
                                                    <option
                                                      value="3"
                                                      data-id={invoice.id}
                                                    >
                                                      Void
                                                    </option>
                                                    <option
                                                      value="6"
                                                      data-id={invoice.id}
                                                      invoice-type={invoice.invoice_type}
                                                      invoice-date={invoice.invoice_date}
                                                      invoice-amount={invoice.total_amount}
                                                    >
                                                      Payment in process
                                                    </option>
                                                    <option
                                                      value="17"
                                                      data-id={invoice.id}
                                                      invoice-type={invoice.invoice_type}
                                                      invoice-date={invoice.invoice_date}
                                                      invoice-amount={invoice.total_amount}
                                                    >
                                                      Partially paid
                                                    </option>
                                                    <option
                                                      value="share_invoice_link"
                                                      data-id={invoice.id}
                                                      invoice-type={invoice.invoice_type}
                                                      invoice-date={invoice.invoice_date}
                                                      invoice-amount={invoice.total_amount}
                                                      invoice-url={invoice.invoice_url}
                                                    >
                                                      Share Invoice link
                                                    </option>
                                                  </>
                                                ) : null}

                                                {/* Condition for status 17 (Partially paid) */}
                                                {invoice.status == 17 ? (
                                                  <>
                                                    <option
                                                      value="17"
                                                      data-id={invoice.id}
                                                      invoice-type={invoice.invoice_type}
                                                      invoice-date={invoice.invoice_date}
                                                      invoice-amount={invoice.total_amount}
                                                    >
                                                      Partially paid
                                                    </option>
                                                  </>
                                                ) : null}

                                        </select>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>

                                <div className="col-md-8 text-left">
                                  <div className="lead_des">
                                    <p><b>Invoice Amount:</b> ${invoice.total_amount}</p>
                                    <p><b>Invoice Sent Date:</b> {invoice.invoice_date}</p>
                                    <p><b>Invoice Due Date:</b> {invoice.due_date}</p>
                                    <p><b>Service Name:</b> {invoice.product_names}</p>
                                    <p><b>Created By: </b> {invoice.created_user}</p>
                                  </div>
                                </div>

                                <div className="col-md-4">
                                  <div className="lead_des">
                                    <p><b>Payment Date:</b> {invoice.formatted_payment_date || 'N/A'}</p>
                                    <p><b>Payment Cleared Date:</b> {invoice.formatted_payment_cleared_date || 'N/A'}</p>
                                    <p><b>Payment Mode:</b> {invoice.payment_mode_string || 'N/A'}</p>
                                  </div>
                                </div>

                                {invoice.status == 17 || (invoice.status == 2 && invoice.payment_count > 1) ? (
                                  <a className="expand_pp_div" data-bs-toggle="collapse" href={`#invoice_pp_${invoice.id}`}
                                    aria-expanded="false" aria-controls={`invoice_pp_${invoice.id}`}>
                                    Payment History
                                    <i className="fa-solid fa-chevron-down ms-1" style={{fontWeight: 700}}></i>
                                  </a>
                                ) : null}

                                <div className="collapse" id={`invoice_pp_${invoice.id}`}>
                                  <div className="card card-body" style={{ maxWidth: '100%', padding: '10px' }}>
                                    <div className="row">
                                      <div className="table-responsive view-partially">
                                        <table className="table">
                                          <thead>
                                            <tr>
                                              <th>Reference ID</th>
                                              <th>Payment Date</th>
                                              <th>Cleared Date</th>
                                              <th>Payment Mode</th>
                                              <th>Note</th>
                                              <th>Payment Received</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                          {invoice.payment_history && invoice.payment_history.formatted_payment_history && invoice.payment_history.formatted_payment_history.length > 0 ? (
                                              invoice.payment_history.formatted_payment_history.map((payment, idx) => (
                                                <tr className="ppamt" key={`payment-${invoice.id}-${idx}`}>
                                                  <td>{payment.payment_id || '-'}</td>
                                                  <td>{payment.payment_date || '-'}</td>
                                                  <td>{payment.payment_cleared_date || '-'}</td>
                                                  <td>{payment.payment_mode || '-'}</td>
                                                  <td>{payment.payment_note || ''}</td>
                                                  <td className="ramt">${payment.received_amt || '0.00'}</td>
                                                </tr>
                                              ))
                                            ) : (
                                              <tr>
                                                <td colSpan="6" className="text-center">No payment history available</td>
                                              </tr>
                                            )}

                                          </tbody>
                                        </table>
                                      </div>
                                    </div>

                                    <div className="row m-0">
                                      <div className="total-payment-invoice">
                                        <h4>Total Partial Payment Amount</h4>
                                        <p >${invoice.total_received || '0.00'}</p>
                                      </div>
                                      <div className="total-payment-invoice">
                                        <h4>Overdue Amount</h4>
                                        <p >${invoice.overdue_amount || '0.00'}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}



                  {/* Audit Logs Tab Content */}
                  {activeTab === 'auditLogs' && (
                    <div className="mb-4 left-section-container">
                      <h5 className="section-title">Audit Logs</h5>

                      {auditLogsLoading ? (
                        <div className="text-center my-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2">Loading audit logs...</p>
                        </div>
                      ) : auditLogsError ? (
                        <div className="alert alert-warning" role="alert">
                          {auditLogsError}
                          <button
                            className="btn btn-sm btn-primary ms-3"
                            onClick={fetchProjectAuditLogs}
                          >
                            Retry
                          </button>
                        </div>
                      ) : (
                        <div className="audit-logs-container">

                          {/* Project Fields Table */}
                          <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="section-subtitle mb-0">Project Fields</h6>
                              <div className="search-box" style={{ width: '300px' }}>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Search project fields..."
                                  value={auditLogsSearch.project_fields}
                                  onChange={(e) => handleAuditLogsSearch('project_fields', e.target.value)}
                                />
                              </div>
                            </div>
                            {(() => {
                              const filteredData = filterAndSortAuditData(auditLogsData.project_fields, 'project_fields');
                              const paginatedData = getPaginatedData(filteredData, 'project_fields');

                              return filteredData.length > 0 ? (
                                <>
                                  <div className="table-responsive">
                                    <table className="table table-striped table-hover">
                                      <thead>
                                        <tr>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('project_fields', 'fieldname')}
                                          >
                                            Field Name {renderSortIcon('project_fields', 'fieldname')}
                                          </th>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('project_fields', 'from')}
                                          >
                                            From {renderSortIcon('project_fields', 'from')}
                                          </th>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('project_fields', 'to')}
                                          >
                                            To {renderSortIcon('project_fields', 'to')}
                                          </th>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('project_fields', 'change_date')}
                                          >
                                            Changed On {renderSortIcon('project_fields', 'change_date')}
                                          </th>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('project_fields', 'changed_by')}
                                          >
                                            Changed By {renderSortIcon('project_fields', 'changed_by')}
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {paginatedData.map((record, index) => (
                                          <tr key={index}>
                                            <td>{record.fieldname || 'N/A'}</td>
                                            <td>{record.from || 'N/A'}</td>
                                            <td>{record.to || 'N/A'}</td>
                                            <td>{formatAuditDate(record.change_date)}</td>
                                            <td>{record.changed_by || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  {renderPaginationControls(filteredData, 'project_fields')}
                                </>
                              ) : (
                                <div className="alert alert-info">
                                  {auditLogsSearch.project_fields ? 'No project field records match your search.' : 'No project field audit records found.'}
                                </div>
                              );
                            })()}
                          </div>

                          {/* Milestone & Stage Table */}
                          <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="section-subtitle mb-0">Milestone & Stage</h6>
                              <div className="search-box" style={{ width: '300px' }}>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Search milestone & stage..."
                                  value={auditLogsSearch.milestone_stage}
                                  onChange={(e) => handleAuditLogsSearch('milestone_stage', e.target.value)}
                                />
                              </div>
                            </div>
                            {(() => {
                              const filteredData = filterAndSortAuditData(auditLogsData.milestone_stage, 'milestone_stage');
                              const paginatedData = getPaginatedData(filteredData, 'milestone_stage');

                              return filteredData.length > 0 ? (
                                <>
                                  <div className="table-responsive">
                                    <table className="table table-striped table-hover">
                                      <thead>
                                        <tr>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('milestone_stage', 'from_milestone_name')}
                                          >
                                            From Milestone {renderSortIcon('milestone_stage', 'from_milestone_name')}
                                          </th>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('milestone_stage', 'milestone_name')}
                                          >
                                            To Milestone {renderSortIcon('milestone_stage', 'milestone_name')}
                                          </th>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('milestone_stage', 'from_stage_name')}
                                          >
                                            From Stage {renderSortIcon('milestone_stage', 'from_stage_name')}
                                          </th>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('milestone_stage', 'stage_name')}
                                          >
                                            To Stage {renderSortIcon('milestone_stage', 'stage_name')}
                                          </th>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('milestone_stage', 'change_date')}
                                          >
                                            Changed On {renderSortIcon('milestone_stage', 'change_date')}
                                          </th>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('milestone_stage', 'changed_by')}
                                          >
                                            Changed By {renderSortIcon('milestone_stage', 'changed_by')}
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {paginatedData.map((record, index) => (
                                          <tr key={index}>
                                            <td>{record.from_milestone_name || 'N/A'}</td>
                                            <td>{record.milestone_name || 'N/A'}</td>
                                            <td>{record.from_stage_name || 'N/A'}</td>
                                            <td>{record.stage_name || 'N/A'}</td>
                                            <td>{formatAuditDate(record.change_date)}</td>
                                            <td>{record.changed_by || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  {renderPaginationControls(filteredData, 'milestone_stage')}
                                </>
                              ) : (
                                <div className="alert alert-info">
                                  {auditLogsSearch.milestone_stage ? 'No milestone & stage records match your search.' : 'No milestone & stage audit records found.'}
                                </div>
                              );
                            })()}
                          </div>

                          {/* Invoice Changes Table */}
                          <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="section-subtitle mb-0">Invoice Changes</h6>
                              <div className="search-box" style={{ width: '300px' }}>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Search invoice changes..."
                                  value={auditLogsSearch.invoices}
                                  onChange={(e) => handleAuditLogsSearch('invoices', e.target.value)}
                                />
                              </div>
                            </div>
                            {(() => {
                              const filteredData = filterAndSortAuditData(auditLogsData.invoices, 'invoices');
                              const paginatedData = getPaginatedData(filteredData, 'invoices');

                              return filteredData.length > 0 ? (
                                <>
                                  <div className="table-responsive">
                                    <table className="table table-striped table-hover">
                                      <thead>
                                        <tr>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('invoices', 'customer_invoice_no')}
                                          >
                                            Invoice No {renderSortIcon('invoices', 'customer_invoice_no')}
                                          </th>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('invoices', 'fieldname')}
                                          >
                                            Field Name {renderSortIcon('invoices', 'fieldname')}
                                          </th>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('invoices', 'from')}
                                          >
                                            From Value {renderSortIcon('invoices', 'from')}
                                          </th>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('invoices', 'to')}
                                          >
                                            To Value {renderSortIcon('invoices', 'to')}
                                          </th>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('invoices', 'changed_date')}
                                          >
                                            Changed On {renderSortIcon('invoices', 'changed_date')}
                                          </th>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('invoices', 'changed_by')}
                                          >
                                            Changed By {renderSortIcon('invoices', 'changed_by')}
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {paginatedData.map((record, index) => (
                                          <tr key={index}>
                                            <td>{record.customer_invoice_no || 'N/A'}</td>
                                            <td>{record.fieldname || 'N/A'}</td>
                                            <td>{record.from || 'N/A'}</td>
                                            <td>{record.to || 'N/A'}</td>
                                            <td>{formatAuditDate(record.changed_date)}</td>
                                            <td>{record.changed_by || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  {renderPaginationControls(filteredData, 'invoices')}
                                </>
                              ) : (
                                <div className="alert alert-info">
                                  {auditLogsSearch.invoices ? 'No invoice records match your search.' : 'No invoice audit records found.'}
                                </div>
                              );
                            })()}
                          </div>

                          {/* Business Audit Log Table */}
                          <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="section-subtitle mb-0">Business Audit Log</h6>
                              <div className="search-box" style={{ width: '300px' }}>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Search business audit log..."
                                  value={auditLogsSearch.business_audit_log}
                                  onChange={(e) => handleAuditLogsSearch('business_audit_log', e.target.value)}
                                />
                              </div>
                            </div>
                            {(() => {
                              const filteredData = filterAndSortAuditData(auditLogsData.business_audit_log, 'business_audit_log');
                              const paginatedData = getPaginatedData(filteredData, 'business_audit_log');

                              return filteredData.length > 0 ? (
                                <>
                                  <div className="table-responsive">
                                    <table className="table table-striped table-hover">
                                      <thead>
                                        <tr>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('business_audit_log', 'fieldname')}
                                          >
                                            Field Name {renderSortIcon('business_audit_log', 'fieldname')}
                                          </th>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('business_audit_log', 'from')}
                                          >
                                            From Value {renderSortIcon('business_audit_log', 'from')}
                                          </th>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('business_audit_log', 'to')}
                                          >
                                            To Value {renderSortIcon('business_audit_log', 'to')}
                                          </th>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('business_audit_log', 'note')}
                                          >
                                            Note {renderSortIcon('business_audit_log', 'note')}
                                          </th>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('business_audit_log', 'change_date')}
                                          >
                                            Changed On {renderSortIcon('business_audit_log', 'change_date')}
                                          </th>
                                          <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleAuditLogsSorting('business_audit_log', 'changed_by')}
                                          >
                                            Changed By {renderSortIcon('business_audit_log', 'changed_by')}
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {paginatedData.map((record, index) => (
                                          <tr key={index}>
                                            <td>{record.fieldname || 'N/A'}</td>
                                            <td>{record.from || 'N/A'}</td>
                                            <td>{record.to || 'N/A'}</td>
                                            <td>{record.note || 'N/A'}</td>
                                            <td>{formatAuditDate(record.change_date)}</td>
                                            <td>{record.changed_by || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  {renderPaginationControls(filteredData, 'business_audit_log')}
                                </>
                              ) : (
                                <div className="alert alert-info">
                                  {auditLogsSearch.business_audit_log ? 'No business audit records match your search.' : 'No business audit records found.'}
                                </div>
                              );
                            })()}
                          </div>

                        </div>
                      )}
                    </div>
                  )}

                  {activeTab !== 'documents' ? (
                      <div className="mt-4">
                        <div className="action-buttons d-flex align-items-center justify-content-center">
                          <button
                            className="btn save-btn"
                            onClick={handleSubmit(handleUpdateProject)}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Updating...
                              </>
                            ) : 'Update'}
                          </button>
                        </div>
                        {updateSuccess && (
                          <div className="alert alert-success mt-3" role="alert">
                            <strong><i className="fas fa-check-circle me-2"></i>Project updated successfully!</strong>
                            <p className="mb-0 mt-1">Your changes have been submitted.</p>
                          </div>
                        )}
                        {updateError && (
                          <div className="alert alert-danger mt-3" role="alert">
                            <strong><i className="fas fa-exclamation-circle me-2"></i>Error updating project!</strong>
                            <p className="mb-0 mt-1">{updateError}</p>
                          </div>
                        )}
                      </div>
                  ) : null}

                </div>

                {/* Right Side Section - Same for all tabs */}
                <div className="col-md-3">

                  <div className="card mb-4 p-2">
                    <div className="card-body p-2">


                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title mb-0">Milestone & Stage:</h5>
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
                          <span className="fw-medium" style={{ color: '#0000cc' }}>{milestone ? milestone.label : 'No milestone selected'}</span>
                        </div>
                      ) : (
                        <div className="milestone-edit mb-4">
                          <div className="form-group mb-3">
                            <Select
                              value={milestone}
                              onChange={handleMilestoneChange}
                              options={milestones}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              isLoading={isLoadingMilestones}
                              placeholder="Select Milestone"
                              noOptionsMessage={() => "No milestones available"}
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
                          <span className="fw-medium" style={{ color: '#0000cc' }}>{projectStage ? projectStage.label : 'No stage selected'}</span>
                        </div>
                      ) : (
                        <div className="stage-edit mb-4">
                          <div className="form-group mb-3">
                            <Select
                              value={projectStage}
                              onChange={handleProjectStageChange}
                              options={milestoneStages}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              isLoading={isLoadingStages}
                              placeholder={milestone ? "Select Stage" : "Select a milestone first"}
                              noOptionsMessage={() => milestone ? "No stages available for this milestone" : "Select a milestone first"}
                              isDisabled={!milestone || milestones.length === 0}
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
                            onClick={saveMilestoneAndStage}
                            disabled={!milestone || !projectStage || isLoadingMilestones || isLoadingStages}
                            style={{
                              backgroundColor: 'white',
                              color: '#ff6a00',
                              border: '1px solid #ff6a00',
                              borderRadius: '20px',
                              padding: '5px 25px'
                            }}
                          >
                            {isLoadingMilestones ? 'Updating...' : 'Update'}
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => setIsEditing(false)}
                            disabled={isLoadingMilestones || isLoadingStages}
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
                      <h5 className="card-title">Assigned Collaborators:</h5>

                      {/* Display assigned collaborators above the dropdown */}
                      <div className="assigned-users-list mb-4">
                        {currentCollaborators.length === 0 ? (
                          <p className="text-muted small">No collaborators assigned yet.</p>
                        ) : (
                          <div className="assigned-users-tags">
                            {currentCollaborators.map(collaborator => (
                              <div key={collaborator.collaborators_name_id} className="assigned-user-tag">
                                <span className="user-name">{collaborator.collaborators_name}</span>
                                <button
                                  className="remove-tag-btn"
                                  onClick={() => handleRemoveCollaborator(collaborator.collaborators_name_id)}
                                  aria-label="Remove collaborator"
                                  disabled={collaboratorLoading}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Select dropdown for collaborator assignment */}
                      <div className="form-group mb-3">
                        <label htmlFor="collaboratorSelect" className="form-label">Add Collaborator:</label>
                        <Select
                          id="collaboratorSelect"
                          value={selectedCollaborator}
                          onChange={handleCollaboratorChange}
                          options={collaboratorOptions.filter(option =>
                            !currentCollaborators.some(collaborator =>
                              collaborator.collaborators_name_id === option.collaborator.id
                            )
                          )}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          placeholder="Select collaborator to assign..."
                          isClearable
                          isSearchable
                          isLoading={collaboratorLoading}
                          noOptionsMessage={({ inputValue }) =>
                            inputValue && inputValue.length > 0
                              ? "No matching collaborators found"
                              : collaboratorOptions.length === currentCollaborators.length
                                ? "All collaborators have been assigned"
                                : "No collaborators available"
                          }
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

                      {/* Assign collaborator button */}
                      <button
                        className="btn assign-user-btn w-100"
                        onClick={handleAssignCollaborator}
                        disabled={!selectedCollaborator || collaboratorLoading}
                      >
                        {collaboratorLoading ? 'Assigning...' : 'Assign Collaborator'}
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
                              options={ownerOptions}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              isLoading={ownerLoading}
                              isDisabled={ownerLoading}
                              isClearable
                              isSearchable
                              placeholder={ownerLoading ? "Loading owners..." : "Search or select owner..."}
                              noOptionsMessage={() => "No matching owners found"}
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
                          <div className="d-flex justify-content-between mt-3">
                            <button
                              className="btn btn-sm"
                              onClick={saveOwner}
                              disabled={ownerLoading}
                              style={{
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '5px 25px'
                              }}
                            >
                              {ownerLoading ? 'Updating...' : 'Update'}
                            </button>
                            <button
                              className="btn btn-sm"
                              onClick={() => setIsEditingOwner(false)}
                              disabled={ownerLoading}
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
                              options={contactOptions}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              isLoading={contactLoading}
                              isDisabled={contactLoading}
                              isClearable
                              isSearchable
                              placeholder={contactLoading ? "Loading contacts..." : "Search or select contact..."}
                              noOptionsMessage={() => "No matching contacts found"}
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
                          <div className="d-flex justify-content-between mt-3">
                            <button
                              className="btn btn-sm"
                              onClick={saveContact}
                              disabled={contactLoading}
                              style={{
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '5px 25px'
                              }}
                            >
                              {contactLoading ? 'Updating...' : 'Update'}
                            </button>
                            <button
                              className="btn btn-sm"
                              onClick={() => setIsEditingContact(false)}
                              disabled={contactLoading}
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
