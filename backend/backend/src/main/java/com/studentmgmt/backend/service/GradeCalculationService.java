package com.studentmgmt.backend.service;

import com.studentmgmt.backend.model.Grade;
import com.studentmgmt.backend.repository.GradeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.math.BigDecimal;

@Service
@Transactional
public class GradeCalculationService {
    
    @Autowired
    private GradeRepository gradeRepository;
    
    @Autowired
    private AnalyticsService analyticsService;
    

    // ==============================
    // 🚀 TỰ ĐỘNG CHẠY KHI STARTUP - CẬP NHẬT CẢ ĐIỂM TB VÀ ĐIỂM CHỮ
    // ==============================
    @EventListener(ApplicationReadyEvent.class)
    public void autoUpdateAllGradesOnStartup() {
        try {
            System.out.println("🚀 Ứng dụng khởi động - kiểm tra và cập nhật toàn bộ grades...");
            
            List<Grade> allGrades = gradeRepository.findAll();
            
            if (allGrades.isEmpty()) {
                System.out.println("📝 Không có grades nào trong database");
                return;
            }
            
            int updatedCount = 0;
            int total = allGrades.size();
            
            System.out.println("🔄 Bắt đầu cập nhật toàn bộ " + total + " grades...");
            
            for (int i = 0; i < allGrades.size(); i++) {
                Grade grade = allGrades.get(i);
                try {
                    System.out.println("🔍 [" + (i+1) + "/" + total + "] Grade ID " + grade.getId());
                    
                    // 🔥 LUÔN TÍNH LẠI ĐIỂM TRUNG BÌNH (bỏ điều kiện null check)
                    Double avg = analyticsService.calculateGradeAverage(grade);
                    BigDecimal avgScore = avg != null ? BigDecimal.valueOf(avg) : BigDecimal.ZERO;
                    grade.setAvgScore(avgScore);
                    
                    // 🔥 TÍNH ĐIỂM CHỮ VÀ GPA
                    String letterGrade = grade.calculateLetterGrade();
                    BigDecimal gpaScore = grade.calculateGpaScore();
                    grade.setLetterGrade(letterGrade);
                    grade.setGpaScore(gpaScore);
                    
                    // 🔥 LUÔN LƯU LẠI
                    gradeRepository.save(grade);
                    updatedCount++;
                    
                    System.out.println("   ✅ Đã cập nhật: " + avgScore + " → " + letterGrade);
                    
                    if ((i + 1) % 10 == 0) {
                        System.out.println("📊 Đã xử lý: " + (i + 1) + "/" + total);
                    }
                    
                } catch (Exception e) {
                    System.err.println("❌ Lỗi khi cập nhật grade ID " + grade.getId() + ": " + e.getMessage());
                }
            }
            
            System.out.println("✅ Đã hoàn thành cập nhật " + updatedCount + "/" + total + " grades!");
            
        } catch (Exception e) {
            System.err.println("❌ Lỗi tự động cập nhật: " + e.getMessage());
            e.printStackTrace();
        }
    }


