import React, { useState, useEffect, useCallback } from 'react';
import { gradeAPI, subjectAPI, semesterAPI } from '../services/api';
import { gradeTemplates, calculateAverage, getTemplateById } from '../config/gradeTemplates';

const GradeManagement = ({ currentUser, onGradeChange }) => { // 🆕 THÊM onGradeChange prop
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


  // Thêm hàm này vào component của bạn
  const getColorByGrade = (letterGrade) => {
    switch(letterGrade) {
      case 'A+': case 'A': case 'B+': case 'B': return '#28a745'; // Xanh lá - Tốt
      case 'C+': return '#ffc107'; // Vàng - Khá  
      case 'C': case 'D+': return '#fd7e14'; // Cam - Trung bình
      case 'D': return '#dc3545'; // Đỏ - Yếu
      case 'F': return '#6c757d'; // Xám - Trượt
      default: return '#007bff';
    }
  };

  const currentTemplate = getTemplateById(formData.templateType) || gradeTemplates[0];

  const loadSemesters = useCallback(async () => {
    try {
      const response = await semesterAPI.getSemesters(currentUser.userId);
      setSemesters(response.data);
    } catch (error) {
      console.error('Error loading semesters:', error);
    }
  }, [currentUser.userId]);

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

  useEffect(() => {
    if (currentUser?.userId) {
      loadSemesters();
    }
  }, [currentUser, loadSemesters]);

  useEffect(() => {
    if (selectedSemester) {
      loadSubjects(selectedSemester);
      setSelectedSubject('');
      setGrades([]);
    }
  }, [selectedSemester, loadSubjects]);

  useEffect(() => {
    if (selectedSubject) {
      loadGrades(selectedSubject);
      setFormData(prev => ({ ...prev, subjectId: selectedSubject }));
    }
  }, [selectedSubject, loadGrades]);

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

      setShowForm(false);
      setEditingGrade(null);
      setFormData({
        templateType: '10-10-80',
        score1: '',
        score2: '',
        score3: '',
        score4: ''
      });
      
      loadGrades(selectedSubject);
      
      // 🆕 GỌI CALLBACK KHI CÓ THAY ĐỔI ĐIỂM
      if (onGradeChange) {
        onGradeChange();
      }
      
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
        
        // 🆕 GỌI CALLBACK KHI CÓ THAY ĐỔI ĐIỂM
        if (onGradeChange) {
          onGradeChange();
        }
        
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

  const calculateGradeAverage = (grade) => {
    const template = getTemplateById(grade.templateType);
    const scores = [grade.score1, grade.score2, grade.score3, grade.score4];
    return calculateAverage(scores, template);
  };

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
      <h2>🧮 Quản Lý Điểm Số</h2>
      
      {/* Chọn học kỳ và môn học */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '20px', 
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div>
          <label style={{ fontWeight: '500', marginRight: '10px' }}>Chọn học kỳ: </label>
          <select 
            value={selectedSemester} 
            onChange={(e) => setSelectedSemester(e.target.value)}
            style={{ 
              padding: '10px', 
              borderRadius: '8px',
              border: '1px solid #ddd',
              minWidth: '200px'
            }}
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
          <label style={{ fontWeight: '500', marginRight: '10px' }}>Chọn môn học: </label>
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ 
              padding: '10px', 
              borderRadius: '8px',
              border: '1px solid #ddd',
              minWidth: '250px'
            }}
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
          backgroundColor: '#e7f3ff', 
          padding: '20px', 
          borderRadius: '10px', 
          marginBottom: '20px',
          border: '2px solid #007bff',
          textAlign: 'center'
        }}>
          {/* Lấy điểm từ grade đầu tiên trong database */}
          {grades[0].avgScore && (
            <>
              <h3 style={{ margin: 0, color: '#007bff' }}>
                Điểm TB: <span style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{grades[0].avgScore}</span> 
              </h3>
              {grades[0].letterGrade && (
                <h4 style={{ 
                  margin: '10px 0 0 0', 
                  color: getColorByGrade(grades[0].letterGrade),
                  fontSize: '1.3em',
                  fontWeight: 'bold'
                }}>
                  Dạng chữ: {grades[0].letterGrade}
                </h4>
              )}
            </>
          )}
        </div>
      )}

      {/* Form thêm/sửa điểm - Tự động hiển thị khi chọn môn học */}
      {showForm && selectedSubject && (
        <form onSubmit={handleSaveGrade} style={{ 
          backgroundColor: 'white',
          border: '2px solid #007bff',
          padding: '25px', 
          marginBottom: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>
            {editingGrade ? '✏️ Chỉnh sửa Điểm' : '➕ Thêm Bộ Điểm Mới'}
          </h3>
          
          {/* Chọn template */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: '500' }}>Chọn hệ số điểm: </label>
            <select
              value={formData.templateType}
              onChange={handleTemplateChange}
              style={{ 
                padding: '10px', 
                marginLeft: '10px', 
                width: '200px',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}
              disabled={editingGrade}
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
            <h4 style={{ marginBottom: '15px' }}>Nhập điểm (thang điểm 10):</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {currentTemplate.labels.slice(0, currentTemplate.fields).map((label, index) => (
                <div key={index}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>{label}:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="0.0 - 10.0"
                    value={formData[`score${index + 1}`]}
                    onChange={(e) => setFormData({
                      ...formData, 
                      [`score${index + 1}`]: e.target.value
                    })}
                    style={{ 
                      padding: '10px', 
                      width: '100%',
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Hiển thị điểm trung bình dự kiến */}
          <div style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <strong>Điểm trung bình dự kiến: </strong>
            <span style={{ 
              color: '#007bff', 
              fontWeight: 'bold',
              fontSize: '1.2em'
            }}>
              {calculateAverage([
                formData.score1, 
                formData.score2, 
                formData.score3, 
                formData.score4
              ], currentTemplate)}
              /10
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ 
              padding: '12px 20px', 
              backgroundColor: '#28a745', 
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              {editingGrade ? '💾 Cập nhật' : '✅ Thêm Điểm'}
            </button>
            <button type="button" onClick={handleCancelForm} style={{ 
              padding: '12px 20px', 
              backgroundColor: '#6c757d', 
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              ❌ Hủy
            </button>
          </div>
        </form>
      )}

      {/* Nút thêm điểm - ĐÃ XÓA theo yêu cầu */}

      {/* Danh sách bộ điểm */}
      <div>
        <h3 style={{ marginBottom: '20px' }}>
          📋 Danh sách bộ điểm {selectedSubject && `(${grades.length} bộ điểm)`}
        </h3>
        {!selectedSubject ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px'
          }}>
            <p>Vui lòng chọn môn học để xem điểm</p>
          </div>
        ) : grades.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px'
          }}>
            <p>Chưa có bộ điểm nào cho môn học này.</p>
            <button 
              onClick={() => setShowForm(true)}
              style={{ 
                marginTop: '15px',
                padding: '12px 20px', 
                backgroundColor: '#007bff', 
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              ➕ Thêm Điểm Đầu Tiên
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {grades.map(grade => {
              const template = getTemplateById(grade.templateType);
              const gradeAverage = calculateGradeAverage(grade);
              return (
                <div key={grade.id} style={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s ease'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '15px'
                  }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>Hệ số: {template.name}</h4>
                      <small style={{ color: '#666' }}>
                        Cập nhật: {new Date(grade.updatedAt || grade.createdAt).toLocaleDateString('vi-VN')}
                      </small>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleEditGrade(grade)}
                        style={{ 
                          padding: '8px 12px', 
                          backgroundColor: '#ffc107', 
                          color: 'black',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ✏️ Sửa
                      </button>
                      <button 
                        onClick={() => handleDeleteGrade(grade.id)}
                        style={{ 
                          padding: '8px 12px', 
                          backgroundColor: '#dc3545', 
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '15px',
                    marginBottom: '15px'
                  }}>
                    {template.labels.slice(0, template.fields).map((label, index) => (
                      <div key={index} style={{
                        padding: '10px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>{label}</div>
                        <div style={{ fontWeight: 'bold', color: '#333' }}>
                          {grade[`score${index + 1}`] ? `${grade[`score${index + 1}`]}/10` : '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                
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