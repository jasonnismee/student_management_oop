import React from 'react';
import '../home.css';

function Home({ currentUser, onEnterDashboard }) {
  // Debug để xem currentUser có gì
  console.log('currentUser:', currentUser);
  console.log('currentUser email:', currentUser?.email);

  return (
    <div className="home-container">
      <h2>Xin chào, {currentUser?.fullName || 'Sinh viên'} 👋</h2>
      <p>Chào mừng bạn đến với hệ thống quản lý học tập của sinh viên.</p>

      <div className="home-info">
        <p><strong>Mã sinh viên:</strong> {currentUser?.studentId || 'Chưa có mã'}</p>
        <p><strong>Email:</strong> {currentUser?.email || 'Chưa có email'}</p>
        
        {/* Hiển thị tất cả thông tin user để debug */}
        {currentUser && (
          <div style={{display: 'none'}}>
            Debug: {JSON.stringify(currentUser)}
          </div>
        )}
      </div>

      <button className="enter-btn" onClick={onEnterDashboard}>
        🎓 Vào Hệ Thống Quản Lý
      </button>
    </div>
  );
}

export default Home;