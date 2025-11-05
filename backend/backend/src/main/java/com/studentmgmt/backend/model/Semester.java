package com.studentmgmt.backend.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Semester {
    private Long id;
    private Long userId;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    // THÊM TRƯỜNG GPA HỌC KỲ
    private BigDecimal semesterGpa;
    
    // GETTERS & SETTERS
    public BigDecimal getSemesterGpa() {
        return semesterGpa;
    }
    
    public void setSemesterGpa(BigDecimal semesterGpa) {
        this.semesterGpa = semesterGpa;
    }
}
