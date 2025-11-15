// SỬA 1: Import 'api' đã được cấu hình (với interceptor) thay vì 'axios'
import api from './api'; 

// SỬA 2: Không cần API_BASE_URL nữa, vì 'api' đã có sẵn baseURL.

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

// 🎯 Hàm gọi backend AI
export const getAIResponse = async (userMessage) => {
  try {
    console.log('🔄 Frontend: Sending to backend...', userMessage);

    const student = getCurrentStudent();
    console.log('👤 Current student:', student);

    // SỬA 3: Dùng 'api.post' và đường dẫn tương đối (vì api.js đã có .../api)
    const response = await api.post(
      '/ai-chat/send', // Đường dẫn tương đối
      {
        message: userMessage,
        studentId: student?.userId || null, // ID thật
        studentCode: student?.studentId || null, // Mã SV thật
      },
      {
        // Headers và timeout vẫn giữ nguyên
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    console.log('✅ Frontend: Backend response:', response.data);
    return response.data.response;
  } catch (error) {
    console.error('❌ Frontend: Backend connection failed:', error);

    // Lỗi 403 (nếu có) sẽ bị bắt ở đây
    if (error.response?.status === 403) {
      return `🤖 **LỖI BẢO MẬT (403)**\n\nKhông thể xác thực. Token của bạn có thể đã hết hạn. Vui lòng đăng xuất và đăng nhập lại.`;
    }

    return `🤖 **CHẾ ĐỘ OFFLINE**\n\nTôi hiểu bạn đang hỏi: "${userMessage}"\n\nLỗi kết nối backend: ${error.message}\n\nVui lòng kiểm tra:\n• Backend Spring Boot đã chạy chưa?\n• Port 8080 có đang hoạt động?`;
  }
};

// ⚙️ Hàm test backend
export const testBackendConnection = async () => {
  try {
    console.log('🧪 Testing backend connection...');
    // SỬA 4: Dùng 'api.get' và đường dẫn tương đối
    const response = await api.get('/ai-chat/test', {
      timeout: 5000,
    });
    console.log('✅ Backend test successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Backend test failed:', error); // Log cả object error
    return { success: false, error: error.message };
  }
};