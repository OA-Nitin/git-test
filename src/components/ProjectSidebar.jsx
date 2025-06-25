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
  contact,
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
}) => (
  <>
    {/* Milestone & Stage */}
    <div className="card mb-4 p-2">
      <div className="card-body p-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Milestone:</h5>
          {!isEditing && (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={startEditingMilestoneStage}
              style={{ fontSize: '16px' }}
            >
              <i className="fas fa-edit"></i>
            </button>
          )}
        </div>
        <div className="milestone-display mb-4 d-flex align-items-center">
          {isEditing ? (
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
          ) : (
            <span className="fw-medium" style={{ color: '#0000cc' }}>{milestone ? milestone.label : 'No milestone selected'}</span>
          )}
        </div>
        <h5 className="card-title mb-0">Stage:</h5>
        <div className="stage-display mb-4 d-flex align-items-center">
          {isEditing ? (
            <Select
              value={stage}
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
          ) : (
            <span className="fw-medium" style={{ color: '#0000cc' }}>{stage ? stage.label : 'No stage selected'}</span>
          )}
        </div>
        {isEditing && (
          <div className="d-flex justify-content-between mt-3">
            <button
              className="btn"
              onClick={saveMilestoneAndStage}
              disabled={!milestone || !stage || isLoadingMilestones || isLoadingStages}
              style={{
                backgroundColor: 'rgb(76, 175, 80)',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '5px 25px',
                marginRight: '10px',
              }}
            >
              {isLoadingMilestones ? 'Updating...' : 'Update'}
            </button>
            <button
              className="btn"
              onClick={cancelMilestoneStageEdit}
              disabled={isLoadingMilestones || isLoadingStages}
              style={{
                backgroundColor: 'white',
                color: '#ff6a00',
                border: '1px solid #ff6a00',
                borderRadius: '20px',
                padding: '5px 25px',
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Collaborators */}
    <div className="card mb-4 p-2">
      <div className="card-body p-2">
        <h5 className="card-title mb-0">Assigned Collaborators:</h5>
        {/* Assigned Collaborators List */}
        {assignedCollaborators && assignedCollaborators.length > 0 ? (
          <div className="assigned-users-tags">
            {assignedCollaborators.map(collaborator => (
              <div key={collaborator.collaborators_name_id} className="assigned-user-tag">
                <span className="user-name">{collaborator.collaborators_name}</span>
                <button
                  className="remove-tag-btn"
                  onClick={() => handleRemoveCollaborator(collaborator.collaborators_name_id)}
                  aria-label="Remove collaborator"
                  disabled={isAssigningCollaborator}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted small">No collaborators assigned yet.</p>
        )}
        <div className="mb-2">
          <label className="form-label">Add Collaborator:</label>
          <Select
            options={collaboratorOptions}
            value={selectedCollaborator}
            onChange={handleCollaboratorChange}
            isClearable
            placeholder="Select collaborator to assign..."
            classNamePrefix="react-select"
          />
        </div>
        <button
          className="btn btn-primary w-100"
          onClick={handleAssignCollaborator}
          disabled={isAssigningCollaborator || !selectedCollaborator}
        >
          {isAssigningCollaborator ? 'Assigning...' : 'Assign Collaborator'}
        </button>
      </div>
    </div>

    {/* Owner */}
    <div className="card mb-4 p-2">
      <div className="card-body p-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Select Owner:</h5>
          {!isEditingOwner && (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={startEditingOwner}
              style={{ fontSize: '16px' }}
            >
              <i className="fas fa-edit"></i>
            </button>
          )}
        </div>
        <div className="mb-2">
          {isEditingOwner ? (
            <Select
              options={ownerOptions}
              value={owner}
              onChange={handleOwnerChange}
              isClearable
              placeholder="Select owner..."
              classNamePrefix="react-select"
            />
          ) : (
            <span className="fw-medium" style={{ color: '#0000cc' }}>{owner ? owner.label : 'No owner selected'}</span>
          )}
        </div>
        {isEditingOwner && (
          <div className="d-flex justify-content-between mt-3">
            <button
              className="btn"
              onClick={saveOwner}
              disabled={ownerLoading || !owner}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '5px 25px',
                marginRight: '10px',
              }}
            >
              {ownerLoading ? 'Updating...' : 'Update'}
            </button>
            <button
              className="btn"
              onClick={cancelOwnerEdit}
              disabled={ownerLoading}
              style={{
                backgroundColor: 'white',
                color: '#ff6a00',
                border: '1px solid #ff6a00',
                borderRadius: '20px',
                padding: '5px 25px',
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Contact */}
    <div className="card mb-4 p-2">
      <div className="card-body p-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Select Contact:</h5>
          {!isEditingContact && (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={startEditingContact}
              style={{ fontSize: '16px' }}
            >
              <i className="fas fa-edit"></i>
            </button>
          )}
        </div>
        <div className="mb-2">
          {isEditingContact ? (
            <Select
              options={contactOptions}
              value={contact}
              onChange={handleContactChange}
              isClearable
              placeholder="Select contact..."
              classNamePrefix="react-select"
            />
          ) : (
            <span className="fw-medium" style={{ color: '#0000cc' }}>{contact ? contact.label : 'No contact selected'}</span>
          )}
        </div>
        {isEditingContact && (
          <div className="d-flex justify-content-between mt-3">
            <button
              className="btn"
              onClick={saveContact}
              disabled={!contact || contactLoading}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '5px 25px',
                marginRight: '10px',
              }}
            >
              {contactLoading ? 'Updating...' : 'Update'}
            </button>
            <button
              className="btn"
              onClick={cancelContactEdit}
              disabled={contactLoading}
              style={{
                backgroundColor: 'white',
                color: '#ff6a00',
                border: '1px solid #ff6a00',
                borderRadius: '20px',
                padding: '5px 25px',
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  </>
);

export default ProjectSidebar; 