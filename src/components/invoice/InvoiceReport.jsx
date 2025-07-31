import React, { useState, useEffect } from "react";
import axios from "axios";
import PageContainer from "../common/PageContainer";
import ReportFilter from "../common/ReportFilter";
import ReportPagination from "../common/ReportPagination";
import SortableTableHeader from "../common/SortableTableHeader";
import { sortArrayByKey } from "../../utils/sortUtils";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import Modal from "../common/Modal";
import { formatUSD } from "./Helpers/CurrencyFormat.js";
import "../common/Modal.css";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { useMemo } from "react";
import ModalContent from "./ModalContents";
import "./invoice.css";
import { getCurrentUserInvoice, ENDPOINTS, MERCHANT_ID, STATUS_MAP_FULL, ACTIONS_MAP } from "./invoice-settings";
import { Link } from "react-router-dom";

const InvoiceReport = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  //--=Tab filter=--
  const [activeTab, setActiveTab] = useState('all');
  const HIDDEN_UI_COLUMNS = ["billing_profile_name", "lead_group"];
  //--=Tab filter=--
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [sortField, setSortField] = useState("invoice_date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isSearching, setIsSearching] = useState(false);
  const merchantId = MERCHANT_ID;
  const [actionSelections, setActionSelections] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    title: "",
    content: "",
    actionType: "",
    invoiceId: null,
    invoiceDate: "",
    invoiceAmount: "",
  });
  const [userRoles, setUserRoles] = useState([]);

  const handleUpdateInterest = async (invoiceId) => {
    try {
      const confirm = await Swal.fire({
        icon: "warning",
        title: "Are you sure?",
        html: `Are you sure you want to update interest for invoice <strong>#${invoiceId}</strong>?`,
        showCancelButton: true,
        confirmButtonText: "Yes, update it",
        cancelButtonText: "No, cancel",
        confirmButtonColor: "#007bff",
        cancelButtonColor: "#dc3545",
        customClass: {
          popup: "swal-wide",
        },
      });

      if (!confirm.isConfirmed) return;

      const res = await axios.post(
        ENDPOINTS.SEND_ADD_INTEREST,
        { invoiceid: invoiceId }
      );

      const result = res?.data;

      if (result?.success) {
        Swal.fire({
          icon: "success",
          title: "Interest Updated!",
          text: result.message || "Interest invoice triggered successfully.",
          confirmButtonColor: "#7C5CFC",
        });
      } else {
        throw new Error(result?.message || "Something went wrong.");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: error.message || "Interest update failed.",
        confirmButtonColor: "#dc3545",
      });
    }
  };

  const handleActionChange = (invoiceId, newValue, inv) => {
    if (newValue === "Select") {
      setActionSelections((prev) => ({
        ...prev,
        [invoiceId]: newValue,
      }));
      return;
    }

    // Handle Share Invoice Link action: copy link and show SweetAlert, do NOT open modal
    if (newValue === "share_invoice_link") {
      // Check for either invoice_url or other_payment_link
      const paymentLink = inv?.invoice_url || inv?.other_payment_link;

      if (paymentLink) {
        // Try modern clipboard API
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(paymentLink);
        } else {
          // Fallback method for insecure contexts or older browsers
          const textArea = document.createElement("textarea");
          textArea.value = paymentLink;
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        }

        // Show success alert
        Swal.fire({
          icon: "success",
          title: "Copied!",
          text: "Payment link copied to clipboard",
          confirmButtonText: "OK",
          confirmButtonColor: "#7C5CFC",
          allowOutsideClick: false,
          allowEscapeKey: true,
        });
      }

      // Do NOT open the modal
      return;
    }
    // Handle Update Interest action: show SweetAlert, do NOT open modal
    // Update Interest: Show SweetAlert instead of modal
    if (newValue === "update_interest") {
      handleUpdateInterest(invoiceId);
      return; // do not open modal
    }

    setActionSelections((prev) => ({
      ...prev,
      [invoiceId]: newValue,
    }));
    const actionText = ACTIONS_MAP[newValue]?.text || newValue;

    const modalPayload = {
      title: `${
        ACTIONS_MAP[newValue]?.text || "Action"
      } - Invoice #${invoiceId}`,
      actionType: newValue || "",
      invoiceId: invoiceId || "",
      customerInvoiceNo: inv?.customerInvoiceNo || "N/A",
      invoiceDate: inv?.invoice_date || "N/A",
      invoiceAmount: isNaN(parseFloat(inv?.total_amount))
        ? "0.00"
        : parseFloat(inv.total_amount).toFixed(2),
      invoiceUrl: inv?.invoice_url || "",
      businessName: inv?.business_name || "N/A",
      customerName: inv?.customer_name || "N/A",
      userEmail: inv?.user_email || "",
      statusId: inv?.status_id || "",
      productTitle: inv?.product_title || "N/A",
      dueDate: inv?.due_date || "N/A",
      daysDue:
        typeof inv?.days_due === "number" || !isNaN(inv?.days_due)
          ? parseInt(inv.days_due, 10)
          : "N/A",
      billingProfile: inv?.billing_profile || "",
      displayName: inv?.display_name || "N/A",
      category: inv?.category || "",
      leadGroup: inv?.lead_group || "",
      phoneNo: inv?.phone_no || "",
      address: inv?.address || "",
      zip: inv?.zip || "",
      country: inv?.country || "",
      state: inv?.state || "",
      ccEmail: typeof inv?.cc_email === "string" ? inv.cc_email : "",
      bccEmail: typeof inv?.bcc_email === "string" ? inv.bcc_email : "",
      noteToRecipient: inv?.note_to_recipient || "",
      termsConditions: inv?.terms_conditions || "",
      paymentPlanStatus: inv?.payment_plan_status || "None",
    };

    //console.log("modalData set with the following values:", modalPayload); // <--- LOGGING HERE
    const resetActionSelection = () => {
      setActionSelections(prev => ({ ...prev, [invoiceId]: "Select" }));
    };

    setModalData({
      resetActionSelection,
      ...modalPayload,
      fetchInvoices, // <-- ADD THIS
      onClose: () => setShowModal(false), // <-- ADD THIS
    });

    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setModalData({
      title: "",
      content: "",
      actionType: "",
      invoiceId: null,
      invoiceDate: "",
      invoiceAmount: "",
    });
  };

  const currentUser = getCurrentUserInvoice(); // This gives user_id
  const currentUserId = currentUser?.user_id || null;

  const ActionDropdown = ({ inv }) => {
    return (
      <select
        className="form-select"
        value={actionSelections[inv.invoice_id] || "Select"}
        onChange={(e) => handleActionChange(inv.invoice_id, e.target.value, inv)}
      >
        <option value="Select">Action</option>
        {(inv.action || "")
          .split(",")
          .map((act, idx) => {
            const val = act.trim();
            if (!val) return null;

            // Condition: Hide action '13' for all except user_id = 45117
            if (val === "13" && currentUserId === 45117) {
              return null; // Skip rendering this option
            }
            // Restrict share_invoice_link to specific roles
            const allowedRolesForShareLink = ["echeck_client","master_sales","iris_sales_agent_rep","iris_sales_agent","fprs_sales_agent","iris_affiliate_users"];
            if ( val === "share_invoice_link" && !userRoles.some(role => allowedRolesForShareLink.includes(role)) ) {
              return null;
            }

            let label = "";
            let value = val;

            const parsedId = parseInt(val, 10);

            //Custom label for action 13 (regardless of ACTIONS_MAP)
            if (val === "13") {
              label = "Delete";
            } else if (!isNaN(parsedId) && ACTIONS_MAP[parsedId]) {
              label = ACTIONS_MAP[parsedId].text;
              value = parsedId;
            } else if (ACTIONS_MAP[val]) {
              label = ACTIONS_MAP[val].text;
            } else {
              label = val
                .replace(/_/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase());
            }

            return (
              <option key={idx} value={value}>
                {label}
              </option>
            );
          })}
      </select>
    );
  };

  const statusMap = STATUS_MAP_FULL;
  const actionsMap = ACTIONS_MAP;

  // utility function for view/edit
  const renderViewEditLinks = (row) => {

    const canEdit = row.can_edit && userRoles.some(role => 
      role === "echeck_client" || role === "echeck_bingo"
    );

    if (!row.can_view && !row.can_edit) {
      return <span className="text-muted">-</span>;
    }
    return (
      <>
        {row.can_view && row.view_link && (
          <a
            href={row.view_link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginRight: "8px", color: "#007bff", textDecoration: "none" }}
          >
            <i className="bi bi-eye"></i> View
          </a>
        )}
      {canEdit && (
        <Link
          to={`/invoices/edit/${row.invoice_id}`}
          style={{ color: "#007bff", textDecoration: "none" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="bi bi-pencil"></i> Edit
        </Link>
      )}
      </>
    );
  };

  const columnDefinitions = [
    {
      id: "invoice_date",
      label: "Date",
      sortable: true,
      render: (value, row) => {
        return (
          <div>
            <div>{value || "-"}</div>
            <div>{renderViewEditLinks(row)}</div>
          </div>
        );
      },
    },
    {
      id: "customer_invoice_no",
      label: "Invoice #",
      sortable: true,
      render: (value) => value || "-",
    },
    {
      id: "billing_profile_name",
      label: "Billing Profile",
      sortable: true,
      render: (value) => value || "-",
    },
    {
      id: "total_amount",
      label: "Amount",
      sortable: true,
      render: (value, row) => {
        return (
          <div className="tooltip-wrapper amount-tooltip">
            <a className="amount-link">{formatUSD(value)}</a>
            <div className="custom-tooltip top">
              <span className="tooltip-label">Service value is:</span>{" "}
              <span className="tooltip-value">{formatUSD(row?.service_amount)}</span>
              {" | "}
              <span className="tooltip-label">Charge value is:</span>{" "}
              <span className="tooltip-value">{formatUSD(row?.chargeable_amount)}</span>
            </div>
          </div>
        );
      },
      cellStyle: () => ({
        textAlign: "right",
      }),
    },
    {
      id: "business_name",
      label: "Business Name",
      sortable: true,
      render: (value) => value || "-",
    },
    {
      id: "customer_name",
      label: "Customer Name",
      sortable: true,
      render: (value) => value || "-",
    },
    {
      id: "display_name",
      label: "User",
      sortable: true,
      render: (value) => value || "-",
    },
    {
      id: "status_id",
      label: "Status",
      sortable: true,
      render: (value) => {
        const status = statusMap[value];
        if (!status) return "-";
        return (
          <span
            style={{
              color: status.color,
              padding: "4px 8px",
              borderRadius: "4px",
              backgroundColor: `${status.color}20`,
              display: "inline-block",
            }}
          >
            {status.text}
          </span>
        );
      },
    },
    {
      id: "lead_group",
      label: "Lead Group",
      sortable: true,
      render: (value) => value || "-",
    },
    {
      id: "invoice_type_label",
      label: "Type",
      sortable: false,
      render: (value) => value || "-",
      cellStyle: () => ({
        width: "100%",
        maxWidth: "max-content",
      }),  
    },
    {
      id: "product_title",
      label: "Product",
      sortable: true,
      render: (value) => value || "-",
    },
    {
      id: "due_date",
      label: "Due Date",
      sortable: true,
      render: (value) => value || "-",
    },
    {
      id: "days_due",
      label: "No. Days Due",
      sortable: true,
      render: (value) => {
        if (value === 0) return "0";
        if (!value || value === "-") return "-";
        return value;
      },
    },
    {
      id: "actions",
      label: "Action",
      sortable: false,
      render: (value, row) => <ActionDropdown inv={row} />,
      cellStyle: () => ({
        width: "100%",
        maxWidth: "max-content",
        minWidth: "108px",
      }),      
    },
  ];

  const [visibleColumns, setVisibleColumns] = useState([
    "invoice_date",
    "customer_invoice_no",
    //"billing_profile_name",
    "total_amount",
    "business_name",
    "customer_name",
    "status_id",
    //"lead_group",
    "invoice_type_label",
    "due_date",
    "days_due",
    "actions",
  ]);

  useEffect(() => {

    const currentUser = getCurrentUserInvoice();
    if (currentUser && Array.isArray(currentUser.roles)) {
      setUserRoles(currentUser.roles);
    }  
    fetchInvoices();

  }, []);

  const generateExportData = () => {
    const exportColumns = columnDefinitions.filter(
      (col) => col.id !== "actions" && visibleColumns.includes(col.id)
    );

    const headers = exportColumns.map((col) => col.label);

    const data = sortedInvoices.map((inv) => {
      return exportColumns.map((col) => {
        const rawValue = inv[col.id];

        // Handle special formats
        if (col.id === "total_amount") {
          const total = formatUSD(rawValue);
          // const service = formatUSD(inv?.service_amount);
          // const charge = formatUSD(inv?.chargeable_amount);
          // return `Total: ${total}, Service: ${service}, Charge: ${charge}`;
          return total;
        }

        if (col.id === "status_id") {
          const status = statusMap[rawValue];
          return status ? status.text : "-";
        }

        if (["invoice_date", "due_date", "paid_date"].includes(col.id)) {
          return formatDateMMDDYYYY(rawValue);
        }

        const amountFields = [
          "total_amount",
          "service_amount",
          "chargeable_amount",
          "outstanding_charge_value",
          "outstanding_service_value",
          "payment_received",
          "pending_balance"
        ];

        if (amountFields.includes(col.id)) {
          return formatUSD(rawValue);
        }        
        // Basic fallback handling
        if (typeof rawValue === "string" || typeof rawValue === "number") {
          return rawValue;
        }

        return "-";
      });
    });

    return { headers, data };
  };

  const generateExportExcelData = () => {

    const exportColumns = [
      { id: "invoice_date", label: "Date" },
      { id: "customer_invoice_no", label: "Invoice #" },
      { id: "billing_profile_name", label: "Billing Profile" },
      { id: "total_amount", label: "Amount" },
      { id: "service_amount", label: "Service Amount" },
      { id: "chargeable_amount", label: "Chargeable Amount" },
      { id: "outstanding_charge_value", label: "Outstanding Charge Amount" },
      { id: "outstanding_service_value", label: "Outstanding Service Amount" },
      { id: "payment_received", label: "Payment Received" },
      { id: "pending_balance", label: "Pending Balance" },
      { id: "customer_name", label: "Customer Name" },
      { id: "business_name", label: "Business Name" },
      { id: "affiliate_name", label: "Affiliate Name" },
      { id: "merchant", label: "Merchant" },
      { id: "product", label: "Product" },
      { id: "days_due", label: "No. Days Due" },
      { id: "status_id", label: "Status" },
      { id: "paid_date", label: "Paid Date" },
      { id: "sales_person", label: "Sales Person" },
    ];

    const headers = exportColumns.map((col) => col.label);

    const data = sortedInvoices.map((inv) => {
      return exportColumns.map((col) => {
        const rawValue = inv[col.id];

        // Handle special formats
        if (col.id === "total_amount") {
          const total = formatUSD(rawValue);
          // const service = formatUSD(inv?.service_amount);
          // const charge = formatUSD(inv?.chargeable_amount);
          // return `Total: ${total}, Service: ${service}, Charge: ${charge}`;
          return total;
        }

        if (col.id === "status_id") {
          const status = statusMap[rawValue];
          return status ? status.text : "-";
        }
        if (["invoice_date", "due_date", "paid_date"].includes(col.id)) {
          return formatDateMMDDYYYY(rawValue);
        }
        const amountFields = [
          "total_amount",
          "service_amount",
          "chargeable_amount",
          "outstanding_charge_value",
          "outstanding_service_value",
          "payment_received",
          "pending_balance"
        ];

        if (amountFields.includes(col.id)) {
          return formatUSD(rawValue);
        }        
        // Basic fallback handling
        if (typeof rawValue === "string" || typeof rawValue === "number") {
          return rawValue;
        }

        return "-";
      });
    });

    return { headers, data };
  };


  const fetchInvoices = async (start = startDate, end = endDate) => {
    setLoading(true);
    setError(null);
    
    const formatDate = (date) => {
      if (!date) return null;
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return null;
      
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");
      const yyyy = dateObj.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    };

    // Use provided dates or default to 15-day range
    let date_from, date_to;
    
    if (start || end) {
      date_from = formatDate(start);
      date_to = formatDate(end);
    } else {
      const today = new Date();
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(today.getDate() - 15);
      date_from = formatDate(fifteenDaysAgo);
      date_to = formatDate(today);
    }

    try {
      const response = await axios.post(
        ENDPOINTS.INVOICE_LISTING,
        {
          date_from,
          date_to,
          merchant_id: merchantId,
          filter_type: "",
          search: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const records = response.data?.data?.records || [];
      setInvoices(records);
    } catch (err) {
      setError("Failed to load invoice data");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    const direction =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);
  };

  const handleApplyDateFilter = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1);
    fetchInvoices(start, end);
    Swal.fire({
      icon: 'success',
      title: 'Date Filter Applied',
      text: `Showing invoices from ${start} to ${end}`,
      timer: 1500,
      toast: true,
      position: 'top-end',
      showConfirmButton: false
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    fetchInvoices(); // reset with default 15-day range
  };

  const toggleColumnVisibility = (columnId) => {
    setVisibleColumns((prevVisibleColumns) => {
      if (prevVisibleColumns.includes(columnId)) {
        return prevVisibleColumns.filter((id) => id !== columnId);
      } else {
        return [...prevVisibleColumns, columnId];
      }
    });
  };
  const resetToDefaultColumns = () => {
    setVisibleColumns(columnDefinitions.map((col) => col.id));
  };
  const selectAllColumns = () => {
    setVisibleColumns(columnDefinitions.map((col) => col.id));
  };
  const parseInvoiceDate = (dateString) => {
    if (!dateString) return null;
    let date = new Date(dateString);
    if (isNaN(date.getTime())) {
      const parts = dateString.split("/");
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
    const date = `${
      today.getMonth() + 1
    }-${today.getDate()}-${today.getFullYear()}`;
    return `Invoice_Report_${date}.${format}`;
  };
  const formatDateMMDDYYYY = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr || "-";
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  const exportToCSV = () => {
    const { headers, data } = generateExportExcelData();
    if (data.length === 0) {
      Swal.fire("No Data", "No invoices to export.", "info");
      return;
    }

    // Escape commas and quotes
    const escapeCSV = (value) => {
      if (value == null) return "";
      const str = String(value).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvContent = [
      headers.map(escapeCSV).join(","), // header row
      ...data.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", getExportFileName("csv"));
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Swal.fire("Success", "Invoice data exported to CSV!", "success");
  };

  const exportToPDF = () => {
    const { headers, data } = generateExportData();
    if (data.length === 0) {
      Swal.fire("No Data", "No invoices to export.", "info");
      return;
    }
    const doc = new jsPDF("landscape");
    doc.setFontSize(18);
    doc.text("Invoice Report", doc.internal.pageSize.getWidth() / 2, 15, {
      align: "center",
    });
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 20,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      didDrawPage: function (data) {
        const str = "Page " + doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(
          str,
          doc.internal.pageSize.getWidth() - 10,
          doc.internal.pageSize.getHeight() - 10,
          { align: "right" }
        );
      },
    });
    doc.save(getExportFileName("pdf"));
    Swal.fire("Success", "Invoice data exported to PDF!", "success");
  };
  const exportToExcel = () => {
    const { headers, data } = generateExportExcelData();
    if (data.length === 0) {
      Swal.fire("No Data", "No invoices to export.", "info");
      return;
    }
    const formattedData = data.map((row) => {
      const rowObj = {};
      headers.forEach((label, idx) => {
        rowObj[label] = row[idx];
      });
      return rowObj;
    });
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    XLSX.writeFile(wb, getExportFileName("xlsx"));
    Swal.fire("Success", "Invoice data exported to Excel!", "success");
  };

const filteredInvoices = useMemo(() => {
  return invoices.filter((inv) => {
    const searchTermLower = searchTerm.toLowerCase().trim();

  const matchesSearch =
    searchTerm === "" ||
    (inv.customer_invoice_no &&
      inv.customer_invoice_no.toLowerCase().includes(searchTermLower)) ||
    (inv.business_name &&
      inv.business_name.toLowerCase().includes(searchTermLower)) ||
    (inv.customer_name &&
      inv.customer_name.toLowerCase().includes(searchTermLower)) ||
    (inv.display_name &&
      inv.display_name.toLowerCase().includes(searchTermLower)) ||
    (STATUS_MAP_FULL[inv.status_id]?.text || "")
      .toLowerCase()
      .includes(searchTermLower);
      

    // const matchesSearch =
    //   searchTerm === "" ||
    //   (inv.customer_invoice_no &&
    //     inv.customer_invoice_no.toLowerCase().includes(searchTermLower)) ||
    //   (inv.business_name &&
    //     inv.business_name.toLowerCase().includes(searchTermLower)) ||
    //   (inv.customer_name &&
    //     inv.customer_name.toLowerCase().includes(searchTermLower)) ||
    //   (inv.billing_profile_name &&
    //     inv.billing_profile_name.toLowerCase().includes(searchTermLower)) ||
    //   (inv.display_name &&
    //     inv.display_name.toLowerCase().includes(searchTermLower)) ||
    //   (STATUS_MAP_FULL[inv.status_id]?.text || "")
    //     .toLowerCase()
    //     .includes(searchTermLower) ||
    //   (inv.days_due && String(inv.days_due).includes(searchTermLower)) ||
    //   (inv.product_title &&
    //     inv.product_title.toLowerCase().includes(searchTermLower)) ||
    //   (inv.invoice_type_label &&
    //     inv.invoice_type_label.toLowerCase().includes(searchTermLower)) ||
    //   (inv.total_amount &&
    //     String(inv.total_amount).includes(searchTermLower)) ||
    //   (inv.due_date &&
    //     inv.due_date.toLowerCase().includes(searchTermLower)) ||
    //   (inv.invoice_date &&
    //     inv.invoice_date.toLowerCase().includes(searchTermLower));

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
        if (
          endFilterDate &&
          matchesDateRange &&
          invoiceDate > endFilterDate
        ) {
          matchesDateRange = false;
        }
      }
    }

    // Tab filter
    let matchesTab = true;
    if (activeTab !== "all") {
      const statusId = parseInt(inv.status_id, 10);
      switch (activeTab) {
        case "unpaid":
          matchesTab = statusId === 1;
          break;
        case "in_process":
          matchesTab = statusId === 6;
          break;
        case "partially_paid":
          matchesTab = statusId === 17;
          break;
        case "paid":
          matchesTab = statusId === 2;
          break;
        case "overdue":
          matchesTab = inv.days_due > 0 && statusId !== 2 && statusId !== 3;
          break;
        default:
          matchesTab = true;
      }
    }

    return matchesSearch && matchesDateRange && matchesTab;
  });
}, [invoices, searchTerm, startDate, endDate, activeTab]);


  const sortedInvoices = useMemo(() => {
    return sortArrayByKey(filteredInvoices, sortField, sortDirection);
  }, [filteredInvoices, sortField, sortDirection]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const modalSizeMap = {
    //size: sm,md,lg,xl,full
    1: "lg",
    2: "lg",
    3: "lg",
    4: "lg",
    5: "lg",
    6: "lg",
    7: "lg",
    8: "lg",
    9: "lg",
    10: "lg",
    11: "lg",
    12: "lg",
    13: "lg",
    14: "lg",
    15: "lg",
    16: "lg",
    17: "xl",
    18: "lg",
    19: "xl",
    20: "full",
    resend: "lg",
    share_invoice_link: "lg",
    send_reminder: "lg",
    update_interest: "lg",
    cancel_auto_inv_reminder: "lg",
    resume_auto_inv_reminder: "lg",
  };
  const getModalSize = (actionType) => modalSizeMap[actionType] || "md";

return (
  <PageContainer 
    title="Invoice Report"
    showInvoiceTabs={true}
    activeTab={activeTab}
    onTabChange={setActiveTab}
  >
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
      columnGroups={[
        {
          id: "default",
          title: "Columns",
          columns: columnDefinitions.filter(col => !HIDDEN_UI_COLUMNS.includes(col.id))
        }
      ]}
      visibleColumns={visibleColumns}
      toggleColumnVisibility={toggleColumnVisibility}
      resetToDefaultColumns={resetToDefaultColumns}
      selectAllColumns={selectAllColumns}
      exportToExcel={exportToExcel}
      exportToPDF={exportToPDF}
      exportToCSV={exportToCSV}
      customSearchPlaceholder="Search by Invoice Number, Business Name, Customer Name, User, or Status"
    />
      <div className="table-responsive mt-4 custom-inv-table">
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
          <table className="table table-bordered table-hover table-striped ">
            <thead>
              <tr>
                {columnDefinitions
                  .filter(col => visibleColumns.includes(col.id) && !HIDDEN_UI_COLUMNS.includes(col.id))
                  .map((col) => (
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
                    //.filter((col) => visibleColumns.includes(col.id))
                    .filter(col => visibleColumns.includes(col.id) && !HIDDEN_UI_COLUMNS.includes(col.id))
                    .map((col) => (
                      <td 
                      key={col.id}
                      style={typeof col.cellStyle === "function" ? col.cellStyle(inv[col.id], inv) : {}}
                      >
                        {col.render(inv[col.id], inv)}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {!loading && !error && filteredInvoices.length > 0 && (
        <ReportPagination
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={setCurrentPage}
          goToPreviousPage={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          goToNextPage={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          indexOfFirstItem={indexOfFirstItem}
          indexOfLastItem={indexOfLastItem}
          totalFilteredItems={filteredInvoices.length}
          totalItems={invoices.length}
          itemName="invoices"
          loading={loading}
        />
      )}

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={modalData.title}
        size={getModalSize(modalData?.actionType)}
      >
        <ModalContent modalData={modalData} actionsMap={actionsMap} />
      </Modal>
    </PageContainer>
  );
};

export default InvoiceReport;
