import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageContainer from '../common/PageContainer';
import ReportFilter from '../common/ReportFilter';
import ReportPagination from '../common/ReportPagination';
import SortableTableHeader from '../common/SortableTableHeader';
import { sortArrayByKey } from '../../utils/sortUtils';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import Modal from '../common/Modal';
import '../common/Modal.css';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import { useMemo } from 'react';
import ModalContent from './ModalContents';
import './invoice.css';
import {
  handleUnpaidAction,
  handlePaidAction,
  handleCancelledAction,
  handleDraftAction,
  handleReminderAction,
  handlePaymentProcessAction,
  handleVoidAction,
  handlePartialPaidAction,
  handlePaymentPlanAction,
  handleCancelReminderAction
} from './invoiceActionHandlers';

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
  const merchantId = '1';
  const [actionSelections, setActionSelections] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    title: '',
    content: '',
    actionType: '',
    invoiceId: null,
    invoiceDate: '',
    invoiceAmount: ''
  });

  const handleActionChange = (invoiceId, newValue, inv) => {
    if (newValue === 'Select') {
      setActionSelections(prev => ({
        ...prev,
        [invoiceId]: newValue
      }));
      return;
    }
    setActionSelections(prev => ({
      ...prev,
      [invoiceId]: newValue
    }));
    const actionText = actionsMap[newValue]?.text || newValue;
    setModalData({
      title: `${actionText} - Invoice #${invoiceId}`,
      actionType: newValue,
      invoiceId: invoiceId,
      invoiceDate: inv.invoice_date,
      invoiceAmount: parseFloat(inv.total_amount || 0).toFixed(2)
    });
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setModalData({
      title: '',
      content: '',
      actionType: '',
      invoiceId: null,
      invoiceDate: '',
      invoiceAmount: ''
    });
  };
  const handleModalSave = async () => {
    try {
      const { actionType, invoiceId } = modalData;
      if (!actionType || !invoiceId) {
        Swal.fire('Error', 'Invalid action or invoice data', 'error');
        return;
      }
      if (actionType === '1') {
        await handleUnpaidAction(invoiceId, merchantId, fetchInvoices);
      } 
      else if (actionType === '2') {
        await handlePaidAction(invoiceId, merchantId, fetchInvoices);
      }
      else if (actionType === '3') {
        await handleCancelledAction(invoiceId, merchantId, fetchInvoices);
      }
      else if (actionType === '4') {
        await handleDraftAction(invoiceId, merchantId, fetchInvoices);
      }
      else if (actionType === '5') {
        await handleReminderAction(invoiceId, merchantId);
      }
      else if (actionType === '6') {
        await handlePaymentProcessAction(invoiceId, merchantId, fetchInvoices);
      }
      else if (actionType === '14') {
        await handleVoidAction(invoiceId, merchantId, fetchInvoices);
      }
      else if (actionType === '17') {
        await handlePartialPaidAction(invoiceId, merchantId, fetchInvoices);
      }
      else if (actionType === '19') {
        await handlePaymentPlanAction(invoiceId, merchantId, fetchInvoices);
      }
      else if (actionType === 'cancel_auto_inv_reminder') {
        await handleCancelReminderAction(invoiceId, merchantId, fetchInvoices);
      }
      else {
      }
      handleCloseModal();
      Swal.fire('Success', 'Action completed successfully', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to process action', 'error');
    }
  };

  const ActionDropdown = ({ inv }) => {
    return (
      <select
        className="form-select"
        value={actionSelections[inv.invoice_id] || 'Select'}
        onChange={(e) => handleActionChange(inv.invoice_id, e.target.value, inv)}
      >
        <option value="Select">Select</option>
        {(inv.action || '')
          .split(',')
          .map((act, idx) => {
            const val = act.trim();
            if (!val) return null;
            let label = '';
            let value = val;
            const parsedId = parseInt(val, 10);
            if (!isNaN(parsedId) && actionsMap[parsedId]) {
              label = actionsMap[parsedId].text;
              value = parsedId;
            } else if (actionsMap[val]) {
              label = actionsMap[val].text;
            } else {
              label = val
                .replace(/_/g, ' ')
                .replace(/\b\w/g, char => char.toUpperCase());
            }
            return (
              <option
                key={idx}
                value={value}
              >
                {label}
              </option>
            );
          })}
      </select>
    );
  };

  const statusMap = {
    1: { text: 'Unpaid', color: '#FFA500' },
    2: { text: 'Paid', color: '#008000' },
    3: { text: 'Cancelled', color: '#FF0000' },
    4: { text: 'Draft', color: '#808080' },
    5: { text: 'Reminder', color: '#FFD700' },
    6: { text: 'Payment in process', color: '#0000FF' },
    14: { text: 'Void', color: '#FF0000' },
    17: { text: 'Partial paid', color: '#FF8C00' },
    19: { text: 'Payment Plan', color: '#FF0000' }
  };

  const actionsMap = {
    1: { text: 'Unpaid'},
    2: { text: 'Paid'},
    3: { text: 'Cancelled'},
    4: { text: 'Draft'},
    5: { text: 'Reminder'},
    6: { text: 'Payment in process'},
    14: { text: 'Void'},
    17: { text: 'Partial paid'},
    19: { text: 'Payment Plan'},
    cancel_auto_inv_reminder: { text: 'Pause Invoice Reminder'},
  };

  const columnDefinitions = [
    { id: 'invoice_date', label: 'Date', sortable: true, render: (value) => value || '-' },
    { id: 'customer_invoice_no', label: 'Invoice #', sortable: true, render: (value) => value || '-' },
    { id: 'billing_profile_name', label: 'Billing Profile', sortable: true, render: (value) => value || '-' },
    { 
      id: 'total_amount', 
      label: 'Amount', 
      sortable: true, 
      render: (value) => {
        if (!value) return '-';
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return '-';
        return `$${numValue.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`;
      }
    },
    { id: 'business_name', label: 'Business Name', sortable: true, render: (value) => value || '-' },
    { id: 'customer_name', label: 'Customer Name', sortable: true, render: (value) => value || '-' },
    {
      id: 'display_name',
      label: 'User',
      sortable: true,
      render: (value) => value || '-'
    },
    { 
      id: 'status_id', 
      label: 'Status', 
      sortable: true, 
      render: (value) => {
        const status = statusMap[value];
        if (!status) return '-';
        return (
          <span style={{
            color: status.color,
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: `${status.color}20`,
            display: 'inline-block'
          }}>
            {status.text}
          </span>
        );
      }
    },
    {
      id:'invoice_type',
      label: 'Type',
      sortable: false,
      render: (value) => value || '-'
    },
    {
      id: 'product_title',
      label: 'Product',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      id: 'due_date',
      label: 'Due Date',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      id: 'days_due',
      label: 'No. Days Due',
      sortable: true,
      render: (value) => {
        if (value === 0) return '0';
        if (!value || value === '-') return '-';
        return value;
      }
    },
    {
      id: 'actions',
      label: 'Action',
      sortable: false,
      render: (value, row) => <ActionDropdown inv={row} />
    }
  ];

  const [visibleColumns, setVisibleColumns] = useState([
    'invoice_date',
    'customer_invoice_no',
    'billing_profile_name',
    'total_amount',
    'business_name',
    'customer_name',
    'status_id',
    'invoice_type',
    'due_date',
    'days_due',
    'actions'
  ]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const generateExportData = () => {
    const headers = columnDefinitions
      .filter(col => visibleColumns.includes(col.id))
      .map(col => col.label);
    const data = sortedInvoices.map(inv => {
      return columnDefinitions
        .filter(col => visibleColumns.includes(col.id))
        .map(col => {
          if (col.id === 'status_id') {
            const status = statusMap[inv[col.id]];
            return status ? status.text : '-';
          }
          const renderedValue = col.render(inv[col.id]);
          return typeof renderedValue === 'string'
            ? renderedValue.replace(/<[^>]*>?/gm, '')
            : renderedValue;
        });
    });
    return { headers, data };
  };

const fetchInvoices = async (start = startDate, end = endDate) => {
  setLoading(true);
  setError(null);
  const formatDate = (date) => {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };
  const today = new Date();
  const date_from = '01/01/2023'; 
  const date_to = formatDate(today);
  try {
    const response = await axios.post(
      'https://play.occamsadvisory.com/portal/wp-json/invoices/v1/invoice-listing',
      {
        date_from,
        date_to,
        merchant_id: merchantId,
        filter_type: '',
        search: ''
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
  fetchInvoices(start, end);
};
    const toggleColumnVisibility = (columnId) => {
      setVisibleColumns(prevVisibleColumns => {
        if (prevVisibleColumns.includes(columnId)) {
          return prevVisibleColumns.filter(id => id !== columnId);
        } else {
          return [...prevVisibleColumns, columnId];
        }
      });
    };
    const resetToDefaultColumns = () => {
      setVisibleColumns(columnDefinitions.map(col => col.id));
    };
    const selectAllColumns = () => {
        setVisibleColumns(columnDefinitions.map(col => col.id));
    };
    const parseInvoiceDate = (dateString) => {
      if (!dateString) return null;
      let date = new Date(dateString);
      if (isNaN(date.getTime())) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          date = new Date(parts[2], parts[0] - 1, parts[1]);
        }
      }
      if (isNaN(date.getTime())) {
        return null;
      }
      date.setHours(0, 0, 0, 0);
      return date;
    };
 const getExportFileName = (format) => {
  const today = new Date();
  const date = `${today.getMonth() + 1}-${today.getDate()}-${today.getFullYear()}`;
  return `Invoice_Report_${date}.${format}`;
};
const exportToCSV = () => {
  const { headers, data } = generateExportData();
  if (data.length === 0) {
    Swal.fire('No Data', 'No invoices to export.', 'info');
    return;
  }
  const csvContent = [
    headers.join(','),
    ...data.map(row => row.join(','))
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', getExportFileName('csv'));
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  Swal.fire('Success', 'Invoice data exported to CSV!', 'success');
};
const exportToPDF = () => {
  const { headers, data } = generateExportData();
  if (data.length === 0) {
    Swal.fire('No Data', 'No invoices to export.', 'info');
    return;
  }
  const doc = new jsPDF('landscape');
  doc.setFontSize(18);
  doc.text('Invoice Report', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 20,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [22, 160, 133],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    didDrawPage: function(data) {
      const str = 'Page ' + doc.internal.getNumberOfPages();
      doc.setFontSize(10);
      doc.text(str, doc.internal.pageSize.getWidth() - 10, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    }
  });
  doc.save(getExportFileName('pdf'));
  Swal.fire('Success', 'Invoice data exported to PDF!', 'success');
};
const exportToExcel = () => {
  const { headers, data } = generateExportData();
  if (data.length === 0) {
    Swal.fire('No Data', 'No invoices to export.', 'info');
    return;
  }
  const formattedData = data.map(row => {
    const rowObj = {};
    headers.forEach((label, idx) => {
      rowObj[label] = row[idx];
    });
    return rowObj;
  });
  const ws = XLSX.utils.json_to_sheet(formattedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
  XLSX.writeFile(wb, getExportFileName('xlsx'));
  Swal.fire('Success', 'Invoice data exported to Excel!', 'success');
};
const filteredInvoices = useMemo(() => {
  return invoices.filter(inv => {
    if (searchTerm === '' && !startDate && !endDate) return true;
    const searchTermLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchTerm === '' ||
      (inv.customer_invoice_no && inv.customer_invoice_no.toLowerCase().includes(searchTermLower)) ||
      (inv.business_name && inv.business_name.toLowerCase().includes(searchTermLower)) ||
      (inv.customer_name && inv.customer_name.toLowerCase().includes(searchTermLower)) ||
      (inv.billing_profile_name && inv.billing_profile_name.toLowerCase().includes(searchTermLower)) ||
      (inv.id && String(inv.id).toLowerCase().includes(searchTermLower)) ||
      (inv.display_name && inv.display_name.toLowerCase().includes(searchTermLower)) ||
      (statusMap[inv.status_id]?.text.toLowerCase().includes(searchTermLower)) ||
      (inv.days_due && String(inv.days_due).includes(searchTermLower)) ||
      (inv.product_title && inv.product_title.toLowerCase().includes(searchTermLower)) ||
      (inv.invoice_type && inv.invoice_type.toLowerCase().includes(searchTermLower)) ||
      (inv.total_amount && String(inv.total_amount).includes(searchTermLower)) ||
      (inv.due_date && inv.due_date.toLowerCase().includes(searchTermLower)) ||
      (inv.invoice_date && inv.invoice_date.toLowerCase().includes(searchTermLower));
    let matchesDateRange = true;
    if (startDate || endDate) {
      const invoiceDate = parseInvoiceDate(inv.invoice_date);
      const startFilterDate = parseInvoiceDate(startDate);
      const endFilterDate = parseInvoiceDate(endDate);
      if (!invoiceDate) {
        matchesDateRange = false;
      } else {
        if (startFilterDate && invoiceDate < startFilterDate) {
          matchesDateRange = false;
        }
        if (endFilterDate && matchesDateRange && invoiceDate > endFilterDate) {
          matchesDateRange = false;
        }
      }
    }
    return matchesSearch && matchesDateRange;
  });
}, [invoices, searchTerm, startDate, endDate]);
const sortedInvoices = useMemo(() => {
  return sortArrayByKey(filteredInvoices, sortField, sortDirection);
}, [filteredInvoices, sortField, sortDirection]);
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
      refreshData={() => fetchInvoices(startDate, endDate)}
      loading={loading}
      isSearching={isSearching}
      setIsSearching={setIsSearching}
      setCurrentPage={setCurrentPage}
      columnGroups={[{ id: 'default', title: 'Columns', columns: columnDefinitions }]}
      visibleColumns={visibleColumns}
      toggleColumnVisibility={toggleColumnVisibility}
      resetToDefaultColumns={resetToDefaultColumns}  
      selectAllColumns={selectAllColumns}
      exportToExcel={exportToExcel}
      exportToPDF={exportToPDF}
      exportToCSV={exportToCSV}
    />
    <div className="table-responsive mt-4">
    {loading ? (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading invoice data...</p>
      </div>
    ) : error ? (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    ) : currentItems.length === 0 ? (
      <div className="text-center p-4">
        <p>No invoices found</p>
      </div>
    ) : (
      <table className="table table-bordered table-hover table-striped">
        <thead>
          <tr>
            {columnDefinitions
            .filter(col => visibleColumns.includes(col.id))
            .map(col => (
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
              {columnDefinitions
                .filter(col => visibleColumns.includes(col.id))
                .map(col => (
                  <td key={col.id}>
                    {col.render(inv[col.id], inv)}
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>
    )}  
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
      loading={loading}
    />
    <Modal
      show={showModal}
      onClose={() => setShowModal(false)}
      title={modalData.title}
      size={modalData?.actionType === '17' ? 'xl' : 'md'} 
    >
      <ModalContent modalData={modalData} actionsMap={actionsMap} />
    </Modal>
  </PageContainer>
);
};

export default InvoiceReport;