import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Network, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../api';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const data = await registerUser(formData.email, formData.password, formData.name);
      login(data.jwt, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card card fade-in-up">
        <div className="signup-header">
          <Network className="brand-icon" size={40} />
          <h2>Create Account</h2>
          <p>Join the FlowMind Gateway</p>
        </div>

        {error && <div className="error-message" style={{color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}

        <form onSubmit={handleSignup} className="signup-form">
          <div className="form-group">
            <label>Full Name</label>
            <div style={{position: 'relative'}}>
              <input 
                name="name"
                type="text" 
                className="input" 
                placeholder="John Doe" 
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              name="email"
              type="email" 
              className="input" 
              placeholder="you@company.com" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              name="password"
              type="password" 
              className="input" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={handleChange}
              required 
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              name="confirmPassword"
              type="password" 
              className="input" 
              placeholder="••••••••" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
