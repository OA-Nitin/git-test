import React, { useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const OpportunitiesTab = ({
  opportunities,
  handleEditOpportunity,
  showDeleteConfirmation,
  showEditOpportunityModal,
  opportunityUpdateLoading,
  opportunityUpdateSuccess,
  opportunityUpdateError,
  opportunityFormData,
  currentOpportunity,
  milestones,
  milestoneStages,
  handleCloseEditOpportunityModal,
  handleUpdateOpportunity,
  setOpportunityFormData,
  setMilestoneStages,
  fetchMilestoneStages
}) => {

  // Date formatting utility function
  const formatDateToMMDDYYYY = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <div className="mb-4 left-section-container">
      <div className="row custom_opp_create_btn">
          {/* <a href='javaascript:void(0)'>
            <i className="fa-solid fa-plus"></i> New Opportunity
          </a> */}
      </div>

      {opportunities.length === 0 ? (
        <div className="text-center mt-4">
          <p>No opportunities found for this lead.</p>
        </div>
      ) : (
        opportunities.map((opportunity) => (
          <div key={opportunity.id} className="row custom_opp_tab">
            <div className="col-sm-12">
              <div className="custom_opp_tab_header">
                <h5>{opportunity.OpportunityName}</h5>
                <div className="opp_edit_dlt_btn projects-iris">
                  <a
                    className="edit_project"
                    href="javascript:void(0)"
                    title="Edit"
                    onClick={() => handleEditOpportunity(opportunity)}
                    style={{display:'none'}} >
                    <i className="fas fa-pen"></i>
                  </a>
                  {/* <a
                    className="delete_project"
                    href="javascript:void(0)"
                    title="Delete"
                    onClick={() => showDeleteConfirmation(opportunity)}
                  >
                    <i className="fas fa-trash"></i>
                  </a> */}
                </div>
              </div>
            </div>
            <div className="col-md-7 text-left">
              <div className="lead_des">
                <p>
                  <b>Created Date: </b>
                  {opportunity.CreatedAt ? format(new Date(opportunity.CreatedAt), 'MM/dd/yyyy') : '-'}
                </p>
                <p><b>Current Stage:</b> {opportunity.milestoneStatus}</p>
                <p><b>Next Step:</b> {opportunity.NextStep || ''}</p>
              </div>
            </div>
            <div className="col-md-5">
              <div className="lead_des">
                <p><b>Opportunity Owner:</b> {opportunity.CreatedBy}</p>
                <p><b>Opportunity Amount:</b> {opportunity.currencyName} {opportunity.OpportunityAmount}</p>
                <p><b>Expected Close date:</b> {formatDateToMMDDYYYY(opportunity.ExpectedCloseDate)}</p>
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
                            value={opportunityFormData.opportunity_name}
                            onChange={(e) => setOpportunityFormData(prev => ({
                              ...prev,
                              opportunity_name: e.target.value
                            }))}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Lead Name:</label>
                          <input
                            type="text"
                            className="form-control"
                            value={opportunityFormData.lead_name}
                            onChange={(e) => setOpportunityFormData(prev => ({
                              ...prev,
                              lead_name: e.target.value
                            }))}
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Products:*</label>
                          <select
                            className="form-select"
                            value={opportunityFormData.product}
                            onChange={(e) => {
                              const selectedProduct = e.target.value;
                              setOpportunityFormData(prev => ({
                                ...prev,
                                product: selectedProduct,
                                milestone: '' // Reset milestone when product changes
                              }));

                              // Update product selection
                              console.log('Product selected:', selectedProduct);
                            }}
                            required
                          >
                            <option value="">Select Product</option>
                            <option value="ERC">ERC</option>
                            <option value="STC">STC</option>
                            <option value="R&D">R&D</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Milestone:*</label>
                          <div className="milestone-select-wrapper">
                            <select
                              className="form-select milestone-select"
                              value={opportunityFormData.milestone}
                              data-label="2"
                              onChange={async (e) => {
                                console.log('Opportunity milestone selected:', e.target.value);

                                // Find the selected milestone to get its ID
                                const selectedMilestone = milestones.find(m => m.name === e.target.value);
                                console.log('Selected opportunity milestone object:', selectedMilestone);

                                // Update the form data with the selected milestone
                                setOpportunityFormData(prev => ({
                                  ...prev,
                                  milestone: e.target.value,
                                  // Clear the stage when milestone changes
                                  stage: ''
                                }));

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

                                    // Get the product_id from the current opportunity
                                    let product_id = currentOpportunity?.product_id || currentOpportunity?.productId;

                                    // If no product_id is available, try to map from the product name
                                    if (!product_id && currentOpportunity?.product) {
                                      product_id = productIdMap[currentOpportunity.product] || '936';
                                      console.log('Mapped product name', currentOpportunity.product, 'to product_id:', product_id);
                                    } else {
                                      product_id = '936'; // Default fallback to ERC product ID
                                    }

                                    console.log('Fetching milestone stages for milestone_id:', selectedMilestone.id, 'and product_id:', product_id);

                                    // Fetch milestone stages using the API endpoint with milestone_id
                                    const apiUrl = `https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/milestone-stages?milestone_id=${selectedMilestone.id}`;
                                    console.log('Calling milestone stages API with URL3:', apiUrl);

                                    const response = await axios.get(apiUrl);
                                    console.log('Milestone stages API response:', response);

                                    // Process the response
                                    let stages = [];
                                    if (response.data && response.data.success && response.data.data && response.data.data.data) {
                                      const stagesData = response.data.data.data;
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
                                    console.log('Milestone stages fetched successfully for opportunity:', stages);
                                  } catch (error) {
                                    console.error('Error fetching milestone stages for opportunity:', error);
                                    setMilestoneStages([]);
                                  }
                                } else {
                                  // Clear milestone stages if no milestone is selected
                                  setMilestoneStages([]);
                                }
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
                          <label className="form-label">Created Date:*</label>
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control"
                              value={opportunityFormData.created_date ? formatDateToMMDDYYYY(opportunityFormData.created_date) : ''}
                              onChange={(e) => setOpportunityFormData(prev => ({
                                ...prev,
                                created_date: e.target.value
                              }))}
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
                              required
                            />
                            <span className="input-group-text">
                              <i className="fas fa-calendar-alt"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Created By:*</label>
                          <input
                            type="text"
                            className="form-control"
                            value={opportunityFormData.created_by}
                            onChange={(e) => setOpportunityFormData(prev => ({
                              ...prev,
                              created_by: e.target.value
                            }))}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Stage:*</label>
                          <div className="milestone-select-wrapper">
                            <select
                              className="form-select"
                              value={opportunityFormData.stage}
                              onChange={(e) => {
                                console.log('Opportunity stage selected:', e.target.value);
                                setOpportunityFormData(prev => ({
                                  ...prev,
                                  stage: e.target.value
                                }));
                              }}
                              required
                            >
                              <option value="">Select Stage</option>
                              {milestoneStages.map((stage, index) => (
                                <option key={`opportunity-stage-${index}-${stage.id}`} value={stage.name}>
                                  {stage.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Currency:*</label>
                          <input
                            type="text"
                            className="form-control"
                            value={opportunityFormData.currency}
                            onChange={(e) => setOpportunityFormData(prev => ({
                              ...prev,
                              currency: e.target.value
                            }))}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Opportunity Amount:*</label>
                          <input
                            type="text"
                            className="form-control"
                            value={opportunityFormData.opportunity_amount}
                            onChange={(e) => setOpportunityFormData(prev => ({
                              ...prev,
                              opportunity_amount: e.target.value
                            }))}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Probability (%):*</label>
                          <input
                            type="text"
                            className="form-control"
                            value={opportunityFormData.probability}
                            onChange={(e) => setOpportunityFormData(prev => ({
                              ...prev,
                              probability: e.target.value
                            }))}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Expected Close Date:*</label>
                          <input
                            type="date"
                            className="form-control"
                            value={opportunityFormData.expected_close_date}
                            onChange={(e) => setOpportunityFormData(prev => ({
                              ...prev,
                              expected_close_date: e.target.value
                            }))}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Next Step:</label>
                          <input
                            type="text"
                            className="form-control"
                            value={opportunityFormData.next_step}
                            onChange={(e) => setOpportunityFormData(prev => ({
                              ...prev,
                              next_step: e.target.value
                            }))}
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
                            rows="3"
                            value={opportunityFormData.description}
                            onChange={(e) => setOpportunityFormData(prev => ({
                              ...prev,
                              description: e.target.value
                            }))}
                          ></textarea>
                        </div>
                      </div>
                    </div>

                    {opportunityUpdateSuccess && (
                      <div className="alert alert-success" role="alert">
                        <strong><i className="fas fa-check-circle me-2"></i>Opportunity updated successfully!</strong>
                      </div>
                    )}

                    {opportunityUpdateError && (
                      <div className="alert alert-danger" role="alert">
                        <strong><i className="fas fa-exclamation-triangle me-2"></i>Error!</strong>
                        <p className="mb-0 mt-1">{opportunityUpdateError}</p>
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