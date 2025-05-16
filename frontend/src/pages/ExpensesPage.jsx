import React, { useState, useEffect } from 'react';
import { FaHistory, FaPlus, FaTimes, FaMoneyBillWave } from 'react-icons/fa';
import ExpenseTable from '../components/ExpenseTable';
import AddExpenseForm from '../components/AddExpenseForm';
import DateRangeFilter from '../components/DateRangeFilter';
import Loading from '../components/Loading';
import Error from '../components/Error';
import Toast from '../components/Toast';
import Footer from '../components/Footer';
import '../styles/TransactionPages.css';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  const fetchExpenses = async (startDate = '', endDate = '', category = '') => {
    try {
      let url = 'http://127.0.0.1:8000/get-all-expense-transactions';
      const params = new URLSearchParams();
      
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (category) params.append('category', category);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      const data = await response.json();
      setExpenses(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleExpenseAdded = () => {
    fetchExpenses();
    setShowAddForm(false);
  };

  const handleDeleteExpense = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/delete-expense-transaction/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete expense');
      fetchExpenses();
      showToast('Expense deleted successfully! 🗑️', 'success');
      return true;
    } catch (error) {
      console.error('Error deleting expense:', error);
      showToast('Failed to delete expense', 'error');
      return false;
    }
  };

  const handleUpdateExpense = async (updatedExpense) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/update-expense-transaction/${updatedExpense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedExpense),
      });
      if (!response.ok) throw new Error('Failed to update expense');
      fetchExpenses();
      showToast('Expense updated successfully! ✨', 'success');
    } catch (error) {
      console.error('Error updating expense:', error);
      showToast('Failed to update expense', 'error');
    }
  };

  const handleFilterChange = (startDate, endDate, category) => {
    fetchExpenses(startDate, endDate, category);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="transaction-page">
      <div className="table-container">
        <div className="table-header">
          <div className="header-left">
            <h2>
              <FaMoneyBillWave />
              Expense Transactions
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
                <FaPlus /> Add Expense
              </button>
            )}
          </div>
        </div>

        <DateRangeFilter onFilterChange={handleFilterChange} />

        {showAddForm && (
          <div className="form-container">
            <AddExpenseForm onExpenseAdded={handleExpenseAdded} />
          </div>
        )}
        
        <ExpenseTable 
          expenses={expenses} 
          onDeleteExpense={handleDeleteExpense}
          onUpdateExpense={handleUpdateExpense}
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
      <Footer />
    </div>
  );
};

export default ExpensesPage; 