/**
 * Utility function to get the correct path for assets
 * This handles the base path for subdirectory deployments
 */

// Get the base URL from Vite's import.meta.env
const getBasePath = () => {
  // In development, this will be '/reporting/'
  // In production, it will be whatever is set in vite.config.js
  return import.meta.env.BASE_URL || '/';
};

/**
 * Get the correct path for an asset
 * @param {string} path - The path to the asset, without leading slash
 * @returns {string} - The correct path with the base URL
 */
export const getAssetPath = (path) => {
  const basePath = getBasePath();
  // Remove leading slash from path if it exists
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;

  // Combine base path and asset path
  return `${basePath}${cleanPath}`;
};

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
 * Check if user is logged in
 * @returns {boolean} - True if user is logged in, false otherwise
 */
export const isUserLoggedIn = () => {
  return localStorage.getItem("user") !== null;
};

export default getAssetPath;
