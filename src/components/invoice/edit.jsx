import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const InvoiceEdit = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`/api/invoices/${id}`)
      .then((res) => {
        setInvoice(res.data);
        setForm(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load invoice.");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    // Basic validation
    if (!form.customer_name || !form.total_amount) {
      setError("Customer name and total amount are required.");
      setSubmitting(false);
      return;
    }
    axios.put(`/api/invoices/${id}`, form)
      .then(() => {
        setSuccess("Invoice updated successfully.");
        setSubmitting(false);
      })
      .catch(() => {
        setError("Failed to update invoice.");
        setSubmitting(false);
      });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;
  if (!invoice) return <div>No invoice found.</div>;

  return (
    <div className="container" style={{maxWidth: 600, margin: '2rem auto'}}>
      <h2>Edit Invoice #{invoice.invoice_no}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Customer Name:</label>
          <input name="customer_name" value={form.customer_name || ''} onChange={handleChange} className="form-control" required />
        </div>
        <div className="mb-3">
          <label>Total Amount:</label>
          <input name="total_amount" type="number" value={form.total_amount || ''} onChange={handleChange} className="form-control" required />
        </div>
        {/* Add more fields as required */}
        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
        {success && <div className="alert alert-success mt-2">{success}</div>}
        {error && <div className="alert alert-danger mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default InvoiceEdit;
