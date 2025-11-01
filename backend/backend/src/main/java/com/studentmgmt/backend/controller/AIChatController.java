package com.studentmgmt.backend.controller;

import com.studentmgmt.backend.dto.ChatRequest;
import com.studentmgmt.backend.dto.ChatResponse;
import com.studentmgmt.backend.model.ChatMessage; // ĐỔI: entity -> model
import com.studentmgmt.backend.repository.ChatMessageRepository;
import com.studentmgmt.backend.service.AdvancedAIChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai-chat")
@CrossOrigin(origins = "http://localhost:3000")
public class AIChatController {
    
    @Autowired
    private AdvancedAIChatService aiChatService;
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @PostMapping("/send")
    public ResponseEntity<ChatResponse> sendMessage(@RequestBody ChatRequest request) {
        ChatResponse response = aiChatService.processAdvancedMessage(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/history")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) String studentCode) {
        
        List<ChatMessage> history;
        if (studentId != null) {
            history = chatMessageRepository.findByStudentIdOrderByTimestampDesc(studentId);
        } else if (studentCode != null) {
            history = chatMessageRepository.findByStudentCodeOrderByTimestampDesc(studentCode);
        } else {
            history = chatMessageRepository.findByStudentIdIsNullOrderByTimestampDesc();
        }
        
        return ResponseEntity.ok(history);
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("AI Chatbot Backend is running! " + java.time.LocalDateTime.now());
    }
}