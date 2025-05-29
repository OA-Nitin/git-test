// Make sure the DateRangePicker in ReportFilter.jsx is properly implemented
// This assumes you have a DateRangePicker component

// In the DateRangePicker component or its wrapper
const handleDateChange = (dates) => {
  console.log('Date picker changed:', dates);
  
  // Extract start and end dates
  const [start, end] = dates;
  
  // Format dates as strings if they exist
  const startStr = start ? start.toISOString().split('T')[0] : '';
  const endStr = end ? end.toISOString().split('T')[0] : '';
  
  // Call the parent handler
  handleApplyDateFilter(startStr, endStr);
};

// Make sure the DateRangePicker is using the correct values
<DatePicker
  selected={startDate ? new Date(startDate) : null}
  onChange={handleDateChange}
  startDate={startDate ? new Date(startDate) : null}
  endDate={endDate ? new Date(endDate) : null}
  selectsRange
  isClearable
  placeholderText="Select date range"
  className="form-control"
/>