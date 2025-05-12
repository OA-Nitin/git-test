import React from 'react';
import PropTypes from 'prop-types';
import ActionButtons from './ActionButtons';
import './Modal.css';

/**
 * Modal component - Reusable modal dialog with consistent styling
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether the modal is visible
 * @param {function} props.onClose - Function to call when the modal is closed
 * @param {string} props.title - The title to display in the header
 * @param {React.ReactNode} props.children - The content to display in the modal body
 * @param {boolean} [props.showFooter=false] - Whether to show the footer
 * @param {function} [props.onSave=null] - Function to call when the save button is clicked
 * @param {string} [props.saveText='Save'] - Text to display on the save button
 * @param {string} [props.cancelText='Cancel'] - Text to display on the cancel button
 * @param {boolean} [props.loading=false] - Whether the save button is in a loading state
 * @param {boolean} [props.saveDisabled=false] - Whether the save button is disabled
 * @param {string} [props.size=''] - Size of the modal ('sm', 'lg', 'xl')
 * @param {string} [props.className=''] - Additional CSS classes for the modal
 * @param {Object} [props.style={}] - Additional inline styles for the modal
 * @returns {JSX.Element|null} - Rendered component or null if not shown
 */
const Modal = ({
  show,
  onClose,
  title,
  children,
  showFooter = false,
  onSave = null,
  saveText = 'Save',
  cancelText = 'Cancel',
  loading = false,
  saveDisabled = false,
  size = '',
  className = '',
  style = {}
}) => {
  if (!show) return null;

  // Determine modal size class
  const sizeClass = size ? `modal-${size}` : '';

  return (
    <>
      <div className="modal-backdrop show" style={{ display: 'block' }}></div>
      <div className={`modal show ${className}`} style={{ display: 'block', ...style }}>
        <div className={`modal-dialog modal-dialog-centered ${sizeClass}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              {children}
            </div>

            {showFooter && (
              <div className="modal-footer">
                {onSave ? (
                  <ActionButtons
                    onSave={onSave}
                    onCancel={onClose}
                    saveText={saveText}
                    cancelText={cancelText}
                    loading={loading}
                    saveDisabled={saveDisabled}
                    buttonAlignment="center"
                  />
                ) : (
                  <div className="d-flex justify-content-center w-100">
                    <CancelButton onClick={onClose} text={cancelText} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

Modal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  showFooter: PropTypes.bool,
  onSave: PropTypes.func,
  saveText: PropTypes.string,
  cancelText: PropTypes.string,
  loading: PropTypes.bool,
  saveDisabled: PropTypes.bool,
  size: PropTypes.oneOf(['', 'sm', 'lg', 'xl']),
  className: PropTypes.string,
  style: PropTypes.object
};

/**
 * Convenience component for Modal.Body
 */
export const ModalBody = ({ children, className = '', style = {} }) => (
  <div className={`modal-body ${className}`} style={style}>
    {children}
  </div>
);

ModalBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object
};

/**
 * Convenience component for Modal.Footer
 */
export const ModalFooter = ({ children, className = '', style = {} }) => (
  <div className={`modal-footer ${className}`} style={style}>
    {children}
  </div>
);

ModalFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object
};

// Import here to avoid circular dependency
import { CancelButton } from './ActionButtons';

export default Modal;
