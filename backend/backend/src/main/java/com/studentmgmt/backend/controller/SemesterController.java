package com.studentmgmt.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.studentmgmt.backend.model.Semester;
import com.studentmgmt.backend.repository.SemesterRepository;
import com.studentmgmt.backend.repository.UserRepository;
import com.studentmgmt.backend.service.SemesterGpaService;

@RestController
@RequestMapping("/api/semesters")
@CrossOrigin(origins = "http://localhost:3000")
public class SemesterController {

    @Autowired
    private SemesterRepository semesterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SemesterGpaService semesterGpaService; // THÊM Autowired service

    // 🧩 Lấy danh sách học kỳ của user
    @GetMapping
    public ResponseEntity<?> getUserSemesters(@RequestParam Long userId) {
        try {
            if (!userRepository.existsById(userId)) {
                return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
            }
            List<Semester> semesters = semesterRepository.findByUserId(userId);
            return ResponseEntity.ok(semesters);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Error retrieving semesters: " + e.getMessage()));
        }
    }

    // 🧩 Lấy thông tin chi tiết một học kỳ
    @GetMapping("/{id}")
    public ResponseEntity<?> getSemesterById(@PathVariable Long id, @RequestParam Long userId) {
        try {
            Semester semester = semesterRepository.findById(id);
            if (semester == null) {
                return ResponseEntity.notFound().build();
            }
            if (!semester.getUserId().equals(userId)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Access denied"));
            }
            return ResponseEntity.ok(semester);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Error retrieving semester: " + e.getMessage()));
        }
    }

    // 🧩 Tạo học kỳ mới
    @PostMapping
    public ResponseEntity<?> createSemester(@RequestBody Map<String, Object> request) {
        try {
            // Validation
            if (!request.containsKey("userId")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Thiếu trường userId"));
            }
            if (!request.containsKey("name") || ((String) request.get("name")).trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Thiếu tên học kỳ"));
            }

            Long userId = parseUserId(request.get("userId"));
            if (userId == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "UserId không hợp lệ"));
            }

            if (!userRepository.existsById(userId)) {
                return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
            }

            // Tạo semester object
            Semester semester = new Semester();
            semester.setUserId(userId);
            //semester.setName(((String) request.get("name")).trim());
            String semesterName = ((String) request.get("name")).trim(); // <-- Lấy tên ra biến
            semester.setName(semesterName);                             // <-- Gán tên vào object
            if (semesterRepository.existsByNameAndUserId(semesterName, userId)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Tên học kỳ này đã tồn tại. Vui lòng chọn tên khác."));
            }


            
            // Xử lý ngày bắt đầu và kết thúc
            if (request.get("startDate") != null) {
                semester.setStartDate(LocalDate.parse(request.get("startDate").toString()));
            }
            if (request.get("endDate") != null) {
                semester.setEndDate(LocalDate.parse(request.get("endDate").toString()));
            }

