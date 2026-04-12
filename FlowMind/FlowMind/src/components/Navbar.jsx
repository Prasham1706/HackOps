import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Network } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { user } = useAuth();
  const initials = (user?.name || user?.email || 'FlowMind')
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'FM';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Network className="brand-icon" size={28} />
          <div className="brand-copy">
            <span className="brand-text">FlowMind</span>
            <span className="brand-tag">Adaptive workflow studio</span>
          </div>
        </Link>
        <div className="navbar-links">
          {isHome ? (
            <>
              <Link to="/login" className="nav-link">Log In</Link>
              <Link to="/dashboard" className="btn btn-primary">Get Started</Link>
            </>
          ) : (
            <div className="user-shell">
              <div className="workspace-pill">Live Workspace</div>
              <div className="user-profile" aria-label="Signed in user">
                <span>{initials}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
