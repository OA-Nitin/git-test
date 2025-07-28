import React from 'react';
import Swal from 'sweetalert2';

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

const InvoiceProductSection = ({ services = [], setServices, availableProductServiceHeads = [], formData, formErrors, showError, handleFieldFocus, handleFieldBlur }) => {
  const [loadingProductIdx, setLoadingProductIdx] = React.useState(null);

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
      } else if (parsed > 100) {
        newValue = 100;
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
        let qty = parseFloat(updatedRow.quantity) || 0;
        let rate = parseFloat(updatedRow.price) || 0;
        let discount = parseFloat(updatedRow.discount) || 0;
        let tax = parseFloat(updatedRow.tax) || 0;
        let subtotal = qty * rate;
        let discountValue = updatedRow.discount_type === 1 ? subtotal * (discount / 100) : discount;
        let taxed = (subtotal - discountValue) * (tax / 100);
        updatedRow.amount = Math.max(0, (subtotal - discountValue + taxed).toFixed(2));
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

    // Get values directly from DOM by id
    const parentProduct = document.getElementById('invoice_parent_product')?.value || '';
    const leadId = document.getElementById('leadId')?.value || '';
    //const customerInvoiceNo = document.getElementById('customer_invoice_no')?.value || '';
    // Prepare API params
    const params = {
      parent_product: parentProduct,
      lead_id: leadId,
      product_name: optionName,
      product_id: value
    };
    try {
      const formBody = new URLSearchParams(params).toString();
      const response = await fetch('https://play.occamsadvisory.com/portal/wp-json/v1/invoice_erc_project_check_amount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody
      });
      const data = await response.json();
      if (data.result === 'success') {
        // Add the returned data to quantity
        setServices(prev => prev.map((row, i) => i === idx ? { ...row, product_id: value, quantity: Number(data.data) } : row));
      } else {
        // Show alert but allow selection
        await Swal.fire({
          icon: 'warning',
          text: data.data || 'Unknown error',
          confirmButtonText: 'Close',
          allowOutsideClick: false
        });
        // Still set the product_id as selected, do not revert
        setServices(prev => prev.map((row, i) => i === idx ? { ...row, product_id: value } : row));
      }
      setLoadingProductIdx(null);

      // --- New API call for erc_product_loOP_quarter_fetch ---
      // Get lead_id from hidden input
      const leadIdInput = document.getElementById('leadId');
      const lead_id = leadIdInput ? leadIdInput.value : '';
      // Get billingProfile from selected dropdown
      const billingProfileSelect = document.querySelector('select[name="billing_profile"]');
      const billingProfile = billingProfileSelect ? billingProfileSelect.value : '';
      if (value && billingProfile && lead_id) {
        const loopParams = new URLSearchParams({
          product_id: value,
          billingProfile: billingProfile,
          lead_id: lead_id
        }).toString();
        try {
          const loopResponse = await fetch('https://play.occamsadvisory.com/portal/wp-json/v1/erc_product_loOP_quarter_fetch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: loopParams
          });
          const loopData = await loopResponse.json();
          if (loopData.result === 'success') {
            //console.log('erc_product_loOP_quarter_fetch data:', loopData.data);
          }
        } catch (err) {
          console.error('Error calling erc_product_loOP_quarter_fetch:', err);
        }
      }
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        text: 'API error. Please try again.',
        confirmButtonText: 'Close',
        allowOutsideClick: false
      });
      setLoadingProductIdx(null);
    }
  };

  return (
    <div className="mt-4 mb-4">
      <h5 className="text-primary border-bottom pb-2 mb-3">Product or Service</h5>
      <div className="table-responsive">
        <table className="table table-bordered align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th>Product or Service*</th>
              <th>Description*</th>
              <th>Qty/Unit*</th>
              <th>Rate*</th>
              <th>Discount</th>
              <th>Tax %</th>
              <th>Amount*</th>
            </tr>
          </thead>
          <tbody className="product_table">
            {services.map((row, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>
                  <select
                    className="form-select product_name"
                    name="product_id"
                    value={row.product_id}
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
                          <option key={item.id} value={item.id} selected={String(item.selected) === '1'}>
                            {item.name}
                          </option>
                        ))
                      : availableProductServiceHeads.map(item => (
                          <option key={item.qb_product_id} value={item.qb_product_id}>
                            {item.product_head}
                          </option>
                        ))
                    )}
                  </select>
                  {showError(`services.${idx}.product_id`) && <span className="error-message">{formErrors[`services.${idx}.product_id`]}</span>}
                  {loadingProductIdx === idx && (
                    <p className="pname_fetch_loader loading__bar small_loading_bar"></p>
                  )}
                </td>
                <td>
                  <input
                    className="form-control"
                    name="description"
                    value={row.description}
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
                    value={row.quantity}
                    onChange={e => handleChange(idx, 'quantity', e.target.value)}
                    onFocus={handleFieldFocus}
                    onBlur={handleFieldBlur}
                    onKeyDown={e => {
                      // Allow: backspace, delete, tab, escape, enter, arrows, dot
                      if (
                        ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "."].includes(e.key)
                      ) {
                        return;
                      }
                      // Prevent: anything that's not a number
                      if (!/^[0-9]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  {showError(`services.${idx}.quantity`) && <span className="error-message">{formErrors[`services.${idx}.quantity`]}</span>}
                  <select
                    className="form-select"
                    style={{ width: 60 }}
                    name="qty_type"
                    value={row.qty_type}
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
                    value={row.price}
                    onChange={e => handleChange(idx, 'price', e.target.value)}
                    onFocus={handleFieldFocus}
                    onBlur={handleFieldBlur}
                    onKeyDown={e => {
                      // Allow: backspace, delete, tab, escape, enter, arrows, dot
                      if (
                        ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "."].includes(e.key)
                      ) {
                        return;
                      }
                      // Prevent: anything that's not a number
                      if (!/^[0-9]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
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
                      // Allow: backspace, delete, tab, escape, enter, arrows, dot
                      if (
                        ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "."].includes(e.key)
                      ) {
                        return;
                      }
                      // Prevent: anything that's not a number
                      if (!/^[0-9]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  <select
                    className="form-select discount_type"
                    style={{ width: 55 }}
                    name="discount_type"
                    value={row.discount_type}
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
                    className="form-control line_tax"
                    style={{ width: 70 }}
                    name="tax"
                    value={row.tax}
                    onChange={e => handleChange(idx, 'tax', e.target.value)}
                    onKeyDown={e => {
                      // Allow: backspace, delete, tab, escape, enter, arrows, dot
                      if (
                        ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "."].includes(e.key)
                      ) {
                        return;
                      }
                      // Prevent: anything that's not a number
                      if (!/^[0-9]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
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
                    onKeyDown={e => {
                      // Allow: backspace, delete, tab, escape, enter, arrows, dot
                      if (
                        ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "."].includes(e.key)
                      ) {
                        return;
                      }
                      // Prevent: anything that's not a number
                      if (!/^[0-9]$/.test(e.key)) {
                        e.preventDefault();
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

export default InvoiceProductSection; 