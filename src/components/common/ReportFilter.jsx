import React from 'react';
import DateRangePicker from './DateRangePicker';
import Swal from 'sweetalert2';

/**
 * ReportFilter - A reusable component for report filtering, searching, and export options
 *
 * @param {Object} props - Component props
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.setSearchTerm - Function to update search term
 * @param {boolean} props.isSearching - Whether search is in progress
 * @param {Function} props.setIsSearching - Function to update searching state
 * @param {Function} props.setCurrentPage - Function to update current page
 * @param {string} props.startDate - Current start date
 * @param {string} props.endDate - Current end date
 * @param {Function} props.handleApplyDateFilter - Function to apply date filter
 * @param {Function} props.refreshData - Function to refresh data
 * @param {boolean} props.loading - Whether data is loading
 * @param {Array} props.columnGroups - Groups of columns for column selector
 * @param {Array} props.visibleColumns - Currently visible columns
 * @param {Function} props.toggleColumnVisibility - Function to toggle column visibility
 * @param {Function} props.resetToDefaultColumns - Function to reset to default columns
 * @param {Function} props.selectAllColumns - Function to select all columns
 * @param {Function} props.exportToExcel - Function to export to Excel
 * @param {Function} props.exportToPDF - Function to export to PDF
 * @param {Function} props.exportToCSV - Function to export to CSV
 */
const ReportFilter = ({
  searchTerm,
  setSearchTerm,
  isSearching,
  setIsSearching,
  setCurrentPage,
  startDate,
  endDate,
  handleApplyDateFilter,
  refreshData,
  loading,
  columnGroups,
  visibleColumns,
  toggleColumnVisibility,
  resetToDefaultColumns,
  selectAllColumns,
  exportToExcel,
  exportToPDF,
  exportToCSV
}) => {
  // Handle search
  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 500);
    setCurrentPage(1); // Reset to first page when searching

    // Show feedback toast if search term is not empty
    if (searchTerm.trim() !== '') {
      Swal.fire({
        title: 'Searching...',
        text: `Searching for "${searchTerm}"`,
        icon: 'info',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  return (
    <div className="mb-4">
      <div className="row align-items-center">
        {/* Search box */}
        <div className="col-md-4">
          <div className="input-group input-group-sm">
            <div className="position-relative flex-grow-1">
              <input
                type="text"
                className="form-control"
                placeholder="Search by any field..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingRight: '30px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="btn btn-sm position-absolute"
                  style={{
                    right: '5px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none'
                  }}
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                >
                  <i className="fas fa-times text-muted"></i>
                </button>
              )}
            </div>
            <div className="input-group-append">
              <button
                className="btn btn-sm search-btn"
                type="button"
                onClick={handleSearch}
              >
                <i className={`fas fa-search ${isSearching ? 'fa-spin' : ''}`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="col-md-3 mb-2 mb-md-0">
          <DateRangePicker
            onApplyFilter={handleApplyDateFilter}
            startDate={startDate}
            endDate={endDate}
          />
        </div>

        {/* Export buttons and Column Selector */}
        <div className="col-md-5">
          <div className="d-flex justify-content-end">
            {/* Refresh Button */}
            <button
              className="btn btn-sm btn-outline-primary me-2"
              onClick={refreshData}
              disabled={loading}
              title="Refresh Data"
            >
              <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
            </button>

            {/* Column Visibility Dropdown */}
            <div className="dropdown me-2">
              <button
                className="column-selector-btn"
                type="button"
                id="columnSelectorDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fas fa-columns"></i> Columns
              </button>
              <div className="dropdown-menu dropdown-menu-end column-selector" aria-labelledby="columnSelectorDropdown">
                <div className="column-selector-header">
                  <span>Table Columns</span>
                  <i className="fas fa-table"></i>
                </div>
                <div className="column-selector-content">
                  {columnGroups.map(group => (
                    <div key={group.id} className="column-group">
                      <div className="column-group-title">{group.title}</div>
                      {group.columns.map(column => (
                        <div
                          key={column.id}
                          className={`dropdown-item ${visibleColumns.includes(column.id) ? 'active' : ''}`}
                        >
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`column-${column.id}`}
                              checked={visibleColumns.includes(column.id)}
                              onChange={() => toggleColumnVisibility(column.id)}
                            />
                            <label className="form-check-label" htmlFor={`column-${column.id}`}>
                              {column.label}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="column-selector-footer">
                  <button className="btn btn-reset" onClick={resetToDefaultColumns}>
                    Reset
                  </button>
                  <button className="btn btn-apply" onClick={selectAllColumns}>
                    Select All
                  </button>
                </div>
              </div>
            </div>

            {/* Export Buttons */}
            <button className="btn btn-sm export-btn" onClick={exportToExcel}>
              <i className="fas fa-file-excel me-1"></i> Excel
            </button>
            <button className="btn btn-sm export-btn" onClick={exportToPDF}>
              <i className="fas fa-file-pdf me-1"></i> PDF
            </button>
            <button className="btn btn-sm export-btn" onClick={exportToCSV}>
              <i className="fas fa-file-csv me-1"></i> CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportFilter;