    // ==============================
    // 1️⃣ TÍNH VÀ CẬP NHẬT AVG CHO 1 GRADE
    // ==============================
    public void calculateAndUpdateGradeAvg(Long gradeId) {
        try {
            Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy grade: " + gradeId));
            
            // Tính điểm trung bình bằng hàm có sẵn trong AnalyticsService
            Double avg = analyticsService.calculateGradeAverage(grade);
            
            // Set giá trị avgScore (có thể null nếu không tính được)
            grade.setAvgScore(avg != null ? BigDecimal.valueOf(avg) : null);
            
            // TÍNH ĐIỂM CHỮ VÀ GPA TỰ ĐỘNG
            String letterGrade = grade.calculateLetterGrade();
            BigDecimal gpaScore = grade.calculateGpaScore();
            grade.setLetterGrade(letterGrade);
            grade.setGpaScore(gpaScore);

            // Lưu lại grade đã cập nhật
            gradeRepository.save(grade);
            
            System.out.println("✅ Đã tính điểm TB cho grade " + gradeId + ": " + avg);
            
        } catch (Exception e) {
            System.err.println("❌ Lỗi tính điểm TB cho grade " + gradeId + ": " + e.getMessage());
            throw new RuntimeException("Lỗi tính điểm trung bình", e);
        }
    }
    // ==============================
// 🔄 CẬP NHẬT AVG CHO TẤT CẢ GRADES CŨ
// ==============================
    @Async
    public void updateAllExistingGradesAvg() {
        try {
            List<Grade> allGrades = gradeRepository.findAll();
            
            if (allGrades.isEmpty()) {
                System.out.println("📝 Không có grades nào trong database");
                return;
            }
            
            int updatedCount = 0;
            int total = allGrades.size();
            
            System.out.println("🔄 Bắt đầu cập nhật điểm TB cho " + total + " grades cũ...");
            
            for (Grade grade : allGrades) {
                // Chỉ cập nhật nếu chưa có avg_score
                if (grade.getAvgScore() == null) {
                    Double avg = analyticsService.calculateGradeAverage(grade);
                    grade.setAvgScore(avg != null ? BigDecimal.valueOf(avg) : BigDecimal.ZERO);
                    
                    
                    // TÍNH ĐIỂM CHỮ VÀ GPA
                    String letterGrade = grade.calculateLetterGrade();
                    BigDecimal gpaScore = grade.calculateGpaScore();
                    grade.setLetterGrade(letterGrade);
                    grade.setGpaScore(gpaScore);

                    
                    gradeRepository.save(grade);
                    updatedCount++;
                    
                    if (updatedCount % 50 == 0) {
                        System.out.println("📊 Đã cập nhật: " + updatedCount + "/" + total);
                    }
                }
            }
            
            System.out.println("✅ Đã hoàn thành cập nhật điểm TB cho " + updatedCount + " grades cũ!");
            
        } catch (Exception e) {
            System.err.println("❌ Lỗi cập nhật điểm TB cho grades cũ: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // ==============================
    // 🔤 CHỈ CẬP NHẬT ĐIỂM CHỮ VÀ GPA
    // ==============================
    @Async
    public void updateAllLetterAndGpaGrades() {
        try {
            List<Grade> allGrades = gradeRepository.findAll();
            
            if (allGrades.isEmpty()) {
                System.out.println("📝 Không có grades nào trong database");
                return;
            }
            
            int updatedCount = 0;
            int total = allGrades.size();
            
            System.out.println("🔄 Bắt đầu cập nhật điểm chữ và GPA cho " + total + " grades...");
            
            for (int i = 0; i < allGrades.size(); i++) {
                Grade grade = allGrades.get(i);
                try {
                    System.out.println("🔍 [" + (i+1) + "/" + total + "] Grade ID " + grade.getId());
                    
                    // CHỈ CẬP NHẬT NẾU CÓ ĐIỂM TRUNG BÌNH
                    if (grade.getAvgScore() != null) {
                        // Tính điểm chữ và GPA
                        String oldLetter = grade.getLetterGrade();
                        BigDecimal oldGpa = grade.getGpaScore();
                        
                        String newLetter = grade.calculateLetterGrade();
                        BigDecimal newGpa = grade.calculateGpaScore();
                        
                        // Kiểm tra xem có thay đổi không
                        if (!newLetter.equals(oldLetter) || 
                            (newGpa != null && !newGpa.equals(oldGpa))) {
                            
                            grade.setLetterGrade(newLetter);
                            grade.setGpaScore(newGpa);
                            gradeRepository.save(grade);
                            updatedCount++;
                            System.out.println("   ✅ Đã cập nhật: " + grade.getAvgScore() + " → " + 
                                newLetter + " (GPA: " + newGpa + ")");
                        } else {
                            System.out.println("   ℹ️ Đã có điểm đúng: " + newLetter + " (GPA: " + newGpa + ")");
                        }
                    } else {
                        System.out.println("   ⚠️ Chưa có điểm trung bình, bỏ qua");
                    }
                    
                } catch (Exception e) {
                    System.err.println("❌ Lỗi khi cập nhật grade ID " + grade.getId() + ": " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            System.out.println("✅ Đã hoàn thành cập nhật điểm chữ và GPA!");
            System.out.println("📊 Tổng kết:");
            System.out.println("   - Tổng grades: " + total);
            System.out.println("   - Đã cập nhật: " + updatedCount);
            
        } catch (Exception e) {
            System.err.println("❌ Lỗi cập nhật điểm chữ và GPA: " + e.getMessage());
            e.printStackTrace();
        }
    }
}