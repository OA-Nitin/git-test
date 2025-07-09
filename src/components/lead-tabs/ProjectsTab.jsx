import React from 'react';
import axios from 'axios';

const ProjectsTab = ({ 
  projects,
  showEditProjectModal,
  projectUpdateLoading,
  projectUpdateSuccess,
  projectUpdateError,
  projectFormData,
  currentProject,
  projectErrors,
  milestones,
  milestoneStages,
  contacts,
  handleEditProject,
  handleCloseEditProjectModal,
  handleUpdateProject,
  handleSubmitProject,
  registerProject,
  setProjectFormData,
  setMilestoneStages,
  fetchMilestoneStages,
  setProjectValue // <-- Add this prop
}) => {
  return (
    <div className="mb-4 left-section-container">
      {projects.length === 0 ? (
        <div className="text-center mt-4">
          <p>No projects found for this lead.</p>
        </div>
      ) : (
        projects.map(project => (
          <div key={project.id} className="row custom_opp_tab">
            <div className="col-sm-12">
              <div className="custom_opp_tab_header">
                <h5><a href={`/reporting/project-detail/${project.id}`} target="_blank">{project.projectName}</a></h5>
                <div className="opp_edit_dlt_btn projects-iris">
                  <a
                    className="edit_project"
                    data-projid={project.id}
                    data-projname={project.projectName}
                    data-businessname={project.businessName}
                    data-productname={project.productName}
                    data-productid={project.productId}
                    data-milestone={project.milestone}
                    data-milestoneid={project.milestoneId}
                    data-stage={project.stage}
                    data-stageid={project.stageId}
                    data-fee={project.fee}
                    data-max_credit={project.maxCredit}
                    data-est_fee={project.estFee}
                    data-collab={project.collaboratorId}
                    data-contact={project.contactId}
                    href="#"
                    title="Edit"
                    onClick={(e) => {
                      e.preventDefault();
                      handleEditProject(project);
                    }}
                  >
                    <i className="fas fa-pen"></i>
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-7 text-left">
              <div className="lead_des">
                <p><b>Business Name:</b> {project.businessName}</p>
                <p><b>Project Name:</b> {project.projectName}</p>
                <p><b>Product Name:</b> {project.productName || 'N/A'}</p>
              </div>
            </div>
            <div className="col-md-5">
              <div className="lead_des">
                <p><b>Milestone:</b> {project.milestone || 'N/A'}</p>
                <p><b>Stage:</b> {project.stage || 'N/A'}</p>
                <p><b>Collaborator:</b> {project.collaborator || 'N/A'}</p>
              </div>
            </div>
          </div>
        ))
      )}

    {/* Edit Project Modal */}
      {showEditProjectModal && (
        <>
          <div className="modal-backdrop show" style={{ display: 'block' }}></div>
          {/* Loading overlay when fetching or updating */}
          {projectUpdateLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
                {/* <p className="loading-text">Updating project...</p> */}
              </div>
            </div>
          )}
          <div className={`modal ${showEditProjectModal ? 'show' : ''}`} style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '800px' }}>
              <div className="modal-content" style={{ borderRadius: '8px' }}>
                <div className="modal-header pb-2">
                  <h5 className="modal-title">Edit Project</h5>
                  <button type="button" className="btn-close" onClick={handleCloseEditProjectModal}></button>
                </div>
                <div className="modal-body">
                  {/* <form onSubmit={(e) => { e.preventDefault(); handleUpdateProject(); }}> */}
                  <form onSubmit={handleSubmitProject(handleUpdateProject)}>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Project Name:*</label>
                          <input
                            type="text"
                            className={`form-control ${projectErrors.project_name ? 'is-invalid' : ''}`}
                            {...registerProject("project_name")}
                            name="project_name"
                            value={projectFormData.project_name}
                            onChange={(e) => setProjectFormData(prev => ({
                              ...prev,
                              project_name: e.target.value
                            }))}
                            placeholder="Enter project name"
                            readOnly="true"
                          />
                          {projectErrors.project_name && (
                            <div className="invalid-feedback">
                              {projectErrors.project_name.message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Business Name:*</label>
                          <input
                            type="text"
                            className="form-control"
                            value={currentProject?.businessName || ''}
                            readOnly="true"
                            name="business_legal_name"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Product Name:*</label>
                          <input
                            type="text"
                            className="form-control"
                            value={currentProject?.productName || ''}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Fee:</label>
                          <input
                            type="text"
                            className={`form-control ${projectErrors.project_fee ? 'is-invalid' : ''}`}
                            {...registerProject("project_fee")}
                            name="project_fee"
                            value={projectFormData.project_fee}
                            onChange={(e) => setProjectFormData(prev => ({
                              ...prev,
                              project_fee: e.target.value
                            }))}
                            placeholder="Enter fee"
                          />
                            {projectErrors.project_fee && (
                              <div className="invalid-feedback">
                                {projectErrors.project_fee.message}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Maximum Credit:</label>
                          <input
                            type="text"
                            className={`form-control ${projectErrors.maximum_credit ? 'is-invalid' : ''}`}
                            {...registerProject("maximum_credit")}
                            name="maximum_credit"
                            value={projectFormData.maximum_credit}
                            onChange={(e) => setProjectFormData(prev => ({
                              ...prev,
                              maximum_credit: e.target.value
                            }))}
                            placeholder="Enter maximum credit"
                          />
                            {projectErrors.maximum_credit && (
                              <div className="invalid-feedback">
                                {projectErrors.maximum_credit.message}
                              </div>
                            )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Estimated Fee:</label>
                          <input
                            type="text"
                            className={`form-control ${projectErrors.estimated_fee ? 'is-invalid' : ''}`}
                            {...registerProject("estimated_fee")}
                            name="estimated_fee"
                            value={projectFormData.estimated_fee}
                            onChange={(e) => setProjectFormData(prev => ({
                              ...prev,
                              estimated_fee: e.target.value
                            }))}
                            placeholder="Enter estimated fee"
                          />
                          {projectErrors.estimated_fee && (
                            <div className="invalid-feedback">
                              {projectErrors.estimated_fee.message}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Milestone:*</label>
                          <div className="milestone-select-wrapper">
                            <select
                              className={`form-select ${projectErrors.Milestone ? 'is-invalid' : ''}`}
                              {...registerProject("Milestone")}
                              name="Milestone"
                              data-label="1"
                              value={projectFormData.Milestone}
                              onChange={async (e) => {
                                //console.log('Project milestone selected:', e.target.value);

                                // Find the selected milestone to get its ID
                                const selectedMilestone = milestones.find(m => m.name === e.target.value);
                                //console.log('Selected milestone object:', selectedMilestone);

                                // Update the form data with the selected milestone
                                setProjectFormData(prev => ({
                                  ...prev,
                                  Milestone: e.target.value,
                                  // Clear the milestone stage when milestone changes
                                  MilestoneStage: ''
                                }));
                                setProjectValue && setProjectValue('Milestone', e.target.value); // <-- Add this line
                                setProjectValue && setProjectValue('MilestoneStage', ''); // <-- Clear stage in form state

                                // If a milestone is selected, fetch its stages
                                if (selectedMilestone && selectedMilestone.id) {
                                  try {
                                    // Map product names to product IDs
                                    const productIdMap = {
                                      'ERC': '935',
                                      'STC': '937',
                                      'RDC': '932',
                                      'TAX': '936',
                                      'AA':'934'
                                    };

                                    // Get the product_id from the current project
                                    let product_id = currentProject?.product_id || currentProject?.productId;

                                    // If no product_id is available, try to map from the product name
                                    if (!product_id && currentProject?.productName) {
                                      product_id = productIdMap[currentProject.productName] || '936';
                                      //console.log('Mapped product name', currentProject.productName, 'to product_id:', product_id);
                                    } else {
                                      product_id = '936'; // Default fallback to ERC product ID
                                    }

                                    //console.log('Fetching milestone stages for milestone_id:', selectedMilestone.id, 'and product_id:', product_id);

                                    // Fetch milestone stages using the API endpoint with milestone_id
                                    const apiUrl = `https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/milestone-stages?milestone_id=${selectedMilestone.id}`;
                                    //console.log('Calling milestone stages API with URL2:', apiUrl);

                                    const response = await axios.get(apiUrl);
                                    //console.log('Milestone stages API response11:', response.data);

                                    // Process the response
                                    let stages = [];
                                    if (response.data && response.data.success) {
                                      const stagesData = response.data.data.data;
                                      //console.log('sdsdsd');
                                      if (Array.isArray(stagesData)) {
                                        stages = stagesData.map(stage => ({
                                          id: stage.milestone_stage_id || stage.id || '',
                                          name: stage.stage_name || stage.name || ''
                                        })).filter(s => s.id && s.name);
                                      }
                                    }

                                    if (stages.length === 0) {
                                      // Fallback to the fetchMilestoneStages function if direct API call fails
                                      stages = await fetchMilestoneStages(selectedMilestone.id, product_id);
                                    }

                                    setMilestoneStages(stages);
                                    //console.log('Milestone stages fetched successfully for project:', stages);
                                  } catch (error) {
                                    console.error('Error fetching milestone stages for project:', error);
                                    setMilestoneStages([]);
                                  }
                                } else {
                                  // Clear milestone stages if no milestone is selected
                                  setMilestoneStages([]);
                                }
                              }}

                            >

                              <option value="">Select Milestone</option>
                              {milestones.map((milestone, index) => (
                                <option key={`project-milestone-${index}-${milestone.id}`} value={milestone.name}>
                                  {milestone.name}
                                </option>
                              ))}
                            </select>
                            {projectErrors.Milestone && (
                              <div className="invalid-feedback">
                                {projectErrors.Milestone.message}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Stage:*</label>
                          <div className="milestone-select-wrapper">
                            <select
                              className={`form-select ${projectErrors.MilestoneStage ? 'is-invalid' : ''}`}
                              {...registerProject("MilestoneStage")}
                              name="MilestoneStage"
                              value={projectFormData.MilestoneStage}
                              onChange={(e) => {
                                //console.log('Project milestone stage selected:', e.target.value);
                                setProjectFormData(prev => ({
                                  ...prev,
                                  MilestoneStage: e.target.value
                                }));
                                setProjectValue && setProjectValue('MilestoneStage', e.target.value); // <-- Add this line
                              }}

                            >
                              <option value="">Select Stage</option>
                              {milestoneStages.map((stage, index) => (
                                <option key={`project-stage-${index}-${stage.id}`} value={stage.name}>
                                  {stage.name}
                                </option>
                              ))}
                            </select>
                            {projectErrors.MilestoneStage && (
                              <div className="invalid-feedback">
                                {projectErrors.MilestoneStage.message}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6" style={{display:'none'}}>
                        <div className="form-group mb-3">
                          <label className="form-label">Collaborator:</label>
                          <input
                            type="text"
                            className="form-control"
                            name="collaborators"
                            value={projectFormData.collaborators[0] || ''}
                            onChange={(e) => setProjectFormData(prev => ({
                              ...prev,
                              collaborators: e.target.value ? [e.target.value] : []
                            }))}
                            placeholder="Enter collaborator"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Contact:</label>
                          <select
                            className="form-select"
                            name="ContactList"
                            value={projectFormData.ContactList}
                            onChange={(e) => setProjectFormData(prev => ({
                              ...prev,
                              ContactList: e.target.value
                            }))}
                          >
                            <option value="">Select Contact</option>
                            {contacts.map((contact, index) => (
                              <option key={`project-contact-${contact.contact_id}-${index}`} value={contact.contact_id}>
                                {contact.name || 'Unnamed Contact'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {projectUpdateSuccess && (
                      <div className="alert alert-success" role="alert">
                        <strong><i className="fas fa-check-circle me-2"></i>Project updated successfully!</strong>
                      </div>
                    )}

                    {projectUpdateError && (
                      <div className="alert alert-danger" role="alert">
                        <strong><i className="fas fa-exclamation-triangle me-2"></i>Error!</strong>
                        <p className="mb-0 mt-1">{projectUpdateError}</p>
                      </div>
                    )}

                    <div className="d-flex justify-content-center gap-3 mt-4">
                      <button
                        type="submit"
                        className="btn save-btn"
                        disabled={projectUpdateLoading}
                      >
                        {projectUpdateLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Updating...
                          </>
                        ) : 'Update'}
                      </button>
                      <button
                        type="button"
                        className="btn cancel-btn"
                        onClick={handleCloseEditProjectModal}
                        disabled={projectUpdateLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectsTab; 