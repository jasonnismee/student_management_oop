import React, { useState } from 'react';
import { authAPI } from '../services/api';

const ResetPassword = ({ onSwitchToLogin }) => {
  // ✅ Lấy token trực tiếp từ URL
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      alert('Vui lòng nhập đầy đủ mật khẩu.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!token) {
      alert('Thiếu token. Vui lòng kiểm tra lại liên kết trong email.');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.resetPassword(token, newPassword);
      alert(response.data || 'Đặt lại mật khẩu thành công!');

      // ✅ Xóa token khỏi URL NGAY SAU KHI THÀNH CÔNG
      window.history.replaceState({}, document.title, '/');

      // ✅ Quay lại login (chắc chắn redirect về trang login, không giữ URL cũ)
      setTimeout(() => {
        if (typeof onSwitchToLogin === 'function') {
          onSwitchToLogin();
        } else {
          window.location.href = '/';
        }
      }, 100); // delay nhẹ để đảm bảo URL đã được thay
    } catch (error) {
      alert(error.response?.data || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Đặt Lại Mật Khẩu</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: '100%', padding: '10px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '10px' }}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
          }}
        >
          {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        <button
          onClick={onSwitchToLogin}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
          }}
        >
          Quay lại đăng nhập
        </button>
      </p>
    </div>
  );
};

export default ResetPassword;
