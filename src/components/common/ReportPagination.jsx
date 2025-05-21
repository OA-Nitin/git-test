import React from 'react';

/**
 * ReportPagination - A reusable component for report pagination
 * 
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.paginate - Function to change page
 * @param {Function} props.goToPreviousPage - Function to go to previous page
 * @param {Function} props.goToNextPage - Function to go to next page
 * @param {number} props.indexOfFirstItem - Index of first item on current page
 * @param {number} props.indexOfLastItem - Index of last item on current page
 * @param {number} props.totalFilteredItems - Total number of filtered items
 * @param {number} props.totalItems - Total number of items before filtering
 * @param {string} props.itemName - Name of the items being paginated (default: 'items')
 */
const ReportPagination = ({
  currentPage,
  totalPages,
  paginate,
  goToPreviousPage,
  goToNextPage,
  indexOfFirstItem,
  indexOfLastItem,
  totalFilteredItems,
  totalItems,
  itemName = 'items'
}) => {
  return (
    <div className="row mt-3">
      <div className="col-md-6">
        <p>
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalFilteredItems)} of {totalFilteredItems} {itemName} 
          {totalFilteredItems !== totalItems && ` (filtered from ${totalItems} total)`}
        </p>
      </div>
      <div className="col-md-6">
        <nav aria-label="Pagination">
          <ul className="pagination justify-content-end">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>

            {/* First page */}
            {currentPage > 3 && (
              <li className="page-item">
                <button className="page-link" onClick={() => paginate(1)}>1</button>
              </li>
            )}

            {/* Ellipsis */}
            {currentPage > 4 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}

            {/* Page numbers */}
            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              // Show current page and 1 page before and after
              if (
                pageNumber === currentPage ||
                pageNumber === currentPage - 1 ||
                pageNumber === currentPage + 1
              ) {
                return (
                  <li
                    key={pageNumber}
                    className={`page-item ${pageNumber === currentPage ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  </li>
                );
              }
              return null;
            })}

            {/* Ellipsis */}
            {currentPage < totalPages - 3 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}

            {/* Last page */}
            {currentPage < totalPages - 2 && (
              <li className="page-item">
                <button
                  className="page-link"
                  onClick={() => paginate(totalPages)}
                >
                  {totalPages}
                </button>
              </li>
            )}

            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default ReportPagination;
