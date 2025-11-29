import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { storage } from '../services/storage';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await storage.login({ email, password });
      toast.success(`Welcome back, ${res.user.name}`);
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-branding">
            <div className="brand-icon">
              <span className="brand-icon-text">AM</span>
            </div>
            <h1 className="brand-title">Activity Monitor</h1>
            <p className="brand-subtitle">Manage and track your campus events with ease</p>
            
            <div className="features-list">
              <div className="feature-item">
                <span>✓ Create and manage events</span>
              </div>
              <div className="feature-item">
                <span>✓ Track student participation</span>
              </div>
              <div className="feature-item">
                <span>✓ Streamlined request handling</span>
              </div>
              <div className="feature-item">
                <span>✓ Real-time notifications</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <div className="login-header">
              <h2 className="login-title">Welcome Back</h2>
              <p className="login-subtitle">Sign in to your account to continue</p>
            </div>

            <form className="login-form" onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">
                  <span className="material-symbols-outlined">mail</span>
                  Email Address
                </label>
                <div className="input-wrapper">
                  <input 
                    className="form-input" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    type="email" 
                    placeholder="you@example.com"
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="material-symbols-outlined">lock</span>
                  Password
                </label>
                <div className="input-wrapper password-wrapper">
                  <input 
                    className="form-input" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required 
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="forgot-password">Forgot password?</a>
              </div>

              <button className="btn-login" type="submit">
                <span>Sign In</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            <div className="login-divider">
              <span>or</span>
            </div>

            <div className="social-login">
              <button className="social-btn google">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              <button className="social-btn microsoft">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#f25022" d="M1 1h10v10H1z"/>
                  <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                  <path fill="#7fba00" d="M1 13h10v10H1z"/>
                  <path fill="#ffb900" d="M13 13h10v10H13z"/>
                </svg>
                Continue with Microsoft
              </button>
            </div>

            <div className="login-footer">
              <p>Don't have an account? <Link to="/register" className="register-link">Sign up</Link></p>
            </div>

            <div className="demo-credentials">
              <p className="demo-title">Demo Credentials:</p>
              <p>Teacher: teacher@example.com / password</p>
              <p>Student: student@example.com / password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}