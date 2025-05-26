import React from 'react';
<<<<<<< HEAD
import './LoadingOverlay.css';

/**
 * LoadingOverlay Component
 * 
 * A reusable loading overlay that can be shown over any content
 * 
 * @param {Object} props
 * @param {boolean} props.isVisible - Whether the overlay is visible
 * @param {string} props.message - Optional message to display with the spinner
 * @param {string} props.className - Optional additional CSS classes
 * @returns {JSX.Element|null}
 */
const LoadingOverlay = ({ isVisible, message = 'Loading...', className = '' }) => {
  if (!isVisible) return null;

  return (
    <div className={`loading-overlay ${className}`}>
      <div className="loading-overlay-content">
        <div className="loading-spinner"></div>
        {message && <p className="loading-message">{message}</p>}
=======

const LoadingOverlay = ({ isVisible, message = "Loading..." }) => {
  if (!isVisible) return null;
  
  return (
    <div className="loading-overlay">
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">{message}</p>
>>>>>>> 6cba97d872aee81cdcf3ff05b399a28613ae70df
      </div>
    </div>
  );
};

export default LoadingOverlay;
