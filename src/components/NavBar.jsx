import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import './NavBar.css';

export default function NavBar() {
  const user = storage.getCurrentUser();
  const navigate = useNavigate();

  const logout = () => {
    if (confirm('Are you sure you want to logout?')) {
      storage.logout();
      navigate('/login');
      window.location.reload();
    }
  };

  return (
    <nav className="navbar-modern">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-text">Activity Monitor</span>
        </Link>
        
        <div className="navbar-menu">
          {user ? (
            <>
              <div className="user-info">
                <span className="material-symbols-outlined">account_circle</span>
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
              
              <button className="nav-btn nav-btn-primary" onClick={() => navigate('/')}>
                <span className="material-symbols-outlined">home</span>
              </button>
              
              <button className="nav-btn nav-btn-logout" onClick={logout}>
                <span className="material-symbols-outlined">logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn nav-btn-primary">
                <span className="material-symbols-outlined">login</span>
              </Link>
              
              <Link to="/register" className="nav-btn nav-btn-outline">
                <span className="material-symbols-outlined">person_add</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}