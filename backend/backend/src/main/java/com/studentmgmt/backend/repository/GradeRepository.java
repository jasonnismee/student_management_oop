package com.studentmgmt.backend.repository;

import com.studentmgmt.backend.model.Grade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class GradeRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Lấy tất cả điểm theo subjectId
    public List<Grade> findBySubjectId(Long subjectId) {
        String sql = "SELECT * FROM grades WHERE subject_id = ?";
        return jdbcTemplate.query(sql, new GradeRowMapper(), subjectId);
    }

    // Lấy tất cả điểm của user (thông qua subject -> semester -> user)
    public List<Grade> findByUserId(Long userId) {
        String sql = """
            SELECT g.*
            FROM grades g
            JOIN subjects subj ON g.subject_id = subj.id
            JOIN semesters s ON subj.semester_id = s.id
            WHERE s.user_id = ?
            """;
        return jdbcTemplate.query(sql, new GradeRowMapper(), userId);
    }

    // Kiểm tra điểm thuộc user
    public boolean existsByIdAndUserId(Long gradeId, Long userId) {
        String sql = """
            SELECT COUNT(*) FROM grades g
            JOIN subjects subj ON g.subject_id = subj.id
            JOIN semesters s ON subj.semester_id = s.id
            WHERE g.id = ? AND s.user_id = ?
            """;
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, gradeId, userId);
        return count != null && count > 0;
    }

    // Tìm theo id
    public Optional<Grade> findById(Long id) {
        String sql = "SELECT * FROM grades WHERE id = ?";
        List<Grade> result = jdbcTemplate.query(sql, new GradeRowMapper(), id);
        return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
    }

    // Lưu (tạo mới)
    public Grade save(Grade grade) {
        if (grade.getId() == null) {
            String sql = """
                INSERT INTO grades (template_type, score1, score2, score3, score4, created_at, subject_id)
                VALUES (?, ?, ?, ?, ?, NOW(), ?)
                """;
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
                ps.setString(1, grade.getTemplateType());
                ps.setObject(2, grade.getScore1());
                ps.setObject(3, grade.getScore2());
                ps.setObject(4, grade.getScore3());
                ps.setObject(5, grade.getScore4());
                ps.setLong(6, grade.getSubjectId());
                return ps;
            }, keyHolder);
            grade.setId(keyHolder.getKey().longValue());
        } else {
            String sql = "UPDATE grades SET score1=?, score2=?, score3=?, score4=? WHERE id=?";
            jdbcTemplate.update(sql, grade.getScore1(), grade.getScore2(), grade.getScore3(), grade.getScore4(), grade.getId());
        }
        return grade;
    }

    // Xóa theo id
    public void deleteById(Long id) {
        String sql = "DELETE FROM grades WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    // RowMapper
    private static class GradeRowMapper implements RowMapper<Grade> {
        @Override
        public Grade mapRow(ResultSet rs, int rowNum) throws SQLException {
            Grade g = new Grade();
            g.setId(rs.getLong("id"));
            g.setTemplateType(rs.getString("template_type"));
            g.setScore1(rs.getBigDecimal("score1"));
            g.setScore2(rs.getBigDecimal("score2"));
            g.setScore3(rs.getBigDecimal("score3"));
            g.setScore4(rs.getBigDecimal("score4"));
            g.setCreatedAt(rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toLocalDateTime() : null);
            g.setSubjectId(rs.getLong("subject_id"));
            return g;
        }
    }
}
