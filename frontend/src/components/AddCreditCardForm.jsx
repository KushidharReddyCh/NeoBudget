import React, { useState } from 'react';
import { FaCreditCard, FaMoneyBillWave, FaCalendarAlt, FaUniversity, FaInfoCircle } from 'react-icons/fa';
import '../styles/TransactionPages.css';

const AddCreditCardForm = ({ onTransactionAdded }) => {
  const [formData, setFormData] = useState({
    amount: '',
    date_time: '',
    emi_duration: '',
    bankname: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.amount) newErrors.amount = 'Amount is required';
    if (!formData.date_time) newErrors.date_time = 'Date is required';
    if (!formData.bankname) newErrors.bankname = 'Bank name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/create-credit-card-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create credit card transaction');
      }

      const data = await response.json();
      onTransactionAdded(data);
      setFormData({
        amount: '',
        date_time: '',
        emi_duration: '',
        bankname: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error creating credit card transaction:', error);
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
              <option value="SBI Credit Card">SBI Credit Card</option>
              <option value="Standard Chartered Credit Card">Standard Chartered Credit Card</option>
              <option value="ICICI Credit Card">ICICI Credit Card</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group emi-group">
          <div className="input-group">
            <FaCreditCard className="input-icon" />
            <input
              type="number"
              name="emi_duration"
              value={formData.emi_duration}
              onChange={handleChange}
              placeholder="EMI Duration (months)"
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
        >
          Add Transaction
        </button>
      </div>
    </form>
  );
};

export default AddCreditCardForm; 