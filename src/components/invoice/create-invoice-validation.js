// Invoice form validation utility

function isAlphaWithSpace(str) {
  return /^[A-Za-z]+( [A-Za-z]+)*$/.test(str);
}

function isAlphanumericWithSpecial(str) {
  // Allows alphanumeric and special characters (except newlines)
  return /^[A-Za-z0-9 !@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]+$/.test(str);
}

function isAlphaOnly(str) {
  return /^[A-Za-z]+$/.test(str);
}

function isAlphaOnlyWithSpace(str) {
  return /^[A-Za-z]+( [A-Za-z]+)*$/.test(str);
}

function isNumeric(str, maxLen) {
  return new RegExp(`^\\d{1,${maxLen}}$`).test(str);
}

function isNumericRange(str, minLen, maxLen) {
  return new RegExp(`^\\d{${minLen},${maxLen}}$`).test(str);
}

function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function isNumericExact(str, len) {
  return new RegExp(`^\\d{${len}}$`).test(str);
}

export { isAlphaWithSpace, isAlphanumericWithSpecial, isAlphaOnly, isAlphaOnlyWithSpace, isNumeric, isNumericRange, isEmail };

export function validateInvoiceForm(formData, services, paymentMethod) {
  const errors = {};

  // Lead
  if (!formData.lead) {
    errors.lead = 'Select a lead.';
  }

  // Product
  if (!formData.invoice_parent_product) {
    errors.invoice_parent_product = 'Select a product.';
  }

  // Invoice No
  if (!formData.product_customer_invoice_no) {
    errors.product_customer_invoice_no = 'Invoice No. is required.';
  }

  // Invoice Date
  if (!formData.invoice_date) {
    errors.invoice_date = 'Invoice date is required.';
  }

  // Due Date
  if (!formData.due_date) {
    errors.due_date = 'Due date is required.';
  }

  // Customer Name: Only alphabets, one space allowed, no special characters
  if (!formData.customer_name) {
    errors.customer_name = 'Customer Name is required.';
  } else if (!isAlphaOnlyWithSpace(formData.customer_name)) {
    errors.customer_name = 'Customer Name must contain only alphabets and a single space (no special characters).';
  } else if (formData.customer_name.length > 25) {
    errors.customer_name = 'Max 25 alphabetic characters.';
  }

  // Business Name: Alphanumeric and special characters allowed
  if (!formData.business_name) {
    errors.business_name = 'Business Name is required.';
  } else if (!isAlphanumericWithSpecial(formData.business_name)) {
    errors.business_name = 'Business Name must be alphanumeric and can include special characters.';
  } else if (formData.business_name.length > 30) {
    errors.business_name = 'Business Name must be max 30 characters.';
  }

  // Address: Alphanumeric and special characters allowed
  if (!formData.address) {
    errors.address = 'Address is required.';
  } else if (!isAlphanumericWithSpecial(formData.address)) {
    errors.address = 'Address must be alphanumeric and can include special characters.';
  }

  // Zip Code: Numeric, 5 to 6 digits
  if (!formData.zip) {
    errors.zip = 'Zip Code is required.';
  } else if (!isNumericRange(formData.zip, 5, 6)) {
    errors.zip = 'Zip Code must be 5 or 6 digits.';
  }

  // Country: Only alphabets, no special characters or numbers
  if (!formData.country) {
    errors.country = 'Country is required.';
  } else if (!isAlphaOnly(formData.country)) {
    errors.country = 'Country must contain only alphabets.';
  }

  // City: Only alphabets, no special characters or numbers
  if (!formData.city) {
    errors.city = 'City is required.';
  } else if (!isAlphaOnly(formData.city)) {
    errors.city = 'City must contain only alphabets.';
  }

  // Phone Number: Numeric, exactly 10 digits
  if (!formData.phone_no) {
    errors.phone_no = 'Phone Number is required.';
  } else if (!isNumericExact(formData.phone_no, 10)) {
    errors.phone_no = 'Phone Number must be exactly 10 digits.';
  }

  // Email
  if (!formData.email) {
    errors.email = 'Email is required.';
  } else {
    // Support comma-separated emails
    const emails = formData.email.split(',').map(e => e.trim()).filter(Boolean);
    const invalidEmails = emails.filter(e => !isEmail(e));
    if (invalidEmails.length > 0) {
      errors.email = `Invalid email(s): ${invalidEmails.join(', ')}`;
    }
  }

  // Sales Email (optional, but if present, must be valid)
  if (formData.sales_email) {
    const salesEmails = formData.sales_email.split(',').map(e => e.trim()).filter(Boolean);
    const invalidSalesEmails = salesEmails.filter(e => !isEmail(e));
    if (invalidSalesEmails.length > 0) {
      errors.sales_email = `Invalid sales email(s): ${invalidSalesEmails.join(', ')}`;
    }
  }

  // BCC Email (optional, but if present, must be valid)
  if (formData.bcc_email) {
    const bccEmails = formData.bcc_email.split(',').map(e => e.trim()).filter(Boolean);
    const invalidBccEmails = bccEmails.filter(e => !isEmail(e));
    if (invalidBccEmails.length > 0) {
      errors.bcc_email = `Invalid BCC email(s): ${invalidBccEmails.join(', ')}`;
    }
  }

  // At least one product/service row
  if (!services.length) {
    errors['services'] = 'At least one service is required.';
  }

  // Validate each product/service row
  services.forEach((row, idx) => {
    if (!row.product_id) {
      errors[`services.${idx}.product_id`] = 'Service is required.';
    }
    if (!row.quantity || isNaN(row.quantity)) {
      errors[`services.${idx}.quantity`] = 'Qty is required.';
    }
    if (!row.price) {
      errors[`services.${idx}.price`] = 'Rate is required.';
    }
    if (isNaN(row.price)) {
        errors[`services.${idx}.price`] = 'Rate must be a number.';
      }
    if (row.amount === undefined || row.amount === '') {
      errors[`services.${idx}.amount`] = 'Amount is required.';
    }
    if (isNaN(row.amount)) {
        errors[`services.${idx}.amount`] = 'Amount must be a number.';
      }
  });

  // Payment method
  if (!paymentMethod || paymentMethod === 'Bank transfer') {
    errors.payment_method = 'Payment method is required.';
  }

  return errors;
} 