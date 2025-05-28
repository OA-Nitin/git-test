import React, { useState, useEffect } from 'react';
import { 
  getUserId, 
  getUsername, 
  getUserData, 
  getDisplayName,
  getUserEmail,
  getUserRole,
  isUserLoggedIn,
  getFormattedUserData 
} from '../utils/userUtils';

/**
 * Example component showing how to get user_id and other user data
 * This component demonstrates all the available user utility functions
 */
const UserInfoExample = () => {
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    // Get all user information when component mounts
    const info = getFormattedUserData();
    setUserInfo(info);
    
    // Log individual values for debugging
    console.log('=== USER SESSION DATA ===');
    console.log('User ID:', getUserId());
    console.log('Username:', getUsername());
    console.log('Display Name:', getDisplayName());
    console.log('Email:', getUserEmail());
    console.log('Role:', getUserRole());
    console.log('Is Logged In:', isUserLoggedIn());
    console.log('Raw User Data:', getUserData());
    console.log('========================');
  }, []);

  if (!userInfo.isLoggedIn) {
    return (
      <div className="alert alert-warning">
        <h4>User Not Logged In</h4>
        <p>Please log in to view user information.</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h3>Current User Session Information</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h5>Basic Information</h5>
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <td><strong>User ID:</strong></td>
                    <td>{userInfo.userId || 'Not available'}</td>
                  </tr>
                  <tr>
                    <td><strong>Username:</strong></td>
                    <td>{userInfo.username || 'Not available'}</td>
                  </tr>
                  <tr>
                    <td><strong>Display Name:</strong></td>
                    <td>{userInfo.displayName || 'Not available'}</td>
                  </tr>
                  <tr>
                    <td><strong>Email:</strong></td>
                    <td>{userInfo.email || 'Not available'}</td>
                  </tr>
                  <tr>
                    <td><strong>Role:</strong></td>
                    <td>{userInfo.role || 'Not available'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="col-md-6">
              <h5>Raw User Data (JSON)</h5>
              <pre className="bg-light p-3" style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
                {JSON.stringify(userInfo.rawData, null, 2)}
              </pre>
            </div>
          </div>
          
          <div className="row mt-4">
            <div className="col-12">
              <h5>How to Use in Your Components</h5>
              <div className="bg-light p-3">
                <code>
                  {`// Import the utility functions
import { getUserId, getUsername, getUserData } from '../utils/userUtils';

// In your component:
const MyComponent = () => {
  const userId = getUserId();
  const username = getUsername();
  
  // Use the user_id in your API calls
  useEffect(() => {
    if (userId) {
      // Make API call with user_id
      fetchUserSpecificData(userId);
    }
  }, [userId]);
  
  return <div>User ID: {userId}</div>;
};`}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoExample;
