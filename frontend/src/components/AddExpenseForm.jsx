import React, { useState } from 'react';
import { FaMoneyBillWave, FaTags, FaUniversity, FaCalendarAlt, FaInfoCircle, FaPlus } from 'react-icons/fa';
import { categories, subCategories } from '../constants/categories';
import '../styles/TransactionPages.css';

const AddExpenseForm = ({ onExpenseAdded }) => {
  const [formData, setFormData] = useState({
    category: '',
    sub_category: '',
    amount: '',
    date_time: new Date().toISOString().split('T')[0],
    notes: '',
    bankname: '',
    transaction_type: 'debit'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableSubCategories, setAvailableSubCategories] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update sub-categories when category changes
    if (name === 'category') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        sub_category: '' // Reset sub-category when category changes
      }));
      setAvailableSubCategories(subCategories[value] || []);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/create-expense-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to add expense');

      const data = await response.json();
      onExpenseAdded(data);
      setFormData({
        category: '',
        sub_category: '',
        amount: '',
        date_time: new Date().toISOString().split('T')[0],
        notes: '',
        bankname: '',
        transaction_type: 'debit'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="quick-add-form">
      <div className="form-row">
        <div className="form-group amount-group">
          <div className="input-group">
            <FaMoneyBillWave className="input-icon" />
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Amount"
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group date-group">
          <div className="input-group">
            <FaCalendarAlt className="input-icon" />
            <input
              type="date"
              name="date_time"
              value={formData.date_time}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group category-group">
          <div className="input-group">
            <FaTags className="input-icon" />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="">Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group category-group">
          <div className="input-group">
            <FaTags className="input-icon" />
            <select
              name="sub_category"
              value={formData.sub_category}
              onChange={handleChange}
              required
              className="form-input"
              disabled={!formData.category}
            >
              <option value="">Sub Category</option>
              {availableSubCategories.map(subCategory => (
                <option key={subCategory} value={subCategory}>{subCategory}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group bank-group">
          <div className="input-group">
            <FaUniversity className="input-icon" />
            <select
              name="bankname"
              value={formData.bankname}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="">Bank</option>
              <option value="SBI Bank">SBI Bank</option>
              <option value="Union Bank">Union Bank</option>
              <option value="Axis Bank">Axis Bank</option>
              <option value="Liquid Cash">Liquid Cash</option>
              <option value="UPI Lite">UPI Lite</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group notes-group">
          <div className="input-group">
            <FaInfoCircle className="input-icon" />
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notes"
              className="form-input"
            />
          </div>
        </div>

        <button
          type="submit"
          className="add-transaction-btn"
          disabled={loading}
        >
          {loading ? (
            <span className="loading-dots">Adding...</span>
          ) : (
            <>
              <FaPlus /> Add
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <FaInfoCircle /> {error}
        </div>
      )}
    </form>
  );
};

export default AddExpenseForm; 