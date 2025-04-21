import React, { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';
import { expenseService } from '../services/expenseService';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaTags } from 'react-icons/fa';
import { categories, subCategories } from '../constants/categories';
import '../styles/CategoryManagement.css';

const CategoryManagement = () => {
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    sub_category: '',
    budget: '',
    month: new Date().toLocaleString('default', { month: 'short' }).toLowerCase(),
    year: new Date().getFullYear().toString()
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'short' }).toLowerCase());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const [monthlySpendings, setMonthlySpendings] = useState({});

  useEffect(() => {
    fetchCategories();
    fetchMonthlySpendings();
  }, [selectedMonth, selectedYear]);

  const getLastDayOfMonth = (year, month) => {
    // month is 1-based (1-12)
    return new Date(year, month, 0).getDate();
  };

  const getMonthNumber = (month) => {
    const months = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    return months[month];
  };

  const fetchMonthlySpendings = async () => {
    try {
      const monthNumber = getMonthNumber(selectedMonth);
      const year = parseInt(selectedYear);
      const month = parseInt(monthNumber);
      
      // Get the last day of the month
      const lastDay = getLastDayOfMonth(year, month);
      
      // Format dates with leading zeros
      const startDate = `${year}-${monthNumber}-01`;
      const endDate = `${year}-${monthNumber}-${lastDay.toString().padStart(2, '0')}`;
      
      const expenses = await expenseService.getExpensesByDateRange(startDate, endDate);
      
      // Calculate spendings by category and sub-category
      const spendings = {};
      expenses.forEach(expense => {
        if (!spendings[expense.category]) {
          spendings[expense.category] = {};
        }
        if (!spendings[expense.category][expense.sub_category]) {
          spendings[expense.category][expense.sub_category] = 0;
        }
        spendings[expense.category][expense.sub_category] += expense.amount;
      });
      
      setMonthlySpendings(spendings);
    } catch (err) {
      console.error('Error fetching monthly spendings:', err);
      setError('Failed to fetch monthly spendings');
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategoriesByMonthAndYear(selectedMonth, selectedYear);
      setCategoriesList(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'category') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        sub_category: ''
      }));
      setAvailableSubCategories(subCategories[value] || []);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      setFormData({
        category: '',
        sub_category: '',
        budget: '',
        month: new Date().toLocaleString('default', { month: 'short' }).toLowerCase(),
        year: new Date().getFullYear().toString()
      });
      setEditingId(null);
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      setError('Failed to save category');
      console.error(err);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      category: category.category,
      sub_category: category.sub_category,
      budget: category.budget,
      month: category.month,
      year: category.year
    });
    setAvailableSubCategories(subCategories[category.category] || []);
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(id);
        fetchCategories();
      } catch (err) {
        setError('Failed to delete category');
        console.error(err);
      }
    }
  };

  // Group categories by main category
  const groupedCategories = categoriesList.reduce((acc, category) => {
    if (!acc[category.category]) {
      acc[category.category] = [];
    }
    acc[category.category].push(category);
    return acc;
  }, {});

  return (
    <div className="category-management">
      <div className="header">
        <div className="title">
          <FaTags className="icon" />
          <h1>Categories</h1>
        </div>
        <div className="actions">
          <div className="filter-container">
            <div className="filter-group">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="jan">January</option>
                <option value="feb">February</option>
                <option value="mar">March</option>
                <option value="apr">April</option>
                <option value="may">May</option>
                <option value="jun">June</option>
                <option value="jul">July</option>
                <option value="aug">August</option>
                <option value="sep">September</option>
                <option value="oct">October</option>
                <option value="nov">November</option>
                <option value="dec">December</option>
              </select>
            </div>
            <div className="filter-group">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={i} value={new Date().getFullYear() - i}>
                    {new Date().getFullYear() - i}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            className="add-button"
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({
                category: '',
                sub_category: '',
                budget: '',
                month: new Date().toLocaleString('default', { month: 'short' }).toLowerCase(),
                year: new Date().getFullYear().toString()
              });
              setAvailableSubCategories([]);
            }}
          >
            <FaPlus /> New Category
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Category' : 'New Category'}</h2>
              <button className="close-button" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Sub Category</label>
                <select
                  name="sub_category"
                  value={formData.sub_category}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.category}
                >
                  <option value="">Select a sub-category</option>
                  {availableSubCategories.map(subCategory => (
                    <option key={subCategory} value={subCategory}>{subCategory}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Budget</label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="Enter budget amount"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Month</label>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  required
                >
                  <option value="jan">January</option>
                  <option value="feb">February</option>
                  <option value="mar">March</option>
                  <option value="apr">April</option>
                  <option value="may">May</option>
                  <option value="jun">June</option>
                  <option value="jul">July</option>
                  <option value="aug">August</option>
                  <option value="sep">September</option>
                  <option value="oct">October</option>
                  <option value="nov">November</option>
                  <option value="dec">December</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Year</label>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  placeholder="YYYY"
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="categories-tables">
          {Object.entries(groupedCategories).map(([category, items]) => (
            <div key={category} className="category-table-container">
              <h2 className="category-title">{category}</h2>
              <table className="category-table">
                <thead>
                  <tr>
                    <th>Sub Category</th>
                    <th>Budget</th>
                    <th>Spent</th>
                    <th>Remaining</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => {
                    const spent = monthlySpendings[category]?.[item.sub_category] || 0;
                    const remaining = item.budget - spent;
                    return (
                      <tr key={item.id}>
                        <td>{item.sub_category}</td>
                        <td>₹{item.budget.toLocaleString()}</td>
                        <td className={spent > item.budget ? 'over-budget' : ''}>
                          ₹{spent.toLocaleString()}
                        </td>
                        <td className={remaining < 0 ? 'over-budget' : ''}>
                          ₹{remaining.toLocaleString()}
                        </td>
                        <td className="actions-cell">
                          <button onClick={() => handleEdit(item)} className="edit-button">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="delete-button">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryManagement; 