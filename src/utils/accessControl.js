/**
 * Utility functions for role-based access control
 */

/**
 * Checks if the current user has any of the specified roles
 * @param {Array} allowedRoles - Array of roles that are allowed to access
 * @returns {boolean} - Returns true if user has any of the allowed roles
 */
export const hasRoleAccess = (allowedRoles) => {
  try {
    const userObj = JSON.parse(localStorage.getItem("user"));
    const user = userObj?.data?.user;
    
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      return false;
    }

    return user.roles.some(role => allowedRoles.includes(role));
  } catch (error) {
    console.error('Error checking role access:', error);
    return false;
  }
};

/**
 * Checks if the current user has a specific role
 * @param {string} role - Role to check for
 * @returns {boolean} - Returns true if user has the specified role
 */
export const hasSpecificRole = (role) => {
  try {
    const userObj = JSON.parse(localStorage.getItem("user"));
    const user = userObj?.data?.user;
    
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      return false;
    }

    return user.roles.includes(role);
  } catch (error) {
    console.error('Error checking specific role:', error);
    return false;
  }
};

/**
 * Checks if the current user is an administrator
 * @returns {boolean} - Returns true if user is an administrator
 */
export const isAdministrator = () => {
  return hasSpecificRole('administrator');
};

/**
 * Checks if the current user is an echeck client
 * @returns {boolean} - Returns true if user is an echeck client
 */
export const isEcheckClient = () => {
  return hasSpecificRole('echeck_client');
}; 