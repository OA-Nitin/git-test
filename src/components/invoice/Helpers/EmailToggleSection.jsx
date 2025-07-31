// EmailToggleSection.jsx
import React from 'react';
import EmailReviewPane from './EmailReviewPane';
import SendEmailToggle from './SendEmailToggle';

const EmailToggleSection = React.forwardRef(({
  sendEmail, setSendEmail,
  emailTo, setEmailTo,
  cc, setCc,
  bcc, setBcc,
  subject, setSubject,
  emailBody, setEmailBody,
  emailUpdateNote, setEmailUpdateNote,
  onNoteValidationChange
}, ref) => {
  return (
    <div className="email-toggle-section mt-4">
      <h5 className="section-title">Email Review Pane</h5>
      <div className="form-check d-flex align-items-center mb-3">
        <input
          className="form-check-input me-2"
          type="checkbox"
          checked={sendEmail}
          onChange={(e) => setSendEmail(e.target.checked)}
        />
        <label className="form-check-label">Send Email Update to Client</label>
      </div>

      {sendEmail ? (
        <EmailReviewPane
          sendEmail={sendEmail}
          setSendEmail={setSendEmail}
          emailTo={emailTo}
          setEmailTo={setEmailTo}
          cc={cc}
          setCc={setCc}
          bcc={bcc}
          setBcc={setBcc}
          subject={subject}
          setSubject={setSubject}
          emailBody={emailBody}
          setEmailBody={setEmailBody}
        />
      ) : (
        <SendEmailToggle
          ref={ref}
          sendEmail={sendEmail}
          emailUpdateNote={emailUpdateNote}
          setEmailUpdateNote={setEmailUpdateNote}
          onValidationChange={onNoteValidationChange}
        />
      )}
    </div>
  );
});

export default EmailToggleSection;
