import React from 'react';
import { FaBookmark, FaRegBookmark, FaTrashAlt, FaDownload } from 'react-icons/fa';

const DocumentItem = ({ doc, onToggleBookmark, onDelete, onDownload }) => {
    
    // --- Hàm Helper ---
    
    const getFileSize = (bytes) => {
        if (bytes === 0 || bytes === null || bytes === undefined) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType) => {
        if (fileType?.includes('pdf')) return '📄 PDF';
        if (fileType?.includes('word') || fileType?.includes('officedocument')) return '✍️ Word';
        return '📁 File';
    };
    
    return (
        <div style={{
            border: '1px solid #ddd',
            padding: '15px',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'white'
        }}>
            <div style={{ flex: '1 1 70%' }}>
                <h4 style={{ margin: 0, color: '#007bff' }}>{doc.fileName}</h4>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#6c757d' }}>
                    {getFileIcon(doc.fileType)} | Kích thước: **{getFileSize(doc.fileSize)}** | Môn học: {doc.subject?.name || 'Chưa liên kết'}
                </p>
                <small>Upload: {new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}</small>
            </div>
            
            {/* Các nút thao tác */}
            <div style={{ flex: '0 0 auto', display: 'flex', gap: '10px' }}>
                <button 
                    onClick={() => onToggleBookmark(doc.id)}
                    style={{ background: 'none', border: 'none', color: doc.bookmarked ? '#ffc107' : '#6c757d', cursor: 'pointer' }}
                    title="Đánh dấu"
                >
                    {doc.bookmarked ? <FaBookmark size={20} /> : <FaRegBookmark size={20} />}
                </button>
                <button 
                    onClick={() => onDownload(doc.id, doc.fileName)}
                    style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}
                    title="Tải xuống"
                >
                    <FaDownload size={20} />
                </button>
                <button 
                    onClick={() => onDelete(doc.id)}
                    style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' }}
                    title="Xóa"
                >
                    <FaTrashAlt size={20} />
                </button>
            </div>
        </div>
    );
};

export default DocumentItem;