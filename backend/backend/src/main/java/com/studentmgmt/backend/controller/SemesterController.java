package com.studentmgmt.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.studentmgmt.backend.model.Semester;
import com.studentmgmt.backend.repository.SemesterRepository;
import com.studentmgmt.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/semesters")
@CrossOrigin(origins = "http://localhost:3000")
public class SemesterController {

    @Autowired
    private SemesterRepository semesterRepository;

    @Autowired
    private UserRepository userRepository;

    // 🧩 Lấy danh sách học kỳ của user
    @GetMapping
    public ResponseEntity<?> getUserSemesters(@RequestParam Long userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }
        List<Semester> semesters = semesterRepository.findByUserId(userId);
        return ResponseEntity.ok(semesters);
    }

    // 🧩 Tạo học kỳ mới
    @PostMapping
    public ResponseEntity<?> createSemester(@RequestBody Map<String, Object> request) {
        try {
            if (!request.containsKey("userId")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Thiếu trường userId"));
            }
            if (!request.containsKey("name")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Thiếu tên học kỳ"));
            }

            Long userId = null;
            try {
                Object val = request.get("userId");
                if (val instanceof Integer) userId = ((Integer) val).longValue();
                else if (val instanceof Long) userId = (Long) val;
                else if (val instanceof String) userId = Long.parseLong((String) val);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("message", "UserId không hợp lệ"));
            }

            if (userId == null || !userRepository.existsById(userId)) {
                return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
            }

            Semester semester = new Semester();
            semester.setUserId(userId);
            semester.setName((String) request.get("name"));
            if (request.get("startDate") != null)
                semester.setStartDate(LocalDate.parse(request.get("startDate").toString()));
            if (request.get("endDate") != null)
                semester.setEndDate(LocalDate.parse(request.get("endDate").toString()));

            Long newId = semesterRepository.save(semester);
            semester.setId(newId);

            return ResponseEntity.ok(semester);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Error creating semester: " + e.getMessage()));
        }
    }

    // 🧩 Xóa học kỳ
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSemester(@PathVariable Long id, @RequestParam Long userId) {
        if (!semesterRepository.existsByIdAndUserId(id, userId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Semester not found or access denied"));
        }

        semesterRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Semester deleted successfully"));
    }
}
