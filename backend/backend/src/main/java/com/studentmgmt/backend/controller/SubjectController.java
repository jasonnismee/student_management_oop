package com.studentmgmt.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.studentmgmt.backend.model.Semester;
import com.studentmgmt.backend.model.Subject;
import com.studentmgmt.backend.repository.SubjectRepository;
import com.studentmgmt.backend.repository.GradeRepository;
import com.studentmgmt.backend.repository.SemesterRepository;
import com.studentmgmt.backend.service.SemesterGpaService; 

@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(origins = "http://localhost:3000")
public class SubjectController {

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private SemesterRepository semesterRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private SemesterGpaService semesterGpaService;

    // ✅ Lấy danh sách môn học theo học kỳ
    @GetMapping("/semester/{semesterId}")
    public ResponseEntity<List<Subject>> getSubjectsBySemester(@PathVariable Long semesterId) {
        List<Subject> subjects = subjectRepository.findBySemesterId(semesterId);
        return ResponseEntity.ok(subjects);
    }

    // ✅ Lấy danh sách môn học của user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Subject>> getSubjectsByUser(@PathVariable Long userId) {
        List<Subject> subjects = subjectRepository.findByUserId(userId);
        return ResponseEntity.ok(subjects);
    }

    // ✅ Thêm môn học mới (dùng SQL thuần, nhận semesterId trực tiếp từ JSON)
    @PostMapping
    public ResponseEntity<?> createSubject(@RequestBody Map<String, Object> body) {
        try {
            String name = (String) body.get("name");
            Integer credits = (Integer) body.get("credits");
            String subjectCode = (String) body.get("subjectCode");
            Long semesterId = ((Number) body.get("semesterId")).longValue();

            // Kiểm tra semester tồn tại không
            Semester semester = semesterRepository.findById(semesterId);
            if (semester == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Semester không tồn tại"));
            }

            // Tạo object Subject
            Subject subject = new Subject();
            subject.setName(name);
            subject.setCredits(credits);
            subject.setSubjectCode(subjectCode);
            subject.setSemester(semester);
            subject.setCreatedAt(java.time.LocalDateTime.now());

            Subject saved = subjectRepository.save(subject);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi tạo môn học: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubject(@PathVariable Long id, @RequestParam Long userId) {
        try {
            if (!subjectRepository.existsByIdAndUserId(id, userId)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Không có quyền xóa môn học này"));
            }

            // 🆕 LẤY THÔNG TIN HỌC KỲ TRƯỚC KHI XÓA
            Subject subject = subjectRepository.findById(id);
            Long semesterId = null;
            if (subject != null && subject.getSemester() != null) {
                semesterId = subject.getSemester().getId();
                System.out.println("🗑️ Chuẩn bị xóa môn học: " + subject.getName() + " thuộc học kỳ: " + semesterId);
            }

            // 🆕 XÓA TẤT CẢ ĐIỂM CỦA MÔN HỌC TRƯỚC
            gradeRepository.deleteBySubjectId(id);
            System.out.println("✅ Đã xóa tất cả điểm của môn học ID: " + id);

            // XÓA MÔN HỌC
            subjectRepository.deleteById(id);
            System.out.println("✅ Đã xóa môn học ID: " + id);

            // 🆕 TỰ ĐỘNG TÍNH LẠI GPA HỌC KỲ
            if (semesterId != null) {
                System.out.println("🔄 Tính lại GPA cho học kỳ sau khi xóa môn học: " + semesterId);
                semesterGpaService.calculateSemesterGpa(semesterId);
            }

            return ResponseEntity.ok(Map.of("message", "Đã xóa môn học thành công"));

        } catch (Exception e) {
            System.err.println("❌ Lỗi xóa môn học: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi xóa môn học: " + e.getMessage()));
        }
    }
}
