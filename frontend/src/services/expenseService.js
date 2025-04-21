import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const expenseService = {
  getExpensesByDateRange: async (startDate, endDate, category = null) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (category) params.append('category', category);

      const response = await axios.get(`${API_URL}/get-all-expense-transactions?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  }
}; 