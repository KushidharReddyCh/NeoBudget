import React, { useState, useEffect } from 'react';
import { categories } from '../constants/categories';
import '../styles/ExpenseFilter.css';
import { FaCalendarAlt, FaFilter, FaTimes, FaSearch } from 'react-icons/fa';

const ExpenseFilter = ({ onFilterChange }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Initial call with no filters to fetch all transactions
    onFilterChange('', '', '');
  }, []);

  const isValidDate = (dateString) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;

    const [year, month, day] = dateString.split('-').map(Number);
    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 12) return false;

    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) return false;

    return true;
  };

  const validateDates = (newStartDate, newEndDate) => {
    if (!newStartDate && !newEndDate) {
      setError('');
      return true;
    }

    if (newStartDate && !isValidDate(newStartDate)) {
      setError('Invalid start date format');
      return false;
    }

    if (newEndDate && !isValidDate(newEndDate)) {
      setError('Invalid end date format');
      return false;
    }

    if (newStartDate && newEndDate) {
      const start = new Date(newStartDate);
      const end = new Date(newEndDate);

      if (start > end) {
        setError('Start date cannot be after end date');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    
    if (validateDates(newStartDate, endDate)) {
      onFilterChange(newStartDate, endDate, category);
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    
    if (validateDates(startDate, newEndDate)) {
      onFilterChange(startDate, newEndDate, category);
    }
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    onFilterChange(startDate, endDate, newCategory);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setCategory('');
    setError('');
    onFilterChange('', '', '');
  };

  const hasActiveFilters = startDate || endDate || category;

  return (
    <div className="filter-section">
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
      
      <div className="filter-bar">
        <div className="filter-group date-group">
          <FaCalendarAlt className="filter-icon" />
          <div className="date-inputs">
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="date-input"
              placeholder="Start Date"
              max={endDate || undefined}
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className="date-input"
              placeholder="End Date"
              min={startDate || undefined}
            />
          </div>
        </div>

        <div className="filter-group category-group">
          <FaFilter className="filter-icon" />
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
        </div>

        {hasActiveFilters && (
          <button 
            className="clear-filters-btn"
            onClick={handleReset}
            title="Clear all filters"
          >
            <FaTimes />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default ExpenseFilter; 