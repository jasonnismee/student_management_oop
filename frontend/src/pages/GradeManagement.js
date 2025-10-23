import React, { useState, useEffect, useCallback } from 'react'; // THÊM useCallback
import { gradeAPI, subjectAPI, semesterAPI } from '../services/api';
import { gradeTemplates, calculateAverage, getTemplateById } from '../config/gradeTemplates';

const GradeManagement = ({ currentUser }) => {
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [formData, setFormData] = useState({
    templateType: '10-10-80',
    score1: '',
    score2: '',
    score3: '',
    score4: ''
  });

  // Lấy template hiện tại từ formData
  const currentTemplate = getTemplateById(formData.templateType) || gradeTemplates[0];

  // SỬA: Dùng useCallback để tránh dependency warnings
  const loadSemesters = useCallback(async () => {
    try {
      const response = await semesterAPI.getSemesters(currentUser.userId);
      setSemesters(response.data);
    } catch (error) {
      console.error('Error loading semesters:', error);
    }
  }, [currentUser.userId]); // THÊM dependency

  const loadSubjects = useCallback(async (semesterId) => {
    try {
      const response = await subjectAPI.getSubjectsBySemester(semesterId);
      setSubjects(response.data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  }, []);

  const loadGrades = useCallback(async (subjectId) => {
    try {
      const response = await gradeAPI.getGradesBySubject(subjectId);
      setGrades(response.data);
    } catch (error) {
      console.error('Error loading grades:', error);
    }
  }, []);

  // Load danh sách học kỳ khi component mount
  useEffect(() => {
    if (currentUser?.userId) {
      loadSemesters();
    }
  }, [currentUser, loadSemesters]); // THÊM loadSemesters vào dependency

  // Load môn học khi chọn học kỳ
  useEffect(() => {
    if (selectedSemester) {
      loadSubjects(selectedSemester);
      setSelectedSubject('');
      setGrades([]);
    }
  }, [selectedSemester, loadSubjects]); // THÊM loadSubjects

  // Load điểm khi chọn môn học
  useEffect(() => {
    if (selectedSubject) {
      loadGrades(selectedSubject);
      setFormData(prev => ({ ...prev, subjectId: selectedSubject }));
    }
  }, [selectedSubject, loadGrades]); // THÊM loadGrades

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    
    if (!currentUser?.userId || !selectedSubject) {
      alert('Lỗi: Vui lòng chọn môn học trước.');
      return;
    }

    try {
      const gradeData = {
        templateType: formData.templateType,
        subjectId: parseInt(selectedSubject),
        score1: formData.score1 ? parseFloat(formData.score1) : null,
        score2: formData.score2 ? parseFloat(formData.score2) : null,
        score3: formData.score3 ? parseFloat(formData.score3) : null,
        score4: formData.score4 ? parseFloat(formData.score4) : null
      };

      console.log('Sending grade data:', gradeData);

      let response;
      if (editingGrade) {
        response = await gradeAPI.updateGrade(editingGrade.id, gradeData);
      } else {
        response = await gradeAPI.createGrade(gradeData);
      }

      console.log('Grade response:', response.data);

      // Reset form
      setShowForm(false);
      setEditingGrade(null);
      setFormData({
        templateType: '10-10-80',
        score1: '',
        score2: '',
        score3: '',
        score4: ''
      });
      
      // Reload data
      loadGrades(selectedSubject);
      alert(editingGrade ? 'Cập nhật điểm thành công!' : 'Thêm điểm thành công!');
    } catch (error) {
      console.error('Error saving grade:', error);
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditGrade = (grade) => {
    setEditingGrade(grade);
    setFormData({
      templateType: grade.templateType,
      score1: grade.score1 ? grade.score1.toString() : '',
      score2: grade.score2 ? grade.score2.toString() : '',
      score3: grade.score3 ? grade.score3.toString() : '',
      score4: grade.score4 ? grade.score4.toString() : ''
    });
    setShowForm(true);
  };

  const handleDeleteGrade = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bộ điểm này?')) {
      try {
        await gradeAPI.deleteGrade(id, currentUser.userId);
        loadGrades(selectedSubject);
        alert('Xóa điểm thành công!');
      } catch (error) {
        alert('Lỗi khi xóa điểm: ' + error.response?.data?.message);
      }
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingGrade(null);
    setFormData({
      templateType: '10-10-80',
      score1: '',
      score2: '',
      score3: '',
      score4: ''
    });
  };

  const handleTemplateChange = (e) => {
    const newTemplateType = e.target.value;
    setFormData({
      templateType: newTemplateType,
      score1: '',
      score2: '',
      score3: '',
      score4: ''
    });
  };

  // Tính điểm trung bình cho một grade
  const calculateGradeAverage = (grade) => {
    const template = getTemplateById(grade.templateType);
    const scores = [grade.score1, grade.score2, grade.score3, grade.score4];
    return calculateAverage(scores, template);
  };

  // Tính điểm trung bình tổng cho môn học
  const calculateOverallAverage = () => {
    if (grades.length === 0) return 0;
    
    let total = 0;
    grades.forEach(grade => {
      total += parseFloat(calculateGradeAverage(grade));
    });
    
    return (total / grades.length).toFixed(1);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2>Quản Lý Điểm Số</h2>
      
      {/* Chọn học kỳ và môn học */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <label>Chọn học kỳ: </label>
          <select 
            value={selectedSemester} 
            onChange={(e) => setSelectedSemester(e.target.value)}
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

        <div>
          <label>Chọn môn học: </label>
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ padding: '8px', marginLeft: '10px' }}
            disabled={!selectedSemester}
          >
            <option value="">-- Chọn môn học --</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.credits} tín chỉ)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hiển thị điểm trung bình tổng */}
      {selectedSubject && grades.length > 0 && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          border: '1px solid #dee2e6'
        }}>
          <h3>Điểm trung bình môn: <span style={{ color: '#007bff' }}>{calculateOverallAverage()}/10</span></h3>
        </div>
      )}

      {/* Button thêm điểm */}
      {selectedSubject && !showForm && (
        <button 
          onClick={() => setShowForm(true)}
          style={{ marginBottom: '20px', padding: '10px 15px', backgroundColor: '#007bff', color: 'white' }}
        >
          + Thêm Bộ Điểm Mới
        </button>
      )}

      {/* Form thêm/sửa điểm */}
      {showForm && selectedSubject && (
        <form onSubmit={handleSaveGrade} style={{ 
          border: '1px solid #ddd', 
          padding: '20px', 
          marginBottom: '20px',
          borderRadius: '5px' 
        }}>
          <h3>{editingGrade ? 'Chỉnh sửa Điểm' : 'Thêm Bộ Điểm Mới'}</h3>
          
          {/* Chọn template */}
          <div style={{ marginBottom: '20px' }}>
            <label>Chọn hệ số điểm: </label>
            <select
              value={formData.templateType}
              onChange={handleTemplateChange}
              style={{ padding: '8px', marginLeft: '10px', width: '200px' }}
              disabled={editingGrade} // Không cho đổi template khi edit
            >
              {gradeTemplates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Hiển thị các ô điểm theo template */}
          <div style={{ marginBottom: '20px' }}>
            <h4>Nhập điểm (thang điểm 10):</h4>
            {currentTemplate.labels.slice(0, currentTemplate.fields).map((label, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <label>{label}: </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  placeholder="0-10"
                  value={formData[`score${index + 1}`]}
                  onChange={(e) => setFormData({
                    ...formData, 
                    [`score${index + 1}`]: e.target.value
                  })}
                  style={{ padding: '8px', marginLeft: '10px', width: '100px' }}
                  required
                />
              </div>
            ))}
          </div>

          {/* Hiển thị điểm trung bình dự kiến */}
          <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
            <strong>Điểm trung bình dự kiến: </strong>
            <span style={{ color: '#007bff', fontWeight: 'bold' }}>
              {calculateAverage([
                formData.score1, 
                formData.score2, 
                formData.score3, 
                formData.score4
              ], currentTemplate)}
              /10
            </span>
          </div>

          <div>
            <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', marginRight: '10px' }}>
              {editingGrade ? 'Cập nhật' : 'Thêm Điểm'}
            </button>
            <button type="button" onClick={handleCancelForm} style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white' }}>
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Danh sách bộ điểm */}
      <div>
        <h3>Danh sách bộ điểm:</h3>
        {!selectedSubject ? (
          <p>Vui lòng chọn môn học để xem điểm</p>
        ) : grades.length === 0 ? (
          <p>Chưa có bộ điểm nào cho môn học này.</p>
        ) : (
          <div>
            {grades.map(grade => {
              const template = getTemplateById(grade.templateType);
              return (
                <div key={grade.id} style={{
                  border: '1px solid #ddd',
                  padding: '15px',
                  marginBottom: '10px',
                  borderRadius: '5px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4>Hệ số: {template.name}</h4>
                    <div>
                      <button 
                        onClick={() => handleEditGrade(grade)}
                        style={{ padding: '5px 10px', backgroundColor: '#ffc107', color: 'black', marginRight: '10px' }}
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => handleDeleteGrade(grade.id)}
                        style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white' }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    {template.labels.slice(0, template.fields).map((label, index) => (
                      <div key={index}>
                        <strong>{label}:</strong> {grade[`score${index + 1}`] || 'Chưa nhập'}/10
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                    <strong>Điểm trung bình: {calculateGradeAverage(grade)}/10</strong>
                  </div>
                  
                  <small>Thời gian: {new Date(grade.createdAt).toLocaleDateString('vi-VN')}</small>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeManagement;