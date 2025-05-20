import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import SortableTableHeader from './SortableTableHeader';
import { sortArrayByKey } from '../../utils/sortUtils';
import './CommonStyles.css';

/**
 * StandardTable - A reusable table component with search, sorting, pagination, and export functionality
 *
 * @param {Object} props - Component props
 * @param {Array} props.data - The data to display in the table
 * @param {Array} props.columns - Column configuration (array of objects with title, field, sortable, etc.)
 * @param {string} props.title - Title for the table (used in exports)
 * @param {string} props.idField - The field to use as the unique identifier (default: 'id')
 * @param {Array} props.defaultSortField - The default field to sort by (default: first column's field)
 * @param {string} props.defaultSortDirection - The default sort direction (default: 'asc')
 * @param {number} props.defaultItemsPerPage - Default number of items per page (default: 10)
 * @param {Function} props.onRowClick - Function to call when a row is clicked (receives the row data)
 * @param {Function} props.renderActions - Function to render action buttons for each row (receives the row data)
 * @param {Function} props.renderCustomSearch - Function to render a custom search component
 * @param {boolean} props.showSearch - Whether to show the search box (default: true)
 * @param {boolean} props.showPagination - Whether to show pagination (default: true)
 * @param {boolean} props.showExport - Whether to show export buttons (default: true)
 * @param {boolean} props.showItemsPerPage - Whether to show items per page selector (default: true)
 * @returns {JSX.Element} - The StandardTable component
 */
const StandardTable = ({
  data = [],
  columns = [],
  title = 'Data Table',
  idField = 'id',
  defaultSortField = columns.length > 0 ? columns[0].field : 'id',
  defaultSortDirection = 'asc',
  defaultItemsPerPage = 10,
  onRowClick,
  renderActions,
  renderCustomSearch,
  showSearch = true,
  showPagination = true,
  showExport = true,
  showItemsPerPage = true
}) => {
  // State for search, sorting, and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(defaultSortField);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // If already sorting by this field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If sorting by a new field, set it and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  // Filter data based on search term
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;

    // Search across all searchable columns
    return columns.some(column => {
      if (column.searchable === false) return false;

      const value = item[column.field];
      if (value === null || value === undefined) return false;

      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Sort the filtered data
  const sortedData = sortArrayByKey(filteredData, sortField, sortDirection);

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate total pages
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Go to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Go to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle export to CSV
  const exportToCSV = () => {
    // Confirm export with user if there are many items
    if (sortedData.length > 100) {
      if (!confirm(`You are about to export ${sortedData.length} items. This may take a moment. Continue?`)) {
        return;
      }
    }

    const headers = columns.map(column => column.title);
    const csvData = sortedData.map(item =>
      columns.map(column => {
        const value = item[column.field];
        // Handle strings with commas by wrapping in quotes and escaping existing quotes
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
    );

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.toLowerCase().replace(/\\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle export to PDF
  const exportToPDF = () => {
    try {
      // Confirm export with user if there are many items
      if (sortedData.length > 100) {
        if (!confirm(`You are about to export ${sortedData.length} items to PDF. This may take a moment and result in a large file. Continue?`)) {
          return;
        }
      }

      // Initialize jsPDF with landscape orientation
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add title
      doc.setFontSize(16);
      doc.text(title, 15, 15);

      // Add generation date and search info
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 22);
      if (searchTerm) {
        doc.text(`Search term: "${searchTerm}"`, 15, 27);
      }

      // Create table data
      const tableColumn = columns.map(column => column.title);
      const tableRows = sortedData.map(item =>
        columns.map(column => item[column.field])
      );

      // Add table to document using the imported autoTable function
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: searchTerm ? 32 : 27,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 2,
          overflow: 'linebreak',
          halign: 'left'
        }
      });

      // Save the PDF with date in filename
      doc.save(`${title.toLowerCase().replace(/\\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  // Handle export to Excel
  const exportToExcel = () => {
    try {
      // Confirm export with user if there are many items
      if (sortedData.length > 100) {
        if (!confirm(`You are about to export ${sortedData.length} items to Excel. This may take a moment. Continue?`)) {
          return;
        }
      }

      // Prepare data for Excel
      const excelData = sortedData.map(item => {
        const row = {};
        columns.forEach(column => {
          row[column.title] = item[column.field];
        });
        return row;
      });

      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const wscols = columns.map(column => ({ wch: column.width || 15 }));
      worksheet['!cols'] = wscols;

      // Add header styling
      const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellRef]) continue;

        worksheet[cellRef].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4285F4" } }
        };
      }

      // Create a workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, title);

      // Add metadata
      workbook.Props = {
        Title: title,
        Subject: `${title} Data`,
        Author: "Occams Portal",
        CreatedDate: new Date()
      };

      // Generate Excel file and trigger download with date in filename
      XLSX.writeFile(workbook, `${title.toLowerCase().replace(/\\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('Excel generation error:', error);
      alert('Error generating Excel file: ' + error.message);
    }
  };

  return (
    <div className="standard-table-container">
      {/* Table controls */}
      <div className="table-controls mb-4">
        <div className="row align-items-center">
          {/* Search box */}
          {showSearch && (
            <div className="col-md-4">
              {renderCustomSearch ? (
                renderCustomSearch(searchTerm, setSearchTerm)
              ) : (
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-sm search-btn" type="button">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Items per page */}
          {showItemsPerPage && (
            <div className="col-md-4">
              <div className="d-flex align-items-center">
                <span className="me-2">Rows per page:</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: '80px' }}
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          )}

          {/* Export buttons */}
          {showExport && (
            <div className="col-md-4">
              <div className="d-flex justify-content-end">
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
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover table-striped">
          <thead>
            <tr>
              {columns.map((column, index) => (
                column.sortable !== false ? (
                  <SortableTableHeader
                    key={index}
                    label={column.title}
                    field={column.field}
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  />
                ) : (
                  <th key={index}>{column.title}</th>
                )
              ))}
              {renderActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr
                  key={item[idField] || index}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                  style={onRowClick ? { cursor: 'pointer' } : {}}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex}>
                      {column.render ? column.render(item) : item[column.field]}
                    </td>
                  ))}
                  {renderActions && (
                    <td>
                      {renderActions(item)}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0)} className="text-center">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="row mt-3">
          <div className="col-md-6">
            <p>
              Showing {sortedData.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, sortedData.length)} of {sortedData.length} items
              {sortedData.length !== data.length && ` (filtered from ${data.length} total)`}
            </p>
          </div>
          <div className="col-md-6">
            <nav aria-label="Table pagination">
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
                {currentPage < totalPages - 2 && totalPages > 1 && (
                  <li className="page-item">
                    <button
                      className="page-link"
                      onClick={() => paginate(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </li>
                )}

                <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandardTable;
