package com.studentmgmt.backend.dto; // ĐẢM BẢO package ĐÚNG

public class ChatRequest {
    private String message;
    private Long studentId;
    private String studentCode;
    
    public ChatRequest() {}
    
    public ChatRequest(String message, Long studentId, String studentCode) {
        this.message = message;
        this.studentId = studentId;
        this.studentCode = studentCode;
    }
    
    // Getters and Setters
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    
    public String getStudentCode() { return studentCode; }
    public void setStudentCode(String studentCode) { this.studentCode = studentCode; }
}