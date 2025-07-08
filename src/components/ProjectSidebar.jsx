import React from 'react';
import Select from 'react-select';

const ProjectSidebar = ({
  milestone,
  stage,
  isEditing,
  startEditingMilestoneStage,
  owner,
  isEditingOwner,
  startEditingOwner,
  ownerOptions,
  handleOwnerChange,
  collaborators,
  collaboratorOptions,
  selectedCollaborator,
  handleCollaboratorChange,
  handleAssignCollaborator,
  selectedContact,
  isEditingContact,
  startEditingContact,
  contactOptions,
  handleContactChange,
  assignedCollaborators,
  isAssigningCollaborator,
  isLoadingMilestones,
  isLoadingStages,
  saveMilestoneAndStage,
  cancelMilestoneStageEdit,
  ownerLoading,
  saveOwner,
  cancelOwnerEdit,
  contactLoading,
  saveContact,
  cancelContactEdit,
  milestones,
  handleMilestoneChange,
  milestoneStages,
  handleProjectStageChange,
  handleRemoveCollaborator,
  projectStage,
  currentCollaborators,
  collaboratorLoading,
}) => (
  <>
    <div className="card mb-4 p-2">
      <div className="card-body p-2">


        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Milestone:</h5>
          {!isEditing && (
            <button
              className="btn btn-sm btn-outline-primary"
              // onClick={() => setIsEditing(true)}
              onClick={startEditingMilestoneStage}
              style={{ fontSize: '16px' }}
            >
              <i className="fas fa-edit"></i>
            </button>
          )}
        </div>

        {!isEditing ? (
          <div className="milestone-display mb-4 d-flex align-items-center">
            <span className="fw-medium" style={{ color: '#0000cc' }}>{milestone ? milestone.label : 'No milestone selected'}</span>
          </div>
        ) : (
          <div className="milestone-edit mb-4">
            <div className="form-group mb-3">
              <Select
                value={milestone}
                onChange={handleMilestoneChange}
                options={milestones}
                className="react-select-container"
                classNamePrefix="react-select"
                isLoading={isLoadingMilestones}
                placeholder="Select Milestone"
                noOptionsMessage={() => "No milestones available"}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '4px',
                    borderColor: '#ced4da',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: '#adb5bd'
                    }
                  })
                }}
              />
            </div>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Stage:</h5>
        </div>

        {!isEditing ? (
          <div className="stage-display mb-4 d-flex align-items-center">
            <span className="fw-medium" style={{ color: '#0000cc' }}>{projectStage ? projectStage.label : 'No stage selected'}</span>
          </div>
        ) : (
          <div className="stage-edit mb-4">
            <div className="form-group mb-3">
              <Select
                value={projectStage}
                onChange={handleProjectStageChange}
                options={milestoneStages}
                className="react-select-container"
                classNamePrefix="react-select"
                isLoading={isLoadingStages}
                placeholder={milestone ? "Select Stage" : "Select a milestone first"}
                noOptionsMessage={() => milestone ? "No stages available for this milestone" : "Select a milestone first"}
                isDisabled={!milestone || milestones.length === 0}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '4px',
                    borderColor: '#ced4da',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: '#adb5bd'
                    }
                  })
                }}
              />
            </div>
          </div>
        )}

        {/* Update/cancel buttons */}
        {isEditing && (
          <div className="d-flex justify-content-between mt-3">
            <button
              className="btn btn-sm"
              onClick={saveMilestoneAndStage}
              disabled={!milestone || !projectStage || isLoadingMilestones || isLoadingStages}
              style={{
                backgroundColor: 'rgb(76, 175, 80)',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '5px 25px'
              }}
            >
              {isLoadingMilestones ? 'Updating...' : 'Update'}
            </button>
            <button
              className="btn btn-sm"
              // onClick={() => setIsEditing(false)}
              onClick={cancelMilestoneStageEdit}
              disabled={isLoadingMilestones || isLoadingStages}
              style={{
                backgroundColor: 'white',
                color: '#ff6a00',
                border: '1px solid #ff6a00',
                borderRadius: '20px',
                padding: '5px 25px'
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>

    <div className="card mb-4 p-2">
      <div className="card-body p-2">
        <h5 className="card-title">Assigned Collaborators:</h5>

        {/* Display assigned collaborators above the dropdown */}
        <div className="assigned-users-list mb-4">
          {currentCollaborators.length === 0 ? (
            <p className="text-muted small">No collaborators assigned yet.</p>
          ) : (
            <div className="assigned-users-tags">
              {currentCollaborators.map(collaborator => (
                <div key={collaborator.collaborators_name_id} className="assigned-user-tag">
                  <span className="user-name">{collaborator.collaborators_name}</span>
                  <button
                    className="remove-tag-btn"
                    onClick={() => handleRemoveCollaborator(collaborator.collaborators_name_id)}
                    aria-label="Remove collaborator"
                    disabled={collaboratorLoading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Select dropdown for collaborator assignment */}
        <div className="form-group mb-3">
          <label htmlFor="collaboratorSelect" className="form-label">Add Collaborator:</label>
          <Select
            id="collaboratorSelect"
            value={selectedCollaborator}
            onChange={handleCollaboratorChange}
            options={collaboratorOptions.filter(option =>
              !currentCollaborators.some(collaborator =>
                collaborator.collaborators_name_id === option.collaborator.id
              )
            )}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select collaborator to assign..."
            isClearable
            isSearchable
            isLoading={collaboratorLoading}
            noOptionsMessage={({ inputValue }) =>
              inputValue && inputValue.length > 0
                ? "No matching collaborators found"
                : collaboratorOptions.length === currentCollaborators.length
                  ? "All collaborators have been assigned"
                  : "No collaborators available"
            }
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: '4px',
                borderColor: '#ced4da',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: '#adb5bd'
                }
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected
                  ? '#6c63ff'
                  : state.isFocused
                    ? '#f0f4ff'
                    : 'white',
                color: state.isSelected ? 'white' : '#333',
                padding: '10px 12px'
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
              })
            }}
          />
        </div>

        {/* Assign collaborator button */}
        <button
          className="btn assign-user-btn w-100"
          onClick={handleAssignCollaborator}
          disabled={!selectedCollaborator || collaboratorLoading}
        >
          {collaboratorLoading ? 'Assigning...' : 'Assign Collaborator'}
        </button>
      </div>
    </div>

    <div className="card mb-4 p-2">
      <div className="card-body p-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Select Owner:</h5>
          {!isEditingOwner && (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={startEditingOwner}
              // onClick={() => setIsEditingOwner(true)}
              style={{ fontSize: '16px' }}
            >
              <i className="fas fa-edit"></i>
            </button>
          )}
        </div>

        {!isEditingOwner ? (
          <div className="owner-display mb-4 d-flex align-items-center">
            <span className="fw-medium" style={{ color: '#0000cc' }}>
              {owner && owner.label ? owner.label : 'No owner assigned'}
            </span>
          </div>
        ) : (
          <div className="owner-edit mb-4">
            <div className="form-group mb-3">
              <Select
                value={owner}
                onChange={handleOwnerChange}
                options={ownerOptions}
                className="react-select-container"
                classNamePrefix="react-select"
                isLoading={ownerLoading}
                isDisabled={ownerLoading}
                isClearable
                isSearchable
                placeholder={ownerLoading ? "Loading owners..." : "Search or select owner..."}
                noOptionsMessage={() => "No matching owners found"}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '4px',
                    borderColor: '#ced4da',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: '#adb5bd'
                    }
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? '#6c63ff'
                      : state.isFocused
                        ? '#f0f4ff'
                        : 'white',
                    color: state.isSelected ? 'white' : '#333',
                    padding: '10px 12px'
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                  })
                }}
              />
            </div>
            <div className="d-flex justify-content-between mt-3">
              <button
                className="btn btn-sm"
                onClick={saveOwner}
                disabled={ownerLoading || !owner}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '5px 25px'
                }}
              >
                {ownerLoading ? 'Updating...' : 'Update'}
              </button>
              <button
                className="btn btn-sm"
                onClick={cancelOwnerEdit}
                // onClick={() => setIsEditingOwner(false)}
                disabled={ownerLoading}
                style={{
                  backgroundColor: 'white',
                  color: '#ff6a00',
                  border: '1px solid #ff6a00',
                  borderRadius: '20px',
                  padding: '5px 25px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

    <div className="card mb-4 p-2">
      <div className="card-body p-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Select Contact:</h5>
          {!isEditingContact && (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={startEditingContact}
              // onClick={() => setIsEditingContact(true)}
              style={{ fontSize: '16px' }}
            >
              <i className="fas fa-edit"></i>
            </button>
          )}
        </div>

        {!isEditingContact ? (
          <div className="contact-display mb-4 d-flex align-items-center">
            <span className="fw-medium" style={{ color: '#0000cc' }}>{selectedContact.label}</span>
          </div>
        ) : (
          <div className="contact-edit mb-4">
            <div className="form-group mb-3">
              <Select
                value={selectedContact}
                onChange={handleContactChange}
                options={contactOptions}
                className="react-select-container"
                classNamePrefix="react-select"
                isLoading={contactLoading}
                isDisabled={contactLoading}
                isClearable
                isSearchable
                placeholder={contactLoading ? "Loading contacts..." : "Search or select contact..."}
                noOptionsMessage={() => "No matching contacts found"}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '4px',
                    borderColor: '#ced4da',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: '#adb5bd'
                    }
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? '#6c63ff'
                      : state.isFocused
                        ? '#f0f4ff'
                        : 'white',
                    color: state.isSelected ? 'white' : '#333',
                    padding: '10px 12px'
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                  })
                }}
              />
            </div>
            <div className="d-flex justify-content-between mt-3">
              <button
                className="btn btn-sm"
                onClick={saveContact}
                disabled={!selectedContact || contactLoading}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '5px 25px'
                }}
              >
                {contactLoading ? 'Updating...' : 'Update'}
              </button>
              <button
                className="btn btn-sm"
                // onClick={() => setIsEditingContact(false)}
                onClick={cancelContactEdit}
                disabled={contactLoading}
                style={{
                  backgroundColor: 'white',
                  color: '#ff6a00',
                  border: '1px solid #ff6a00',
                  borderRadius: '20px',
                  padding: '5px 25px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </>
);

export default ProjectSidebar; 