import React from 'react';

const LoadingOverlay = ({ isVisible, message = "Loading..." }) => {
  if (!isVisible) return null;
  
  return (
    <div className="loading-overlay">
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
