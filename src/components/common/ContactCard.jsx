import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import './ContactCard.css';

/**
 * Reusable ContactCard component that can be used throughout the application
 * @param {Object} props - Component props
 * @param {Object} props.entity - The entity (lead, project, etc.) to display contact information for
 * @param {string} [props.entityType='project'] - Type of entity (lead, project, etc.)
 * @param {boolean} [props.showButton=true] - Whether to show the button to open the contact card
 * @param {string} [props.buttonText=''] - Text to display on the button (if empty, only icon is shown)
 * @param {string} [props.buttonClassName='btn btn-sm btn-outline-primary'] - CSS class for the button
 * @param {string} [props.buttonIcon='fas fa-address-card'] - Icon class for the button
 * @param {string} [props.buttonTitle='View Contact Card'] - Title attribute for the button
 */
const ContactCard = ({
  entity,
  entityType = 'project',
  showButton = true,
  buttonText = '',
  buttonClassName = 'btn btn-sm btn-outline-primary',
  buttonIcon = 'fas fa-address-card',
  buttonTitle = 'View Contact Card'
}) => {
  const [showModal, setShowModal] = useState(false);

  // Toggle the modal
  const toggleModal = () => {
    setShowModal(!showModal);
  };

  // Get the appropriate field names based on entity type
  const getFieldNames = () => {
    switch (entityType) {
      case 'lead':
        return {
          id: 'lead_id',
          name: 'business_name',
          phone: 'business_phone',
          email: 'business_email',
          signatory: 'authorized_signatory_name',
          status: 'status',
          stage: 'stage'
        };
      case 'project':
      default:
        return {
          id: entity.project_id ? 'project_id' : 'id',
          name: entity.business_legal_name ? 'business_legal_name' : 'business_name',
          phone: 'business_phone',
          email: 'business_email',
          projectName: entity.project_name ? 'project_name' : 'project',
          status: 'status',
          stage: entity.stage_name ? 'stage_name' : 'stage'
        };
    }
  };

  // Get field values with fallbacks
  const fields = getFieldNames();
  const businessName = entity[fields.name] || 'Unknown Business';
  const stage = entity[fields.stage] || '';
  const projectName = entity[fields.projectName] || 'N/A';
  const businessPhone = entity[fields.phone] || 'N/A';
  const businessEmail = entity[fields.email] || 'N/A';
  const id = entity[fields.id] || '';

  // Get badge class based on stage
  const getBadgeClass = (stageName) => {
    if (!stageName) return 'bg-secondary';

    const stageNameLower = stageName.toLowerCase();

    if (stageNameLower.includes('fully paid') || stageNameLower.includes('complete')) {
      return 'bg-success';
    } else if (stageNameLower.includes('pending') || stageNameLower.includes('documents')) {
      return 'bg-info';
    } else if (stageNameLower.includes('processing') || stageNameLower.includes('initiate')) {
      return 'bg-primary';
    } else if (stageNameLower.includes('returned') || stageNameLower.includes('failed')) {
      return 'bg-danger';
    } else if (stageNameLower.includes('success fees')) {
      return 'bg-warning';
    } else {
      return 'bg-secondary';
    }
  };

  // Render the contact card content
  const renderContactCardContent = () => {
    return (
      <div className="contact-card-content">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">
            {entity.isFallbackData && (
              <span className="badge bg-warning me-1" title="Sample data">
                <i className="fas fa-exclamation-triangle"></i>
              </span>
            )}
            {businessName}
          </h5>
          {stage && (
            <span className={`badge ${getBadgeClass(stage)}`}>
              {stage}
            </span>
          )}
        </div>

        <table className="table table-bordered">
          <tbody>
            {id && (
              <tr>
                <th>{entityType === 'lead' ? 'Lead ID' : 'Project ID'}</th>
                <td>{id}</td>
              </tr>
            )}
            {projectName && (
              <tr>
                <th>Project Name</th>
                <td>{projectName}</td>
              </tr>
            )}
            {entity[fields.signatory] && (
              <tr>
                <th>Authorized Signatory</th>
                <td>{entity[fields.signatory]}</td>
              </tr>
            )}
            <tr>
              <th>Business Phone</th>
              <td>{businessPhone}</td>
            </tr>
            <tr>
              <th>Business Email</th>
              <td>{businessEmail}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="contact-card-component">
      {/* Button to open the contact card */}
      {showButton && (
        <button
          className={buttonClassName}
          onClick={toggleModal}
          title={buttonTitle}
        >
          <i className={buttonIcon}></i>
          {buttonText && <span className="ms-1">{buttonText}</span>}
        </button>
      )}

      {/* Contact Card Modal */}
      <Modal
        show={showModal}
        onClose={toggleModal}
        title="Contact Card"
        showFooter={false}
        size="md"
      >
        {renderContactCardContent()}
      </Modal>
    </div>
  );
};

ContactCard.propTypes = {
  entity: PropTypes.object.isRequired,
  entityType: PropTypes.oneOf(['lead', 'project']),
  showButton: PropTypes.bool,
  buttonText: PropTypes.string,
  buttonClassName: PropTypes.string,
  buttonIcon: PropTypes.string,
  buttonTitle: PropTypes.string
};

export default ContactCard;
