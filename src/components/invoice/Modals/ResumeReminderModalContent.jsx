import React, { useEffect } from "react";
import Swal from "sweetalert2";
import { handleResumeReminder } from "../invoiceActionHandlers";
import { getCurrentUserInvoice } from "../invoice-settings";

const ResumeReminderModalContent = ({ modalData }) => {
  useEffect(() => {
    const user = getCurrentUserInvoice();
    const userId = user?.id || null;

    Swal.fire({
      icon: "question",
      title: "Resume Auto Reminder?",
      html: `Are you sure you want to <strong>resume</strong> auto reminder for invoice <strong>#'${modalData?.customerInvoiceNo}'</strong> for <strong>'${modalData?.businessName}'</strong>?`,
      showCancelButton: true,
      confirmButtonText: "Yes, resume it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      allowOutsideClick: false,
      allowEscapeKey: true,
      reverseButtons: true,
    }).then(async (result) => {
      if (!result.isConfirmed) {
        modalData?.onClose?.();
        return;
      }

      try {
        const payload = {
          invoiceid: modalData?.invoiceId,
          user_id: userId,
        };

        const res = await handleResumeReminder(payload);

        if (res?.result === "success") {
          Swal.fire("Success", res.msg || "Resumed Auto Reminder Successfully.", "success");
          modalData?.fetchInvoices?.();
          modalData?.onClose?.();
        } else {
          throw new Error(res?.msg || "Resume reminder failed");
        }
      } catch (err) {
        Swal.fire("Error", err.message || "Unexpected error occurred.", "error");
      }
    });
  }, []);

  return null; // SweetAlert handles UI
};

export default ResumeReminderModalContent;