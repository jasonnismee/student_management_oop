import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);

  // Khi reload trang: kiểm tra localStorage xem còn token + userData không
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    if (token && userData) {
      try {
        setCurrentUser(JSON.parse(userData));
        setCurrentPage('dashboard');
      } catch (e) {
        console.error('Error parsing userData:', e);
      }
    }
  }, []);

  const handleLoginSuccess = (data) => {
    setCurrentUser(data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('userData', JSON.stringify(data));
    setCurrentPage('dashboard');
  };

  useEffect(() => {
    // Kiểm tra xem URL có token không (link từ email)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const path = window.location.pathname;

    // Nếu user đang mở /reset-password?token=..., chuyển sang trang resetPassword
    if (path === '/reset-password' && token) {
      setCurrentPage('resetPassword');
    }
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setCurrentPage('login');
  };

  return (
    <div className="App">
      <header
        style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <h1>HỆ THỐNG QUẢN LÝ HỌC TẬP</h1>
        <p>Quản lý điểm số và học tập hiệu quả</p>

        {currentUser && (
          <button
            onClick={handleLogout}
            style={{
              position: 'absolute',
              right: '20px',
              top: '20px',
              padding: '5px 10px',
              backgroundColor: '#dc3545',
              color: 'white',
            }}
          >
            Đăng xuất
          </button>
        )}
      </header>

      {currentPage === 'login' && (
        <Login
          onSwitchToRegister={() => setCurrentPage('register')}
          onSwitchToForgotPassword={() => setCurrentPage('forgotPassword')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentPage === 'register' && (
        <Register onSwitchToLogin={() => setCurrentPage('login')} />
      )}

      {currentPage === 'forgotPassword' && (
        <ForgotPassword onBackToLogin={() => setCurrentPage('login')} />
      )}

      {currentPage === 'resetPassword' && (
        <ResetPassword onSwitchToLogin={() => setCurrentPage('login')} />
      )}

      {currentPage === 'dashboard' && currentUser && (
        <Dashboard currentUser={currentUser} />
      )}
    </div>
  );
}

export default App;
