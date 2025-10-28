import React, { useState } from 'react';
import { authAPI } from '../services/api';

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      alert('Vui lòng nhập email của bạn');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.forgotPassword(email);
      alert(response.data || 'Vui lòng kiểm tra email để đặt lại mật khẩu.');
      setEmail('');
      // Sau khi gửi xong, có thể tự động quay về trang đăng nhập
      if (onBackToLogin) onBackToLogin();
    } catch (error) {
      alert(error.response?.data || 'Không thể gửi yêu cầu quên mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Quên Mật Khẩu</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại mật khẩu'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        <button
          onClick={onBackToLogin}
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

export default ForgotPassword;
