import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { 
  FaChartLine, 
  FaChartPie, 
  FaChartBar, 
  FaWallet, 
  FaTags, 
  FaArrowUp,
  FaCalendarAlt,
  FaChartArea,
  FaUniversity
} from 'react-icons/fa';
import '../styles/Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('month');
  const [customRange, setCustomRange] = useState('last30');
  const [categoryData, setCategoryData] = useState({});
  const [weeklyTrends, setWeeklyTrends] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [topSubCategories, setTopSubCategories] = useState([]);
  const [selectedCategorySubcats, setSelectedCategorySubcats] = useState({});
  const [incomeData, setIncomeData] = useState([]);
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [currentBalance, setCurrentBalance] = useState(0);
  const [creditCardTransactions, setCreditCardTransactions] = useState([]);
  const [bankBalances, setBankBalances] = useState({});

  // Generate last 6 months options
  const getLastSixMonths = () => {
    const months = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      });
    }
    return months;
  };

  useEffect(() => {
    fetchExpenses();
    fetchIncome();
    fetchCategoryBudgets();
    fetchCurrentBalance();
    fetchCreditCardTransactions();
    fetchBankBalances();
  }, [timeRange, customRange]);

  // Add event listener for expense updates
  useEffect(() => {
    const handleExpenseUpdate = () => {
      fetchExpenses();
    };

    window.addEventListener('expenseUpdated', handleExpenseUpdate);

    return () => {
      window.removeEventListener('expenseUpdated', handleExpenseUpdate);
    };
  }, [timeRange, customRange]);

  const fetchExpenses = async () => {
    try {
      const now = new Date();
      let startDate, endDate = new Date();

      if (customRange === 'last7') {
        startDate = new Date(now.setDate(now.getDate() - 7));
      } else if (customRange === 'last30') {
        startDate = new Date(now.setDate(now.getDate() - 30));
      } else if (customRange === 'last90') {
        startDate = new Date(now.setDate(now.getDate() - 90));
      } else if (customRange === 'last365') {
        startDate = new Date(now.setDate(now.getDate() - 365));
      } else if (customRange.includes('-')) {
        // Handle specific month selection
        const [year, month] = customRange.split('-').map(Number);
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0); // Last day of selected month
      }
      
      const response = await fetch(
        `http://127.0.0.1:8000/get-all-expense-transactions?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`
      );

      if (!response.ok) throw new Error('Failed to fetch expenses');

      const data = await response.json();
      setExpenses(data);
      processCategories(data);
      processWeeklyTrends(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchIncome = async () => {
    try {
      const now = new Date();
      let startDate, endDate = new Date();

      if (customRange === 'last7') {
        startDate = new Date(now.setDate(now.getDate() - 7));
      } else if (customRange === 'last30') {
        startDate = new Date(now.setDate(now.getDate() - 30));
      } else if (customRange === 'last90') {
        startDate = new Date(now.setDate(now.getDate() - 90));
      } else if (customRange === 'last365') {
        startDate = new Date(now.setDate(now.getDate() - 365));
      } else if (customRange.includes('-')) {
        const [year, month] = customRange.split('-').map(Number);
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0);
      }
      
      const response = await fetch(
        `http://127.0.0.1:8000/get-all-income-transactions?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`
      );

      if (!response.ok) throw new Error('Failed to fetch income');

      const data = await response.json();
      setIncomeData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCategoryBudgets = async () => {
    try {
      const now = new Date();
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const currentMonth = monthNames[now.getMonth()];
      const currentYear = now.getFullYear().toString();

      const response = await fetch(
        `http://127.0.0.1:8000/get-category-by-month-and-year?month=${currentMonth}&year=${currentYear}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch category budgets');
      
      const categories = await response.json();
      
      // Transform the data into a format we can use
      const budgets = categories.reduce((acc, category) => {
        if (!acc[category.category]) {
          acc[category.category] = 0;
        }
        acc[category.category] += category.budget;
        return acc;
      }, {});
      
      setCategoryBudgets(budgets);
    } catch (err) {
      console.error('Error fetching category budgets:', err);
    }
  };

  const fetchCurrentBalance = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/current-balance');
      if (!response.ok) throw new Error('Failed to fetch current balance');
      const data = await response.json();
      setCurrentBalance(data.current_balance);
    } catch (err) {
      console.error('Error fetching current balance:', err);
    }
  };

  const fetchCreditCardTransactions = async () => {
    try {
      const now = new Date();
      let startDate, endDate = new Date();
      if(!customRange.includes('-')){
        startDate = new Date(now.setDate(now.getDate() - 365));
      // if (customRange === 'last7') {
      //   startDate = new Date(now.setDate(now.getDate() - 7));
      // } else if (customRange === 'last30') {
      //   startDate = new Date(now.setDate(now.getDate() - 30));
      // } else if (customRange === 'last90') {
      //   startDate = new Date(now.setDate(now.getDate() - 90));
      // } else if (customRange === 'last365') {
      //   startDate = new Date(now.setDate(now.getDate() - 365));
      } else if (customRange.includes('-')) {
        const [year, month] = customRange.split('-').map(Number);
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0);
      }
      
      const response = await fetch(
        `http://localhost:8000/get-credit-card-transaction-by-date-range?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`
      );

      if (!response.ok) throw new Error('Failed to fetch credit card transactions');

      const data = await response.json();
      setCreditCardTransactions(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchBankBalances = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/get-current-balance-by-bank');
      if (!response.ok) throw new Error('Failed to fetch bank balances');
      const data = await response.json();
      setBankBalances(data.balance_by_bank || {});
    } catch (err) {
      console.error('Error fetching bank balances:', err);
    }
  };

  const processCategories = (data) => {
    const categories = data.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + Math.abs(expense.amount);
      return acc;
    }, {});
    setCategoryData(categories);

    // Process top categories
    const sortedCategories = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 100);
    setTopCategories(sortedCategories);

    // Process sub-categories
    const subCategoriesData = data.reduce((acc, expense) => {
      if (!acc[expense.sub_category]) {
        acc[expense.sub_category] = 0;
      }
      acc[expense.sub_category] += Math.abs(expense.amount);
      return acc;
    }, {});

    // Get top 10 sub-categories
    const sortedSubCategories = Object.entries(subCategoriesData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    setTopSubCategories(sortedSubCategories);

    // Process sub-categories for the top spending category
    if (sortedCategories.length > 0) {
      const topCategory = sortedCategories[0][0];
      const subCatsForTopCategory = data.reduce((acc, expense) => {
        if (expense.category === topCategory) {
          if (!acc[expense.sub_category]) {
            acc[expense.sub_category] = 0;
          }
          acc[expense.sub_category] += Math.abs(expense.amount);
        }
        return acc;
      }, {});
      setSelectedCategorySubcats(subCatsForTopCategory);
    }
  };

  const processWeeklyTrends = (data) => {
    const weeklyData = data.reduce((acc, expense) => {
      const date = new Date(expense.date_time);
      const dayOfWeek = date.getDay();
      acc[dayOfWeek] = (acc[dayOfWeek] || 0) + Math.abs(expense.amount);
      return acc;
    }, {});

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const trends = daysOfWeek.map((day, index) => ({
      day,
      amount: weeklyData[index] || 0
    }));

    setWeeklyTrends(trends);
  };

  const prepareChartData = () => {
    const groupedData = expenses.reduce((acc, expense) => {
      const formattedDate = expense.date_time.split('T')[0];
      acc[formattedDate] = (acc[formattedDate] || 0) + Math.abs(expense.amount);
      return acc;
    }, {});

    const sortedDates = Object.keys(groupedData).sort();
    const formattedDates = sortedDates.map(date => {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year.slice(2)}`;
    });
    
    return {
      labels: formattedDates,
      datasets: [
        {
          label: '',  // Removed 'Expenses' label
          data: sortedDates.map(date => groupedData[date]),
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  const colors = [
    'rgba(99, 102, 241, 1)',   // Indigo
    'rgba(236, 72, 153, 1)',   // Pink
    'rgba(234, 179, 8, 1)',    // Yellow
    'rgba(34, 197, 94, 1)',    // Green
    'rgba(239, 68, 68, 1)',    // Red
    'rgba(161, 98, 247, 1)',   // Purple
    'rgba(14, 165, 233, 1)',   // Sky
    'rgba(249, 115, 22, 1)',   // Orange
  ];

  const prepareCategoryData = () => ({
    labels: Object.keys(categoryData),
    datasets: [{
      data: Object.values(categoryData),
      backgroundColor: colors.map(color => color.replace('1)', '0.8)')),
      borderWidth: 1,
    }],
  });

  const prepareWeeklyTrendData = () => ({
    labels: weeklyTrends.map(t => t.day),
    datasets: [{
      label: 'Daily Average',
      data: weeklyTrends.map(t => t.amount),
      // backgroundColor: 'rgba(34, 197, 94, 0.2)',
      // borderColor: 'rgba(34, 197, 94, 1)',

      backgroundColor: 'rgba(6, 182, 212, 0.2)', // Cyan-400
      borderColor: 'rgba(6, 182, 212, 1)', // Cyan-600
      
      borderWidth: 2,
    }],
  });

  const prepareCategoryTrendData = () => {
    // Group expenses by date and category
    const groupedData = expenses.reduce((acc, expense) => {
      const date = expense.date_time.split('T')[0];
      if (!acc[expense.category]) {
        acc[expense.category] = {};
      }
      acc[expense.category][date] = (acc[expense.category][date] || 0) + Math.abs(expense.amount);
      return acc;
    }, {});

    // Get unique sorted dates
    const dates = [...new Set(expenses.map(e => e.date_time.split('T')[0]))].sort();
    
    // Format dates for display (DD/MM/YY)
    const formattedDates = dates.map(date => {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year.slice(2)}`;
    });

    // Create datasets for each category
    const datasets = Object.entries(groupedData).map(([category, dateValues], index) => ({
      label: category,
      data: dates.map(date => dateValues[date] || 0),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length].replace('1)', '0.1)'),
      borderWidth: 2,
      tension: 0.4,
      fill: false,
      pointRadius: 3,
      pointHoverRadius: 5,
    }));

    return {
      labels: formattedDates,
      datasets,
    };
  };

  const prepareTopSubCategoriesData = () => ({
    labels: topSubCategories.map(([subCat]) => subCat),
    datasets: [{
      label: 'Amount',
      data: topSubCategories.map(([, amount]) => amount),
      // backgroundColor: 'rgba(59, 130, 246, 0.2)', // Light blue fill
      // borderColor: 'rgba(59, 130, 246, 1)', // Solid blue border
      backgroundColor: 'rgba(139, 92, 246, 0.2)', // Purple-400
      borderColor: 'rgba(139, 92, 246, 1)', // Purple-600
      borderWidth: 2,
    }],
  });

  const prepareSelectedCategorySubcatsData = () => ({
    labels: Object.keys(selectedCategorySubcats),
    datasets: [{
      data: Object.values(selectedCategorySubcats),
      backgroundColor: colors.map(color => color.replace('1)', '0.7)')),
      borderWidth: 1,
    }],
  });

  const prepareIncomeVsExpenseData = () => {
    // Get the last 12 months
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.unshift({
        year: date.getFullYear(),
        month: date.getMonth(),
        label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      });
    }

    // Group both income and expenses by month
    const groupedData = months.reduce((acc, { year, month }) => {
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;
      acc[key] = { income: 0, expense: 0 };
      return acc;
    }, {});

    // Process expenses
    expenses.forEach(expense => {
      const date = new Date(expense.date_time);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (groupedData[key]) {
        groupedData[key].expense += Math.abs(expense.amount);
      }
    });

    // Process income
    incomeData.forEach(income => {
      const date = new Date(income.date_time);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (groupedData[key]) {
        groupedData[key].income += income.amount;
      }
    });

    return {
      labels: months.map(m => m.label),
      datasets: [
        {
          label: 'Income',
          data: months.map(m => {
            const key = `${m.year}-${String(m.month + 1).padStart(2, '0')}`;
            return groupedData[key]?.income || 0;
          }),
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgba(34, 197, 94, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
        {
          label: 'Expenses',
          data: months.map(m => {
            const key = `${m.year}-${String(m.month + 1).padStart(2, '0')}`;
            return groupedData[key]?.expense || 0;
          }),
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgba(239, 68, 68, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }
      ],
    };
  };

  const prepareCategoryBudgetsData = () => {
    // Define the allowed categories from the dropdown
    const allowedCategories = [
      'Food & Dining',
      'Transportation',
      'Shopping',
      'Housing',
      'Personal Care',
      'Entertainment',
      'Healthcare',
      'Education',
      'Miscellaneous',
      'Debt',
      'Taxes & Insurance',
      'Others',
    ];

    // Filter categories to only include allowed ones
    const filteredCategories = Object.keys(categoryData).filter(category => 
      allowedCategories.includes(category)
    );

    const budgets = filteredCategories.map(category => categoryBudgets[category] || 0);
    const spent = filteredCategories.map(category => categoryData[category] || 0);
    
    // Calculate percentages for tooltip
    const percentages = filteredCategories.map((category, index) => {
      const budget = budgets[index];
      const spentAmount = spent[index];
      return budget > 0 ? ((spentAmount / budget) * 100).toFixed(1) : 0;
    });

    return {
      labels: filteredCategories,
      datasets: [
        {
          label: 'Budget',
          data: budgets,
          // backgroundColor: 'rgba(34, 197, 94, 0.2)', // Light green
          // borderColor: 'rgba(34, 197, 94, 1)', // Green
          backgroundColor: 'rgba(59, 130, 246, 0.2)', // Blue-200
          borderColor: 'rgba(59, 130, 246, 1)', // Blue-500
          borderWidth: 2,
          barPercentage: 0.7,
          categoryPercentage: 0.9,
        },
        {
          label: 'Spent',
          data: spent,
          // backgroundColor: 'rgba(239, 68, 68, 0.2)', // Light red
          // borderColor: 'rgba(239, 68, 68, 1)', // Red

          backgroundColor: 'rgba(251, 146, 60, 0.2)', // Orange-200
          borderColor: 'rgba(251, 146, 60, 1)', // Orange-500
          borderWidth: 2,
          barPercentage: 0.7,
          categoryPercentage: 0.9,
        }
      ],
    };
  };

  const prepareCreditCardChartData = () => {
    // Group transactions by month instead of day for better visualization
    const groupedData = creditCardTransactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date_time);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthYear] = (acc[monthYear] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {});

    // Sort dates
    const sortedDates = Object.keys(groupedData).sort();
    
    // Format dates for display (Month Year)
    const formattedDates = sortedDates.map(date => {
      const [year, month] = date.split('-');
      const monthName = new Date(2000, parseInt(month) - 1).toLocaleString('default', { month: 'short' });
      return `${monthName} ${year}`;
    });

    return {
      labels: formattedDates,
      datasets: [
        {
          label: 'Credit Card Expenses',
          data: sortedDates.map(date => groupedData[date]),
          // backgroundColor: 'rgba(99, 102, 241, 0.1)',
          // borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(248, 113, 113, 0.1)',
          borderColor: 'rgba(220, 38, 38, 1)',
      // deep yellow border
          
          
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,  // Hide legend since we don't have a label
      },
      title: {
        display: false,  // Remove title
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          size: 14,
          family: "'Inter', sans-serif",
        },
        callbacks: {
          label: (context) => `₹${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
          },
          callback: (value) => `₹${value.toLocaleString()}`,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => `₹${context.raw.toLocaleString()} (${((context.raw / summary.total) * 100).toFixed(1)}%)`,
        },
      },
    },
    cutout: '60%',
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  const weeklyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => `₹${context.raw.toLocaleString()}`,
        },
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
          },
          callback: (value) => `₹${value.toLocaleString()}`,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
          },
        },
      },
    }
  };
  const calculateSummary = () => {
    // console.log("expenses", expenses);
    if (!expenses.length) return { 
      total: 0, 
      topCategory: { name: 'N/A', amount: 0 },
      topSingleTransaction: { category: 'N/A', subCategory: 'N/A', amount: 0 },
      highest: 0 
    };
    
    const total = expenses.reduce((sum, exp) => sum + Math.abs(exp.amount), 0);
    
    // Find the transaction with the highest amount
    const highestTransaction = expenses.reduce((max, current) => 
      Math.abs(current.amount) > Math.abs(max.amount) ? current : max, expenses[0]);
    
    const highest = Math.abs(highestTransaction.amount);
    
    // Calculate top categories
    const categoryMap = {};
    expenses.forEach(exp => {
      const category = exp.category;
      if (!categoryMap[category]) categoryMap[category] = 0;
      categoryMap[category] += Math.abs(exp.amount);
    });
    
    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1]);
    
    const topCategory = topCategories[0] || ['N/A', 0];
    
    // console.log("top category = ", topCategory);
    // console.log("highest transaction = ", highestTransaction);
    
    return { 
      total, 
      topCategory: { name: topCategory[0], amount: topCategory[1] },
      topSingleTransaction: { 
        category: highestTransaction.category, 
        subCategory: highestTransaction.sub_category, 
        notes:highestTransaction.notes,
        amount: Math.abs(highestTransaction.amount) 
      },
      highest 
    };
  };
  // const calculateSummary = () => {
  //   console.log("expenses", expenses);
  //   if (!expenses.length) return { total: 0, topCategory: { name: 'N/A', amount: 0 }, highest: 0 };
    
  //   const total = expenses.reduce((sum, exp) => sum + Math.abs(exp.amount), 0);
  //   const highest = Math.max(...expenses.map(exp => Math.abs(exp.amount)));
  //   const topCategory = topCategories[0] || ['N/A', 0];
  //   console.log("top category = ", topCategory);
  //   return { 
  //     total, 
  //     topCategory: { name: topCategory[0], amount: topCategory[1] },
  //     highest 
  //   };
  // };

  const summary = calculateSummary();
  // console.log("summary = ", summary);
  const getTimeRangeLabel = () => {
    if (customRange === 'last7') return 'Weekely';
    if (customRange === 'last30') return 'Monthly';
    if (customRange === 'last90') return 'Quarterly';
    if (customRange === 'last365') return 'Annually';
    if (customRange.includes('-')) {
      const [year, month] = customRange.split('-').map(Number);
      const date = new Date(year, month - 1);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }
    return 'Custom Range';
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading your financial data...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-title-group">
          <FaChartArea className="header-icon" />
          <h1>Expense Trend</h1>
          <span className="time-separator">|</span>
          <span className="time-label">{getTimeRangeLabel()}</span>
        </div>
        <div className="dashboard-controls">
          <select 
            value={customRange} 
            onChange={(e) => setCustomRange(e.target.value)}
            className="time-range-select"
          >
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="last90">Last 90 Days</option>
            <option value="last365">Last Year</option>
            <optgroup label="Monthly">
              {getLastSixMonths().map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </optgroup>
          </select>
          <select 
            value={chartType} 
            onChange={(e) => setChartType(e.target.value)}
            className="chart-type-select"
          >
            <option value="line">Line Graph</option>
            <option value="bar">Bar Graph</option>
          </select>
        </div>
      </div>
      
      <div className="summary-cards">
        <div className="summary-card total">
          <div className="card-icon">
            <FaWallet />
          </div>
          <div className="card-content">
            <h3>Total Expenses</h3>
            <p className="amount">₹{summary.total.toLocaleString()}</p>
            <p className="label">{getTimeRangeLabel()}</p>
          </div>
        </div>
        <div className="summary-card top-category">
          <div className="card-icon">
            <FaTags />
          </div>
          <div className="card-content">
            <h3>Top Spending Category</h3>
            <p className="amount">₹{summary.topCategory.amount.toLocaleString()}</p>
            <p className="label">{summary.topCategory.name}</p>
          </div>
        </div>
        <div className="summary-card highest">
          <div className="card-icon">
            <FaArrowUp />
          </div>
          <div className="card-content">
            <h3>Highest Expense</h3>
            <p className="amount">₹{summary.highest.toLocaleString()}</p>
            <p className="label">{summary.topSingleTransaction.subCategory} (Single Transaction)</p>
          </div>
        </div>
        <div className="summary-card balance">
          <div className="card-icon">
            <FaWallet />
          </div>
          <div className="card-content">
            <h3>Current Balance</h3>
            <p className="amount" style={{ color: currentBalance >= 0 ? '#22c55e' : '#ef4444' }}>
              ₹{Math.abs(currentBalance).toLocaleString()}
            </p>
            <p className="label">{currentBalance >= 0 ? 'Positive Balance' : 'Warning Negative Balance'}</p>
            <div className="bank-balances-tooltip">
              {Object.entries(bankBalances).map(([bank, bal]) => (
                <div key={bank} className="bank-balance-item">
                  <div className="bank-info">
                    <FaUniversity className="bank-icon" />
                    <span className="bank-name">{bank}</span>
                  </div>
                  <span className={`bank-amount ${bal < 500 ? 'bank-amount--red' : 'bank-amount--green'}`}>
                    ₹{bal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="main-chart">
          <h2><FaChartLine /> Expense Trend</h2>
          <div className="chart-container">
            {chartType === 'line' && <Line data={prepareChartData()} options={chartOptions} />}
            {chartType === 'bar' && <Bar data={prepareChartData()} options={chartOptions} />}
          </div>
        </div>

        <div className="credit-card-chart">
          <h2><FaChartLine /> Credit Card Expenses</h2>
          <div className="chart-container">
            <Line 
              data={prepareCreditCardChartData()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 12,
                      usePointStyle: true,
                      pointStyle: 'circle'
                    }
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1f2937',
                    bodyColor: '#1f2937',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    bodyFont: {
                      size: 14,
                      family: "'Inter', sans-serif",
                    },
                    callbacks: {
                      label: (context) => `₹${context.parsed.y.toLocaleString()}`,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                      drawBorder: false,
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                      },
                      callback: (value) => `₹${value.toLocaleString()}`,
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                      },
                      maxRotation: 45,
                      minRotation: 45,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="category-chart">
          <h2><FaChartPie /> Category Distribution</h2>
          <div className="chart-container">
            <Doughnut data={prepareCategoryData()} options={doughnutOptions} />
          </div>
        </div>

        <div className="category-trend-chart">
          <h2><FaChartLine /> Category Trends</h2>
          <div className="chart-container">
            <Line 
              data={prepareCategoryTrendData()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 12,
                      usePointStyle: true,
                      pointStyle: 'circle'
                    }
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                  }
                },
                scales: {
                  x: {
                    grid: {
                      display: false
                    }
                  },
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)'
                    }
                  }
                },
                interaction: {
                  mode: 'nearest',
                  axis: 'x',
                  intersect: false
                }
              }}
            />
          </div>
        </div>

        <div className="top-categories">
          <h2><FaChartLine /> Top Spending Categories</h2>
          <div className="top-categories-list">
            {topCategories.map(([category, amount], index) => (
              <div key={category} className="top-category-item">
                <div className="category-rank" style={{ 
                  backgroundColor: colors[index % colors.length].replace('1)', '0.1)'),
                  color: colors[index % colors.length],
                  border: `2px solid ${colors[index % colors.length]}`
                }}>
                  {index + 1}
                </div>
                <div className="category-info">
                  <span className="category-name" style={{ 
                    color: colors[index % colors.length]
                  }}>
                    {category}
                  </span>
                  <span className="category-amount">₹{amount.toLocaleString()}</span>
                </div>
                <div className="category-bar-container">
                  <div 
                    className="category-bar"
                    style={{ 
                      width: `${(amount / topCategories[0][1]) * 100}%`,
                      backgroundColor: colors[index % colors.length],
                      opacity: 0.8
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="subcategory-chart">
          <h2><FaChartBar /> Top Sub-Categories</h2>
          <div className="chart-container">
            <Bar 
              data={prepareTopSubCategoriesData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1f2937',
                    bodyColor: '#1f2937',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                      label: (context) => `₹${context.raw.toLocaleString()}`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                      drawBorder: false,
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                      },
                      callback: (value) => `₹${value.toLocaleString()}`,
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                      },
                    },
                  },
                }
              }}
            />
          </div>
        </div>

        <div className="category-budgets-chart">
          <h2><FaChartBar /> Categories & Budgets</h2>
          <div className="chart-container">
            <Bar 
              data={prepareCategoryBudgetsData()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  // legend: {
                  //   display: false
                  // },
                  tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1f2937',
                    bodyColor: '#1f2937',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                      label: (context) => {
                        const dataset = context.dataset;
                        const value = context.parsed.y;
                        const category = context.label;
                        const budget = dataset.label === 'Budget' ? value : 
                          context.chart.data.datasets[0].data[context.dataIndex];
                        const spent = dataset.label === 'Spent' ? value : 
                          context.chart.data.datasets[1].data[context.dataIndex];
                        
                        if (dataset.label === 'Budget') {
                          return `Budget: ₹${value.toLocaleString()}`;
                        } else {
                          const percentage = budget > 0 ? ((spent / budget) * 100).toFixed(1) : 0;
                          return `Spent: ₹${value.toLocaleString()} (${percentage}% of budget)`;
                        }
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                      drawBorder: false,
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                      },
                      callback: (value) => `₹${value.toLocaleString()}`,
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                      },
                      maxRotation: 45,
                      minRotation: 45,
                    },
                  },
                },
                interaction: {
                  mode: 'index',
                  intersect: false,
                }
              }}
            />
          </div>
        </div>

        <div className="weekly-trend-chart">
          <h2><FaChartBar /> Weekly Spending Pattern</h2>
          <div className="chart-container">
            <Bar data={prepareWeeklyTrendData()} options={weeklyChartOptions} />
          </div>
        </div>

        <div className="category-trend-chart">
          <h2><FaChartLine /> Income vs Expenses</h2>
          <div className="chart-container">
            <Line 
              data={prepareIncomeVsExpenseData()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 12,
                      usePointStyle: true,
                      pointStyle: 'circle'
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1f2937',
                    bodyColor: '#1f2937',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                      label: (context) => `₹${context.raw.toLocaleString()}`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                      drawBorder: false,
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                      },
                      callback: (value) => `₹${value.toLocaleString()}`,
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                      },
                    },
                  },
                }
              }}
            />
          </div>
        </div>
      
      </div>
    </div>
  );
};

export default Dashboard;