import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Network } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginUser, loginWithGoogle } from '../api';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('admin@flowmind.ai');
  const [password, setPassword] = useState('password');

  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
      });
      google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await loginWithGoogle(response.credential);
      login(data.jwt, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const data = await loginUser(email, password);
      login(data.jwt, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card fade-in-up">
        <div className="login-header">
          <Network className="brand-icon" size={40} />
          <h2>Welcome Back</h2>
          <p>Sign in to FlowMind Gateway</p>
        </div>

        {error && <div className="error-message" style={{color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              className="input" 
              placeholder="you@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div id="googleSignInDiv" style={{ width: '100%' }}></div>

        <div className="auth-footer" style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: '500', textDecoration: 'none' }}>Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
