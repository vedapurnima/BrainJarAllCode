import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <div className="brand-icon">🧠</div>
          <span>BrainJar</span>
        </Link>

        <div className="navbar-nav">
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') || isActive('/')}`}
          >
            <span className="nav-icon">🏠</span>
            Dashboard
          </Link>
          
          <Link 
            to="/problems" 
            className={`nav-link ${isActive('/problems')}`}
          >
            <span className="nav-icon">📋</span>
            Problems
          </Link>
          
          <Link 
            to="/friends" 
            className={`nav-link ${isActive('/friends')}`}
          >
            <span className="nav-icon">👥</span>
            Friends
          </Link>
          
          <Link 
            to="/chat" 
            className={`nav-link ${isActive('/chat')}`}
          >
            <span className="nav-icon">💬</span>
            Chat
          </Link>
          
          <Link 
            to="/profile" 
            className={`nav-link ${isActive('/profile')}`}
          >
            <span className="nav-icon">👤</span>
            Profile
          </Link>
        </div>

        <div className="navbar-user">
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '🌞'}
          </button>
          
          <div className="user-info">
            <span className="user-name">
              {user?.username || user?.email || 'User'}
            </span>
          </div>
          <button 
            onClick={onLogout} 
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
