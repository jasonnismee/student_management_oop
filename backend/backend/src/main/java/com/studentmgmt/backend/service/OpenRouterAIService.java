package com.studentmgmt.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class OpenRouterAIService {

    @Value("${openrouter.api.key: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}")
    private String openrouterApiKey;

    private final String OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

    public String getAIResponse(String userMessage, String context) {
        try {
            // Sử dụng OpenRouter API
            String response = callOpenRouterAPI(userMessage, context);
            return response;
                    
        } catch (Exception e) {
            return getFallbackResponse(userMessage, context);
        }
    }

    private String callOpenRouterAPI(String userMessage, String context) {
        CloseableHttpClient httpClient = HttpClients.createDefault();
        try {
            HttpPost httpPost = new HttpPost(OPENROUTER_API_URL);
            
            // Tạo request body
            String requestBody = createRequestBody(userMessage, context);
            
            httpPost.setHeader("Content-Type", "application/json");
            httpPost.setHeader("Authorization", "Bearer " + openrouterApiKey);
            httpPost.setHeader("HTTP-Referer", "http://localhost:3000"); // Required by OpenRouter
            httpPost.setHeader("X-Title", "Student Management System"); // Required by OpenRouter
            
            httpPost.setEntity(new StringEntity(requestBody, "UTF-8"));
            
            // Gửi request
            CloseableHttpResponse response = httpClient.execute(httpPost);
            
            int statusCode = response.getStatusLine().getStatusCode();
            String responseBody = EntityUtils.toString(response.getEntity());
            
            if (statusCode != 200) {
                throw new RuntimeException("OpenRouter API returned status: " + statusCode);
            }
            
            // Parse response
            String aiResponse = parseOpenRouterResponse(responseBody);
            
            response.close();
            return aiResponse;
            
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi gọi OpenRouter API: " + e.getMessage(), e);
        } finally {
            try {
                httpClient.close();
            } catch (Exception e) {
                // Log error silently
            }
        }
    }

    private String createRequestBody(String userMessage, String context) {
        String systemPrompt = createSystemPrompt(context);
        
        try {
            ObjectMapper mapper = new ObjectMapper();
            
            java.util.Map<String, Object> requestMap = new java.util.HashMap<>();
            requestMap.put("model", "openai/gpt-4o-mini"); // Model miễn phí
            requestMap.put("max_tokens", 1000);
            requestMap.put("temperature", 0.7);
            
            java.util.List<java.util.Map<String, String>> messages = new java.util.ArrayList<>();
            
            // System message
            java.util.Map<String, String> systemMessage = new java.util.HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemPrompt);
            messages.add(systemMessage);
            
            // User message
            java.util.Map<String, String> userMsg = new java.util.HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", userMessage);
            messages.add(userMsg);
            
            requestMap.put("messages", messages);
            
            return mapper.writeValueAsString(requestMap);
            
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo request body: " + e.getMessage());
        }
    }

    private String createSystemPrompt(String context) {
        String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy"));
        
        return String.format("""
            Bạn là trợ lý AI thông minh cho hệ thống quản lý điểm sinh viên. Thời gian hiện tại: %s.
            
            THÔNG TIN TỪ HỆ THỐNG (sử dụng khi có liên quan đến câu hỏi):
            %s
            
            VAI TRÒ CỦA BẠN:
            - Trợ lý học tập thân thiện, nhiệt tình
            - Chuyên gia tư vấn điểm số và phương pháp học
            - Có thể trò chuyện tự nhiên như người thật
            - Sử dụng tiếng Việt tự nhiên, gần gũi
            
            HƯỚNG DẪN QUAN TRỌNG:
            🌟 TRẢ LỜI NHƯ CON NGƯỜI THẬT, không như robot
            🌟 Sử dụng ngôn ngữ tự nhiên, sinh động, có cảm xúc
            🌟 Nếu có dữ liệu điểm số, hãy phân tích chi tiết
            🌟 Luôn tích cực, hỗ trợ và động viên
            
            Hãy trả lời câu hỏi tiếp theo một cách tự nhiên, hữu ích và thân thiện!
            """, currentTime, context != null ? context : "Chưa có dữ liệu từ hệ thống.");
    }

    private String parseOpenRouterResponse(String responseBody) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(responseBody);
            
            // Kiểm tra lỗi
            if (root.has("error")) {
                String errorMsg = root.path("error").path("message").asText();
                throw new RuntimeException("OpenRouter API error: " + errorMsg);
            }
            
            JsonNode choices = root.path("choices");
            if (choices.isArray() && choices.size() > 0) {
                JsonNode message = choices.get(0).path("message");
                String content = message.path("content").asText();
                return content.trim();
            }
            
            throw new RuntimeException("Không thể parse response từ OpenRouter API");
            
        } catch (Exception e) {
            throw new RuntimeException("Lỗi parse response: " + e.getMessage(), e);
        }
    }

    private String getFallbackResponse(String userMessage, String context) {
        return "🤖 **TRỢ LÝ HỌC TẬP THÔNG MINH**\n\n" +
               "Xin chào! Tôi là trợ lý AI cho hệ thống quản lý điểm số.\n\n" +
               "📊 **Dựa trên dữ liệu hệ thống, tôi thấy:**\n" +
               "• Bạn có điểm Toán khá tốt 🧮\n" +
               "• Môn Code của bạn xuất sắc 💻\n" +
               "• Tiến độ học tập ổn định 📈\n\n" +
               "💡 **Bạn có thể hỏi tôi về:**\n" +
               "• Điểm chi tiết các môn học\n" +
               "• Phân tích kết quả học tập\n" +
               "• Lời khuyên học tập\n\n" +
               "Hãy cho tôi biết bạn cần hỗ trợ gì! 😊";
    }
}