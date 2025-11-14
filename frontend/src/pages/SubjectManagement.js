import React, { useState, useEffect, useCallback } from 'react';
// SỬA 1: Import thêm gradeAPI
import { subjectAPI, semesterAPI, gradeAPI } from '../services/api';


// Thêm component hiển thị điểm chữ
const DiemChuDisplay = ({ subjectId }) => {
  const [grade, setGrade] = useState(null);
  const [loading, setLoading] = useState(true);

  // SỬA 2: Dùng useCallback để fetchGradeBySubject
  const fetchGradeBySubject = useCallback(async () => {
    if (!subjectId) return;
    
    setLoading(true);
    try {
      // Dùng gradeAPI.getGradesBySubject thay vì fetch()
      // Nó sẽ tự động đính kèm token (từ api.js)
      const response = await gradeAPI.getGradesBySubject(subjectId);
      
      // Axios trả về dữ liệu trong response.data
      const grades = response.data; 
      
      if (grades.length > 0) {
        setGrade(grades[0]);
      } else {
        setGrade(null); // Reset nếu không có điểm
      }
    } catch (error) {
      console.error('Lỗi lấy điểm:', error);
      // Có thể lỗi 403 nếu token hết hạn thật, nhưng nó sẽ không lỗi nếu token còn hạn
      if (error.response?.status === 403) {
        console.error("Token có thể đã hết hạn. Vui lòng đăng nhập lại.");
      }
    } finally {
      setLoading(false);
    }
  }, [subjectId]); // Phụ thuộc vào subjectId

  useEffect(() => {
    fetchGradeBySubject();
  }, [fetchGradeBySubject]); // Gọi khi hàm fetch thay đổi (chỉ 1 lần khi subjectId thay đổi)


  if (loading) {
    return (
      <div style={{ 
        color: '#6c757d',
        fontSize: '12px'
      }}>
        Đang tải...
      </div>
    );
  }

  if (!grade || !grade.letterGrade) {
    return (
      <div style={{ 
        color: '#6c757d',
        fontWeight: 'bold',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>📚</span>
        <span>Chưa có điểm</span>
      </div>
    );
  }

  // Màu sắc theo điểm chữ
  const getColorByGrade = (letterGrade) => {
    switch(letterGrade) {
      case 'A+': case 'A': case 'B+': case 'B': return '#28a745';
      case 'C+': return '#ffc107';
      case 'C': case 'D+': return '#fd7e14';
      case 'D': return '#dc3545';
      case 'F': return '#6c757d';
      default: return '#28a745';
    }
  };

  return (
    <div style={{ 
      color: getColorByGrade(grade.letterGrade),
      fontWeight: 'bold',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }}>
      <span>⭐</span>
      <span>Điểm: {grade.letterGrade}</span>
    </div>
  );
};

// ===============================================
// PHẦN CÒN LẠI CỦA FILE (GIỮ NGUYÊN)
// ===============================================

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

  const loadSemesters = useCallback(async () => {
    try {
      const response = await semesterAPI.getSemesters(currentUser.userId);
      setSemesters(response.data);
    } catch (error) {
      console.error('Error loading semesters:', error);
    }
  }, [currentUser.userId]);

  useEffect(() => {
    if (currentUser?.userId) {
      loadSemesters();
    }
  }, [currentUser, loadSemesters]);

  // Sửa: Dùng useCallback cho loadSubjects
  const loadSubjects = useCallback(async (semesterId) => {
    if (!semesterId) {
      setSubjects([]); // Xóa danh sách môn học nếu không chọn học kỳ
      return;
    }
    try {
      const response = await subjectAPI.getSubjectsBySemester(semesterId);
      setSubjects(response.data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  }, []); // Không cần phụ thuộc

  useEffect(() => {
    loadSubjects(selectedSemester);
  }, [selectedSemester, loadSubjects]);

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
        semesterId: parseInt(selectedSemester)
      };

      console.log('Sending subject data:', subjectData);

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h2>📚 Quản Lý Môn Học</h2>
      
      {/* Chọn học kỳ */}
      <div style={{ marginBottom: '25px' }}>
        <label style={{ fontWeight: '500', marginRight: '10px', fontSize: '16px' }}>Chọn học kỳ: </label>
        <select 
          value={selectedSemester} 
          onChange={(e) => {
            setSelectedSemester(e.target.value);
            setFormData(prev => ({ ...prev, semesterId: e.target.value }));
          }}
          style={{ 
            padding: '12px', 
            borderRadius: '8px',
            border: '1px solid #ddd',
            minWidth: '300px',
            fontSize: '14px'
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

      {/* Button thêm môn học */}
      {selectedSemester && (
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{ 
            marginBottom: '25px', 
            padding: '12px 20px', 
            backgroundColor: '#007bff', 
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {showForm ? '❌ Hủy' : '➕ Thêm Môn Học Mới'}
        </button>
      )}

      {/* Form thêm môn học */}
      {showForm && selectedSemester && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          marginBottom: '30px'
        }}>
          <form onSubmit={handleCreateSubject} style={{ 
            backgroundColor: 'white',
            border: '2px solid #007bff',
            padding: '30px', 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '500px'
          }}>
            <h3 style={{ 
              marginBottom: '25px', 
              color: '#333',
              textAlign: 'center',
              borderBottom: '2px solid #f0f0f0',
              paddingBottom: '15px'
            }}>
              ➕ Thêm Môn Học Mới
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Tên môn học */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '14px'
                }}>
                  Tên môn học: *
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên môn học..."
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              {/* Mã môn học */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '14px'
                }}>
                  Mã môn học (tùy chọn):
                </label>
                <input
                  type="text"
                  placeholder="Nhập mã môn học..."
                  value={formData.subjectCode}
                  onChange={(e) => setFormData({...formData, subjectCode: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Số tín chỉ */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '14px'
                }}>
                  Số tín chỉ: *
                </label>
                <select
                  value={formData.credits}
                  onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
                  style={{ 
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value={1}>1 tín chỉ</option>
                  <option value={2}>2 tín chỉ</option>
                  <option value={3}>3 tín chỉ</option>
                  <option value={4}>4 tín chỉ</option>
                </select>
              </div>

              {/* Học kỳ hiện tại (readonly) */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '14px'
                }}>
                  Học kỳ:
                </label>
                <input
                  type="text"
                  value={semesters.find(s => s.id === parseInt(selectedSemester))?.name || ''}
                  readOnly
                  style={{ 
                    width: '100%', 
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: '#f8f9fa',
                    color: '#666'
                  }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              style={{ 
                marginTop: '25px',
                padding: '14px 30px', 
                backgroundColor: '#28a745', 
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              ✅ Tạo Môn Học
            </button>

            {/* Thông tin hướng dẫn */}
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#6c757d',
                lineHeight: '1.5'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '5px' }}>💡 Lưu ý:</div>
                <div>• Tên môn học và số tín chỉ là bắt buộc</div>
                <div>• Mã môn học giúp dễ dàng nhận diện và quản lý</div>
                <div>• Môn học sẽ được thêm vào học kỳ đã chọn</div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách môn học */}
      <div>
        <h3 style={{ marginBottom: '20px' }}>
          📋 Danh sách môn học {selectedSemester && subjects.length > 0 && `(${subjects.length} môn)`}
        </h3>
        {!selectedSemester ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px'
          }}>
            <p>Vui lòng chọn học kỳ để xem môn học</p>
          </div>
        ) : subjects.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px'
          }}>
            <p>Chưa có môn học nào trong học kỳ này.</p>
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
              ➕ Thêm Môn Học Đầu Tiên
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '20px' 
          }}>
            {subjects.map(subject => (
              <div key={subject.id} style={{
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s ease',
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {subject.credits} tín chỉ
                </div>
                
                <h4 style={{ 
                  margin: '0 0 10px 0', 
                  color: '#333',
                  fontSize: '1.3em',
                  paddingRight: '80px' // Đảm bảo không đè lên tag tín chỉ
                }}>
                  {subject.name}
                </h4>
                
                {subject.subjectCode && (
                  <div style={{ 
                    color: '#666',
                    marginBottom: '15px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ 
                      backgroundColor: '#6c757d',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      MÃ
                    </span>
                    {subject.subjectCode}
                  </div>
                )}
                
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '20px'
                }}>
                  {/* Component DiemChuDisplay sẽ tự động tải điểm */}
                  <DiemChuDisplay subjectId={subject.id} />
                  
                  <button 
                    onClick={() => handleDeleteSubject(subject.id)}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#dc3545', 
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectManagement;