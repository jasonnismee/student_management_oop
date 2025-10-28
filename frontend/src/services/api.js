import axios from 'axios';

// === Cấu hình chung ===
const API_BASE_URL = 'http://localhost:8080/api';

// 🔧 Tạo instance axios chung
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Tự động gắn token (nếu có) vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== AUTH API =====
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),

  login: (loginData) => api.post('/auth/login', loginData),

  // gửi email để nhận link reset
  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  // gửi token và mật khẩu mới để đặt lại
  resetPassword: (token, newPassword) =>
    api.post('/auth/reset-password', { token, newPassword }),
};

// ===== SEMESTER API =====
export const semesterAPI = {
  getSemesters: (userId) => api.get(`/semesters?userId=${userId}`),
  createSemester: (semesterData) => api.post('/semesters', semesterData),
  deleteSemester: (id, userId) => api.delete(`/semesters/${id}?userId=${userId}`),
};

// ===== SUBJECT API =====
export const subjectAPI = {
  getSubjectsBySemester: (semesterId) => api.get(`/subjects/semester/${semesterId}`),
  getSubjectsByUser: (userId) => api.get(`/subjects/user/${userId}`),
  createSubject: (subjectData) => api.post('/subjects', subjectData),
  deleteSubject: (id, userId) => api.delete(`/subjects/${id}?userId=${userId}`),
};

// ===== GRADE API =====
export const gradeAPI = {
  getGradesBySubject: (subjectId) => api.get(`/grades/subject/${subjectId}`),
  getGradesByUser: (userId) => api.get(`/grades/user/${userId}`),
  getSubjectAverage: (subjectId) => api.get(`/grades/subject/${subjectId}/average`),
  createGrade: (gradeData) => api.post('/grades', gradeData),
  updateGrade: (id, gradeData) => api.put(`/grades/${id}`, gradeData),
  deleteGrade: (id, userId) => api.delete(`/grades/${id}?userId=${userId}`),
};

// ===== ANALYTICS API =====
export const analyticsAPI = {
  getSubjectAverage: (subjectId) => api.get(`/analytics/subject/${subjectId}/average`),
  getSemesterGPA: (semesterId) => api.get(`/analytics/semester/${semesterId}/gpa`),
  getOverallGPA: (userId) => api.get(`/analytics/user/${userId}/overall-gpa`),
  getChartData: (userId) => api.get(`/analytics/user/${userId}/chart-data`),
  getSummary: (userId) => api.get(`/analytics/user/${userId}/summary`),
};

// ===== DOCUMENT API =====
export const documentAPI = {
  getDocumentsByUser: (userId) => api.get(`/documents/user/${userId}`),
  getDocumentsBySubject: (subjectId) => api.get(`/documents/subject/${subjectId}`),
  getBookmarkedDocuments: (userId) => api.get(`/documents/user/${userId}/bookmarked`),
  searchDocuments: (userId, keyword) =>
    api.get(`/documents/user/${userId}/search?keyword=${keyword}`),

  uploadDocument: (formData) =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  toggleBookmark: (documentId, userId) =>
    api.put(`/documents/${documentId}/bookmark?userId=${userId}`),

  deleteDocument: (documentId, userId) =>
    api.delete(`/documents/${documentId}?userId=${userId}`),

  baseURL: API_BASE_URL + '/documents',
};

export default api;
