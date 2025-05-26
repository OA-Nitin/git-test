import React from 'react';

/**
 * SortableTableHeader - A component for table headers that can be sorted
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - The label to display in the header
 * @param {string} props.field - The field name to sort by
 * @param {string} props.currentSortField - The currently sorted field
 * @param {string} props.currentSortDirection - The current sort direction ('asc' or 'desc')
 * @param {Function} props.onSort - Callback when the header is clicked
 */
const SortableTableHeader = ({
  label,
  field,
  currentSortField,
  currentSortDirection,
  onSort
}) => {
  // Determine if this header is currently sorted
  const isSorted = currentSortField === field;
  
  // Handle click
  const handleClick = () => {
    if (onSort) {
      onSort(field);
    }
  };
  
  return (
    <th 
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        backgroundColor: isSorted ? '#f8f9fa' : undefined
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span>{label}</span>
        <span style={{ 
          display: 'inline-block',
          width: '16px',
          textAlign: 'center',
          marginLeft: '4px'
        }}>
          {isSorted ? (
            currentSortDirection === 'asc' ? (
              <i className="fas fa-sort-up" style={{ color: '#007bff' }}></i>
            ) : (
              <i className="fas fa-sort-down" style={{ color: '#007bff' }}></i>
            )
          ) : (
            <i className="fas fa-sort" style={{ opacity: 0.3 }}></i>
          )}
        </span>
      </div>
    </th>
  );
};

export default SortableTableHeader;
