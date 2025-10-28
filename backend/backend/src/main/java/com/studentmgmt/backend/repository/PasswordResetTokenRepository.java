package com.studentmgmt.backend.repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List; // ✅ thêm

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.studentmgmt.backend.model.PasswordResetToken; // ✅ thêm

@Repository
public class PasswordResetTokenRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ✅ Lưu token vào DB
    public void save(Long userId, String token, LocalDateTime expiryAt) {
        String sql = "INSERT INTO password_reset_tokens (user_id, token, expiry_at) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, userId, token, Timestamp.valueOf(expiryAt));
    }

    // ✅ Tìm token trong DB
    public PasswordResetToken findByToken(String token) {
        String sql = "SELECT * FROM password_reset_tokens WHERE token = ?";
        List<PasswordResetToken> list = jdbcTemplate.query(sql, (rs, rowNum) -> {
            PasswordResetToken t = new PasswordResetToken();
            t.setId(rs.getLong("id"));
            t.setUserId(rs.getLong("user_id"));
            t.setToken(rs.getString("token"));
            t.setExpiryAt(rs.getTimestamp("expiry_at").toLocalDateTime());
            return t;
        }, token);
        return list.isEmpty() ? null : list.get(0);
    }

    // ✅ Xóa token sau khi dùng
    public void deleteByToken(String token) {
        jdbcTemplate.update("DELETE FROM password_reset_tokens WHERE token = ?", token);
    }
}
