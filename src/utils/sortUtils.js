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
    // Map field names to possible API field names
    const fieldMappings = {
      'id': ['id', 'lead_id'],
      'businessName': ['name', 'business_name', 'business_legal_name'],
      'businessEmail': ['email', 'business_email'],
      'phoneNumber': ['phone', 'business_phone'],
      'status': ['status', 'lead_status'],
      'date': ['date', 'created'],
      'employee': ['employee', 'employee_id'],
      'salesAgent': ['sales_agent', 'internal_sales_agent'],
      'salesSupport': ['sales_support', 'internal_sales_support'],
      'affiliateSource': ['source', 'affiliate_source'],
      'leadCampaign': ['campaign', 'lead_campaign'],
      'w2Count': ['w2_count']
    };

    // Get the possible field names for the key
    const possibleFields = fieldMappings[key] || [key];

    // Try to get values from possible field names
    let valueA = null;
    let valueB = null;

    // Find the first field that exists in the objects
    for (const field of possibleFields) {
      if (a[field] !== undefined) {
        valueA = a[field];
        break;
      }
    }

    for (const field of possibleFields) {
      if (b[field] !== undefined) {
        valueB = b[field];
        break;
      }
    }

    // If values are still null, use empty string for comparison
    if (valueA === null) valueA = '';
    if (valueB === null) valueB = '';

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
