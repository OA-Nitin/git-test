import React, { useState, useMemo } from 'react';
import './DataTable.css';

const DataTable = ({
  data,
  columns,
  title,
  loading,
  error,
  searchTerm,  // 🔥 Parent se aa raha hai
  emptyMessage = 'No data found.',
  currentPage,
  setCurrentPage
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtering and sorting (pure derived state)
  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(item => {
        return columns.some(column => {
          const value = item[column.accessor];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig, columns]);

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Sorting function
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Pagination controls
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, safeCurrentPage - Math.floor(maxPagesToShow / 2));
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
        <button onClick={() => paginate(1)} disabled={safeCurrentPage === 1} className="pagination-button">&laquo;</button>
        <button onClick={() => paginate(safeCurrentPage - 1)} disabled={safeCurrentPage === 1} className="pagination-button">&lsaquo;</button>
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`pagination-button ${safeCurrentPage === number ? 'active' : ''}`}
          >
            {number}
          </button>
        ))}
        <button onClick={() => paginate(safeCurrentPage + 1)} disabled={safeCurrentPage === totalPages} className="pagination-button">&rsaquo;</button>
        <button onClick={() => paginate(totalPages)} disabled={safeCurrentPage === totalPages} className="pagination-button">&raquo;</button>

        <div className="pagination-info">
          <span>Page {safeCurrentPage} of {totalPages}</span>
          <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="items-per-page">
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>
    );
  };

  const renderTableHeader = () => (
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

  const renderTableBody = () => (
    <tbody>
      {currentItems.length > 0 ? (
        currentItems.map((item, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column, colIndex) => (
              <td key={colIndex}>
                {column.render ? column.render(item) : item[column.accessor] || '-'}
              </td>
            ))}
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={columns.length} className="no-data">{emptyMessage}</td>
        </tr>
      )}
    </tbody>
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="section-subtitle mb-0">{title}</h6>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div><p>Loading data...</p></div>
      ) : error ? (
        <div className="error-message"><p>{error}</p></div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              {renderTableHeader()}
              {renderTableBody()}
            </table>
          </div>

          <div className="data-table-footer">
            <div className="showing-entries">
              Showing {totalItems > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
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
