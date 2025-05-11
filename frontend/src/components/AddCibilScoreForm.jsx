import React, { useState } from 'react';
import { FaChartLine, FaCalendarAlt, FaInfoCircle, FaPlus } from 'react-icons/fa';
import '../styles/TransactionPages.css';
import Toast from './Toast';

const AddCibilScoreForm = ({ onScoreAdded }) => {
  const [formData, setFormData] = useState({
    score: '',
    date_time: new Date().toISOString().split('T')[0],
    notes: ''
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
      const response = await fetch('http://127.0.0.1:8000/create-cibil-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add CIBIL score');
      }

      const data = await response.json();
      onScoreAdded(data);
      setFormData({
        score: '',
        date_time: new Date().toISOString().split('T')[0],
        notes: ''
      });
      showToast('CIBIL score added successfully!', 'success');
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
            <FaChartLine className="input-icon" />
            <input
              type="number"
              name="score"
              value={formData.score}
              onChange={handleChange}
              placeholder="CIBIL Score"
              required
              min="300"
              max="900"
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
              <FaPlus /> Add Score
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default AddCibilScoreForm; 