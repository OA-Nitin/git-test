// reusable hook for logic

// Helpers/validationLibrary/useInvoiceValidation.js
import { useState } from 'react';

export const useInvoiceValidation = (schema, inputRows, setInputRows) => {
  const [errors, setErrors] = useState([]);

  const validateRowYup = async (row) => {
    try {
      await schema.validate(row, { abortEarly: false });
      return {};
    } catch (err) {
      const errorObj = {};
      err.inner.forEach(e => {
        errorObj[e.path] = e.message;
      });
      return errorObj;
    }
  };

  const validateAllRows = async () => {
    const allErrors = await Promise.all(inputRows.map(validateRowYup));
    setErrors(allErrors);
    return allErrors.every(rowErr => Object.keys(rowErr).length === 0);
  };

  const validateField = async (index, field) => {
    try {
      await schema.validateAt(field, inputRows[index]);
      const updatedErrors = [...errors];
      if (!updatedErrors[index]) updatedErrors[index] = {};
      updatedErrors[index][field] = "";
      setErrors(updatedErrors);
    } catch (err) {
      const updatedErrors = [...errors];
      if (!updatedErrors[index]) updatedErrors[index] = {};
      updatedErrors[index][field] = err.message;
      setErrors(updatedErrors);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...inputRows];
    updated[index][field] = value;
    setInputRows(updated);
    validateField(index, field); // runtime validation
  };

  return {
    errors,
    setErrors,
    validateAllRows,
    handleInputChange,
  };
};
