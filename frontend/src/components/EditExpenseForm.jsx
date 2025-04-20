import React, { useState, useEffect } from 'react';
import { categories, subCategories } from '../constants/categories';

const EditExpenseForm = ({ expense, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    category: '',
    sub_category: '',
    amount: '',
    date_time: '',
    notes: '',
    transaction_type: 'expense',
    bankname: ''
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableSubCategories, setAvailableSubCategories] = useState([]);

  const banks = [
    'HDFC Bank',
    'ICICI Bank',
    'SBI',
    'Axis Bank',
    'Kotak Mahindra',
    'Other'
  ];

  useEffect(() => {
    if (expense) {
      console.log('Received expense in EditExpenseForm:', expense);
      setFormData({
        category: expense.category,
        sub_category: expense.sub_category,
        amount: expense.amount,
        date_time: expense.date_time.split('T')[0],
        notes: expense.notes,
        transaction_type: expense.transaction_type,
        bankname: expense.bankname
      });
      // Set initial sub-categories based on the expense's category
      setAvailableSubCategories(subCategories[expense.category] || []);
    }
  }, [expense]);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData(prev => ({
      ...prev,
      category,
      sub_category: '' // Reset sub-category when category changes
    }));
    setAvailableSubCategories(subCategories[category] || []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Format the data properly to match backend requirements
      const updatedExpense = {
        ...formData,
        id: expense.id,
        amount: parseFloat(formData.amount),
        date_time: `${formData.date_time}T00:00:00.000Z`,
        timestamp: new Date().toISOString(),
        transaction_type: 'expense'
      };

      // Call the parent's update handler
      await onUpdate(updatedExpense);
      onClose();
    } catch (err) {
      console.error('Error updating expense:', err);
      setError(err.message || 'Failed to update expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!expense) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Expense</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {/* Amount and Date Section */}
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            <div className="form-row">
              <div className="form-group amount-group">
                <label htmlFor="amount">Amount (₹)</label>
                <div className="input-with-icon">
                  <span className="currency-icon">₹</span>
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
                  onChange={handleCategoryChange}
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
              <label htmlFor="sub_category">Sub Category</label>
              <select
                id="sub_category"
                name="sub_category"
                value={formData.sub_category}
                onChange={handleChange}
                className="select-input"
              >
                <option value="">Select a sub-category</option>
                {availableSubCategories.map(subCategory => (
                  <option key={subCategory} value={subCategory}>{subCategory}</option>
                ))}
              </select>
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
                placeholder="Add any additional details about this expense"
                className="notes-input"
                rows="3"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="update-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseForm; 