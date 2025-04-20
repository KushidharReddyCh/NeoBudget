import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaMoneyBillWave } from 'react-icons/fa';
import AddIncomeForm from '../components/AddIncomeForm';
import IncomeTable from '../components/IncomeTable';
import Toast from '../components/Toast';
import '../styles/TransactionPages.css';

const IncomesPage = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchIncomes();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  const fetchIncomes = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/get-all-income-transactions');
      if (!response.ok) throw new Error('Failed to fetch incomes');
      const data = await response.json();
      setIncomes(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleIncomeAdded = (newIncome) => {
    fetchIncomes();
    setShowAddForm(false);
    showToast('Income added successfully! 💰', 'success');
  };

  const handleDeleteIncome = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/delete-income-transaction/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete income');
      fetchIncomes();
      showToast('Income deleted successfully! 🗑️', 'success');
      return true;
    } catch (error) {
      console.error('Error deleting income:', error);
      showToast('Failed to delete income', 'error');
      return false;
    }
  };

  const handleUpdateIncome = async (updatedIncome) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/update-income-transaction/${updatedIncome.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedIncome),
      });
      if (!response.ok) throw new Error('Failed to update income');
      fetchIncomes();
      showToast('Income updated successfully! ✨', 'success');
    } catch (error) {
      console.error('Error updating income:', error);
      showToast('Failed to update income', 'error');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading incomes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="transaction-page">
      <div className="table-container">
        <div className="table-header">
          <div className="header-left">
            <h2>
              <FaMoneyBillWave />
              Income Transactions
            </h2>
          </div>
          <div className="header-actions">
            {showAddForm ? (
              <button
                className="add-expense-btn close"
                onClick={() => setShowAddForm(false)}
              >
                <FaTimes /> Close
              </button>
            ) : (
              <button
                className="add-expense-btn"
                onClick={() => setShowAddForm(true)}
              >
                <FaPlus /> Add Income
              </button>
            )}
          </div>
        </div>

        {showAddForm && (
          <div className="form-container">
            <AddIncomeForm onIncomeAdded={handleIncomeAdded} />
          </div>
        )}

        <IncomeTable
          incomes={incomes}
          onDeleteIncome={handleDeleteIncome}
          onUpdateIncome={handleUpdateIncome}
        />
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={4000}
          onClose={hideToast}
        />
      )}
    </div>
  );
};

export default IncomesPage; 