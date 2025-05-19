import React from 'react';

/**
 * A reusable sortable table header component
 * @param {Object} props - Component props
 * @param {string} props.label - The header label
 * @param {string} props.field - The field name to sort by
 * @param {string} props.currentSortField - The currently sorted field
 * @param {string} props.currentSortDirection - The current sort direction ('asc' or 'desc')
 * @param {Function} props.onSort - Function to call when header is clicked
 * @returns {JSX.Element} - The sortable table header
 */
const SortableTableHeader = ({ label, field, currentSortField, currentSortDirection, onSort }) => {
  const isActive = currentSortField === field;
  
  return (
    <th 
      className="sortable-header" 
      onClick={() => onSort(field)}
      style={{ cursor: 'pointer' }}
    >
      <div className="d-flex align-items-center">
        {label}
        <span className="ms-1">
          {isActive ? (
            currentSortDirection === 'asc' ? (
              <i className="fas fa-sort-up"></i>
            ) : (
              <i className="fas fa-sort-down"></i>
            )
          ) : (
            <i className="fas fa-sort text-muted" style={{ opacity: 0.3 }}></i>
          )}
        </span>
      </div>
    </th>
  );
};

export default SortableTableHeader;
