import RichTextEditor from "../RichTextEditorTiny";

const EmailReviewPane = ({
  sendEmail, setSendEmail,
  emailTo, setEmailTo,
  cc, setCc,
  bcc, setBcc,
  subject, setSubject,
  emailBody, setEmailBody
}) => (
  <>
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

    <div className="row">
      <div className="col-md-4">
        <label>To:</label>
        <input type="text" className="form-control" value={emailTo} onChange={e => setEmailTo(e.target.value)} />
      </div>
      <div className="col-md-4">
        <label>CC:</label>
        <input type="text" className="form-control" value={cc} onChange={e => setCc(e.target.value)} />
      </div>
      <div className="col-md-4">
        <label>Bcc:</label>
        <input type="text" className="form-control" value={bcc} onChange={e => setBcc(e.target.value)} />
      </div>
    </div>

    <div className="form-group mt-3">
      <label>Subject:*</label>
      <input type="text" className="form-control" value={subject} onChange={e => setSubject(e.target.value)} />
    </div>

    <div className="form-group mt-3">
      <label>Email Body</label>
      <RichTextEditor value={emailBody} onChange={setEmailBody} />
      <div className="text-muted mt-1">Use up to 3000 characters</div>
    </div>
  </>
);

export default EmailReviewPane;
