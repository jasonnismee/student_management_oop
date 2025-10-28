package com.studentmgmt.backend.model;

import java.time.LocalDateTime;

public class PasswordResetToken {
    private Long id;
    private Long userId;
    private String token;
    private LocalDateTime expiryAt;

    public PasswordResetToken() {}

    public PasswordResetToken(Long userId, String token, LocalDateTime expiryAt) {
        this.userId = userId;
        this.token = token;
        this.expiryAt = expiryAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public LocalDateTime getExpiryAt() { return expiryAt; }
    public void setExpiryAt(LocalDateTime expiryAt) { this.expiryAt = expiryAt; }
}
