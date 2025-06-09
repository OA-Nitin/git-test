import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageContainer from '../common/PageContainer';
import ReportFilter from '../common/ReportFilter';
import ReportPagination from '../common/ReportPagination';
import SortableTableHeader from '../common/SortableTableHeader';
import { sortArrayByKey } from '../../utils/sortUtils';

const InvoiceReport = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [sortField, setSortField] = useState('invoice_date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isSearching, setIsSearching] = useState(false);

  const merchantId = '1'; // adjust if dynamic later

  const columnDefinitions = [
    { id: 'invoice_date', label: 'Date', sortable: true },
    { id: 'customer_invoice_no', label: 'Invoice ID', sortable: true },
    { id: 'total_amount', label: 'Amount', sortable: true },
    { id: 'business_name', label: 'Business Name', sortable: true },
    { id: 'customer_name', label: 'Customer Name', sortable: true },
    { id: 'status_id', label: 'Status', sortable: true },
    { id: 'invoice_type', label: 'Type', sortable: true },
    { id: 'due_date', label: 'Due Date', sortable: true }
  ];

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://play.occamsadvisory.com/portal/wp-json/invoices/v1/invoice-listing',
        {
          date_from: startDate || '04/01/2023',
          date_to: endDate || '04/06/2025',
          merchant_id: merchantId,
          filter_type:'',
          search:''
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      const records = response.data?.data?.records || [];
      setInvoices(records);
    } catch (err) {
      console.error('Failed to load invoice data:', err);
      setError('Failed to load invoice data');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);
  };

  const handleApplyDateFilter = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1);
    fetchInvoices();
  };

  const filteredInvoices = invoices.filter(inv => {
    /*const matchesSearch =
      searchTerm === '' ||
      Object.values(inv).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      ); */

    if (searchTerm === '' && !startDate && !endDate) {
      return true;
    };
    const searchTermLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchTerm === '' ||
      id.includes(searchTermLower) ||
      business_name.includes(searchTermLower) ||
      customer_name.includes(searchTermLower) ||
      customer_invoice_no.includes(searchTermLower);

      let matchesDateRange = true;

    const invoiceDate = new Date(inv.invoice_date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    /*const matchesDate =
      (!start || invoiceDate >= start) &&
      (!end || invoiceDate <= end); */

    if (startDate || endDate) {
      // Try to parse the created date
      let invoiceDate;
      try {
        // First try to parse as ISO date
        invoiceDate = new Date(inv.invoice_date);

        // If invalid date, try to parse as MM/DD/YYYY
        if (isNaN(invoiceDate.getTime())) {
          const parts = inv.invoice_date.split('/');
          if (parts.length === 3) {
            // MM/DD/YYYY format
            invoiceDate = new Date(parts[2], parts[0] - 1, parts[1]);
          }
        }

        // If still invalid, don't include this project in date-filtered results
        if (isNaN(invoiceDate.getTime())) {
          matchesDateRange = false;
        } else {
          // Set time to midnight for date comparison
          invoiceDate.setHours(0, 0, 0, 0);

          // Check start date
          if (startDate) {
            const startDateObj = new Date(startDate);
            startDateObj.setHours(0, 0, 0, 0);
            if (invoiceDate < startDateObj) {
              matchesDateRange = false;
            }
          }

          // Check end date
          if (endDate && matchesDateRange) {
            const endDateObj = new Date(endDate);
            endDateObj.setHours(0, 0, 0, 0);
            if (invoiceDate > endDateObj) {
              matchesDateRange = false;
            }
          }
        }
      } catch (e) {
        // If there's an error parsing the date, don't include this project in date-filtered results
        matchesDateRange = false;
      }
    }  

    return matchesSearch && matchesDateRange;
  });

  const sortedInvoices = sortArrayByKey(filteredInvoices, sortField, sortDirection);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  return (
    <PageContainer title="Invoice Report">
      <ReportFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        startDate={startDate}
        endDate={endDate}
        handleApplyDateFilter={handleApplyDateFilter}
        refreshData={fetchInvoices}
        loading={loading}
        isSearching={isSearching}
        setIsSearching={setIsSearching}
        setCurrentPage={setCurrentPage}
        columnGroups={[{ id: 'default', title: 'Columns', columns: columnDefinitions }]}
        visibleColumns={columnDefinitions.map(col => col.id)}
        toggleColumnVisibility={() => {}}
        resetToDefaultColumns={() => {}}
        selectAllColumns={() => {}}
        exportToExcel={() => {}}
        exportToPDF={() => {}}
        exportToCSV={() => {}}
      />

      <div className="table-responsive mt-4">
        <table className="table table-bordered table-hover table-striped">
          <thead>
            <tr>
              {columnDefinitions.map(col => (
                <SortableTableHeader
                  key={col.id}
                  label={col.label}
                  field={col.id}
                  currentSortField={sortField}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((inv, index) => (
              <tr key={index}>
                {columnDefinitions.map(col => (
                  <td key={col.id}>{inv[col.id] || '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ReportPagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={setCurrentPage}
        goToPreviousPage={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        goToNextPage={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        totalFilteredItems={filteredInvoices.length}
        totalItems={invoices.length}
        itemName="invoices"
      />
    </PageContainer>
  );
};

export default InvoiceReport;