import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './DateRangePicker.css';

/**
 * DateRangePicker - A calendar-based date range picker with preset options
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onApplyFilter - Function to call when filter is applied (receives startDate and endDate)
 * @param {string} props.startDate - Initial start date (YYYY-MM-DD format)
 * @param {string} props.endDate - Initial end date (YYYY-MM-DD format)
 * @returns {JSX.Element} - The DateRangePicker component
 */
const DateRangePicker = ({
  onApplyFilter,
  startDate: initialStartDate = '',
  endDate: initialEndDate = ''
}) => {
  // State for input field values
  const [inputStartDate, setInputStartDate] = useState(initialStartDate);
  const [inputEndDate, setInputEndDate] = useState(initialEndDate);
  
  // State for calendar view
  const [showCalendar, setShowCalendar] = useState(false);
  const [startMonth, setStartMonth] = useState(new Date());
  const [endMonth, setEndMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(initialStartDate ? new Date(initialStartDate) : null);
  const [selectedEndDate, setSelectedEndDate] = useState(initialEndDate ? new Date(initialEndDate) : null);
  const [hoverDate, setHoverDate] = useState(null);
  const [activePreset, setActivePreset] = useState('');
  
  // Refs
  const calendarRef = useRef(null);
  
  // Initialize with current dates if provided
  useEffect(() => {
    if (initialStartDate) {
      setSelectedStartDate(new Date(initialStartDate));
      setInputStartDate(initialStartDate);
      
      // Set start month to the month of the start date
      const startDate = new Date(initialStartDate);
      setStartMonth(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
    }
    
    if (initialEndDate) {
      setSelectedEndDate(new Date(initialEndDate));
      setInputEndDate(initialEndDate);
      
      // Set end month to the month of the end date
      const endDate = new Date(initialEndDate);
      setEndMonth(new Date(endDate.getFullYear(), endDate.getMonth(), 1));
    }
  }, [initialStartDate, initialEndDate]);
  
  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Format date as YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get day of week (0-6, where 0 is Sunday)
  const getDayOfWeek = (year, month, day) => {
    return new Date(year, month, day).getDay();
  };
  
  // Generate calendar days for a month
  const generateCalendarDays = (year, month) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfWeek = getDayOfWeek(year, month, 1);
    
    // Get days from previous month to fill the first row
    const daysFromPrevMonth = firstDayOfWeek;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
    
    const prevMonthDays = [];
    for (let i = 0; i < daysFromPrevMonth; i++) {
      const day = daysInPrevMonth - daysFromPrevMonth + i + 1;
      prevMonthDays.push({
        day,
        month: prevMonth,
        year: prevMonthYear,
        isCurrentMonth: false
      });
    }
    
    // Current month days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        day: i,
        month,
        year,
        isCurrentMonth: true
      });
    }
    
    // Next month days to fill the last row
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const daysNeeded = Math.ceil(totalDays / 7) * 7;
    const daysFromNextMonth = daysNeeded - totalDays;
    
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    
    const nextMonthDays = [];
    for (let i = 1; i <= daysFromNextMonth; i++) {
      nextMonthDays.push({
        day: i,
        month: nextMonth,
        year: nextMonthYear,
        isCurrentMonth: false
      });
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };
  
  // Check if a date is selected
  const isDateSelected = (day, month, year) => {
    if (!selectedStartDate && !selectedEndDate) return false;
    
    const date = new Date(year, month, day);
    
    if (selectedStartDate && selectedEndDate) {
      return date >= selectedStartDate && date <= selectedEndDate;
    }
    
    if (selectedStartDate && !selectedEndDate) {
      return date.getTime() === selectedStartDate.getTime();
    }
    
    return false;
  };
  
  // Check if a date is the start date
  const isStartDate = (day, month, year) => {
    if (!selectedStartDate) return false;
    
    const date = new Date(year, month, day);
    return date.getTime() === selectedStartDate.getTime();
  };
  
  // Check if a date is the end date
  const isEndDate = (day, month, year) => {
    if (!selectedEndDate) return false;
    
    const date = new Date(year, month, day);
    return date.getTime() === selectedEndDate.getTime();
  };
  
  // Check if a date is in hover range
  const isInHoverRange = (day, month, year) => {
    if (!selectedStartDate || !hoverDate || selectedEndDate) return false;
    
    const date = new Date(year, month, day);
    return date > selectedStartDate && date <= hoverDate;
  };
  
  // Handle date click
  const handleDateClick = (day, month, year) => {
    const clickedDate = new Date(year, month, day);
    
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Start a new selection
      setSelectedStartDate(clickedDate);
      setSelectedEndDate(null);
      setInputStartDate(formatDate(clickedDate));
      setInputEndDate('');
    } else {
      // Complete the selection
      if (clickedDate < selectedStartDate) {
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(clickedDate);
        setInputStartDate(formatDate(clickedDate));
        setInputEndDate(formatDate(selectedStartDate));
      } else {
        setSelectedEndDate(clickedDate);
        setInputEndDate(formatDate(clickedDate));
      }
    }
  };
  
  // Handle date hover
  const handleDateHover = (day, month, year) => {
    if (selectedStartDate && !selectedEndDate) {
      setHoverDate(new Date(year, month, day));
    }
  };
  
  // Handle month navigation
  const navigateMonth = (calendar, direction) => {
    if (calendar === 'start') {
      const newMonth = new Date(startMonth);
      newMonth.setMonth(newMonth.getMonth() + direction);
      setStartMonth(newMonth);
    } else {
      const newMonth = new Date(endMonth);
      newMonth.setMonth(newMonth.getMonth() + direction);
      setEndMonth(newMonth);
    }
  };
  
  // Apply the filter
  const applyFilter = () => {
    onApplyFilter(inputStartDate, inputEndDate);
    setShowCalendar(false);
  };
  
  // Cancel and close the calendar
  const handleCancel = () => {
    // Reset to initial values
    setSelectedStartDate(initialStartDate ? new Date(initialStartDate) : null);
    setSelectedEndDate(initialEndDate ? new Date(initialEndDate) : null);
    setInputStartDate(initialStartDate);
    setInputEndDate(initialEndDate);
    setShowCalendar(false);
  };
  
  // Apply preset date range
  const applyPreset = (preset) => {
    setActivePreset(preset);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let start, end;
    
    switch (preset) {
      case 'today':
        start = end = new Date(today);
        break;
      case 'yesterday':
        start = end = new Date(today);
        start.setDate(start.getDate() - 1);
        end = new Date(start);
        break;
      case 'last7Days':
        end = new Date(today);
        start = new Date(today);
        start.setDate(start.getDate() - 6);
        break;
      case 'last30Days':
        end = new Date(today);
        start = new Date(today);
        start.setDate(start.getDate() - 29);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today);
        break;
      case 'lastYear':
        start = new Date(today.getFullYear() - 1, 0, 1);
        end = new Date(today.getFullYear() - 1, 11, 31);
        break;
      case 'allTime':
        start = end = null;
        break;
      default:
        return;
    }
    
    setSelectedStartDate(start);
    setSelectedEndDate(end);
    setInputStartDate(start ? formatDate(start) : '');
    setInputEndDate(end ? formatDate(end) : '');
    
    if (start) {
      setStartMonth(new Date(start.getFullYear(), start.getMonth(), 1));
    }
    
    if (end) {
      setEndMonth(new Date(end.getFullYear(), end.getMonth(), 1));
    }
  };
  
  // Get month name
  const getMonthName = (date) => {
    return date.toLocaleString('default', { month: 'short' });
  };
  
  return (
    <div className="date-range-picker">
      <div className="date-range-input" onClick={() => setShowCalendar(!showCalendar)}>
        <input 
          type="text" 
          value={`${formatDisplayDate(inputStartDate)}${inputStartDate && inputEndDate ? ' - ' : ''}${formatDisplayDate(inputEndDate)}`}
          readOnly
          placeholder="Select date range"
        />
        <button className="filter-button">Filter</button>
      </div>
      
      {showCalendar && (
        <div className="date-range-calendar" ref={calendarRef}>
          <div className="calendar-container">
            <div className="preset-options">
              <div className={`preset-option ${activePreset === 'today' ? 'active' : ''}`} onClick={() => applyPreset('today')}>Today</div>
              <div className={`preset-option ${activePreset === 'yesterday' ? 'active' : ''}`} onClick={() => applyPreset('yesterday')}>Yesterday</div>
              <div className={`preset-option ${activePreset === 'last7Days' ? 'active' : ''}`} onClick={() => applyPreset('last7Days')}>Last 7 Days</div>
              <div className={`preset-option ${activePreset === 'last30Days' ? 'active' : ''}`} onClick={() => applyPreset('last30Days')}>Last 30 Days</div>
              <div className={`preset-option ${activePreset === 'thisMonth' ? 'active' : ''}`} onClick={() => applyPreset('thisMonth')}>This Month</div>
              <div className={`preset-option ${activePreset === 'lastMonth' ? 'active' : ''}`} onClick={() => applyPreset('lastMonth')}>Last Month</div>
              <div className={`preset-option ${activePreset === 'thisYear' ? 'active' : ''}`} onClick={() => applyPreset('thisYear')}>This Year</div>
              <div className={`preset-option ${activePreset === 'lastYear' ? 'active' : ''}`} onClick={() => applyPreset('lastYear')}>Last Year</div>
              <div className={`preset-option ${activePreset === 'allTime' ? 'active' : ''}`} onClick={() => applyPreset('allTime')}>All time</div>
              <div className={`preset-option ${activePreset === 'customRange' ? 'active' : ''}`} onClick={() => setActivePreset('customRange')}>Custom Range</div>
            </div>
            
            <div className="calendars-wrapper">
              <div className="date-inputs">
                <div className="date-input-group">
                  <input
                    type="text"
                    value={formatDisplayDate(inputStartDate)}
                    readOnly
                    placeholder="Start Date"
                  />
                </div>
                <div className="date-input-group">
                  <input
                    type="text"
                    value={formatDisplayDate(inputEndDate)}
                    readOnly
                    placeholder="End Date"
                  />
                </div>
              </div>
              
              <div className="calendars">
                {/* Start Month Calendar */}
                <div className="calendar">
                  <div className="calendar-header">
                    <button className="nav-button" onClick={() => navigateMonth('start', -1)}>
                      <span>‹</span>
                    </button>
                    <div className="month-year">
                      <span className="month">{getMonthName(startMonth)}</span>
                      <select 
                        value={startMonth.getFullYear()} 
                        onChange={(e) => setStartMonth(new Date(parseInt(e.target.value), startMonth.getMonth(), 1))}
                      >
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <button className="nav-button" onClick={() => navigateMonth('start', 1)}>
                      <span>›</span>
                    </button>
                  </div>
                  
                  <div className="calendar-body">
                    <div className="weekdays">
                      <div>Su</div>
                      <div>Mo</div>
                      <div>Tu</div>
                      <div>We</div>
                      <div>Th</div>
                      <div>Fr</div>
                      <div>Sa</div>
                    </div>
                    
                    <div className="days">
                      {generateCalendarDays(startMonth.getFullYear(), startMonth.getMonth()).map((day, index) => (
                        <div
                          key={index}
                          className={`day ${!day.isCurrentMonth ? 'other-month' : ''} ${
                            isDateSelected(day.day, day.month, day.year) ? 'selected' : ''
                          } ${isStartDate(day.day, day.month, day.year) ? 'start-date' : ''} ${
                            isEndDate(day.day, day.month, day.year) ? 'end-date' : ''
                          } ${isInHoverRange(day.day, day.month, day.year) ? 'hover-range' : ''}`}
                          onClick={() => handleDateClick(day.day, day.month, day.year)}
                          onMouseEnter={() => handleDateHover(day.day, day.month, day.year)}
                        >
                          {day.day}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* End Month Calendar */}
                <div className="calendar">
                  <div className="calendar-header">
                    <button className="nav-button" onClick={() => navigateMonth('end', -1)}>
                      <span>‹</span>
                    </button>
                    <div className="month-year">
                      <span className="month">{getMonthName(endMonth)}</span>
                      <select 
                        value={endMonth.getFullYear()} 
                        onChange={(e) => setEndMonth(new Date(parseInt(e.target.value), endMonth.getMonth(), 1))}
                      >
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <button className="nav-button" onClick={() => navigateMonth('end', 1)}>
                      <span>›</span>
                    </button>
                  </div>
                  
                  <div className="calendar-body">
                    <div className="weekdays">
                      <div>Su</div>
                      <div>Mo</div>
                      <div>Tu</div>
                      <div>We</div>
                      <div>Th</div>
                      <div>Fr</div>
                      <div>Sa</div>
                    </div>
                    
                    <div className="days">
                      {generateCalendarDays(endMonth.getFullYear(), endMonth.getMonth()).map((day, index) => (
                        <div
                          key={index}
                          className={`day ${!day.isCurrentMonth ? 'other-month' : ''} ${
                            isDateSelected(day.day, day.month, day.year) ? 'selected' : ''
                          } ${isStartDate(day.day, day.month, day.year) ? 'start-date' : ''} ${
                            isEndDate(day.day, day.month, day.year) ? 'end-date' : ''
                          } ${isInHoverRange(day.day, day.month, day.year) ? 'hover-range' : ''}`}
                          onClick={() => handleDateClick(day.day, day.month, day.year)}
                          onMouseEnter={() => handleDateHover(day.day, day.month, day.year)}
                        >
                          {day.day}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="calendar-footer">
            <button className="apply-button" onClick={applyFilter}>Apply</button>
            <button className="cancel-button" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

DateRangePicker.propTypes = {
  onApplyFilter: PropTypes.func.isRequired,
  startDate: PropTypes.string,
  endDate: PropTypes.string
};

export default DateRangePicker;
