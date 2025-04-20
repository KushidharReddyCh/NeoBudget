import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">NEOBUDGET</Link>
      </div>
      <div className="nav-links">
        <Link to="/incomes">INCOMES</Link>
        <Link to="/expenses">EXPENSES</Link>
      </div>
    </nav>
  );
}

export default Navbar; 