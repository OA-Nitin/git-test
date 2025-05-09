import React from 'react';
import PropTypes from 'prop-types';
import './ActionButtons.css';

/**
 * SaveButton component - Reusable orange save button
 * @param {Object} props - Component props
 * @param {string} [props.text='Save'] - Button text
 * @param {function} props.onClick - Click handler function
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {boolean} [props.loading=false] - Whether to show loading state
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {Object} [props.style={}] - Additional inline styles
 * @param {string} [props.type='button'] - Button type (button, submit, reset)
 * @returns {JSX.Element} - Rendered component
 */
export const SaveButton = ({
  text = 'Save',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  style = {},
  type = 'button'
}) => {
  return (
    <button
      type={type}
      className={`action-btn save-btn ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Saving...
        </>
      ) : (
        text
      )}
    </button>
  );
};

SaveButton.propTypes = {
  text: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  type: PropTypes.oneOf(['button', 'submit', 'reset'])
};

/**
 * CancelButton component - Reusable red cancel button
 * @param {Object} props - Component props
 * @param {string} [props.text='Cancel'] - Button text
 * @param {function} props.onClick - Click handler function
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {Object} [props.style={}] - Additional inline styles
 * @returns {JSX.Element} - Rendered component
 */
export const CancelButton = ({
  text = 'Cancel',
  onClick,
  disabled = false,
  className = '',
  style = {}
}) => {
  return (
    <button
      type="button"
      className={`action-btn cancel-btn ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {text}
    </button>
  );
};

CancelButton.propTypes = {
  text: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object
};

/**
 * ActionButtons component - Container for Save and Cancel buttons
 * @param {Object} props - Component props
 * @param {function} props.onSave - Save button click handler
 * @param {function} props.onCancel - Cancel button click handler
 * @param {string} [props.saveText='Save'] - Save button text
 * @param {string} [props.cancelText='Cancel'] - Cancel button text
 * @param {boolean} [props.saveDisabled=false] - Whether save button is disabled
 * @param {boolean} [props.cancelDisabled=false] - Whether cancel button is disabled
 * @param {boolean} [props.loading=false] - Whether to show loading state on save button
 * @param {string} [props.className=''] - Additional CSS classes for container
 * @param {Object} [props.style={}] - Additional inline styles for container
 * @param {string} [props.buttonAlignment='end'] - Alignment of buttons (start, center, end)
 * @returns {JSX.Element} - Rendered component
 */
const ActionButtons = ({
  onSave,
  onCancel,
  saveText = 'Save',
  cancelText = 'Cancel',
  saveDisabled = false,
  cancelDisabled = false,
  loading = false,
  className = '',
  style = {},
  buttonAlignment = 'center'
}) => {
  const getJustifyContent = () => {
    switch (buttonAlignment) {
      case 'start':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'end':
      default:
        return 'flex-end';
    }
  };

  return (
    <div
      className={`action-buttons-container ${className}`}
      style={{
        justifyContent: getJustifyContent(),
        ...style
      }}
    >
      <CancelButton
        text={cancelText}
        onClick={onCancel}
        disabled={cancelDisabled}
      />
      <SaveButton
        text={saveText}
        onClick={onSave}
        disabled={saveDisabled}
        loading={loading}
      />
    </div>
  );
};

ActionButtons.propTypes = {
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  saveText: PropTypes.string,
  cancelText: PropTypes.string,
  saveDisabled: PropTypes.bool,
  cancelDisabled: PropTypes.bool,
  loading: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  buttonAlignment: PropTypes.oneOf(['start', 'center', 'end'])
};

export default ActionButtons;
