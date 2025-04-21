import React, { useState } from 'react';
import { FaCalendarAlt, FaTags } from 'react-icons/fa';
import { categories } from '../constants/categories';
import '../styles/DateRangeFilter.css';

const DateRangeFilter = ({ onFilterChange }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    onFilterChange(newStartDate, endDate, category);
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    onFilterChange(startDate, newEndDate, category);
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
    onFilterChange('', '', '');
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
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="date-input"
              max={endDate || undefined}
              placeholder="Start Date"
            />
            <FaCalendarAlt className="date-icon" />
          </div>
          <span className="date-separator">to</span>
          <div className="date-input-group">
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className="date-input"
              min={startDate || undefined}
              placeholder="End Date"
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
            <FaTags className="category-icon" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilter; 