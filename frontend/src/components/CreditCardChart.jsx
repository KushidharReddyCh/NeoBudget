import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { FaCreditCard, FaChartLine } from 'react-icons/fa';
import '../styles/Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CreditCardChart = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      // Calculate date range for last year
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      
      const response = await fetch(
        `http://127.0.0.1:8000/get-credit-card-transaction-by-date-range?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch credit card transactions');
      }
      const data = await response.json();
      setTransactions(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    // Group transactions by month instead of day for better visualization
    const groupedData = transactions.reduce((acc, transaction) => {
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

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading credit card data...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="credit-card-chart">
      <h2><FaChartLine /> Credit Card Expenses</h2>
      <div className="chart-container">
        <Line 
          data={prepareChartData()} 
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
            interaction: {
              mode: 'nearest',
              axis: 'x',
              intersect: false
            }
          }}
        />
      </div>
    </div>
  );
};

export default CreditCardChart; 