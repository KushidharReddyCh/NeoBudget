import React, { useState } from 'react';
import { FaCalendarAlt, FaTags, FaUniversity, FaEye, FaPencilAlt, FaTrashAlt, FaLayerGroup } from 'react-icons/fa';
import EditExpenseForm from './EditExpenseForm';
import ExpenseDetails from './ExpenseDetails';

const ExpenseTable = ({ expenses, onDeleteExpense, onUpdateExpense }) => {
  const [editingExpense, setEditingExpense] = useState(null);
  const [viewingExpenseId, setViewingExpenseId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

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

  // Sort expenses by date in descending order
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date_time) - new Date(a.date_time)
  );

  // Calculate pagination
  const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExpenses = sortedExpenses.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const success = await onDeleteExpense(id);
        if (success && currentExpenses.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        console.error('Error in delete handler:', error);
      }
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
  };

  const handleUpdate = (updatedExpense) => {
    onUpdateExpense(updatedExpense);
    setEditingExpense(null);
  };

  const handleView = (id) => {
    setViewingExpenseId(id);
  };

  return (
    <div className="table-wrapper">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Sub-Category</th>
            <th>Bank</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentExpenses.map(expense => (
            <tr key={expense.id}>
              <td>
                <div className="date-cell">
                  <div className="date-wrapper">
                    <span className="date-day">{formatDate(expense.date_time).day}</span>
                    <span className="date-month">{formatDate(expense.date_time).month}</span>
                  </div>
                </div>
              </td>
              <td className="amount-cell">
                <span className="amount-expense">
                  {formatCurrency(expense.amount)}
                </span>
              </td>
              <td>
                <div className="badge badge-category">
                  <FaTags />
                  {expense.category || 'N/A'}
                </div>
              </td>
              <td>
                <div className="badge badge-category">
                  <FaLayerGroup />
                  {expense.sub_category || 'N/A'}
                </div>
              </td>
              <td>
                <div className="badge badge-bank">
                  <FaUniversity />
                  {expense.bankname || 'N/A'}
                </div>
              </td>
              <td>
                <div className="notes-content">
                  {expense.notes || '-'}
                </div>
              </td>
              <td>
                <div className="action-buttons">
                  <button 
                    className="action-button view"
                    onClick={() => handleView(expense.id)}
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="action-button edit"
                    onClick={() => handleEdit(expense)}
                    title="Edit Expense"
                  >
                    <FaPencilAlt />
                  </button>
                  <button 
                    className="action-button delete"
                    onClick={() => handleDelete(expense.id)}
                    title="Delete Expense"
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
            
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  if (totalPages <= 5) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                  return false;
                })
                .map((page, index, array) => {
                  if (index > 0 && array[index - 1] !== page - 1) {
                    return [
                      <span key={`ellipsis-${page}`} className="pagination-ellipsis">...</span>,
                      <button
                        key={page}
                        className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ];
                  }
                  return (
                    <button
                      key={page}
                      className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  );
                })}
            </div>

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

      {editingExpense && (
        <EditExpenseForm
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onUpdate={handleUpdate}
        />
      )}

      {viewingExpenseId && (
        <ExpenseDetails
          expenseId={viewingExpenseId}
          onClose={() => setViewingExpenseId(null)}
        />
      )}
    </div>
  );
};

export default ExpenseTable; 