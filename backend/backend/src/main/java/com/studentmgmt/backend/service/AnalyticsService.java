package com.studentmgmt.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.studentmgmt.backend.model.Grade;
import com.studentmgmt.backend.model.Semester;
import com.studentmgmt.backend.model.Subject;
import com.studentmgmt.backend.repository.GradeRepository;
import com.studentmgmt.backend.repository.SemesterRepository;
import com.studentmgmt.backend.repository.SubjectRepository;

@Service
public class AnalyticsService {

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private SemesterRepository semesterRepository;

    // ==============================
    // 1️⃣ TÍNH ĐIỂM TRUNG BÌNH MÔN
    // ==============================
    public Double calculateSubjectAverage(Long subjectId) {
        List<Grade> grades = gradeRepository.findBySubjectId(subjectId);
        if (grades.isEmpty()) return 0.0;

        double totalWeightedScore = 0;
        double totalWeight = 0;

        for (Grade grade : grades) {
            Double gradeAverage = calculateGradeAverage(grade);
            if (gradeAverage > 0) {
                totalWeightedScore += gradeAverage;
                totalWeight += 1; // Mỗi bộ điểm có trọng số bằng nhau
            }
        }

        return totalWeight > 0 ? round(totalWeightedScore / totalWeight) : 0.0;
    }

    // ============================
    // 2️⃣ TÍNH GPA CỦA HỌC KỲ
    // ============================
    public Map<String, Object> calculateSemesterGPA(Long semesterId) {
        List<Subject> subjects = subjectRepository.findBySemesterId(semesterId);
        Map<String, Object> result = new HashMap<>();

        if (subjects.isEmpty()) {
            result.put("gpa", 0.0);
            result.put("totalCredits", 0);
            result.put("subjectCount", 0);
            return result;
        }

        double totalWeightedScore = 0;
        int totalCredits = 0;
        int subjectCount = 0;

        for (Subject subject : subjects) {
            Double subjectAverage = calculateSubjectAverage(subject.getId());
            if (subjectAverage > 0) {
                totalWeightedScore += subjectAverage * subject.getCredits();
                totalCredits += subject.getCredits();
                subjectCount++;
            }
        }

        double gpa = totalCredits > 0 ? round(totalWeightedScore / totalCredits) : 0.0;

        result.put("gpa", gpa);
        result.put("totalCredits", totalCredits);
        result.put("subjectCount", subjectCount);
        result.put("maxGpa", 10.0); // Thang điểm 10

        return result;
    }

    // =================================
    // 3️⃣ TÍNH GPA TÍCH LŨY TOÀN KHÓA
    // =================================
    public Map<String, Object> calculateOverallGPA(Long userId) {
        List<Semester> semesters = semesterRepository.findByUserId(userId);
        Map<String, Object> result = new HashMap<>();

        if (semesters.isEmpty()) {
            result.put("overallGpa", 0.0);
            result.put("totalCredits", 0);
            result.put("semesterCount", 0);
            return result;
        }

        double totalWeightedScore = 0;
        int totalCredits = 0;
        int semesterCount = 0;

        for (Semester semester : semesters) {
            Map<String, Object> semesterGPA = calculateSemesterGPA(semester.getId());
            double gpa = (Double) semesterGPA.get("gpa");
            int credits = (Integer) semesterGPA.get("totalCredits");

            if (gpa > 0) {
                totalWeightedScore += gpa * credits;
                totalCredits += credits;
                semesterCount++;
            }
        }

        double overallGpa = totalCredits > 0 ? round(totalWeightedScore / totalCredits) : 0.0;

        result.put("overallGpa", overallGpa);
        result.put("totalCredits", totalCredits);
        result.put("semesterCount", semesterCount);
        result.put("maxGpa", 10.0);

        return result;
    }

    // ===================================
    // 4️⃣ DỮ LIỆU CHO BIỂU ĐỒ HỌC KỲ (CHART)
    // ===================================
    public Map<String, Object> getSemesterChartData(Long userId) {
        List<Semester> semesters = semesterRepository.findByUserId(userId);
        Map<String, Object> chartData = new HashMap<>();

        List<String> labels = new ArrayList<>();
        List<Double> gpaData = new ArrayList<>();
        List<Integer> subjectCounts = new ArrayList<>();

        for (Semester semester : semesters) {
            Map<String, Object> semesterGPA = calculateSemesterGPA(semester.getId());
            double gpa = (Double) semesterGPA.get("gpa");
            int subjectCount = (Integer) semesterGPA.get("subjectCount");

            if (gpa > 0) {
                labels.add(semester.getName());
                gpaData.add(gpa);
                subjectCounts.add(subjectCount);
            }
        }

        chartData.put("labels", labels);
        chartData.put("gpaData", gpaData);
        chartData.put("subjectCounts", subjectCounts);

        return chartData;
    }

    // ========================================
    // 5️⃣ HÀM MỚI: TÍNH TRUNG BÌNH THEO TRỌNG SỐ
    // ========================================
    private Double calculateGradeAverage(Grade grade) {
        if (grade.getTemplateType() == null || grade.getTemplateType().isEmpty()) {
            return 0.0;
        }

        // Parse trọng số từ templateType (VD: "10-20-70" -> [10,20,70])
        String[] parts = grade.getTemplateType().split("-");
        double[] weights = new double[parts.length];
        double totalWeight = 0;

        for (int i = 0; i < parts.length; i++) {
            try {
                weights[i] = Double.parseDouble(parts[i]);
                totalWeight += weights[i];
            } catch (NumberFormatException e) {
                weights[i] = 0;
            }
        }

        // Lấy các điểm (score1 -> score4)
        Double[] scores = {
            grade.getScore1() != null ? grade.getScore1().doubleValue() : null,
            grade.getScore2() != null ? grade.getScore2().doubleValue() : null,
            grade.getScore3() != null ? grade.getScore3().doubleValue() : null,
            grade.getScore4() != null ? grade.getScore4().doubleValue() : null
        };

        double total = 0;
        double usedWeight = 0;

        for (int i = 0; i < weights.length && i < scores.length; i++) {
            if (scores[i] != null) {
                total += scores[i] * weights[i];
                usedWeight += weights[i];
            }
        }

        return usedWeight > 0 ? round(total / usedWeight) : 0.0;
    }

    // ========================
    // 6️⃣ HÀM LÀM TRÒN CHUẨN
    // ========================
    private double round(double value) {
        return BigDecimal.valueOf(value)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
