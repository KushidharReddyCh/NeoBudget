// frontend/src/components/Navbar.jsx
import { Link, useLocation } from "react-router-dom";
import { FaCalendarAlt, FaChevronDown } from "react-icons/fa";
import "../styles/Navbar.css";

const Navbar = ({ customRange, setCustomRange, getLastSixMonths }) => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getDateFilterLabel = (value) => {
    if (value === "last7") return "Last 7 Days";
    if (value === "last30") return "Last 30 Days";
    if (value === "last90") return "Last 90 Days";
    if (value === "last365") return "Last Year";
    if (value.includes("-")) {
      const [year, month] = value.split("-");
      const date = new Date(year, month - 1);
      return date.toLocaleString("default", { month: "long", year: "numeric" });
    }
    return "Custom Range";
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">NEOBUDGET</Link>
      </div>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
          HOME
        </Link>
        <Link to="/expenses" className={`nav-link ${isActive("/expenses") ? "active" : ""}`}>
          EXPENSES
        </Link>
        <Link to="/incomes" className={`nav-link ${isActive("/incomes") ? "active" : ""}`}>
          INCOMES
        </Link>
        <Link to="/credit-cards" className={`nav-link ${isActive("/credit-cards") ? "active" : ""}`}>
          CREDIX
        </Link>
        <Link to="/categories" className={`nav-link ${isActive("/categories") ? "active" : ""}`}>
          BUDGET
        </Link>
      </div>
      <div className="nav-date-filter">
        <div className="date-filter-content">
          <select
            value={customRange}
            onChange={(e) => setCustomRange(e.target.value)}
            className="time-range-select"
          >
            <optgroup label="Monthly">
              {getLastSixMonths().map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </optgroup>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="last90">Last 90 Days</option>
            <option value="last365">Last Year</option>
          </select>
          <FaChevronDown className="date-filter-icon" />
          <div className="selected-date-label">{getDateFilterLabel(customRange)}</div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
