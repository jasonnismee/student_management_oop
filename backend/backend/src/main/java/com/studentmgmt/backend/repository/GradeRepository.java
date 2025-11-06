package com.studentmgmt.backend.repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.studentmgmt.backend.model.Grade;

@Repository
public class GradeRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;



    // THÊM PHƯƠNG THỨC findAll() - ĐÂY LÀ PHƯƠNG THỨC BỊ THIẾU
    public List<Grade> findAll() {
        String sql = "SELECT * FROM grades";
        return jdbcTemplate.query(sql, new GradeRowMapper());
    }


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
                INSERT INTO grades (template_type, score1, score2, score3, score4, created_at, subject_id,avg_score,letter_grade, gpa_score)
                VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)
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
                ps.setObject(7, grade.getAvgScore());
                ps.setString(8, grade.getLetterGrade());
                ps.setObject(9, grade.getGpaScore());
                return ps;
            }, keyHolder);
            Number key = keyHolder.getKey();
            if (key == null) {
                throw new IllegalStateException("Failed to retrieve generated key for grade insert");
            }
            grade.setId(key.longValue());
        } else {
            String sql = "UPDATE grades SET score1=?, score2=?, score3=?, score4=?,avg_score=?,letter_grade=?, gpa_score=? WHERE id=?";
            jdbcTemplate.update(sql, grade.getScore1(), grade.getScore2(), grade.getScore3(), grade.getScore4(), grade.getAvgScore(), grade.getLetterGrade(), grade.getGpaScore(), grade.getId());
        }
        return grade;
    }

    // Xóa theo id
    public void deleteById(Long id) {
        String sql = "DELETE FROM grades WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    // 🆕 THÊM METHOD: Xóa tất cả điểm của một môn học
    public void deleteBySubjectId(Long subjectId) {
        try {
            String sql = "DELETE FROM grades WHERE subject_id = ?";
            int deletedCount = jdbcTemplate.update(sql, subjectId);
            System.out.println("✅ Đã xóa " + deletedCount + " điểm của môn học ID: " + subjectId);
        } catch (Exception e) {
            System.err.println("❌ Lỗi khi xóa điểm của môn học " + subjectId + ": " + e.getMessage());
            throw e;
        }
    }


    // THÊM PHƯƠNG THỨC CẬP NHẬT ĐIỂM CHỮ
    public void updateLetterGrade(Long gradeId, String letterGrade) {
        String sql = "UPDATE grades SET letter_grade = ? WHERE id = ?";
        jdbcTemplate.update(sql, letterGrade, gradeId);
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
            g.setAvgScore(rs.getBigDecimal("avg_score"));
            g.setLetterGrade(rs.getString("letter_grade"));
            g.setGpaScore(rs.getBigDecimal("gpa_score"));
            return g;
        }
    }
}