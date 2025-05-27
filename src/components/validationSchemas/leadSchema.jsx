import * as yup from 'yup';

export const noteFormSchema = yup.object().shape({
  note: yup.string().required('Note is required').min(10, 'Note must be at least 10 characters').max(1000, 'Note cannot exceed 1000 characters'),
});


// Regex Patterns
const phoneRegex = /^(\d{3}-\d{3}-\d{4}|\d{10})$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

const businessNameRegex = /^([\w!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+(?: [\w!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+)*)$/;
const dateRegex = /^(?:(\d{2})[\/\-](\d{2})[\/\-](\d{4})|(\d{4})[\/\-](\d{2})[\/\-](\d{2}))$/;

export const leadDetailSchema = yup.object().shape({
  business_legal_name: yup
    .string()
    .required('Please enter a valid business legal name.')
    .max(60, 'Maximum 60 characters allowed')
    .matches(businessNameRegex, 'Please enter a valid business legal name.'),

  doing_business_as: yup
    .string()
    .max(60, 'Maximum 60 characters allowed')
    .test('is-valid', 'Please enter a valid business name.', value => !value || businessNameRegex.test(value)),

  category: yup
    .string()
    .required('Please enter a valid business category.')
    .max(60, 'Maximum 60 characters allowed')
    .matches(businessNameRegex, 'Please enter a valid business category.'),

  website: yup
    .string()
    .required('Please enter a valid website URL.')
    .url('Please enter a valid website URL.'),

  authorized_signatory_name: yup
    .string()
    .notRequired()
    .max(60, 'Maximum 60 characters allowed')
    .test('is-valid', 'Please enter a valid name.', value => !value || nameRegex.test(value)),

  business_phone: yup
    .string()
    .required('Please enter a valid phone number.')
    .matches(phoneRegex, 'Please enter a valid phone number.'),

  business_email: yup
    .string()
    .required('Please enter a valid email address.')
    .max(60, 'Maximum 60 characters allowed')
    .matches(emailRegex, 'Please enter a valid email address.'),

  business_title: yup
    .string()
    .required('Please enter a valid business title.')
    .max(60, 'Maximum 60 characters allowed')
    .test('is-valid', 'Please enter a valid title.', value => !value || nameRegex.test(value)),

  business_address: yup
    .string()
    .required('Please enter a valid business address.')
    .max(60, 'Maximum 60 characters allowed')
    .test('is-valid', 'Please enter a valid address.', value => !value || /^[\w\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]{0,60}$/.test(value)),

  city: yup
    .string()
    .required('Please enter a valid city name.')
    .max(60, 'Maximum 60 characters allowed')
    .test('is-valid', 'Please enter a valid city name.', value => !value || nameRegex.test(value)),

  state: yup
    .string()
    .required('Please enter a valid state name.')
    .max(60, 'Maximum 60 characters allowed')
    .test('is-valid', 'Please enter a valid state name.', value => !value || nameRegex.test(value)),

  zip: yup
    .string()
    .max(10, 'Maximum 10 characters allowed')
    .matches(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789).'),

  primary_contact_email: yup
    .string()
    .notRequired()
    .max(60, 'Maximum 60 characters allowed')
    .test('is-valid-email', 'Please enter a valid email address.', value => !value || emailRegex.test(value)),

  primary_contact_phone: yup
    .string()
    .notRequired()
    .test('is-valid-phone', 'Please enter a valid phone number.', value => !value || phoneRegex.test(value)),

  primary_contact_ext: yup
    .string()
    .notRequired(),

  contact_phone_type: yup
    .string()
    .notRequired()
    .max(20, 'Maximum 20 characters allowed'),

  billing_profile: yup
    .string()
    .notRequired()
    .max(60, 'Maximum 60 characters allowed'),

  taxnow_signup_status: yup
    .string()
    .notRequired()
    .max(30, 'Maximum 30 characters allowed'),

  taxnow_onboarding_status: yup
    .string()
    .notRequired()
    .max(30, 'Maximum 30 characters allowed'),

  business_type: yup
    .string()
    .required('Please select a valid business type.')
    .max(30, 'Maximum 30 characters allowed'),

  business_type_other: yup
    .string()
    .required('Please enter a valid  other business type.')
    .max(60, 'Maximum 60 characters allowed'),

  registration_number: yup
    .string()
    .required('Please enter a valid registration number.')
    .max(30, 'Maximum 30 characters allowed'),

    registration_date: yup
    .string()
    .required('Please enter a valid registration date.')
    .test(
      'is-valid-date',
      'Invalid date format. Use formats like mm/dd/yyyy, dd/mm/yyyy, or yyyy/mm/dd.',
      value => !value || dateRegex.test(value)
    ),  

  state_of_registration: yup
    .string()
    .required('Please enter a valid state of registration.')
    .max(60, 'Maximum 60 characters allowed')
    .test('is-valid', 'Please enter a valid state name.', value => !value || nameRegex.test(value)),

  ein: yup
    .string()
    .required('Please enter a valid EIN.')
    .max(10, 'Maximum 10 characters allowed'),
    // .test('is-valid-ein', 'Please enter a valid EIN (e.g., 12-3456789).', value => !value || /^\d{2}-\d{7}$/.test(value)),

  tax_id_type: yup
    .string()
    .required('Please select a valid tax ID type.')
    .max(30, 'Maximum 30 characters allowed'),

  internal_sales_agent: yup
    .string()
    .notRequired()
    .max(60, 'Maximum 60 characters allowed'),

  internal_sales_support: yup
    .string()
    .notRequired()
    .max(60, 'Maximum 60 characters allowed'),
});



export const contactSchema = yup.object().shape({
  // Professional Info
  first_name: yup
    .string()
    .required('First name is required')
    .max(60, 'Maximum 60 characters allowed')
    .matches(nameRegex, 'Please enter a valid name'),
    
  middle_name: yup
    .string()
    .notRequired()
    .max(60, 'Maximum 60 characters allowed')
    .test('is-valid', 'Please enter a valid name', value => !value || nameRegex.test(value)),
    
  last_name: yup
    .string()
    .required('Last name is required')
    .max(60, 'Maximum 60 characters allowed')
    .matches(nameRegex, 'Please enter a valid name'),
    
  name_alias: yup
    .string()
    .notRequired()
    .max(60, 'Maximum 60 characters allowed'),

    // selected_businesses: yup
    //     .array()
    //     .of(yup.string())
    //     .min(1, 'Please select at least one business.')
    //     .required('Please select at least one business.'),


//   title: yup
//     .string()
//     .max(20, 'Maximum 20 characters allowed'),
    
  job_title: yup
    .string()
    .notRequired()
    .max(60, 'Maximum 60 characters allowed'),
    
  // Personal Info
  birthdate: yup
    .date()
    .nullable()
    .transform((curr, orig) => orig === '' ? null : curr)
    .max(new Date(), 'Birthdate cannot be in the future'),
    
  // Contact Info
  email: yup
    .string()
    .required('Email is required')
    .max(60, 'Maximum 60 characters allowed')
    .matches(emailRegex, 'Please enter a valid email address'),
    
  secondary_email: yup
    .string()
    .notRequired()
    .max(60, 'Maximum 60 characters allowed')
    .test('is-valid-email', 'Please enter a valid email address', value => !value || emailRegex.test(value)),
    
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(phoneRegex, 'Please enter a valid phone number (e.g., 1234567890 or 123-456-7890)'),
    
  phone_ext: yup
    .string()
    .notRequired()
    .max(10, 'Maximum 10 characters allowed'),
    
  phone_type: yup
    .string()
    .required('Phone type is required'),
    
  secondary_phone: yup
    .string()
    .notRequired()
    .test('is-valid-phone', 'Please enter a valid phone number', value => !value || phoneRegex.test(value)),
    
  secondary_phone_type: yup
    .string()
    .notRequired(),
    
  // Mailing Info
  primary_address_street: yup
    .string()
    .notRequired()
    .max(100, 'Maximum 100 characters allowed'),
    
  house_no: yup
    .string()
    .notRequired()
    .max(20, 'Maximum 20 characters allowed'),
    
  primary_address_city: yup
    .string()
    .notRequired()
    .max(60, 'Maximum 60 characters allowed')
    .test('is-valid', 'Please enter a valid city name', value => !value || nameRegex.test(value)),
    
  primary_address_state: yup
    .string()
    .notRequired()
    .max(60, 'Maximum 60 characters allowed')
    .test('is-valid', 'Please enter a valid state name', value => !value || nameRegex.test(value)),
    
  primary_address_postalcode: yup
    .string()
    .notRequired()
    .max(10, 'Maximum 10 characters allowed')
    .test('is-valid-zip', 'Please enter a valid ZIP code', value => !value || zipRegex.test(value)),
    
  primary_address_country: yup
    .string()
    .notRequired()
    .max(60, 'Maximum 60 characters allowed'),
    
  // Contact Preferences
  dnd: yup
    .string()
    .required('DND selection is required'),
    
  contact_type: yup
    .string()
    .required('Contact type is required'),
    
  referral_type: yup
    .string()
    .required('Referral type is required'),
    
  contact_referral: yup
    .string()
    .required('Contact referral is required')
});



// Project form validation schema
export const projectSchema = yup.object().shape({
    project_name: yup
      .string()
      .required("Project name is required")
      .max(100, "Maximum 100 characters allowed"),
    project_fee: yup
      .string()
      .matches(/^[0-9]*$/, "Fee must be a number")
      .nullable(),
    maximum_credit: yup
      .string()
      .matches(/^[0-9]*$/, "Maximum credit must be a number")
      .nullable(),
    estimated_fee: yup
      .string()
      .matches(/^[0-9]*$/, "Estimated fee must be a number")
      .nullable(),
    Milestone: yup
      .string()
      .required("Milestone is required"),
    MilestoneStage: yup
      .string()
      .required("Stage is required"),
  });