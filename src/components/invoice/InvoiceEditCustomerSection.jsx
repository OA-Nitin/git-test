import React, { useState, useEffect, forwardRef } from 'react';
import Select from 'react-select';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
import { isEmail } from './create-invoice-validation';
// Utility to get current user from localStorage
export const getCurrentUserInvoice = () => {
  try {
    const userObj = JSON.parse(localStorage.getItem("user"));
    return userObj?.user || userObj?.data?.user || null;
  } catch (err) {
    console.error("Failed to parse user from localStorage:", err);
    return null;
  }
};

const customStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '38px',
    backgroundColor: '#fff',
    borderColor: state.isFocused ? '#80bdff' : '#ced4da',
    boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0,123,255,.25)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#80bdff' : '#ced4da'
    }
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderRadius: '4px',
    marginTop: '4px'
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected 
      ? '#007bff' 
      : state.isFocused 
        ? '#f8f9fa' 
        : '#fff',
    color: state.isSelected ? '#fff' : '#212529',
    cursor: 'pointer',
    padding: '8px 12px',
    '&:hover': {
      backgroundColor: state.isSelected ? '#007bff' : '#f8f9fa'
    }
  }),
  singleValue: (base) => ({
    ...base,
    color: '#212529'
  }),
  input: (base) => ({
    ...base,
    color: '#212529'
  }),
  placeholder: (base) => ({
    ...base,
    color: '#6c757d'
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: '#6c757d',
    padding: '8px 12px'
  }),
  loadingMessage: (base) => ({
    ...base,
    color: '#6c757d',
    padding: '8px 12px'
  }),
  clearIndicator: (base) => ({
    ...base,
    color: '#6c757d',
    '&:hover': {
      color: '#343a40'
    }
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#6c757d',
    '&:hover': {
      color: '#343a40'
    }
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px 0',
    maxHeight: '200px'
  })
};

// US States for dropdown
const states = {
  "AL": "Alabama",
  "AK": "Alaska",
  "AZ": "Arizona",
  "AR": "Arkansas",
  "CA": "California",
  "CO": "Colorado",
  "CT": "Connecticut",
  "DE": "Delaware",
  "FL": "Florida",
  "GA": "Georgia",
  "HI": "Hawaii",
  "ID": "Idaho",
  "IL": "Illinois",
  "IN": "Indiana",
  "IA": "Iowa",
  "KS": "Kansas",
  "KY": "Kentucky",
  "LA": "Louisiana",
  "ME": "Maine",
  "MD": "Maryland",
  "MA": "Massachusetts",
  "MI": "Michigan",
  "MN": "Minnesota",
  "MS": "Mississippi",
  "MO": "Missouri",
  "MT": "Montana",
  "NE": "Nebraska",
  "NV": "Nevada",
  "NH": "New Hampshire",
  "NJ": "New Jersey",
  "NM": "New Mexico",
  "NY": "New York",
  "NC": "North Carolina",
  "ND": "North Dakota",
  "OH": "Ohio",
  "OK": "Oklahoma",
  "OR": "Oregon",
  "PA": "Pennsylvania",
  "RI": "Rhode Island",
  "SC": "South Carolina",
  "SD": "South Dakota",
  "TN": "Tennessee",
  "TX": "Texas",
  "UT": "Utah",
  "VT": "Vermont",
  "VA": "Virginia",
  "WA": "Washington",
  "WV": "West Virginia",
  "WI": "Wisconsin",
  "WY": "Wyoming",
  "DC": "District of Columbia",
  "AS": "American Samoa",
  "GU": "Guam",
  "MP": "Northern Mariana Islands",
  "PR": "Puerto Rico",
  "UM": "United States Minor Outlying Islands",
  "VI": "Virgin Islands, U.S."
};

// Product ID to Title mapping
const productTitles = {
  932: "RDC",
  934: "Audit Advisory",
  935: "ERC",
  936: "Tax Amendment",
  937: "STC",
  938: "Partnership"
};

