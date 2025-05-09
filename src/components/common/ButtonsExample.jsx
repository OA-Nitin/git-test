import React, { useState } from 'react';
import ActionButtons, { SaveButton, CancelButton } from './ActionButtons';
import Modal from './Modal';

/**
 * Example component to demonstrate how to use the ActionButtons components
 */
const ButtonsExample = () => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showLargeModal, setShowLargeModal] = useState(false);
  const [showCancelOnlyModal, setShowCancelOnlyModal] = useState(false);

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Saved successfully!');
      setShowModal(false);
      setShowLargeModal(false);
    }, 2000);
  };

  const handleCancel = () => {
    alert('Operation cancelled');
    setShowModal(false);
    setShowLargeModal(false);
    setShowCancelOnlyModal(false);
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const toggleLargeModal = () => {
    setShowLargeModal(!showLargeModal);
  };

  const toggleCancelOnlyModal = () => {
    setShowCancelOnlyModal(!showCancelOnlyModal);
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Action Buttons Examples</h5>
            </div>
            <div className="card-body">
              <h6 className="mb-3">1. Individual Buttons</h6>
              <div className="example-box p-3 border rounded mb-4">
                <p className="mb-2">You can use the SaveButton and CancelButton components individually:</p>
                <div className="d-flex gap-2">
                  <SaveButton onClick={() => alert('Save clicked')} />
                  <CancelButton onClick={() => alert('Cancel clicked')} />
                </div>
                <div className="mt-3">
                  <SaveButton
                    text="Custom Text"
                    onClick={() => alert('Custom save clicked')}
                    className="me-2"
                  />
                  <SaveButton
                    disabled={true}
                    onClick={() => {}}
                    className="me-2"
                  />
                  <SaveButton
                    loading={true}
                    onClick={() => {}}
                  />
                </div>
              </div>

              <h6 className="mb-3">2. ActionButtons Component (Default)</h6>
              <div className="example-box p-3 border rounded mb-4">
                <p className="mb-2">The ActionButtons component combines both buttons with proper spacing:</p>
                <ActionButtons
                  onSave={handleSave}
                  onCancel={handleCancel}
                  loading={loading}
                />
              </div>

              <h6 className="mb-3">3. ActionButtons with Custom Text</h6>
              <div className="example-box p-3 border rounded mb-4">
                <p className="mb-2">You can customize the button text:</p>
                <ActionButtons
                  onSave={handleSave}
                  onCancel={handleCancel}
                  saveText="Submit"
                  cancelText="Go Back"
                />
              </div>

              <h6 className="mb-3">4. Different Alignments</h6>
              <div className="example-box p-3 border rounded mb-4">
                <p className="mb-2">Left aligned:</p>
                <ActionButtons
                  onSave={handleSave}
                  onCancel={handleCancel}
                  buttonAlignment="start"
                />

                <p className="mb-2 mt-3">Center aligned:</p>
                <ActionButtons
                  onSave={handleSave}
                  onCancel={handleCancel}
                  buttonAlignment="center"
                />

                <p className="mb-2 mt-3">Right aligned (default):</p>
                <ActionButtons
                  onSave={handleSave}
                  onCancel={handleCancel}
                  buttonAlignment="end"
                />
              </div>

              <h6 className="mb-3">5. In a Form</h6>
              <div className="example-box p-3 border rounded mb-4">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}>
                  <div className="mb-3">
                    <label htmlFor="exampleInput" className="form-label">Example Input</label>
                    <input type="text" className="form-control" id="exampleInput" />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="exampleTextarea" className="form-label">Example Textarea</label>
                    <textarea className="form-control" id="exampleTextarea" rows="3"></textarea>
                  </div>
                  <ActionButtons
                    onSave={handleSave}
                    onCancel={handleCancel}
                    loading={loading}
                  />
                </form>
              </div>

              <h6 className="mb-3">6. In Modals</h6>
              <div className="example-box p-3 border rounded mb-4">
                <p className="mb-2">Standard modal with Save and Cancel buttons:</p>
                <button className="btn btn-primary me-2" onClick={toggleModal}>
                  Open Standard Modal
                </button>

                <p className="mb-2 mt-3">Large modal with Save and Cancel buttons:</p>
                <button className="btn btn-info me-2" onClick={toggleLargeModal}>
                  Open Large Modal
                </button>

                <p className="mb-2 mt-3">Modal with Cancel button only:</p>
                <button className="btn btn-secondary" onClick={toggleCancelOnlyModal}>
                  Open Cancel-Only Modal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Standard Modal Example */}
      <Modal
        show={showModal}
        onClose={toggleModal}
        title="Standard Modal Example"
        showFooter={true}
        onSave={handleSave}
        loading={loading}
      >
        <p>This is a standard modal with Save and Cancel buttons.</p>
        <p>The buttons are aligned in the center of the modal footer.</p>
      </Modal>

      {/* Large Modal Example */}
      <Modal
        show={showLargeModal}
        onClose={toggleLargeModal}
        title="Large Modal Example"
        showFooter={true}
        onSave={handleSave}
        loading={loading}
        size="lg"
      >
        <p>This is a large modal with Save and Cancel buttons.</p>
        <p>The modal is wider and the buttons are aligned in the center of the modal footer.</p>
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          You can use the <code>size</code> prop to control the width of the modal.
          Available options are: <code>sm</code>, <code>lg</code>, and <code>xl</code>.
        </div>
      </Modal>

      {/* Cancel-Only Modal Example */}
      <Modal
        show={showCancelOnlyModal}
        onClose={toggleCancelOnlyModal}
        title="Cancel-Only Modal Example"
        showFooter={true}
        cancelText="Close"
      >
        <p>This is a modal with only a Cancel button (renamed to "Close").</p>
        <p>This is useful for informational modals that don't require a save action.</p>
      </Modal>
    </div>
  );
};

export default ButtonsExample;
