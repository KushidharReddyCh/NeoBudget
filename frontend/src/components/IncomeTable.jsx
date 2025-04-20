import React, { useState } from 'react';
import { FaCalendarAlt, FaTags, FaUniversity, FaEye, FaPencilAlt, FaTrashAlt, FaLayerGroup } from 'react-icons/fa';
import IncomeDetails from './IncomeDetails';
import EditIncomeForm from './EditIncomeForm';
import Toast from './Toast';

const IncomeTable = ({ incomes, onDeleteIncome, onUpdateIncome }) => {
  const [editingIncome, setEditingIncome] = useState(null);
  const [viewingIncomeId, setViewingIncomeId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const itemsPerPage = 7;

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

  // Sort incomes by date in descending order
  const sortedIncomes = [...incomes].sort((a, b) => 
    new Date(b.date_time) - new Date(a.date_time)
  );

  // Calculate pagination
  const totalPages = Math.ceil(sortedIncomes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIncomes = sortedIncomes.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      try {
        const success = await onDeleteIncome(id);
        if (success) {
          if (currentIncomes.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
          showToast('Income deleted successfully!', 'success');
        }
      } catch (error) {
        console.error('Error in delete handler:', error);
        showToast('Failed to delete income', 'error');
      }
    }
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
  };

  const handleUpdate = (updatedIncome) => {
    try {
      onUpdateIncome(updatedIncome);
      setEditingIncome(null);
      showToast('Income updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update income', 'error');
    }
  };

  const handleView = (id) => {
    setViewingIncomeId(id);
  };

  return (
    <div className="table-wrapper">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Source</th>
            <th>Bank</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentIncomes.map(income => (
            <tr key={income.id}>
              <td>
                <div className="date-cell">
                  <div className="date-wrapper">
                    <span className="date-day">{formatDate(income.date_time).day}</span>
                    <span className="date-month">{formatDate(income.date_time).month}</span>
                  </div>
                </div>
              </td>
              <td className="amount-cell">
                <span className="amount-income">
                  {formatCurrency(income.amount)}
                </span>
              </td>
              <td>
                <div className="badge badge-category">
                  <FaTags />
                  {income.category || 'N/A'}
                </div>
              </td>
              <td>
                <div className="badge badge-category">
                  <FaLayerGroup />
                  {income.source || 'N/A'}
                </div>
              </td>
              <td>
                <div className="badge badge-bank">
                  <FaUniversity />
                  {income.bankname || 'N/A'}
                </div>
              </td>
              <td>
                <div className="notes-content">
                  {income.notes || '-'}
                </div>
              </td>
              <td>
                <div className="action-buttons">
                  <button 
                    className="action-button view"
                    onClick={() => handleView(income.id)}
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="action-button edit"
                    onClick={() => handleEdit(income)}
                    title="Edit Income"
                  >
                    <FaPencilAlt />
                  </button>
                  <button 
                    className="action-button delete"
                    onClick={() => handleDelete(income.id)}
                    title="Delete Income"
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
                  if (totalPages <= 7) return true;
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

      {editingIncome && (
        <EditIncomeForm
          income={editingIncome}
          onClose={() => setEditingIncome(null)}
          onUpdate={handleUpdate}
        />
      )}

      {viewingIncomeId && (
        <IncomeDetails
          incomeId={viewingIncomeId}
          onClose={() => setViewingIncomeId(null)}
        />
      )}

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

export default IncomeTable; 