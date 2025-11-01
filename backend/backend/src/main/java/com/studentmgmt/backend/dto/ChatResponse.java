package com.studentmgmt.backend.dto; // ĐẢM BẢO package ĐÚNG

public class ChatResponse {
    private String response;
    private Long studentId;
    private String timestamp;
    
    public ChatResponse() {}
    
    public ChatResponse(String response, Long studentId, String timestamp) {
        this.response = response;
        this.studentId = studentId;
        this.timestamp = timestamp;
    }
    
    // Getters and Setters
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
    
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}