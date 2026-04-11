import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Network } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Network className="brand-icon" size={28} />
          <span className="brand-text">FlowMind</span>
        </Link>
        <div className="navbar-links">
          {isHome ? (
            <>
              <Link to="/login" className="nav-link">Log In</Link>
              <Link to="/dashboard" className="btn btn-primary">Get Started</Link>
            </>
          ) : (
            <div className="user-profile">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=4f46e5&color=fff" alt="User" />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
