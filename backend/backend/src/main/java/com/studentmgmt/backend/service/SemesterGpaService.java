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
            // Lấy tất cả môn học trong học kỳ
            List<Subject> subjects = subjectRepository.findBySemesterId(semesterId);
            
            if (subjects.isEmpty()) {
                return BigDecimal.ZERO;
            }

            BigDecimal totalWeightedGpa = BigDecimal.ZERO;
            BigDecimal totalCredits = BigDecimal.ZERO;
            int subjectsWithGrades = 0;

            for (Subject subject : subjects) {
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
                    }
                }
            }

            if (totalCredits.compareTo(BigDecimal.ZERO) > 0 && subjectsWithGrades > 0) {
                BigDecimal semesterGpa = totalWeightedGpa.divide(totalCredits, 2, RoundingMode.HALF_UP);
                
                // Cập nhật GPA vào database
                semesterRepository.updateSemesterGpa(semesterId, semesterGpa);
                
                return semesterGpa;
            }

            return BigDecimal.ZERO;

        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    // Tính GPA cho tất cả học kỳ
    public void calculateAllSemestersGpa(Long userId) {
        try {
            List<Semester> semesters = semesterRepository.findByUserId(userId);
            
            for (Semester semester : semesters) {
                calculateSemesterGpa(semester.getId());
            }
        } catch (Exception e) {
        }
    }

    // Phương thức tính GPA cho học kỳ khi có thay đổi điểm
    public void recalculateSemesterGpaOnGradeChange(Long subjectId) {
        try {
            Subject subject = subjectRepository.findById(subjectId);
            if (subject != null && subject.getSemester() != null && subject.getSemester().getId() != null) {
                calculateSemesterGpa(subject.getSemester().getId());
            }
        } catch (Exception e) {
        }
    }

    // 🚀 TỰ ĐỘNG CHẠY KHI STARTUP - CẬP NHẬT GPA TẤT CẢ HỌC KỲ
    // ==============================
    @EventListener(ApplicationReadyEvent.class)
    public void autoUpdateAllSemestersGpaOnStartup() {
        try {
            // Lấy tất cả học kỳ
            List<Semester> allSemesters = getAllSemesters();
            
            if (allSemesters.isEmpty()) {
                return;
            }
            
            for (Semester semester : allSemesters) {
                try {
                    // Tính toán GPA cho học kỳ
                    calculateSemesterGpa(semester.getId());
                    
                    // Nghỉ ngắn để tránh quá tải
                    Thread.sleep(50);
                    
                } catch (Exception e) {
                }
            }
            
        } catch (Exception e) {
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
            return new ArrayList<>();
        }
    }
}