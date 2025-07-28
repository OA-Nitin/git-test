import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const InvoiceView = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`/api/invoices/${id}`)
      .then((res) => {
        setInvoice(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load invoice.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;
  if (!invoice) return <div>No invoice found.</div>;

  return (
    <div className="container" style={{maxWidth: 600, margin: '2rem auto'}}>
      <h2>Invoice View - #{invoice.invoice_no}</h2>
      <table className="table table-bordered">
        <tbody>
          <tr><th>Customer</th><td>{invoice.customer_name}</td></tr>
          <tr><th>Date</th><td>{invoice.invoice_date}</td></tr>
          <tr><th>Amount</th><td>${invoice.total_amount}</td></tr>
          {invoice.status && <tr><th>Status</th><td>{invoice.status}</td></tr>}
          {invoice.description && <tr><th>Description</th><td>{invoice.description}</td></tr>}
          {/* Add more fields as needed */}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceView;
