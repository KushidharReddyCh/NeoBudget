import React, { useState, useEffect } from 'react';

const ExpenseDetails = ({ expenseId, onClose }) => {
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpenseDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/get-expense-transaction-by-id/${expenseId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch expense details');
        }
        const data = await response.json();
        setExpense(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchExpenseDetails();
  }, [expenseId]);

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
            <p>Loading expense details...</p>
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

  if (!expense) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Expense Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="expense-details">
          <div className="detail-row">
            <span className="detail-label">Date:</span>
            <span className="detail-value">{formatDate(expense.date_time)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Amount:</span>
            <span className="detail-value amount">{formatCurrency(expense.amount)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Category:</span>
            <span className="category-badge" data-category={expense.category || 'Other'}>
              {expense.category || '-'}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Sub Category:</span>
            <span className="sub-category-badge" data-subcategory={expense.sub_category || 'Other'}>
              {expense.sub_category || '-'}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Bank:</span>
            <span className="detail-value">{expense.bankname}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Notes:</span>
            <span className="detail-value">{expense.notes}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetails; 