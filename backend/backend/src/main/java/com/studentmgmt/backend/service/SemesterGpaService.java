package com.studentmgmt.backend.service;

import com.studentmgmt.backend.model.Semester;
import com.studentmgmt.backend.model.Subject;
import com.studentmgmt.backend.model.Grade;
import com.studentmgmt.backend.repository.SemesterRepository;
import com.studentmgmt.backend.repository.SubjectRepository;
import com.studentmgmt.backend.repository.GradeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.ArrayList;

@Service
public class SemesterGpaService {

    @Autowired
    private SemesterRepository semesterRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public BigDecimal calculateSemesterGpa(Long semesterId) {
        try {
            System.out.println("🔍 Bắt đầu tính GPA cho học kỳ: " + semesterId);
            
            // Lấy tất cả môn học trong học kỳ
            List<Subject> subjects = subjectRepository.findBySemesterId(semesterId);
            
            if (subjects.isEmpty()) {
                System.out.println("📝 Không có môn học nào trong học kỳ này");
                return BigDecimal.ZERO;
            }

            BigDecimal totalWeightedGpa = BigDecimal.ZERO;
            BigDecimal totalCredits = BigDecimal.ZERO;
            int subjectsWithGrades = 0;

            System.out.println("📚 Tìm thấy " + subjects.size() + " môn học trong học kỳ");

            for (Subject subject : subjects) {
                System.out.println("🔍 Xử lý môn: " + subject.getName() + " (" + subject.getCredits() + " tín chỉ)");
                
                // Lấy điểm của môn học
                List<Grade> grades = gradeRepository.findBySubjectId(subject.getId());
                
                if (!grades.isEmpty()) {
                    Grade grade = grades.get(0);
                    
                    if (grade.getGpaScore() != null && grade.getAvgScore() != null) {
                        BigDecimal subjectGpa = grade.getGpaScore();
                        BigDecimal subjectCredits = BigDecimal.valueOf(subject.getCredits());
                        
                        BigDecimal weightedGpa = subjectGpa.multiply(subjectCredits);
                        totalWeightedGpa = totalWeightedGpa.add(weightedGpa);
                        totalCredits = totalCredits.add(subjectCredits);
                        subjectsWithGrades++;
                        
                        System.out.println("   ✅ Môn " + subject.getName() + 
                                         ": GPA=" + subjectGpa + 
                                         ", Tín chỉ=" + subjectCredits +
                                         ", Weighted=" + weightedGpa);
                    } else {
                        System.out.println("   ⚠️ Môn " + subject.getName() + ": Chưa có điểm GPA");
                    }
                } else {
                    System.out.println("   ⚠️ Môn " + subject.getName() + ": Chưa có điểm");
                }
            }

            System.out.println("📊 Tổng kết: " + 
                             "Total Weighted GPA=" + totalWeightedGpa + 
                             ", Total Credits=" + totalCredits +
                             ", Môn có điểm=" + subjectsWithGrades);

            if (totalCredits.compareTo(BigDecimal.ZERO) > 0 && subjectsWithGrades > 0) {
                BigDecimal semesterGpa = totalWeightedGpa.divide(totalCredits, 2, RoundingMode.HALF_UP);
                
                System.out.println("🎯 GPA học kỳ: " + semesterGpa);

                // Cập nhật GPA vào database
                semesterRepository.updateSemesterGpa(semesterId, semesterGpa);
                System.out.println("💾 Đã lưu GPA học kỳ vào database: " + semesterGpa);
                
                return semesterGpa;
            } else {
                System.out.println("❌ Không thể tính GPA: Không có môn nào có điểm hoặc tổng tín chỉ = 0");
            }

            return BigDecimal.ZERO;

        } catch (Exception e) {
            System.err.println("❌ Lỗi tính GPA học kỳ " + semesterId + ": " + e.getMessage());
            e.printStackTrace();
            return BigDecimal.ZERO;
        }
    }

