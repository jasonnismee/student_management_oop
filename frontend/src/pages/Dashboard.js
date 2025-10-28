import React, { useState, useEffect, useCallback } from 'react';
import { semesterAPI } from '../services/api';
import SubjectManagement from './SubjectManagement';
import GradeManagement from './GradeManagement';
import AnalyticsDashboard from './AnalyticsDashboard';
import DocumentManagement from './DocumentManagement';

const Dashboard = ({ currentUser }) => {
  const [semesters, setSemesters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });
  const [currentModule, setCurrentModule] = useState('semesters');
  const [refreshAnalytics, setRefreshAnalytics] = useState(0); // 🆕 THÊM DÒNG NÀY

  const loadSemesters = useCallback(async () => {
    try {
      const response = await semesterAPI.getSemesters(currentUser.userId);
      setSemesters(response.data);
    } catch (error) {
      console.error('Error loading semesters:', error);
    }
  }, [currentUser.userId]);

  useEffect(() => {
    if (currentUser && currentUser.userId) {
      loadSemesters();
    }
  }, [currentUser, loadSemesters]);

  const handleCreateSemester = async (e) => {
    e.preventDefault();
    if (!currentUser?.userId) {
      alert('Không tìm thấy userId. Vui lòng đăng nhập lại.');
      return;
    }
    try {
      await semesterAPI.createSemester({
        ...formData,
        userId: currentUser.userId,
      });
      setShowForm(false);
      setFormData({ name: '', startDate: '', endDate: '' });
      loadSemesters();
      alert('Tạo học kỳ thành công!');
    } catch (error) {
      alert('Lỗi khi tạo học kỳ: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteSemester = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa học kỳ này?')) {
      try {
        await semesterAPI.deleteSemester(id, currentUser.userId);
        loadSemesters();
        alert('Xóa học kỳ thành công!');
      } catch (error) {
        alert('Lỗi khi xóa học kỳ: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // 🆕 Hàm để refresh analytics khi có thay đổi điểm
  const handleGradeChange = () => {
    console.log('Grade changed - refreshing analytics...');
    setRefreshAnalytics(prev => prev + 1);
  };

  // 🧩 Quản lý học kỳ - GIỮ NGUYÊN NHƯ CŨ
  const renderSemesterManagement = () => (
    <div>
      <h2>Quản Lý Học Kỳ</h2>
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          marginBottom: '20px',
          padding: '10px 15px',
          backgroundColor: '#007bff',
          color: 'white',
        }}
      >
        {showForm ? 'Hủy' : '+ Thêm Học Kỳ Mới'}
      </button>

      {showForm && (
        <form
          onSubmit={handleCreateSemester}
          style={{
            border: '1px solid #ddd',
            padding: '20px',
            borderRadius: '5px',
            marginBottom: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            placeholder="Tên học kỳ (VD: Học kỳ 1 - 2024)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={{
              flex: '1 1 250px',
              padding: '8px',
              borderRadius: '5px',
              border: '1px solid #ccc',
            }}
          />
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            style={{
              flex: '1 1 120px',
              padding: '8px',
              borderRadius: '5px',
              border: '1px solid #ccc',
            }}
          />
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            style={{
              flex: '1 1 120px',
              padding: '8px',
              borderRadius: '5px',
              border: '1px solid #ccc',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Tạo Học Kỳ
          </button>
        </form>
      )}

      <h3>Danh sách học kỳ của bạn:</h3>
      {semesters.length === 0 ? (
        <p>Chưa có học kỳ nào. Hãy tạo học kỳ đầu tiên!</p>
      ) : (
        semesters.map((s) => (
          <div key={s.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px', marginBottom: '10px' }}>
            <h4>{s.name}</h4>
            <p>Bắt đầu: {s.startDate} | Kết thúc: {s.endDate}</p>
            <button
              onClick={() => handleDeleteSemester(s.id)}
              style={{ backgroundColor: '#dc3545', color: 'white', padding: '5px 10px' }}
            >
              Xóa
            </button>
          </div>
        ))
      )}
    </div>
  );

  // 🧩 Các phần khác - CHỈ THÊM CALLBACK
  const renderSubjectManagement = () => <SubjectManagement currentUser={currentUser} />;
  
  const renderGradeManagement = () => (
    <GradeManagement 
      currentUser={currentUser} 
      onGradeChange={handleGradeChange} // 🆕 THÊM DÒNG NÀY
    />
  );
  
  const renderDocumentManagement = () => <DocumentManagement currentUser={currentUser} />;
  
  const renderAnalyticsDashboard = () => (
    <AnalyticsDashboard 
      currentUser={currentUser} 
      refreshTrigger={refreshAnalytics} // 🆕 THÊM DÒNG NÀY
    />
  );

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '20px' }}>
      {/* 🧭 MENU CHÍNH - GIỮ NGUYÊN */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          borderBottom: '2px solid #eee',
          paddingBottom: '15px',
          marginBottom: '25px',
        }}
      >
        {[
          ['semesters', '📘 Quản lý Học kỳ'],
          ['subjects', '📚 Quản lý Môn học'],
          ['grades', '🧮 Quản lý Điểm số'],
          ['documents', '📎 Quản lý Tài liệu'],
          ['analytics', '📊 Thống kê'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCurrentModule(key)}
            style={{
              flex: '1 1 180px',
              textAlign: 'center',
              padding: '12px 20px',
              borderRadius: '10px',
              fontWeight: 'bold',
              border: currentModule === key ? '2px solid #007bff' : '1px solid #ccc',
              backgroundColor: currentModule === key ? '#007bff' : '#f8f9fa',
              color: currentModule === key ? 'white' : '#333',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 📦 Nội dung */}
      {currentModule === 'semesters' && renderSemesterManagement()}
      {currentModule === 'subjects' && renderSubjectManagement()}
      {currentModule === 'grades' && renderGradeManagement()}
      {currentModule === 'documents' && renderDocumentManagement()}
      {currentModule === 'analytics' && renderAnalyticsDashboard()}
    </div>
  );
};

export default Dashboard;