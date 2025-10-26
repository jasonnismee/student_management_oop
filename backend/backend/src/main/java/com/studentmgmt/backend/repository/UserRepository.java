package com.studentmgmt.backend.repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.studentmgmt.backend.model.User;

@Repository
public class UserRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ✅ Kiểm tra student_id có tồn tại không
    public boolean existsByStudentId(String studentId) {
        String sql = "SELECT COUNT(*) FROM users WHERE student_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, studentId);
        return count != null && count > 0;
    }

    // ✅ Kiểm tra user có tồn tại bằng id không (bổ sung)
    public boolean existsById(Long id) {
        String sql = "SELECT COUNT(*) FROM users WHERE id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, id);
        return count != null && count > 0;
    }

    // ✅ Lưu user mới
    public Long save(User user) {
        String sql = "INSERT INTO users (student_id, password, full_name, created_at) VALUES (?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[] {"id"});
            ps.setString(1, user.getStudentId());
            ps.setString(2, user.getPassword());
            ps.setString(3, user.getFullName());
            ps.setObject(4, LocalDateTime.now());
            return ps;
        }, keyHolder);
    Number key = keyHolder.getKey();
    if (key == null) {
        throw new IllegalStateException("Failed to retrieve generated key for user insert");
        }
        return key.longValue();
    }

    // ✅ Tìm user theo studentId
    public User findByStudentId(String studentId) {
    String sql = "SELECT * FROM users WHERE student_id = ?";
    try {
        return jdbcTemplate.query(sql, new UserRowMapper(), studentId)
                .stream()
                .findFirst()
                .orElse(null);
    } catch (DataAccessException e) {
        return null;
    }
}

    // ✅ RowMapper
    private static class UserRowMapper implements RowMapper<User> {
        @Override
        public User mapRow(ResultSet rs, int rowNum) throws SQLException {
            User user = new User();
            user.setId(rs.getLong("id"));
            user.setStudentId(rs.getString("student_id"));
            user.setPassword(rs.getString("password"));
            user.setFullName(rs.getString("full_name"));
            user.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            return user;
        }
    }
}