const InvoiceEditCustomerSection = forwardRef(({
  formData,
  handleChange,
  setFormData,
  onProductServiceHeadsUpdate,
  onAddProductLineItems, // <-- add this prop
  setFeeTypeToProductSection, // <-- add this prop
  formErrors,
  showError,
  handleFieldFocus,
  handleFieldBlur,
}, ref) => {

  const [isLoading, setIsLoading] = useState(true);
  const [billingProfiles, setBillingProfiles] = useState([]);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [isLeadInfoLoading, setIsLeadInfoLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isProductLoading, setIsProductLoading] = useState(true);
  const [additionalEmails, setAdditionalEmails] = useState([]);
  const [additionalEmailErrors, setAdditionalEmailErrors] = useState([]);
  const [leadSelectedBillingProfileId, setLeadSelectedBillingProfileId] = useState('');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  //console.log('okk');
  //console.log(formData.otherEmails);
  // Initialize additionalEmails from formData.other_emails (comma-separated) on mount or when formData.other_emails changes
  useEffect(() => {
    if (formData.otherEmails) {
      const emails = formData.otherEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);
      setAdditionalEmails(
        emails.map(email => ({ id: Date.now() + Math.random(), value: email }))
      );
      setAdditionalEmailErrors(emails.map(() => ''));
    } else {
      setAdditionalEmails([]);
      setAdditionalEmailErrors([]);
    }
  }, [formData.otherEmails]);

  // Set default due date to today + 10 days if not already set
  useEffect(() => {
    if (!formData.due_date) {
      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + 10);
      const dueDateStr = dueDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, due_date: dueDateStr }));
    }
  }, [formData.due_date, setFormData]);

  // Get user data from localStorage and set merchant_id
  useEffect(() => {
    const currentUser = getCurrentUserInvoice();
    if (currentUser && currentUser.id) {
      setFormData(prevFormData => ({
        ...prevFormData,
        merchant_id: currentUser.id
      }));
    }
  }, [setFormData]);


  // Function to add new email field
  const handleAddEmail = () => {
    if (additionalEmails.length < 5) {
      setAdditionalEmails([...additionalEmails, { id: Date.now(), value: '' }]);
      setAdditionalEmailErrors([...additionalEmailErrors, '']); // Add empty error for new field
    }
  };

  // Function to remove email field
  const handleRemoveEmail = (id) => {
    setAdditionalEmails(additionalEmails.filter(email => email.id !== id));
    setAdditionalEmailErrors(additionalEmailErrors.filter((_, index) => index !== additionalEmails.findIndex(email => email.id === id)));
  };

  // Function to handle additional email changes
  const handleAdditionalEmailChange = (id, value) => {
    setAdditionalEmails(additionalEmails.map(email => 
      email.id === id ? { ...email, value } : email
    ));
    // Validate this email
    setAdditionalEmailErrors(prev => {
      const idx = additionalEmails.findIndex(email => email.id === id);
      const newErrors = [...prev];
      if (value && !isEmail(value)) {
        newErrors[idx] = 'Invalid email';
      } else {
        newErrors[idx] = '';
      }
      return newErrors;
    });
  };

  // Keep formData.other_emails in sync with additionalEmails
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      other_emails: additionalEmails.filter(e => e.value).map(e => e.value).join(',')
    }));
  }, [additionalEmails, setFormData]);

  // Helper to fetch services and pass to parent
  const fetchServices = async (productId, billingProfile) => {
    //console.log('Fetching services for product:', productId, 'and billing profile:', billingProfile);
    if (!productId || !billingProfile) {
      console.log('Missing required parameters for fetchServices');
      if (onProductServiceHeadsUpdate) onProductServiceHeadsUpdate([]);
      return;
    }
    try {
      const formBody = new URLSearchParams({
        product_id: productId,
        billing_profile: billingProfile
      }).toString();
      const response = await fetch('https://play.occamsadvisory.com/portal/wp-json/productsplugin/v1/product-service-head-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody
      });
      const data = await response.json();
      //console.log('Services response:', data);
      if (Array.isArray(data) && data.length > 0) {
        if (onProductServiceHeadsUpdate) onProductServiceHeadsUpdate(data);
      } else {
        await Swal.fire({
          icon: '',
          text: 'No service head available for selected product, please choose the different one.',
          confirmButtonText: 'OK',
          allowOutsideClick: false
        });
        if (onProductServiceHeadsUpdate) onProductServiceHeadsUpdate([]);
      }
    } catch (error) {
      //console.error('Error fetching services:', error);
      if (onProductServiceHeadsUpdate) onProductServiceHeadsUpdate([]);
    }
  };



  // Handler for zip code changes
  const handleZipChange = async (e) => {
    const zip = e.target.value;
    handleChange(e); // still update zip in formData
    if (/^\d{5}$/.test(zip)) {
      try {
        const response = await fetch('https://play.occamsadvisory.com/portal/wp-json/v1/get_location_by_zipcode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zipcode: zip })
        });
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const loc = data[0];
          setFormData(prev => ({
            ...prev,
            city: loc.city || '',
            state: loc.state || '',
            country: loc.country || ''
          }));
        }
      } catch (error) {
        // Optionally handle error
        console.error('Error fetching location by zip:', error);
      }
    }
  };

  // Get product title from product ID
  const productTitle = productTitles[formData.invoice_parent_product] || "";

  return (
    <div className="p-3 mb-4 rounded border invoice-bill" ref={ref}>
        <div className="row">
      <div className="col-md-8 bill-to">
        <div className="row mb-3">
            <div className="col-md-4">
            <label className="form-label">Select Lead*</label>
             <input type="text" name="lead_name" 
              id="lead_name" className="form-control" value={formData.business_name || ''} disabled />
              <input type="hidden" name="lead" 
              id="lead" value={formData.leadId || ''} />
            {showError('lead') && <span className="error-message">{formErrors.lead}</span>}
            </div>
            <div className="col-md-4">
            <label className="form-label">Billing Source*</label>
            <input type="text" name="billing_profile_name" 
            id="billing_profile_name" 
            className="form-control" value="Occams QB" disabled />
            <input type="hidden" name="billing_profile" 
            id="billing_profile" 
            className="form-control" value={formData.billing_profile || ''} />
            </div>
            <div className="col-md-4">
            <label className="form-label">Product*</label>

            {/* Show product title in visible input, and product ID in hidden input */}
            <input
              type="text"
              name="invoice_parent_product_title"
              id="invoice_parent_product_title"
              className="form-select"
              value={productTitle || ''}
              disabled
            />
            <input
              type="hidden"
              name="invoice_parent_product"
              id="invoice_parent_product"
              className="form-select"
              value={formData.invoice_parent_product || ''}
            />
            {showError('invoice_parent_product') && <span className="error-message">{formErrors.invoice_parent_product}</span>}
            </div>
        </div>

        <div className="row mb-3">
        <div className="col-md-3">
          <label className="form-label">Customer Name*</label>
          <input className="form-control" name="customer_name" value={formData.customer_name || ''} onChange={handleChange} onFocus={handleFieldFocus} onBlur={handleFieldBlur}
            onKeyPress={e => {
              const char = String.fromCharCode(e.which);
              if (!/[a-zA-Z ]/.test(char) && !e.ctrlKey && !e.metaKey && e.which !== 8) {
                e.preventDefault();
              }
            }}
          />
          {showError('customer_name') && <span className="error-message">{formErrors.customer_name}</span>}
        </div>
        <div className="col-md-3">
          <label className="form-label">Business Name*</label>
          <input className="form-control" name="business_name" value={formData.business_name || ''} onChange={handleChange} onFocus={handleFieldFocus} onBlur={handleFieldBlur} />
          {showError('business_name') && <span className="error-message">{formErrors.business_name}</span>}
        </div>
        <div className="col-md-3">
          <label className="form-label">Zip Code*</label>
          <input className="form-control" name="zip" value={formData.zip || ''} onChange={handleZipChange} onKeyUp={handleZipChange} onFocus={handleFieldFocus} onBlur={handleFieldBlur}
            onKeyPress={e => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
          />
          {showError('zip') && <span className="error-message">{formErrors.zip}</span>}
        </div>
        <div className="col-md-3">
          <label className="form-label">Address</label>
          <input className="form-control" name="address" value={formData.address || ''} onChange={handleChange} onFocus={handleFieldFocus} onBlur={handleFieldBlur} />
        </div>
        </div>

        <div className="row mb-3">
        <div className="col-md-3 mb-3 ">
          <label className="form-label">Country*</label>
          <input className="form-control" name="country" value={formData.country || ''} onChange={handleChange} />
          {showError('country') && <span className="error-message">{formErrors.country}</span>}
        </div>
        <div className="col-md-3">
          <label className="form-label">State*</label>
          <select className="form-select" name="state" value={formData.state || ''} onChange={handleChange}>
            <option value="">Select State</option>
            {Object.entries(states).map(([abbr, name]) => (
              <option key={abbr} value={abbr}>{name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">City*</label>
          <input className="form-control" name="city" value={formData.city || ''} onChange={handleChange} />
          {showError('city') && <span className="error-message">{formErrors.city}</span>}
        </div>
        <div className="col-md-3">
          <label className="form-label">Phone Number*</label>
          <input className="form-control" name="phone_no" value={formData.phone_no || ''} onChange={handleChange} onFocus={handleFieldFocus} onBlur={handleFieldBlur}
            onKeyPress={e => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
          />
          {showError('phone_no') && <span className="error-message">{formErrors.phone_no}</span>}
        </div>
        </div>
      </div>
     <div className="col-md-4 bill-invoice">

          <div className="mb-2">
            <label className="form-label">Invoice No.*</label>
            <input 
              className="form-control" 
              name="product_customer_invoice_no" 
              value={productTitle+'-'+formData.customer_invoice_no || ''}
              placeholder="#invoiceid"
              disabled
            />
            <input 
              type="hidden" 
              name="custom_customer_invoice_no" 
              value={formData.customer_invoice_no || ''}
            />
            <input 
              id="customer_invoice_no"
              type="hidden" 
              name="customer_invoice_no" 
              value={formData.customer_invoice_no || ''}
            />
            <input 
              id="leadId"
              type="hidden" 
              name="leadId" 
              value={formData.lead || ''}
            />
            <input 
              type="hidden" 
              name="lead_id-paste" 
              value={formData.lead || ''}
            />
            <input 
              type="hidden" 
              name="merchant_id" 
              value={formData.merchant_id || ''}
            />
            <input 
              type="hidden" 
              name="invoice_created_via" 
              value="portal" 
            />
            <input 
              type="hidden" 
              name="api_type" 
              value="create_invoice" 
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Invoice Date*</label>
            <DatePicker
              className="form-control"
              selected={formData.invoice_date ? new Date(formData.invoice_date) : null}
              onChange={async date => {
                const today = new Date();
                today.setHours(0,0,0,0);
                const selectedDate = new Date(date);
                selectedDate.setHours(0,0,0,0);
                if (selectedDate < today) {
                  const result = await Swal.fire({
                    html: "<p>Selecting an older date will create a backdated invoice.</p> <p style='font-weight:800'>Are you sure you want to proceed?</p>",
                    imageUrl:'https://play.occamsadvisory.com/portal/wp-content/plugins/custom-invoice/assets/swal-icon.svg',
                    showCancelButton: true,
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No',
                    confirmButtonColor:'#3085d6',
                    cancelButtonColor: '#FF5C00',
                    reverseButtons: true,
                    customClass: "swal-invoice",
                    allowOutsideClick: false
                  });
                  if (result.isConfirmed) {
                    handleChange({ target: { name: 'invoice_date', value: date.toISOString().split('T')[0] } });
                  } else {
                    // Reset to today
                    handleChange({ target: { name: 'invoice_date', value: today.toISOString().split('T')[0] } });
                  }
                } else {
                  handleChange({ target: { name: 'invoice_date', value: date.toISOString().split('T')[0] } });
                }
              }}
              dateFormat="MM/dd/yyyy"
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Due Date*</label>
            <DatePicker
              className="form-control"
              selected={formData.due_date ? new Date(formData.due_date) : null}
              onChange={date => handleChange({ target: { name: 'due_date', value: date.toISOString().split('T')[0] } })}
              dateFormat="MM/dd/yyyy"
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Email ID (Multiple email with comma separated)*</label>
            <input 
              className="form-control" 
              name="email" 
              value={formData.email || ''} 
              onChange={handleChange} 
              onFocus={handleFieldFocus}
              onBlur={handleFieldBlur}
            />
            {showError('email') && <span className="error-message">{formErrors.email}</span>}
          </div>
          
          {/* Additional Email Fields */}
          {additionalEmails.map((email, idx) => (
            <div key={email.id} className="mb-2 position-relative">
              <input
                className="form-control"
                type="email"
                name='other_email'
                value={email.value || ''}
                onChange={(e) => handleAdditionalEmailChange(email.id, e.target.value)}
                placeholder="Additional Email"
              />
              {additionalEmailErrors[idx] && <div className="text-danger small">{additionalEmailErrors[idx]}</div>}
              <button
                type="button"
                className="btn btn-link text-danger position-absolute"
                style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                onClick={() => handleRemoveEmail(email.id)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}

          {additionalEmails.length < 5 && (
            <p 
              className="text-primary small mt-1" 
              style={{ cursor: 'pointer' }}
              onClick={handleAddEmail}
            >
              <i className="fa fa-plus"></i> Add additional emails
            </p>
          )}
          {/* Hidden field for other_emails */}
          <input type="hidden" name="other_emails" value={additionalEmails.filter(e => e.value).map(e => e.value).join(',') || ''} />
          
          <div className="mb-2 d-flex">
            <label className="form-label" style={{ width: 120 }}>Sales Email</label>
            <input className="form-control" name="sales_email" value={formData.sales_email || ''} onChange={handleChange} />
          </div>
          {showError('sales_email') && <span className="error-message">{formErrors.sales_email}</span>}
          <div className="mb-2 d-flex">
            <label className="form-label" style={{ width: 120 }}>Bcc</label>
            <input className="form-control" name="bcc_email" value={formData.bcc_email || ''} onChange={handleChange} />
          </div>
          {showError('bcc_email') && <span className="error-message">{formErrors.bcc_email}</span>}
        </div>
        
    </div>
  </div>
);
});

export default InvoiceEditCustomerSection;
