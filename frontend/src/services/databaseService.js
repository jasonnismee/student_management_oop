import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// 🎯 Lấy tất cả học kỳ của user - ĐÃ SỬA URL
export const getSemesters = async (userId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/semesters?userId=${userId}`, // SỬA: thành query parameter
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Get semesters error:', error);
        throw new Error(`Không thể lấy danh sách học kỳ: ${error.response?.data?.message || error.message}`);
    }
};

// 🎯 Lấy môn học theo học kỳ - KIỂM TRA URL NÀY
export const getSubjectsBySemester = async (semesterId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/semesters/${semesterId}/subjects`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Get subjects error:', error);
        throw new Error(`Không thể lấy danh sách môn học: ${error.response?.data?.message || error.message}`);
    }
};

// 🎯 Lấy điểm của môn học
export const getSubjectGrades = async (subjectId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/subjects/${subjectId}/grades`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Get grades error:', error);
        throw new Error(`Không thể lấy điểm môn học: ${error.response?.data?.message || error.message}`);
    }
};

// 🎯 Lấy thông tin user
export const getUserInfo = async (userId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/users/${userId}`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Get user info error:', error);
        throw new Error(`Không thể lấy thông tin user: ${error.response?.data?.message || error.message}`);
    }
};

// 🎯 Lấy tất cả dữ liệu học tập của user
export const getAllStudentData = async (userId) => {
    try {
        const semesters = await getSemesters(userId);
        
        console.log('📊 Semesters data received:', semesters); // Debug
        
        const allData = await Promise.all(
            semesters.map(async (semester) => {
                console.log('📅 Semester details:', { // Debug từng semester
                    id: semester.id,
                    name: semester.name,
                    startDate: semester.startDate,
                    endDate: semester.endDate,
                    userId: semester.userId
                });
                
                const subjects = await getSubjectsBySemester(semester.id);
                
                const subjectsWithGrades = await Promise.all(
                    subjects.map(async (subject) => {
                        const grades = await getSubjectGrades(subject.id);
                        return {
                            ...subject,
                            grades: grades[0] || null
                        };
                    })
                );
                
                return {
                    ...semester,
                    subjects: subjectsWithGrades
                };
            })
        );
        
        return allData;
    } catch (error) {
        console.error('Get all student data error:', error);
        throw error;
    }
};