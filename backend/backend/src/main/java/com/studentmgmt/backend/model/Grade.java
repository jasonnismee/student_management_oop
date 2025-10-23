package com.studentmgmt.backend.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
}
