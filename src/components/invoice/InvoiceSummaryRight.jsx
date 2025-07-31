import React from 'react';

const InvoiceSummaryRight = ({
  subtotal,
  discountValue,
  discountType,
  onDiscountValueChange,
  onDiscountTypeChange,
  total
}) => {
  return (
    <div className="bg-white p-3 rounded border summary-right" style={{ minWidth: 320 }}>
      <input type="hidden" name="total_amount" value={total} />
      <input type="hidden" name="subtotal" value={subtotal} />
      <input type="hidden" name="line_total_price" value={subtotal} />
      <input type="hidden" name="internal_customer_notes" value="" />
      <input type="hidden" name="note_to_recipient" value="" />
      
      <div className="mb-3 d-flex align-items-center justify-content-between">
        <span>Subtotal</span>
        <div className="input-group" style={{ width: 120 }}>
          <span className="input-group-text">$</span>
          <input
            type="text"
            className="form-control"
            value={subtotal}
            readOnly
            style={{ background: '#f7f7f7' }}
          />
        </div>
      </div>
      <div className="mb-3 d-flex align-items-center justify-content-between">
        <span>Discount</span>
        <div className="input-group" style={{ width: 120 }}>
          <input
            type="number"
            className="form-control other_discountinput"
            value={discountValue}
            onChange={e => {
              let value = e.target.value;
              // If discountType is percentage (either '1' or '%'), apply restriction
              if (discountType === '%' || discountType === 1 || discountType === '1') {
                const parsed = parseFloat(value);
                if (value === '' || isNaN(parsed)) {
                  value = '';
                } else if (parsed > 100) {
                  value = 100;
                } else if (parsed < 0) {
                  value = '';
                }
              }
              onDiscountValueChange({ target: { value } });
            }}
            min="0"
            max="100"
            step="0.001"
            style={{ background: '#fff' }}
            onKeyDown={e => {
              if (e.key === 'e' || e.key === '+' || e.key === '-') {
                e.preventDefault();
              }
            }}
          />
          <select
            className="form-select right-summary-discount"
            value={discountType}
            onChange={onDiscountTypeChange}
            style={{ maxWidth: 60 }}
          >
            <option value="%">%</option>
            <option value="$">$</option>
          </select>
        </div>
      </div>
      <div className="mb-2 d-flex align-items-center justify-content-between">
        <strong>Invoice Total</strong>
        <strong style={{ fontSize: 20 }}>
          ${total}
        </strong>
      </div>
    </div>
  );
};

export default InvoiceSummaryRight; 