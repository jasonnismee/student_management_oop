import React, { useState, useEffect, useCallback } from 'react';
import { subjectAPI, semesterAPI } from '../services/api';

const SubjectManagement = ({ currentUser }) => {
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    credits: 3,
    subjectCode: '',
    semesterId: ''
  });

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
    if (currentUser?.userId) {
      loadSemesters();
    }
  }, [currentUser, loadSemesters]); // Sửa: Thêm dependency

  // Load môn học khi chọn học kỳ
  useEffect(() => {
    if (selectedSemester) {
      loadSubjects(selectedSemester);
    }
  }, [selectedSemester]);

  const loadSubjects = async (semesterId) => {
    try {
      const response = await subjectAPI.getSubjectsBySemester(semesterId);
      setSubjects(response.data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    
    if (!currentUser?.userId || !selectedSemester) {
      alert('Lỗi: Vui lòng chọn học kỳ trước.');
      return;
    }

    try {
      const subjectData = {
        name: formData.name,
        credits: parseInt(formData.credits),
        subjectCode: formData.subjectCode,
        semesterId: parseInt(selectedSemester) // QUAN TRỌNG: chuyển thành số
      };

      console.log('Sending subject data:', subjectData);

      // VALIDATION: kiểm tra semesterId
      if (!subjectData.semesterId || isNaN(subjectData.semesterId)) {
        alert('Lỗi: SemesterId không hợp lệ');
        return;
      }

      const response = await subjectAPI.createSubject(subjectData);
      console.log('Create subject response:', response.data);

      setShowForm(false);
      setFormData({
        name: '',
        credits: 3,
        subjectCode: '',
        semesterId: selectedSemester
      });
      
      loadSubjects(selectedSemester);
      alert('Tạo môn học thành công!');
    } catch (error) {
      console.error('Error creating subject:', error);
      console.error('Error details:', error.response?.data);
      alert('Lỗi khi tạo môn học: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteSubject = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa môn học này?')) {
      try {
        await subjectAPI.deleteSubject(id, currentUser.userId);
        loadSubjects(selectedSemester);
        alert('Xóa môn học thành công!');
      } catch (error) {
        alert('Lỗi khi xóa môn học: ' + error.response?.data?.message);
      }
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Quản Lý Môn Học</h2>
      
      {/* Chọn học kỳ */}
      <div style={{ marginBottom: '20px' }}>
        <label>Chọn học kỳ: </label>
        <select 
          value={selectedSemester} 
          onChange={(e) => {
            setSelectedSemester(e.target.value);
            setFormData(prev => ({ ...prev, semesterId: e.target.value }));
          }}
          style={{ padding: '8px', marginLeft: '10px' }}
        >
          <option value="">-- Chọn học kỳ --</option>
          {semesters.map(semester => (
            <option key={semester.id} value={semester.id}>
              {semester.name}
            </option>
          ))}
        </select>
      </div>

      {/* Button thêm môn học */}
      {selectedSemester && (
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{ marginBottom: '20px', padding: '10px 15px', backgroundColor: '#007bff', color: 'white' }}
        >
          {showForm ? 'Hủy' : '+ Thêm Môn Học Mới'}
        </button>
      )}

      {/* Form thêm môn học */}
      {showForm && selectedSemester && (
        <form onSubmit={handleCreateSubject} style={{ 
          border: '1px solid #ddd', 
          padding: '20px', 
          marginBottom: '20px',
          borderRadius: '5px' 
        }}>
          <h3>Thêm Môn Học Mới</h3>
          
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Tên môn học"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '8px' }}
              required
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Mã môn học (tùy chọn)"
              value={formData.subjectCode}
              onChange={(e) => setFormData({...formData, subjectCode: e.target.value})}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Số tín chỉ: </label>
            <select
              value={formData.credits}
              onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
              style={{ padding: '8px', marginLeft: '10px' }}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>

          <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white' }}>
            Tạo Môn Học
          </button>
        </form>
      )}

      {/* Danh sách môn học */}
      <div>
        <h3>Danh sách môn học:</h3>
        {!selectedSemester ? (
          <p>Vui lòng chọn học kỳ để xem môn học</p>
        ) : subjects.length === 0 ? (
          <p>Chưa có môn học nào trong học kỳ này.</p>
        ) : (
          <div>
            {subjects.map(subject => (
              <div key={subject.id} style={{
                border: '1px solid #ddd',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4>{subject.name}</h4>
                  <p>Mã môn: {subject.subjectCode || 'Chưa có mã'} | Số tín chỉ: {subject.credits}</p>
                </div>
                <button 
                  onClick={() => handleDeleteSubject(subject.id)}
                  style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white' }}
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectManagement;