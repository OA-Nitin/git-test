import React from 'react';
import Swal from 'sweetalert2';
import { useRef } from 'react';

const defaultProductRow = {
  product_id: '',
  description: '',
  quantity: 1,
  qty_type: 'Qty',
  price: '',
  discount: '',
  discount_type: 1,
  tax: '',
  amount: 0
};

const unitOptions = ['Qty', 'Unit'];
const discountTypes = [
  { label: '%', value: 1 },
  { label: '$', value: 2 }
];

const InvoiceEditProductSection = ({ services = [], setServices, formData, formErrors, showError, handleFieldFocus, handleFieldBlur }) => {
  const [loadingProductIdx, setLoadingProductIdx] = React.useState(null);
  const [availableProductServiceHeads, setAvailableProductServiceHeads] = React.useState([]);
  const productTableRef = useRef(null);
  const [refreshLoading, setRefreshLoading] = React.useState(false);

  // Initialize services from formData.products if present
  React.useEffect(() => {
    if (Array.isArray(formData.products) && formData.products.length > 0) {
      const mapped = formData.products.map(product => ({
        product_id: product.product_id || '',
        product_name: product.product_name || '',
        description: product.product_desc || '',
        quantity: product.quantity || 1,
        qty_type: product.qty_type || 'Qty',
        price: product.price || '',
        discount: product.discount || '',
        discount_type: product.discount_type || 1,
        tax: product.tax || '',
        amount: product.amount || 0,
      }));
      setServices(mapped);
    }
  }, [formData.products, setServices]);
  //console.log('productss data');
  //console.log(formData.products);

  // Fetch product/service heads on mount or when parent product/billing profile changes
  React.useEffect(() => {
    const fetchProductServiceHeads = async () => {
      if (formData.invoice_parent_product && formData.billing_profile) {
        try {
          const formBody = new URLSearchParams({
            product_id: formData.invoice_parent_product,
            billing_profile: formData.billing_profile
          }).toString();
          const response = await fetch('https://play.occamsadvisory.com/portal/wp-json/productsplugin/v1/product-service-head-list', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formBody
          });
          const data = await response.json();
          setAvailableProductServiceHeads(Array.isArray(data) ? data : []);
        } catch (error) {
          setAvailableProductServiceHeads([]);
        }
      } else {
        setAvailableProductServiceHeads([]);
      }
    };
    fetchProductServiceHeads();
  }, [formData.invoice_parent_product, formData.billing_profile]);

  // Add a new product row
  const handleAddRow = () => {
    setServices([
      ...services,
      { ...defaultProductRow }
    ]);
  };

  // Remove a product row (except the first)
  const handleRemoveRow = (idx) => {
    if (idx > 0) {
      setServices(services.filter((_, i) => i !== idx));
    }
  };

  // Handle field change
  const handleChange = (idx, field, value) => {
    let newValue = value;
    if (field === 'discount') {
      // Get the discount type for this row
      const discountType = services[idx]?.discount_type;
      if (discountType === 1 || discountType === '1') {
        const parsed = parseFloat(value);
        if (value === '' || isNaN(parsed)) {
          newValue = '';
        } else if (parsed > 100) {
          newValue = 100;
        } else if (parsed < 0) {
          newValue = '';
        }
      }
    }
    if (field === 'tax') {
      const parsed = parseFloat(value);
      if (value === '' || isNaN(parsed)) {
        newValue = '';
      } else if (parsed < 0) {
        newValue = '';
      }
    }
    const updatedRows = services.map((row, i) => {
      if (i === idx) {
        let updatedRow = { ...row, [field]: newValue };
        if (field === 'amount') {
          updatedRow.quantity = 1;
          updatedRow.price = newValue;
          updatedRow.discount = '';
          updatedRow.tax = '';
          // Store raw value for now, format on blur
          updatedRow.amount = newValue;
          return updatedRow;
        }
        // Calculate amount for other fields
        const qty = parseFloat(updatedRow.quantity) || 0;
        const rate = parseFloat(updatedRow.price) || 0;
        const discount = parseFloat(updatedRow.discount) || 0;
        const tax = parseFloat(updatedRow.tax) || 0;
        const subtotal = qty * rate;
        const discountValue = Number(updatedRow.discount_type) === 1 ? subtotal * (discount / 100) : discount;
        const totalAfterDiscount = subtotal - discountValue;
        const taxValue = totalAfterDiscount * (tax / 100);
        updatedRow.amount = parseFloat((totalAfterDiscount + taxValue).toFixed(2));
        return updatedRow;
      }
      return row;
    });
    setServices(updatedRows);
  };

  // Helper to handle product change with API call
  const handleProductChange = async (idx, value, optionName) => {
    setLoadingProductIdx(idx);
    // Check for duplicate product selection, only if a value is selected
    if (value && services.some((row, i) => i !== idx && row.product_id === value)) {
      await Swal.fire({
        icon: 'error',
        text: 'This product is already selected',
        confirmButtonText: 'Close',
        allowOutsideClick: false,
      });
      // Revert the dropdown by forcing a re-render from state
      setServices(currentServices => [...currentServices]);
      setLoadingProductIdx(null);
      return;
    }
    // New: Call API to get quantity
    const parent_product = formData.invoice_parent_product || document.getElementById('invoice_parent_product')?.value || '';
    const lead_id = formData.leadId || formData.lead || document.getElementById('leadId')?.value || '';
    const customer_invoice_no = formData.customer_invoice_no || document.getElementById('customer_invoice_no')?.value || '';
    const product_name = optionName;
    const product_id = value;
    try {
      const params = new URLSearchParams({
        parent_product,
        lead_id,
        customer_invoice_no,
        product_name,
        product_id
      });
      const response = await fetch('https://play.occamsadvisory.com/portal/wp-json/v1/invoice_erc_project_check_amount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      const data = await response.json();
      if (data.result === 'success' && data.data) {
        // Set the returned data as the quantity for this row
        setServices(prev => prev.map((row, i) => i === idx ? { ...row, product_id: value, quantity: data.data } : row));
      } else {
        await Swal.fire({
          icon: 'error',
          text: data.data || 'Failed to fetch quantity.',
          confirmButtonText: 'Close',
          allowOutsideClick: false
        });
        // Still update the product_id, but not quantity
        setServices(prev => prev.map((row, i) => i === idx ? { ...row, product_id: value } : row));
      }
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        text: 'An error occurred while fetching quantity.',
        confirmButtonText: 'Close',
        allowOutsideClick: false
      });
      setServices(prev => prev.map((row, i) => i === idx ? { ...row, product_id: value } : row));
    }
    setLoadingProductIdx(null);
  };

  // Fetch Updated Quarters handler
  const handleFetchUpdatedQuarters = async () => {
    setRefreshLoading(true);
    const parent_product_id = formData.invoice_parent_product || document.getElementById('invoice_parent_product')?.value || '';
    const lead_id = formData.leadId || formData.lead || document.getElementById('leadId')?.value || '';
    const customer_invoice_no = formData.customer_invoice_no || document.getElementById('getCustomerId')?.value || '';
    const invoice_id = formData.invoice_id || document.getElementById('getInvoiceId')?.value || '';
    try {
      const params = new URLSearchParams({
        parent_product_id,
        lead_id,
        customer_invoice_no,
        invoice_id
      });
      const response = await fetch('https://play.occamsadvisory.com/portal/wp-json/v1/fetch_updated_erc_loOP_quarter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      const data = await response.json();
      if (data.result === 'success' && Array.isArray(data.jsondata)) {
        const newRows = data.jsondata.map(row => {
          const selectedOption = row.product_options.find(opt => String(opt.selected) === '1');
          return {
            product_id: selectedOption ? selectedOption.id : row.product_id || '',
            product_options: row.product_options || [],
            product_name: row.product_name || '',
            description: row.description || '',
            quantity: row.quantity !== undefined ? row.quantity : 1,
            qty_type: row.qty_type || 'Qty',
            price: row.price !== undefined ? row.price : '',
            discount: row.discount || '',
            discount_type: row.discount_type || 1,
            tax: row.tax || '',
            amount: row.amount || '',
            currency: row.currency || '$',
          };
        });
        setServices(prev => [...prev, ...newRows]);
      } else {
        await Swal.fire({
          icon: 'error',
          text: data.message || 'Failed to fetch updated quarters.',
          confirmButtonText: 'Close',
          allowOutsideClick: false
        });
      }
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        text: 'An error occurred while fetching updated quarters.',
        confirmButtonText: 'Close',
        allowOutsideClick: false
      });
    } finally {
      setRefreshLoading(false);
    }
  };

  return (
    <div className="mt-4 mb-4">
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 500, marginRight: 8 }}>Fetch Updated Quarters:</span>
        <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleFetchUpdatedQuarters} title="Fetch Updated Quarters" disabled={refreshLoading}>
          <i className={`fas fa-sync-alt${refreshLoading ? ' spin-refresh' : ''}`}></i>
        </button>
      </div>
      <h5 className="text-primary border-bottom pb-2 mb-3">Product or Service</h5>
      <div className="table-responsive">
        <table className="table table-bordered align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th>Product or Service*</th>
              <th>Description</th>
              <th>Qty/Unit*</th>
              <th>Rate*</th>
              <th>Discount</th>
              <th>Tax %</th>
              <th>Amount*</th>
            </tr>
          </thead>
          <tbody className="product_table" ref={productTableRef}>
            {/*console.log('services:')}
            {console.log(services)*/}
            {services.map((row, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>
                  <select
                    className="form-select product_name"
                    name="product_id"
                    value={row.product_id || ''}
                    onChange={async e => {
                      const selectedOption = e.target.options[e.target.selectedIndex];
                      const optionName = selectedOption.text;
                      await handleProductChange(idx, e.target.value, optionName);
                    }}
                    onFocus={handleFieldFocus}
                    onBlur={handleFieldBlur}
                  >
                    <option value="">Select Product or Service</option>
                    {(row.product_options && row.product_options.length > 0
                      ? row.product_options.map(item => (
                          <option key={item.id} value={item.id || ''}>
                            {item.name}
                          </option>
                        ))
                      : availableProductServiceHeads.map(item => (
                          <option key={item.qb_product_id} value={item.qb_product_id || ''}>
                            {item.product_head}
                          </option>
                        ))
                    )}
                  </select>
                  {showError(`services.${idx}.product_id`) && <span className="error-message">{formErrors[`services.${idx}.product_id`]}</span>}
                  {loadingProductIdx === idx && (
                    <div className="text-left">
                    <svg className="loader_small" viewBox="0 0 200 100">
                    <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#007bff" />
                    <stop offset="100%" stopColor="#ff6600" />
                    </linearGradient>
                    </defs>
                    <path className="infinity-shape"
                        d="M30,50
                        C30,20 70,20 100,50
                        C130,80 170,80 170,50
                        C170,20 130,20 100,50
                        C70,80 30,80 30,50"
                      />
                    </svg>
                  </div>
                  )}
                </td>
                <td>
                  <input
                    className="form-control"
                    name="description"
                    value={row.description || ''}
                    onChange={e => handleChange(idx, 'description', e.target.value)}
                    placeholder="Description"
                  />
                </td>
                <td className='d-flex quantity-box'>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    style={{ width: 60 }}
                    name="quantity"
                    value={row.quantity || ''}
                    onChange={e => handleChange(idx, 'quantity', e.target.value)}
                    onFocus={handleFieldFocus}
                    onBlur={handleFieldBlur}
                  />
                  {showError(`services.${idx}.quantity`) && <span className="error-message">{formErrors[`services.${idx}.quantity`]}</span>}
                  <select
                    className="form-select"
                    style={{ width: 60 }}
                    name="qty_type"
                    value={row.qty_type || ''}
                    onChange={e => handleChange(idx, 'qty_type', e.target.value)}
                    onFocus={handleFieldFocus}
                    onBlur={handleFieldBlur}
                  >
                    {unitOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
                <td style={{ width: 140 }} className='rate-box'>
                 <input className="form-control country-currency"  style={{ width: 25, display: 'inline-block' }} name='currency' type="text" value="$" readOnly />
                  <input
                    type="number"
                    min="0"
                    className="form-control rate_currency"
                    style={{ width: 80, display: 'inline-block'}}
                    name="price"
                    value={row.price || ''}
                    onChange={e => handleChange(idx, 'price', e.target.value)}
                    onFocus={handleFieldFocus}
                    onBlur={handleFieldBlur}
                  />
                  {showError(`services.${idx}.price`) && <span className="error-message">{formErrors[`services.${idx}.price`]}</span>}
                </td>
                <td className='d-flex discount-box'> 
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.001"
                    className="form-control discountinput"
                    style={{ width: 60 }}
                    name="discount"
                    value={row.discount}
                    onChange={e => handleChange(idx, 'discount', e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'e' || e.key === '+' || e.key === '-') {
                        e.preventDefault();
                      }
                    }}
                  />
                  <select
                    className="form-select right-summary-discount"
                    style={{ width: 55 }}
                    name="discount_type"
                    value={row.discount_type || ''}
                    onChange={e => handleChange(idx, 'discount_type', Number(e.target.value))}
                  >
                    {discountTypes.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.001"
                    className="form-control line_tax  "
                    style={{ width: 70 }}
                    name="tax"
                    value={row.tax || ''}
                    onChange={e => handleChange(idx, 'tax', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="form-control"
                    name="amount"
                    value={row.amount !== undefined && row.amount !== '' ? row.amount : ''}
                    onChange={e => handleChange(idx, 'amount', e.target.value)}
                    placeholder="0.00"
                    onFocus={handleFieldFocus}
                    onBlur={e => {
                      let val = e.target.value;
                      if (val !== '' && !isNaN(val)) {
                        handleChange(idx, 'amount', Number(val).toFixed(2));
                      } else {
                        handleFieldBlur && handleFieldBlur(e);
                      }
                    }}
                  />
                  {showError(`services.${idx}.amount`) && <span className="error-message">{formErrors[`services.${idx}.amount`]}</span>}
                </td>
                <td>
                  {idx > 0 && (
                    <button
                      type="button"
                      className="btn btn-link text-danger"
                      onClick={() => handleRemoveRow(idx)}
                      tabIndex={-1}
                      style={{ padding: 0 }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p
        className="add-product_btn mt-1"
        style={{ cursor: 'pointer', width: 'fit-content' }}
        onClick={handleAddRow}
      >
        <i className="fa fa-plus"></i> Add Product or service
      </p>
    </div>
  );
};

export default InvoiceEditProductSection; 