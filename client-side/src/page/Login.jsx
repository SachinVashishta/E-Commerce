import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({  email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate('/');
      } else {
        await register(formData.email, formData.password);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>{isLogin ? 'Welcome Back' : 'Join Us'}</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="form-icon">📧</div>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <label htmlFor="email">Email Address</label>
          </div>

          
          <div className="form-group">
            <div className="form-icon">🔒</div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <label htmlFor="password">Password</label>
            <button type="button" className="password-toggle" onClick={togglePasswordVisibility}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          
          {error && <div className="error">{error}</div>}
          
          <button type="submit" disabled={isLoading || loading}>
            {isLoading || loading ? (
              <>
                <span className="loading-spinner"></span>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              <>
                {isLogin ? '👋 Sign In' : '🚀 Sign Up'}
              </>
            )}
          </button>
        </form>

        <div className="toggle-auth-container">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button className="toggle-auth" type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Create Account' : 'Sign In'}
          </button>
        </div>

        <div className="demo-accounts">
          <p><strong>Demo Accounts:</strong></p>
          <p>User: test@test.com / 123456</p>
          <p>Admin: admin@5test.com / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

