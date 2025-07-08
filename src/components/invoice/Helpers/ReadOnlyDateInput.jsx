import React, { forwardRef } from 'react';

const ReadOnlyDateInput = forwardRef(({ value, onClick, onBlur, className }, ref) => (
  <input
    className={`form-control ${className || ''}`}
    onClick={onClick}
    value={value}
    onBlur={onBlur}
    readOnly
    ref={ref}
    placeholder="MM/DD/YYYY"
    style={{ cursor: 'pointer', backgroundColor: '#fff' }}
  />
));

export default ReadOnlyDateInput;
