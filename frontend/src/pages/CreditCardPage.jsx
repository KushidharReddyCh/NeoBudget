import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaPlus, FaTimes } from 'react-icons/fa';
import CreditCardTable from '../components/CreditCardTable';
import AddCreditCardForm from '../components/AddCreditCardForm';
import Loading from '../components/Loading';
import Error from '../components/Error';
import Toast from '../components/Toast';
import '../styles/TransactionPages.css';

const CreditCardPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/get-all-credit-card-transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch credit card transactions');
      }
      const data = await response.json();
      setTransactions(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      showToast('Failed to fetch credit card transactions', 'error');
    }
  };

  const handleTransactionAdded = () => {
    fetchTransactions();
    setShowAddForm(false);
    showToast('Credit card transaction added successfully! ✨');
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/delete-credit-card-transaction/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete credit card transaction');
      fetchTransactions();
      showToast('Credit card transaction deleted successfully! 🗑️');
      return true;
    } catch (error) {
      console.error('Error deleting credit card transaction:', error);
      showToast('Failed to delete credit card transaction', 'error');
      return false;
    }
  };

  const handleUpdateTransaction = async (updatedTransaction) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/update-credit-card-transaction/${updatedTransaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTransaction),
      });
      if (!response.ok) throw new Error('Failed to update credit card transaction');
      fetchTransactions();
      showToast('Credit card transaction updated successfully! ✨');
    } catch (error) {
      console.error('Error updating credit card transaction:', error);
      showToast('Failed to update credit card transaction', 'error');
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="transaction-page">
      <div className="table-container">
        <div className="table-header">
          <div className="header-left">
            <h2>
              <FaCreditCard />
              Credit Card Transactions
            </h2>
          </div>
          <div className="header-actions">
            {showAddForm ? (
              <button
                className="add-transaction-btn close"
                onClick={() => setShowAddForm(false)}
              >
                <FaTimes /> Close
              </button>
            ) : (
              <button
                className="add-transaction-btn"
                onClick={() => setShowAddForm(true)}
              >
                <FaPlus /> Add Transaction
              </button>
            )}
          </div>
        </div>

        {showAddForm && (
          <div className="form-container">
            <AddCreditCardForm onTransactionAdded={handleTransactionAdded} />
          </div>
        )}
        
        <CreditCardTable 
          transactions={transactions} 
          onDeleteTransaction={handleDeleteTransaction}
          onUpdateTransaction={handleUpdateTransaction}
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

export default CreditCardPage; 