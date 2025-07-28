import React, { useEffect } from "react";
import Swal from "sweetalert2";
import {
  handlePauseReminder,
  handleResumeReminder,
} from "../invoiceActionHandlers";
import { getCurrentUserInvoice } from "../invoice-settings";

const PauseReminderModalContent = ({ modalData }) => {
  useEffect(() => {
    const user = getCurrentUserInvoice();
    const userId = user?.id || null;

    const isResume = modalData?.actionType === "resume_auto_inv_reminder";
    const actionLabel = isResume ? "resume" : "pause";
    const actionVerb = isResume ? "Resumed" : "Paused";

    Swal.fire({
      icon: "question",
      title: '<h2 style="font-weight: 600; font-size: 24px;">Are you sure?</h2>',
      html: `
        <p style="font-size: 16px; margin-top: 12px;">
          Are you sure you want to <strong>${actionLabel}</strong> the auto reminder for invoice
          <strong>'${modalData?.businessName}'</strong> invoice id: <strong>'${modalData?.customerInvoiceNo}'</strong>?
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: `Yes, ${actionLabel} it`,
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

        const res = isResume
          ? await handleResumeReminder(payload)
          : await handlePauseReminder(payload);

        if (res?.result === "success") {
          Swal.fire("Success", res.msg || `${actionVerb} Auto Reminder Successfully.`, "success");
          modalData?.fetchInvoices?.();
          modalData?.onClose?.();
        } else {
          throw new Error(res?.msg || "Action failed");
        }
      } catch (err) {
        Swal.fire("Error", err.message || "Unexpected error occurred.", "error");
      }
    });
  }, []);

  return null; // No UI, just SweetAlert
};

export default PauseReminderModalContent;
