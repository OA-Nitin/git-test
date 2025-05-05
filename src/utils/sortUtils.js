/**
 * Utility functions for sorting table data
 */

/**
 * Sort an array of objects by a specific property
 * @param {Array} array - The array to sort
 * @param {string} key - The property to sort by
 * @param {string} direction - The sort direction ('asc' or 'desc')
 * @returns {Array} - The sorted array
 */
export const sortArrayByKey = (array, key, direction) => {
  const sortedArray = [...array]; // Create a copy to avoid mutating the original array
  
  return sortedArray.sort((a, b) => {
    // Handle different data types
    let valueA = a[key];
    let valueB = b[key];
    
    // Convert to lowercase if string for case-insensitive sorting
    if (typeof valueA === 'string') valueA = valueA.toLowerCase();
    if (typeof valueB === 'string') valueB = valueB.toLowerCase();
    
    // Handle numeric values
    if (!isNaN(valueA) && !isNaN(valueB)) {
      valueA = Number(valueA);
      valueB = Number(valueB);
    }
    
    // Handle dates (assuming ISO format or similar)
    if (valueA && valueB && !isNaN(Date.parse(valueA)) && !isNaN(Date.parse(valueB))) {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    }
    
    // Perform the comparison
    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};
