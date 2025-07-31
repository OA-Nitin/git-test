// validator.js

import * as yup from 'yup';

//Common Regex Patterns
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const phoneRegex = /^(\d{3}-\d{3}-\d{4}|\d{10})$/;
export const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
export const dateRegex = /^(0[1-9]|1[0-2])\/([0-2][0-9]|3[01])\/\d{4}$/;
export const businessNameRegex = /^([\w!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]+(?: [\w!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]+)*)$/;
export const noteRegex = /^[A-Za-z0-9\s.,'!@#$%^&*()_+\-=\[\]{};':"\\|<>/?`~]+$/;
export const refIdRegex = /^[A-Za-z0-9_-]+$/;

// Reusable Field Validators

export const emailField = (required = false) =>
  required
    ? yup
        .string()
        .required('Email is required.')
        .max(60, 'Maximum 60 characters allowed')
        .matches(emailRegex, 'Please enter a valid email address.')
    : yup
        .string()
        .notRequired()
        .max(60, 'Maximum 60 characters allowed')
        .test('is-valid-email', 'Please enter a valid email address.', value => !value || emailRegex.test(value));

export const phoneField = (required = false) =>
  required
    ? yup
        .string()
        .required('Phone number is required.')
        .matches(phoneRegex, 'Please enter a valid phone number.')
    : yup
        .string()
        .notRequired()
        .test('is-valid-phone', 'Please enter a valid phone number.', value => !value || phoneRegex.test(value));

export const nameField = (required = false, label = 'Name') =>
  required
    ? yup
        .string()
        .required(`${label} is required.`)
        .max(60, 'Maximum 60 characters allowed')
        .test('is-valid', `Please enter a valid ${label.toLowerCase()}.`, value => !value || nameRegex.test(value))
    : yup
        .string()
        .notRequired()
        .max(60, 'Maximum 60 characters allowed')
        .test('is-valid', `Please enter a valid ${label.toLowerCase()}.`, value => !value || nameRegex.test(value));

export const businessNameField = (required = false) =>
  required
    ? yup
        .string()
        .required('Business name is required.')
        .max(60, 'Maximum 60 characters allowed')
        .test('is-valid', 'Please enter a valid business name.', value => !value || businessNameRegex.test(value))
    : yup
        .string()
        .notRequired()
        .max(60, 'Maximum 60 characters allowed')
        .test('is-valid', 'Please enter a valid business name.', value => !value || businessNameRegex.test(value));

export const zipField = (required = false) =>
  required
    ? yup
        .string()
        .required('ZIP code is required')
        .max(10, 'Maximum 10 characters allowed')
        .test('is-valid-zip', 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789).', value => /^[0-9]{5}(-[0-9]{4})?$/.test(value))
    : yup
        .string()
        .notRequired()
        .max(10, 'Maximum 10 characters allowed')
        .test('is-valid-zip', 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789).', value => !value || /^[0-9]{5}(-[0-9]{4})?$/.test(value));

  export const referenceIdField = (required = false, maxLength = 50) =>
    yup.string()
      .max(maxLength, `Max ${maxLength} characters allowed`)
      .test('valid-ref', 'Only alphanumeric, hyphen, underscore allowed.', val => !val || refIdRegex.test(val))
      .test('required-ref', 'Reference ID is required.', val => !required || !!val);  
      
      
  const isValidDateFormat = (val) => {
    if (!val) return false;  // ← Change this to reject empty values

    const date = new Date(val);
    if (isNaN(date.getTime())) return false;

    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    const formatted = `${mm}/${dd}/${yyyy}`;

    return dateRegex.test(formatted);
  };

  export const dateField = (required = false) =>
    required
      ? yup
          .mixed()
          .required('Date is required.')
          .test('is-valid-date', 'Date must be in MM/DD/YYYY format.', isValidDateFormat)
      : yup
          .mixed()
          .notRequired()
          .test('is-valid-date', 'Date must be in MM/DD/YYYY format.', isValidDateFormat);

    // Note field validator with alphanumeric and special characters
    const isValidNoteFormat = (val) => {
      if (!val) return true; // Allow empty values for optional notes   
      // Check for double spaces
      if (/\s{2,}/.test(val)) return false;   
      // Check for valid characters
      return noteRegex.test(val);
    };

    export const noteField = (required = false, maxLength = 150) =>
      required
        ? yup
            .string()
            .required('Note is required.')
            .max(maxLength, `Maximum ${maxLength} characters allowed`)
            .test('is-valid-note', 'Note contains invalid characters or double spaces.', isValidNoteFormat)
        : yup
            .string()
            .notRequired()
            .max(maxLength, `Maximum ${maxLength} characters allowed`)
            .test('is-valid-note', 'Note contains invalid characters or double spaces.', value => !value || isValidNoteFormat(value));

    export const amountField = (required = false) =>
      yup.number()
        .typeError('Amount must be a number')
        .test('positive', 'Amount must be greater than 0.', val => !val || val > 0)
        .test('decimal-precision', 'Up to 6 decimal places allowed.', val => !val || /^\d+(\.\d{1,6})?$/.test(val?.toString()))
        .test('required-amount', 'Received amount is required.', val => !required || !!val);


// Usage Example:
// import { emailField, phoneField, nameField, businessNameField, zipField, dateField } from './validator';
//
// const schema = yup.object().shape({
//   email: emailField(true),
//   phone: phoneField(),
//   name: nameField(true, 'Full Name'),
//   business_legal_name: businessNameField(true),
//   zip: zipField(),
//   registration_date: dateField(),
// });
