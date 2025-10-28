package com.studentmgmt.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.mail.senderName:Student Management System}")
    private String senderName;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendResetPasswordEmail(String toEmail, String token) {
        String subject = "Yêu cầu đặt lại mật khẩu";
        String resetLink = "http://localhost:3000/reset-password?token=" + token; // đường link frontend

        String text = """
                Xin chào,

                Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.
                Hãy nhấp vào liên kết bên dưới để đặt lại mật khẩu:

                %s

                Liên kết này sẽ hết hạn sau 15 phút.

                Trân trọng,
                %s
                """.formatted(resetLink, senderName);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }
}
