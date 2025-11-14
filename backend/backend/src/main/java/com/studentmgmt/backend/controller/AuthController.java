package com.studentmgmt.backend.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional; // ✅ thêm để dùng Optional

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studentmgmt.backend.model.PasswordResetToken;
import com.studentmgmt.backend.model.User; // ✅ thêm model reset token
import com.studentmgmt.backend.repository.PasswordResetTokenRepository;
import com.studentmgmt.backend.repository.UserRepository; // ✅ thêm repository reset token
import com.studentmgmt.backend.security.JwtTokenUtil;
import com.studentmgmt.backend.service.PasswordResetTokenService; // ✅ thêm service gửi mail reset

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository; // ✅ thêm

    @Autowired
    private PasswordResetTokenService passwordResetTokenService; // ✅ thêm

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.existsByStudentId(user.getStudentId())) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Student ID already exists");
            return ResponseEntity.badRequest().body(response);
        }

        // Mã hóa password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        Long newUserId = userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("userId", newUserId);
        response.put("studentId", user.getStudentId());
        response.put("email", user.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByStudentId(loginRequest.getStudentId());
        
        if (user == null || !passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid student ID or password");
            return ResponseEntity.badRequest().body(response);
        }

        String token = jwtTokenUtil.generateToken(user.getStudentId());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("userId", user.getId());
        response.put("studentId", user.getStudentId());
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail()); 
        response.put("token", token);
        return ResponseEntity.ok(response);
    }

    
    // Inner class cho LoginRequest
    public static class LoginRequest {
        private String studentId;
        private String password;
        
        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    // ✅ ✅ ✅ THÊM PHẦN QUÊN MẬT KHẨU (KHÔNG SỬA CODE CŨ)
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Email không tồn tại trong hệ thống");
        }

        User user = userOpt.get();
        passwordResetTokenService.createAndSendToken(user.getId(), email);

        return ResponseEntity.ok("Đã gửi email đặt lại mật khẩu!");
    }

    // ✅ ✅ ✅ THÊM PHẦN ĐẶT LẠI MẬT KHẨU
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Thiếu token hoặc mật khẩu mới");
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(token);
        if (resetToken == null || resetToken.getExpiryAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Token không hợp lệ hoặc đã hết hạn");
        }

        userRepository.updatePasswordById(
            resetToken.getUserId(),
            passwordEncoder.encode(newPassword)
        );

        tokenRepository.deleteByToken(token);

        return ResponseEntity.ok("Đặt lại mật khẩu thành công!");
    }
}
