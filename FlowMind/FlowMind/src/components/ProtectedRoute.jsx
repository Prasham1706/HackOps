import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — guards all authenticated pages.
 * If the user has no valid JWT token, redirect to /login.
 * While we're checking localStorage (loading=true), show a brief spinner
 * so we don't flash the login page to already-logged-in users.
 */
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-muted)',
        fontSize: '1rem',
        letterSpacing: '0.05em',
      }}>
        <div className="spinner" style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
          animation: 'spin 0.8s linear infinite',
          marginRight: 12,
        }} />
        Loading FlowMind...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
