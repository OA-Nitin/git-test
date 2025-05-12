import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  return (
    <div className={`toast-container ${isVisible ? 'visible' : ''}`}>
      <div className="toast-content">
        <div className="toast-message">
          <span>{message}</span>
        </div>
        <button className="toast-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default Toast;
