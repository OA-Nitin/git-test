import React, { useState, useEffect } from 'react';
import './DataTable.css';

const DataTable = ({
  data,
  columns,
  title,
  loading,
  error,
  emptyMessage = 'No data found.'
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);

  const getValueByAccessor = (item, accessor) => {
    try {
      return accessor.split('.').reduce((obj, key) => obj && obj[key], item);
    } catch {
      return undefined;
    }
  };

  // Filter and sort data when dependencies change
  useEffect(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(item => {
        return columns.some(column => {
          let cellValue;
          // If a render function is provided, use its output for searching.
          if (column.render) {
            cellValue = column.render(item);
          } else {
            // Otherwise, fall back to the accessor.
            cellValue = getValueByAccessor(item, column.accessor);
          }
          
          const searchableValue = cellValue !== undefined && cellValue !== null ? String(cellValue).toLowerCase() : '';
          return searchableValue.includes(searchTerm.toLowerCase());
        });
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = getValueByAccessor(a, sortConfig.key) || '';
        const bValue = getValueByAccessor(b, sortConfig.key) || '';

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredData(filtered);
    // setCurrentPage(1); // Reset to first page when filter/sort changes
  }, [data, searchTerm, sortConfig, columns]);

  // Reset to page 1 only when filter/sort/search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  // Handle sort request
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination-container">
        <button
          onClick={() => paginate(1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          Previous
        </button>
        {/* <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          &lsaquo;
        </button> */}

        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`pagination-button ${currentPage === number ? 'active' : ''}`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          Next
        </button>
        {/* <button
          onClick={() => paginate(totalPages)}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          &raquo;
        </button> */}

        {/* <div className="pagination-info">
          <span>Page {currentPage} of {totalPages}</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="items-per-page"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div> */}
      </div>
    );
  };

  // Render table header with sort indicators
  const renderTableHeader = () => {
    return (
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th
              key={index}
              onClick={() => column.sortable !== false && requestSort(column.accessor)}
              className={column.sortable !== false ? 'sortable' : ''}
            >
              {column.header}
              {sortConfig.key === column.accessor && (
                <span className={`sort-indicator ${sortConfig.direction}`}>
                  {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
                </span>
              )}
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  // Render table body
  const renderTableBody = () => {
    return (
      <tbody>
        {currentItems.length > 0 ? (
          currentItems.map((item, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {column.render ? column.render(item) : getValueByAccessor(item, column.accessor) || '-'}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} className="no-data">
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    );
  };

  // Main render
  return (
    <>   
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h6 className="section-subtitle mb-0">{title}</h6>
      <div className="search-box" style={{ width: '300px' }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control form-control-sm"
        />
      </div>
    </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              {renderTableHeader()}
              {renderTableBody()}
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted">
              Showing {filteredData.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
              {searchTerm && ` (filtered from ${data.length} total entries)`}
            </div>
            {renderPagination()}
          </div>
        </>
      )}
    </>
  );
}; 

export default DataTable;
