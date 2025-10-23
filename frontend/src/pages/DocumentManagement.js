import React, { useState, useEffect, useCallback } from 'react';
import { documentAPI, subjectAPI } from '../services/api'; 
import { FaBookmark, FaRegBookmark, FaTrashAlt, FaDownload, FaFileUpload, FaSearch } from 'react-icons/fa';
import DocumentItem from '../components/DocumentItem'; // Import Component con

const DocumentManagement = ({ currentUser }) => {
  const [documents, setDocuments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [file, setFile] = useState(null);
  const [customFileName, setCustomFileName] = useState('');
  const [isBookmarkedFilter, setIsBookmarkedFilter] = useState(false); 

  // --- HÀM TẢI DỮ LIỆU ---

  const loadSubjects = useCallback(async () => {
    try {
      const response = await subjectAPI.getSubjectsByUser(currentUser.userId);
      setSubjects(response.data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  }, [currentUser.userId]);

  const loadDocuments = useCallback(async () => {
    try {
      let response;
      const userId = currentUser.userId;

      if (isBookmarkedFilter) {
        response = await documentAPI.getBookmarkedDocuments(userId); 
      } else if (selectedSubject) {
        response = await documentAPI.getDocumentsBySubject(selectedSubject);
      } else if (searchTerm) {
        response = await documentAPI.searchDocuments(userId, searchTerm);
      } else {
        response = await documentAPI.getDocumentsByUser(userId);
      }

      setDocuments(response.data);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    }
  }, [currentUser.userId, selectedSubject, searchTerm, isBookmarkedFilter]);

  // LOAD DỮ LIỆU KHI COMPONENT MOUNT HOẶC THAY ĐỔI LỌC
  useEffect(() => {
    if (currentUser?.userId) {
      loadSubjects();
    }
  }, [currentUser, loadSubjects]);
  
  useEffect(() => {
     if (currentUser?.userId) {
        loadDocuments();
     }
  }, [currentUser, loadDocuments, selectedSubject, searchTerm, isBookmarkedFilter]);


  // --- XỬ LÝ UPLOAD ---
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Vui lòng chọn file để upload.');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', currentUser.userId);
    if (selectedSubject) {
      formData.append('subjectId', selectedSubject);
    }
    if (customFileName) {
      formData.append('customFileName', customFileName);
    }

    try {
      await documentAPI.uploadDocument(formData);
      alert('Upload tài liệu thành công!');
      
      setFile(null);
      setCustomFileName('');
      setShowUploadForm(false);
      loadDocuments();
    } catch (error) {
      console.error('Error uploading document:', error.response?.data);
      alert('Lỗi: ' + (error.response?.data?.message || 'Upload thất bại'));
    }
  };

  // --- XỬ LÝ THAO TÁC (Được truyền xuống DocumentItem) ---
  const handleDelete = async (documentId) => {
    if (window.confirm('Bạn có chắc muốn xóa tài liệu này? Hành động này không thể hoàn tác.')) {
      try {
        await documentAPI.deleteDocument(documentId, currentUser.userId);
        alert('Xóa tài liệu thành công!');
        loadDocuments();
      } catch (error) {
        alert('Lỗi khi xóa tài liệu: ' + error.response?.data?.message);
      }
    }
  };

  const handleToggleBookmark = async (documentId) => {
    try {
      await documentAPI.toggleBookmark(documentId, currentUser.userId);
      loadDocuments();
    } catch (error) {
      alert('Lỗi khi đánh dấu tài liệu: ' + error.response?.data?.message);
    }
  };
  
  const handleDownload = (documentId) => {
    window.open(`${documentAPI.baseURL}/${documentId}/download?userId=${currentUser.userId}`, '_blank');
  };
  
  // --- XỬ LÝ LỌC ---
  const handleToggleBookmarkFilter = () => {
      setSearchTerm('');
      setSelectedSubject('');
      setIsBookmarkedFilter(prev => !prev);
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h2>📎 Quản Lý Tài Liệu & Ghi Chú</h2>

      {/* --- THANH CÔNG CỤ (TÌM KIẾM, LỌC, UPLOAD) --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Tìm kiếm và Lọc */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', color: '#6c757d' }} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên tài liệu..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsBookmarkedFilter(false);
                setSelectedSubject('');
              }}
              style={{ padding: '8px 8px 8px 35px', borderRadius: '5px', border: '1px solid #ced4da', width: '300px' }}
            />
          </div>

          <select 
            value={selectedSubject} 
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setIsBookmarkedFilter(false); 
              setSearchTerm('');
            }}
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ced4da' }}
          >
            <option value="">-- Lọc theo Môn học --</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleToggleBookmarkFilter}
            style={{ 
              padding: '8px 15px', 
              backgroundColor: isBookmarkedFilter ? '#ffc107' : '#f8f9fa', 
              color: isBookmarkedFilter ? 'white' : '#6c757d',
              border: `1px solid ${isBookmarkedFilter ? '#ffc107' : '#ced4da'}`,
              borderRadius: '5px'
            }}
          >
            {isBookmarkedFilter ? <FaBookmark /> : <FaRegBookmark />} Đã đánh dấu
          </button>
        </div>

        {/* Nút Upload */}
        <button 
          onClick={() => setShowUploadForm(!showUploadForm)}
          style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <FaFileUpload /> {showUploadForm ? 'Hủy Upload' : 'Upload Tài Liệu'}
        </button>
      </div>

      {/* --- FORM UPLOAD --- */}
      {showUploadForm && (
        <form onSubmit={handleUpload} style={{ 
          border: '1px dashed #ced4da', 
          padding: '20px', 
          marginBottom: '20px',
          borderRadius: '5px',
          backgroundColor: '#f8f9fa' 
        }}>
          <h3>Upload Tài Liệu Mới</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ padding: '10px' }}
              required
            />
            <input
              type="text"
              placeholder="Tên hiển thị (Tùy chọn)"
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
              style={{ padding: '10px', border: '1px solid #ced4da', borderRadius: '5px' }}
            />
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{ padding: '10px', border: '1px solid #ced4da', borderRadius: '5px' }}
            >
              <option value="">-- Liên kết với Môn học (Tùy chọn) --</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', borderRadius: '5px' }}>
              Bắt đầu Upload
            </button>
            <small style={{ color: '#dc3545' }}>Chỉ hỗ trợ: PDF, DOC, DOCX.</small>
          </div>
        </form>
      )}

      {/* --- DANH SÁCH TÀI LIỆU --- */}
      <div>
        <h3>{isBookmarkedFilter ? 'Tài liệu Đã đánh dấu' : 'Tất cả Tài liệu'} ({documents.length})</h3>
        {documents.length === 0 ? (
          <p>Chưa có tài liệu nào hoặc không tìm thấy kết quả.</p>
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