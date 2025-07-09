
// Import all modal content components
import PaidModalContent from './Modals/PaidModalContent';
import CancelledModalContent from './Modals/CancelledModalContent';
import ReminderModalContent from './Modals/ReminderModalContent'; //pending api not found
import PaymentProcessModalContent from './Modals/PaymentProcessModalContent';
import PartialPaidModalContent from './Modals/PartialPaidModalContent';
import PaymentPlanModalContent from './Modals/PaymentPlanModalContent';
import ResendInvoiceModalContent from './Modals/ResendInvoiceModalContent'; //pending api not found
import UpdateInterestModalContent from './Modals/UpdateInterestModalContent';
import PauseReminderModalContent from './Modals/PauseReminderModalContent'; //pending api not found
import ShareInvoiceLinkModalContent from './Modals/ShareInvoiceLinkModalContent';
import DefaultModalContent from './Modals/DefaultModalContent';

const ModalContent = ({ modalData, actionsMap }) => {
  const { actionType } = modalData;
  const actionText = actionsMap[actionType]?.text || actionType;

  switch (actionType) {
    case '2':
      return <PaidModalContent modalData={modalData} />;
    case '3':
      return <CancelledModalContent modalData={modalData} />;
    case 'send_reminder':
      return <ReminderModalContent modalData={modalData} />;
    case '6':
      return <PaymentProcessModalContent modalData={modalData} />;
    case '17':
      return <PartialPaidModalContent modalData={modalData} />;
    case '19':
      return <PaymentPlanModalContent modalData={modalData} />;
    case 'resend':
      return <ResendInvoiceModalContent modalData={modalData} />; 
    case 'update_interest':
      return <UpdateInterestModalContent modalData={modalData} />;   
    case 'cancel_auto_inv_reminder':
      return <PauseReminderModalContent modalData={modalData} />;
    case 'share_invoice_link':
      return <ShareInvoiceLinkModalContent modalData={modalData} />;      
    default:
      return <DefaultModalContent modalData={modalData} actionText={actionText} />;
  }
};

export default ModalContent;
