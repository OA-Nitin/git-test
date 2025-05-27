import React from 'react';

const OpportunitiesTab = ({
  opportunities,
  showEditOpportunityModal,
  currentOpportunity,
  opportunityFormData,
  setOpportunityFormData,
  opportunityUpdateLoading,
  opportunityUpdateSuccess,
  opportunityUpdateError,
  milestones,
  handleEditOpportunity,
  showDeleteConfirmation,
  handleCloseEditOpportunityModal,
  handleUpdateOpportunity
}) => {
  return (
    <div className="mb-4 left-section-container">
      {opportunities.length === 0 ? (
        <div className="text-center mt-4">
          <p>No opportunities found for this lead.</p>
        </div>
      ) : (
        opportunities.map((opportunity) => (
          <div key={opportunity.id} className="row custom_opp_tab">
            <div className="col-sm-12">
              <div className="custom_opp_tab_header">
                <h5><a href="javascript:void(0)">{opportunity.opportunity_name}</a></h5>
                <div className="opp_edit_dlt_btn projects-iris">
                  <a
                    className="edit_project"
                    href="javascript:void(0)"
                    title="Edit"
                    onClick={() => handleEditOpportunity(opportunity)}
                  >
                    <i className="fas fa-pen"></i>
                  </a>
                  <a
                    className="delete_project"
                    href="javascript:void(0)"
                    title="Delete"
                    onClick={() => showDeleteConfirmation(opportunity)}
                  >
                    <i className="fas fa-trash"></i>
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-7 text-left">
              <div className="lead_des">
                <p><b>Lead Name:</b> {opportunity.lead_name}</p>
                <p><b>Product:</b> {opportunity.product}</p>
                <p><b>Milestone:</b> {opportunity.milestone}</p>
                <p><b>Created Date:</b> {opportunity.created_date}</p>
                <p><b>Created By:</b> {opportunity.created_by}</p>
              </div>
            </div>
            <div className="col-md-5">
              <div className="lead_des">
                <p><b>Stage:</b> {opportunity.stage}</p>
                <p><b>Amount:</b> {opportunity.currency}{opportunity.opportunity_amount}</p>
                <p><b>Probability:</b> {opportunity.probability}%</p>
                <p><b>Expected Close:</b> {opportunity.expected_close_date}</p>
                <p><b>Next Step:</b> {opportunity.next_step || 'N/A'}</p>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Edit Opportunity Modal */}
      {showEditOpportunityModal && (
        <>
          <div className="modal-backdrop show" style={{ display: 'block' }}></div>
          {/* Loading overlay when fetching or updating */}
          {opportunityUpdateLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Updating opportunity...</p>
              </div>
            </div>
          )}
          <div className={`modal ${showEditOpportunityModal ? 'show' : ''}`} style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '800px' }}>
              <div
                className="modal-content"
                style={{ borderRadius: '8px', marginTop: '6%' }}
              >
                <div className="modal-header pb-2">
                  <h5 className="modal-title">Edit - {currentOpportunity?.opportunity_name}</h5>
                  <button type="button" className="btn-close" onClick={handleCloseEditOpportunityModal}></button>
                </div>
                <div className="modal-body">
                  {/* Form fields for Edit Opportunity */}
                  <form onSubmit={(e) => { e.preventDefault(); handleUpdateOpportunity(); }}>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Opportunity Name:*</label>
                          <input
                            type="text"
                            className="form-control"
                            name="opportunity_name"
                            value={opportunityFormData.opportunity_name}
                            onChange={(e) => setOpportunityFormData(prev => ({
                              ...prev,
                              opportunity_name: e.target.value
                            }))}
                            placeholder="Enter opportunity name"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Lead Name:*</label>
                          <input
                            type="text"
                            className="form-control"
                            value={currentOpportunity?.lead_name || ''}
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Product:*</label>
                          <input
                            type="text"
                            className="form-control"
                            value={currentOpportunity?.product || ''}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Milestone:*</label>
                          <div className="milestone-select-wrapper">
                            <select
                              className="form-select"
                              name="milestone"
                              value={opportunityFormData.milestone}
                              onChange={(e) => {
                                console.log('Opportunity milestone selected:', e.target.value);
                                setOpportunityFormData(prev => ({
                                  ...prev,
                                  milestone: e.target.value
                                }));
                              }}
                              required
                            >
                              <option value="">Select Milestone</option>
                              {milestones.map((milestone, index) => (
                                <option key={`opportunity-milestone-${index}-${milestone.id}`} value={milestone.name}>
                                  {milestone.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Created Date:</label>
                          <input
                            type="text"
                            className="form-control"
                            value={currentOpportunity?.created_date || ''}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Created By:</label>
                          <input
                            type="text"
                            className="form-control"
                            value={currentOpportunity?.created_by || ''}
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Stage:*</label>
                          <select
                            className="form-select"
                            name="stage"
                            value={opportunityFormData.stage}
                            onChange={(e) => setOpportunityFormData(prev => ({
                              ...prev,
                              stage: e.target.value
                            }))}
                            required
                          >
                            <option value="">Select Stage</option>
                            <option value="Opportunity Identified">Opportunity Identified</option>
                            <option value="Qualification">Qualification</option>
                            <option value="Proposal">Proposal</option>
                            <option value="Negotiation">Negotiation</option>
                            <option value="Closed Won">Closed Won</option>
                            <option value="Closed Lost">Closed Lost</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Currency:</label>
                          <select
                            className="form-select"
                            name="currency"
                            value={opportunityFormData.currency}
                            onChange={(e) => setOpportunityFormData(prev => ({
                              ...prev,
                              currency: e.target.value
                            }))}
                          >
                            <option value="$">USD ($)</option>
                            <option value="€">EUR (€)</option>
                            <option value="£">GBP (£)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Opportunity Amount:</label>
                          <input
                            type="number"
                            className="form-control"
                            name="opportunity_amount"
                            value={opportunityFormData.opportunity_amount}
                            onChange={(e) => setOpportunityFormData(prev => ({
                              ...prev,
                              opportunity_amount: e.target.value
                            }))}
                            placeholder="Enter amount"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Probability (%):</label>
                          <input
                            type="number"
                            className="form-control"
                            name="probability"
                            value={opportunityFormData.probability}
                            onChange={(e) => setOpportunityFormData(prev => ({
                              ...prev,
                              probability: e.target.value
                            }))}
                            placeholder="Enter probability"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Expected Close Date:</label>
                          <input
                            type="date"
                            className="form-control"
                            name="expected_close_date"
                            value={opportunityFormData.expected_close_date}
                            onChange={(e) => setOpportunityFormData(prev => ({
                              ...prev,
                              expected_close_date: e.target.value
                            }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Next Step:</label>
                          <input
                            type="text"
                            className="form-control"
                            name="next_step"
                            value={opportunityFormData.next_step}
                            onChange={(e) => setOpportunityFormData(prev => ({
                              ...prev,
                              next_step: e.target.value
                            }))}
                            placeholder="Enter next step"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-12">
                        <div className="form-group mb-3">
                          <label className="form-label">Description:</label>
                          <textarea
                            className="form-control"
                            name="description"
                            value={opportunityFormData.description}
                            onChange={(e) => setOpportunityFormData(prev => ({
                              ...prev,
                              description: e.target.value
                            }))}
                            placeholder="Enter description"
                            rows="3"
                          />
                        </div>
                      </div>
                    </div>

                    {opportunityUpdateSuccess && (
                      <div className="alert alert-success" role="alert">
                        Opportunity updated successfully!
                      </div>
                    )}

                    {opportunityUpdateError && (
                      <div className="alert alert-danger" role="alert">
                        {opportunityUpdateError}
                      </div>
                    )}

                    <div className="d-flex justify-content-center gap-3 mt-4">
                      <button
                        type="submit"
                        className="btn save-btn"
                        disabled={opportunityUpdateLoading}
                      >
                        {opportunityUpdateLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Updating...
                          </>
                        ) : 'Update'}
                      </button>
                      <button
                        type="button"
                        className="btn cancel-btn"
                        onClick={handleCloseEditOpportunityModal}
                        disabled={opportunityUpdateLoading}
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

export default OpportunitiesTab;
