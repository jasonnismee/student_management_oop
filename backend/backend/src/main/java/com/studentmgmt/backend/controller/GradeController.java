package com.studentmgmt.backend.controller;

import com.studentmgmt.backend.model.Grade;
import com.studentmgmt.backend.repository.GradeRepository;
import com.studentmgmt.backend.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grades")
@CrossOrigin(origins = "http://localhost:3000")
public class GradeController {

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @GetMapping("/subject/{subjectId}")
    public List<Grade> getGradesBySubject(@PathVariable Long subjectId) {
        return gradeRepository.findBySubjectId(subjectId);
    }

    @GetMapping("/user/{userId}")
    public List<Grade> getGradesByUser(@PathVariable Long userId) {
        return gradeRepository.findByUserId(userId);
    }

    @PostMapping
    public ResponseEntity<?> createGrade(@RequestBody Map<String, Object> request) {
        try {
            Long subjectId = getLongFromRequest(request, "subjectId");
            if (subjectId == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Thiếu hoặc sai subjectId"));
            }

            if (!subjectRepository.existsById(subjectId)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Môn học không tồn tại"));
            }

            Grade grade = new Grade();
            grade.setTemplateType((String) request.get("templateType"));
            grade.setSubjectId(subjectId);
            grade.setScore1(getBigDecimalFromRequest(request, "score1"));
            grade.setScore2(getBigDecimalFromRequest(request, "score2"));
            grade.setScore3(getBigDecimalFromRequest(request, "score3"));
            grade.setScore4(getBigDecimalFromRequest(request, "score4"));

            Grade saved = gradeRepository.save(grade);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi tạo điểm: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGrade(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            var gradeOpt = gradeRepository.findById(id);
            if (gradeOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy điểm"));
            }

            Grade grade = gradeOpt.get();
            if (request.containsKey("score1")) grade.setScore1(getBigDecimalFromRequest(request, "score1"));
            if (request.containsKey("score2")) grade.setScore2(getBigDecimalFromRequest(request, "score2"));
            if (request.containsKey("score3")) grade.setScore3(getBigDecimalFromRequest(request, "score3"));
            if (request.containsKey("score4")) grade.setScore4(getBigDecimalFromRequest(request, "score4"));

            Grade updated = gradeRepository.save(grade);
            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi cập nhật: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGrade(@PathVariable Long id, @RequestParam Long userId) {
        try {
            if (!gradeRepository.existsByIdAndUserId(id, userId)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Không có quyền xóa điểm này"));
            }
            gradeRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa điểm thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi xóa điểm: " + e.getMessage()));
        }
    }

    private Long getLongFromRequest(Map<String, Object> request, String key) {
        try {
            Object value = request.get(key);
            if (value instanceof Integer) return ((Integer) value).longValue();
            if (value instanceof Long) return (Long) value;
            if (value instanceof String) return Long.parseLong((String) value);
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    private BigDecimal getBigDecimalFromRequest(Map<String, Object> request, String key) {
        try {
            Object value = request.get(key);
            if (value == null) return null;
            if (value instanceof Number) return BigDecimal.valueOf(((Number) value).doubleValue());
            if (value instanceof String) return new BigDecimal(((String) value).trim());
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}
