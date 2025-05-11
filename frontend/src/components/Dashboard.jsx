import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  FaChartLine,
  FaChartBar,
  FaWallet,
  FaTags,
  FaArrowUp,
  FaCalendarAlt,
  FaChartArea,
  FaUniversity,
  FaTimes,
  FaMoneyBillWave,
  FaLayerGroup,
  FaInfoCircle,
} from "react-icons/fa";
import "../styles/Dashboard.css";
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("line");
  const [timeRange, setTimeRange] = useState("month");
  const [customRange, setCustomRange] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
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
  const [savingsRateData, setSavingsRateData] = useState([]);
  const [savingsRateExpenses, setSavingsRateExpenses] = useState([]);
  const [savingsRateIncome, setSavingsRateIncome] = useState([]);
  const [incomeVsExpensesData, setIncomeVsExpensesData] = useState({ income: [], expenses: [] });
  const [lentBalance, setLentBalance] = useState(5000);
  const [cibilScore, setCibilScore] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedCategoryTransactions, setSelectedCategoryTransactions] = useState([]);
  const [showCategoryTransactionsModal, setShowCategoryTransactionsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isSlidingOut, setIsSlidingOut] = useState(false);
  const [selectedWeekTransactions, setSelectedWeekTransactions] = useState([]);
  const [showWeekTransactionsModal, setShowWeekTransactionsModal] = useState(false);

  const colors = [
    { color: '#3b82f6', rgb: '59, 130, 246' },  // Blue
    { color: '#ec4899', rgb: '236, 72, 153' },   // Pink
    { color: '#eab308', rgb: '234, 179, 8' },    // Yellow
    { color: '#22c55e', rgb: '34, 197, 94' },    // Green
    { color: '#ef4444', rgb: '239, 68, 68' },    // Red
    { color: '#a162f7', rgb: '161, 98, 247' },   // Purple
    { color: '#0ea5e9', rgb: '14, 165, 233' },   // Sky
    { color: '#f97316', rgb: '249, 115, 22' },   // Orange
  ];

  // Generate last 6 months options
  const getLastSixMonths = () => {
    const months = [];
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}`,
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
    fetchLentBalance();
    fetchCibilScore();
  }, [timeRange, customRange]);

  // Separate useEffect for savings rate and income vs expenses
  useEffect(() => {
    fetchSavingsRateData();
    fetchIncomeVsExpensesData();
  }, []); // This will run only once when component mounts

  // Add event listener for expense updates
  useEffect(() => {
    const handleExpenseUpdate = () => {
      fetchExpenses();
    };

    window.addEventListener("expenseUpdated", handleExpenseUpdate);

    return () => {
      window.removeEventListener("expenseUpdated", handleExpenseUpdate);
    };
  }, [timeRange, customRange]); // Restore the dependencies

  const fetchExpenses = async () => {
    try {
      const now = new Date();
      let startDate,
        endDate = new Date();

      if (customRange === "last7") {
        startDate = new Date(now.setDate(now.getDate() - 7));
      } else if (customRange === "last30") {
        startDate = new Date(now.setDate(now.getDate() - 30));
      } else if (customRange === "last90") {
        startDate = new Date(now.setDate(now.getDate() - 90));
      } else if (customRange === "last365") {
        startDate = new Date(now.setDate(now.getDate() - 365));
      } else if (customRange.includes("-")) {
        // Handle specific month selection
        const [year, month] = customRange.split("-").map(Number);
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0); // Last day of selected month
      }

      const response = await fetch(
        `http://127.0.0.1:8000/get-all-expense-transactions?start_date=${
          startDate.toISOString().split("T")[0]
        }&end_date=${endDate.toISOString().split("T")[0]}`
      );

      if (!response.ok) throw new Error("Failed to fetch expenses");

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
      let startDate,
        endDate = new Date();

      if (customRange === "last7") {
        startDate = new Date(now.setDate(now.getDate() - 7));
      } else if (customRange === "last30") {
        startDate = new Date(now.setDate(now.getDate() - 30));
      } else if (customRange === "last90") {
        startDate = new Date(now.setDate(now.getDate() - 90));
      } else if (customRange === "last365") {
        startDate = new Date(now.setDate(now.getDate() - 365));
      } else if (customRange.includes("-")) {
        const [year, month] = customRange.split("-").map(Number);
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0);
      }

      const response = await fetch(
        `http://127.0.0.1:8000/get-all-income-transactions?start_date=${
          startDate.toISOString().split("T")[0]
        }&end_date=${endDate.toISOString().split("T")[0]}`
      );

      if (!response.ok) throw new Error("Failed to fetch income");

      const data = await response.json();
      setIncomeData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCategoryBudgets = async () => {
    try {
      const now = new Date();
      const monthNames = [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec",
      ];
      const currentMonth = monthNames[now.getMonth()];
      const currentYear = now.getFullYear().toString();

      const response = await fetch(
        `http://127.0.0.1:8000/get-category-by-month-and-year?month=${currentMonth}&year=${currentYear}`
      );

      if (!response.ok) throw new Error("Failed to fetch category budgets");

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
      console.error("Error fetching category budgets:", err);
    }
  };

  const fetchCurrentBalance = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/current-balance");
      if (!response.ok) throw new Error("Failed to fetch current balance");
      const data = await response.json();
      setCurrentBalance(data.current_balance);
    } catch (err) {
      console.error("Error fetching current balance:", err);
    }
  };

  const fetchCreditCardTransactions = async () => {
    try {
      const now = new Date();
      let startDate,
        endDate = new Date();
      // if(!customRange.includes('-')){
      startDate = new Date(now.setDate(now.getDate() - 365));
      // if (customRange === 'last7') {
      //   startDate = new Date(now.setDate(now.getDate() - 7));
      // } else if (customRange === 'last30') {
      //   startDate = new Date(now.setDate(now.getDate() - 30));
      // } else if (customRange === 'last90') {
      //   startDate = new Date(now.setDate(now.getDate() - 90));
      // } else if (customRange === 'last365') {
      //   startDate = new Date(now.setDate(now.getDate() - 365));
      // } else if (customRange.includes('-')) {
      //   const [year, month] = customRange.split('-').map(Number);
      //   startDate = new Date(year, month - 1, 1);
      //   endDate = new Date(year, month, 0);
      // }

      const response = await fetch(
        `http://localhost:8000/get-credit-card-transaction-by-date-range?start_date=${
          startDate.toISOString().split("T")[0]
        }&end_date=${endDate.toISOString().split("T")[0]}`
      );

      if (!response.ok)
        throw new Error("Failed to fetch credit card transactions");

      const data = await response.json();
      setCreditCardTransactions(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchBankBalances = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/get-current-balance-by-bank"
      );
      if (!response.ok) throw new Error("Failed to fetch bank balances");
      const data = await response.json();
      setBankBalances(data.balance_by_bank || {});
    } catch (err) {
      console.error("Error fetching bank balances:", err);
    }
  };

  const fetchLentBalance = async () => {
    try {
      // This is a placeholder. Replace with actual API call when available
      // const response = await fetch("http://127.0.0.1:8000/get-lent-balance");
      // if (!response.ok) throw new Error("Failed to fetch lent balance");
      // const data = await response.json();
      // setLentBalance(data.lent_balance);
      setLentBalance(5000); // Placeholder value
    } catch (err) {
      console.error("Error fetching lent balance:", err);
    }
  };

  const fetchSavingsRateData = async () => {
    try {
      const now = new Date();
      const endDate = new Date();
      const startDate = new Date(now.setMonth(now.getMonth() - 11)); // Last 12 months

      const [expenseResponse, incomeResponse] = await Promise.all([
        fetch(`http://127.0.0.1:8000/get-all-expense-transactions?start_date=${startDate.toISOString().split("T")[0]}&end_date=${endDate.toISOString().split("T")[0]}`),
        fetch(`http://127.0.0.1:8000/get-all-income-transactions?start_date=${startDate.toISOString().split("T")[0]}&end_date=${endDate.toISOString().split("T")[0]}`)
      ]);

      if (!expenseResponse.ok || !incomeResponse.ok) 
        throw new Error("Failed to fetch data for savings rate");

      const expenseData = await expenseResponse.json();
      const incomeData = await incomeResponse.json();

      setSavingsRateExpenses(expenseData);
      setSavingsRateIncome(incomeData);

      // Process the data by month
      const monthlyData = {};
      
      // Process expenses
      expenseData.forEach(expense => {
        const date = new Date(expense.date_time);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { expenses: 0, income: 0 };
        }
        monthlyData[monthKey].expenses += Math.abs(expense.amount);
      });

      // Process income
      incomeData.forEach(income => {
        const date = new Date(income.date_time);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { expenses: 0, income: 0 };
        }
        monthlyData[monthKey].income += income.amount;
      });

      // Convert to array and sort by date
      const processedData = Object.entries(monthlyData)
        .map(([date, data]) => ({
          date,
          savingsRate: data.income > 0 ? ((data.income - data.expenses) / data.income * 100) : 0
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setSavingsRateData(processedData);
    } catch (err) {
      console.error("Error fetching savings rate data:", err);
    }
  };

  const fetchIncomeVsExpensesData = async () => {
    try {
      const now = new Date();
      const endDate = new Date();
      const startDate = new Date(now.setMonth(now.getMonth() - 11)); // Last 12 months

      const [expenseResponse, incomeResponse] = await Promise.all([
        fetch(`http://127.0.0.1:8000/get-all-expense-transactions?start_date=${startDate.toISOString().split("T")[0]}&end_date=${endDate.toISOString().split("T")[0]}`),
        fetch(`http://127.0.0.1:8000/get-all-income-transactions?start_date=${startDate.toISOString().split("T")[0]}&end_date=${endDate.toISOString().split("T")[0]}`)
      ]);

      if (!expenseResponse.ok || !incomeResponse.ok) 
        throw new Error("Failed to fetch data for income vs expenses");

      const expenseData = await expenseResponse.json();
      const incomeData = await incomeResponse.json();

      setIncomeVsExpensesData({ income: incomeData, expenses: expenseData });
    } catch (err) {
      console.error("Error fetching income vs expenses data:", err);
    }
  };

  const fetchCibilScore = async () => {
    try {
      let response;
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();

      if (customRange === "last7" || customRange === "last30" || customRange === "last90" || customRange === "last365") {
        // For current month, fetch the latest score
        response = await fetch("http://127.0.0.1:8000/get-current-cibil-score");
        if (!response.ok) throw new Error("Failed to fetch CIBIL score");
        const data = await response.json();
        setCibilScore(data);
      } else if (customRange.includes("-")) {
        // For specific month, fetch score for that month
        const [year, month] = customRange.split("-");
        
        // If selected month is current month, use current CIBIL score
        if (parseInt(year) === currentYear && parseInt(month) === currentMonth) {
          response = await fetch("http://127.0.0.1:8000/get-current-cibil-score");
          if (!response.ok) throw new Error("Failed to fetch CIBIL score");
          const data = await response.json();
          setCibilScore(data);
        } else {
          // For other months, fetch historical score
          const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
          response = await fetch(`http://127.0.0.1:8000/get-cibil-score-by-month-and-year?month=${monthNames[parseInt(month) - 1]}&year=${year}`);
          if (!response.ok) throw new Error("Failed to fetch CIBIL score");
          const scores = await response.json();
          // Get the latest score for that month (first in the array since we order by date desc)
          if (scores && scores.length > 0) {
            setCibilScore(scores[0]);
          } else {
            setCibilScore(null);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching CIBIL score:", err);
      setCibilScore(null);
    }
  };

  const processCategories = (data) => {
    const categories = data.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = {
          total: 0,
          topExpense: { amount: 0, notes: '', id: null }
        };
      }
      acc[expense.category].total += Math.abs(expense.amount);
      
      // Update top expense if current expense is larger
      if (Math.abs(expense.amount) > acc[expense.category].topExpense.amount) {
        acc[expense.category].topExpense = {
          amount: Math.abs(expense.amount),
          notes: expense.notes || '',
          id: expense.id
        };
      }
      return acc;
    }, {});
    setCategoryData(categories);

    // Process top categories
    const sortedCategories = Object.entries(categories)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 9);
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

    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const trends = daysOfWeek.map((day, index) => ({
      day,
      amount: weeklyData[index] || 0,
    }));

    setWeeklyTrends(trends);
  };

  const prepareChartData = () => {
    const groupedData = expenses.reduce((acc, expense) => {
      const formattedDate = expense.date_time.split("T")[0];
      acc[formattedDate] = (acc[formattedDate] || 0) + Math.abs(expense.amount);
      return acc;
    }, {});

    const sortedDates = Object.keys(groupedData).sort();
    const formattedDates = sortedDates.map((date) => {
      const [, , day] = date.split("-");
      return day; // Only return the day
    });

    const values = sortedDates.map(date => groupedData[date]);
    
    // Function to get color based on amount with specific thresholds
    const getColorForAmount = (amount) => {
      if (amount <= 1000) {
        return '#22c55e'; // Green for 0-1000
      } else if (amount <= 5000) {
        return '#fb923c'; // Lighter orange for 1000-5000
      } else {
        return '#ef4444'; // Red for >5000
      }
    };

    // Create a single dataset with dynamic colors
    const dataset = {
      data: values,
      borderColor: values.map(value => getColorForAmount(value)),
      backgroundColor: values.map(value => {
        const color = getColorForAmount(value);
        return color.replace(')', ', 0.2)'); // Add opacity for fill
      }),
      fill: true,
      tension: 0,
      borderWidth: 3,
      pointRadius: 5,
      pointHoverRadius: 8,
      pointBackgroundColor: values.map(value => getColorForAmount(value)),
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointStyle: 'circle',
      pointHoverBackgroundColor: values.map(value => getColorForAmount(value)),
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 3,
      borderDash: [],
      borderJoinStyle: 'miter',
      borderCapStyle: 'butt',
      segment: {
        borderColor: (ctx) => {
          const value = ctx.p1.parsed.y;
          return getColorForAmount(value);
        },
        backgroundColor: (ctx) => {
          const value = ctx.p1.parsed.y;
          const color = getColorForAmount(value);
          return color.replace(')', ', 0.2)'); // Add opacity for fill
        }
      }
    };

    return {
      labels: formattedDates,
      datasets: [dataset],
    };
  };

  const prepareWeeklyTrendData = () => {
    const data = weeklyTrends.map((t, index) => ({
      day: t.day,
      amount: t.amount,
      trend: index > 0 ? t.amount - weeklyTrends[index - 1].amount : 0
    }));

    return {
      labels: data.map(t => t.day),
      datasets: [
        {
          label: "Daily Average",
          data: data.map(t => t.amount),
          borderColor: data.map(item => 
            item.trend >= 0 ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)'
          ),
          backgroundColor: 'rgba(231, 225, 231, 0.34)', // Light grey fill
          borderWidth: 2,
          tension: 0,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: data.map(item => 
            item.trend >= 0 ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)'
          ),
          segment: {
            borderColor: (ctx) => {
              if (!ctx.p0.parsed || !ctx.p1.parsed) return 'rgba(34, 197, 94, 1)';
              return ctx.p1.parsed.y >= ctx.p0.parsed.y ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)';
            }
          }
        }
      ]
    };
  };

  const prepareCategoryTrendData = () => {
    // Group expenses by date and category
    const groupedData = expenses.reduce((acc, expense) => {
      const date = expense.date_time.split("T")[0];
      if (!acc[expense.category]) {
        acc[expense.category] = {};
      }
      acc[expense.category][date] =
        (acc[expense.category][date] || 0) + Math.abs(expense.amount);
      return acc;
    }, {});

    // Get unique sorted dates
    const dates = [
      ...new Set(expenses.map((e) => e.date_time.split("T")[0])),
    ].sort();

    // Format dates for display (DD/MM)
    const formattedDates = dates.map((date) => {
      const [, month, day] = date.split("-");
      return `${day}/${month}`;
    });

    // Calculate total amount for each category
    const categoryTotals = Object.entries(groupedData).map(([category, dateValues]) => ({
      category,
      total: Object.values(dateValues).reduce((sum, val) => sum + val, 0)
    }));

    // Sort categories by total amount
    categoryTotals.sort((a, b) => b.total - a.total);

    // Create datasets for each category
    const datasets = Object.entries(groupedData).map(
      ([category, dateValues], index) => {
        // Find the rank of this category
        const categoryRank = categoryTotals.findIndex(c => c.category === category);
        return {
          label: category,
          data: dates.map((date) => dateValues[date] || 0),
          borderColor: colors[index % colors.length].color,
          backgroundColor: colors[index % colors.length].color.replace("1)", "0.1)"),
          borderWidth: 2,
          tension: 0,
          fill: false,
          pointRadius: 3,
          pointHoverRadius: 5,
          hidden: categoryRank >= 3 // Hide all categories except top 3
        };
      }
    );

    return {
      labels: formattedDates,
      datasets,
    };
  };

  const prepareTopSubCategoriesData = () => {
    const data = topSubCategories.map(([subCat, amount]) => ({
      subCat,
      amount
    }));

    // Sort data by amount for color coding
    const sortedData = [...data].sort((a, b) => b.amount - a.amount);
    const maxAmount = sortedData[0]?.amount || 0;

    // Function to get color based on amount percentage
    const getColorForAmount = (amount) => {
      const percentage = amount / maxAmount;
      if (percentage <= 0.3) {
        return {
          bg: 'rgba(34, 197, 94, 0.2)',  // Green with opacity
          border: 'rgba(34, 197, 94, 1)'  // Solid green
        };
      } else if (percentage <= 0.6) {
        return {
          bg: 'rgba(234, 179, 8, 0.2)',   // Yellow with opacity
          border: 'rgba(234, 179, 8, 1)'  // Solid yellow
        };
      } else {
        return {
          bg: 'rgba(239, 68, 68, 0.2)',   // Red with opacity
          border: 'rgba(239, 68, 68, 1)'  // Solid red
        };
      }
    };

    // Reverse the data array to mirror the y-axis
    const reversedData = [...data].reverse();

    return {
      labels: reversedData.map(item => item.subCat),
      datasets: [{
        label: "Amount",
        data: reversedData.map(item => item.amount),
        backgroundColor: reversedData.map(item => getColorForAmount(item.amount).bg),
        borderColor: reversedData.map(item => getColorForAmount(item.amount).border),
        borderWidth: 2,
        borderRadius: 4,
        barThickness: 20,
      }],
    };
  };

  const prepareSelectedCategorySubcatsData = () => ({
    labels: Object.keys(selectedCategorySubcats),
    datasets: [
      {
        data: Object.values(selectedCategorySubcats),
        backgroundColor: colors.map((color) => color.color.replace("1)", "0.7)")),
        borderWidth: 1,
      },
    ],
  });

  const prepareIncomeVsExpenseData = () => {
    // Get the last 12 months starting from January 2025
    const months = [];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    
    // Start from January 2025
    const startDate = new Date(2025, 0, 1); // January 2025
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
      });
    }

    // Group both income and expenses by month
    const groupedData = months.reduce((acc, { year, month }) => {
      const key = `${year}-${String(month + 1).padStart(2, "0")}`;
      acc[key] = { income: 0, expense: 0 };
      return acc;
    }, {});

    // Process expenses
    incomeVsExpensesData.expenses.forEach((expense) => {
      const date = new Date(expense.date_time);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (groupedData[key]) {
        groupedData[key].expense += Math.abs(expense.amount);
      }
    });

    // Process income
    incomeVsExpensesData.income.forEach((income) => {
      const date = new Date(income.date_time);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (groupedData[key]) {
        groupedData[key].income += income.amount;
      }
    });

    return {
      labels: months.map((m) => m.label),
      datasets: [
        {
          label: "Income",
          data: months.map((m) => {
            const key = `${m.year}-${String(m.month + 1).padStart(2, "0")}`;
            return groupedData[key]?.income || 0;
          }),
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          borderColor: "rgba(34, 197, 94, 1)",
          borderWidth: 2,
          tension: 0,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "rgba(34, 197, 94, 1)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
        {
          label: "Expenses",
          data: months.map((m) => {
            const key = `${m.year}-${String(m.month + 1).padStart(2, "0")}`;
            return groupedData[key]?.expense || 0;
          }),
          backgroundColor: "rgba(239, 68, 68, 0.2)",
          borderColor: "rgba(239, 68, 68, 1)",
          borderWidth: 2,
          tension: 0,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "rgba(239, 68, 68, 1)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    };
  };

  const prepareCreditCardChartData = () => {
    // Group transactions by month instead of day for better visualization
    const groupedData = creditCardTransactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date_time);
      const monthYear = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      acc[monthYear] = (acc[monthYear] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {});

    // Sort dates
    const sortedDates = Object.keys(groupedData).sort();

    // Format dates for display (Month Year)
    const formattedDates = sortedDates.map((date) => {
      const [year, month] = date.split("-");
      const monthName = new Date(2000, parseInt(month) - 1).toLocaleString(
        "default",
        { month: "short" }
      );
      return `${monthName} ${year}`;
    });

    // Calculate trends for coloring
    const values = sortedDates.map(date => groupedData[date]);
    const trends = values.map((value, index) => {
      if (index === 0) return 0;
      return value - values[index - 1];
    });

    return {
      labels: formattedDates,
      datasets: [
        {
          label: "Credit Card Expenses",
          data: values,
          borderColor: trends.map(trend => 
            trend >= 0 ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)'
          ),
          backgroundColor: 'rgba(231, 225, 231, 0.34)', // Light grey fill
          borderWidth: 2,
          fill: true,
          tension: 0,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: trends.map(trend => 
            trend >= 0 ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)'
          ),
          segment: {
            borderColor: (ctx) => {
              if (!ctx.p0.parsed || !ctx.p1.parsed) return 'rgba(34, 197, 94, 1)';
              return ctx.p1.parsed.y >= ctx.p0.parsed.y ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)';
            }
          }
        },
      ],
    };
  };

  const prepareSavingsRateData = () => {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Process the data with additional information
    const processedData = savingsRateData.map((item, index) => {
      const prevValue = index > 0 ? savingsRateData[index - 1].savingsRate : item.savingsRate;
      const monthDate = new Date(item.date);
      
      // Calculate monthly income using savingsRateIncome
      const monthIncome = savingsRateIncome.reduce((sum, income) => {
        const incomeDate = new Date(income.date_time);
        if (incomeDate.getMonth() === monthDate.getMonth() && 
            incomeDate.getFullYear() === monthDate.getFullYear()) {
          return sum + income.amount;
        }
        return sum;
      }, 0);

      // Calculate monthly expenses using savingsRateExpenses
      const monthExpenses = savingsRateExpenses.reduce((sum, expense) => {
        const expenseDate = new Date(expense.date_time);
        if (expenseDate.getMonth() === monthDate.getMonth() && 
            expenseDate.getFullYear() === monthDate.getFullYear()) {
          return sum + Math.abs(expense.amount);
        }
        return sum;
      }, 0);

      return {
        ...item,
        trend: item.savingsRate - prevValue,
        monthIncome,
        monthExpenses
      };
    });

    return {
      labels: processedData.map(item => {
        const [year, month] = item.date.split("-");
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      }),
      datasets: [
        {
          label: 'Savings Rate',
          data: processedData.map(item => item.savingsRate),
          borderColor: processedData.map(item => 
            item.trend >= 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'
          ),
          backgroundColor: processedData.map(item => 
            item.trend >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'
          ),
          borderWidth: 2,
          tension: 0,
          fill: false,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: processedData.map(item => 
            item.trend >= 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'
          ),
          segment: {
            borderColor: (ctx) => {
              if (!ctx.p0.parsed || !ctx.p1.parsed) return 'rgba(34, 197, 94, 1)';
              return ctx.p1.parsed.y >= ctx.p0.parsed.y ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)';
            }
          },
          monthlyData: processedData
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: "nearest",
        intersect: true,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1f2937",
        bodyColor: "#1f2937",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        bodyFont: {
          size: 14,
          family: "'Inter', sans-serif",
          weight: '500',
        },
        titleFont: {
          size: 14,
          family: "'Inter', sans-serif",
          weight: '600',
        },
        callbacks: {
          title: (context) => {
            const date = new Date(expenses[context[0].dataIndex].date_time);
            return date.toLocaleDateString('en-US', { 
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
          },
          label: (context) => `₹${context.parsed.y.toLocaleString()}`,
        },
        filter: (tooltipItem) => {
          return tooltipItem.parsed.y !== null;
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        reverse: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
          lineWidth: 1,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: '500',
          },
          padding: 10,
          callback: (value) => `₹${value.toLocaleString()}`,
          color: (context) => {
            const value = context.tick.value;
            const maxValue = context.chart.scales.y.max;
            const percentage = value / maxValue;
            
            if (percentage <= 0.3) {
              return '#22c55e'; // Green
            } else if (percentage <= 0.6) {
              return '#eab308'; // Yellow
            } else {
              return '#ef4444'; // Red
            }
          },
        },
        border: {
          display: false,
        },
      },
      x: {
        position: 'top',
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 14,
            weight: '700',
          },
          padding: 10,
          maxRotation: 0,
          minRotation: 0,
          color: (context) => {
            const value = context.chart.data.datasets[0].data[context.index];
            const maxValue = Math.max(...context.chart.data.datasets[0].data);
            const percentage = value / maxValue;
            
            if (percentage <= 0.3) {
              return '#22c55e'; // Green
            } else if (percentage <= 0.6) {
              return '#eab308'; // Yellow
            } else {
              return '#ef4444'; // Red
            }
          },
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      mode: "nearest",
      intersect: true,
      axis: "x",
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
    elements: {
      line: {
        tension: 0,
      },
      point: {
        radius: 5,
        hoverRadius: 8,
      },
    },
  };

  const weeklyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#1f2937",
        bodyColor: "#1f2937",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => `₹${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
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
    },
  };
  const calculateSummary = () => {
    // console.log("expenses", expenses);
    if (!expenses.length)
      return {
        total: 0,
        topCategory: { name: "N/A", amount: 0 },
        topSingleTransaction: {
          category: "N/A",
          subCategory: "N/A",
          amount: 0,
        },
        highest: 0,
      };

    const total = expenses.reduce((sum, exp) => sum + Math.abs(exp.amount), 0);

    // Find the transaction with the highest amount
    const highestTransaction = expenses.reduce(
      (max, current) =>
        Math.abs(current.amount) > Math.abs(max.amount) ? current : max,
      expenses[0]
    );

    const highest = Math.abs(highestTransaction.amount);

    // Calculate top categories
    const categoryMap = {};
    expenses.forEach((exp) => {
      const category = exp.category;
      if (!categoryMap[category]) categoryMap[category] = 0;
      categoryMap[category] += Math.abs(exp.amount);
    });

    const topCategories = Object.entries(categoryMap).sort(
      (a, b) => b[1] - a[1]
    );

    const topCategory = topCategories[0] || ["N/A", 0];

    // console.log("top category = ", topCategory);
    // console.log("highest transaction = ", highestTransaction);

    return {
      total,
      topCategory: { name: topCategory[0], amount: topCategory[1] },
      topSingleTransaction: {
        category: highestTransaction.category,
        subCategory: highestTransaction.sub_category,
        notes: highestTransaction.notes,
        amount: Math.abs(highestTransaction.amount),
      },
      highest,
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
    if (customRange === "last7") return "Weekely";
    if (customRange === "last30") return "Monthly";
    if (customRange === "last90") return "Quarterly";
    if (customRange === "last365") return "Annually";
    if (customRange.includes("-")) {
      const [year, month] = customRange.split("-").map(Number);
      const date = new Date(year, month - 1);
      return date.toLocaleString("default", { month: "long", year: "numeric" });
    }
    return "Custom Range";
  };

  // Utility: Calculate week-wise totals for the current month/range
  const getWeekWiseTotals = () => {
    if (!expenses.length) return [];
    // Get the current month and year from the selected range
    let month, year;
    if (customRange.includes("-")) {
      [year, month] = customRange.split("-").map(Number);
    } else {
      const d = new Date();
      year = d.getFullYear();
      month = d.getMonth() + 1;
    }

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();
    const isCurrentMonth = month === currentMonth && year === currentYear;

    // Filter expenses for the selected month/year
    const filtered = expenses.filter((exp) => {
      const d = new Date(exp.date_time);
      return d.getFullYear() === Number(year) && d.getMonth() + 1 === Number(month);
    });

    // Group by week number
    const weekTotals = {};
    filtered.forEach((exp) => {
      const d = new Date(exp.date_time);
      const day = d.getDate();
      let weekNum = Math.ceil(day / 7); // 1-based week number
      // For months with >28 days, group 29-31 as week 5
      if (weekNum > 4) weekNum = 5;
      weekTotals[weekNum] = (weekTotals[weekNum] || 0) + Math.abs(exp.amount);
    });

    // Get the number of weeks in the selected month
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const totalWeeks = Math.ceil(lastDayOfMonth / 7);

    // Prepare array for rendering
    return Array.from({ length: totalWeeks }, (_, i) => {
      const weekNumber = i + 1;
      if (isCurrentMonth) {
        const weekStartDay = (weekNumber - 1) * 7 + 1;
        if (weekStartDay > currentDay) {
          // Future week in current month
          return { week: weekNumber, amount: "NA" };
        }
      }
      return weekTotals[weekNumber] !== undefined 
        ? { week: weekNumber, amount: weekTotals[weekNumber] } 
        : { week: weekNumber, amount: 0 };
    });
  };

  const handleScoreAdded = (newScore) => {
    // Remove this function as it's no longer needed
  };

  const handleExpenseClick = async (expenseId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/get-expense-transaction-by-id/${expenseId}`);
      if (!response.ok) throw new Error("Failed to fetch expense details");
      const data = await response.json();
      setSelectedExpense(data);
      setShowExpenseModal(true);
    } catch (err) {
      console.error("Error fetching expense details:", err);
    }
  };

  const closeExpenseModal = () => {
    setShowExpenseModal(false);
    setSelectedExpense(null);
  };

  const getAmountColor = (amount) => {
    if (amount >= 2500) return '#ef4444'; // Red for high amounts
    if (amount >= 500) return '#f97316';  // Orange for medium amounts
    return '#22c55e';                      // Green for low amounts
  };

  const handleCategoryClick = (category) => {
    const categoryTransactions = expenses.filter(exp => exp.category === category);
    setSelectedCategoryTransactions(categoryTransactions);
    setShowCategoryTransactionsModal(true);
  };

  const handleTransactionClick = (transaction) => {
    setIsSlidingOut(true);
    setTimeout(() => {
      setSelectedTransaction(transaction);
    }, 300);
  };

  const handleCloseTransactionPanel = () => {
    setSelectedTransaction(null);
    setIsSlidingOut(false);
  };

  const handleWeekClick = (week, amount) => {
    if (amount === "NA") return;
    
    const now = new Date();
    let startDate, endDate;
    
    if (customRange.includes("-")) {
      const [year, month] = customRange.split("-").map(Number);
      const weekStartDay = (week - 1) * 7 + 1;
      startDate = new Date(year, month - 1, weekStartDay);
      endDate = new Date(year, month - 1, Math.min(weekStartDay + 6, new Date(year, month, 0).getDate()));
    } else {
      const today = new Date();
      const weekStartDay = today.getDate() - today.getDay() + (week - 1) * 7;
      startDate = new Date(today.getFullYear(), today.getMonth(), weekStartDay);
      endDate = new Date(today.getFullYear(), today.getMonth(), weekStartDay + 6);
    }

    const weekTransactions = expenses.filter(expense => {
      const expenseDate = new Date(expense.date_time);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    setSelectedWeekTransactions(weekTransactions);
    setShowWeekTransactionsModal(true);
  };

  // Add this function to handle week clicks
  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your financial data...</p>
      </div>
    );

  if (error)
    return (
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
              {getLastSixMonths().map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </optgroup>
          </select>
          {/* <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="chart-type-select"
          >
            <option value="line">Line Graph</option>
            <option value="bar">Bar Graph</option>
          </select> */}
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card total">
          {/* <div className="card-icon">
            <FaWallet />
          </div> */}
          <div className="card-content">
            <h3>Total Expenses</h3>
            <div className="total-expenses-row">
              <p className="amount" style={{ color: summary.total > (Object.values(categoryBudgets).reduce((sum, budget) => sum + budget, 0) || Infinity) ? "#ef4444" : "#22c55e" }}>
                ₹{summary.total.toLocaleString()}
              </p>
              <p className="label">{getTimeRangeLabel()}</p>
              <div className="week-breakdown" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                marginTop: '12px',
                padding: '8px',
                borderTop: '1px solid #e5e7eb'
              }}>
                {getWeekWiseTotals().map(({ week, amount }) => {
                  const weeklyAverage = summary.total / getWeekWiseTotals().filter(w => w.amount !== "NA").length;
                  const isHighSpending = amount !== "NA" && amount > weeklyAverage * 1.2; // 20% above average
                  return (
                    <div 
                      key={week} 
                      className="week-row"
                      onClick={() => handleWeekClick(week, amount)}
                      style={{ 
                        cursor: amount !== "NA" ? 'pointer' : 'default',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        backgroundColor: amount !== "NA" ? (isHighSpending ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 197, 94, 0.05)') : 'transparent',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease',
                        ':hover': {
                          backgroundColor: amount !== "NA" ? (isHighSpending ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)') : 'transparent'
                        }
                      }}
                    >
                      <span className="week-label" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9em',
                        color: '#4b5563',
                        fontWeight: '500',
                        minWidth: '80px'
                      }}>
                        <FaCalendarAlt style={{
                          fontSize: '0.9em',
                          color: '#6b7280'
                        }} />
                        <span>Week {week}</span>
                      </span>
                      <span className="week-amount" style={{ 
                        color: amount === "NA" ? '#6b7280' : (isHighSpending ? '#ef4444' : '#22c55e'),
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9em',
                        fontWeight: '600',
                        minWidth: '80px',
                        justifyContent: 'flex-end'
                      }}>
                        {amount === "NA" ? "NA" : (
                          <>
                            {isHighSpending && <FaArrowUp style={{ color: '#ef4444' }} />}
                            ₹{amount.toLocaleString()}
                          </>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              marginTop: '12px',
              padding: '8px',
              borderTop: '1px solid #e5e7eb',
              minHeight: '48px'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1
              }}>
                <FaTags style={{ color: '#3b82f6' }} />
                <span style={{ color: '#4b5563', fontSize: '0.9em' }}>Top Category: {summary.topCategory.name} (₹{summary.topCategory.amount.toLocaleString()})</span>
              </div>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1
              }}>
                <FaChartBar style={{ color: '#8b5cf6' }} />
                <span style={{ color: '#4b5563', fontSize: '0.9em' }}>Highest Transaction: ₹{summary.topSingleTransaction.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="summary-card balance">
          {/* <div className="card-icon">
            <FaWallet />
          </div> */}
          <div className="card-content">
            <h3>Current Balance</h3>
            <p
              className="amount"
              style={{ color: currentBalance >= 0 ? "#22c55e" : "#ef4444" }}
            >
              ₹{Math.abs(currentBalance).toLocaleString()}
            </p>
            <p className="label">
              {currentBalance >= 0
                ? "Positive Balance"
                : "Warning Negative Balance"}
            </p>
            <div className="bank-balances-tooltip">
              {Object.entries(bankBalances).map(([bank, bal]) => (
                <div key={bank} className="bank-balance-item" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderBottom: '1px solid #e5e7eb',
                  gap: '16px'
                }}>
                  <div className="bank-info" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: '120px'
                  }}>
                    <FaUniversity className="bank-icon" style={{ color: '#3b82f6' }} />
                    <span className="bank-name" style={{
                      fontSize: '0.9em',
                      color: '#4b5563',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{bank}</span>
                  </div>
                  <span
                    className={`bank-amount ${
                      bal < 0 ? "bank-amount--red" : "bank-amount--green"
                    }`}
                    style={{
                      fontSize: '0.9em',
                      fontWeight: '600',
                      color: bal < 0 ? '#ef4444' : '#22c55e',
                      minWidth: '100px',
                      textAlign: 'right'
                    }}
                  >
                    ₹{bal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              marginTop: '20px',  // Changed from 12px to 15px
              padding: '8px',
              borderTop: '1px solid #e5e7eb',
              minHeight: '48px'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1
              }}>
                <FaWallet style={{ color: '#3b82f6' }} />
                <span style={{ color: '#4b5563', fontSize: '0.9em' }}>
                  Amount in Hand: ₹{(Object.entries(bankBalances)
                    .filter(([bank]) => bank !== 'Lent Balance')
                    .reduce((sum, [, bal]) => sum + bal, 0)).toLocaleString()}
                </span>
              </div>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1
              }}>
                <FaArrowUp style={{ color: '#8b5cf6' }} />
                <span style={{ color: '#4b5563', fontSize: '0.9em' }}>
                  Amount Lent: ₹{(bankBalances['Lent Balance'] || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="summary-card financial-health">
          <div className="card-content">
            <h3>Financial Health</h3>
            <div className="health-score-container">
              <div className="health-indicators">
                <div className="indicator-row">
                  <div className="indicator">
                    <div className="indicator-header">
                      <div className="indicator-label">Savings Rate</div>
                      <div className="indicator-icon">
                        <FaChartLine />
                      </div>
                    </div>
                    <div className={`indicator-value ${(() => {
                      const savingsRate = parseFloat((() => {
                        const now = new Date();
                        let startDate, endDate = new Date();

                        if (customRange === "last7") {
                          startDate = new Date(now.setDate(now.getDate() - 7));
                        } else if (customRange === "last30") {
                          startDate = new Date(now.setDate(now.getDate() - 30));
                        } else if (customRange === "last90") {
                          startDate = new Date(now.setDate(now.getDate() - 90));
                        } else if (customRange === "last365") {
                          startDate = new Date(now.setDate(now.getDate() - 365));
                        } else if (customRange.includes("-")) {
                          const [year, month] = customRange.split("-").map(Number);
                          startDate = new Date(year, month - 1, 1);
                          endDate = new Date(year, month, 0);
                        }

                        const filteredIncome = savingsRateIncome.filter(income => {
                          const incomeDate = new Date(income.date_time);
                          return incomeDate >= startDate && incomeDate <= endDate;
                        });

                        const filteredExpenses = savingsRateExpenses.filter(expense => {
                          const expenseDate = new Date(expense.date_time);
                          return expenseDate >= startDate && expenseDate <= endDate;
                        });

                        const totalIncome = filteredIncome.reduce((sum, income) => sum + income.amount, 0);
                        const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + Math.abs(expense.amount), 0);
                        return totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
                      })()).toFixed(1);
                      
                      if (savingsRate >= 20) return 'positive';
                      if (savingsRate >= 10) return 'neutral';
                      return 'negative';
                    })()}`}>
                      {(() => {
                        const now = new Date();
                        let startDate, endDate = new Date();

                        if (customRange === "last7") {
                          startDate = new Date(now.setDate(now.getDate() - 7));
                        } else if (customRange === "last30") {
                          startDate = new Date(now.setDate(now.getDate() - 30));
                        } else if (customRange === "last90") {
                          startDate = new Date(now.setDate(now.getDate() - 90));
                        } else if (customRange === "last365") {
                          startDate = new Date(now.setDate(now.getDate() - 365));
                        } else if (customRange.includes("-")) {
                          const [year, month] = customRange.split("-").map(Number);
                          startDate = new Date(year, month - 1, 1);
                          endDate = new Date(year, month, 0);
                        }

                        const filteredIncome = savingsRateIncome.filter(income => {
                          const incomeDate = new Date(income.date_time);
                          return incomeDate >= startDate && incomeDate <= endDate;
                        });

                        const filteredExpenses = savingsRateExpenses.filter(expense => {
                          const expenseDate = new Date(expense.date_time);
                          return expenseDate >= startDate && expenseDate <= endDate;
                        });

                        const totalIncome = filteredIncome.reduce((sum, income) => sum + income.amount, 0);
                        const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + Math.abs(expense.amount), 0);
                        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
                        return savingsRate.toFixed(1);
                      })()}%
                    </div>
                    <div className="indicator-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{
                            width: `${Math.min(parseFloat((() => {
                              const now = new Date();
                              let startDate, endDate = new Date();

                              if (customRange === "last7") {
                                startDate = new Date(now.setDate(now.getDate() - 7));
                              } else if (customRange === "last30") {
                                startDate = new Date(now.setDate(now.getDate() - 30));
                              } else if (customRange === "last90") {
                                startDate = new Date(now.setDate(now.getDate() - 90));
                              } else if (customRange === "last365") {
                                startDate = new Date(now.setDate(now.getDate() - 365));
                              } else if (customRange.includes("-")) {
                                const [year, month] = customRange.split("-").map(Number);
                                startDate = new Date(year, month - 1, 1);
                                endDate = new Date(year, month, 0);
                              }

                              const filteredIncome = savingsRateIncome.filter(income => {
                                const incomeDate = new Date(income.date_time);
                                return incomeDate >= startDate && incomeDate <= endDate;
                              });

                              const filteredExpenses = savingsRateExpenses.filter(expense => {
                                const expenseDate = new Date(expense.date_time);
                                return expenseDate >= startDate && expenseDate <= endDate;
                              });

                              const totalIncome = filteredIncome.reduce((sum, income) => sum + income.amount, 0);
                              const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + Math.abs(expense.amount), 0);
                              return totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
                            })()), 100)}%`,
                            backgroundColor: (() => {
                              const savingsRate = parseFloat((() => {
                                const now = new Date();
                                let startDate, endDate = new Date();

                                if (customRange === "last7") {
                                  startDate = new Date(now.setDate(now.getDate() - 7));
                                } else if (customRange === "last30") {
                                  startDate = new Date(now.setDate(now.getDate() - 30));
                                } else if (customRange === "last90") {
                                  startDate = new Date(now.setDate(now.getDate() - 90));
                                } else if (customRange === "last365") {
                                  startDate = new Date(now.setDate(now.getDate() - 365));
                                } else if (customRange.includes("-")) {
                                  const [year, month] = customRange.split("-").map(Number);
                                  startDate = new Date(year, month - 1, 1);
                                  endDate = new Date(year, month, 0);
                                }

                                const filteredIncome = savingsRateIncome.filter(income => {
                                  const incomeDate = new Date(income.date_time);
                                  return incomeDate >= startDate && incomeDate <= endDate;
                                });

                                const filteredExpenses = savingsRateExpenses.filter(expense => {
                                  const expenseDate = new Date(expense.date_time);
                                  return expenseDate >= startDate && expenseDate <= endDate;
                                });

                                const totalIncome = filteredIncome.reduce((sum, income) => sum + income.amount, 0);
                                const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + Math.abs(expense.amount), 0);
                                return totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
                              })()).toFixed(1);
                              
                              if (savingsRate >= 20) return '#22c55e';
                              if (savingsRate >= 10) return '#eab308';
                              return '#ef4444';
                            })()
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="indicator">
                    <div className="indicator-header">
                      <div className="indicator-label">Budget Score</div>
                      <div className="indicator-icon">
                        <FaWallet />
                      </div>
                    </div>
                    <div className={`indicator-value ${(() => {
                      const totalBudget = Object.values(categoryBudgets).reduce((sum, budget) => sum + budget, 0);
                      const totalSpending = summary.total;
                      const budgetScore = (100 - (100 * (totalSpending / (totalBudget || 1))));
                      
                      if (budgetScore >= 50) return 'positive';
                      if (budgetScore >= 25) return 'neutral';
                      return 'negative';
                    })()}`}>
                      {(() => {
                        const totalBudget = Object.values(categoryBudgets).reduce((sum, budget) => sum + budget, 0);
                        const totalSpending = summary.total;
                        return (100 - (100 * (totalSpending / (totalBudget || 1)))).toFixed(1);
                      })()}%
                    </div>
                    <div className="indicator-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{
                            width: `${Math.min(parseFloat((() => {
                              const totalBudget = Object.values(categoryBudgets).reduce((sum, budget) => sum + budget, 0);
                              const totalSpending = summary.total;
                              return (100 - (100 * (totalSpending / (totalBudget || 1))));
                            })()), 100)}%`,
                            backgroundColor: (() => {
                              const totalBudget = Object.values(categoryBudgets).reduce((sum, budget) => sum + budget, 0);
                              const totalSpending = summary.total;
                              const budgetScore = (100 - (100 * (totalSpending / (totalBudget || 1))));
                              
                              if (budgetScore >= 50) return '#22c55e';
                              if (budgetScore >= 25) return '#eab308';
                              return '#ef4444';
                            })()
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="indicator">
                    <div className="indicator-header">
                      <div className="indicator-label">Credit Score</div>
                      <div className="indicator-icon">
                        <FaChartBar />
                      </div>
                    </div>
                    <div className={`indicator-value ${(() => {
                      if (!cibilScore) return 'na';
                      if (cibilScore.score >= 750) return 'positive';
                      if (cibilScore.score >= 650) return 'neutral';
                      return 'negative';
                    })()}`}>
                      {cibilScore ? cibilScore.score : 'NA'}
                    </div>
                    <div className="indicator-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{
                            width: cibilScore ? `${Math.min((cibilScore.score / 900) * 100, 100)}%` : '0%',
                            backgroundColor: cibilScore ? (
                              cibilScore.score >= 750 ? '#22c55e' :
                              cibilScore.score >= 650 ? '#eab308' : '#ef4444'
                            ) : '#6b7280'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="indicator-row">
                  <div className="indicator">
                    <div className="indicator-header">
                      <div className="indicator-label">Emergency Fund</div>
                      <div className="indicator-icon">
                        <FaMoneyBillWave />
                      </div>
                    </div>
                    <div className="indicator-value na">NA</div>
                    <div className="indicator-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '0%', backgroundColor: '#6b7280' }} />
                      </div>
                    </div>
                  </div>

                  <div className="indicator">
                    <div className="indicator-header">
                      <div className="indicator-label">Debt-to-Income</div>
                      <div className="indicator-icon">
                        <FaLayerGroup />
                      </div>
                    </div>
                    <div className="indicator-value na">NA</div>
                    <div className="indicator-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '0%', backgroundColor: '#6b7280' }} />
                      </div>
                    </div>
                  </div>

                  <div className="indicator">
                    <div className="indicator-header">
                      <div className="indicator-label">Investment Rate</div>
                      <div className="indicator-icon">
                        <FaChartLine />
                      </div>
                    </div>
                    <div className="indicator-value na">NA</div>
                    <div className="indicator-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '0%', backgroundColor: '#6b7280' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="main-chart">
          <h2>
            <FaChartLine /> Expense Trend
          </h2>
          <div className="chart-container">
            {chartType === "line" && (
              <Line data={prepareChartData()} options={chartOptions} />
            )}
            {chartType === "bar" && (
              <Bar data={prepareChartData()} options={chartOptions} />
            )}
          </div>
        </div>

        <div className="credit-card-chart">
          <h2>
            <FaChartLine /> Credit Card Expenses
          </h2>
          <div className="chart-container">
            <Line
              data={prepareCreditCardChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      boxWidth: 12,
                      usePointStyle: true,
                      pointStyle: "circle",
                    },
                  },
                  tooltip: {
                    mode: "index",
                    intersect: false,
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    titleColor: "#1f2937",
                    bodyColor: "#1f2937",
                    borderColor: "#e5e7eb",
                    borderWidth: 1,
                    padding: 12,
                    bodyFont: {
                      size: 14,
                      family: "'Inter', sans-serif",
                    },
                    callbacks: {
                      label: (context) => {
                        const value = context.parsed.y;
                        const trend = context.dataset.data[context.dataIndex] - (context.dataIndex > 0 ? context.dataset.data[context.dataIndex - 1] : 0);
                        const trendSymbol = trend >= 0 ? '▲' : '▼';
                        return [
                          `Amount: ₹${value.toLocaleString()}`,
                          `Trend: ${trendSymbol} ₹${Math.abs(trend).toLocaleString()}`
                        ];
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    reverse: true,
                    grid: {
                      color: "rgba(0, 0, 0, 0.05)",
                      drawBorder: false,
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                        weight: '500',
                      },
                      padding: 10,
                      callback: (value) => `₹${value.toLocaleString()}`,
                      color: (context) => {
                        const value = context.tick.value;
                        const maxValue = context.chart.scales.y.max;
                        const percentage = value / maxValue;
                        
                        if (percentage <= 0.3) {
                          return '#22c55e'; // Green
                        } else if (percentage <= 0.6) {
                          return '#eab308'; // Yellow
                        } else {
                          return '#ef4444'; // Red
                        }
                      },
                    },
                    border: {
                      display: false,
                    },
                  },
                  x: {
                    position: 'top',
                    grid: {
                      display: true,
                      color: "rgba(0, 0, 0, 0.05)",
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                        size: 14,
                        weight: '700',
                      },
                      padding: 10,
                      maxRotation: 0,
                      minRotation: 0,
                      color: (context) => {
                        const value = context.chart.data.datasets[0].data[context.index];
                        const maxValue = Math.max(...context.chart.data.datasets[0].data);
                        const percentage = value / maxValue;
                        
                        if (percentage <= 0.3) {
                          return '#22c55e'; // Green
                        } else if (percentage <= 0.6) {
                          return '#eab308'; // Yellow
                        } else {
                          return '#ef4444'; // Red
                        }
                      },
                    },
                    border: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="savings-rate-chart">
          <h2>
            <FaChartLine /> Monthly Savings Rate
          </h2>
          <div className="chart-container">
            <Line
              data={prepareSavingsRateData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    titleColor: "#1f2937",
                    bodyColor: "#1f2937",
                    borderColor: "#e5e7eb",
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                      label: (context) => {
                        const datasetIndex = context.datasetIndex;
                        const dataIndex = context.dataIndex;
                        const monthlyData = context.dataset.monthlyData[dataIndex];
                        
                        const trendSymbol = monthlyData.trend >= 0 ? '▲' : '▼';
                        return [
                          `Savings Rate: ${monthlyData.savingsRate.toFixed(1)}%`,
                          `Net Income: ₹${monthlyData.monthIncome.toLocaleString()}`,
                          `Net Expenses: ₹${monthlyData.monthExpenses.toLocaleString()}`,
                          `Trend: ${trendSymbol} ${Math.abs(monthlyData.trend).toFixed(1)}%`
                        ];
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: "rgba(0, 0, 0, 0.05)",
                      drawBorder: false,
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                        weight: '500',
                      },
                      padding: 10,
                      callback: (value) => `${value.toFixed(1)}%`,
                      color: (context) => {
                        const value = context.tick.value;
                        const maxValue = context.chart.scales.y.max;
                        const percentage = value / maxValue;
                        
                        if (percentage <= 0.3) {
                          return '#ef4444'; // Red for low savings rate
                        } else if (percentage <= 0.6) {
                          return '#eab308'; // Yellow for medium savings rate
                        } else {
                          return '#22c55e'; // Green for high savings rate
                        }
                      },
                    },
                    border: {
                      display: false,
                    },
                  },
                  x: {
                    position: 'bottom',
                    grid: {
                      display: true,
                      color: "rgba(0, 0, 0, 0.05)",
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                        size: 14,
                        weight: '700',
                      },
                      padding: 10,
                      maxRotation: 0,
                      minRotation: 0,
                      color: (context) => {
                        const value = context.chart.data.datasets[0].data[context.index];
                        const maxValue = Math.max(...context.chart.data.datasets[0].data);
                        const percentage = value / maxValue;
                        
                        if (percentage <= 0.3) {
                          return '#ef4444'; // Red for low savings rate
                        } else if (percentage <= 0.6) {
                          return '#eab308'; // Yellow for medium savings rate
                        } else {
                          return '#22c55e'; // Green for high savings rate
                        }
                      },
                    },
                    border: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="top-categories">
          <h2>
            <FaChartLine /> Top Spending Categories
          </h2>
          <div className="top-categories-list">
            {topCategories.map(([category, data], index) => {
              const budget = categoryBudgets[category] || 0;
              const percentage = budget > 0 ? ((data.total / budget) * 100).toFixed(1) : 0;
              const isOverBudget = budget > 0 && data.total > budget;
              const categoryColor = colors[index % colors.length];

              return (
                <div 
                  key={category} 
                  className="top-category-item"
                  style={{
                    '--category-color': categoryColor.color,
                    '--category-rgb': categoryColor.rgb
                  }}
                >
                  <div className="top-category-header">
                    <div className="category-name-section">
                      <div className="category-rank">
                        {index + 1}
                      </div>
                      <span 
                        className="category-name"
                        onClick={() => handleCategoryClick(category)}
                        style={{ cursor: 'pointer' }}
                      >
                        {category}
                      </span>
                    </div>

                    <div className="amounts-group">
                      <div className="amount-row">
                        <span className="amount-label">Budget:</span>
                        <span className="category-budget">
                          ₹{budget.toLocaleString()}
                        </span>
                      </div>
                      <div className="amount-row">
                        <span className="amount-label">Spent:</span>
                        <span className="category-spent">
                          ₹{data.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="top-expense-info">
                    <div className="top-expense-row">
                      <span className="top-expense-label">Top Expense:</span>
                      <span 
                        className="top-expense-amount"
                        onClick={() => handleExpenseClick(data.topExpense.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        ₹{data.topExpense.amount.toLocaleString()}
                      </span>
                    </div>
                    {data.topExpense.notes && (
                      <span className="top-expense-notes">{data.topExpense.notes}</span>
                    )}
                  </div>

                  {budget > 0 && (
                    <div className="progress-section">
                      <div className="category-bar-section">
                        <div className="category-bar-container">
                          <div
                            className="category-spent-bar"
                            style={{
                              width: `${Math.min(percentage, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                      <span className={`category-percentage ${isOverBudget ? 'over-budget' : ''}`}>
                        {percentage}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaction Details Panel */}
        {showExpenseModal && selectedExpense && (
          <div className="transaction-panel-overlay" onClick={closeExpenseModal}>
            <div className="transaction-panel" onClick={e => e.stopPropagation()}>
              <div className="transaction-header">
                <div className="transaction-title">
                  <FaMoneyBillWave />
                  Transaction Details
                </div>
                <button className="transaction-close" onClick={closeExpenseModal}>
                  <FaTimes />
                </button>
              </div>
              
              <div className="transaction-content">
                <div className="transaction-details">
                  <div className="detail-item info-card">
                    {/* <div className="detail-icon-wrapper">
                      <FaInfoCircle />
                    </div> */}
                    <div className="info-content">
                      <div className="info-row">
                        <span className="info-label">Category:</span>
                        <span className="info-value">{selectedExpense.category}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Sub Category:</span>
                        <span className="info-value">{selectedExpense.sub_category}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Bank:</span>
                        <span className="info-value">{selectedExpense.bankname}</span>
                      </div>
                    </div>
                    <div className="amount-section">
                      <div className="amount-figure">
                        ₹{Math.abs(selectedExpense.amount).toLocaleString()}
                      </div>
                      <div className="amount-date">
                        {new Date(selectedExpense.date_time).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  {selectedExpense.notes && (
                    <div className="detail-item notes">
                      {/* <div className="detail-icon-wrapper">
                        <FaInfoCircle />
                      </div> */}
                      <div className="detail-content">
                        <div className="detail-label">Notes</div>
                        <div className="detail-value">{selectedExpense.notes}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="subcategory-chart">
          <h2>
            <FaChartBar /> Top Sub-Categories
          </h2>
          <div className="chart-container">
            <Bar
              data={prepareTopSubCategoriesData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    titleColor: "#1f2937",
                    bodyColor: "#1f2937",
                    borderColor: "#e5e7eb",
                    borderWidth: 1,
                    padding: 12,
                    bodyFont: {
                      size: 14,
                      family: "'Inter', sans-serif",
                      weight: '500',
                    },
                    titleFont: {
                      size: 14,
                      family: "'Inter', sans-serif",
                      weight: '600',
                    },
                    callbacks: {
                      label: (context) => `₹${context.raw.toLocaleString()}`,
                    },
                  },
                  datalabels: {
                    display: true,
                    color: '#000000',
                    anchor: 'start',
                    align: 'start',
                    offset: 8,
                    font: (context) => {
                      const value = context.dataset.data[context.dataIndex];
                      const valueLength = value.toString().length;
                      return {
                        family: "'Inter', sans-serif",
                        size: valueLength > 6 ? 10 : 12,
                        weight: '600',
                      };
                    },
                    formatter: (value) => value > 2000 ? `₹${value.toLocaleString()}` : '',
                  },
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    position: 'top',
                    grid: {
                      display: true,
                      color: "rgba(0, 0, 0, 0.05)",
                      drawBorder: false,
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                        weight: '500',
                      },
                      padding: 10,
                      callback: (value) => `₹${value.toLocaleString()}`,
                      color: (context) => {
                        const value = context.tick.value;
                        const maxValue = context.chart.scales.x.max;
                        const percentage = value / maxValue;
                        
                        if (percentage <= 0.3) {
                          return '#22c55e'; // Green
                        } else if (percentage <= 0.6) {
                          return '#eab308'; // Yellow
                        } else {
                          return '#ef4444'; // Red
                        }
                      },
                    },
                    border: {
                      display: false,
                    },
                  },
                  y: {
                    position: 'right',
                    reverse: true,
                    grid: {
                      display: false,
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                        weight: '600',
                      },
                      padding: 10,
                      color: '#4b5563',
                    },
                    border: {
                      display: false,
                    },
                  },
                },
                animation: {
                  duration: 1000,
                  easing: 'easeInOutQuart',
                },
              }}
              plugins={[ChartDataLabels]}
            />
          </div>
        </div>

        <div className="category-trend-chart">
          <h2>
            <FaChartLine /> Category Trends
          </h2>
          <div className="chart-container">
            <Line
              data={prepareCategoryTrendData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      boxWidth: 12,
                      usePointStyle: true,
                      pointStyle: "circle",
                      font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                        weight: '500',
                      },
                      padding: 20,
                    },
                  },
                  tooltip: {
                    mode: "index",
                    intersect: false,
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    titleColor: "#1f2937",
                    bodyColor: "#1f2937",
                    borderColor: "#e5e7eb",
                    borderWidth: 1,
                    padding: 12,
                    bodyFont: {
                      size: 14,
                      family: "'Inter', sans-serif",
                      weight: '500',
                    },
                    titleFont: {
                      size: 14,
                      family: "'Inter', sans-serif",
                      weight: '600',
                    },
                    callbacks: {
                      title: (context) => {
                        // Get the date from the labels array
                        const dateStr = context[0].label;
                        const [day, month] = dateStr.split('/');
                        // Create a date object using the current year
                        const date = new Date(new Date().getFullYear(), parseInt(month) - 1, parseInt(day));
                        return date.toLocaleDateString('en-US', { 
                          month: 'short',
                          day: 'numeric'
                        });
                      },
                      label: function (context) {
                        if (context.parsed.y > 0) {
                          return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`;
                        }
                        return null;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    grid: {
                      display: true,
                      color: "rgba(0, 0, 0, 0.05)",
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                        weight: '600',
                      },
                      padding: 10,
                      maxRotation: 0,
                      minRotation: 0,
                      color: '#4b5563',
                    },
                    border: {
                      display: false,
                    },
                  },
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: "rgba(0, 0, 0, 0.05)",
                      drawBorder: false,
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                        weight: '500',
                      },
                      padding: 10,
                      callback: (value) => `₹${value.toLocaleString()}`,
                      color: (context) => {
                        const value = context.tick.value;
                        const maxValue = context.chart.scales.y.max;
                        const percentage = value / maxValue;
                        
                        if (percentage <= 0.3) {
                          return '#22c55e'; // Green
                        } else if (percentage <= 0.6) {
                          return '#eab308'; // Yellow
                        } else {
                          return '#ef4444'; // Red
                        }
                      },
                    },
                    border: {
                      display: false,
                    },
                  },
                },
                interaction: {
                  mode: "nearest",
                  axis: "x",
                  intersect: false,
                },
              }}
            />
          </div>
        </div>

        <div className="weekly-trend-chart">
          <h2>
            <FaChartBar /> Weekly Spending Pattern
          </h2>
          <div className="chart-container">
            <Line
              data={prepareWeeklyTrendData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    titleColor: "#1f2937",
                    bodyColor: "#1f2937",
                    borderColor: "#e5e7eb",
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                      label: (context) => `₹${context.raw.toLocaleString()}`,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: "rgba(0, 0, 0, 0.05)",
                      drawBorder: false,
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                        weight: '500',
                      },
                      padding: 10,
                      callback: (value) => `₹${value.toLocaleString()}`,
                      color: (context) => {
                        const value = context.tick.value;
                        const maxValue = context.chart.scales.y.max;
                        const percentage = value / maxValue;
                        
                        if (percentage <= 0.3) {
                          return '#22c55e'; // Green
                        } else if (percentage <= 0.6) {
                          return '#eab308'; // Yellow
                        } else {
                          return '#ef4444'; // Red
                        }
                      },
                    },
                    border: {
                      display: false,
                    },
                  },
                  x: {
                    grid: {
                      display: true,
                      color: "rgba(0, 0, 0, 0.05)",
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                        weight: '500',
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="category-trend-chart">
          <h2>
            <FaChartLine /> Income vs Expenses
          </h2>
          <div className="chart-container">
            <Line
              data={prepareIncomeVsExpenseData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      boxWidth: 12,
                      usePointStyle: true,
                      pointStyle: "circle",
                    },
                  },
                  tooltip: {
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    titleColor: "#1f2937",
                    bodyColor: "#1f2937",
                    borderColor: "#e5e7eb",
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                      label: (context) => `₹${context.raw.toLocaleString()}`,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: "rgba(0, 0, 0, 0.05)",
                      drawBorder: false,
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                        weight: '500',
                      },
                      padding: 10,
                      callback: (value) => `₹${value.toLocaleString()}`,
                      color: (context) => {
                        const value = context.tick.value;
                        const maxValue = context.chart.scales.y.max;
                        const percentage = value / maxValue;
                        
                        if (percentage <= 0.3) {
                          return '#ef4444'; // Red for low values
                        } else if (percentage <= 0.6) {
                          return '#eab308'; // Yellow for medium values
                        } else {
                          return '#22c55e'; // Green for high values
                        }
                      },
                    },
                    border: {
                      display: false,
                    },
                  },
                  x: {
                    grid: {
                      display: true,
                      color: "rgba(0, 0, 0, 0.05)",
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                        weight: '600',
                      },
                      padding: 10,
                      maxRotation: 0,
                      minRotation: 0,
                      color: '#4b5563',
                    },
                    border: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Category Transactions Modal */}
      {showCategoryTransactionsModal && (
        <div className="transaction-panel-overlay" onClick={() => setShowCategoryTransactionsModal(false)}>
          <div className="transaction-panel" onClick={e => e.stopPropagation()}>
            <div className="transaction-header">
              <div className="transaction-title">
                <FaTags />
                Category Transactions
              </div>
              <button className="transaction-close" onClick={() => setShowCategoryTransactionsModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="transaction-content">
              <div className="category-transactions-table-container">
                <div className={`category-transactions-table ${isSlidingOut ? 'sliding-out' : ''}`}>
                  <div className="table-body">
                    {selectedCategoryTransactions.map((transaction, index) => (
                      <div 
                        key={transaction.id} 
                        className="table-row"
                        onClick={() => handleTransactionClick(transaction)}
                      >
                        <div className="table-cell serial">
                          {index + 1}
                        </div>
                        <div className="table-cell subcategory">
                          {transaction.sub_category}
                        </div>
                        <div className="table-cell date">
                          {new Date(transaction.date_time).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="table-cell amount" style={{ color: getAmountColor(Math.abs(transaction.amount)) }}>
                          ₹{Math.abs(transaction.amount).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTransaction && (
        <div className="transaction-panel-overlay" onClick={handleCloseTransactionPanel}>
          <div className="transaction-panel" onClick={e => e.stopPropagation()}>
            <div className="transaction-header">
              <div className="transaction-title">
                <FaMoneyBillWave />
                Transaction Details
              </div>
              <button className="transaction-close" onClick={handleCloseTransactionPanel}>
                <FaTimes />
              </button>
            </div>
            
            <div className="transaction-content">
              <div className="transaction-details">
                <div className="detail-item info-card">
                  {/* <div className="detail-icon-wrapper">
                    <FaInfoCircle />
                  </div> */}
                  <div className="info-content">
                    <div className="info-row">
                      <span className="info-label">Category:</span>
                      <span className="info-value">{selectedTransaction.category}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Sub Category:</span>
                      <span className="info-value">{selectedTransaction.sub_category}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Bank:</span>
                      <span className="info-value">{selectedTransaction.bankname}</span>
                    </div>
                  </div>
                  <div className="amount-section">
                    <div className="amount-figure">
                      ₹{Math.abs(selectedTransaction.amount).toLocaleString()}
                    </div>
                    <div className="amount-date">
                      {new Date(selectedTransaction.date_time).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {selectedTransaction.notes && (
                  <div className="detail-item notes">
                    {/* <div className="detail-icon-wrapper">
                      <FaInfoCircle />
                    </div> */}
                    <div className="detail-content">
                      <div className="detail-label">Notes</div>
                      <div className="detail-value">{selectedTransaction.notes}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Transactions Modal */}
      {showWeekTransactionsModal && (
        <div className="transaction-panel-overlay" onClick={() => setShowWeekTransactionsModal(false)}>
          <div className="transaction-panel" onClick={e => e.stopPropagation()}>
            <div className="transaction-header">
              <div className="transaction-title">
                <FaCalendarAlt />
                Weekly Transactions
              </div>
              <button className="transaction-close" onClick={() => setShowWeekTransactionsModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="transaction-content">
              <div className="category-transactions-table-container">
                <div className="category-transactions-table">
                  <div className="table-body">
                    {selectedWeekTransactions.map((transaction, index) => (
                      <div 
                        key={transaction.id} 
                        className="table-row"
                        // onClick={() => handleTransactionClick(transaction)}
                      >
                        <div className="table-cell serial">
                          {index + 1}
                        </div>
                        <div className="table-cell subcategory">
                          {transaction.sub_category}
                        </div>
                        <div className="table-cell date">
                          {new Date(transaction.date_time).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="table-cell amount" style={{ color: getAmountColor(Math.abs(transaction.amount)) }}>
                          ₹{Math.abs(transaction.amount).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
