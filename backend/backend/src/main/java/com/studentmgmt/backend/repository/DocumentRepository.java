package com.studentmgmt.backend.repository;

import com.studentmgmt.backend.model.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class DocumentRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private RowMapper<Document> documentMapper = new RowMapper<Document>() {
        @Override
        public Document mapRow(ResultSet rs, int rowNum) throws SQLException {
            Document d = new Document();
            d.setId(rs.getLong("id"));
            d.setFileName(rs.getString("file_name"));
            d.setFilePath(rs.getString("file_path"));
            d.setFileType(rs.getString("file_type"));
            d.setFileSize(rs.getLong("file_size"));
            d.setBookmarked(rs.getBoolean("bookmarked"));
            d.setUploadedAt(rs.getTimestamp("uploaded_at") != null ?
                    rs.getTimestamp("uploaded_at").toLocalDateTime() : null);
            d.setUserId(rs.getLong("user_id"));
            d.setSubjectId(rs.getObject("subject_id") != null ? rs.getLong("subject_id") : null);
            try {
                d.setSubjectName(rs.getString("subject_name"));
            } catch (SQLException e) {
                // Bỏ qua nếu không có cột này
            }
            return d;
        }
    };

    // public List<Document> findByUserId(Long userId) {
    //     return jdbcTemplate.query("SELECT * FROM documents WHERE user_id = ?", documentMapper, userId);
    // }

    public List<Document> findByUserId(Long userId) {
        String sql = """
            SELECT d.*, s.name AS subject_name 
            FROM documents d
            LEFT JOIN subjects s ON d.subject_id = s.id
            WHERE d.user_id = ?
        """;
        return jdbcTemplate.query(sql, documentMapper, userId);
    }

    public List<Document> findBySubjectId(Long subjectId) {
        return jdbcTemplate.query("SELECT * FROM documents WHERE subject_id = ?", documentMapper, subjectId);
    }

    public List<Document> findByUserIdAndBookmarkedTrue(Long userId) {
        return jdbcTemplate.query("SELECT * FROM documents WHERE user_id = ? AND bookmarked = TRUE", documentMapper, userId);
    }

    public List<Document> findByUserIdAndFileNameContainingIgnoreCase(Long userId, String keyword) {
        String sql = "SELECT * FROM documents WHERE user_id = ? AND LOWER(file_name) LIKE LOWER(?)";
        return jdbcTemplate.query(sql, documentMapper, userId, "%" + keyword + "%");
    }

    public Optional<Document> findById(Long id) {
        List<Document> results = jdbcTemplate.query("SELECT * FROM documents WHERE id = ?", documentMapper, id);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public Document save(Document document) {
        if (document.getId() == null) {
            String sql = "INSERT INTO documents (file_name, file_path, file_type, file_size, bookmarked, uploaded_at, user_id, subject_id) " +
                    "VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)";
            jdbcTemplate.update(sql,
                    document.getFileName(),
                    document.getFilePath(),
                    document.getFileType(),
                    document.getFileSize(),
                    document.getBookmarked(),
                    document.getUserId(),
                    document.getSubjectId());
        } else {
            String sql = "UPDATE documents SET file_name=?, file_path=?, file_type=?, file_size=?, bookmarked=?, subject_id=? WHERE id=?";
            jdbcTemplate.update(sql,
                    document.getFileName(),
                    document.getFilePath(),
                    document.getFileType(),
                    document.getFileSize(),
                    document.getBookmarked(),
                    document.getSubjectId(),
                    document.getId());
        }
        return document;
    }

    public void deleteById(Long id) {
        jdbcTemplate.update("DELETE FROM documents WHERE id = ?", id);
    }
}
