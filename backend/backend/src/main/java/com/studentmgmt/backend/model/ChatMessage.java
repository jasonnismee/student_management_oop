package com.studentmgmt.backend.model;

import java.time.LocalDateTime;

public class ChatMessage {
    private Long id;
    private String message;
    private String response;
    private String sender; // "user" or "bot"
    private LocalDateTime timestamp;
    private Long studentId;
    private String studentCode;
    
    public ChatMessage() {
        this.timestamp = LocalDateTime.now();
    }
    
    public ChatMessage(String message, String response, String sender, Long studentId, String studentCode) {
        this();
        this.message = message;
        this.response = response;
        this.sender = sender;
        this.studentId = studentId;
        this.studentCode = studentCode;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
    
    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    
    public String getStudentCode() { return studentCode; }
    public void setStudentCode(String studentCode) { this.studentCode = studentCode; }
}