import React, { useEffect } from "react";
import Swal from "sweetalert2";
import { handleDeleteInvoice } from "../invoiceActionHandlers";
import { getCurrentUserInvoice } from "../invoice-settings"; // import user function

const DeleteInvoiceModalContent = ({ modalData }) => {
  useEffect(() => {
    const user = getCurrentUserInvoice(); //get current user
    //console.log("Current User:", user);
    const userId = user?.id || null; 

    Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      html: `Are you sure you want to delete invoice <strong>'${modalData?.businessName}'</strong> with ID: <strong>'${modalData?.invoiceId}'</strong>?`,
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      allowOutsideClick: false,
      allowEscapeKey: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const payload = {
            invoiceid: modalData?.invoiceId,
            user_id: userId, // send user ID
          };

          const res = await handleDeleteInvoice(payload);

          if (res?.success) {
            Swal.fire("Deleted!", res.message || "Invoice deleted successfully.", "success");
            modalData?.onClose?.();
            modalData?.fetchInvoices?.(); // refresh invoice list
          } else {
            Swal.fire("Error", res.message || "Failed to delete invoice.", "error");
          }
        } catch (err) {
          Swal.fire("Error", err.message || "Unexpected error occurred.", "error");
        }
      } else {
        modalData?.onClose?.(); // cancel = close modal
      }
    });
  }, []);

  return null; // nothing rendered, SweetAlert handles it
};

export default DeleteInvoiceModalContent;
