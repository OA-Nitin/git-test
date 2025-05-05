import React, { useState, useEffect } from 'react';
import './MyProfile.css';
import './SweetAlert.css';
import Toast from './Toast';
import Modal from './Modal';
import QRCode from './QRCode';

const MyProfile = () => {
  // No refs needed for our custom implementation

  // State for form fields
  const [personalDetails, setPersonalDetails] = useState({
    name: 'Daniel Fredrick',
    companyName: '',
    email: 'daniel.fredrick@occamsadvisory.com',
    phone: '',
    streetAddress: '',
    zipCode: '',
    city: '',
    state: ''
  });

  // State for address suggestions
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // State for toast notification
  const [toast, setToast] = useState({
    visible: false,
    message: ''
  });

  // State for QR code modal
  const [qrModal, setQrModal] = useState({
    isOpen: false,
    url: '',
    title: ''
  });

  // State for referral links
  const [referralLinks, setReferralLinks] = useState([
    { id: 1, type: 'AFFILIATE REFERRAL LINK', url: 'https://bit.ly/3QGdLe' },
    { id: 2, type: 'LEAD REFERRAL LINK', url: 'https://bit.ly/3QGdLe' },
    { id: 3, type: 'ERC REFERRAL LINK', url: 'https://bit.ly/3QGdLe' },
    { id: 4, type: 'NOL REFERRAL LINK', url: 'https://bit.ly/3QGdLe' }
  ]);

  // State for profile settings
  const [profileSettings, setProfileSettings] = useState({
    currentEmail: 'daniel.fredrick@occamsadvisory.com',
    newEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // Set page title
  useEffect(() => {
    document.title = "My Profile - Occams Portal";
  }, []);

  // Sample address data for demonstration
  const sampleAddresses = [
    {
      streetAddress: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    },
    {
      streetAddress: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001'
    },
    {
      streetAddress: '789 Pine Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601'
    },
    {
      streetAddress: '101 Maple Dr',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001'
    },
    {
      streetAddress: '202 Cedar Ln',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001'
    }
  ];

  // Function to handle address input and show suggestions
  const handleAddressChange = (e) => {
    const { value } = e.target;

    // Update the street address in state
    setPersonalDetails(prev => ({
      ...prev,
      streetAddress: value
    }));

    // Only proceed if we have at least 2 characters
    if (value.length >= 2) {
      // Filter addresses that match what the user has typed
      const filteredAddresses = sampleAddresses.filter(addr =>
        addr.streetAddress.toLowerCase().includes(value.toLowerCase())
      );

      // Update suggestions
      setAddressSuggestions(filteredAddresses);
      setShowSuggestions(filteredAddresses.length > 0);
    } else {
      // Clear suggestions if input is too short
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Function to select an address from suggestions
  const selectAddress = (address) => {
    setPersonalDetails(prev => ({
      ...prev,
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode
    }));

    // Hide suggestions after selection
    setShowSuggestions(false);
  };

  // Format phone number to (555) 555-5555 format
  const formatPhoneNumber = (phoneNumberString) => {
    // Strip all non-numeric characters
    const cleaned = ('' + phoneNumberString).replace(/\D/g, '');

    // Limit to 10 digits
    const digits = cleaned.substring(0, 10);

    // Format as (XXX) XXX-XXXX
    if (digits.length === 0) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.substring(0, 3)}) ${digits.substring(3)}`;
    return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
  };

  // Handle personal details change
  const handlePersonalDetailsChange = (e) => {
    const { name, value } = e.target;

    // Special handling for phone field
    if (name === 'phone') {
      setPersonalDetails({
        ...personalDetails,
        [name]: formatPhoneNumber(value)
      });
    } else {
      setPersonalDetails({
        ...personalDetails,
        [name]: value
      });
    }
  };

  // Handle profile settings change
  const handleProfileSettingsChange = (e) => {
    const { name, value } = e.target;
    setProfileSettings({
      ...profileSettings,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to an API
    console.log('Form submitted:', { personalDetails, profileSettings });

    // Use SweetAlert2 instead of default alert
    if (window.Swal) {
      Swal.fire({
        title: 'Success!',
        text: 'Profile updated successfully!',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ff7f50', // Match the orange color used in the app
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-confirm-button'
        }
      });
    } else {
      // Fallback to regular alert if SweetAlert2 is not available
      alert('Profile updated successfully!');
    }
  };

  // Copy referral link to clipboard
  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        // Show success notification using SweetAlert2 if available
        if (window.Swal) {
          Swal.fire({
            title: 'Copied!',
            text: 'Link copied to clipboard!',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ff7f50',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            position: 'top-end',
            toast: true,
            customClass: {
              popup: 'swal-custom-popup',
              title: 'swal-custom-title'
            }
          });
        } else {
          // Fallback to toast notification
          setToast({
            visible: true,
            message: 'Link copied to clipboard!'
          });
        }
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);

        // Show error notification
        if (window.Swal) {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to copy link!',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ff7f50'
          });
        } else {
          // Fallback to toast notification
          setToast({
            visible: true,
            message: 'Failed to copy link!'
          });
        }
      });
  };

  // Close toast notification
  const closeToast = () => {
    setToast({
      ...toast,
      visible: false
    });
  };

  // Open QR code modal
  const openQrModal = (url, type) => {
    setQrModal({
      isOpen: true,
      url,
      title: type
    });
  };

  // Close QR code modal
  const closeQrModal = () => {
    setQrModal({
      ...qrModal,
      isOpen: false
    });
  };

  // Download QR code
  const downloadQrCode = () => {
    const canvas = document.querySelector('.qr-code canvas');
    if (!canvas) return;

    // Create a temporary link element
    const link = document.createElement('a');
    link.download = `qrcode-${qrModal.title.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Clean up
    document.body.removeChild(link);

    // Show success notification using SweetAlert2 if available
    if (window.Swal) {
      Swal.fire({
        title: 'Downloaded!',
        text: 'QR Code downloaded successfully!',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ff7f50',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title'
        }
      });
    } else {
      // Fallback to toast notification
      setToast({
        visible: true,
        message: 'QR Code downloaded successfully!'
      });
    }
  };

  return (
    <div className="main_content_iner">
      {/* Toast notification */}
      <Toast
        message={toast.message}
        isVisible={toast.visible}
        onClose={closeToast}
        duration={3000}
      />

      {/* QR Code Modal */}
      <Modal
        isOpen={qrModal.isOpen}
        onClose={closeQrModal}
        title={`QR Code for ${qrModal.title}`}
      >
        <div className="qr-code-container">
          <QRCode url={qrModal.url} size={250} />
          <div className="qr-code-link">{qrModal.url}</div>
          <button className="download-button" onClick={downloadQrCode}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download QR Code
          </button>
        </div>
      </Modal>

      <div className="container-fluid p-0">
        <div className="row justify-content-center">
          <div className="col-lg-12">
            <div className="white_card card_height_100 mb_30">
              <div className="white_card_header">
                <div className="box_header m-0 new_report_header">
                  <div className="title_img">
                    <img src="/assets/images/user_details.svg" className="page-title-img" alt="User Details" />
                    <h4 className="text-white">User Details</h4>
                  </div>
                </div>
              </div>
              <div className="white_card_body">
                <form onSubmit={handleSubmit}>
                  {/* Personal Details Section */}
                  <div className="profile-section">
                    <h5 className="section-title">Personal Information</h5>
                    <div className="row">
                      <div className="col-md-4 mb-4">
                        <label htmlFor="name">Name:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={personalDetails.name}
                          onChange={handlePersonalDetailsChange}
                        />
                      </div>
                      <div className="col-md-4 mb-4">
                        <label htmlFor="companyName">Company Name:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="companyName"
                          name="companyName"
                          value={personalDetails.companyName}
                          onChange={handlePersonalDetailsChange}
                        />
                      </div>
                      <div className="col-md-4 mb-4">
                        <label htmlFor="email">Email*:</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={personalDetails.email}
                          onChange={handlePersonalDetailsChange}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4 mb-4">
                        <label htmlFor="phone">Phone:</label>
                        <input
                          type="tel"
                          className="form-control"
                          id="phone"
                          name="phone"
                          value={personalDetails.phone}
                          onChange={handlePersonalDetailsChange}
                          placeholder="(555) 555-5555"
                        />
                      </div>
                      <div className="col-md-4 mb-4">
                        <label htmlFor="streetAddress">Street Address:</label>
                        <div className="address-input-container">
                          <input
                            type="text"
                            className="form-control"
                            id="streetAddress"
                            name="streetAddress"
                            value={personalDetails.streetAddress}
                            onChange={handleAddressChange}
                            placeholder="Try typing: 123 Main St, 456 Oak Ave, etc."
                            autoComplete="off"
                          />
                          {showSuggestions && (
                            <div className="address-suggestions">
                              {addressSuggestions.map((address, index) => (
                                <div
                                  key={index}
                                  className="suggestion-item"
                                  onClick={() => selectAddress(address)}
                                >
                                  {address.streetAddress}, {address.city}, {address.state} {address.zipCode}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-4 mb-4">
                        <label htmlFor="zipCode">Zip Code:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="zipCode"
                          name="zipCode"
                          value={personalDetails.zipCode}
                          onChange={handlePersonalDetailsChange}
                          readOnly
                          placeholder="Auto-populated from address"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <label htmlFor="city">City:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="city"
                          name="city"
                          value={personalDetails.city}
                          onChange={handlePersonalDetailsChange}
                          readOnly
                          placeholder="Auto-populated from address"
                        />
                      </div>
                      <div className="col-md-6 mb-4">
                        <label htmlFor="state">State:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="state"
                          name="state"
                          value={personalDetails.state}
                          onChange={handlePersonalDetailsChange}
                          readOnly
                          placeholder="Auto-populated from address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Referral Links Section */}
                  <div className="profile-section">
                    <h5 className="section-title">Referral Links & QR Codes</h5>
                    <div className="referral-links">
                      {referralLinks.map(link => (
                        <div key={link.id} className="referral-link-item">
                          <div className="referral-link-type">{link.type}</div>
                          <div className="referral-link-url">
                            <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
                          </div>
                          <div className="referral-link-actions">
                            <button
                              type="button"
                              className="btn btn-sm copy-link-btn"
                              onClick={() => copyToClipboard(link.url)}
                            >
                              Copy Link
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm qr-btn"
                              onClick={() => openQrModal(link.url, link.type)}
                            >
                              QR Code
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Profile Settings Section */}
                  <div className="profile-section">
                    <h5 className="section-title">Account Settings</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <h6 className="subsection-title">Change Email Address</h6>
                        <div className="mb-4">
                          <label htmlFor="currentEmail">Current Email ID:</label>
                          <input
                            type="email"
                            className="form-control"
                            id="currentEmail"
                            name="currentEmail"
                            value={profileSettings.currentEmail}
                            readOnly
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="newEmail">New Email ID:</label>
                          <input
                            type="email"
                            className="form-control"
                            id="newEmail"
                            name="newEmail"
                            value={profileSettings.newEmail}
                            onChange={handleProfileSettingsChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <h6 className="subsection-title">Set Password</h6>
                        <div className="mb-4">
                          <label htmlFor="currentPassword">Current Password:</label>
                          <input
                            type="password"
                            className="form-control"
                            id="currentPassword"
                            name="currentPassword"
                            value={profileSettings.currentPassword}
                            onChange={handleProfileSettingsChange}
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="newPassword">New Password:</label>
                          <input
                            type="password"
                            className="form-control"
                            id="newPassword"
                            name="newPassword"
                            value={profileSettings.newPassword}
                            onChange={handleProfileSettingsChange}
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="confirmNewPassword">Confirm New Password:</label>
                          <input
                            type="password"
                            className="form-control"
                            id="confirmNewPassword"
                            name="confirmNewPassword"
                            value={profileSettings.confirmNewPassword}
                            onChange={handleProfileSettingsChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="text-center mt-4 mb-3">
                    <button type="submit" className="btn update-profile-btn">Update</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
