import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // Backend Spring Boot

// 🔥 Lấy thông tin sinh viên đang đăng nhập từ localStorage
const getCurrentStudent = () => {
  try {
    const data = localStorage.getItem('userData');
    if (!data) return null;
    return JSON.parse(data);
  } catch (err) {
    console.error('❌ Lỗi khi đọc userData từ localStorage:', err);
    return null;
  }
};

// 🔑 Hàm lấy headers authorization
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// 🎯 Hàm gọi backend AI
export const getAIResponse = async (userMessage) => {
  try {
    console.log('🔄 Frontend: Sending to backend...', userMessage);

    const student = getCurrentStudent();
    console.log('👤 Current student:', student);

    const response = await axios.post(
      `${API_BASE_URL}/api/ai-chat/send`,
      {
        message: userMessage,
        studentId: student?.userId || null, // ID thật
        studentCode: student?.studentId || null, // Mã SV thật
      },
      {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        timeout: 30000,
      }
    );

    console.log('✅ Frontend: Backend response:', response.data);
    return response.data.response;
  } catch (error) {
    console.error('❌ Frontend: Backend connection failed:', error);

    return `🤖 **CHẾ ĐỘ OFFLINE**\n\nTôi hiểu bạn đang hỏi: "${userMessage}"\n\nLỗi kết nối backend: ${error.message}\n\nVui lòng kiểm tra:\n• Backend Spring Boot đã chạy chưa?\n• Port 8080 có đang hoạt động?`;
  }
};

// ⚙️ Hàm test backend
export const testBackendConnection = async () => {
  try {
    console.log('🧪 Testing backend connection...');
    const response = await axios.get(`${API_BASE_URL}/api/ai-chat/test`, {
      headers: getAuthHeaders(),
      timeout: 5000,
    });
    console.log('✅ Backend test successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    return { success: false, error: error.message };
  }
};

