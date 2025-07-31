// validator.js

import * as yup from 'yup';

//Common Regex Patterns
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const phoneRegex = /^(\d{3}-\d{3}-\d{4}|\d{10})$/;
export const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
export const dateRegex = /^(0[1-9]|1[0-2])\/([0-2][0-9]|3[01])\/\d{4}$/;
export const businessNameRegex = /^([\w!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]+(?: [\w!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]+)*)$/;

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
