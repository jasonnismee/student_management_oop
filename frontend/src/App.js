import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Home from './pages/home';
import './App.css';
import Chatbot from "./components/Chatbot";

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);


  useEffect(() => {
    const url = window.location.pathname;
    if (url.startsWith('/reset-password')) {
      setCurrentPage('resetPassword');
    }
  }, []);


  // Khi reload: kiểm tra token
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    if (token && userData) {
      try {
        setCurrentUser(JSON.parse(userData));
        setCurrentPage('home');
      } catch (e) {
        console.error('Error parsing userData:', e);
      }
    }
  }, []);
  


  const handleLoginSuccess = (data) => {
    console.log('Data nhận từ Login:', data); 
    setCurrentUser(data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('userData', JSON.stringify(data));
    setCurrentPage('home');
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setCurrentPage('login');
  };

  return (
    <div className="App">
      <header>
        <h1>HỆ THỐNG QUẢN LÝ HỌC TẬP</h1>
        {currentUser && (
          <button className="logout-btn" onClick={handleLogout}>
            Đăng xuất
          </button>
        )}
      </header>

      <main>
        {currentPage === 'login' && (
          <div className="page-container">
            <Login
              onSwitchToRegister={() => setCurrentPage('register')}
              onSwitchToForgotPassword={() => setCurrentPage('forgotPassword')}
              onLoginSuccess={handleLoginSuccess}
            />
          </div>
        )}

        {currentPage === 'register' && (
          <div className="page-container">
            <Register onSwitchToLogin={() => setCurrentPage('login')} />
          </div>
        )}

        {currentPage === 'forgotPassword' && (
          <div className="page-container">
            <ForgotPassword onBackToLogin={() => setCurrentPage('login')} />
          </div>
        )}

        {currentPage === 'resetPassword' && (
          <div className="page-container">
            <ResetPassword onSwitchToLogin={() => setCurrentPage('login')} />
          </div>
        )}

        {currentPage === 'home' && currentUser && (
          <div className="page-container wide">
            <Home
              currentUser={currentUser}
              onEnterDashboard={() => setCurrentPage('dashboard')}
            />
          </div>
        )}

        {currentPage === 'dashboard' && currentUser && (
          <div className="page-container wide">
            <Dashboard currentUser={currentUser} />
          </div>
        )}
      </main>

      {/* SỬA: Chỉ hiển thị Chatbot khi đã đăng nhập */}
      {currentUser && <Chatbot />}
    </div>
  );
}

export default App;