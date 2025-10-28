import React, { useState, useEffect, useCallback } from 'react';
import { documentAPI, subjectAPI } from '../services/api'; 
import { FaBookmark, FaRegBookmark, FaFileUpload, FaSearch } from 'react-icons/fa';
import DocumentItem from '../components/DocumentItem';

const DocumentManagement = ({ currentUser }) => {
  const [documents, setDocuments] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]); // Lưu toàn bộ documents để filter
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [file, setFile] = useState(null);
  const [customFileName, setCustomFileName] = useState('');
  const [uploadSubject, setUploadSubject] = useState(''); // Subject cho upload form
  const [isBookmarkedFilter, setIsBookmarkedFilter] = useState(false);
  const [loading, setLoading] = useState(false);

  // Định nghĩa các định dạng file hỗ trợ
  const supportedFormats = [
    { value: '', label: 'Tất cả định dạng' },
    { value: 'pdf', label: 'PDF' },
    { value: 'doc', label: 'DOC' },
    { value: 'docx', label: 'DOCX' },
    { value: 'txt', label: 'TXT' },
    { value: 'ppt', label: 'PPT' },
    { value: 'pptx', label: 'PPTX' },
    { value: 'xls', label: 'XLS' },
    { value: 'xlsx', label: 'XLSX' },
    { value: 'jpg', label: 'JPG' },
    { value: 'png', label: 'PNG' },
    { value: 'zip', label: 'ZIP' },
    { value: 'rar', label: 'RAR' }
  ];

  const loadSubjects = useCallback(async () => {
    try {
      const response = await subjectAPI.getSubjectsByUser(currentUser.userId);
      setSubjects(response.data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  }, [currentUser.userId]);

  const loadAllDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await documentAPI.getDocumentsByUser(currentUser.userId);
      setAllDocuments(response.data);
      setDocuments(response.data); // Ban đầu hiển thị tất cả
    } catch (error) {
      console.error('Error loading documents:', error);
      setAllDocuments([]);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser.userId]);

  // Filter documents dựa trên các điều kiện
  const filterDocuments = useCallback(() => {
    let filtered = [...allDocuments];

    // Filter theo bookmark
    if (isBookmarkedFilter) {
      filtered = filtered.filter(doc => doc.isBookmarked);
    }

    // Filter theo môn học
    if (selectedSubject) {
      filtered = filtered.filter(doc => doc.subjectId === parseInt(selectedSubject));
    }

    // Filter theo định dạng
    if (selectedFormat) {
      filtered = filtered.filter(doc => {
        const fileExtension = doc.fileName?.split('.').pop()?.toLowerCase();
        return fileExtension === selectedFormat.toLowerCase();
      });
    }

    // Filter theo search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.fileName?.toLowerCase().includes(term) ||
        doc.customFileName?.toLowerCase().includes(term) ||
        doc.subjectName?.toLowerCase().includes(term)
      );
    }

    setDocuments(filtered);
  }, [allDocuments, isBookmarkedFilter, selectedSubject, selectedFormat, searchTerm]);

  useEffect(() => {
    if (currentUser?.userId) {
      loadSubjects();
      loadAllDocuments();
    }
  }, [currentUser, loadSubjects, loadAllDocuments]);

  // Áp dụng filter khi có thay đổi
  useEffect(() => {
    filterDocuments();
  }, [filterDocuments]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Vui lòng chọn file để upload.');
      return;
    }

    // Lấy định dạng file từ tên file
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isValidFormat = supportedFormats.some(format => 
      format.value && format.value.toLowerCase() === fileExtension
    );

    if (!isValidFormat) {
      alert(`Định dạng file .${fileExtension} không được hỗ trợ. Vui lòng chọn file có định dạng: ${supportedFormats.filter(f => f.value).map(f => f.value.toUpperCase()).join(', ')}`);
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', currentUser.userId);
    
    // Sử dụng uploadSubject thay vì selectedSubject
    if (uploadSubject) {
      formData.append('subjectId', uploadSubject);
    }
    
    if (customFileName) {
      formData.append('customFileName', customFileName);
    }

    try {
      await documentAPI.uploadDocument(formData);
      alert('Upload tài liệu thành công!');
      
      // Reset form
      setFile(null);
      setCustomFileName('');
      setUploadSubject('');
      setShowUploadForm(false);
      
      // Reload documents
      await loadAllDocuments();
    } catch (error) {
      console.error('Error uploading document:', error.response?.data);
      alert('Lỗi: ' + (error.response?.data?.message || 'Upload thất bại'));
    }
  };

  const handleDelete = async (documentId) => {
    if (window.confirm('Bạn có chắc muốn xóa tài liệu này? Hành động này không thể hoàn tác.')) {
      try {
        await documentAPI.deleteDocument(documentId, currentUser.userId);
        alert('Xóa tài liệu thành công!');
        await loadAllDocuments();
      } catch (error) {
        alert('Lỗi khi xóa tài liệu: ' + error.response?.data?.message);
      }
    }
  };

  const handleToggleBookmark = async (documentId) => {
    try {
      await documentAPI.toggleBookmark(documentId, currentUser.userId);
      await loadAllDocuments(); // Reload để cập nhật trạng thái bookmark
    } catch (error) {
      alert('Lỗi khi đánh dấu tài liệu: ' + error.response?.data?.message);
    }
  };
  
  const handleDownload = (documentId) => {
    window.open(`${documentAPI.baseURL}/${documentId}/download?userId=${currentUser.userId}`, '_blank');
  };

  // Reset tất cả filters
  const handleResetFilters = () => {
    setSelectedSubject('');
    setSelectedFormat('');
    setSearchTerm('');
    setIsBookmarkedFilter(false);
  };

  // Kiểm tra xem có filter đang được áp dụng không
  const hasActiveFilters = selectedSubject || selectedFormat || searchTerm || isBookmarkedFilter;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h2>📎 Quản Lý Tài Liệu</h2>

      {/* --- THANH CÔNG CỤ (TÌM KIẾM, LỌC, UPLOAD) --- */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px', 
        flexWrap: 'wrap', 
        gap: '15px' 
      }}>
        
        {/* Tìm kiếm và Lọc */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Tìm kiếm */}
          <div style={{ position: 'relative' }}>
            <FaSearch style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '12px', 
              transform: 'translateY(-50%)', 
              color: '#6c757d' 
            }} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên tài liệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                padding: '10px 10px 10px 40px', 
                borderRadius: '8px', 
                border: '1px solid #ced4da', 
                width: '280px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Lọc theo môn học */}
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ 
              padding: '10px', 
              borderRadius: '8px', 
              border: '1px solid #ced4da',
              minWidth: '180px',
              fontSize: '14px'
            }}
          >
            <option value="">📚 Tất cả môn học</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>

          {/* Lọc theo định dạng */}
          <select 
            value={selectedFormat} 
            onChange={(e) => setSelectedFormat(e.target.value)}
            style={{ 
              padding: '10px', 
              borderRadius: '8px', 
              border: '1px solid #ced4da',
              minWidth: '160px',
              fontSize: '14px'
            }}
          >
            {supportedFormats.map(format => (
              <option key={format.value} value={format.value}>
                {format.value ? `📄 ${format.label}` : format.label}
              </option>
            ))}
          </select>

          {/* Filter đánh dấu */}
          <button
            onClick={() => setIsBookmarkedFilter(!isBookmarkedFilter)}
            style={{ 
              padding: '10px 16px', 
              backgroundColor: isBookmarkedFilter ? '#ffc107' : '#f8f9fa', 
              color: isBookmarkedFilter ? 'white' : '#6c757d',
              border: `1px solid ${isBookmarkedFilter ? '#ffc107' : '#ced4da'}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {isBookmarkedFilter ? <FaBookmark /> : <FaRegBookmark />} Đã đánh dấu
          </button>

          {/* Nút reset filters */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              style={{ 
                padding: '10px 16px', 
                backgroundColor: '#6c757d', 
                color: 'white',
                border: '1px solid #6c757d',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              🔄 Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Nút Upload */}
        <button 
          onClick={() => setShowUploadForm(!showUploadForm)}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <FaFileUpload /> {showUploadForm ? 'Hủy Upload' : 'Upload Tài Liệu'}
        </button>
      </div>

      {/* Thông tin filter đang áp dụng */}
      {hasActiveFilters && (
        <div style={{ 
          backgroundColor: '#e7f3ff',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #b3d9ff'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            fontSize: '14px',
            color: '#0066cc'
          }}>
            <span>🔍</span>
            <span>
              <strong>Bộ lọc đang áp dụng:</strong>
              {selectedSubject && ` Môn: ${subjects.find(s => s.id === parseInt(selectedSubject))?.name}`}
              {selectedFormat && ` | Định dạng: ${supportedFormats.find(f => f.value === selectedFormat)?.label}`}
              {isBookmarkedFilter && ` | Đã đánh dấu`}
              {searchTerm && ` | Tìm kiếm: "${searchTerm}"`}
            </span>
          </div>
        </div>
      )}

      {/* --- FORM UPLOAD --- */}
      {showUploadForm && (
        <form onSubmit={handleUpload} style={{ 
          border: '2px dashed #28a745', 
          padding: '25px', 
          marginBottom: '25px',
          borderRadius: '12px',
          backgroundColor: '#f8fff9'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#28a745' }}>📤 Upload Tài Liệu Mới</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '500px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Chọn file: *
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ 
                  padding: '12px', 
                  border: '1px solid #ced4da', 
                  borderRadius: '8px',
                  width: '100%'
                }}
                required
              />
              {file && (
                <div style={{ 
                  marginTop: '8px', 
                  padding: '8px',
                  backgroundColor: '#e7f3ff',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#0066cc'
                }}>
                  📎 File đã chọn: {file.name} 
                  ({((file.size / 1024) / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Liên kết với Môn học (Tùy chọn):
              </label>
              <select 
                value={uploadSubject} 
                onChange={(e) => setUploadSubject(e.target.value)}
                style={{ 
                  padding: '12px', 
                  border: '1px solid #ced4da', 
                  borderRadius: '8px',
                  fontSize: '14px',
                  width: '100%'
                }}
              >
                <option value="">-- Chọn môn học --</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" style={{ 
              padding: '12px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              🚀 Bắt đầu Upload
            </button>

            <div style={{ 
              padding: '12px',
              backgroundColor: '#fff3cd',
              borderRadius: '6px',
              border: '1px solid #ffeaa7'
            }}>
              <div style={{ fontSize: '12px', color: '#856404', fontWeight: '500' }}>
                💡 Thông tin hỗ trợ:
              </div>
              <div style={{ fontSize: '11px', color: '#856404', marginTop: '4px' }}>
                • Định dạng hỗ trợ: {supportedFormats.filter(f => f.value).map(f => f.value.toUpperCase()).join(', ')}
                <br/>
                • Kích thước tối đa: 50MB
                <br/>
                • Có thể liên kết tài liệu với môn học để dễ quản lý
              </div>
            </div>
          </div>
        </form>
      )}

      {/* --- DANH SÁCH TÀI LIỆU --- */}
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ margin: 0, color: '#333' }}>
            {isBookmarkedFilter ? '📌 Tài liệu Đã đánh dấu' : 
             selectedSubject || selectedFormat || searchTerm ? '🔍 Kết quả tìm kiếm' : 
             '📚 Tất cả Tài liệu'} 
            ({documents.length})
          </h3>
          
          {loading && (
            <div style={{ 
              padding: '6px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '15px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              ⏳ Đang tải...
            </div>
          )}
        </div>

        {documents.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 40px', 
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '2px dashed #dee2e6'
          }}>
            <div style={{ fontSize: '4em', marginBottom: '20px' }}>📄</div>
            <p style={{ fontSize: '1.2em', marginBottom: '10px', fontWeight: '500' }}>
              {hasActiveFilters ? 'Không tìm thấy tài liệu phù hợp' : 'Chưa có tài liệu nào'}
            </p>
            <p style={{ color: '#999', fontSize: '0.9em', marginBottom: '20px' }}>
              {hasActiveFilters ? 'Hãy thử thay đổi bộ lọc hoặc xóa bộ lọc để xem tất cả tài liệu' : 'Hãy upload tài liệu đầu tiên của bạn!'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: '#007bff', 
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                🔄 Xem tất cả tài liệu
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {documents.map(doc => (
              <DocumentItem 
                key={doc.id} 
                doc={doc}
                onDelete={handleDelete}
                onToggleBookmark={handleToggleBookmark}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentManagement;