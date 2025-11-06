package com.studentmgmt.backend.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import lombok.Data;

@Data
public class Grade {
    private Long id;
    private String templateType;
    private BigDecimal score1;
    private BigDecimal score2;
    private BigDecimal score3;
    private BigDecimal score4;
    private LocalDateTime createdAt;
    private Long subjectId;

    @Column(name = "avg_score", precision = 4, scale = 2)
    private BigDecimal avgScore;
    
    // GETTERS & SETTERS
    public BigDecimal getAvgScore() {
        return avgScore;
    }
    
    public void setAvgScore(BigDecimal avgScore) {
        this.avgScore = avgScore;
    }


    // THÊM TRƯỜNG MỚI CHO ĐIỂM CHỮ
    @Column(name = "letter_grade")
    private String letterGrade;

    public String getLetterGrade() {
        return letterGrade;
    }
    
    public void setLetterGrade(String letterGrade) {
        this.letterGrade = letterGrade;
    }

    // THÊM PHƯƠNG THỨC QUY ĐỔI ĐIỂM SANG CHỮ
    public String calculateLetterGrade() {
        if (this.avgScore == null) {
            return null;
        }
        
        double score = this.avgScore.doubleValue();
        
        if (score >= 8.95) return "A+";
        if (score >= 8.45) return "A";
        if (score >= 7.95) return "B+";
        if (score >= 6.95) return "B";
        if (score >= 6.45) return "C+";
        if (score >= 5.45) return "C";
        if (score >= 4.95) return "D+";
        if (score >= 3.95) return "D";
        return "F";
    }


    // THÊM TRƯỜNG MỚI CHO ĐIỂM HỆ 4 (GPA)
    @Column(name = "gpa_score", precision = 3, scale = 2)
    private BigDecimal gpaScore;

    public BigDecimal getGpaScore() {
        return gpaScore;
    }
    
    public void setGpaScore(BigDecimal gpaScore) {
        this.gpaScore = gpaScore;
    }

    // THÊM PHƯƠNG THỨC QUY ĐỔI ĐIỂM SANG HỆ 4 (GPA)
    public BigDecimal calculateGpaScore() {
        if (this.avgScore == null) {
            return null;
        }
        
        double score = this.avgScore.doubleValue();
        
        if (score >= 8.95) return new BigDecimal("4.0");  // A+
        if (score >= 8.45) return new BigDecimal("3.7");  // A
        if (score >= 7.95) return new BigDecimal("3.5");  // B+
        if (score >= 6.95) return new BigDecimal("3.0");  // B
        if (score >= 6.45) return new BigDecimal("2.5");  // C+
        if (score >= 5.45) return new BigDecimal("2.0");  // C
        if (score >= 4.95) return new BigDecimal("1.5");  // D+
        if (score >= 3.95) return new BigDecimal("1.0");  // D
        return new BigDecimal("0.0");  // F
    }

}