            // Kiểm tra tính hợp lệ của ngày
            if (semester.getStartDate() != null && semester.getEndDate() != null) {
                if (semester.getEndDate().isBefore(semester.getStartDate())) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("message", "Ngày kết thúc không thể trước ngày bắt đầu"));
                }
                else if (semester.getEndDate().isEqual(semester.getStartDate())) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("message", "Ngày kết thúc không thể trùng ngày bắt đầu"));
                }
            }

            Long newId = semesterRepository.save(semester);
            semester.setId(newId);

            return ResponseEntity.ok(semester);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Error creating semester: " + e.getMessage()));
        }
    }

    // 🧩 Xóa học kỳ
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSemester(@PathVariable Long id, @RequestParam Long userId) {
        try {
            if (!semesterRepository.existsByIdAndUserId(id, userId)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Semester not found or access denied"));
            }

            semesterRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Semester deleted successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Error deleting semester: " + e.getMessage()));
        }
    }

    // ==============================
    // 🔄 API TÍNH TOÁN GPA TỰ ĐỘNG (GIỐNG GRADE CONTROLLER)
    // ==============================

    // 🆕 API: Tính toán và cập nhật GPA cho một học kỳ (tự động)
    @PostMapping("/{id}/calculate-gpa")
    public ResponseEntity<?> calculateSemesterGpa(@PathVariable Long id, @RequestParam Long userId) {
        try {
            // Kiểm tra quyền truy cập
            if (!semesterRepository.existsByIdAndUserId(id, userId)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Semester not found or access denied"));
            }

            // Tính toán GPA tự động
            BigDecimal gpa = semesterGpaService.calculateSemesterGpa(id);
            
            return ResponseEntity.ok(Map.of(
                "message", "GPA calculated successfully",
                "semesterId", id,
                "gpa", gpa,
                "calculatedAt", java.time.LocalDateTime.now().toString()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Error calculating GPA: " + e.getMessage()));
        }
    }

    // 🆕 API: Tính toán GPA cho tất cả học kỳ của user (tự động)
    @PostMapping("/calculate-all-gpa")
    public ResponseEntity<?> calculateAllSemestersGpa(@RequestParam Long userId) {
        try {
            if (!userRepository.existsById(userId)) {
                return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
            }

            // Chạy bất đồng bộ, trả về response ngay
            new Thread(() -> {
                try {
                    semesterGpaService.calculateAllSemestersGpa(userId);
                    System.out.println("✅ Đã hoàn thành tính GPA cho tất cả học kỳ của user: " + userId);
                } catch (Exception e) {
                    System.err.println("❌ Lỗi khi tính GPA tất cả học kỳ: " + e.getMessage());
                }
            }).start();
            
            return ResponseEntity.ok(Map.of(
                "message", "Đã bắt đầu tính GPA cho tất cả học kỳ. Kiểm tra console log để theo dõi tiến độ.",
                "userId", userId,
                "startedAt", java.time.LocalDateTime.now().toString()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Error calculating all GPAs: " + e.getMessage()));
        }
    }

    // 🆕 API: Tự động tính lại GPA khi có thay đổi điểm (gọi từ GradeController)
    @PostMapping("/recalculate-on-grade-change")
    public ResponseEntity<?> recalculateOnGradeChange(@RequestBody Map<String, Object> request) {
        try {
            Long subjectId = parseUserId(request.get("subjectId"));
            if (subjectId == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "SubjectId không hợp lệ"));
            }

            // Tự động tính lại GPA học kỳ chứa môn học này
            semesterGpaService.recalculateSemesterGpaOnGradeChange(subjectId);
            
            return ResponseEntity.ok(Map.of(
                "message", "Đã kích hoạt tính lại GPA học kỳ",
                "subjectId", subjectId,
                "triggeredAt", java.time.LocalDateTime.now().toString()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Error recalculating semester GPA: " + e.getMessage()));
        }
    }

    // 🆕 API: Cập nhật GPA thủ công (nếu cần)
    @PostMapping("/{id}/update-gpa")
    public ResponseEntity<?> updateSemesterGpa(
            @PathVariable Long id, 
            @RequestParam Long userId,
            @RequestBody Map<String, Object> request) {
        try {
            // Kiểm tra quyền truy cập
            if (!semesterRepository.existsByIdAndUserId(id, userId)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Semester not found or access denied"));
            }

            // Lấy GPA từ request
            if (!request.containsKey("gpa")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Thiếu trường GPA"));
            }

            BigDecimal gpa;
            try {
                gpa = new BigDecimal(request.get("gpa").toString());
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("message", "GPA không hợp lệ"));
            }

            // Kiểm tra GPA trong khoảng hợp lệ (0.00 - 4.00)
            if (gpa.compareTo(BigDecimal.ZERO) < 0 || gpa.compareTo(new BigDecimal("4.00")) > 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "GPA phải trong khoảng 0.00 đến 4.00"));
            }

            // Cập nhật GPA
            semesterRepository.updateSemesterGpa(id, gpa);
            
            return ResponseEntity.ok(Map.of(
                "message", "GPA updated successfully",
                "semesterId", id,
                "gpa", gpa,
                "updatedAt", java.time.LocalDateTime.now().toString()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Error updating GPA: " + e.getMessage()));
        }
    }

    // 🆕 API: Lấy thông tin GPA của học kỳ
    @GetMapping("/{id}/gpa")
    public ResponseEntity<?> getSemesterGpa(@PathVariable Long id, @RequestParam Long userId) {
        try {
            Semester semester = semesterRepository.findById(id);
            if (semester == null) {
                return ResponseEntity.notFound().build();
            }
            if (!semester.getUserId().equals(userId)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Access denied"));
            }

            return ResponseEntity.ok(Map.of(
                "semesterId", id,
                "semesterName", semester.getName(),
                "gpa", semester.getSemesterGpa(),
                "calculatedAt", java.time.LocalDateTime.now().toString()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Error retrieving GPA: " + e.getMessage()));
        }
    }

    // 🆕 API: Cập nhật GPA cho tất cả học kỳ cũ (giống update-all-avg trong GradeController)
    @PostMapping("/update-all-gpa")
    public ResponseEntity<?> updateAllSemestersGpa(@RequestParam Long userId) {
        try {
            if (!userRepository.existsById(userId)) {
                return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
            }

            // Chạy bất đồng bộ, trả về response ngay
            new Thread(() -> {
                try {
                    System.out.println("🔄 Bắt đầu cập nhật GPA cho tất cả học kỳ của user: " + userId);
                    List<Semester> semesters = semesterRepository.findByUserId(userId);
                    System.out.println("📚 Tìm thấy " + semesters.size() + " học kỳ cần cập nhật");
                    
                    for (Semester semester : semesters) {
                        try {
                            System.out.println("🔍 Xử lý học kỳ: " + semester.getName() + " (ID: " + semester.getId() + ")");
                            semesterGpaService.calculateSemesterGpa(semester.getId());
                            Thread.sleep(100); // Nghỉ ngắn để tránh quá tải
                        } catch (Exception e) {
                            System.err.println("❌ Lỗi khi xử lý học kỳ " + semester.getId() + ": " + e.getMessage());
                        }
                    }
                    System.out.println("✅ Đã hoàn thành cập nhật GPA cho tất cả học kỳ");
                } catch (Exception e) {
                    System.err.println("❌ Lỗi khi cập nhật GPA tất cả học kỳ: " + e.getMessage());
                }
            }).start();
            
            return ResponseEntity.ok(Map.of(
                "message", "Đã bắt đầu cập nhật GPA cho tất cả học kỳ. Kiểm tra console log để theo dõi tiến độ.",
                "userId", userId,
                "startedAt", java.time.LocalDateTime.now().toString()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Error starting GPA update: " + e.getMessage()));
        }
    }

    // 🧩 Helper method để parse userId từ nhiều kiểu dữ liệu
    private Long parseUserId(Object userIdValue) {
        try {
            if (userIdValue instanceof Integer) {
                return ((Integer) userIdValue).longValue();
            } else if (userIdValue instanceof Long) {
                return (Long) userIdValue;
            } else if (userIdValue instanceof String) {
                return Long.valueOf((String) userIdValue);
            } else if (userIdValue instanceof Number) {
                return ((Number) userIdValue).longValue();
            }
        } catch (NumberFormatException e) {
            return null;
        }
        return null;
    }
}