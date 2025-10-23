import React, { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = (userData) => {
  console.log('Login success received:', userData); // DEBUG
  setCurrentUser({
    userId: userData.userId,           // Quan trọng
    studentId: userData.studentId,
    fullName: userData.fullName
  });
  setCurrentPage('dashboard');
};

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  return (
    <div className="App">
      <header style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        textAlign: 'center',
        position: 'relative'
      }}>
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
              color: 'white'
            }}
          >
            Đăng xuất
          </button>
        )}
      </header>
      
      {currentPage === 'login' && (
        <Login 
          onSwitchToRegister={() => setCurrentPage('register')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      
      {currentPage === 'register' && (
        <Register onSwitchToLogin={() => setCurrentPage('login')} />
      )}
      
      {currentPage === 'dashboard' && currentUser && (
        <Dashboard currentUser={currentUser} />
      )}
    </div>
  );
}

export default App;