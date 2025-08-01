import React, { useState, useEffect } from "react";
import axios from "axios";
import PageContainer from "../common/PageContainer.jsx";
import ReportFilter from "../common/ReportFilter.jsx";
import ReportPagination from "../common/ReportPagination.jsx";
import SortableTableHeader from "../common/SortableTableHeader.jsx";
import { sortArrayByKey } from "../../utils/sortUtils.js";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import Modal from "../common/Modal.jsx";
import { formatUSD } from "./Helpers/CurrencyFormat.js";
import "../common/Modal.css";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { useMemo } from "react";
import ModalContent from "./ModalContents.jsx";
import "./invoice.css";
import { getCurrentUserInvoice, ENDPOINTS, MERCHANT_ID, STATUS_MAP_FULL, ACTIONS_MAP } from "./invoice-settings.js";
import { Link } from "react-router-dom";
import Notes from '../common/Notes';
import useConfidentialUser from '../../hooks/useConfidentialUser';

const PastDueInvoiceReport = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isSearching, setIsSearching] = useState(false);
  const merchantId = '45117';
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
  const { confidenceUser } = useConfidentialUser();
  const [loadingContent, setLoadingContent] = useState(false);
  const [activeTab, setActiveTab] = useState("15 Days");
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [businessModalData, setBusinessModalData] = useState(null);

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
    // fetchInvoices(); // Removed to prevent multiple requests
  };
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

  const handleActionChange = async (invoiceId, newValue, inv) => {
    if (newValue === "Select Action") {
      setActionSelections((prev) => ({
        ...prev,
        [invoiceId]: newValue,
      }));
      return;
    }

    // Show SweetAlert for Pause Reminder
    if (newValue === "cancel_auto_inv_reminder" || newValue === "resume_auto_inv_reminder") {
      const result = await Swal.fire({
        icon: "warning",
        title: "Are you sure?",
        html: `Are you sure you want to pause the auto reminder for invoice '<b>${inv.business_name}</b>' invoice id: '<b>${invoiceId}</b>'`,
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      });

      if (!result.isConfirmed) {
        // Reset dropdown if cancelled
        setActionSelections((prev) => ({
          ...prev,
          [invoiceId]: "Select Action",
        }));
        return;
      }
      // Proceed with your pause reminder logic here (if any)
      sendResumeInvoiceReminder(inv);
    }

    // Handle Share Invoice Link action: copy link and show SweetAlert, do NOT open modal
    if (newValue === "share_invoice_link") {
      if (inv?.invoice_url) {
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(inv.invoice_url);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = inv.invoice_url;
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        }
        Swal.fire({
          icon: "success",
          title: "Copied!",
          text: "Past Due Invoice link copied to clipboard",
          confirmButtonText: "OK", // Button text
          confirmButtonColor: "#7C5CFC", // Optional: aapke design ke hisaab se
          allowOutsideClick: false, // User ko force kare ki OK dabaye
          allowEscapeKey: true, // Escape key se bhi band ho
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

    // const modalPayload = {
    //   title: `${
    //     ACTIONS_MAP[newValue]?.text || "Action"
    //   } - Invoice #${invoiceId}`,
    //   actionType: newValue || "",
    //   invoiceId: invoiceId || "",
    //   invoiceDate: inv?.date || "N/A",
    //   invoiceAmount: isNaN(parseFloat(inv?.total_amount))
    //     ? "0.00"
    //     : parseFloat(inv.total_amount).toFixed(2),
    //   invoiceUrl: inv?.invoice_url || "",
    //   businessName: inv?.business_name || "N/A",
    //   customerName: inv?.customer_name || "N/A",
    //   userEmail: inv?.user_email || "",
    //   statusId: inv?.invoice_status || "",
    //   productTitle: inv?.product_title || "N/A",
    //   dueDate: inv?.due_date || "N/A",
    //   daysDue:
    //     typeof inv?.overdue_days === "number" || !isNaN(inv?.overdue_days)
    //       ? parseInt(inv.overdue_days, 10)
    //       : "N/A",
    //   billingProfile: inv?.billing_profile || "",
    //   displayName: inv?.invoice_user || "N/A",
    //   category: inv?.category || "",
    //   leadGroup: inv?.lead_group || "",
    //   phoneNo: inv?.phone_no || "",
    //   address: inv?.address || "",
    //   zip: inv?.zip || "",
    //   country: inv?.country || "",
    //   state: inv?.state || "",
    //   ccEmail: typeof inv?.cc_email === "string" ? inv.cc_email : "",
    //   bccEmail: typeof inv?.bcc_email === "string" ? inv.bcc_email : "",
    //   noteToRecipient: inv?.note_to_recipient || "",
    //   termsConditions: inv?.terms_conditions || "",
    //   paymentPlanStatus: inv?.payment_plan_status || "None",
    // };

    //console.log("modalData set with the following values:", modalPayload); // <--- LOGGING HERE

    // setModalData({
    //   ...modalPayload,
    //   fetchInvoices, // <-- ADD THIS
    //   onClose: () => setShowModal(false), // <-- ADD THIS
    // });

    // setShowModal(true);
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

  const handleBusinessInfoClick = (row) => {
    setBusinessModalData(row);
    setShowBusinessModal(true);
  };

  const handleCloseBusinessModal = () => {
    setShowBusinessModal(false);
    setBusinessModalData(null);
  };

  const ActionDropdown = ({ inv }) => {
    const isActive = inv.inv_reminder_status === 'Active';
    return (
      <select
        className="form-select action-dropdown"
        value={actionSelections[inv.invoice_id] || "Select Action"}
        onChange={(e) =>
          handleActionChange(inv.invoice_id, e.target.value, inv)
        }
      >
        <option value="Select Action">Select Action</option>
        {/* Static option for Pause/Resume Reminder based on status */}
        <option value={isActive ? "cancel_auto_inv_reminder" : "resume_auto_inv_reminder"}>
          {isActive ? "Pause Reminder" : "Resume Reminder"}
        </option>
        {/* {(inv.action || "").split(",").map((act, idx) => {
          const val = act.trim();
          if (!val) return null;
          let label = "";
          let value = val;
          const parsedId = parseInt(val, 10);
          if (!isNaN(parsedId) && ACTIONS_MAP[parsedId]) {
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
        })} */}
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
        >
          <i className="bi bi-pencil"></i> Edit
        </Link>
      )}
      </>
    );
  };

  const columnDefinitions = [
    {
      id: "date",
      label: "Date",
      sortable: true,
      render: (value, row) => {
        return (
          <div>
            <div>{value || "-"}</div>
          </div>
        );
      },
    },
    {
      id: "invoice_number",
      label: "Invoice #",
      sortable: true,
      render: (value) => value || "-",
    },
    // {
    //   id: "billing_profile_name",
    //   label: "Billing Profile",
    //   sortable: true,
    //   render: (value) => value || "-",
    // },
    {
      id: "invoice_amount",
      label: "Amount",
      sortable: true,
      render: (value) => value || "-",
      // render: (value, row) => {
      //   return (
      //     <div className="tooltip-wrapper amount-tooltip">
      //       <a href="#" className="amount-link">{formatUSD(value)}</a>
      //       <div className="custom-tooltip top">
      //         <span className="tooltip-label">Service:</span>{" "}
      //         <span className="tooltip-value">{formatUSD(row?.service_amount)}</span>
      //         {" | "}
      //         <span className="tooltip-label">Charge:</span>{" "}
      //         <span className="tooltip-value">{formatUSD(row?.chargeable_amount)}</span>
      //       </div>
      //     </div>
      //   );
      // }
    },
    {
      id: "business_name",
      label: "Business Name",
      sortable: true,
      render: (value, row) => (
        <span>
          {value}
          <span
            style={{ marginLeft: 6, cursor: "pointer", color: "#888" }}
            title="Business Contact Details"
            onClick={() => handleBusinessInfoClick(row)}
          >
            <i className="fa fa-info-circle" />
          </span>
        </span>
      ),
    },
    {
      id: "customer_name",
      label: "Customer Name",
      sortable: true,
      render: (value) => value || "-",
    },
    {
      id: "invoice_user",
      label: "User",
      sortable: true,
      render: (value) => value || "-",
    },
    {
      id: "invoice_status",
      label: "Status",
      sortable: true,
      render: (value) => value || "-"
      //   {
      //   const status = statusMap[value];
      //   if (!status) return "-";
      //   return (
      //     <span
      //       style={{
      //         color: status.color,
      //         padding: "4px 8px",
      //         borderRadius: "4px",
      //         backgroundColor: `${status.color}20`,
      //         display: "inline-block",
      //       }}
      //     >
      //       {status.text}
      //     </span>
      //   );
      // },
    },
    // {
    //   id: "invoice_type_label",
    //   label: "Type",
    //   sortable: false,
    //   render: (value) => value || "-",
    //   cellStyle: () => ({
    //     width: "100%",
    //     maxWidth: "max-content",
    //   }),  
    // },
    // {
    //   id: "product_title",
    //   label: "Product",
    //   sortable: true,
    //   render: (value) => value || "-",
    // },
    // {
    //   id: "due_date",
    //   label: "Due Date",
    //   sortable: true,
    //   render: (value) => value || "-",
    // },
    {
      id: "overdue_days",
      label: "Overdue Days",
      sortable: true,
      render: (value) => {
        if (value === 0) return "0";
        if (!value || value === "-") return "-";
        return value;
      },
    },
    {
      id: "inv_reminder_status",
      label: "Reminder Status",
      sortable: true,
      render: (value) => value || "-",
      cellStyle: () => ({
        width: "-10%",
        // maxWidth: "max-content",
      }),
    },
    {
      id: "actions",
      label: "Action",
      sortable: false,
      render: (value, row) => <ActionDropdown inv={row} />,
      cellStyle: () => ({
        width: "120px",
        maxWidth: "max-content",
        minWidth: "108px",
      }),      
    },
    {
      id: "last_note_date",
      label: "Last Note",
      sortable: true,
      render: (value) => value || "-",
    },
    {
      id: "notes",
      label: "Notes",
      sortable: false,
      render: (value, row) => <Notes
        entityType="lead"
        entityId={row.lead_id || row.lead_id || ''}
        entityName={row.business_name || ''}
        confidenceUser={confidenceUser}
      />,
    }

  ];

  const [visibleColumns, setVisibleColumns] = useState([
    "date",
    "invoice_number",
    // "billing_profile_name",
    "invoice_amount",
    "business_name",
    "customer_name",
    "invoice_user",
    "invoice_status",
    // "invoice_type_label",
    // "due_date",
    "overdue_days",
    "inv_reminder_status",
    "actions",
    "last_note_date",
    "notes",
  ]);

  useEffect(() => {
    const currentUser = getCurrentUserInvoice();
    if (currentUser && Array.isArray(currentUser.roles)) {
      setUserRoles(currentUser.roles);
    }
    fetchInvoices();
  // Add activeTab as a dependency so fetchInvoices runs on tab change
  }, [activeTab]);

  const generateExportData = () => {
    // Use visibleColumns to determine which columns to export, excluding actions and notes
    const exportColumns = columnDefinitions.filter(
      (col) => visibleColumns.includes(col.id) && col.id !== "actions" && col.id !== "notes",
    );

    const headers = exportColumns.map((col) => col.label);

    const data = sortedInvoices.map((inv) => {
      return exportColumns.map((col) => {
        const rawValue = inv[col.id];

        // Handle special formats
        // if (col.id === "invoice_amount") {
        //   const total = formatUSD(rawValue);
        //   const service = formatUSD(inv?.service_amount);
        //   const charge = formatUSD(inv?.chargeable_amount);
        //   return `Total: ${total}, Service: ${service}, Charge: ${charge}`;
        // }

        // if (col.id === "invoice_status") {
        //   const status = statusMap[rawValue];
        //   return status ? status.text : "-";
        // }

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
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    };

    const today = new Date();
    // Get the date 15 days before
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(today.getDate() - 240);
    const date_from = formatDate(fifteenDaysAgo); 
    const date_to = formatDate(today);
    const filterType = activeTab;

    try {
      const response = await axios.post(
        ENDPOINTS.INVOICE_LISTING,
        [
          {
            date_from,
            date_to,
            filter_type: filterType,
            merchant_id: merchantId,
            search:''
          }
        ],
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

  const sendResumeInvoiceReminder = async (inv) => {
    // setLoading(true);
    setLoadingContent(true);
    setError(null);
    // Use the correct URL based on reminder status
    const url = inv.inv_reminder_status === 'Active' ? ENDPOINTS.PAUSE_INVOICE_REMINDER : ENDPOINTS.RESUME_INVOICE_REMINDER;

    try {
      const response = await axios.post(
        url,
        {
          invoiceid: inv.invoice_id,
          user_id: merchantId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if(response.data.result === 'success'){
        
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response.data.msg,
          confirmButtonColor: "#dc3545",
        });
  
        if(inv.inv_reminder_status == 'Paused'){
          updateReminderStatus(inv.invoice_id, "Active");
        }else if(inv.inv_reminder_status == 'Active'){
          updateReminderStatus(inv.invoice_id, "Paused");
        }
      }
      // const records = response.data?.data?.records || [];
      // setInvoices(records);

    } catch (err) {
      setError("Failed to load invoice data");
    } finally {
      setLoadingContent(false);
    }
  };

  const updateReminderStatus = (invoiceId, newStatus) => {
    setInvoices(prevInvoices =>
      prevInvoices.map(inv =>
        inv.invoice_id === invoiceId
          ? { ...inv, inv_reminder_status: newStatus }
          : inv
      )
    );
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
    return `Past_Due_Invoice_Report_${date}.${format}`;
  };

  const exportToCSV = () => {
    const { headers, data } = generateExportData();
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
    Swal.fire("Success", "Past Due Invoice data exported to CSV!", "success");
  };

  const exportToPDF = () => {
    const { headers, data } = generateExportData();
    if (data.length === 0) {
      Swal.fire("No Data", "No invoices to export.", "info");
      return;
    }
    const doc = new jsPDF("landscape");
    doc.setFontSize(18);
    doc.text("Past Due Invoice Report", doc.internal.pageSize.getWidth() / 2, 15, {
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
    Swal.fire("Success", "Past Due Invoice data exported to PDF!", "success");
  };
  const exportToExcel = () => {
    const { headers, data } = generateExportData();
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
    Swal.fire("Success", "Past Due Invoice data exported to Excel!", "success");
  };
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (searchTerm === "" && !startDate && !endDate) return true;
      const searchTermLower = searchTerm.toLowerCase().trim();
      const matchesSearch =
        searchTerm === "" ||
        (inv.invoice_number &&
          inv.invoice_number.toLowerCase().includes(searchTermLower)) ||
        (inv.business_name &&
          inv.business_name.toLowerCase().includes(searchTermLower)) ||
        (inv.customer_name &&
          inv.customer_name.toLowerCase().includes(searchTermLower)) ||
        (inv.billing_profile_name &&
          inv.billing_profile_name.toLowerCase().includes(searchTermLower)) ||
        (inv.id && String(inv.id).toLowerCase().includes(searchTermLower)) ||
        (inv.invoice_user &&
          inv.invoice_user.toLowerCase().includes(searchTermLower)) ||
        statusMap[inv.invoice_status]?.text
          .toLowerCase()
          .includes(searchTermLower) ||
        (inv.overdue_days && String(inv.overdue_days).includes(searchTermLower)) ||
        (inv.product_title &&
          inv.product_title.toLowerCase().includes(searchTermLower)) ||
        (inv.invoice_type_label &&
          inv.invoice_type_label.toLowerCase().includes(searchTermLower)) ||
        (inv.invoice_amount &&
          String(inv.invoice_amount).includes(searchTermLower)) ||
        (inv.due_date &&
          inv.due_date.toLowerCase().includes(searchTermLower)) ||
        (inv.Date &&
          inv.date.toLowerCase().includes(searchTermLower));
      let matchesDateRange = true;
      if (startDate || endDate) {
        const invoiceDate = parseInvoiceDate(inv.date);
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
    <PageContainer title="Past Due Invoices" activeTab={activeTab} onTabChange={handleTabChange} showPastDueTabs={true} >
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
          { id: "default", title: "Columns", columns: columnDefinitions },
        ]}
        visibleColumns={visibleColumns}
        toggleColumnVisibility={toggleColumnVisibility}
        resetToDefaultColumns={resetToDefaultColumns}
        selectAllColumns={selectAllColumns}
        exportToExcel={exportToExcel}
        exportToPDF={exportToPDF}
        exportToCSV={exportToCSV}
      />
      {loadingContent && (
        <div className="overlay-loading d-flex flex-column justify-content-center align-items-center">
          <svg class="loader" viewBox="0 0 200 100">
            <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#007bff" />
            <stop offset="100%" stop-color="#ff6600" />
            </linearGradient>
            </defs>
            <path class="infinity-shape"
                  d="M30,50
                    C30,20 70,20 100,50
                    C130,80 170,80 170,50
                    C170,20 130,20 100,50
                    C70,80 30,80 30,50"
                />
          </svg>
          <p className="mt-3 mb-0 text-muted">Processing data...</p>
        </div>
      )}
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
                  .filter((col) => visibleColumns.includes(col.id))
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
                      .filter((col) => visibleColumns.includes(col.id))
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
      {/* Business Contact Details Modal */}
      {showBusinessModal && (
        <Modal show={showBusinessModal} onClose={handleCloseBusinessModal} title="Business Contact Details">
          <div>
            <div>
              <strong>Authorized Signatory Name:</strong>{" "}
              {businessModalData?.business_contact_details?.authorized_signatory_name || "-"}
            </div>
            <div>
              <strong>Business Phone:</strong>{" "}
              {businessModalData?.business_contact_details?.business_phone || "-"}
            </div>
            <div>
              <strong>Business Email:</strong>{" "}
              {businessModalData?.business_contact_details?.business_email || "-"}
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};

export default PastDueInvoiceReport;
const style = document.createElement('style');
style.textContent = `
/* Loading Overlay Styles */
  .loading-overlay {
    animation: fadeIn 0.3s ease-in-out;
  }

  .loading-content {
    animation: slideIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Custom PlaceholderLoading styles */
  .react-placeholder-loading {
    border-radius: 50%;
  }
  .overlay-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255,255,255,0.6);
    z-index: 10;
  }
  .overlay-loading-2 {
    position: absolute;
    top: 200px;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
  }
  .loader {
    width: 120px;
    height: 100px;
  }
 
  .infinity-shape {
    fill: none;
    stroke: url(#gradient);
    stroke-width: 12;
    stroke-linecap: round;
    stroke-dasharray: 220 60;
    stroke-dashoffset: 0;
    animation: dashMove 2s linear infinite;
  }
 
  @keyframes dashMove {
    0% {
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dashoffset: -280;
    }
  }
`;