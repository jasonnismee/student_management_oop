import React, { useState } from 'react';
import { authAPI } from '../services/api';

const Login = ({ onSwitchToRegister, onSwitchToForgotPassword, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    password: '',
  });

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await authAPI.login(formData);
    alert(response.data.message || 'Đăng nhập thành công!');

    if (onLoginSuccess && response.data.userId) {
      const userData = {
        userId: response.data.userId,
        studentId: response.data.studentId,
        fullName: response.data.fullName,
        token: response.data.token,
      };
      onLoginSuccess(userData);
    } else {
      alert('Lỗi: Không nhận được thông tin user từ server');
    }
  } catch (error) {
    alert(error.response?.data?.message || 'Đăng nhập thất bại');
  }
};


  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Đăng Nhập</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Mã Sinh Viên"
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            style={{ width: '100%', padding: '10px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="Mật Khẩu"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={{ width: '100%', padding: '10px' }}
            required
          />
        </div>
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
          }}
        >
          Đăng Nhập
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        <button
          onClick={onSwitchToForgotPassword}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
          }}
        >
          Quên mật khẩu?
        </button>
      </p>

      <p style={{ textAlign: 'center', marginTop: '10px' }}>
        Chưa có tài khoản?
        <button
          onClick={onSwitchToRegister}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
          }}
        >
          Đăng ký ngay
        </button>
      </p>
    </div>
  );
};

export default Login;
