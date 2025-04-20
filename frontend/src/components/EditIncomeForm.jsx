import React, { useState, useEffect } from 'react';
import Toast from './Toast';

const EditIncomeForm = ({ income, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date_time: '',
    notes: '',
    transaction_type: 'income',
    source: '',
    bankname: ''
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Predefined categories and banks for dropdowns
  const categories = [
    'Salary',
    'Freelance',
    'Business',
    'Investments',
    'Rental',
    'Other'
  ];

  const banks = [
    'HDFC Bank',
    'ICICI Bank',
    'SBI',
    'Axis Bank',
    'Kotak Mahindra',
    'Other'
  ];

  useEffect(() => {
    if (income) {
      setFormData({
        category: income.category,
        amount: income.amount,
        date_time: income.date_time.split('T')[0],
        notes: income.notes,
        transaction_type: income.transaction_type,
        source: income.source,
        bankname: income.bankname
      });
    }
  }, [income]);

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
    setError(null);

    try {
      // Format the data properly to match backend requirements
      const updatedIncome = {
        ...formData,
        id: income.id,
        amount: parseFloat(formData.amount),
        date_time: `${formData.date_time}T00:00:00.000Z`,
        timestamp: new Date().toISOString(), // Add the required timestamp field
        transaction_type: 'income'
      };

      // Call the parent's update handler
      await onUpdate(updatedIncome);
      showToast('Income updated successfully!', 'success');
      onClose();
    } catch (err) {
      console.error('Error updating income:', err);
      setError(err.message || 'Failed to update income. Please try again.');
      showToast('Failed to update income', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!income) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Income</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit} className="modern-form">
          <div className="form-grid">
            {/* Amount and Date Section */}
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              <div className="form-row">
                <div className="form-group amount-group">
                  <label htmlFor="amount">Amount (₹)</label>
                  <div className="input-with-icon">
                    <span className="currency-icon green">₹</span>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      step="0.01"
                      required
                      placeholder="0.00"
                      className="amount-input"
                    />
                  </div>
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
                </div>
              </div>
            </div>

            {/* Category and Bank Section */}
            <div className="form-section">
              <h3 className="section-title">Transaction Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="select-input"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="bankname">Bank</label>
                  <select
                    id="bankname"
                    name="bankname"
                    value={formData.bankname}
                    onChange={handleChange}
                    className="select-input"
                  >
                    <option value="">Select a bank</option>
                    {banks.map(bank => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="source">Source</label>
                <input
                  type="text"
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  placeholder="Income source"
                  className="text-input"
                  required
                />
              </div>
            </div>

            {/* Notes Section */}
            <div className="form-section">
              <h3 className="section-title">Additional Information</h3>
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add any additional details about this income"
                  className="notes-input"
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="update-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Income'}
            </button>
          </div>
        </form>
      </div>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}
    </div>
  );
};

export default EditIncomeForm; 