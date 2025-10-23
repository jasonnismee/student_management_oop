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

    // Tính điểm trung bình môn học
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

    // Tính điểm trung bình học kỳ (GPA)
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

    // Tính điểm trung bình tích lũy (Overall GPA)
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

    // Lấy dữ liệu cho biểu đồ học kỳ
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

    // Helper method: Tính điểm trung bình của một bộ điểm
    private Double calculateGradeAverage(Grade grade) {
        // Template weights được định nghĩa ở frontend, tạm thời dùng logic đơn giản
        double total = 0;
        int count = 0;

        if (grade.getScore1() != null) {
            total += grade.getScore1().doubleValue();
            count++;
        }
        if (grade.getScore2() != null) {
            total += grade.getScore2().doubleValue();
            count++;
        }
        if (grade.getScore3() != null) {
            total += grade.getScore3().doubleValue();
            count++;
        }
        if (grade.getScore4() != null) {
            total += grade.getScore4().doubleValue();
            count++;
        }

        return count > 0 ? round(total / count) : 0.0;
    }

    // Helper method: Làm tròn số
    private Double round(double value) {
        return BigDecimal.valueOf(value)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}