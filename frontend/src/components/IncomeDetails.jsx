import React, { useState, useEffect } from 'react';

const IncomeDetails = ({ incomeId, onClose }) => {
  const [income, setIncome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncomeDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/get-income-transaction-by-id/${incomeId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch income details');
        }
        const data = await response.json();
        setIncome(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchIncomeDetails();
  }, [incomeId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading income details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="error">{error}</div>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  if (!income) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Income Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="income-details">
          <div className="detail-row">
            <span className="detail-label">Date:</span>
            <span className="detail-value">{formatDate(income.date_time)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Amount:</span>
            <span className="detail-value amount income">{formatCurrency(income.amount)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{income.category}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Source:</span>
            <span className="detail-value">{income.source}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Bank:</span>
            <span className="detail-value">{income.bankname}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Notes:</span>
            <span className="detail-value">{income.notes}</span>
          </div>
        </div>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default IncomeDetails; 