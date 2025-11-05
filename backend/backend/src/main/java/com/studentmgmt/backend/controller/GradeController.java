package com.studentmgmt.backend.controller;

import com.studentmgmt.backend.model.Grade;
import com.studentmgmt.backend.repository.GradeRepository;
import com.studentmgmt.backend.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.studentmgmt.backend.service.GradeCalculationService;
import com.studentmgmt.backend.service.SemesterGpaService;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grades")
@CrossOrigin(origins = "http://localhost:3000")
public class GradeController {

    @Autowired
    private GradeCalculationService gradeCalculationService;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private SemesterGpaService semesterGpaService;

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
            // THÊM ĐOẠN NÀY: TÍNH ĐIỂM TRUNG BÌNH SAU KHI TẠO
            gradeCalculationService.calculateAndUpdateGradeAvg(saved.getId());
            
            // LẤY LẠI GRADE ĐÃ CẬP NHẬT AVG
            Grade updatedGrade = gradeRepository.findById(saved.getId()).get();

            // 🆕 TỰ ĐỘNG TÍNH LẠI GPA HỌC KỲ
            semesterGpaService.recalculateSemesterGpaOnGradeChange(subjectId);

            return ResponseEntity.ok(updatedGrade);

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

            // Grade updated = gradeRepository.save(grade);

            // THÊM ĐOẠN NÀY: TÍNH LẠI ĐIỂM TRUNG BÌNH SAU KHI UPDATE
            gradeCalculationService.calculateAndUpdateGradeAvg(id);
            
            // LẤY LẠI GRADE ĐÃ CẬP NHẬT AVG
            Grade finalGrade = gradeRepository.findById(id).get();

            // 🆕 TỰ ĐỘNG TÍNH LẠI GPA HỌC KỲ
            semesterGpaService.recalculateSemesterGpaOnGradeChange(finalGrade.getSubjectId());

            return ResponseEntity.ok(finalGrade);

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

            // 🆕 LẤY THÔNG TIN MÔN HỌC TRƯỚC KHI XÓA
            var gradeOpt = gradeRepository.findById(id);
            Long subjectId = null;
            if (gradeOpt.isPresent()) {
                subjectId = gradeOpt.get().getSubjectId();
                System.out.println("🗑️ Chuẩn bị xóa điểm ID: " + id + " của môn học ID: " + subjectId);
            }

            // XÓA ĐIỂM
            gradeRepository.deleteById(id);
            System.out.println("✅ Đã xóa điểm ID: " + id);

            // 🆕 TỰ ĐỘNG TÍNH LẠI GPA HỌC KỲ
            if (subjectId != null) {
                System.out.println("🔄 Tính lại GPA học kỳ sau khi xóa điểm của môn học: " + subjectId);
                semesterGpaService.recalculateSemesterGpaOnGradeChange(subjectId);
            }

            return ResponseEntity.ok(Map.of("message", "Đã xóa điểm thành công"));
        } catch (Exception e) {
            System.err.println("❌ Lỗi xóa điểm: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi xóa điểm: " + e.getMessage()));
        }
    }


    // THÊM ENDPOINTS MỚI (CUỐI CLASS)
    @PostMapping("/{id}/calculate-avg")
    public ResponseEntity<?> calculateGradeAvg(@PathVariable Long id) {
        try {
            gradeCalculationService.calculateAndUpdateGradeAvg(id);
            Grade grade = gradeRepository.findById(id).get();
            return ResponseEntity.ok(Map.of(
                "message", "Đã tính điểm trung bình",
                "avgScore", grade.getAvgScore(),
                "letterGrade", grade.getLetterGrade()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi tính điểm: " + e.getMessage()));
        }
    }

    // THÊM ENDPOINT MỚI: LẤY ĐIỂM CHỮ THEO ĐIỂM SỐ
    @GetMapping("/convert-to-letter")
    public ResponseEntity<?> convertScoreToLetter(@RequestParam BigDecimal score) {
        try {
            if (score == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Điểm không được để trống"));
            }
            
            Grade tempGrade = new Grade();
            tempGrade.setAvgScore(score);
            String letterGrade = tempGrade.calculateLetterGrade();
            
            return ResponseEntity.ok(Map.of(
                "score", score,
                "letterGrade", letterGrade
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi chuyển đổi điểm: " + e.getMessage()));
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


        // ==============================
    // 🔄 API CẬP NHẬT TẤT CẢ GRADES CŨ
    // ==============================
    @PostMapping("/update-all-avg")
    public ResponseEntity<?> updateAllGradesAvg() {
        try {
            // Chạy bất đồng bộ, trả về response ngay
            gradeCalculationService.updateAllExistingGradesAvg();
            
            return ResponseEntity.ok(Map.of(
                "message", "Đã bắt đầu cập nhật điểm TB cho tất cả grades cũ. Kiểm tra console log để theo dõi tiến độ."
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Lỗi khi bắt đầu cập nhật: " + e.getMessage()
            ));
        }
    }


        // ==============================
    // 🔤 API CHỈ CẬP NHẬT ĐIỂM CHỮ
    // ==============================
    @PostMapping("/update-all-letters")
    public ResponseEntity<?> updateAllLetterGrades() {
        try {
            gradeCalculationService.updateAllLetterAndGpaGrades();
            
            return ResponseEntity.ok(Map.of(
                "message", "Đã bắt đầu cập nhật điểm chữ cho tất cả grades. Kiểm tra console log để theo dõi tiến độ."
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Lỗi khi bắt đầu cập nhật điểm chữ: " + e.getMessage()
            ));
        }
    }


    // ==============================
    // 🐛 API DEBUG TÍNH ĐIỂM CHỮ - DÙNG GET (TẠM THỜI)
    // ==============================
    @GetMapping("/debug-letter")
    public ResponseEntity<?> debugLetterGradeGet() {
        try {
            // Tạo grade test để debug
            Grade testGrade = new Grade();
            testGrade.setAvgScore(new BigDecimal("8.5"));
            String letter = testGrade.calculateLetterGrade();
            
            // Test nhiều mức điểm
            Map<String, String> testCases = new HashMap<>();
            double[] testScores = {9.5, 8.5, 7.5, 6.5, 5.5, 4.5, 3.5};
            
            for (double score : testScores) {
                Grade g = new Grade();
                g.setAvgScore(BigDecimal.valueOf(score));
                testCases.put(String.valueOf(score), g.calculateLetterGrade());
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Debug tính điểm chữ",
                "testScore_8.5", letter,
                "success", "A".equals(letter),
                "allTestCases", testCases
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Lỗi khi debug: " + e.getMessage(),
                "error", e.toString()
            ));
        }
    }
}
