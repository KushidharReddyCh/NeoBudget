import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const categoryService = {
  // Create a new category
  createCategory: async (categoryData) => {
    try {
      const response = await axios.post(`${API_URL}/create-category`, categoryData);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Get all categories
  getAllCategories: async () => {
    try {
      const response = await axios.get(`${API_URL}/get-all-categories`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Get category by ID
  getCategoryById: async (categoryId) => {
    try {
      const response = await axios.get(`${API_URL}/get-category-by-id/${categoryId}`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Update category
  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await axios.put(`${API_URL}/update-category/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Delete category
  deleteCategory: async (categoryId) => {
    try {
      const response = await axios.delete(`${API_URL}/delete-category/${categoryId}`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Get categories by month and year
  getCategoriesByMonthAndYear: async (month, year) => {
    try {
      const response = await axios.get(`${API_URL}/get-category-by-month-and-year?month=${month}&year=${year}`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Get category names by month and year
  getCategoryNamesByMonthAndYear: async (month, year) => {
    try {
      const response = await axios.get(`${API_URL}/get-category-names-by-month-and-year?month=${month}&year=${year}`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Get category sub-category names by month and year
  getCategorySubCategoryNamesByMonthAndYear: async (month, year) => {
    try {
      const response = await axios.get(`${API_URL}/get-category-sub-category-names-by-month-and-year?month=${month}&year=${year}`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
}; 