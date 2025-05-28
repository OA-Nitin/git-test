/**
 * User utility functions for session management
 * This file provides easy access to user data stored in localStorage after login
 */

/**
 * Get user data from localStorage
 * @returns {Object} - The user data object or empty object if not found
 */
export const getUserData = () => {
  const storedData = localStorage.getItem("user");
  if (storedData) {
    try {
      const parsedData = JSON.parse(storedData);
      console.log('getUserData - parsed user data:', parsedData);

      // Extract user data from the nested structure based on the exact JSON format
      if (parsedData.data && parsedData.data.user) {
        console.log('getUserData - found user data in data.user:', parsedData.data.user);
        return parsedData.data.user;
      }

      // If the structure is different, return the parsed data directly
      return parsedData;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return {};
    }
  }
  return {};
};

/**
 * Get user ID from localStorage
 * @returns {string|number|null} - The user ID or null if not found
 */
export const getUserId = () => {
  const userData = getUserData();
  
  // Try different possible property names for user ID
  return userData.user_id || 
         userData.id || 
         userData.ID || 
         userData.userId || 
         null;
};

/**
 * Get current logged-in user's username
 * @returns {string|null} - The username or null if not found
 */
export const getUsername = () => {
  const userData = getUserData();
  return userData.username || userData.user_login || userData.display_name || null;
};

/**
 * Get current logged-in user's display name
 * @returns {string|null} - The display name or null if not found
 */
export const getDisplayName = () => {
  const userData = getUserData();
  return userData.display_name || userData.username || userData.user_login || null;
};

/**
 * Get current logged-in user's email
 * @returns {string|null} - The email or null if not found
 */
export const getUserEmail = () => {
  const userData = getUserData();
  return userData.email || userData.user_email || null;
};

/**
 * Get current logged-in user's role
 * @returns {string|null} - The user role or null if not found
 */
export const getUserRole = () => {
  const userData = getUserData();
  return userData.role || userData.user_role || userData.roles || null;
};

/**
 * Check if user is logged in
 * @returns {boolean} - True if user is logged in, false otherwise
 */
export const isUserLoggedIn = () => {
  return localStorage.getItem("user") !== null;
};

/**
 * Clear user session (logout)
 */
export const clearUserSession = () => {
  localStorage.removeItem("user");
  // You can also clear other session-related data here if needed
};

/**
 * Get all user data in a formatted object
 * @returns {Object} - Formatted user data object
 */
export const getFormattedUserData = () => {
  const userData = getUserData();
  
  return {
    userId: getUserId(),
    username: getUsername(),
    displayName: getDisplayName(),
    email: getUserEmail(),
    role: getUserRole(),
    isLoggedIn: isUserLoggedIn(),
    rawData: userData
  };
};

// Example usage:
/*
import { getUserId, getUsername, getUserData } from '../utils/userUtils';

// In your component:
const MyComponent = () => {
  const userId = getUserId();
  const username = getUsername();
  const userData = getUserData();
  
  console.log('Current user ID:', userId);
  console.log('Current username:', username);
  console.log('Full user data:', userData);
  
  return (
    <div>
      <p>User ID: {userId}</p>
      <p>Username: {username}</p>
    </div>
  );
};
*/
