// frontend/src/components/Navbar.jsx
import { Link } from "react-router-dom";
import {
  FaChartBar,
  FaMoneyBillWave,
  FaTags,
  FaCreditCard,
  FaHome,
  FaWallet,
  FaPiggyBank,
  FaUniversity
} from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">NEOBUDGET</Link>
      </div>
      <div className="nav-links">
        <Link to="/" className="nav-link">
          <FaHome /> Home
        </Link>
        <Link to="/expenses" className="nav-link">
          <FaMoneyBillWave /> Expenses
        </Link>
        <Link to="/incomes" className="nav-link">
          <FaPiggyBank /> Incomes
        </Link>
        <Link to="/credit-cards" className="nav-link">
          <FaCreditCard /> Credit Cards
        </Link>
        {/* <Link to="/bank-accounts" className="nav-link">
          <FaUniversity /> Bank Accounts
        </Link> */}
        <Link to="/categories" className="nav-link">
          <FaTags /> Plan Budget
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
