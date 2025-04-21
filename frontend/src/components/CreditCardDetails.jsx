import React from 'react';
import { FaTimes, FaCalendarAlt, FaUniversity, FaCreditCard, FaInfoCircle } from 'react-icons/fa';
import '../styles/TransactionPages.css';

const CreditCardDetails = ({ transaction, onClose }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Credit Card Transaction Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="details-body">
          <div className="detail-row">
            <span className="detail-label">Date:</span>
            <span className="detail-value">{formatDate(transaction.date_time)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Amount:</span>
            <span className="detail-value amount expense">{formatCurrency(transaction.amount)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Bank:</span>
            <span className="detail-value">{transaction.bankname || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">EMI Duration:</span>
            <span className="detail-value">{transaction.emi_duration ? `${transaction.emi_duration} months` : 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Notes:</span>
            <span className="detail-value">{transaction.notes || 'No notes available'}</span>
          </div>
        </div>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default CreditCardDetails; 