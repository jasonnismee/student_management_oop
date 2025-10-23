package com.studentmgmt.backend.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.studentmgmt.backend.model.Semester;
import com.studentmgmt.backend.model.Subject;

@Repository
public class SubjectRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ✅ Lấy môn học theo học kỳ
    public List<Subject> findBySemesterId(Long semesterId) {
        String sql = "SELECT * FROM subjects WHERE semester_id = ?";
        return jdbcTemplate.query(sql, new Object[]{semesterId}, new SubjectRowMapper());
    }

    // ✅ Lấy tất cả môn học của user
    public List<Subject> findByUserId(Long userId) {
        String sql = """
            SELECT s.* FROM subjects s
            JOIN semesters se ON s.semester_id = se.id
            WHERE se.user_id = ?
        """;
        return jdbcTemplate.query(sql, new Object[]{userId}, new SubjectRowMapper());
    }

    // ✅ Kiểm tra môn học có tồn tại không (dùng trong GradeController)
    public boolean existsById(Long subjectId) {
        String sql = "SELECT COUNT(*) FROM subjects WHERE id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, subjectId);
        return count != null && count > 0;
    }

    // ✅ Kiểm tra môn học có thuộc user không
    public boolean existsByIdAndUserId(Long subjectId, Long userId) {
        String sql = """
            SELECT COUNT(*) FROM subjects s
            JOIN semesters se ON s.semester_id = se.id
            WHERE s.id = ? AND se.user_id = ?
        """;
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, subjectId, userId);
        return count != null && count > 0;
    }

    // ✅ Lưu môn học mới
    public Subject save(Subject subject) {
        String sql = "INSERT INTO subjects (name, credits, subject_code, semester_id, created_at) VALUES (?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            var ps = connection.prepareStatement(sql, new String[]{"id"});
            ps.setString(1, subject.getName());
            ps.setObject(2, subject.getCredits());
            ps.setString(3, subject.getSubjectCode());
            ps.setLong(4, subject.getSemester().getId());
            ps.setTimestamp(5, Timestamp.valueOf(subject.getCreatedAt()));
            return ps;
        }, keyHolder);

        subject.setId(keyHolder.getKey().longValue());
        return subject;
    }

    // ✅ Xóa môn học
    public void deleteById(Long id) {
        String sql = "DELETE FROM subjects WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    // ✅ RowMapper
    private static class SubjectRowMapper implements RowMapper<Subject> {
        @Override
        public Subject mapRow(ResultSet rs, int rowNum) throws SQLException {
            Subject subject = new Subject();
            subject.setId(rs.getLong("id"));
            subject.setName(rs.getString("name"));
            subject.setCredits(rs.getInt("credits"));
            subject.setSubjectCode(rs.getString("subject_code"));
            var createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                subject.setCreatedAt(createdAt.toLocalDateTime());
            }

            Semester semester = new Semester();
            semester.setId(rs.getLong("semester_id"));
            subject.setSemester(semester);

            return subject;
        }
    }
}
