import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaChevronDown } from 'react-icons/fa';
import { categories } from '../constants/categories';
import '../styles/DateRangeFilter.css';

const DateRangeFilter = ({ onFilterChange }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');

  // Helper function to format date to YYYY-MM-DD
  const formatDate = (dateString, isEndDate = false) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    // If it's a month input (YYYY-MM)
    if (dateString.length === 7) {
      if (isEndDate) {
        // For end date, get the last day of the month
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const lastDay = new Date(year, month, 0).getDate();
        return `${dateString}-${lastDay}`;
      } else {
        // For start date, use the first day of the month
        return `${dateString}-01`;
      }
    }
    return dateString;
  };

  // Set default end date to today when component mounts
  useEffect(() => {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    setEndDate(formattedToday);
  }, []);

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    const formattedStartDate = formatDate(newStartDate, false);
    const formattedEndDate = formatDate(endDate, true);
    onFilterChange(formattedStartDate, formattedEndDate, category);
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    const formattedStartDate = formatDate(startDate, false);
    const formattedEndDate = formatDate(newEndDate, true);
    onFilterChange(formattedStartDate, formattedEndDate, category);
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    const formattedStartDate = formatDate(startDate, false);
    const formattedEndDate = formatDate(endDate, true);
    onFilterChange(formattedStartDate, formattedEndDate, newCategory);
  };

  const handleReset = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate('');
    setEndDate(today);
    setCategory('');
    onFilterChange('', today, '');
  };

  return (
    <div className="date-range-filter">
      <div className="filter-header">
        <h3>Filter Transactions</h3>
        <button className="reset-button" onClick={handleReset}>
          Reset
        </button>
      </div>
      <div className="filter-content">
        <div className="date-inputs">
          <div className="date-input-group">
            <input
              type="month"
              value={startDate}
              onChange={handleStartDateChange}
              className="date-input"
              max={endDate ? endDate.substring(0, 7) : undefined}
              placeholder="Start Month"
            />
            <FaCalendarAlt className="date-icon" />
          </div>
          <span className="date-separator">to</span>
          <div className="date-input-group">
            <input
              type="month"
              value={endDate ? endDate.substring(0, 7) : ''}
              onChange={handleEndDateChange}
              className="date-input"
              min={startDate ? startDate.substring(0, 7) : undefined}
              placeholder="End Month"
            />
            <FaCalendarAlt className="date-icon" />
          </div>
          <div className="category-input-group">
            <select
              value={category}
              onChange={handleCategoryChange}
              className="category-select"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <FaChevronDown className="category-icon" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilter; 