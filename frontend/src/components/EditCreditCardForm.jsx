import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaTimes } from 'react-icons/fa';
import '../styles/TransactionPages.css';

const EditCreditCardForm = ({ transaction, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    date_time: '',
    emi_duration: '',
    bankname: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount,
        date_time: transaction.date_time.split('T')[0],
        emi_duration: transaction.emi_duration || '',
        bankname: transaction.bankname,
        notes: transaction.notes || '',
      });
    }
  }, [transaction]);

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
      const updatedTransaction = {
        ...transaction,
        ...formData,
        amount: parseFloat(formData.amount),
      };

      await onUpdate(updatedTransaction);
    } catch (error) {
      console.error('Error updating credit card transaction:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            <FaCreditCard /> Edit Credit Card Transaction
          </h2>
          <button className="close-btn" onClick={onCancel}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modern-form">
          <div className="form-grid">
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="amount">Amount</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    required
                    className="amount-input"
                  />
                  {errors.amount && <span className="error">{errors.amount}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="date_time">Date</label>
                  <input
                    type="date"
                    id="date_time"
                    name="date_time"
                    value={formData.date_time}
                    onChange={handleChange}
                    required
                    className="date-input"
                  />
                  {errors.date_time && <span className="error">{errors.date_time}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Transaction Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bankname">Bank Name</label>
                  <select
                    id="bankname"
                    name="bankname"
                    value={formData.bankname}
                    onChange={handleChange}
                    required
                    className="select-input"
                  >
                    <option value="">Select a bank</option>
                    <option value="SBI">SBI</option>
                    <option value="HDFC">HDFC</option>
                    <option value="ICICI">ICICI</option>
                    <option value="Axis">Axis</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.bankname && <span className="error">{errors.bankname}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="emi_duration">EMI Duration (months)</label>
                  <input
                    type="number"
                    id="emi_duration"
                    name="emi_duration"
                    value={formData.emi_duration}
                    onChange={handleChange}
                    className="number-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Additional Information</h3>
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="notes-input"
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="update-btn">
              Update Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCreditCardForm; 