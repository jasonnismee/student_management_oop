package com.studentmgmt.backend.repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

    // ✅ SỬA: THÊM HÀM KIỂM TRA EMAIL TỒN TẠI
    public boolean existsByEmail(String email) {
        // Bỏ qua email rỗng hoặc null (nếu bạn cho phép)
        if (email == null || email.isBlank()) {
            return false;
        }
        String sql = "SELECT COUNT(*) FROM users WHERE email = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email);
        return count != null && count > 0;
    }

    // ✅ Kiểm tra user có tồn tại bằng id không (tùy chọn)
    public boolean existsById(Long id) {
        String sql = "SELECT COUNT(*) FROM users WHERE id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, id);
        return count != null && count > 0;
    }

    // ✅ Lưu user mới và trả về ID được tạo
    public Long save(User user) {
        String sql = "INSERT INTO users (student_id, email, password, full_name, created_at) VALUES (?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
            ps.setString(1, user.getStudentId());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getPassword());
            ps.setString(4, user.getFullName());
            ps.setObject(5, LocalDateTime.now());
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

    // ✅ Tìm user theo email (dùng cho quên mật khẩu)
    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        List<User> list = jdbcTemplate.query(sql, new UserRowMapper(), email);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    // ✅ Cập nhật mật khẩu theo ID user
    public void updatePasswordById(Long userId, String encodedPassword) {
        String sql = "UPDATE users SET password = ? WHERE id = ?";
        jdbcTemplate.update(sql, encodedPassword, userId);
    }

    // ✅ RowMapper để ánh xạ dữ liệu từ ResultSet sang đối tượng User
    private static class UserRowMapper implements RowMapper<User> {
        @Override
        public User mapRow(ResultSet rs, int rowNum) throws SQLException {
            User user = new User();
            user.setId(rs.getLong("id"));
            user.setStudentId(rs.getString("student_id"));
            user.setEmail(rs.getString("email"));
            user.setPassword(rs.getString("password"));
            user.setFullName(rs.getString("full_name"));
            var ts = rs.getTimestamp("created_at");
            user.setCreatedAt(ts != null ? ts.toLocalDateTime() : null);
            return user;
        }
    }
}