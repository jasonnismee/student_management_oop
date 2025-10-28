import React from 'react';
import '../home.css';

function Home({ currentUser, onEnterDashboard }) {
  return (
    <div className="home-container">
      <h2>Xin chào, {currentUser?.fullName || 'Sinh viên'} 👋</h2>
      <p>Chào mừng bạn đến với hệ thống quản lý học tập của sinh viên.</p>

      <div className="home-info">
        <p><strong>Mã sinh viên:</strong> {currentUser?.studentId}</p>
        <p><strong>Email:</strong> {currentUser?.email}</p>
      </div>

      <button className="enter-btn" onClick={onEnterDashboard}>
        🎓 Vào Hệ Thống Quản Lý
      </button>
    </div>
  );
}

export default Home;
