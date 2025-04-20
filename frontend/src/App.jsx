import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "./styles/expenseManagement.css";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import IncomesPage from "./pages/IncomesPage";
import ExpensesPage from "./pages/ExpensesPage";

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/incomes" element={<IncomesPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
