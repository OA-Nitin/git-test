// SendEmailToggle.jsx
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as yup from 'yup';
import { noteField } from './validationLibrary/FieldValidators';

const SendEmailToggle = forwardRef(({ sendEmail, emailUpdateNote, setEmailUpdateNote, onValidationChange }, ref) => {
  const [error, setError] = useState("");

  const noteSchema = yup.object().shape({
    emailUpdateNote: noteField(true, 150)
  });

  const validateNote = async (value) => {
    try {
      await noteSchema.validateAt("emailUpdateNote", { emailUpdateNote: value });
      setError("");
      if (onValidationChange) onValidationChange(true);
      return true;
    } catch (err) {
      setError(err.message);
      if (onValidationChange) onValidationChange(false);
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    triggerValidation: () => validateNote(emailUpdateNote || "")
  }));

  const handleNoteChange = (e) => {
    const value = e.target.value;
    setEmailUpdateNote(value);
    validateNote(value);
  };

  useEffect(() => {
    if (emailUpdateNote) validateNote(emailUpdateNote);
  }, []);

  useEffect(() => {
    if (!sendEmail) validateNote(emailUpdateNote || "");
  }, [sendEmail]);

  if (sendEmail) return null;

  return (
    <div className="form-group mt-3">
      <label htmlFor="email_update_note">Email Update Note:*</label>
      <textarea
        id="email_update_note"
        name="email_update_note"
        rows="4"
        className={`form-control ${error ? "is-invalid" : ""}`}
        value={emailUpdateNote}
        onChange={handleNoteChange}
        required
      />
      <div className="invalid-feedback d-block">{error || "\u00A0"}</div>
    </div>
  );
});

export default SendEmailToggle;
