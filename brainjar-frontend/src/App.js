import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Problems from './components/Problems';
import Friends from './components/Friends';
import Chat from './components/Chat';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/*" element={<Login onLogin={handleLogin} />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Navbar user={user} onLogout={handleLogout} />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="/problems" element={<Problems user={user} />} />
              <Route path="/friends" element={<Friends user={user} />} />
              <Route path="/chat" element={<Chat user={user} />} />
              <Route path="/leaderboard" element={<Leaderboard user={user} />} />
              <Route path="/profile" element={<Profile user={user} />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );;
}

export default App;
