import React, { useState, useEffect, useCallback } from 'react';
import { semesterAPI } from '../services/api';
import SubjectManagement from './SubjectManagement';
import GradeManagement from './GradeManagement';
import AnalyticsDashboard from './AnalyticsDashboard';
import DocumentManagement from './DocumentManagement'; // <--- THÊM IMPORT DOCUMENT MANAGEMENT

const Dashboard = ({ currentUser }) => {
  const [semesters, setSemesters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });
  // KHAI BÁO MODULE MỚI: 'documents'
  const [currentModule, setCurrentModule] = useState('semesters'); 

  // Sửa: Dùng useCallback
  const loadSemesters = useCallback(async () => {
    try {
      const response = await semesterAPI.getSemesters(currentUser.userId);
      setSemesters(response.data);
    } catch (error) {
      console.error('Error loading semesters:', error);
    }
  }, [currentUser.userId]);

  // Load danh sách học kỳ khi component mount
  useEffect(() => {
    if (currentUser && currentUser.userId) {
      loadSemesters();
    }
  }, [currentUser, loadSemesters]);

  const handleCreateSemester = async (e) => {
    e.preventDefault();
    
    console.log('Current user:', currentUser);
    
    if (!currentUser?.userId) {
      alert('Lỗi: Không tìm thấy userId. Vui lòng đăng nhập lại.');
      return;
    }
    
    try {
      const semesterData = {
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        userId: currentUser.userId
      };
      
      console.log('Sending semester data:', semesterData);
      
      const response = await semesterAPI.createSemester(semesterData);
      console.log('Create semester response:', response.data);
      
      setShowForm(false);
      setFormData({ name: '', startDate: '', endDate: '' });
      loadSemesters();
      alert('Tạo học kỳ thành công!');
    } catch (error) {
      console.error('Full error:', error);
      console.error('Error response:', error.response?.data);
      alert('Lỗi khi tạo học kỳ: ' + 
        (error.response?.data?.message || error.message || 'Unknown error'));
    }
  };

  const handleDeleteSemester = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa học kỳ này?')) {
      try {
        await semesterAPI.deleteSemester(id, currentUser.userId);
        loadSemesters();
        alert('Xóa học kỳ thành công!');
      } catch (error) {
        alert('Lỗi khi xóa học kỳ: ' + error.response?.data?.message);
      }
    }
  };

  // Render module quản lý học kỳ
  const renderSemesterManagement = () => (
    <div>
      <h2>Quản Lý Học Kỳ</h2>
      <p>Xin chào, {currentUser?.fullName} ({currentUser?.studentId})</p>
      
      <button 
        onClick={() => setShowForm(!showForm)}
        style={{ marginBottom: '20px', padding: '10px 15px', backgroundColor: '#007bff', color: 'white' }}
      >
        {showForm ? 'Hủy' : '+ Thêm Học Kỳ Mới'}
      </button>

      {/* Form thêm học kỳ */}
      {showForm && (
        <form onSubmit={handleCreateSemester} style={{ 
          border: '1px solid #ddd', 
          padding: '20px', 
          marginBottom: '20px',
          borderRadius: '5px' 
        }}>
          <h3>Thêm Học Kỳ Mới</h3>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Tên học kỳ (VD: Học kỳ 1 - 2024)"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '8px' }}
              required
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Ngày bắt đầu: </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              style={{ padding: '8px', marginLeft: '10px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Ngày kết thúc: </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              style={{ padding: '8px', marginLeft: '10px' }}
            />
          </div>
          <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white' }}>
            Tạo Học Kỳ
          </button>
        </form>
      )}

      {/* Danh sách học kỳ - SỬA: BỎ CÁC NÚT THỪA, CHỈ GIỮ XÓA */}
      <div>
        <h3>Danh sách học kỳ của bạn:</h3>
        {semesters.length === 0 ? (
          <p>Chưa có học kỳ nào. Hãy tạo học kỳ đầu tiên!</p>
        ) : (
          <div>
            {semesters.map(semester => (
              <div key={semester.id} style={{
                border: '1px solid #ddd',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4>{semester.name}</h4>
                  <p>Bắt đầu: {semester.startDate} | Kết thúc: {semester.endDate}</p>
                </div>
                <div>
                  {/* CHỈ GIỮ LẠI NÚT XÓA, BỎ CÁC NÚT KHÁC */}
                  <button 
                    onClick={() => handleDeleteSemester(semester.id)}
                    style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white' }}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render module quản lý môn học
  const renderSubjectManagement = () => (
    <div>
      <button 
        onClick={() => setCurrentModule('semesters')}
        style={{ marginBottom: '20px', padding: '8px 15px', backgroundColor: '#6c757d', color: 'white' }}
      >
        ← Quay lại Quản lý Học kỳ
      </button>
      <SubjectManagement currentUser={currentUser} />
    </div>
  );

  // Render module quản lý điểm số
  const renderGradeManagement = () => (
    <div>
      <button 
        onClick={() => setCurrentModule('semesters')}
        style={{ marginBottom: '20px', padding: '8px 15px', backgroundColor: '#6c757d', color: 'white' }}
      >
        ← Quay lại Quản lý Học kỳ
      </button>
      <GradeManagement currentUser={currentUser} />
    </div>
  );
  
  // RENDER MODULE QUẢN LÝ TÀI LIỆU (TẠO MỚI)
  const renderDocumentManagement = () => (
    <div>
      <DocumentManagement currentUser={currentUser} />
    </div>
  );

  // Render module analytics
  const renderAnalyticsDashboard = () => (
    <div>
      <button 
        onClick={() => setCurrentModule('semesters')}
        style={{ marginBottom: '20px', padding: '8px 15px', backgroundColor: '#6c757d', color: 'white' }}
      >
        ← Quay lại Quản lý Học kỳ
      </button>
      <AnalyticsDashboard currentUser={currentUser} />
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Navigation - CÁC NÚT CHUYỂN MODULE CHÍNH */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        <button 
          onClick={() => setCurrentModule('semesters')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: currentModule === 'semesters' ? '#007bff' : '#f8f9fa', 
            color: currentModule === 'semesters' ? 'white' : 'black',
            marginRight: '10px'
          }}
        >
          Quản lý Học kỳ
        </button>
        <button 
          onClick={() => setCurrentModule('subjects')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: currentModule === 'subjects' ? '#007bff' : '#f8f9fa', 
            color: currentModule === 'subjects' ? 'white' : 'black',
            marginRight: '10px'
          }}
        >
          Quản lý Môn học
        </button>
        <button 
          onClick={() => setCurrentModule('grades')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: currentModule === 'grades' ? '#007bff' : '#f8f9fa', 
            color: currentModule === 'grades' ? 'white' : 'black',
            marginRight: '10px'
          }}
        >
          Quản lý Điểm số
        </button>
        
        {/* THÊM NÚT QUẢN LÝ TÀI LIỆU */}
        <button 
          onClick={() => setCurrentModule('documents')} 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: currentModule === 'documents' ? '#007bff' : '#f8f9fa', 
            color: currentModule === 'documents' ? 'white' : 'black',
            marginRight: '10px'
          }}
        >
          📎 Quản lý Tài liệu
        </button>

        <button 
          onClick={() => setCurrentModule('analytics')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: currentModule === 'analytics' ? '#007bff' : '#f8f9fa', 
            color: currentModule === 'analytics' ? 'white' : 'black'
          }}
        >
          📊 Thống kê
        </button>
      </div>

      {/* Content */}
      {currentModule === 'semesters' && renderSemesterManagement()}
      {currentModule === 'subjects' && renderSubjectManagement()}
      {currentModule === 'grades' && renderGradeManagement()}
      {currentModule === 'documents' && renderDocumentManagement()} {/* <--- THÊM DÒNG NÀY */}
      {currentModule === 'analytics' && renderAnalyticsDashboard()}
    </div>
  );
};

export default Dashboard; 