import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './common/ReportStyle.css';
import './LeadDetail.css'; // Reusing the same CSS
import './DocumentTable.css'; // Document table styling
import Notes from './common/Notes';
import { getAssetPath, getUserId } from '../utils/assetUtils';
import Swal from 'sweetalert2';
import Modal from './common/Modal';

import ProjectTab from './tabs/ProjectTab';
import FulfilmentTab from './tabs/FulfilmentTab';
import BankInfoTab from './tabs/BankInfoTab';
import IntakeTab from './tabs/IntakeTab';
import FeesTab from './tabs/FeesTab';
import DocumentsTab from './tabs/DocumentsTab';
import InvoicesTab from './tabs/InvoicesTab';
import AuditLogsTab from './tabs/AuditLogsTab';
import ProjectSidebar from './ProjectSidebar';

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

// Custom DateInput component
const DateInput = ({ value, onChange, placeholder = "MM/DD/YYYY", className = "form-control", ...props }) => {
  const [selectedDate, setSelectedDate] = useState(parseDateFromMMDDYYYY(value));

  useEffect(() => {
    setSelectedDate(parseDateFromMMDDYYYY(value));
  }, [value]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const formattedDate = date ? formatDateToMMDDYYYY(date) : '';
    onChange(formattedDate);
  };

  return (
    <DatePicker
      selected={selectedDate}
      onChange={handleDateChange}
      dateFormat="MM/dd/yyyy"
      placeholderText={placeholder}
      className={className}
      autoComplete="off"
      showPopperArrow={false}
      popperClassName="custom-datepicker-popper"
      {...props}
    />
  );
};

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
  const [isProjectDetailssData, setIsProjectDetailssData] = useState(false);
  const [isBankInfoData, setIsBankInfoData] = useState(false);
  const [isIntakeData, setIsIntakeData] = useState(false);
  const [isFeesData, setIsFeesData] = useState(false);
  const [isFulFilmentData, setIsFulFilmentData] = useState(false);
  const [isAuditData, setIsAuditData] = useState(false);
  const [isCompanyDocData, setIsCompanyDocData] = useState(false);
  const [isERCDocData, setIsERCDocData] = useState(false);
  const [isOtherDocData, setIsOtherDocData] = useState(false);
  const [isPayrollDocData, setIsPayrollDocData] = useState(false);
  const [isSTCRDocData, setIsSTCRDocData] = useState(false);
  const [isSTCIDocData, setIsSTCIDocData] = useState(false);

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
    avg_emp_count_2019: '',
    fee_type: '',
    custom_fee: '',
    eligible_quarters: '',
    welcome_email: '',
    retainer_invoice_no: '',
    retainer_payment_date: '',
    retainer_payment_cleared: '',
    retainer_payment_returned: '',
    retpayment_return_reason: '',
    retainer_refund_date: '',
    retainer_refund_amount: '',
    retainer_payment_amount: '',
    retainer_payment_type: '',
    bal_retainer_invoice_no: '',
    bal_retainer_sent_date: '',
    bal_retainer_pay_date: '',
    bal_retainer_clear_date: '',
    bal_retainer_return_date: '',
    bal_retainer_return_reaso: '',
    interest_percentage: '',
    net_no: '',
    coi_aoi: '',
    voided_check: '',
    '2019_tax_return': '',
    '2020_tax_return': '',
    '2021_financials': '',
    '2020_q1_941': '',
    '2020_q2_941': '',
    '2020_q3_941': '',
    '2020_q4_941': '',
    '2021_q1_941': '',
    '2021_q2_941': '',
    '2021_q3_941': '',
    '2020_q1_payroll': '',
    '2020_q2_payroll': '',
    '2020_q3_payroll': '',
    '2020_q4_payroll': '',
    '2021_q1_payroll': '',
    '2021_q2_payroll': '',
    '2021_q3_payroll': '',
    '2021_q4_payroll': '',
    'f911_status':'',
    'ppp_1_applied': '',
    'ppp_1_date': '',
    'ppp_1_forgiveness_applied': '',
    'ppp_1_forgive_app_date': '',
    'ppp_1_amount': '',
    'ppp_1_wages_allocated': '',
    'ppp_2_applied': '',
    'ppp_2_date': '',
    'ppp_2_forgiveness_applied': '',
    'ppp_2_forgive_app_date': '',
    ppp_2_amount: '',
    ppp_2_wages_allocated: '',
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
    total_erc_fees: '',
    legal_fees: '',
    total_erc_fees_paid: '',
    total_erc_fees_pending: '',
    total_occams_share: '',
    total_aff_ref_share: '',
    retain_occams_share: '',
    retain_aff_ref_share: '',
    bal_retain_occams_share: '',
    bal_retain_aff_ref_share: '',
    total_occams_share_paid: '',
    total_aff_ref_share_paid: '',
    total_occams_share_pendin: '',
    total_aff_ref_share_pend: '',
    q1_2020_max_erc_amount: '',
    q2_2020_max_erc_amount: '',
    q3_2020_max_erc_amount: '',
    q4_2020_max_erc_amount: '',
    q1_2021_max_erc_amount: '',
    q2_2021_max_erc_amount: '',
    q3_2021_max_erc_amount: '',
    q4_2021_max_erc_amount: '',
    // ERC Filed Quarter wise 2020 fields
    q1_2020_filed_status: '',
    q1_2020_filed_date: '',
    q1_2020_amount_filed: '',
    q1_2020_benefits: '',
    q1_2020_eligibility_basis: 'N/A',
    q2_2020_filed_status: '',
    q2_2020_filed_date: '',
    q2_2020_amount_filed: '',
    q2_2020_benefits: '',
    q2_2020_eligibility_basis: 'N/A',
    q3_2020_filed_status: '',
    q3_2020_filed_date: '',
    q3_2020_amount_filed: '',
    q3_2020_benefits: '',
    q3_2020_eligibility_basis: 'N/A',
    q4_2020_filed_status: '',
    q4_2020_filed_date: '',
    q4_2020_amount_filed: '',
    q4_2020_benefits: '',
    q4_2020_eligibility_basis: 'N/A',
    // ERC Filed Quarter wise 2021 fields
    q1_2021_filed_status: '',
    q1_2021_filed_date: '',
    q1_2021_amount_filed: '',
    q1_2021_benefits: '',
    q1_2021_eligibility_basis: 'N/A',
    q2_2021_filed_status: '',
    q2_2021_filed_date: '',
    q2_2021_amount_filed: '',
    q2_2021_benefits: '',
    q2_2021_eligibility_basis: 'N/A',
    q3_2021_filed_status: '',
    q3_2021_filed_date: '',
    q3_2021_amount_filed: '',
    q3_2021_benefits: '',
    q3_2021_eligibility_basis: 'N/A',
    q4_2021_filed_status: '',
    q4_2021_filed_date: '',
    q4_2021_amount_filed: '',
    q4_2021_benefits: '',
    q4_2021_eligibility_basis: 'N/A',
    // ERC Letter, Check & Amount 2020 fields
    q1_2020_loop: '',
    q1_2020_letter: '',
    q1_2020_check: '',
    q1_2020_chq_amt: '',
    q2_2020_loop: '',
    q2_2020_letter: '',
    q2_2020_check: '',
    q2_2020_chq_amt: '',
    q3_2020_loop: '',
    q3_2020_letter: '',
    q3_2020_check: '',
    q3_2020_chq_amt: '',
    q4_2020_loop: '',
    q4_2020_letter: '',
    q4_2020_check: '',
    q4_2020_chq_amt: '',
    // ERC Letter, Check & Amount 2021 fields
    q1_2021_loop: '',
    q1_2021_letter: '',
    q1_2021_check: '',
    q1_2021_chq_amt: '',
    q2_2021_loop: '',
    q2_2021_letter: '',
    q2_2021_check: '',
    q2_2021_chq_amt: '',
    q3_2021_loop: '',
    q3_2021_letter: '',
    q3_2021_check: '',
    q3_2021_chq_amt: '',
    q4_2021_loop: '',
    q4_2021_letter: '',
    q4_2021_check: '',
    q4_2021_chq_amt: '',
    // Success Fee Invoice Details - I Invoice
    i_invoice_no: '',
    i_invoice_amount: '',
    i_invoiced_qtrs: '',
    i_invoice_sent_date: '',
    i_invoice_payment_type: '',
    i_invoice_payment_date: '',
    i_invoice_pay_cleared: '',
    i_invoice_pay_returned: '',
    i_invoice_return_reason: '',
    i_invoice_occams_share: '',
    i_invoice_aff_ref_share: '',
    // Success Fee Invoice Details - II Invoice
    ii_invoice_no: '',
    ii_invoice_amount: '',
    ii_invoiced_qtrs: '',
    ii_invoice_sent_date: '',
    ii_invoice_payment_type: '',
    ii_invoice_payment_date: '',
    ii_invoice_pay_cleared: '',
    ii_invoice_pay_returned: '',
    ii_invoice_return_reason: '',
    ii_invoice_occams_share: '',
    ii_invoice_aff_ref_share: '',
    // Success Fee Invoice Details - III Invoice
    iii_invoice_no: '',
    iii_invoice_amount: '',
    iii_invoiced_qtrs: '',
    iii_invoice_sent_date: '',
    iii_invoice_payment_type: '',
    iii_invoice_payment_date: '',
    iii_invoice_pay_cleared: '',
    iii_invoice_pay_returned: '',
    iii_invoice_return_reason: '',
    iii_invoice_occams_share: '',
    iii_invoice_aff_ref_share: '',
    // Success Fee Invoice Details - IV Invoice
    iv_invoice_no: '',
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
        setIsERCDocData(true);
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
        setIsCompanyDocData(true);
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
        setIsOtherDocData(true);
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
        setIsPayrollDocData(true);
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
        setIsSTCRDocData(true);
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
        setIsSTCIDocData(true);
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
     //console.log(invoiceActions);
   }, [invoiceActions]);  // The effect runs whenever invoiceActions is updated

   // Handle the change event when an action is selected
   const handleInvoiceActionChange = (e, invoiceId) => {
     const { value } = e.target;

     // Use the previous state to ensure the update is done properly
     setInvoiceActions(prev => {
       const updatedActions = { ...prev, [invoiceId]: value };
       //console.log(`Invoice ${invoiceId} action changed to: ${value}`);
       return updatedActions;
     });
   };

  // API data for milestones and stages
  const [milestones, setMilestones] = useState([]);
  const [milestoneStages, setMilestoneStages] = useState([]);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);
  const [isLoadingStages, setIsLoadingStages] = useState(false);
  // const [selectedProductId] = useState('935'); // Default to ERC


  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);

  // State for update process
  const [isUpdating, setIsUpdating] = useState(false);

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
    //console.log('ProjectDetail component mounted, fetching project details for ID:', projectId);
    //console.log('Project ID type:', typeof projectId);
    fetchProjectDetails();
    // fetchBankInfo();
    // fetchIntakeInfo();
    // fetchFeesInfo();
    // fetchFulfilmentInfo();
    //console.log('Initial useEffect - Fetching milestones for product ID 936');
    // fetchMilestones();
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
      // fetchERCDocuments(projectId, 3);
      // fetchCompanyDocuments(projectId, 1);
      // fetchOtherDocuments(projectId, 4);
      // fetchPayrollDocuments(projectId);

      // fetchSTCRequiredDocuments(projectId);
      // fetchSTCImpactedDays(projectId);
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

        //console.log('STCDocumentTable data:', stc_documents_groups);

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
                                        <th>Tax Returns - 1040 (Mandatory)</th>
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
      
      // First fetch the specific milestone and stage for this project
      // setTimeout(() => {
        fetchProjectMilestoneAndStage();
      // }, 3000);
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
      // const [selectedProductId] = useState(productId);
      
      const selectedProductId = productId;

      // Then fetch all available milestones for the dropdown
      // We'll do this with a slight delay to ensure the specific milestone is set first
      setTimeout(() => {
        fetchAllMilestones(selectedProductId);
      }, 400);

      fetchMilestones(selectedProductId);
      //console.log(`Tab visibility check: Product ID ${productId}, Active Tab: ${activeTab}`);

      // Check if current active tab should be hidden for this product
      const shouldHideBankInfo = (productId === '937' || productId === '932') && activeTab === 'bankInfo';
      const shouldHideIntake = (productId === '937' || productId === '932') && activeTab === 'intake';
      const shouldHideFees = (productId === '937' || productId === '932') && activeTab === 'fees';
      const shouldHideDocuments = productId === '932' && activeTab === 'documents';

      //console.log(`Tab visibility: BankInfo hidden: ${productId === '937' || productId === '932'}, Intake hidden: ${productId === '937' || productId === '932'}, Fees hidden: ${productId === '937' || productId === '932'}, Documents hidden: ${productId === '932'}`);

      // If current tab should be hidden, switch to project tab
      if (shouldHideBankInfo || shouldHideIntake || shouldHideFees || shouldHideDocuments) {
        //console.log(`Switching from hidden tab ${activeTab} to project tab for product ID ${productId}`);
        setActiveTab('project');
      }
    }
  }, [project, activeTab]);


  // Update folder links based on product ID and API response
  useEffect(() => {
    if (project) {
      //console.log('Project data for folder links:', project);
      //console.log('Product ID for folder links:', project.product_id);

      // Log folder links from API
      //console.log('Company folder link from API:', project.company_folder_link);
      //console.log('ERC document folder from API:', project.erc_document_folder);
      //console.log('STC document folder from API:', project.stc_document_folder);
      //console.log('Agreement folder from API:', project.agreement_folder);

      if (project.product_id === "935") {
        // ERC product
        //console.log('Setting ERC folder links');
        // Use API values if available, otherwise use default values
        setCompanyFolderLink(project.company_folder_link || '');
        setDocumentFolderLink(project.erc_document_folder || '');
      } else if (project.product_id === "937") {
        // STC product
        //console.log('Setting STC folder links');
        // Use API values if available, otherwise use default values
        setCompanyFolderLink(project.agreement_folder || '');
        setDocumentFolderLink(project.stc_document_folder || '');
      } else {
        //console.log('Product ID not recognized:', project.product_id);
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
      //console.log('Fetching collaborators for project ID:', projectId);
      setCollaboratorLoading(true);

      const response = await axios.get(`https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-collaborators?project_id=${projectId}`);

      //console.log('Collaborators API response:', response);

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
          label: collaborator.display_name,
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
      //console.log('Fetching owners for project ID:', projectId);
      setOwnerLoading(true);

      const response = await axios.get(`https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-owners?project_id=${projectId}`);

      //console.log('Owners API response:', response);

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
      //console.log('Fetching contacts for project ID:', projectId, 'and lead ID:', project?.lead_id);
      setContactLoading(true);

      const response = await axios.get(`https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-contacts?project_id=${projectId}&lead_id=${project?.lead_id}`);

      //console.log('Contacts API response:', response);

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
      //console.log('Fetching milestone and stage for project ID:', projectId);
      setIsLoadingMilestones(true);

      const response = await axios.get(`https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-milestones?project_id=${projectId}`);

      //console.log('Milestone API response:', response);

      if (response.data && response.data.status === 1) {
        //console.log('Milestone data received:', response.data);

        // Set milestone
        if (response.data.milestone_id && response.data.milestone_name) {
          const milestoneData = {
            value: response.data.milestone_id,
            label: response.data.milestone_name
          };
           setMilestone(milestoneData);
          //console.log('Setting milestone:', milestoneData);
          fetchMilestoneStages(response.data.milestone_id, true);
        }

        // Set stage
        if (response.data.milestone_stage_id && response.data.milestone_stage_name) {
          const stageData = {
            value: response.data.milestone_stage_id,
            label: response.data.milestone_stage_name
          };
           setProjectStage(stageData);
          //console.log('Setting stage:', stageData);

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
  const fetchAllMilestones = async (selectedProductId) => {
    try {
      //console.log('Fetching all available milestones');

      // Build the API URL with the product_id parameter
      const apiUrl = `https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/milestones?type=project&product_id=${selectedProductId}`;
      //console.log('All milestones API URL:', apiUrl);

      // Make the API call
      const response = await axios.get(apiUrl);
      //console.log('All milestones API response:', response.data);

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
        // if (formattedMilestones.length > 0) {
        //   //console.log('Setting all available milestones:', formattedMilestones);

        //   // Preserve the currently selected milestone
        //   const currentMilestone = milestone;

        //   // Update the milestones array with all available options
        //   setMilestones(formattedMilestones);

        //   // Make sure the current milestone is still selected
        //   if (currentMilestone) {
        //     setMilestone(currentMilestone);
        //   }
        // }
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
        //console.log('Using passed project data:', passedProjectData);
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
        //console.log('No passed data, fetching from API');

        try {
          // Make a POST request to the project info API
          const projectIdToUse = projectId || "1700";
          //console.log('Making API request with project_id:', projectIdToUse);

          //console.log('Sending API request to:', 'http://localhost:3002/products-api/get-project-info');
          //console.log('Request body:', JSON.stringify({ project_id: projectIdToUse }));

          let response;
          try {
            
            // First try the proxy server
            response = await fetch('https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-project-info', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ project_id: projectIdToUse }),
              mode: 'cors',
              credentials: 'same-origin',
            });

            console.log('API response status:', response.text);

            // Check if response is ok
            if (!response.ok) {
              throw new Error(`API request failed with status ${response.status}`);
            }

            // Try to parse the response as JSON
            const responseText = await response.text();
            //console.log('API response text:', responseText);

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
              //console.log('Trying direct API request');
              response = await fetch('https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-project-info', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ project_id: projectIdToUse }),
                mode: 'cors',
              });

              //console.log('Direct API response status:', response.status);

              // Check if response is ok
              if (!response.ok) {
                throw new Error(`Direct API request failed with status ${response.status}`);
              }

              // Try to parse the response as JSON
              const responseText = await response.text();
              //console.log('Direct API response text:', responseText);

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
          //console.log('Project data from API:', data);

          if (data && (data.success || data.status === 1)) {
            // Map the API response to our project structure
            setIsProjectDetailssData(true);
            const projectData = data.data || data.result?.[0] || {};

            //console.log('Raw project data from API:', projectData);

            // Log all available fields in the API response
            //console.log('Available fields in API response:', Object.keys(projectData));

            // Check for lead ID field
            // console.log('Lead ID field:', {
            //   lead_id: projectData.lead_id,
            //   leadId: projectData.leadId,
            //   lead: projectData.lead
            // });

            // Check for folder link fields
            // console.log('Folder link fields:', {
            //   erc_document_folder: projectData.erc_document_folder,
            //   company_folder: projectData.company_folder,
            //   company_folder_link: projectData.company_folder_link
            // });

            // Check for document number related fields
            // console.log('Document number fields:', {
            //   document_number: projectData.document_number,
            //   identity_document_number: projectData.identity_document_number,
            //   document_id: projectData.document_id,
            //   id_number: projectData.id_number
            // });

            // Check for website and business entity type fields
            // console.log('Website and business entity type fields:', {
            //   website_url: projectData.website_url,
            //   business_website: projectData.business_website,
            //   company_website: projectData.company_website,
            //   business_type: projectData.business_type,
            //   business_entity_type: projectData.business_entity_type
            // });

            // Log the product_id from API
            //console.log('Product ID from API:', projectData.product_id);

            const mappedProject = {
              // Project details
              project_id: projectData.project_id || projectIdToUse,
              product_id: projectData.product_id || "",
              project_name: projectData.project_name || "",
              product_name: projectData.product_name || "",
              
              // Conditionally set project_fee based on product_id
              project_fee: projectData.product_id === "935" 
                ? (projectData.fee_type || "") 
                : (projectData.project_fee || ""),
              
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

            //console.log('Mapped project data:', mappedProject);
            //console.log('Website URL:', mappedProject.website_url);
            //console.log('Product ID:', mappedProject.product_id);
            //console.log('Project Fee:', mappedProject.project_fee); // Log the project fee for debugging
            setProject(mappedProject);
          } else {
            throw new Error('Invalid data received from API');
          }
        } catch (apiError) {
          console.error('Error fetching from API:', apiError);

          // Set a more user-friendly error message
          setError(`The API is currently experiencing issues. Using mock data instead. Error: ${apiError.message}`);

          // Fallback to mock data if API fails
          //console.log('Falling back to mock data');
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
            project_fee: projectId === "1700" ? "Retainer Fee @$90 Per EE + Success Fee @15%" : "",
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
    finally {
      setLoading(false);  // ✅ API complete hone ke baad loading false
    }
  };

  // Function to fetch bank information from the API
  const fetchBankInfo = async () => {
    //console.log('Fetching bank information for project IDs:', projectId);
    if (!projectId) return;

    setBankInfoLoading(true);
    setBankInfoError(null);

    try {
      //console.log('Fetching bank information for project ID:', projectId);

      // Make a POST request to the bank info API
      const response = await fetch('https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-bank-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project_id: projectId }),
      });

      //console.log('Bank info API response status:', response.status);

      if (!response.ok) {
        throw new Error(`Bank info API request failed with status ${response.status}`);
      }

      const data = await response.json();
      //console.log('Bank info data from API:', data);

      if (data && data.status === 1) {
        setIsBankInfoData(true);
        // Extract bank data from the response
        const bankData = data.result && Array.isArray(data.result) ? data.result[0] : data.result;

        //console.log('Bank data extracted from API response:', bankData);

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
            aba_routing_no: bankData.aba_routing_number || '',
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
    if (!projectId) return;

    setIntakeInfoLoading(true);
    setIntakeInfoError(null);

    try {
      //console.log('Fetching intake information for project ID:', projectId);

      // Make a POST request to the intake info API
      const response = await fetch('https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-project-intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project_id: projectId }),
      });

      //console.log('Intake info API response status:', response.status);

      if (!response.ok) {
        throw new Error(`Intake info API request failed with status ${response.status}`);
      }

      const data = await response.json();
      //console.log('Intake info data from API:', data);

      if (data && data.status === 1) {
        // Extract intake data from the response
        setIsIntakeData(true);
        const intakeData = data.result && Array.isArray(data.result) ? data.result[0] : data.result;

        //console.log('Intake data extracted from API response:', intakeData);

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
            avg_emp_count_2019: intakeData.avg_emp_count_2019 || '',
            fee_type: intakeData.fee_type || '',
            custom_fee: intakeData.custom_fee || '',
            eligible_quarters: intakeData.eligible_quarters || '',
            welcome_email: intakeData.welcome_email || '',
            retainer_invoice_no: intakeData.retainer_invoice_no || '',
            retainer_payment_date: intakeData.retainer_payment_date || '',
            retainer_payment_cleared: intakeData.retainer_payment_cleared || '',
            retainer_payment_returned: intakeData.retainer_payment_returned || '',
            retpayment_return_reason: intakeData.retpayment_return_reason || '',
            retainer_refund_date: intakeData.retainer_refund_date || '',
            retainer_refund_amount: intakeData.retainer_refund_amount || '',
            retainer_payment_amount: intakeData.retainer_payment_amount || '',
            retainer_payment_type: intakeData.retainer_payment_type || '',
            bal_retainer_invoice_no: intakeData.bal_retainer_invoice_no || '',
            bal_retainer_sent_date: intakeData.bal_retainer_sent_date || intakeData.bal_retainer_sent_date || '',
            bal_retainer_pay_date: intakeData.bal_retainer_pay_date || intakeData.bal_retainer_pay_date || '',
            bal_retainer_clear_date: intakeData.bal_retainer_clear_date || intakeData.bal_retainer_clear_date || '',
            bal_retainer_return_date: intakeData.bal_retainer_return_date || intakeData.bal_retainer_return_date || '',
            bal_retainer_return_reaso: intakeData.bal_retainer_return_reaso || '',
            interest_percentage: intakeData.interest_percentage || '',
            net_no: intakeData.net_no || '',
            coi_aoi: intakeData.coi_aoi || '',
            voided_check: intakeData.voided_check || '',
            '2019_tax_return': intakeData['2019_tax_return'] || '',
            '2020_tax_return': intakeData['2020_tax_return'] || '',
            '2021_financials': intakeData['2021_financials'] || '',
            '2020_q1_941': intakeData['2020_q1_941'] || '',
            '2020_q2_941': intakeData['2020_q2_941'] || '',
            '2020_q3_941': intakeData['2020_q3_941'] || '',
            '2020_q4_941': intakeData['2020_q4_941'] || '',
            '2021_q1_941': intakeData['2021_q1_941'] || '',
            '2021_q2_941': intakeData['2021_q2_941'] || '',
            '2021_q3_941': intakeData['2021_q3_941'] || '',
            '2020_q1_payroll': intakeData['2020_q1_payroll'] || '',
            '2020_q2_payroll': intakeData['2020_q2_payroll'] || '',
            '2020_q3_payroll': intakeData['2020_q3_payroll'] || '',
            '2020_q4_payroll': intakeData['2020_q4_payroll'] || '',
            '2021_q1_payroll': intakeData['2021_q1_payroll'] || '',
            '2021_q2_payroll': intakeData['2021_q2_payroll'] || '',
            '2021_q3_payroll': intakeData['2021_q3_payroll'] || '',
            '2021_q4_payroll': intakeData['2021_q4_payroll'] || '',
            f911_status: intakeData.f911_status || '',
            ppp_1_applied: intakeData.ppp_1_applied || '',
            ppp_1_date: intakeData.ppp_1_date || '',
            ppp_1_forgiveness_applied: intakeData.ppp_1_forgiveness_applied || '',
            ppp_1_forgive_app_date: intakeData.ppp_1_forgive_app_date || '',
            ppp_1_amount: intakeData.ppp_1_amount || '',
            ppp_1_wages_allocated: intakeData.ppp_1_wages_allocated || '',
            ppp_2_applied: intakeData.ppp_2_applied || '',
            ppp_2_date: intakeData.ppp_2_date || '',
            ppp_2_forgiveness_applied: intakeData.ppp_2_forgiveness_applied || '',
            ppp_2_forgive_app_date: intakeData.ppp_2_forgive_app_date || '',
            ppp_2_amount: intakeData.ppp_2_amount || '',
            ppp_2_wages_allocated: intakeData.ppp_2_wages_allocated || '',
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
        avg_emp_count_2019: '',
        fee_type: '',
        custom_fee: '',
        eligible_quarters: '',
        welcome_email: '',
        retainer_invoice_no: '',
        retainer_payment_date: '',
        retainer_payment_cleared: '',
        retainer_payment_returned: '',
        retpayment_return_reason: '',
        retainer_refund_date: '',
        retainer_refund_amount: '',
        retainer_payment_amount: '',
        retainer_payment_type: '',
        bal_retainer_invoice_no: '',
        bal_retainer_sent_date: '',
        bal_retainer_pay_date: '',
        bal_retainer_clear_date: '',
        bal_retainer_return_date: '',
        bal_retainer_return_reaso: '',
        interest_percentage: '',
        net_no: '',
        coi_aoi: '',
        voided_check: '',
        '2019_tax_return': '',
        '2020_tax_return': '',
        '2021_financials': '',
        '2020_q1_941': '',
        '2020_q2_941': '',
        '2020_q3_941': '',
        '2020_q4_941': '',
        '2021_q1_941': '',
        '2021_q2_941': '',
        '2021_q3_941': '',
        '2020_q1_payroll': '',
        '2020_q2_payroll': '',
        '2020_q3_payroll': '',
        '2020_q4_payroll': '',
        '2021_q1_payroll': '',
        '2021_q2_payroll': '',
        '2021_q3_payroll': '',
        '2021_q4_payroll': '',
        f911_status: '',
        ppp_1_applied: '',
        ppp_1_date: '',
        ppp_1_forgiveness_applied: '',
        ppp_1_forgive_app_date: '',
        ppp_1_amount: '',
        ppp_1_wages_allocated: '',
        ppp_2_applied: '',
        ppp_2_date: '',
        ppp_2_forgiveness_applied: '',
        ppp_2_forgive_app_date: '',
        ppp_2_amount: '',
        ppp_2_wages_allocated: '',
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
    if (!projectId) {
      //console.log('No project ID available for fees API call');
      return;
    }

    setFeesInfoLoading(true);
    setFeesInfoError(null);

    try {
      //console.log('=== FEES API CALL START ===');
      //console.log('Project ID:', projectId);
      //console.log('API Endpoint: https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-project-fees');

      const requestBody = { project_id: projectId };
      //console.log('Request Body:', JSON.stringify(requestBody));

      const response = await fetch('https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-project-fees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      //console.log('Response Status:', response.status);
      //console.log('Response OK:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      //console.log('Fees info data from API:', data);

      if (data && data.status === 1) {
        setIsFeesData(true);
        // Extract fees data from the response - following intake API pattern
        const feesData = data.result && Array.isArray(data.result) ? data.result[0] : data.result;

        //console.log('Fees data extracted from API response:', feesData);

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
            total_erc_fees: feesData.total_erc_fees || '',
            legal_fees: feesData.legal_fees || '',
            total_erc_fees_paid: feesData.total_erc_fees_paid || '',
            total_erc_fees_pending: feesData.total_erc_fees_pending || '',
            total_occams_share: feesData.total_occams_share || '',
            total_aff_ref_share: feesData.total_aff_ref_share || '',
            retain_occams_share: feesData.retain_occams_share || '',
            retain_aff_ref_share: feesData.retain_aff_ref_share || '',
            bal_retain_occams_share: feesData.bal_retain_occams_share || '',
            bal_retain_aff_ref_share: feesData.bal_retain_aff_ref_share || '',
            total_occams_share_paid: feesData.total_occams_share_paid || '',
            total_aff_ref_share_paid: feesData.total_aff_ref_share_paid || '',
            total_occams_share_pendin: feesData.total_occams_share_pendin || '',
            total_aff_ref_share_pend: feesData.total_aff_ref_share_pend || '',
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
            q1_2020_filed_date: feesData.q1_2020_filed_date || '',
            q1_2020_amount_filed: feesData.q1_2020_amount_filed || '',
            q1_2020_benefits: feesData.q1_2020_benefits || '',
            q1_2020_eligibility_basis: feesData.q1_2020_eligibility_basis || 'N/A',
            q2_2020_filed_status: feesData.q2_2020_filed_status === 'Yes' || feesData.q2_2020_filed_status === 'true' || feesData.q2_2020_filed_status === true || feesData.q2_2020_filed_status === 1,
            q2_2020_filed_date: feesData.q2_2020_filed_date || '',
            q2_2020_amount_filed: feesData.q2_2020_amount_filed || '',
            q2_2020_benefits: feesData.q2_2020_benefits || '',
            q2_2020_eligibility_basis: feesData.q2_2020_eligibility_basis || 'N/A',
            q3_2020_filed_status: feesData.q3_2020_filed_status === 'Yes' || feesData.q3_2020_filed_status === 'true' || feesData.q3_2020_filed_status === true || feesData.q3_2020_filed_status === 1,
            q3_2020_filed_date: feesData.q3_2020_filed_date || '',
            q3_2020_amount_filed: feesData.q3_2020_amount_filed || '',
            q3_2020_benefits: feesData.q3_2020_benefits || '',
            q3_2020_eligibility_basis: feesData.q3_2020_eligibility_basis || 'N/A',
            q4_2020_filed_status: feesData.q4_2020_filed_status === 'Yes' || feesData.q4_2020_filed_status === 'true' || feesData.q4_2020_filed_status === true || feesData.q4_2020_filed_status === 1,
            q4_2020_filed_date: feesData.q4_2020_filed_date || '',
            q4_2020_amount_filed: feesData.q4_2020_amount_filed || '',
            q4_2020_benefits: feesData.q4_2020_benefits || '',
            q4_2020_eligibility_basis: feesData.q4_2020_eligibility_basis || 'N/A',
            // ERC Filed Quarter wise 2021 fields
            q1_2021_filed_status: feesData.q1_2021_filed_status === 'Yes' || feesData.q1_2021_filed_status === 'true' || feesData.q1_2021_filed_status === true || feesData.q1_2021_filed_status === 1,
            q1_2021_filed_date: feesData.q1_2021_filed_date || '',
            q1_2021_amount_filed: feesData.q1_2021_amount_filed || '',
            q1_2021_benefits: feesData.q1_2021_benefits || '',
            q1_2021_eligibility_basis: feesData.q1_2021_eligibility_basis || 'N/A',
            q2_2021_filed_status: feesData.q2_2021_filed_status === 'Yes' || feesData.q2_2021_filed_status === 'true' || feesData.q2_2021_filed_status === true || feesData.q2_2021_filed_status === 1,
            q2_2021_filed_date: feesData.q2_2021_filed_date || '',
            q2_2021_amount_filed: feesData.q2_2021_amount_filed || '',
            q2_2021_benefits: feesData.q2_2021_benefits || '',
            q2_2021_eligibility_basis: feesData.q2_2021_eligibility_basis || 'N/A',
            q3_2021_filed_status: feesData.q3_2021_filed_status === 'Yes' || feesData.q3_2021_filed_status === 'true' || feesData.q3_2021_filed_status === true || feesData.q3_2021_filed_status === 1,
            q3_2021_filed_date: feesData.q3_2021_filed_date || '',
            q3_2021_amount_filed: feesData.q3_2021_amount_filed || '',
            q3_2021_benefits: feesData.q3_2021_benefits || '',
            q3_2021_eligibility_basis: feesData.q3_2021_eligibility_basis || 'N/A',
            q4_2021_filed_status: feesData.q4_2021_filed_status === 'Yes' || feesData.q4_2021_filed_status === 'true' || feesData.q4_2021_filed_status === true || feesData.q4_2021_filed_status === 1,
            q4_2021_filed_date: feesData.q4_2021_filed_date || '',
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
            i_invoice_no: feesData.i_invoice_number || '',
            i_invoice_amount: feesData.i_invoice_amount || '',
            i_invoiced_qtrs: feesData.i_invoiced_qtrs || '',
            i_invoice_sent_date: feesData.i_invoice_sent_date || '',
            i_invoice_payment_type: feesData.i_invoice_payment_type || '',
            i_invoice_payment_date: feesData.i_invoice_payment_date || '',
            i_invoice_pay_cleared: feesData.i_invoice_pay_cleared || '',
            i_invoice_pay_returned: feesData.i_invoice_pay_returned || '',
            i_invoice_return_reason: feesData.i_invoice_return_reason || '',
            i_invoice_occams_share: feesData.i_invoice_occams_share || '',
            i_invoice_aff_ref_share: feesData.i_invoice_aff_ref_share || '',
            // Success Fee Invoice Details - II Invoice
            ii_invoice_no: feesData.ii_invoice_number || '',
            ii_invoice_amount: feesData.ii_invoice_amount || '',
            ii_invoiced_qtrs: feesData.ii_invoiced_qtrs || '',
            ii_invoice_sent_date: feesData.ii_invoice_sent_date || '',
            ii_invoice_payment_type: feesData.ii_invoice_payment_type || '',
            ii_invoice_payment_date: feesData.ii_invoice_payment_date || '',
            ii_invoice_pay_cleared: feesData.ii_invoice_pay_cleared || '',
            ii_invoice_pay_returned: feesData.ii_invoice_pay_returned || '',
            ii_invoice_return_reason: feesData.ii_invoice_return_reason || '',
            ii_invoice_occams_share: feesData.ii_invoice_occams_share || '',
            ii_invoice_aff_ref_share: feesData.ii_invoice_aff_ref_share || '',
            // Success Fee Invoice Details - III Invoice
            iii_invoice_no: feesData.iii_invoice_number || '',
            iii_invoice_amount: feesData.iii_invoice_amount || '',
            iii_invoiced_qtrs: feesData.iii_invoiced_qtrs || '',
            iii_invoice_sent_date: feesData.iii_invoice_sent_date || '',
            iii_invoice_payment_type: feesData.iii_invoice_payment_type || '',
            iii_invoice_payment_date: feesData.iii_invoice_payment_date || '',
            iii_invoice_pay_cleared: feesData.iii_invoice_pay_cleared || '',
            iii_invoice_pay_returned: feesData.iii_invoice_pay_returned || '',
            iii_invoice_return_reason: feesData.iii_invoice_return_reason || '',
            iii_invoice_occams_share: feesData.iii_invoice_occams_share || '',
            iii_invoice_aff_ref_share: feesData.iii_invoice_aff_ref_share || '',
            // Success Fee Invoice Details - IV Invoice
            iv_invoice_no: feesData.iv_invoice_number || '',
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

          //console.log('✅ Fees data successfully loaded from API');
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
        total_erc_fees: '',
        legal_fees: '',
        total_erc_fees_paid: '',
        total_erc_fees_pending: '',
        total_occams_share: '',
        total_aff_ref_share: '',
        retain_occams_share: '',
        retain_aff_ref_share: '',
        bal_retain_occams_share: '',
        bal_retain_aff_ref_share: '',
        total_occams_share_paid: '',
        total_aff_ref_share_paid: '',
        total_occams_share_pendin: '',
        total_aff_ref_share_pend: '',
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
        q1_2020_filed_date: '',
        q1_2020_amount_filed: '',
        q1_2020_benefits: '',
        q1_2020_eligibility_basis: 'N/A',
        q2_2020_filed_status: false,
        q2_2020_filed_date: '',
        q2_2020_amount_filed: '',
        q2_2020_benefits: '',
        q2_2020_eligibility_basis: 'N/A',
        q3_2020_filed_status: false,
        q3_2020_filed_date: '',
        q3_2020_amount_filed: '',
        q3_2020_benefits: '',
        q3_2020_eligibility_basis: 'N/A',
        q4_2020_filed_status: false,
        q4_2020_filed_date: '',
        q4_2020_amount_filed: '',
        q4_2020_benefits: '',
        q4_2020_eligibility_basis: 'N/A',
        // ERC Filed Quarter wise 2021 fields
        q1_2021_filed_status: false,
        q1_2021_filed_date: '',
        q1_2021_amount_filed: '',
        q1_2021_benefits: '',
        q1_2021_eligibility_basis: 'N/A',
        q2_2021_filed_status: false,
        q2_2021_filed_date: '',
        q2_2021_amount_filed: '',
        q2_2021_benefits: '',
        q2_2021_eligibility_basis: 'N/A',
        q3_2021_filed_status: false,
        q3_2021_filed_date: '',
        q3_2021_amount_filed: '',
        q3_2021_benefits: '',
        q3_2021_eligibility_basis: 'N/A',
        q4_2021_filed_status: false,
        q4_2021_filed_date: '',
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
        i_invoice_no: '',
        i_invoice_amount: '',
        i_invoiced_qtrs: '',
        i_invoice_sent_date: '',
        i_invoice_payment_type: '',
        i_invoice_payment_date: '',
        i_invoice_pay_cleared: '',
        i_invoice_pay_returned: '',
        i_invoice_return_reason: '',
        i_invoice_occams_share: '',
        i_invoice_aff_ref_share: '',
        // Success Fee Invoice Details - II Invoice
        ii_invoice_no: '',
        ii_invoice_amount: '',
        ii_invoiced_qtrs: '',
        ii_invoice_sent_date: '',
        ii_invoice_payment_type: '',
        ii_invoice_payment_date: '',
        ii_invoice_pay_cleared: '',
        ii_invoice_pay_returned: '',
        ii_invoice_return_reason: '',
        ii_invoice_occams_share: '',
        ii_invoice_aff_ref_share: '',
        // Success Fee Invoice Details - III Invoice
        iii_invoice_no: '',
        iii_invoice_amount: '',
        iii_invoiced_qtrs: '',
        iii_invoice_sent_date: '',
        iii_invoice_payment_type: '',
        iii_invoice_payment_date: '',
        iii_invoice_pay_cleared: '',
        iii_invoice_pay_returned: '',
        iii_invoice_return_reason: '',
        iii_invoice_occams_share: '',
        iii_invoice_aff_ref_share: '',
        // Success Fee Invoice Details - IV Invoice
        iv_invoice_no: '',
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
      //console.log('=== FEES API CALL END ===');
    }
  };

  // Function to fetch project audit logs
  const fetchProjectAuditLogs = async () => {
    try {
      setAuditLogsLoading(true);
      setAuditLogsError(null);
      // if(!isProjectDetailssData){
        fetchProjectDetails();
      // }
      //console.log('=== PROJECT AUDIT LOGS API CALL START ===');
      //console.log('Project ID:', projectId);
      //console.log('Lead ID:', project?.lead_id);
      //console.log('Product ID:', project?.product_id);

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

      //console.log('API URL:', apiUrl.toString());

      // Make API call to fetch audit logs
      const response = await axios.get(apiUrl.toString());

      //console.log('Project Audit Logs API Response:', response.data);

      if (response.data && response.data.status) {
        setIsAuditData(true);
        // Set the audit logs data
        setAuditLogsData({
          project_fields: response.data.project_fields || [],
          milestone_stage: response.data.milestone_stage || [],
          invoices: response.data.invoices || [],
          business_audit_log: response.data.business_audit_log || []
        });
        //console.log('Audit logs data set successfully');
      } else {
        console.warn('Unexpected audit logs API response structure:', response.data);
        setAuditLogsError('Unexpected response format from audit logs API');
      }
    } catch (error) {
      console.error('Error fetching project audit logs:', error);
      setAuditLogsError('Failed to fetch audit logs: ' + (error.response?.data?.message || error.message));
    } finally {
      setAuditLogsLoading(false);
      //console.log('=== PROJECT AUDIT LOGS API CALL END ===');
    }
  };
  // Function to fetch fulfilment information from the API
  const fetchFulfilmentInfo = async () => {
    if (!projectId) {
      //console.log('No project ID available for fulfilment API call');
      return;
    }

    setFulfilmentLoading(true);
    setFulfilmentError(null);

    try {
      //console.log('=== FULFILMENT API CALL START ===');
      //console.log('Project ID:', projectId);
      //console.log('API Endpoint: https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-project-fulfilment');

      const requestBody = { project_id: projectId };
      //console.log('Request Body:', JSON.stringify(requestBody));

      const response = await fetch('https://portal.occamsadvisory.com/portal/wp-json/productsplugin/v1/get-project-fulfilment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      //console.log('Response Status:', response.status);
      //console.log('Response OK:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      //console.log('Raw API Response:', data);
      //console.log('Response Type:', typeof data);
      //console.log('Response Keys:', Object.keys(data));

      // Check if the API response has the expected structure
      if (data && data.result) {
        setIsFulFilmentData(true);
        const apiData = data.result && Array.isArray(data.result) ? data.result[0] : data.result;
        //console.log('Fulfilment Data from API:', apiData);

        if (apiData) {
          // Update fulfilment info state with the data from API - following fees API pattern
          setFulfilmentData({
            income_2019: apiData.income_2019 || '',
            income_2020: apiData.income_2020 || '',
            income_2021: apiData.income_2021 || '',
            bank_name: apiData.bank_name || '',
            account_holder_name: apiData.account_holder_name || '',
            account_number: apiData.account_number || '',
            aba_routing_no: apiData.aba_routing_no || '',
            stc_amount_2020: apiData.stc_amount_2020 || '',
            stc_amount_2021: apiData.stc_amount_2021 || '',
            maximum_credit: apiData.maximum_credit || '',
            actual_credit: apiData.actual_credit || '',
            estimated_fee: apiData.estimated_fee || '',
            actual_fee: apiData.actual_fee || '',
            years: apiData.years || ''
          });

          //console.log('✅ Fulfilment data successfully loaded from API');
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
        aba_routing_no: '',
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
      //console.log('=== FULFILMENT API CALL END ===');
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
    const pageLimit = 3;
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);

    if (currentPage === 1) {
      endPage = Math.min(totalPages, pageLimit);
    }
    if (currentPage === totalPages) {
      startPage = Math.max(1, totalPages - 2);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-muted">
          Showing {((currentPage - 1) * auditLogsPagination[tableType].itemsPerPage) + 1} to{' '}
          {Math.min(currentPage * auditLogsPagination[tableType].itemsPerPage, data.length)} of {data.length} entries
        </div>
        <nav>
          <div className="pagination-container">
            <button
                onClick={() => handleAuditLogsPagination(tableType, currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>
            {/* <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              &lsaquo;
            </button> */}

            {pages.map(number => (
              <button
                key={number}
                onClick={() => handleAuditLogsPagination(tableType, number)}
                className={`pagination-button ${currentPage === number ? 'active' : ''}`}
              >
                {number}
              </button>
            ))}

            <button
              onClick={() => handleAuditLogsPagination(tableType, currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
            </button>
            {/* <button
              onClick={() => paginate(totalPages)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              &raquo;
            </button> */}

            {/* <div className="pagination-info">
              <span>Page {currentPage} of {totalPages}</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="items-per-page"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div> */}
          </div>
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

    if(tab === 'project'){
      if(!isProjectDetailssData){
        fetchProjectDetails();
      }
    }

    // If bank info tab is selected, fetch bank information
    if (tab === 'bankInfo') {
      if(!isBankInfoData){
        fetchBankInfo();
      }
    }

    // If intake tab is selected, fetch intake information
    if (tab === 'intake') {
      if(!isIntakeData){
        fetchIntakeInfo();
      }
    }

    // If fees tab is selected, fetch fees information
    if (tab === 'fees') {
      if(!isFeesData){
        fetchFeesInfo(); 
      }
    }
    // If fulfilment tab is selected, fetch fulfilment information
    if (tab === 'fulfilment') {
      if(!isFulFilmentData){
        fetchFulfilmentInfo();
      }
    }
    // If audit logs tab is selected, fetch audit logs
    if (tab === 'auditLogs') {
      // Only fetch if project data is available
      if (project && project.lead_id && project.product_id) {
        if(!isAuditData){
          fetchProjectAuditLogs();
        }
      } else {
        console.warn('Cannot fetch audit logs: project data not fully loaded');
        setAuditLogsError('Project data not fully loaded. Please wait and try again.');
      }
    }

    if(tab === 'documents'){
      if(!isSTCIDocData){
        fetchSTCImpactedDays(projectId);
      }
      if(!isSTCRDocData){
        fetchSTCRequiredDocuments(projectId);
      }
      if(!isPayrollDocData){
        fetchPayrollDocuments(projectId);
      }
      if(!isOtherDocData){
        fetchOtherDocuments(projectId, 4);
      }
      if(!isCompanyDocData){
        fetchCompanyDocuments(projectId, 1);
      }
      if(!isERCDocData){
        fetchERCDocuments(projectId, 3);
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
          //console.log('Assigning collaborator:', selectedCollaborator.collaborator);

          // Call the API to assign the collaborator
          const response = await axios.post(
            'https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-collaborators',
            {
              project_id: projectId,
              user_id: selectedCollaborator.collaborator.id,
              operation: 'assign_collabs_user',
              current_user_id:getUserId(),
            }
          );

          //console.log('API response:', response);

          if (response.data && response.data.status === 200) {
            // Add the collaborator to the current collaborators list
            const newCollaborator = {
              collaborators_name_id: selectedCollaborator.collaborator.id,
              collaborators_name: selectedCollaborator.collaborator.name
            };

            const newCollaborators = [...currentCollaborators, newCollaborator];
            setCurrentCollaborators(newCollaborators);

            //console.log('Collaborator assigned successfully:', selectedCollaborator.collaborator);
            //console.log('Updated collaborators:', newCollaborators);

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
          //console.log('Collaborator already assigned:', selectedCollaborator.collaborator);

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
      //console.log('Removing collaborator with ID:', collaboratorId);

      // Call the API to unassign the collaborator
      const response = await axios.post(
        'https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-collaborators',
        {
          project_id: projectId,
          user_id: collaboratorId,
          operation: 'unassign_collabs_user',
          current_user_id:getUserId(),
        }
      );

      //console.log('API response:', response);

      if (response.data && response.data.status === 1) {
        // Remove the collaborator from the current collaborators list
        const updatedCollaborators = currentCollaborators.filter(
          collaborator => collaborator.collaborators_name_id !== collaboratorId
        );

        setCurrentCollaborators(updatedCollaborators);

        //console.log('Collaborator removed successfully. Updated collaborators:', updatedCollaborators);

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
    //console.log("Project group changed:", selectedOption);
  };

  // Add state variables to store original values
  const [originalMilestone, setOriginalMilestone] = useState(null);
  const [originalStage, setOriginalStage] = useState(null);

  // Function to start editing milestone and stage
  const startEditingMilestoneStage = () => {
    // Save the current milestone and stage before editing
    setOriginalMilestone(milestone);
    setOriginalStage(projectStage);
    setIsEditing(true); // Using the existing isEditing state
  };

  // Function to cancel milestone and stage editing
  const cancelMilestoneStageEdit = () => {
    //console.log('Canceling milestone and stage edit');
    //console.log('Original milestone:', originalMilestone);
    //console.log('Original stage:', originalStage);
    
    // Restore the original milestone and stage
    if (originalMilestone) {
      setMilestone(originalMilestone);
    }
    
    if (originalStage) {
      setProjectStage(originalStage);
    }
    
    // If we have the original milestone, also restore the original milestone stages
    // if (originalMilestone && originalMilestone.value) {
    //   // Fetch the stages for the original milestone without changing the selection
    //   fetchMilestoneStages(originalMilestone.value, false);
    // }
    
    setIsEditing(false);
  };

  // Add a state to keep track of the original owner before editing
  const [originalOwner, setOriginalOwner] = useState(null);

  // Modify the function that opens the editing mode
  const startEditingOwner = () => {
    // Save the current owner before editing
    setOriginalOwner(owner);
    setIsEditingOwner(true);
  };

  // Modify the cancel function to restore the original owner
  const cancelOwnerEdit = () => {
    // Restore the original owner
    if (originalOwner) {
      setOwner(originalOwner);
    }
    setIsEditingOwner(false);
  };

  const [originalContact, setOriginalContact] = useState(null);
  const startEditingContact = () => {
    // Save the current contact before editing
    setOriginalContact(selectedContact);
    setIsEditingContact(true);
  };

  // Modify the cancel function to restore the original contact
  const cancelContactEdit = () => {
    //console.log('come here');
    // Restore the original contact
    if (originalContact) {
      setSelectedContact(originalContact);
    }
    setIsEditingContact(false);
  };

  // Function to handle owner selection change (only updates state, doesn't call API)
  const handleOwnerChange = (selectedOption) => {
    //console.log('Owner selection changed to:', selectedOption);
    setOwner(selectedOption);
  };

  // Function to save owner changes to the API
  const saveOwner = async () => {
    try {
      setOwnerLoading(true);
      //console.log('Saving owner:', owner);

      // Call the API to update the owner
      const response = await axios.post(
        'https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-owners',
        {
          project_id: projectId,
          owner_id: owner.value,
          current_user_id: getUserId(),
        }
      );

      //console.log('API response:', response);

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
    //console.log('Contact selection changed to:', selectedOption);
    setSelectedContact(selectedOption);
  };

  // Function to save contact changes to the API
  const saveContact = async () => {
    try {
      setContactLoading(true);
      //console.log('Saving contact:', selectedContact);

      // Call the API to update the contact
      const response = await axios.post(
        'https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-contacts',
        {
          project_id: projectId,
          contact_id: selectedContact.value,
          current_user_id: getUserId(),
        }
      );

      //console.log('API response:', response);

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
    //console.log('Stage changed to:', selectedOption);
    setProjectStage(selectedOption);
  };

  // Function to fetch milestones from API
  const fetchMilestones = async (selectedProductId) => {
    try {
      setIsLoadingMilestones(true);
      //console.log('Fetching milestones for product ID:', selectedProductId);

      // Build the API URL with the product_id parameter
      const apiUrl = `https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/milestones?type=project&product_id=${selectedProductId}`;
      //console.log('Milestones API URL:', apiUrl);

      // Make the API call
      const response = await axios.get(apiUrl);
      //console.log('Milestones API response:', response.data);

      // Log the entire response for debugging
      //console.log('Complete API response:', response);
      //console.log('Response data type:', typeof response.data);
      //console.log('Response data structure:', JSON.stringify(response.data, null, 2));

      // Process the response data based on the actual structure
      if (response.data) {
        //console.log('Response data exists');

        // Check if the response has a success property
        if ('success' in response.data) {
          //console.log('Response has success property:', response.data.success);
        } else {
          //console.log('Response does not have a success property');
        }

        // Check if the response is an array directly
        if (Array.isArray(response.data)) {
          //console.log('Response data is an array with length:', response.data.length);

          // Map the API response to the format needed for the dropdown
          const formattedMilestones = response.data.map(milestone => ({
            value: milestone.milestone_id,
            label: milestone.milestone_name
          }));

          //console.log('Formatted milestones from array:', formattedMilestones);
          setMilestones(formattedMilestones);

          // If we have milestones, fetch stages for the first milestone
          if (formattedMilestones.length > 0) {
            const firstMilestone = formattedMilestones[0];
            // setMilestone(firstMilestone);
            // fetchMilestoneStages(firstMilestone.value);
          } else {
            // No milestones found
            //console.log('No milestones found in array');
            setMilestone(null);
            setMilestoneStages([]);
            setProjectStage(null);
          }
        }
        // Check if the response has the expected nested structure
        else if (response.data.success && response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
          //console.log('Response has the expected nested structure');

          // Map the API response to the format needed for the dropdown
          const formattedMilestones = response.data.data.data.map(milestone => ({
            value: milestone.milestone_id,
            label: milestone.milestone_name
          }));

          //console.log('Formatted milestones from nested structure:', formattedMilestones);
          setMilestones(formattedMilestones);

          // If we have milestones, fetch stages for the first milestone
          if (formattedMilestones.length > 0) {
            const firstMilestone = formattedMilestones[0];
            // setMilestone(firstMilestone);
            // fetchMilestoneStages(firstMilestone.value);
          } else {
            // No milestones found
            //console.log('No milestones found in nested structure');
            setMilestone(null);
            setMilestoneStages([]);
            setProjectStage(null);
          }
        } else {
          console.warn('Unexpected API response structure for milestones');
          //console.log('Response data structure details:', JSON.stringify(response.data, null, 2));

          // Set default milestones for testing
          const defaultMilestones = [
            { value: '100', label: 'Default Milestone 1' },
            { value: '101', label: 'Default Milestone 2' }
          ];
          //console.log('Setting default milestones:', defaultMilestones);
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
      //console.log('Setting default milestones due to error:', defaultMilestones);
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
      //console.log('Fetching milestone stages for milestone ID:', milestoneId, 'isUserSelection:', isUserSelection);

      // Store the current stage if we need to preserve it
      const currentStage = !isUserSelection ? projectStage : null;

      // Build the API URL with the milestone_id parameter
      const apiUrl = `https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/milestone-stages?milestone_id=${milestoneId}`;
      //console.log('Milestone stages API URL:', apiUrl);

      // Make the API call
      const response = await axios.get(apiUrl);
      //console.log('Milestone stages API response:', response.data);
      //console.log('Milestone stages API response structure:', JSON.stringify(response.data, null, 2));

      // Log the entire response for debugging
      //console.log('Complete stages API response:', response);
      //console.log('Stages response data type:', typeof response.data);
      //console.log('Stages response data structure:', JSON.stringify(response.data, null, 2));

      // Process the response data based on the actual structure
      if (response.data) {
        //console.log('Stages response data exists');

        // Check if the response is an array directly
        if (Array.isArray(response.data)) {
          //console.log('Stages response data is an array with length:', response.data.length);

          // Map the API response to the format needed for the dropdown
          const formattedStages = response.data.map(stage => ({
            value: stage.milestone_stage_id,
            label: stage.stage_name
          }));

          //console.log('Formatted stages from array:', formattedStages);
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
          //console.log('Stages response has the expected nested structure');

          // Map the API response to the format needed for the dropdown
          const formattedStages = response.data.data.data.map(stage => ({
            value: stage.milestone_stage_id,
            label: stage.stage_name
          }));

          //console.log('Formatted stages from nested structure:', formattedStages);
          setMilestoneStages(formattedStages);

          // If this is a user selection, set the first stage as selected
          // Otherwise, preserve the current stage if it exists
          if (isUserSelection) {
            if (formattedStages.length > 0) {
              // setProjectStage(formattedStages[0]);
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
          //console.log('Stages response data structure details:', JSON.stringify(response.data, null, 2));

          // Set default stages for testing
          const defaultStages = [
            { value: '200', label: 'Default Stage 1' },
            { value: '201', label: 'Default Stage 2' },
            { value: '202', label: 'Default Stage 3' }
          ];
          //console.log('Setting default stages:', defaultStages);
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
      //console.log('Setting default stages due to error:', defaultStages);
      setMilestoneStages(defaultStages);
      setProjectStage(defaultStages[0]);
    } finally {
      setIsLoadingStages(false);
    }
  };

  // Function to handle milestone change
  const handleMilestoneChange = (selectedOption) => {
    //console.log('Milestone changed to:', selectedOption);
    setMilestone(selectedOption);
    setProjectStage(null);
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
      //console.log('Saving milestone and stage changes:');
      //console.log('Milestone:', milestone);
      //console.log('Stage:', projectStage);

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
          milestone_stage_id: projectStage.value,
          user_id:getUserId(),
        }
      );

      //console.log('API response:', response);

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
      data.country = bankInfo.country;
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
    } else if (activeTab === 'fees') {
      // Add fees info data
      Object.assign(data, feesInfo);
    }

    return data;
  };

  // Function to handle project update
  const handleUpdateProject = async (data) => {
    try {
      // Set loading state
      setIsUpdating(true);

      //console.log('Updating project with data:', data);

      // Always include project ID
      const baseData = {
        project_id: project?.project_id,
        tab: activeTab,
      };

      // Combine the base data with the tab-specific data
      const combinedData = { ...baseData, ...data };
      //console.log('Combined data:', data);

      // Map the data to the correct database column names
      const mappedData = {
        project_id: combinedData.project_id,
        tab: combinedData.tab,
        user_id: getUserId(),
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
        bank_name: combinedData.tab === "fulfilment" ? fulfilmentData.bank_name : bankInfo.bank_name,
        bank_mailing_address: bankInfo.bank_mailing_address,
        bank_city: bankInfo.city,
        bank_state: bankInfo.state,
        bank_zip: bankInfo.zip,
        country: bankInfo.country,
        bank_phone: bankInfo.bank_phone,
        account_holder_name: combinedData.tab === "fulfilment" ? fulfilmentData.account_holder_name : bankInfo.account_holder_name,
        account_type: bankInfo.account_type,
        other: bankInfo.other,
        aba_routing_no: combinedData.tab === "fulfilment" ? fulfilmentData.aba_routing_no : bankInfo.aba_routing_no,
        account_number: combinedData.tab === "fulfilment" ? fulfilmentData.account_number : bankInfo.account_number,
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
        avg_emp_count_2019: intakeInfo.avg_emp_count_2019 || '',
        fee_type: intakeInfo.fee_type,
        custom_fee: intakeInfo.custom_fee,
        eligible_quarters: intakeInfo.eligible_quarters,
        welcome_email: intakeInfo.welcome_email,
        retainer_invoice_no: intakeInfo.retainer_invoice_no,
        retainer_payment_date: intakeInfo.retainer_payment_date,
        retainer_payment_cleared: intakeInfo.retainer_payment_cleared,
        retainer_payment_returned: intakeInfo.retainer_payment_returned,
        retpayment_return_reason: intakeInfo.retpayment_return_reason,
        retainer_refund_date: intakeInfo.retainer_refund_date,
        retainer_refund_amount: intakeInfo.retainer_refund_amount,
        retainer_payment_amount: intakeInfo.retainer_payment_amount,
        retainer_payment_type: intakeInfo.retainer_payment_type,
        bal_retainer_invoice_no: intakeInfo.bal_retainer_invoice_no,
        bal_retainer_sent_date: intakeInfo.bal_retainer_sent_date,
        bal_retainer_pay_date: intakeInfo.bal_retainer_pay_date,
        bal_retainer_clear_date: intakeInfo.bal_retainer_clear_date,
        bal_retainer_return_date: intakeInfo.bal_retainer_return_date,
        bal_retainer_return_reaso: intakeInfo.bal_retainer_return_reaso,
        interest_percentage: intakeInfo.interest_percentage,
        net_no: intakeInfo.net_no,
        coi_aoi: intakeInfo.coi_aoi,
        voided_check: intakeInfo.voided_check,
        '2019_tax_return': intakeInfo['2019_tax_return'],
        '2020_tax_return': intakeInfo['2020_tax_return'],
        '2021_financials': intakeInfo['2021_financials'],
        '2020_q1_941': intakeInfo['2020_q1_941'],
        '2020_q2_941': intakeInfo['2020_q2_941'],
        '2020_q3_941': intakeInfo['2020_q3_941'],
        '2020_q4_941': intakeInfo['2020_q4_941'],
        '2021_q1_941': intakeInfo['2021_q1_941'],
        '2021_q2_941': intakeInfo['2021_q2_941'],
        '2021_q3_941': intakeInfo['2021_q3_941'],
        '2020_q1_payroll': intakeInfo['2020_q1_payroll'],
        '2020_q2_payroll': intakeInfo['2020_q2_payroll'],
        '2020_q3_payroll': intakeInfo['2020_q3_payroll'],
        '2020_q4_payroll': intakeInfo['2020_q4_payroll'],
        '2021_q1_payroll': intakeInfo['2021_q1_payroll'],
        '2021_q2_payroll': intakeInfo['2021_q2_payroll'],
        '2021_q3_payroll': intakeInfo['2021_q3_payroll'],
        '2021_q4_payroll': intakeInfo['2021_q4_payroll'],
        f911_status: intakeInfo.f911_status,
        ppp_1_applied: intakeInfo.ppp_1_applied,
        ppp_1_date: intakeInfo.ppp_1_date,
        ppp_1_forgiveness_applied: intakeInfo.ppp_1_forgiveness_applied,
        ppp_1_forgive_app_date: intakeInfo.ppp_1_forgive_app_date,
        ppp_1_amount: intakeInfo.ppp_1_amount,
        ppp_1_wages_allocated: intakeInfo.ppp_1_wages_allocated,
        ppp_2_applied: intakeInfo.ppp_2_applied,
        ppp_2_date: intakeInfo.ppp_2_date,
        ppp_2_forgiveness_applied: intakeInfo.ppp_2_forgiveness_applied,
        ppp_2_forgive_app_date: intakeInfo.ppp_2_forgive_app_date,
        ppp_2_amount: intakeInfo.ppp_2_amount,
        ppp_2_wages_allocated: intakeInfo.ppp_2_wages_allocated,
        additional_comments: intakeInfo.additional_comments,
        attorney_name: intakeInfo.attorney_name,
        call_date: intakeInfo.call_date,
        call_time: intakeInfo.call_time,
        memo_received_date: intakeInfo.memo_received_date,
        memo_cut_off_date: intakeInfo.memo_cut_off_date,

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
        total_erc_fees: feesInfo.total_erc_fees,
        legal_fees: feesInfo.legal_fees,
        total_erc_fees_paid: feesInfo.total_erc_fees_paid,
        total_erc_fees_pending: feesInfo.total_erc_fees_pending,
        total_occams_share: feesInfo.total_occams_share,
        total_aff_ref_share: feesInfo.total_aff_ref_share,
        retain_occams_share: feesInfo.retain_occams_share,
        retain_aff_ref_share: feesInfo.retain_aff_ref_share,
        bal_retain_occams_share: feesInfo.bal_retain_occams_share,
        bal_retain_aff_ref_share: feesInfo.bal_retain_aff_ref_share,
        total_occams_share_paid: feesInfo.total_occams_share_paid,
        total_aff_ref_share_paid: feesInfo.total_aff_ref_share_paid,
        total_occams_share_pendin: feesInfo.total_occams_share_pendin,
        total_aff_ref_share_pend: feesInfo.total_aff_ref_share_pend,
        q1_2020_max_erc_amount: feesInfo.q1_2020_max_erc_amount,
        q2_2020_max_erc_amount: feesInfo.q2_2020_max_erc_amount,
        q3_2020_max_erc_amount: feesInfo.q3_2020_max_erc_amount,
        q4_2020_max_erc_amount: feesInfo.q4_2020_max_erc_amount,
        q1_2021_max_erc_amount: feesInfo.q1_2021_max_erc_amount,
        q2_2021_max_erc_amount: feesInfo.q2_2021_max_erc_amount,
        q3_2021_max_erc_amount: feesInfo.q3_2021_max_erc_amount,
        q4_2021_max_erc_amount: feesInfo.q4_2021_max_erc_amount,
        q1_2020_filed_status: feesInfo.q1_2020_filed_status ? 'Yes' : 'No',
        q1_2020_filed_date: feesInfo.q1_2020_filed_date,
        q1_2020_amount_filed: feesInfo.q1_2020_amount_filed,
        q1_2020_benefits: feesInfo.q1_2020_benefits,
        q1_2020_eligibility_basis: feesInfo.q1_2020_eligibility_basis,
        q2_2020_filed_status: feesInfo.q2_2020_filed_status ? 'Yes' : 'No',
        q2_2020_filed_date: feesInfo.q2_2020_filed_date,
        q2_2020_amount_filed: feesInfo.q2_2020_amount_filed,
        q2_2020_benefits: feesInfo.q2_2020_benefits,
        q2_2020_eligibility_basis: feesInfo.q2_2020_eligibility_basis,
        q3_2020_filed_status: feesInfo.q3_2020_filed_status ? 'Yes' : 'No',
        q3_2020_filed_date: feesInfo.q3_2020_filed_date,
        q3_2020_amount_filed: feesInfo.q3_2020_amount_filed,
        q3_2020_benefits: feesInfo.q3_2020_benefits,
        q3_2020_eligibility_basis: feesInfo.q3_2020_eligibility_basis,
        q4_2020_filed_status: feesInfo.q4_2020_filed_status ? 'Yes' : 'No',
        q4_2020_filed_date: feesInfo.q4_2020_filed_date,
        q4_2020_amount_filed: feesInfo.q4_2020_amount_filed,
        q4_2020_benefits: feesInfo.q4_2020_benefits,
        q4_2020_eligibility_basis: feesInfo.q4_2020_eligibility_basis,
        // ERC Filed Quarter wise 2021 fields
        q1_2021_filed_status: feesInfo.q1_2021_filed_status ? 'Yes' : 'No',
        q1_2021_filed_date: feesInfo.q1_2021_filed_date,
        q1_2021_amount_filed: feesInfo.q1_2021_amount_filed,
        q1_2021_benefits: feesInfo.q1_2021_benefits,
        q1_2021_eligibility_basis: feesInfo.q1_2021_eligibility_basis,
        q2_2021_filed_status: feesInfo.q2_2021_filed_status ? 'Yes' : 'No',
        q2_2021_filed_date: feesInfo.q2_2021_filed_date,
        q2_2021_amount_filed: feesInfo.q2_2021_amount_filed,
        q2_2021_benefits: feesInfo.q2_2021_benefits,
        q2_2021_eligibility_basis: feesInfo.q2_2021_eligibility_basis,
        q3_2021_filed_status: feesInfo.q3_2021_filed_status ? 'Yes' : 'No',
        q3_2021_filed_date: feesInfo.q3_2021_filed_date,
        q3_2021_amount_filed: feesInfo.q3_2021_amount_filed,
        q3_2021_benefits: feesInfo.q3_2021_benefits,
        q3_2021_eligibility_basis: feesInfo.q3_2021_eligibility_basis,
        q4_2021_filed_status: feesInfo.q4_2021_filed_status ? 'Yes' : 'No',
        q4_2021_filed_date: feesInfo.q4_2021_filed_date,
        q4_2021_amount_filed: feesInfo.q4_2021_amount_filed,
        q4_2021_benefits: feesInfo.q4_2021_benefits,
        q4_2021_eligibility_basis: feesInfo.q4_2021_eligibility_basis,
        // ERC Letter, Check & Amount 2020 fields
        q1_2020_loop: feesInfo.q1_2020_loop,
        q1_2020_letter: feesInfo.q1_2020_letter ? 'Yes' : 'No',
        q1_2020_check: feesInfo.q1_2020_check ? 'Yes' : 'No',
        q1_2020_chq_amt: feesInfo.q1_2020_chq_amt,
        q2_2020_loop: feesInfo.q2_2020_loop,
        q2_2020_letter: feesInfo.q2_2020_letter ? 'Yes' : 'No',
        q2_2020_check: feesInfo.q2_2020_check ? 'Yes' : 'No',
        q2_2020_chq_amt: feesInfo.q2_2020_chq_amt,
        q3_2020_loop: feesInfo.q3_2020_loop,
        q3_2020_letter: feesInfo.q3_2020_letter ? 'Yes' : 'No',
        q3_2020_check: feesInfo.q3_2020_check ? 'Yes' : 'No',
        q3_2020_chq_amt: feesInfo.q3_2020_chq_amt,
        q4_2020_loop: feesInfo.q4_2020_loop,
        q4_2020_letter: feesInfo.q4_2020_letter ? 'Yes' : 'No',
        q4_2020_check: feesInfo.q4_2020_check ? 'Yes' : 'No',
        q4_2020_chq_amt: feesInfo.q4_2020_chq_amt,
        // ERC Letter, Check & Amount 2021 fields
        q1_2021_loop: feesInfo.q1_2021_loop,
        q1_2021_letter: feesInfo.q1_2021_letter ? 'Yes' : 'No',
        q1_2021_check: feesInfo.q1_2021_check ? 'Yes' : 'No',
        q1_2021_chq_amt: feesInfo.q1_2021_chq_amt,
        q2_2021_loop: feesInfo.q2_2021_loop,
        q2_2021_letter: feesInfo.q2_2021_letter ? 'Yes' : 'No',
        q2_2021_check: feesInfo.q2_2021_check ? 'Yes' : 'No',
        q2_2021_chq_amt: feesInfo.q2_2021_chq_amt,
        q3_2021_loop: feesInfo.q3_2021_loop,
        q3_2021_letter: feesInfo.q3_2021_letter ? 'Yes' : 'No',
        q3_2021_check: feesInfo.q3_2021_check ? 'Yes' : 'No',
        q3_2021_chq_amt: feesInfo.q3_2021_chq_amt,
        q4_2021_loop: feesInfo.q4_2021_loop,
        q4_2021_letter: feesInfo.q4_2021_letter ? 'Yes' : 'No',
        q4_2021_check: feesInfo.q4_2021_check ? 'Yes' : 'No',
        q4_2021_chq_amt: feesInfo.q4_2021_chq_amt,
        // Success Fee Invoice Details - I Invoice
        i_invoice_no: feesInfo.i_invoice_no,
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
        i_invoice_aff_ref_share: feesInfo.i_invoice_aff_ref_share,
        // Success Fee Invoice Details - II Invoice
        ii_invoice_no: feesInfo.ii_invoice_no,
        ii_invoice_amount: feesInfo.ii_invoice_amount,
        ii_invoiced_qtrs: feesInfo.ii_invoiced_qtrs,
        ii_invoice_sent_date: feesInfo.ii_invoice_sent_date,
        ii_invoice_payment_type: feesInfo.ii_invoice_payment_type,
        ii_invoice_payment_date: feesInfo.ii_invoice_payment_date,
        ii_invoice_pay_cleared: feesInfo.ii_invoice_pay_cleared,
        ii_invoice_pay_returned: feesInfo.ii_invoice_pay_returned,
        ii_invoice_return_reason: feesInfo.ii_invoice_return_reason,
        ii_invoice_occams_share: feesInfo.ii_invoice_occams_share,
        ii_invoice_aff_ref_share: feesInfo.ii_invoice_aff_ref_share,
        // Success Fee Invoice Details - III Invoice
        iii_invoice_no: feesInfo.iii_invoice_no,
        iii_invoice_amount: feesInfo.iii_invoice_amount,
        iii_invoiced_qtrs: feesInfo.iii_invoiced_qtrs,
        iii_invoice_sent_date: feesInfo.iii_invoice_sent_date,
        iii_invoice_payment_type: feesInfo.iii_invoice_payment_type,
        iii_invoice_payment_date: feesInfo.iii_invoice_payment_date,
        iii_invoice_pay_cleared: feesInfo.iii_invoice_pay_cleared,
        iii_invoice_pay_returned: feesInfo.iii_invoice_pay_returned,
        iii_invoice_return_reason: feesInfo.iii_invoice_return_reason,
        iii_invoice_occams_share: feesInfo.iii_invoice_occams_share,
        iii_invoice_aff_ref_share: feesInfo.iii_invoice_aff_ref_share,
        // Success Fee Invoice Details - IV Invoice
        iv_invoice_no: feesInfo.iv_invoice_no,
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

        // fulfilment
          // Input section
          income_2019: fulfilmentData.income_2019 || '',
          income_2020: fulfilmentData.income_2020 || '',
          income_2021: fulfilmentData.income_2021 || '',
          
          // Output section
          stc_amount_2020: fulfilmentData.stc_amount_2020 || '',
          stc_amount_2021: fulfilmentData.stc_amount_2021 || '',
          // Credit Amount & Fee
          maximum_credit: fulfilmentData.maximum_credit || '',
          actual_credit: fulfilmentData.actual_credit || '',
          estimated_fee: fulfilmentData.estimated_fee || '',
          actual_fee: fulfilmentData.actual_fee || '',
          years: fulfilmentData.years || '',


        // Other Info
        milestone: milestone?.value || project?.milestone,
        milestone_stage: projectStage?.value || project?.stage_name,
        owner: owner?.value || '',
        contact: selectedContact?.value || ''
      };

      //console.log('Mapped data for API:', mappedData);

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
      //console.log('API response:', responseData);

      // Check if the response indicates success
      if (response.ok && (responseData.success || responseData.status === 1)) {
        // Exit edit mode if we're in edit mode
        if (isEditMode) {
          setIsEditMode(false);
        }

        // Show SweetAlert success message
        Swal.fire({
          title: 'Success!',
          text: 'Project updated successfully! Your changes have been submitted.',
          icon: 'success',
          confirmButtonColor: '#28a745',
          confirmButtonText: 'OK'
        });
      } else {
        // Handle API error
        const errorMessage = responseData.message || 'Server returned an error';
        throw new Error(errorMessage);
      }
    } catch (error) {
      // Handle any errors that occurred during the process
      console.error('Error updating project:', error);

      // Show SweetAlert error message
      Swal.fire({
        title: 'Error!',
        text: 'Error updating project: ' + (error.message || 'An unknown error occurred'),
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
    } finally {
      // Reset loading state
      setIsUpdating(false);
    }
  };

  const handlePersonalInfoUpdateProject = async (data) => {
    try {
      // Set loading state
      setIsUpdating(true);
      // Exit edit mode if we're in edit mode
      if (isEditMode) {
        setIsEditMode(false);
      }
    } catch (error) {
      // Handle any errors that occurred during the process
      console.error('Error project:', error);

      // Show SweetAlert error message
      Swal.fire({
        title: 'Error!',
        text: 'Error project: ' + (error.message || 'An unknown error occurred'),
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
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
  // if (loading) {
  //   return (
  //     <div className="container-fluid">
  //       <div className="row justify-content-center mt-5">
  //         <div className="col-md-8 text-center">
  //           <div className="spinner-border text-primary" role="status">
  //             <span className="visually-hidden">Loading...</span>
  //           </div>
  //           <p className="mt-2">Loading project details...</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

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
        {loading &&(
            <div className="white_card card_height_100 mb_30">
              <div className="white_card_header">
                <div className="box_header m-0 justify-content-between">
                  <h4 className="iris-lead-name">Project Details</h4>
                  <div>
                  </div>
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
                  {project && project.lead_id &&  (
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
                  )}
                </ul>
              </div>
              <div className="white_card_body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="text-center my-5">
                        <svg class="loader" viewBox="0 0 200 100">
                          <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stop-color="#007bff" />
                          <stop offset="100%" stop-color="#ff6600" />
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
          {!loading &&(
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
                      <ProjectTab
                        project={project}
                        isEditMode={isEditMode}
                        errors={errors}
                        register={register}
                        setProject={setProject}
                        DateInput={DateInput}
                        companyFolderLink={companyFolderLink}
                        documentFolderLink={documentFolderLink}
                        toggleEditMode={toggleEditMode}
                      />
                    )}
                    {/* Fulfilment Tab Content */}
                    {activeTab === 'fulfilment' && (
                      <FulfilmentTab
                        fulfilmentError={fulfilmentError}
                        fulfilmentLoading={fulfilmentLoading}
                        fulfilmentData={fulfilmentData}
                        setFulfilmentData={setFulfilmentData}
                      />
                    )}
                    {/* Bank Info Tab */}
                    {activeTab === 'bankInfo' && (
                      <BankInfoTab
                        bankInfo={bankInfo}
                        setBankInfo={setBankInfo}
                        bankInfoLoading={bankInfoLoading}
                        bankInfoError={bankInfoError}
                        fetchBankInfo={fetchBankInfo}
                      />
                    )}

                    {/* Intake Tab Content */}
                    {activeTab === 'intake' && (
                      <IntakeTab
                        intakeInfo={intakeInfo}
                        setIntakeInfo={setIntakeInfo}
                        companyFolderLink={companyFolderLink}
                        documentFolderLink={documentFolderLink}
                        intakeInfoLoading={intakeInfoLoading}
                        intakeInfoError={intakeInfoError}
                        DateInput={DateInput}
                      />
                    )}

                    {/* Fees Tab Content */}
                    {activeTab === 'fees' && (
                      <FeesTab
                        feesInfo={feesInfo}
                        setFeesInfo={setFeesInfo}
                        feesInfoLoading={feesInfoLoading}
                        feesInfoError={feesInfoError}
                        DateInput={DateInput}
                      />
                    )}

                    {/* Documents Tab Content */}
                    {activeTab === 'documents' && (
                      <DocumentsTab
                        ercDocuments={ercDocuments}
                        companyDocuments={companyDocuments}
                        otherDocuments={otherDocuments}
                        payrollDocuments={payrollDocuments}
                        stcRequiredDocuments={stcRequiredDocuments}
                        stcImpactedDays={stcImpactedDays}
                        documentsLoading={documentsLoading}
                        STCDocumentTable={STCDocumentTable}
                        STCImpactedDaysTable={STCImpactedDaysTable}
                        DocumentTable={DocumentTable}
                      />
                    )}

                    {/* Invoices Tab Content */}
                      {activeTab === 'invoices' && (
                        <InvoicesTab
                          invoices={invoices}
                          setInvoices={setInvoices}
                          loading={loading}
                          error={error}
                        />
                      )}



                    {/* Audit Logs Tab Content */}
                    {activeTab === 'auditLogs' && (
                      <AuditLogsTab
                        auditLogsData={auditLogsData}
                        setAuditLogsData={setAuditLogsData}
                        auditLogsLoading={auditLogsLoading}
                        auditLogsError={auditLogsError}
                        auditLogsSearch={auditLogsSearch}
                        filterAndSortAuditData={filterAndSortAuditData}
                        getPaginatedData={getPaginatedData}
                        renderSortIcon={renderSortIcon}
                        formatAuditDate={formatAuditDate}
                        renderPaginationControls={renderPaginationControls}
                        isAuditData={isAuditData}
                      />
                    )}

                    {activeTab !== 'documents' ? (
                        <div className="mt-4">
                          <div className="action-buttons d-flex align-items-center justify-content-center">
                            {(!loading && !intakeInfoLoading && !fulfilmentLoading && !auditLogsLoading && !feesInfoLoading && !bankInfoLoading) && ( 
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
                            )}
                          </div>

                        </div>
                    ) : null}

                  </div>

                  {/* Right Side Section - Same for all tabs */}
                  <div className="col-md-3">
                    <ProjectSidebar
                      milestone={milestone}
                      stage={projectStage}
                      isEditing={isEditing}
                      startEditingMilestoneStage={startEditingMilestoneStage}
                      owner={owner}
                      isEditingOwner={isEditingOwner}
                      startEditingOwner={startEditingOwner}
                      ownerOptions={ownerOptions}
                      handleOwnerChange={handleOwnerChange}
                      collaborators={collaborators}
                      collaboratorOptions={collaboratorOptions}
                      selectedCollaborator={selectedCollaborator}
                      handleCollaboratorChange={handleCollaboratorChange}
                      handleAssignCollaborator={handleAssignCollaborator}
                      currentCollaborators={currentCollaborators}
                      handleRemoveCollaborator={handleRemoveCollaborator}
                      collaboratorLoading={collaboratorLoading}
                      contact={selectedContact}
                      isEditingContact={isEditingContact}
                      startEditingContact={startEditingContact}
                      contactOptions={contactOptions}
                      handleContactChange={handleContactChange}
                      assignedCollaborators={currentCollaborators}
                      isAssigningCollaborator={collaboratorLoading}
                      saveMilestoneAndStage={saveMilestoneAndStage}
                      cancelMilestoneStageEdit={cancelMilestoneStageEdit}
                      milestones={milestones}
                      milestoneStages={milestoneStages}
                      handleMilestoneChange={handleMilestoneChange}
                      handleProjectStageChange={handleProjectStageChange}
                      isLoadingMilestones={isLoadingMilestones}
                      isLoadingStages={isLoadingStages}
                      saveOwner={saveOwner}
                      cancelOwnerEdit={cancelOwnerEdit}
                      ownerLoading={ownerLoading}
                      saveContact={saveContact}
                      cancelContactEdit={cancelContactEdit}
                      contactLoading={contactLoading}
                    />
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
          )}
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
`;

if (!document.head.querySelector('style[data-datepicker-styles]')) {
  style.setAttribute('data-datepicker-styles', 'true');
  document.head.appendChild(style);
}