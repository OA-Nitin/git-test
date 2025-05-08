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

export default getAssetPath;
