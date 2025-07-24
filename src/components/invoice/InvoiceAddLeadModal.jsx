import React, { useState } from 'react';
import Modal from '../common/Modal';
import { isAlphaWithSpace, isAlphanumericWithSpecial, isEmail, isAlphaOnly, isNumericRange } from './create-invoice-validation';

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

const initialForm = {
  authorized_signatory_name: '',
  business_legal_name: '',
  authorized_signatory_email: '',
  authorized_signatory_phone: '',
  zip: '',
  street_address: '',
  city: '',
  state_of_incorporation: '',
  country: 'USA',
};

const InvoiceAddLeadModal = ({ show, onClose, onSubmit, onLeadCreated, onLeadInfoFetched }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [apiMessage, setApiMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const validate = (values) => {
    const errs = {};
    // Customer Name: required, only alphabets and one space, no special characters
    if (!values.authorized_signatory_name) {
      errs.authorized_signatory_name = 'Customer Name is required.';
    } else if (!isAlphaWithSpace(values.authorized_signatory_name)) {
      errs.authorized_signatory_name = 'Only alphabets and a single space allowed.';
    } else if (values.authorized_signatory_name.length > 25) {
      errs.authorized_signatory_name = 'Max 25 characters.';
    }
    // Business Name: required, alphanumeric and special characters allowed
    if (!values.business_legal_name) {
      errs.business_legal_name = 'Business Name is required.';
    } else if (!isAlphanumericWithSpecial(values.business_legal_name)) {
      errs.business_legal_name = 'Business Name can contain alphanumeric and special characters.';
    } else if (values.business_legal_name.length > 25) {
      errs.business_legal_name = 'Max 25 characters.';
    }
    // Email: required, valid
    if (!values.authorized_signatory_email) {
      errs.authorized_signatory_email = 'Email is required.';
    } else if (!isEmail(values.authorized_signatory_email)) {
      errs.authorized_signatory_email = 'Invalid email.';
    }
    // Phone: required, only numeric, 10 digits
    if (!values.authorized_signatory_phone) {
      errs.authorized_signatory_phone = 'Phone is required.';
    } else if (!/^\d{10}$/.test(values.authorized_signatory_phone)) {
      errs.authorized_signatory_phone = 'Phone must be exactly 10 digits.';
    }
    // Zip: required, only numeric, 5 to 6 digits
    if (!values.zip) {
      errs.zip = 'Zip Code is required.';
    } else if (!isNumericRange(values.zip, 5, 6)) {
      errs.zip = 'Zip Code must be 5 or 6 digits.';
    }
    // Address: required, alphanumeric and special characters allowed
    if (!values.street_address) {
      errs.street_address = 'Address is required.';
    } else if (!isAlphanumericWithSpecial(values.street_address)) {
      errs.street_address = 'Address can contain alphanumeric and special characters.';
    }
    // City: required, only alphabets
    if (!values.city) {
      errs.city = 'City is required.';
    } else if (!isAlphaOnly(values.city)) {
      errs.city = 'City can only contain alphabets.';
    }
    // State: required
    if (!values.state_of_incorporation) {
      errs.state_of_incorporation = 'State is required.';
    }
    // Country: required, only alphabets
    if (!values.country) {
      errs.country = 'Country is required.';
    } else if (!isAlphaOnly(values.country)) {
      errs.country = 'Country can only contain alphabets.';
    }
    return errs;
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setApiMessage({ type: '', text: '' });
    // Validate on each change
    const newForm = { ...form, [name]: value };
    setErrors(validate(newForm));

    // If zip field and exactly 5 digits, fetch location
    if (name === 'zip' && /^\d{5}$/.test(value)) {
      try {
        const response = await fetch('https://play.occamsadvisory.com/portal/wp-json/v1/get_location_by_zipcode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zipcode: value })
        });
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const loc = data[0];
          setForm(f => ({
            ...f,
            city: loc.city || '',
            state_of_incorporation: loc.state || '',
            country: loc.country || ''
          }));
        }
      } catch (error) {
        // Optionally handle error
        // console.error('Error fetching location by zip:', error);
      }
    }
  };

  const handleAjaxSubmit = async () => {
    setApiMessage({ type: '', text: '' });
    // Get values from DOM by id
    const values = {
      authorized_signatory_name: document.getElementById('authorized_signatory_name')?.value || '',
      business_legal_name: document.getElementById('business_legal_name')?.value || '',
      authorized_signatory_email: document.getElementById('authorized_signatory_email')?.value || '',
      authorized_signatory_phone: document.getElementById('authorized_signatory_phone')?.value || '',
      zip: document.getElementById('zip')?.value || '',
      street_address: document.getElementById('street_address')?.value || '',
      city: document.getElementById('city')?.value || '',
      state_of_incorporation: document.getElementById('state_of_incorporation')?.value || '',
      country: document.getElementById('country')?.value || '',
    };
    setForm(values);
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      try {
        // 1. Check leads contact mapping
        const params = new URLSearchParams({
          email: values.authorized_signatory_email,
          phone: values.authorized_signatory_phone
        });
        const checkRes = await fetch(`https://play.occamsadvisory.com/portal/wp-json/eccom-op-contact/v1/check_leads_contact_mapping?${params.toString()}`);
        const checkData = await checkRes.json();
        if (checkData.msg === 'Maximum_limit_leads_linked_to_contact_exceeded') {
          setApiMessage({ type: 'error', text: 'Maximum limit to create leads with entered email and phone reached. Please change email and phone.' });
          setLoading(false);
          return;
        }
        // 2. Create lead
        const createRes = await fetch('https://play.occamsadvisory.com/portal/wp-json/v1/create_lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        const createData = await createRes.json();
        if (createData.status === 'success' && createData.lead_id) {
          setApiMessage({ type: 'success', text: 'Lead created successfully' });
          setForm(initialForm);
          // Fetch lead info and pass to parent
          try {
            const infoRes = await fetch('https://play.occamsadvisory.com/portal/wp-json/v1/get_lead_info_by_id', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({ lead_id: createData.lead_id }).toString()
            });
            const infoData = await infoRes.json();
            if (infoData.code === 'success' && infoData.data) {
              if (onLeadInfoFetched) {
                onLeadInfoFetched(infoData.data, createData.lead_id);
              }
            }
            // Close modal after 3 seconds
            setTimeout(() => {
              setApiMessage({ type: '', text: '' });
              if (onClose) onClose();
            }, 2000);
          } catch (err) {
            // Optionally handle error
          }
        } else {
          setApiMessage({ type: 'error', text: createData.message || 'Failed to create lead' });
        }
      } catch (err) {
        setApiMessage({ type: 'error', text: 'An error occurred. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal show={show} onClose={onClose} title={'+ Add Lead'} showFooter={false} size="lg">
      <div>
        <div className="row mb-3">
          <div className="col-md-4 mb-3">
            <label>Customer Name:*</label>
            <input id="authorized_signatory_name" className="form-control" 
            name="authorized_signatory_name" value={form.authorized_signatory_name} 
            onChange={handleChange} onKeyPress={e => {
              const char = String.fromCharCode(e.which);
              if (!/[a-zA-Z ]/.test(char) && !e.ctrlKey && !e.metaKey && e.which !== 8) {
                e.preventDefault();
              }
            }} />
            {errors.authorized_signatory_name && <div className="text-danger small">{errors.authorized_signatory_name}</div>}
          </div>
          <div className="col-md-4 mb-3">
            <label>Business Name:*</label>
            <input id="business_legal_name" className="form-control" name="business_legal_name" value={form.business_legal_name} onChange={handleChange} />
            {errors.business_legal_name && <div className="text-danger small">{errors.business_legal_name}</div>}
          </div>
          <div className="col-md-4 mb-3">
            <label>Email Address:*</label>
            <input id="authorized_signatory_email" className="form-control" name="authorized_signatory_email" value={form.authorized_signatory_email} onChange={handleChange} type="email" />
            {errors.authorized_signatory_email && <div className="text-danger small">{errors.authorized_signatory_email}</div>}
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-4 mb-3">
            <label>Phone Number:*</label>
            <input id="authorized_signatory_phone" className="form-control" name="authorized_signatory_phone" value={form.authorized_signatory_phone} onChange={handleChange} />
            {errors.authorized_signatory_phone && <div className="text-danger small">{errors.authorized_signatory_phone}</div>}
          </div>
          <div className="col-md-4 mb-3">
            <label>Zip Code:*</label>
            <input id="zip" className="form-control" name="zip" value={form.zip} onChange={handleChange} />
            {errors.zip && <div className="text-danger small">{errors.zip}</div>}
          </div>
          <div className="col-md-4 mb-3">
            <label>Address:*</label>
            <input id="street_address" className="form-control" name="street_address" value={form.street_address} onChange={handleChange} />
            {errors.street_address && <div className="text-danger small">{errors.street_address}</div>}
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-4 mb-3">
            <label>City:*</label>
            <input id="city" className="form-control" name="city" value={form.city} onChange={handleChange} />
            {errors.city && <div className="text-danger small">{errors.city}</div>}
          </div>
          <div className="col-md-4 mb-3">
            <label>State of Incorporation:*</label>
            <select id="state_of_incorporation" className="form-select" name="state_of_incorporation" value={form.state_of_incorporation} onChange={handleChange}>
              <option value="">Select State</option>
              {Object.entries(states).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
            {errors.state_of_incorporation && <div className="text-danger small">{errors.state_of_incorporation}</div>}
          </div>
          <div className="col-md-4 mb-3">
            <label>Country:*</label>
            <input id="country" className="form-control" name="country" value={form.country} onChange={handleChange} />
            {errors.country && <div className="text-danger small">{errors.country}</div>}
          </div>
        </div>
        <div className="d-flex justify-content-center mt-3 flex-column align-items-center">
          <button type="button" className="nxt_btn px-4" disabled={loading} onClick={handleAjaxSubmit}>{loading ? 'Submitting...' : 'Submit'}</button>
          {apiMessage.text && (
            <div className={`mt-2 text-center ${apiMessage.type === 'success' ? 'custombg-success col-12' : 'bg-danger text-danger'}`}>{apiMessage.text}</div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceAddLeadModal; 