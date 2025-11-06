package com.studentmgmt.backend.service;

import com.studentmgmt.backend.dto.ChatRequest;
import com.studentmgmt.backend.dto.ChatResponse;
import com.studentmgmt.backend.model.*;
import com.studentmgmt.backend.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AdvancedAIChatService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private OpenRouterAIService openRouterAIService;
    
    public ChatResponse processAdvancedMessage(ChatRequest request) {
        try {
            System.out.println("=== BẮT ĐẦU XỬ LÝ TIN NHẮN ===");
            System.out.println("📝 Message: " + request.getMessage());
            System.out.println("👤 Student ID: " + request.getStudentId());
            System.out.println("🔢 Student Code: " + request.getStudentCode());
            
            // 1. Lấy thông tin từ database
            String databaseContext = buildSmartContext(request);
            System.out.println("📊 Database context length: " + (databaseContext != null ? databaseContext.length() : 0));
            
            // 2. Gọi OpenRouter API
            System.out.println("🔄 Đang gọi OpenRouter Service...");
            String aiResponse = openRouterAIService.getAIResponse(request.getMessage(), databaseContext);
            System.out.println("✅ OpenRouter response received");
            
            // 3. Lưu lịch sử
            saveChatHistory(request, aiResponse);
            
            // 4. Trả về response
            ChatResponse response = new ChatResponse();
            response.setResponse(aiResponse);
            response.setStudentId(request.getStudentId());
            response.setTimestamp(LocalDateTime.now().toString());
            
            System.out.println("=== KẾT THÚC XỬ LÝ THÀNH CÔNG ===");
            return response;
            
        } catch (Exception e) {
            System.err.println("❌ LỖI TRONG processAdvancedMessage: " + e.getMessage());
            e.printStackTrace();
            
            String errorResponse = "Xin lỗi, có lỗi xảy ra trong hệ thống. Chi tiết: " + e.getMessage();
            
            ChatResponse error = new ChatResponse();
            error.setResponse(errorResponse);
            error.setStudentId(request.getStudentId());
            error.setTimestamp(LocalDateTime.now().toString());
            return error;
        }
    }
    
    private String buildSmartContext(ChatRequest request) {
        StringBuilder context = new StringBuilder();
        
        try {
            // Luôn lấy thông tin user nếu có
            User user = findUser(request);
            if (user != null) {
                context.append("👤 THÔNG TIN SINH VIÊN:\n");
                context.append("• Họ tên: ").append(user.getFullName()).append("\n");
                context.append("• Mã SV: ").append(user.getStudentId()).append("\n");
                if (user.getEmail() != null) {
                    context.append("• Email: ").append(user.getEmail()).append("\n");
                }
                
                // Thêm thống kê tổng quan
                context.append("\n📊 THỐNG KÊ HỌC TẬP:\n");
                context.append(getLearningStatistics(user));
                context.append("\n");
                
                // THÊM: Thông tin học kỳ hiện tại
                context.append(getCurrentSemesterInfo(user));
                context.append("\n");
                
            } else {
                context.append("👤 THÔNG TIN SINH VIÊN: Chưa xác định\n\n");
            }
            
            // Luôn bao gồm điểm số và môn học
            context.append("🎓 DỮ LIỆU HỌC TẬP CHI TIẾT:\n");
            context.append(getAllAcademicData(user));
            
        } catch (Exception e) {
            context.append("\n⚠️ Lưu ý: Có lỗi khi truy vấn database: ").append(e.getMessage());
        }
        
        return context.toString();
    }
    
    private String getCurrentSemesterInfo(User user) {
        StringBuilder currentSemesterInfo = new StringBuilder();
        
        try {
            if (user == null) {
                currentSemesterInfo.append("🎯 HỌC KỲ HIỆN TẠI: Chưa xác định được user\n");
                return currentSemesterInfo.toString();
            }
        
            // Lấy học kỳ với thông tin đầy đủ và sắp xếp theo thời gian
            String currentSemesterSql = "SELECT id, name, start_date, end_date FROM semesters " +
                                    "WHERE user_id = ? " +
                                    "ORDER BY " +
                                    "CASE " +
                                    "  WHEN start_date <= CURDATE() AND end_date >= CURDATE() THEN 1 " +
                                    "  WHEN start_date > CURDATE() THEN 2 " +
                                    "  ELSE 3 " +
                                    "END, start_date DESC";
            
            List<Map<String, Object>> semesters = jdbcTemplate.queryForList(currentSemesterSql, user.getId());
            
            if (semesters.isEmpty()) {
                currentSemesterInfo.append("🎯 HỌC KỲ HIỆN TẠI: Chưa có học kỳ nào\n");
                return currentSemesterInfo.toString();
            }
            
            Map<String, Object> currentSemester = semesters.get(0);
            currentSemesterInfo.append("🎯 HỌC KỲ HIỆN TẠI/GẦN NHẤT:\n");
            currentSemesterInfo.append("• Tên: ").append(currentSemester.get("name")).append("\n");
            currentSemesterInfo.append("• Thời gian: ").append(currentSemester.get("start_date"))
                            .append(" → ").append(currentSemester.get("end_date")).append("\n");
            
            // Kiểm tra xem có phải học kỳ hiện tại không
            java.sql.Date startDate = (java.sql.Date) currentSemester.get("start_date");
            java.sql.Date endDate = (java.sql.Date) currentSemester.get("end_date");
            java.util.Date today = new java.util.Date();
            
            if (startDate != null && endDate != null) {
                if (today.after(startDate) && today.before(endDate)) {
                    currentSemesterInfo.append("• Trạng thái: 🟢 Đang diễn ra\n");
                } else if (today.before(startDate)) {
                    currentSemesterInfo.append("• Trạng thái: 🔵 Sắp tới\n");
                } else {
                    currentSemesterInfo.append("• Trạng thái: ⚫ Đã kết thúc\n");
                }
            }
            
            // Lấy môn học của học kỳ hiện tại - SỬA: THÊM avg_score và letter_grade
            Long semesterId = (Long) currentSemester.get("id");
            String subjectSql = "SELECT s.name, s.subject_code, s.credits, " +
                            "g.score1, g.score2, g.score3, g.score4, g.template_type, " +
                            "g.avg_score, g.letter_grade " + // ✅ THÊM 2 CỘT MỚI
                            "FROM subjects s LEFT JOIN grades g ON s.id = g.subject_id " +
                            "WHERE s.semester_id = ?";
            
            List<Map<String, Object>> subjects = jdbcTemplate.queryForList(subjectSql, semesterId);
            
            currentSemesterInfo.append("• Môn học (").append(subjects.size()).append(" môn):\n");
            if (subjects.isEmpty()) {
                currentSemesterInfo.append("  - Chưa có môn học\n");
            } else {
                for (Map<String, Object> subject : subjects) {
                    currentSemesterInfo.append("  - ").append(subject.get("name"))
                                    .append(" (").append(subject.get("credits")).append(" tín chỉ)");
                                    
                    
                    // ✅ HIỂN THỊ ĐIỂM TRUNG BÌNH VÀ ĐIỂM CHỮ NẾU CÓ
                    if (subject.get("avg_score") != null) {
                        double avgScore = ((Number) subject.get("avg_score")).doubleValue();
                        String letterGrade = (String) subject.get("letter_grade");
                        
                        currentSemesterInfo.append(" - ĐTB: ").append(String.format("%.2f", avgScore));
                        if (letterGrade != null) {
                            currentSemesterInfo.append(" (").append(letterGrade).append(")");
                        }
                        
                        // Vẫn hiển thị điểm thành phần nếu muốn
                        boolean showDetails = false; // Có thể đổi thành true nếu muốn hiển thị chi tiết
                        if (showDetails) {
                            List<String> scores = new ArrayList<>();
                            if (subject.get("score1") != null) scores.add(String.format("%.1f", ((Number) subject.get("score1")).doubleValue()));
                            if (subject.get("score2") != null) scores.add(String.format("%.1f", ((Number) subject.get("score2")).doubleValue()));
                            if (subject.get("score3") != null) scores.add(String.format("%.1f", ((Number) subject.get("score3")).doubleValue()));
                            if (subject.get("score4") != null) scores.add(String.format("%.1f", ((Number) subject.get("score4")).doubleValue()));
                            
                            if (!scores.isEmpty()) {
                                currentSemesterInfo.append(" [Chi tiết: ").append(String.join(" | ", scores)).append("]");
                            }
                        }
                        
                    } else {
                        // Nếu chưa có điểm TB, hiển thị điểm thành phần như cũ
                        boolean hasScores = subject.get("score1") != null || subject.get("score2") != null || 
                                        subject.get("score3") != null || subject.get("score4") != null;
                        
                        if (hasScores) {
                            currentSemesterInfo.append(" - Điểm: ");
                            List<String> scores = new ArrayList<>();
                            if (subject.get("score1") != null) scores.add(String.format("%.1f", ((Number) subject.get("score1")).doubleValue()));
                            if (subject.get("score2") != null) scores.add(String.format("%.1f", ((Number) subject.get("score2")).doubleValue()));
                            if (subject.get("score3") != null) scores.add(String.format("%.1f", ((Number) subject.get("score3")).doubleValue()));
                            if (subject.get("score4") != null) scores.add(String.format("%.1f", ((Number) subject.get("score4")).doubleValue()));
                            
                            currentSemesterInfo.append(String.join(" | ", scores));
                            
                            if (subject.get("template_type") != null) {
                                currentSemesterInfo.append(" (").append(subject.get("template_type")).append(")");
                            }
                        } else {
                            currentSemesterInfo.append(" - Chưa có điểm");
                        }
                    }
                    currentSemesterInfo.append("\n");
                }
            }
            
        } catch (Exception e) {
            currentSemesterInfo.append("🎯 HỌC KỲ HIỆN TẠI: Lỗi khi lấy thông tin - ").append(e.getMessage()).append("\n");
            System.err.println("Lỗi khi lấy thông tin học kỳ hiện tại: " + e.getMessage());
        }
        
        return currentSemesterInfo.toString();
    }

    private String getAllAcademicData(User user) {
        StringBuilder data = new StringBuilder();
        
        try {
            // Lấy tất cả học kỳ và môn học
            String semesterSql = "SELECT id, name, start_date, end_date FROM semesters";
            if (user != null) {
                semesterSql += " WHERE user_id = " + user.getId();
            }
            semesterSql += " ORDER BY start_date DESC, id DESC";
            
            List<Map<String, Object>> semesters = jdbcTemplate.queryForList(semesterSql);
            
            if (semesters.isEmpty()) {
                data.append("Chưa có dữ liệu học kỳ nào\n");
                return data.toString();
            }
            
            data.append("📚 TẤT CẢ HỌC KỲ (").append(semesters.size()).append(" học kỳ):\n");
            
            for (Map<String, Object> semester : semesters) {
                data.append("\n📅 HỌC KỲ: ").append(semester.get("name")).append("\n");
                data.append("   Thời gian: ").append(semester.get("start_date"))
                    .append(" → ").append(semester.get("end_date")).append("\n");
                
                // Lấy môn học trong học kỳ này - SỬA: THÊM avg_score và letter_grade
                Long semesterId = (Long) semester.get("id");
                String subjectSql = "SELECT s.id, s.name, s.subject_code, s.credits, " +
                                "g.template_type, g.score1, g.score2, g.score3, g.score4, " +
                                "g.avg_score, g.letter_grade " + // ✅ THÊM 2 CỘT MỚI
                                "FROM subjects s LEFT JOIN grades g ON s.id = g.subject_id " +
                                "WHERE s.semester_id = ?";
                
                List<Map<String, Object>> subjects = jdbcTemplate.queryForList(subjectSql, semesterId);
                
                if (subjects.isEmpty()) {
                    data.append("   Chưa có môn học trong học kỳ này\n");
                    continue;
                }
                
                for (Map<String, Object> subject : subjects) {
                    data.append("   📖 ").append(subject.get("name"))
                        .append(" (Mã: ").append(subject.get("subject_code")).append(")")
                        .append(" - ").append(subject.get("credits")).append(" tín chỉ\n");

                        // ✅ HIỂN THỊ TEMPLATE
                    String templateType = (String) subject.get("template_type");
                    if (templateType != null) {
                        data.append(" [").append(templateType).append("]");
                    }
                    data.append("\n");
                    
                    // ✅ HIỂN THỊ ĐIỂM TRUNG BÌNH VÀ ĐIỂM CHỮ NẾU CÓ
                    if (subject.get("avg_score") != null) {
                        double avgScore = ((Number) subject.get("avg_score")).doubleValue();
                        String letterGrade = (String) subject.get("letter_grade");
                        
                        data.append("      Điểm TB: ").append(String.format("%.2f", avgScore));
                        if (letterGrade != null) {
                            data.append(" (").append(letterGrade).append(")");
                        }
                        data.append("\n");
                        
                        // Hiển thị điểm thành phần nếu muốn
                        boolean showScoreDetails = true; // Có thể đổi thành false nếu chỉ muốn hiển thị điểm TB
                        if (showScoreDetails) {
                            List<String> scoreDetails = new ArrayList<>();
                            if (subject.get("score1") != null) {
                                scoreDetails.add("Điểm 1: " + String.format("%.2f", ((Number) subject.get("score1")).doubleValue()));
                            }
                            if (subject.get("score2") != null) {
                                scoreDetails.add("Điểm 2: " + String.format("%.2f", ((Number) subject.get("score2")).doubleValue()));
                            }
                            if (subject.get("score3") != null) {
                                scoreDetails.add("Điểm 3: " + String.format("%.2f", ((Number) subject.get("score3")).doubleValue()));
                            }
                            if (subject.get("score4") != null) {
                                scoreDetails.add("Điểm 4: " + String.format("%.2f", ((Number) subject.get("score4")).doubleValue()));
                            }
                            
                            if (!scoreDetails.isEmpty()) {
                                data.append("      Điểm thành phần: ").append(String.join(" | ", scoreDetails)).append("\n");
                            }
                        }
                        
                    } else {
                        // Nếu chưa có điểm TB, hiển thị điểm thành phần như cũ
                        if (subject.get("score1") != null || subject.get("score2") != null || 
                            subject.get("score3") != null || subject.get("score4") != null) {
                            
                            List<String> scoreDetails = new ArrayList<>();
                            if (subject.get("score1") != null) {
                                scoreDetails.add("Điểm 1: " + String.format("%.2f", ((Number) subject.get("score1")).doubleValue()));
                            }
                            if (subject.get("score2") != null) {
                                scoreDetails.add("Điểm 2: " + String.format("%.2f", ((Number) subject.get("score2")).doubleValue()));
                            }
                            if (subject.get("score3") != null) {
                                scoreDetails.add("Điểm 3: " + String.format("%.2f", ((Number) subject.get("score3")).doubleValue()));
                            }
                            if (subject.get("score4") != null) {
                                scoreDetails.add("Điểm 4: " + String.format("%.2f", ((Number) subject.get("score4")).doubleValue()));
                            }
                            
                            for (String scoreDetail : scoreDetails) {
                                data.append("      ").append(scoreDetail).append("\n");
                            }
                            
                            if (subject.get("template_type") != null) {
                                data.append("      Template: ").append(subject.get("template_type")).append("\n");
                            }
                        } else {
                            data.append("      Chưa có điểm\n");
                        }
                    }
                }
            }
            
        } catch (Exception e) {
            data.append("Lỗi khi lấy dữ liệu học tập: ").append(e.getMessage()).append("\n");
            System.err.println("Lỗi khi lấy dữ liệu học tập: " + e.getMessage());
        }
        
        return data.toString();
    }

    private String getLearningStatistics(User user) {
        StringBuilder stats = new StringBuilder();
        
        try {
            if (user == null) {
                stats.append("• Chưa có thông tin user để lấy thống kê\n");
                return stats.toString();
            }
            
            // Tổng số môn học
            String subjectCountSql = "SELECT COUNT(*) FROM subjects WHERE semester_id IN " +
                                "(SELECT id FROM semesters WHERE user_id = ?)";
            Integer totalSubjects = jdbcTemplate.queryForObject(subjectCountSql, Integer.class, user.getId());
            stats.append("• Tổng môn học: ").append(totalSubjects != null ? totalSubjects : 0).append("\n");
            
            // Tổng số tín chỉ
            String creditSql = "SELECT SUM(credits) FROM subjects WHERE semester_id IN " +
                            "(SELECT id FROM semesters WHERE user_id = ?)";
            Integer totalCredits = jdbcTemplate.queryForObject(creditSql, Integer.class, user.getId());
            stats.append("• Tổng tín chỉ: ").append(totalCredits != null ? totalCredits : 0).append("\n");
            
            // Số học kỳ
            String semesterSql = "SELECT COUNT(*) FROM semesters WHERE user_id = ?";
            Integer totalSemesters = jdbcTemplate.queryForObject(semesterSql, Integer.class, user.getId());
            stats.append("• Tổng học kỳ: ").append(totalSemesters != null ? totalSemesters : 0).append("\n");
            
            // ✅ SỬA: Điểm trung bình tổng từ cột avg_score (chính xác hơn)
            String avgGradeSql = "SELECT AVG(g.avg_score) FROM grades g " +
                            "WHERE g.subject_id IN (SELECT id FROM subjects WHERE semester_id IN " +
                            "(SELECT id FROM semesters WHERE user_id = ?)) AND g.avg_score IS NOT NULL";
            try {
                Double avgGrade = jdbcTemplate.queryForObject(avgGradeSql, Double.class, user.getId());
                if (avgGrade != null && avgGrade > 0) {
                    stats.append("• Điểm TB tổng: ").append(String.format("%.2f", avgGrade)).append("\n");
                    
                    // ✅ THÊM: Điểm chữ trung bình
                    String letterGradeSql = "SELECT g.letter_grade, COUNT(*) as count FROM grades g " +
                                        "WHERE g.subject_id IN (SELECT id FROM subjects WHERE semester_id IN " +
                                        "(SELECT id FROM semesters WHERE user_id = ?)) AND g.letter_grade IS NOT NULL " +
                                        "GROUP BY g.letter_grade ORDER BY count DESC LIMIT 1";
                    try {
                        Map<String, Object> mostCommonGrade = jdbcTemplate.queryForMap(letterGradeSql, user.getId());
                        if (mostCommonGrade != null && mostCommonGrade.get("letter_grade") != null) {
                            stats.append("• Điểm chữ phổ biến: ").append(mostCommonGrade.get("letter_grade")).append("\n");
                        }
                    } catch (Exception e) {
                        // Bỏ qua nếu không lấy được điểm chữ phổ biến
                    }
                }
            } catch (Exception e) {
                // Bỏ qua nếu không tính được điểm TB
            }
            
        } catch (Exception e) {
            stats.append("• Chưa có thống kê chi tiết\n");
            System.err.println("Lỗi khi lấy thống kê: " + e.getMessage());
        }
        
        return stats.toString();
    }
    
    private User findUser(ChatRequest request) {
        try {
            if (request.getStudentId() != null) {
                String sql = "SELECT * FROM users WHERE id = ?";
                List<User> users = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(User.class), request.getStudentId());
                return users.isEmpty() ? null : users.get(0);
            } else if (request.getStudentCode() != null) {
                String sql = "SELECT * FROM users WHERE student_id = ?";
                List<User> users = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(User.class), request.getStudentCode());
                return users.isEmpty() ? null : users.get(0);
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi tìm user: " + e.getMessage());
        }
        return null;
    }
    
    private void saveChatHistory(ChatRequest request, String response) {
        try {
            ChatMessage chatMessage = new ChatMessage(
                request.getMessage(), 
                response, 
                "user",
                request.getStudentId(), 
                request.getStudentCode()
            );
            
            chatMessageRepository.save(chatMessage);
            System.out.println("💾 Đã lưu lịch sử chat");
            
        } catch (Exception e) {
            System.err.println("Lỗi khi lưu lịch sử chat: " + e.getMessage());
        }
    }
}