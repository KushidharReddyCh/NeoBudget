// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import "./styles/expenseManagement.css";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import IncomesPage from "./pages/IncomesPage";
import ExpensesPage from "./pages/ExpensesPage";
import CategoriesPage from "./pages/CategoriesPage";
import CreditCardPage from "./pages/CreditCardPage";

function App() {
  const [customRange, setCustomRange] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });

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
        value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      });
    }
    return months;
  };

  return (
    <Router>
      <div className="app">
        <Navbar 
          customRange={customRange}
          setCustomRange={setCustomRange}
          getLastSixMonths={getLastSixMonths}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard customRange={customRange} />} />
            <Route path="/incomes" element={<IncomesPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/credit-cards" element={<CreditCardPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
