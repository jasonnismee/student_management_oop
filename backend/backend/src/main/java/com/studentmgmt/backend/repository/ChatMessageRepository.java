package com.studentmgmt.backend.repository;

import com.studentmgmt.backend.model.ChatMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ChatMessageRepository {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public void save(ChatMessage chatMessage) {
        String sql = "INSERT INTO chat_messages (message, response, sender, timestamp, student_id, student_code) " +
                    "VALUES (?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, 
            chatMessage.getMessage(),
            chatMessage.getResponse(),
            chatMessage.getSender(),
            chatMessage.getTimestamp(),
            chatMessage.getStudentId(),
            chatMessage.getStudentCode()
        );
    }
    
    public List<ChatMessage> findByStudentIdOrderByTimestampDesc(Long studentId) {
        String sql = "SELECT * FROM chat_messages WHERE student_id = ? ORDER BY timestamp DESC";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(ChatMessage.class), studentId);
    }
    
    public List<ChatMessage> findByStudentCodeOrderByTimestampDesc(String studentCode) {
        String sql = "SELECT * FROM chat_messages WHERE student_code = ? ORDER BY timestamp DESC";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(ChatMessage.class), studentCode);
    }
    
    public List<ChatMessage> findByStudentIdIsNullOrderByTimestampDesc() {
        String sql = "SELECT * FROM chat_messages WHERE student_id IS NULL ORDER BY timestamp DESC";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(ChatMessage.class));
    }
}