import React, { useState } from 'react';
import { FaMoneyBillWave, FaTags, FaUniversity, FaCalendarAlt, FaInfoCircle, FaPlus } from 'react-icons/fa';
import '../styles/TransactionPages.css';
import Toast from './Toast';

const AddIncomeForm = ({ onIncomeAdded }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date_time: new Date().toISOString().split('T')[0],
    notes: '',
    bankname: '',
    source: '',
    transaction_type: 'credit'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/create-income-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add income');
      }

      const data = await response.json();
      onIncomeAdded(data);
      setFormData({
        category: '',
        amount: '',
        date_time: new Date().toISOString().split('T')[0],
        notes: '',
        bankname: '',
        source: '',
        transaction_type: 'credit'
      });
      showToast('Income added successfully!', 'success');
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
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
              <option value="Salary">Salary</option>
              <option value="Freelance">Freelance</option>
              <option value="Investment">Investment</option>
              <option value="Rental">Rental</option>
              <option value="Other">Other</option>
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
              <option value="SBI">SBI</option>
              <option value="HDFC">HDFC</option>
              <option value="ICICI">ICICI</option>
              <option value="Axis">Axis</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group source-group">
          <div className="input-group">
            <FaInfoCircle className="input-icon" />
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="Source"
              required
              className="form-input"
            />
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
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}
    </form>
  );
};

export default AddIncomeForm; 