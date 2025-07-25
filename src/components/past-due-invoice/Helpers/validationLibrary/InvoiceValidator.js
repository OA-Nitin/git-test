// schema per modal (partial, paid, cancel, etc.)

import * as yup from 'yup';
import { emailField, phoneField, nameField, businessNameField, zipField, dateField } from './FieldValidators';

// partial payemnt validation setup
export const partialPaymentRowSchema = yup.object().shape({
  refId: yup.string().required('Reference ID is required'),
  paymentDate: dateField(true),
  clearedDate: dateField(true),
  paymentMode: yup.string().required('Payment mode is required'),
  note: yup.string().notRequired(),
  received: yup
    .number()
    .typeError('Received amount must be a number')
    .positive('Amount must be greater than 0')
    .required('Received amount is required'),
});

// paid invoice validation setup
export const paidInvoiceSchema = yup.object().shape({
  paymentMode: yup.string().required('Payment mode is required'),
  note: yup.string().notRequired(),
  paymentDate: dateField(true),
  clearedDate: dateField(true),
});

// cancel invoice validation setup
export const cancelInvoiceSchema = yup.object().shape({
  paymentMode: yup.string().required('Payment mode is required'),
  note: yup.string().notRequired(),
  paymentDate: dateField(true),
  clearedDate: dateField(true),
});

// payment in process
export const paymentProcessRowSchema = yup.object().shape({
  subject: yup.string().required('Subject is required'),
});

// reminder send
export const reminderInvoiceSchema = yup.object().shape({
  template_id: yup.string().required("Reminder template is required"),
  //subject: yup.string().required("Email subject is required"),
  //message: yup.string().required("Email body is required"),
});