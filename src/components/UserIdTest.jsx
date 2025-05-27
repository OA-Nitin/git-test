import React, { useEffect } from 'react';
import { getUserId, getUserData } from '../utils/userUtils';

/**
 * Test component to verify user_id is working correctly
 * This can be temporarily added to any page to test user_id functionality
 */
const UserIdTest = () => {
  useEffect(() => {
    console.log('=== USER ID TEST ===');
    console.log('getUserId():', getUserId());
    console.log('getUserData():', getUserData());
    console.log('localStorage user:', localStorage.getItem('user'));
    console.log('==================');
  }, []);

  const currentUserId = getUserId();
  const currentUserData = getUserData();

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#f8f9fa', 
      border: '1px solid #dee2e6', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <strong>User ID Test:</strong><br />
      <strong>User ID:</strong> {currentUserId || 'Not found'}<br />
      <strong>Username:</strong> {currentUserData?.username || 'Not found'}<br />
      <strong>Display Name:</strong> {currentUserData?.display_name || 'Not found'}
    </div>
  );
};

export default UserIdTest;
