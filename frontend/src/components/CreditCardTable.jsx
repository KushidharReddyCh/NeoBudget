import React, { useState } from 'react';
import { FaCalendarAlt, FaUniversity, FaEye, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import EditCreditCardForm from './EditCreditCardForm';
import CreditCardDetails from './CreditCardDetails';
import '../styles/TransactionPages.css';

const CreditCardTable = ({ transactions, onDeleteTransaction, onUpdateTransaction }) => {
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [viewingTransactionId, setViewingTransactionId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    return { day, month };
  };

  // Sort transactions by date in descending order
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date_time) - new Date(a.date_time)
  );

  // Calculate pagination
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = sortedTransactions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this credit card transaction?')) {
      try {
        const success = await onDeleteTransaction(id);
        if (success && currentTransactions.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        console.error('Error in delete handler:', error);
      }
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setViewingTransactionId(null);
  };

  const handleUpdate = async (updatedTransaction) => {
    await onUpdateTransaction(updatedTransaction);
    setEditingTransaction(null);
  };

  const handleView = (id) => {
    setViewingTransactionId(id);
    setEditingTransaction(null);
  };

  const handleCloseView = () => {
    setViewingTransactionId(null);
  };

  const viewingTransaction = viewingTransactionId 
    ? transactions.find(t => t.id === viewingTransactionId)
    : null;

  return (
    <div className="table-wrapper">
      <table className="transaction-table">
        <thead>
          <tr>
            <th className="date-column">Date</th>
            <th className="amount-column">Amount</th>
            <th className="bank-column">Bank</th>
            <th className="emi-column">EMI Duration</th>
            <th className="notes-column">Notes</th>
            <th className="actions-column" style={{ textAlign: 'center', padding: '0 2rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentTransactions.map(transaction => (
            <tr key={transaction.id}>
              <td className="date-column">
                <div className="date-cell">
                  <div className="date-wrapper">
                    <span className="date-day">{formatDate(transaction.date_time).day}</span>
                    <span className="date-month">{formatDate(transaction.date_time).month}</span>
                  </div>
                </div>
              </td>
              <td className="amount-column">
                <span className="amount-expense">
                  {formatCurrency(transaction.amount)}
                </span>
              </td>
              <td className="bank-column">
                <div className="badge badge-bank">
                  <FaUniversity />
                  {transaction.bankname || 'N/A'}
                </div>
              </td>
              <td className="emi-column">
                <div className="badge badge-category">
                  <FaCalendarAlt />
                  {transaction.emi_duration ? `${transaction.emi_duration} months` : 'N/A'}
                </div>
              </td>
              <td className="notes-column">
                <div className="notes-content">
                  {transaction.notes || '-'}
                </div>
              </td>
              <td className="actions-column">
                <div className="action-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button 
                    className="action-button view"
                    onClick={() => handleView(transaction.id)}
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="action-button edit"
                    onClick={() => handleEdit(transaction)}
                    title="Edit Transaction"
                  >
                    <FaPencilAlt />
                  </button>
                  <button 
                    className="action-button delete"
                    onClick={() => handleDelete(transaction.id)}
                    title="Delete Transaction"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              title="First Page"
            >
              ⟪
            </button>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous Page"
            >
              ⟨
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next Page"
            >
              ⟩
            </button>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              title="Last Page"
            >
              ⟫
            </button>
          </div>
        </div>
      )}

      {editingTransaction && (
        <EditCreditCardForm
          transaction={editingTransaction}
          onUpdate={handleUpdate}
          onCancel={() => setEditingTransaction(null)}
        />
      )}

      {viewingTransaction && (
        <CreditCardDetails
          transaction={viewingTransaction}
          onClose={handleCloseView}
        />
      )}
    </div>
  );
};

export default CreditCardTable; 