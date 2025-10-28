package com.studentmgmt.backend.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.studentmgmt.backend.repository.PasswordResetTokenRepository;

@Service
public class PasswordResetTokenService {

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    public void createAndSendToken(Long userId, String userEmail) {
        String token = UUID.randomUUID().toString();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(15);

        // Lưu vào DB bằng JDBC (đúng ý bạn)
        tokenRepository.save(userId, token, expiry);

        // Gửi email kèm token
        emailService.sendResetPasswordEmail(userEmail, token);
    }
}
