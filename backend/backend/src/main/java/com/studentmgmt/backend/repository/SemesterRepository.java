package com.studentmgmt.backend.repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.studentmgmt.backend.model.Semester;

@Repository
public class SemesterRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ✅ Lấy tất cả học kỳ theo userId
    public List<Semester> findByUserId(Long userId) {
    String sql = "SELECT * FROM semesters WHERE user_id = ? ORDER BY id DESC";
    return jdbcTemplate.query(sql, new SemesterRowMapper(), userId);
    }


    // ✅ Tìm học kỳ theo id (bổ sung để fix lỗi SubjectController)
    public Semester findById(Long id) {
        String sql = "SELECT * FROM semesters WHERE id = ?";
        List<Semester> semesters = jdbcTemplate.query(sql, new SemesterRowMapper(), id);
        return semesters.isEmpty() ? null : semesters.get(0);
    }

    // ✅ Lưu học kỳ mới
    public Long save(Semester semester) {
        String sql = "INSERT INTO semesters (user_id, name, start_date, end_date) VALUES (?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
            ps.setLong(1, semester.getUserId());
            ps.setString(2, semester.getName());
            ps.setObject(3, semester.getStartDate());
            ps.setObject(4, semester.getEndDate());
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("Failed to retrieve generated key for semester insert");
        }
        return key.longValue();
    }

    // ✅ Kiểm tra học kỳ thuộc user không
    public boolean existsByIdAndUserId(Long id, Long userId) {
        String sql = "SELECT COUNT(*) FROM semesters WHERE id = ? AND user_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, id, userId);
        return count != null && count > 0;
    }

    // ✅ Xóa học kỳ theo id
    public void deleteById(Long id) {
        String sql = "DELETE FROM semesters WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    // ✅ RowMapper
    private static class SemesterRowMapper implements RowMapper<Semester> {
        @Override
        public Semester mapRow(ResultSet rs, int rowNum) throws SQLException {
            Semester semester = new Semester();
            semester.setId(rs.getLong("id"));
            semester.setUserId(rs.getLong("user_id"));
            semester.setName(rs.getString("name"));
            semester.setStartDate(rs.getDate("start_date") != null ? rs.getDate("start_date").toLocalDate() : null);
            semester.setEndDate(rs.getDate("end_date") != null ? rs.getDate("end_date").toLocalDate() : null);
            return semester;
        }
    }
}