    // Tính GPA cho tất cả học kỳ
    public void calculateAllSemestersGpa(Long userId) {
        try {
            List<Semester> semesters = semesterRepository.findByUserId(userId);
            System.out.println("🔄 Bắt đầu tính GPA cho " + semesters.size() + " học kỳ");
            
            for (Semester semester : semesters) {
                calculateSemesterGpa(semester.getId());
            }
            
            System.out.println("✅ Đã tính GPA cho tất cả học kỳ");
        } catch (Exception e) {
            System.err.println("❌ Lỗi tính GPA tất cả học kỳ: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Phương thức tính GPA cho học kỳ khi có thay đổi điểm
    public void recalculateSemesterGpaOnGradeChange(Long subjectId) {
        try {
            Subject subject = subjectRepository.findById(subjectId);
            if (subject != null && subject.getSemester() != null && subject.getSemester().getId() != null) {
                System.out.println("🔄 Điểm thay đổi, tính lại GPA cho học kỳ: " + subject.getSemester().getId());
                calculateSemesterGpa(subject.getSemester().getId());
            } else {
                System.out.println("⚠️ Không tìm thấy môn học hoặc học kỳ với ID: " + subjectId);
            }
        } catch (Exception e) {
            System.err.println("❌ Lỗi tính lại GPA học kỳ: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // 🚀 TỰ ĐỘNG CHẠY KHI STARTUP - CẬP NHẬT GPA TẤT CẢ HỌC KỲ
    // ==============================
    @EventListener(ApplicationReadyEvent.class)
    public void autoUpdateAllSemestersGpaOnStartup() {
        try {
            System.out.println("🚀 Ứng dụng khởi động - kiểm tra và cập nhật toàn bộ GPA học kỳ...");
            
            // Lấy tất cả học kỳ
            List<Semester> allSemesters = getAllSemesters();
            
            if (allSemesters.isEmpty()) {
                System.out.println("📝 Không có học kỳ nào trong database");
                return;
            }
            
            int updatedCount = 0;
            int total = allSemesters.size();
            
            System.out.println("🔄 Bắt đầu cập nhật toàn bộ " + total + " học kỳ...");
            
            for (int i = 0; i < allSemesters.size(); i++) {
                Semester semester = allSemesters.get(i);
                try {
                    System.out.println("🔍 [" + (i+1) + "/" + total + "] Học kỳ: " + semester.getName() + 
                                     " (User: " + semester.getUserId() + ", ID: " + semester.getId() + ")");
                    
                    // Tính toán GPA cho học kỳ
                    BigDecimal semesterGpa = calculateSemesterGpa(semester.getId());
                    
                    if (semesterGpa != null && semesterGpa.compareTo(BigDecimal.ZERO) > 0) {
                        updatedCount++;
                        System.out.println("   ✅ Đã cập nhật GPA: " + semesterGpa);
                    } else {
                        System.out.println("   ⚠️ Không có điểm để tính GPA");
                    }
                    
                    if ((i + 1) % 5 == 0) {
                        System.out.println("📊 Đã xử lý: " + (i + 1) + "/" + total);
                    }
                    
                    // Nghỉ ngắn để tránh quá tải
                    Thread.sleep(50);
                    
                } catch (Exception e) {
                    System.err.println("❌ Lỗi khi cập nhật học kỳ ID " + semester.getId() + ": " + e.getMessage());
                }
            }
            
            System.out.println("🎉 Đã hoàn thành cập nhật " + updatedCount + "/" + total + " học kỳ!");
            
        } catch (Exception e) {
            System.err.println("❌ Lỗi tự động cập nhật GPA học kỳ: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // 🆕 METHOD: Lấy tất cả học kỳ
    private List<Semester> getAllSemesters() {
        try {
            // Lấy tất cả user_id có học kỳ
            String sql = "SELECT DISTINCT user_id FROM semesters";
            List<Long> userIds = jdbcTemplate.queryForList(sql, Long.class);
            
            List<Semester> allSemesters = new ArrayList<>();
            for (Long userId : userIds) {
                List<Semester> userSemesters = semesterRepository.findByUserId(userId);
                allSemesters.addAll(userSemesters);
            }
            
            return allSemesters;
            
        } catch (Exception e) {
            System.err.println("❌ Lỗi khi lấy danh sách học kỳ: " + e.getMessage());
            return new ArrayList<>();
        }
    }
}