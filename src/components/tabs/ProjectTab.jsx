import React from 'react';

const storedData = localStorage.getItem("user");
          let user_role = '';
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            if(parsedData.data && parsedData.data.user) {
                user_role = parsedData.data.user.roles;
            }
          }

function decodeHtmlEntities(str) {
  const parser = new DOMParser();
  const decoded = parser.parseFromString(str, 'text/html');
  if(decoded.body.textContent && decoded.body.textContent !== 'null' && decoded.body.textContent !== 'undefined' && decoded.body.textContent !== ''){
      return decoded.body.textContent || ""; 
   }else{ 
      return "N/A"; 
   }
}

const ProjectTab = ({ project, isEditMode, errors, register, setProject, DateInput, companyFolderLink, documentFolderLink, toggleEditMode }) => {
  
  var identity_document_type_val = decodeHtmlEntities(project.identity_document_type);
  
  return (
    <div className="mb-4 left-section-container">
      <h5 className="section-title">Project Details</h5>
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input type="text" className="form-control" defaultValue={project?.project_name || ""} readOnly />
            <input type="hidden" name="user_id" value={project?.user_id || ''} />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <div className='form-label d-flex align-items-center justify-content-between'>
              <label style={{ marginBottom: '0px' }}>Business</label>
              <button
                className="btn btn-primary"
                style={{ fontSize: '11px', padding: '2px 8px', lineHeight: '1.2', borderRadius: '3px' }}
                onClick={() => {
                  const leadId = project?.lead_id || "9020";
                  const leadDetailUrl = `/reporting/lead-detail/${leadId}`;
                  window.open(leadDetailUrl, '_blank');
                }}
              >
                View
              </button>
            </div>
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

                {user_role.includes('echeck_staff') && (
          <>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Review Status</label>
                <select className="crm-erp-field form-control" name="review_status" id="review_status" value={project.review_status || ""} onChange={(e) => setProject({...project, review_status: e.target.value, review_link: e.target.value != "completed" ? "" : project.review_link})}  disabled={!isEditMode}>
                    <option value="">Select Review Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                </select>
              </div>
          </div>
           {project.review_status === "completed" && (
          <div className="col-md-4 review_link">
            <div className="form-group">
              
              <label className="form-label">Review link</label>
                <input type="text" id="review_link" className={`form-control ${errors?.review_link ? 'is-invalid' : ''}`} name="review_link" readOnly value={project.review_link || ''} onChange={(e) => setProject({...project, review_link: e.target.value})} readOnly={!isEditMode}/>
                {errors?.review_link && (
                  <div className="invalid-feedback">{errors.review_link.message}</div>
                )}
          </div>
          </div>
           )}
          </>
        )}
        
      </div>
      {/* Account Info Section */}
      <div className='d-flex align-items-center justify-content-between'>
        <h5 className="section-title mt-4">Account Info</h5>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={toggleEditMode}
          title={isEditMode ? "" : "Edit information"}
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

              value={identity_document_type_val || ""}
              onChange={(e) => setProject({...project, identity_document_type: e.target.value})}
              disabled={!isEditMode}
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
              className={`form-control ${errors?.business_legal_name ? 'is-invalid' : ''}`}
              {...register('business_legal_name')}
              value={project.business_legal_name}
              onChange={(e) => setProject({ ...project, business_legal_name: e.target.value })}
              readOnly={!isEditMode}
            />
            {errors?.business_legal_name && (
              <div className="invalid-feedback">{errors.business_legal_name.message}</div>
            )}
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Doing Business As</label>
            <input
              type="text"
              className={`form-control ${errors?.doing_business_as ? 'is-invalid' : ''}`}
              {...register('doing_business_as')}
              value={project.doing_business_as}
              onChange={(e) => setProject({ ...project, doing_business_as: e.target.value })}
              readOnly={!isEditMode}
            />
            {errors?.doing_business_as && (
              <div className="invalid-feedback">{errors.doing_business_as.message}</div>
            )}
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Business Category</label>
            <input
              type="text"
              className={`form-control ${errors?.business_category ? 'is-invalid' : ''}`}
              {...register('business_category')}
              value={project.business_category}
              onChange={(e) => setProject({ ...project, business_category: e.target.value })}
              readOnly={!isEditMode}
            />
            {errors?.business_category && (
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
              className={`form-control ${errors?.website_url ? 'is-invalid' : ''}`}
              {...register('website_url')}
              value={project.website_url}
              onChange={(e) => setProject({ ...project, website_url: e.target.value })}
              readOnly={!isEditMode}
            />
            {errors?.website_url && (
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
              className={`form-select ${errors?.business_entity_type ? 'is-invalid' : ''}`}
              {...register('business_entity_type')}
              value={project.business_entity_type || ""}
              onChange={(e) => setProject({ ...project, business_entity_type: e.target.value })}
              disabled={!isEditMode}
            >
              <option value="1">N/A</option>
              <option value="4">Sole Proprietorship</option>
              <option value="3">Partnership</option>
              <option value="2">Limited Liability (LLC)</option>
              <option value="6">Corporation (S, C, B, etc)</option>
              <option value="7">Trust</option>
              <option value="5">Other</option>
            </select>
            {errors?.business_entity_type && (
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
              onChange={(e) => setProject({ ...project, registration_number: e.target.value })}
              readOnly={!isEditMode}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Registration Date</label>
            {isEditMode ? (
              <DateInput
                value={project.registration_date}
                onChange={(value) => setProject({ ...project, registration_date: value })}
                placeholder="MM/DD/YYYY"
              />
            ) : (
              <input
                type="text"
                className="form-control"
                value={project.registration_date}
                readOnly
              />
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
              className={`form-control ${errors?.state_of_registration ? 'is-invalid' : ''}`}
              {...register('state_of_registration')}
              value={project.state_of_registration}
              onChange={(e) => setProject({ ...project, state_of_registration: e.target.value })}
              readOnly={!isEditMode}
            />
            {errors?.state_of_registration && (
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
                {companyFolderLink  && (() => {
                  const safeLink = companyFolderLink.startsWith('http://') || companyFolderLink.startsWith('https://') ? companyFolderLink : `https://${companyFolderLink}`;
                return (<a
                  href={safeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ms-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#0d6efd" className="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z" />
                    <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z" />
                  </svg>
                </a>
                );
              })()}
              </label>
              <input
                type="text"
                className={`form-control ${errors.company_folder_link ? 'is-invalid' : ''}`}
                {...register('company_folder_link')}
                value={companyFolderLink}
                onChange={(e) => setCompanyFolderLink(e.target.value)}
                readOnly
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
                {documentFolderLink  && ( () =>{
                  const safeLinks = documentFolderLink.startsWith('http://') || documentFolderLink.startsWith('https://') ? documentFolderLink : `https://${documentFolderLink}`;
                return (<a
                  href={safeLinks}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ms-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#0d6efd" className="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z" />
                    <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z" />
                  </svg>
                </a>);
                })()}
              </label>
              <input
                type="text"
                className={`form-control ${errors.document_folder_link ? 'is-invalid' : ''}`}
                {...register('document_folder_link')}
                value={documentFolderLink}
                onChange={(e) => setDocumentFolderLink(e.target.value)}
                readOnly
              />
              {errors.document_folder_link && (
                  <div className="invalid-feedback">{errors.document_folder_link.message}</div>
                )}
            </div>
          </div>
        </div>
    </div>
  );
};

export default ProjectTab; 