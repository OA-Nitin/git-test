import * as yup from 'yup';

// Regex Patterns
const phoneRegex = /^(\d{3}-\d{3}-\d{4}|\d{10})$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const businessNameRegex = /^([\w!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+(?: [\w!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+)*)$/;
const dateRegex = /^(?:(\d{2})[\/\-](\d{2})[\/\-](\d{4})|(\d{4})[\/\-](\d{2})[\/\-](\d{2}))$/;


export const projectDetailSchema = yup.object().shape({

  

  // Personal Info

  authorized_signatory_name: yup
      .string()
      .notRequired()
      .max(60, 'Maximum 60 characters allowed')
      .test('is-valid', 'Please enter a valid name.', value => !value || nameRegex.test(value)),

  business_phone: yup
      .string()
      .notRequired()
      .matches(phoneRegex, 'Please enter a valid phone number.'),
  
  business_email: yup
      .string()
      .notRequired()
      .max(60, 'Maximum 60 characters allowed')
      .matches(emailRegex, 'Please enter a valid email address.'),
  
  business_title: yup
      .string()
      .notRequired()
      .max(60, 'Maximum 60 characters allowed')
      .test('is-valid', 'Please enter a valid title.', value => !value || nameRegex.test(value)),

      zip: yup
      .string()
      .notRequired()
      .max(10, 'Maximum 10 characters allowed')
      .test('is-valid-zip', 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789).', value => !value || /^\d{5}(-\d{4})?$/.test(value)),

      street_address: yup
      .string()
      .notRequired()
      .max(100, 'Maximum 100 characters allowed'),

      city: yup
      .string()
      .notRequired()
      .max(60, 'Maximum 60 characters allowed')
      .test('is-valid', 'Please enter a valid city name.', value => !value || nameRegex.test(value)),

      state: yup
      .string()
      .notRequired(),

      identity_document_type: yup
      .string()
      .notRequired(),

      identity_document_number: yup
      .string()
      .notRequired()
      .max(30, 'Maximum 30 characters allowed'),

      business_legal_name: yup
      .string()
      .notRequired()
      .max(60, 'Maximum 60 characters allowed')
      .test('is-valid', 'Please enter a valid business name.', value => !value || businessNameRegex.test(value)),

      doing_business_as: yup
      .string()
      .notRequired()
      .max(60, 'Maximum 60 characters allowed')
      .test('is-valid', 'Please enter a valid business name.', value => !value || businessNameRegex.test(value)),

      business_category: yup
      .string()
      .notRequired()
      .max(60, 'Maximum 60 characters allowed')
      .test('is-valid', 'Please enter a valid business category.', value => !value || businessNameRegex.test(value)),

      website_url: yup
      .string()
      .notRequired()
      .url('Please enter a valid website URL.'),

      business_entity_type: yup
      .string()
      .notRequired(),

      registration_number: yup
      .string()
      .notRequired()
      .max(30, 'Maximum 30 characters allowed'),

      registration_date: yup
      .string()
      .notRequired()
      .test(
        'is-valid-date',
        'Invalid date format. Use formats like mm/dd/yyyy, dd/mm/yyyy, or yyyy/mm/dd.',
        value => !value || dateRegex.test(value)
      ),

      state_of_registration: yup
      .string()
      .notRequired()
      .max(60, 'Maximum 60 characters allowed')
      .test('is-valid', 'Please enter a valid state name.', value => !value || nameRegex.test(value)),







});
