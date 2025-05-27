import React from 'react';
import { getUserId } from '../../utils/assetUtils';

const BusinessInfoTab = ({
  lead,
  primaryContact,
  billingProfileOptions,
  taxNowSignupStatus,
  taxNowOnboardingStatus,
  handleInputChange
}) => {
  return (
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
            <input
              type="hidden"
              name="user_id"
              value={getUserId()}
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
              disabled
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
              disabled
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
              disabled
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
              disabled
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
              {billingProfileOptions.map(profile => (
                <option key={profile.value} value={profile.value}>
                  {profile.label}
                </option>
              ))}
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

      <h5 className="section-title mt-4">Folder Links</h5>
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Company Folder Link</label>
            <input
              type="text"
              className="form-control"
              name="company_folder_link"
              value={lead.company_folder_link || ''}
              onChange={handleInputChange}
              placeholder="Enter company folder link"
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Document Folder Link</label>
            <input
              type="text"
              className="form-control"
              name="document_folder_link"
              value={lead.document_folder_link || ''}
              onChange={handleInputChange}
              placeholder="Enter document folder link"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessInfoTab;
