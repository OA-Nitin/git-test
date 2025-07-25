import React, { useState, useEffect, forwardRef } from 'react';
import Select from 'react-select';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import InvoiceAddLeadModal from './InvoiceAddLeadModal';
import Swal from 'sweetalert2';
import { isEmail } from './create-invoice-validation';
// Utility to get current user from localStorage
export const getCurrentUserInvoice = () => {
  try {
    const userObj = JSON.parse(localStorage.getItem("user"));
    //console.log('userObj', userObj);
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

const InvoiceCustomerSection = forwardRef(({
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
  onLeadInfoFetched
}, ref) => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [billingProfiles, setBillingProfiles] = useState([]);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [isLeadInfoLoading, setIsLeadInfoLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [products, setProducts] = useState([]);
  const [isProductLoading, setIsProductLoading] = useState(true);
  const [additionalEmails, setAdditionalEmails] = useState([]);
  const [additionalEmailErrors, setAdditionalEmailErrors] = useState([]);
  const [nextEmailId, setNextEmailId] = useState(1);
  const [leadSelectedBillingProfileId, setLeadSelectedBillingProfileId] = useState('');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [parentProductEnabled, setParentProductEnabled] = useState(false);

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

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://play.occamsadvisory.com/portal/wp-json/v1/lead_list');
        const data = await response.json();
        const formattedLeads = data.map(lead => ({
          value: lead.lead_id,
          label: lead.business_legal_name + ' - ('+ lead.lead_id +')' || 'Unnamed Lead'
        }));
        setLeads(formattedLeads);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeads();
  }, []);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsProductLoading(true);
        const response = await fetch('https://play.occamsadvisory.com/portal/wp-json/v1/products_list');
        const data = await response.json();
        if (data.success && Array.isArray(data.data.products)) {
          setProducts(data.data.products);
        } else if (data.data && Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        setProducts([]);
        console.error('Error fetching products:', error);
      } finally {
        setIsProductLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Update selectedLead when formData.lead changes
  useEffect(() => {
    if (formData.lead) {
      const lead = leads.find(l => l.value === formData.lead);
      setSelectedLead(lead || null);
    } else {
      setSelectedLead(null);
    }
  }, [formData.lead, leads]);

  // Handler to update all customer fields and select the new lead after lead creation
  const handleLeadInfoFetched = (leadData, leadId) => {
    // Add new lead to leads array if not present
    setLeads(prevLeads => {
      const exists = prevLeads.some(l => l.value === leadId);
      if (!exists) {
        return [
          ...prevLeads,
          {
            value: leadId,
            label: (leadData.business_legal_name || null) + ' - (' + leadId + ')'
          }
        ];
      }
      return prevLeads;
    });

    setFormData(prev => ({
      ...prev,
      lead: leadId,
      leadId: leadId,
      'lead_id-paste': leadId,
      billing_profile: '2',
      customer_name: leadData.authorized_signatory_name || '',
      business_name: leadData.business_legal_name || '',
      phone_no: (leadData.business_phone || '').replace(/-/g, ''),
      email: leadData.business_email || '',
      address: leadData.street_address || '',
      city: leadData.city || '',
      state: leadData.state || '',
      zip: leadData.zip || '',
      country: leadData.country || '',
      sales_email: leadData.sales_email || '',
      bcc_email: leadData.affiliate_email || ''
    }));

    // Set the selected lead in the dropdown
    setSelectedLead({
      value: leadId,
      label: (leadData.business_legal_name || null) + ' - (' + leadId + ')'
    });

    // Enable parent product dropdown
    setParentProductEnabled(true);
  };

  // Remove fetchBillingProfile and related useEffect

  const fetchLeadInfo = async (leadId) => {
    try {
      setIsLeadInfoLoading(true);
      const formDataApi = new URLSearchParams();
      formDataApi.append('lead_id', leadId);

      const response = await fetch('https://play.occamsadvisory.com/portal/wp-json/v1/get_lead_info_by_id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDataApi
      });
      const data = await response.json();
      //console.log('Lead Info Response:', data);
      
      if (data.code === 'success') {
        const leadData = data.data;
        //console.log('Processing lead data:', leadData);
        
        const business_phone = (leadData.business_phone || '').replace(/-/g, '');
        const country = leadData.country || 'USA';

        // Map state name to abbreviation if needed
        let stateValue = leadData.state || '';
        if (stateValue) {
          // If it's not an abbreviation, try to find the abbreviation by name
          const abbr = Object.entries(states).find(([abbr, name]) => {
            return (
              name.toLowerCase() === stateValue.toLowerCase() ||
              abbr.toLowerCase() === stateValue.toLowerCase()
            );
          });
          if (abbr) stateValue = abbr[0];
        }

        setFormData(prevFormData => ({
          ...prevFormData,
          customer_name: leadData.authorized_signatory_name || '',
          business_name: leadData.business_legal_name || '',
          zip: leadData.zip || '',
          address: leadData.street_address || '',
          city: leadData.city || '',
          state: stateValue,
          country: country,
          phone_no: business_phone,
          email: leadData.business_email || '',
          sales_email: leadData.sales_email || '',
          bcc_email: leadData.affiliate_email || ''
        }));

        // If fee_type is present, set it in the product section
        if (leadData.fee_type && setFeeTypeToProductSection) {
          setFeeTypeToProductSection(leadData.fee_type);
        }

      } else {
        console.warn('Lead info not found or API error:', data);
        const fieldsToClear = [
          'customer_name', 'business_name', 'zip', 'address', 
          'city', 'state', 'country', 'phone_no', 'email', 'sales_email'
        ];
        setFormData(prevFormData => {
          const updatedData = { ...prevFormData };
          fieldsToClear.forEach(field => {
            updatedData[field] = '';
          });
          return updatedData;
        });
      }
    } catch (error) {
      console.error('Error fetching lead info:', error);
    } finally {
      setIsLeadInfoLoading(false);
    }
  };

  const handleLeadChange = async (selectedOption) => {
    //console.log('handleLeadChange: selectedOption', selectedOption);
    
    // Update form data with lead ID directly using setFormData
    setFormData(prevFormData => ({
      ...prevFormData,
      lead: selectedOption ? selectedOption.value : '',
      leadId: selectedOption ? selectedOption.value : '',
      'lead_id-paste': selectedOption ? selectedOption.value : '',
      billing_profile: '2' // Always set static value
    }));

    // Update the selected lead state for react-select
    setSelectedLead(selectedOption);

    // Enable or disable parent product dropdown based on lead selection
    if (selectedOption) {
      setParentProductEnabled(true);
    } else {
      setParentProductEnabled(false);
    }

    if (selectedOption) {
      try {
        // Only fetch lead info now
        await fetchLeadInfo(selectedOption.value);
        // Ensure lead selection is maintained after API calls
        setSelectedLead(selectedOption);
        // Ensure lead IDs are maintained after API calls
        setFormData(prevFormData => ({
          ...prevFormData,
          leadId: selectedOption.value,
          'lead_id-paste': selectedOption.value,
          billing_profile: '2'
        }));
      } catch (error) {
        console.error('Error fetching lead data:', error);
      }
    } else {
      // Clear all fields when no lead is selected
      const fieldsToClear = [
        'customer_name', 'business_name', 'zip', 'address', 
        'city', 'state', 'country', 'phone_no', 'email', 'sales_email'
      ];
      fieldsToClear.forEach(field => {
        handleChange({
          target: {
            name: field,
            value: ''
          }
        });
      });
      // Clear lead-related fields
      setFormData(prevFormData => ({
        ...prevFormData,
        lead: '',
        leadId: '',
        'lead_id-paste': '',
        billing_profile: '2'
      }));
    }
  };

  // Function to add new email field
  const handleAddEmail = () => {
    if (additionalEmails.length < 5) {
      setAdditionalEmails([...additionalEmails, { id: nextEmailId, value: '' }]);
      setAdditionalEmailErrors([...additionalEmailErrors, '']); // Add empty error for new field
      setNextEmailId(nextEmailId + 1);
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

  // Add this function to handle product change
  const handleProductChange = async (e) => {
    const selectedValue = e.target.value;

    setFormData(prevFormData => {
      const updatedFormData = {
        ...prevFormData,
        invoice_parent_product: selectedValue
      };

      // Trigger fetchServices with the new product value and the billing profile from the updated form data
      if (selectedValue && updatedFormData.billing_profile) {
        /*console.log('Triggering fetchServices with:', {
          productId: selectedValue,
          billingProfile: updatedFormData.billing_profile
        }); */
        fetchServices(selectedValue, updatedFormData.billing_profile);
      } else if (!selectedValue) {
        // If product is cleared, also clear fetched available product/service heads
        if (onProductServiceHeadsUpdate) onProductServiceHeadsUpdate([]);
      }
      return updatedFormData;
    });

    // Only call the LoOP quarter fetch API if selectedValue == 935
    if (selectedValue == 935) {
      // Get lead_id from hidden input
      const leadIdInput = document.getElementById('leadId');
      const lead_id = leadIdInput ? leadIdInput.value : '';
      // Get billingProfile from selected dropdown
      const billingProfileSelect = document.querySelector('select[name="billing_profile"]');
      const billingProfile = billingProfileSelect ? billingProfileSelect.value : '';
      if (selectedValue && billingProfile && lead_id) {
        const loopParams = new URLSearchParams({
          product_id: selectedValue,
          billingProfile: billingProfile,
          lead_id: lead_id
        }).toString();
        try {
          const loopResponse = await fetch('https://play.occamsadvisory.com/portal/wp-json/v1/erc_product_loOP_quarter_fetch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: loopParams
          });
          const loopData = await loopResponse.json();
          if (loopData.result === 'success') {
            // Instead of injecting HTML, call the prop to add product line items
            if (onAddProductLineItems && Array.isArray(loopData.jsondata)) {
              onAddProductLineItems(loopData.jsondata);
            }
          } else {
            // Show message in Swal popup
            await Swal.fire({
              icon: 'warning',
              text: loopData.message || 'Unknown error',
              confirmButtonText: 'OK',
              allowOutsideClick: false
            });
          }
        } catch (err) {
          console.error('Error calling erc_product_loOP_quarter_fetch:', err);
        }
      }
    }

    // Fetch next invoice number when product is selected
    if (selectedValue) {
      try {
        const response = await fetch('https://play.occamsadvisory.com/portal/wp-json/v1/get_next_customer_invoice_number');
        const data = await response.json();
        if (data.customer_invoice_no) {
          // Get product code based on product ID
          let product_code = '';
          if(selectedValue == 932) {
            product_code = 'RDC';
          } else if(selectedValue == 934) {
            product_code = 'AAR';
          } else if(selectedValue == 935) {
            product_code = 'ERC';
          } else if(selectedValue == 936) {
            product_code = 'TAX';
          } else if(selectedValue == 937) {
            product_code = 'STC';
          } else if(selectedValue == 938) {
            product_code = 'PAR';
          }

          // Set the invoice number with product code prefix only for product_customer_invoice_no
          setFormData(prevFormData => ({
            ...prevFormData,
            product_customer_invoice_no: product_code ? `${product_code}-${data.customer_invoice_no}` : data.customer_invoice_no,
            custom_customer_invoice_no: data.customer_invoice_no,
            customer_invoice_no: data.customer_invoice_no
          }));
        }
      } catch (error) {
        console.error('Error fetching next invoice number:', error);
      }
    }
  };

  // Add this function to handle billing profile change
  const handleBillingProfileChange = (e) => {
    const selectedValue = e.target.value;

    setFormData(prevFormData => {
      const updatedFormData = {
        ...prevFormData,
        billing_profile: selectedValue
      };

      // Trigger fetchServices with the product value from the updated form data and the new billing profile
      if (updatedFormData.invoice_parent_product && selectedValue) {
        /*console.log('Triggering fetchServices with:', {
          productId: updatedFormData.invoice_parent_product,
          billingProfile: selectedValue
        }); */
        fetchServices(updatedFormData.invoice_parent_product, selectedValue);
      } else if (!selectedValue) {
        // If billing profile is cleared, also clear fetched available product/service heads
        if (onProductServiceHeadsUpdate) onProductServiceHeadsUpdate([]);
      }
      return updatedFormData;
    });
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

  // Call product-service-head-list API when parent product or billing profile changes (no lead dependency)
  useEffect(() => {
    if (formData.invoice_parent_product && formData.billing_profile) {
      fetchServices(formData.invoice_parent_product, formData.billing_profile);
    }
  }, [formData.invoice_parent_product, formData.billing_profile]);

  return (
    <div className="p-3 mb-4 rounded border invoice-bill" ref={ref}>
        <div className="row">
      <div className="col-md-8 bill-to">
        <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">Select Lead*</label>
          {isLoading ? (
            <div className="form-select">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <small className="ms-2 text-xs text-muted">Loading...</small>
            </div>
          ) : (
            <>
            <Select
              id="lead"
              name="lead"
              options={leads}
              onChange={(selectedOption) => {
                handleLeadChange(selectedOption);
              }}
              placeholder="Select Lead"
              isClearable
              isSearchable
              styles={customStyles}
              className="basic-single"
              classNamePrefix="select"
              value={selectedLead}
              noOptionsMessage={() => "No leads found"}
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary: '#007bff',
                  primary75: '#3395ff',
                  primary50: '#66b3ff',
                  primary25: '#99ccff'
                }
              })}
              onFocus={handleFieldFocus}
              onBlur={handleFieldBlur}
            />
            {showError('lead') && <span className="error-message">{formErrors.lead}</span>}
            </>
          )}
        </div>
        <div className="col-md-4">
          <label className="form-label">Billing Source*</label>
          <select
            className="form-select"
            name="billing_profile"
            value={formData.billing_profile || '2'}
            onChange={handleBillingProfileChange}
            disabled
            onFocus={handleFieldFocus}
            onBlur={handleFieldBlur}
          >
            <option value="2">Quickbook Play</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Select Product*</label>
          <select
            id="invoice_parent_product"
            className="form-select"
            name="invoice_parent_product"
            value={formData.invoice_parent_product || ''}
            onChange={handleProductChange}
            onFocus={handleFieldFocus}
            onBlur={handleFieldBlur}
            disabled={!formData.lead || !parentProductEnabled}
          >
            <option value="">Select Product</option>
            {products.map(product => (
              <option key={product.product_id || product.id} value={product.product_id || product.id}>
                {product.product_title || product.label || product.name}
              </option>
            ))}
          </select>
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
          <label className="form-label">Zip Code</label>
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
          <label className="form-label">Country</label>
          <input className="form-control" name="country" value={formData.country || ''} onChange={handleChange} />
          {showError('country') && <span className="error-message">{formErrors.country}</span>}
        </div>
        <div className="col-md-3">
          <label className="form-label">State</label>
          <select className="form-select" name="state" value={formData.state || ''} onChange={handleChange}>
            <option value="">Select State</option>
            {Object.entries(states).map(([abbr, name]) => (
              <option key={abbr} value={abbr}>{name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">City</label>
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
        <div className="col-md-3 mb-2 d-flex align-items-end">
          <button type="button" className="btn add-customer-btn w-100" onClick={() => setShowAddLeadModal(true)}>+ Add Lead</button>
        </div>
        </div>
      </div>
     <div className="col-md-4 bill-invoice">

          <div className="mb-2">
            <label className="form-label">Invoice No.*</label>
            <input 
              
              className="form-control" 
              name="product_customer_invoice_no" 
              value={formData.product_customer_invoice_no || ''} 
              placeholder="To Be Autogenerated"
              disabled
            />
            <input 
              type="hidden" 
              name="custom_customer_invoice_no" 
              value={formData.custom_customer_invoice_no || ''} 
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
              value={formData.leadId || ''} 
            />
            <input 
              type="hidden" 
              name="lead_id-paste" 
              value={formData['lead_id-paste'] || ''} 
            />
            <input 
              type="hidden" 
              name="merchant_id" 
              value={formData.merchant_id || ''} 
            />
            <input 
              type="hidden" 
              name="invoice_status" 
              value="2" 
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
                value={email.value}
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
          <input type="hidden" name="other_emails" value={additionalEmails.filter(e => e.value).map(e => e.value).join(',')} />
          
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
    {/* Add Lead Modal */}
    <InvoiceAddLeadModal show={showAddLeadModal} onClose={() => setShowAddLeadModal(false)}
      onLeadInfoFetched={handleLeadInfoFetched}
    />
  </div>
);
});

export default InvoiceCustomerSection;
