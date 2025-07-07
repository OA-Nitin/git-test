import React from 'react';
import { getUserId } from '../../utils/assetUtils';
import Notes from '../common/Notes';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { forwardRef } from "react";
import useConfidentialUser from '../../hooks/useConfidentialUser';

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

const BusinessInfoTab = ({ 
  lead, 
  errors, 
  register, 
  handleInputChange,
  taxNowSignupStatus,
  taxNowOnboardingStatus,
  companyFolderLink,
  documentFolderLink,
  primaryContact,
  billingProfileOptions,
  leadId,
  formData,
  setFormData
}) => {
  const { confidenceUser } = useConfidentialUser();
  return (
    <div className="mb-4 left-section-container">
      <h5 className="section-title">Business Identity</h5>
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Business Legal Name</label>
            <input
              type="text"
              className={`form-control ${errors.business_legal_name ? 'is-invalid' : ''}`}
              {...register('business_legal_name')}
              name="business_legal_name"
              value={lead.business_legal_name || ''}
              onChange={handleInputChange}
            />
              {/* {errors.business_legal_name && (
                <div className="invalid-feedback">{errors.business_legal_name.message}</div>
              )} */}
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
              className={`form-control ${errors.doing_business_as ? 'is-invalid' : ''}`}
              {...register('doing_business_as')}
              name="doing_business_as"
              value={lead.doing_business_as || ''}
              onChange={handleInputChange}
            />
            {errors.doing_business_as && (
                <div className="invalid-feedback">{errors.doing_business_as.message}</div>
              )}
          </div>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Business Category*</label>
            <input
              type="text"
              className={`form-control ${errors.category ? 'is-invalid' : ''}`}
              {...register('category')}
              name="category"
              value={lead.category || ''}
              onChange={handleInputChange}
            />
            {errors.category && (
                <div className="invalid-feedback">{errors.category.message}</div>
              )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Website URL*</label>
            <input
              type="text"
              className={`form-control ${errors.website ? 'is-invalid' : ''}`}
              {...register('website')}
              name="website"
              value={lead.website || ''}
              onChange={handleInputChange}
            />
              {errors.website && (
                <div className="invalid-feedback">{errors.website.message}</div>
              )}
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
              className={`form-control ${errors.authorized_signatory_name ? 'is-invalid' : ''}`}
              {...register('authorized_signatory_name')}
              name="authorized_signatory_name"
              value={lead.authorized_signatory_name || ''}
              onChange={handleInputChange}
            />
            {errors.authorized_signatory_name && (
                <div className="invalid-feedback">{errors.authorized_signatory_name.message}</div>
              )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Business Phone*</label>
            <input
              type="text"
              className={`form-control ${errors.business_phone ? 'is-invalid' : ''}`}
              {...register('business_phone')}
              name="business_phone"
              value={lead.business_phone || ''}
              onChange={handleInputChange}
            />
              {errors.business_phone && (
                <div className="invalid-feedback">{errors.business_phone.message}</div>
              )}
          </div>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Business Email*</label>
            <input
              type="email"
              className={`form-control ${errors.business_email ? 'is-invalid' : ''}`}
              {...register('business_email')}
              name="business_email"
              value={lead.business_email || ''}
              onChange={handleInputChange}
            />
              {errors.business_email && (
                <div className="invalid-feedback">{errors.business_email.message}</div>
              )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Business Title*</label>
            <input
              type="text"
              className={`form-control ${errors.business_title ? 'is-invalid' : ''}`}
              {...register('business_title')}
              name="business_title"
              value={lead.business_title || ''}
              onChange={handleInputChange}
            />
              {errors.business_title && (
                <div className="invalid-feedback">{errors.business_title.message}</div>
              )}
          </div>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Street Address*</label>
            <input
              type="text"
              className={`form-control ${errors.business_address ? 'is-invalid' : ''}`}
              {...register('business_address')}
              name="business_address"
              value={lead.business_address || ''}
              onChange={handleInputChange}
            />
            {errors.business_address && (
              <div className="invalid-feedback">{errors.business_address.message}</div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">City*</label>
            <input
              type="text"
              className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                {...register('city')}
              name="city"
              value={lead.city || ''}
              onChange={handleInputChange}
            />
              {errors.city && (
                <div className="invalid-feedback">{errors.city.message}</div>
              )}
          </div>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">State*</label>
            <input
              type="text"
              className={`form-control ${errors.state ? 'is-invalid' : ''}`}
              {...register('state')}
              name="state"
              value={lead.state || ''}
              onChange={handleInputChange}
            />
            {errors.state && (
              <div className="invalid-feedback">{errors.state.message}</div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">ZIP*</label>
            <input
              type="text"
              className={`form-control ${errors.zip ? 'is-invalid' : ''}`}
              {...register('zip')}
              name="zip"
              value={lead.zip || ''}
              onChange={handleInputChange}
            />
            {errors.zip && (
              <div className="invalid-feedback">{errors.zip.message}</div>
            )}
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
              className={`form-control ${errors.primary_contact_email ? 'is-invalid' : ''}`}
              name="primary_contact_email"
              value={primaryContact.email || ''}
              onChange={handleInputChange}
              disabled
            />
              {errors.primary_contact_email && (
                <div className="invalid-feedback">{errors.primary_contact_email.message}</div>
              )}
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="text"
              className={`form-control ${errors.primary_contact_phone ? 'is-invalid' : ''}`}
              name="primary_contact_phone"
              value={primaryContact.phone || ''}
              onChange={handleInputChange}
              disabled
            />
            {errors.primary_contact_phone && (
              <div className="invalid-feedback">{errors.primary_contact_phone.message}</div>
            )}
          </div>
        </div>
        <div className="col-md-2">
          <div className="form-group">
            <label className="form-label">Contact Ext</label>
            <input
              type="text"
              className={`form-control ${errors.primary_contact_ext ? 'is-invalid' : ''}`}
              name="primary_contact_ext"
              value={primaryContact.ext || ''}
              onChange={handleInputChange}
              disabled
            />
            {errors.primary_contact_ext && (
              <div className="invalid-feedback">{errors.primary_contact_ext.message}</div>
            )}

          </div>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Contact Phone Type</label>
            <input
              type="text"
              className={`form-control ${errors.contact_phone_type ? 'is-invalid' : ''}`}
              name="contact_phone_type"
              value={primaryContact.phoneType || ''}
              onChange={handleInputChange}
              disabled
            />
            {errors.contact_phone_type && (
              <div className="invalid-feedback">{errors.contact_phone_type.message}</div>
            )}

          </div>
        </div>
      </div>

      <h5 className="section-title mt-4">Billing Profile</h5>
      <div className="row mb-3">
        <div className="col-md-12">
          <div className="form-group">
            <label className="form-label">Select Billing Profile</label>
            <select
              className={`form-select ${errors.billing_profile ? 'is-invalid' : ''}`}
              {...register('billing_profile')}
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
            {errors.billing_profile && (
              <div className="invalid-feedback">{errors.billing_profile.message}</div>
            )}
          </div>
        </div>
      </div>

      <h5 className="section-title mt-4">TaxNow</h5>
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Select TaxNow Signup Status</label>
            <select
              className={`form-select ${errors.taxnow_signup_status ? 'is-invalid' : ''}`}
              {...register('taxnow_signup_status')}
              name="taxnow_signup_status"
              value={taxNowSignupStatus}
              onChange={handleInputChange}
            >
              <option value="">Select TaxNow Signup Status</option>
              <option value="Complete">Complete</option>
              <option value="Incomplete">Incomplete</option>
            </select>
            {errors.taxnow_signup_status && (
              <div className="invalid-feedback">{errors.taxnow_signup_status.message}</div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Select TaxNow Onboarding Status</label>
            <select
              className={`form-select ${errors.taxnow_onboarding_status ? 'is-invalid' : ''}`}
              {...register('taxnow_onboarding_status')}
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
            {errors.taxnow_onboarding_status && (
              <div className="invalid-feedback">{errors.taxnow_onboarding_status.message}</div>
            )}
          </div>
        </div>
      </div>

      <h5 className="section-title mt-4">Business Legal Info</h5>
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Business Entity Type*</label>
            <select
              className={`form-select ${errors.business_type ? 'is-invalid' : ''}`}
              {...register('business_type')}
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
            {errors.business_type && (
              <div className="invalid-feedback">{errors.business_type.message}</div>
            )}
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">If Other*</label>
            <input
              type="text"
              className={`form-control ${errors.business_type_other ? 'is-invalid' : ''}`}
              {...register('business_type_other')}
              name="business_type_other"
              value={lead.business_type_other || ''}
              onChange={handleInputChange}
              placeholder="If other, specify type"
            />
            {errors.business_type_other && (
              <div className="invalid-feedback">{errors.business_type_other.message}</div>
            )}
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Registration Number*</label>
            <input
              type="text"
              className={`form-control ${errors.registration_number ? 'is-invalid' : ''}`}
              {...register('registration_number')}
              name="registration_number"
              value={lead.registration_number || ''}
              onChange={handleInputChange}
            />
            {errors.registration_number && (
              <div className="invalid-feedback">{errors.registration_number.message}</div>
            )}
          </div>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-3">
          <div className="form-group">
            <label className="form-label">Registration Date*</label>
            <div className="input-group">
              {/* <DateInput
                value={lead.registration_date ? formatDateToMMDDYYYY(lead.registration_date) : ''}
                onChange={handleInputChange}
                placeholder="MM/DD/YYYY"
              /> */}
              <DatePicker
                selected={formData.registration_date ? new Date(formData.registration_date) : null}
                name="registration_date"
                id="registration_date"
                onChange={(date) => {
                  const formatted = date ? date.toISOString().split('T')[0] : '';
                  setFormData(prev => ({ ...prev, registration_date: formatted }));
                }}
                dateFormat="MM/dd/yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="scroll"
                scrollableYearDropdown    
                yearDropdownItemNumber={120}  
                minDate={new Date('1900-01-01')}
                maxDate={new Date()}
                customInput={<ReadOnlyDateInput />}
              />
              {errors.registration_date && (
                <div className="invalid-feedback">
                  {errors.registration_date.message}
                </div>
              )}
              {/* <input
                type="text"
                className={`form-control ${errors.registration_date ? 'is-invalid' : ''}`}
                {...register('registration_date')}
                name="registration_date"
                value={lead.registration_date ? formatDateToMMDDYYYY(lead.registration_date) : ''}
                onChange={handleInputChange}
                placeholder="MM/DD/YYYY"
                maxLength="10"
                onInput={(e) => {
                  // Auto-format as user types MM/DD/YYYY
                  let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                  if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2);
                  }
                  if (value.length >= 5) {
                    value = value.substring(0, 5) + '/' + value.substring(5, 9);
                  }
                  e.target.value = value;
                }}
              /> */}
              {/* <span className="input-group-text">
                <i className="fas fa-calendar-alt"></i>
              </span> */}
            </div>
            {errors.registration_date && (
              <div className="invalid-feedback">{errors.registration_date.message}</div>
            )}
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group">
            <label className="form-label">State of Registration*</label>
            <input
              type="text"
              className={`form-control ${errors.state_of_registration ? 'is-invalid' : ''}`}
              {...register('state_of_registration')}
              name="state_of_registration"
              value={lead.state_of_registration || ''}
              onChange={handleInputChange}
            />
            {errors.state_of_registration && (
              <div className="invalid-feedback">{errors.state_of_registration.message}</div>
            )}
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group">
            <label className="form-label">EIN*</label>
            <input
              type="text"
              className={`form-control ${errors.ein ? 'is-invalid' : ''}`}
              {...register('ein')}
              name="ein"
              value={lead.ein || ''}
              onChange={handleInputChange}
            />
            {errors.ein && (
              <div className="invalid-feedback">{errors.ein.message}</div>
            )}
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group">
            <label className="form-label">Tax ID Type*</label>
            <select
              className={`form-select ${errors.tax_id_type ? 'is-invalid' : ''}`}
              {...register('tax_id_type')}
              name="tax_id_type"
              value={lead.tax_id_type || 'N/A'}
              onChange={handleInputChange}
            >
              <option value="N/A">N/A</option>
              <option value="EIN">EIN</option>
              <option value="TIN">TIN</option>
              <option value="SSN">SSN</option>
            </select>
            {errors.tax_id_type && (
              <div className="invalid-feedback">{errors.tax_id_type.message}</div>
            )}
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
              className={`form-control ${errors.internal_sales_agent ? 'is-invalid' : ''}`}
              {...register('internal_sales_agent')}
              name="internal_sales_agent"
              value={lead.internal_sales_agent || ''}
              onChange={handleInputChange}
            />
            {errors.internal_sales_agent && (
              <div className="invalid-feedback">{errors.internal_sales_agent.message}</div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Internal Sales Support</label>
            <input
              type="text"
              className={`form-control ${errors.internal_sales_support ? 'is-invalid' : ''}`}
              {...register('internal_sales_support')}
              name="internal_sales_support"
              value={lead.internal_sales_support || ''}
              onChange={handleInputChange}
            />
            {errors.internal_sales_support && (
              <div className="invalid-feedback">{errors.internal_sales_support.message}</div>
            )}
          </div>
        </div>
      </div>

      <h5 className="section-title mt-4">Folder Information</h5>
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label d-flex align-items-center">
              Company Folder Link
            {companyFolderLink  && (() => {
                  const safeLink = companyFolderLink.startsWith('http://') || companyFolderLink.startsWith('https://') ? companyFolderLink : `https://${companyFolderLink}`;
              return (<a
                href={safeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ms-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#0d6efd" className="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                  <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                </svg>
              </a>
              );
            })()}
            </label>
            <input
              type="text"
              className={`form-control ${errors.company_folder_link ? 'is-invalid' : ''}`}
              name="company_folder_link"
              value={companyFolderLink}
              onChange={handleInputChange}
            />
            {errors.company_folder_link && (
              <div className="invalid-feedback">{errors.company_folder_link.message}</div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label d-flex align-items-center">
              Document Folder Link
            {documentFolderLink && ( () =>{
                const safeLinks = documentFolderLink.startsWith('http://') || documentFolderLink.startsWith('https://') ? documentFolderLink : `https://${documentFolderLink}`;
              return (<a
                href={safeLinks}
                target="_blank"
                rel="noopener noreferrer"
                className="ms-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#0d6efd" className="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                  <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                </svg>
              </a>
              );
            }) ()}
            </label>
            <input
              type="text"
              className={`form-control ${errors.document_folder_link ? 'is-invalid' : ''}`}
              name="document_folder_link"
              value={documentFolderLink}
              onChange={handleInputChange}
            />
            {errors.document_folder_link && (
              <div className="invalid-feedback">{errors.document_folder_link.message}</div>
            )}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <h5 className="section-title mt-4">Notes</h5>
      <Notes
        entityType="lead"
        entityId={leadId}
        entityName={lead?.business_legal_name || ''}
        showButtons={false}
        showNotes={true}
        maxHeight={300}
        confidenceUser={confidenceUser}
      />
    </div>
  );
};

export default BusinessInfoTab; 