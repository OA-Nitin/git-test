import 'react-datepicker/dist/react-datepicker.css';

const DefaultModalContent = ({ modalData, actionText }) => (
  <div className="modal-body">
    <h5 className="section-title">{actionText}</h5>
    <div className="confirmation-message mt-3">
      <p className="text-muted">
        Are you sure you want to {actionText.toLowerCase()} this invoice?
      </p>
    </div>
  </div>
);

export default DefaultModalContent;
