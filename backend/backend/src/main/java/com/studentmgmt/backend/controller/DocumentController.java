package com.studentmgmt.backend.controller;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.studentmgmt.backend.model.Document;
import com.studentmgmt.backend.repository.DocumentRepository;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "http://localhost:3000")
public class DocumentController {

    @Autowired
    private DocumentRepository documentRepository;

    private final Path fileStorageLocation;

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/png",
            "image/jpg",
            "image/jpeg"
            );

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("pdf", "doc", "docx", "png", "jpg", "jpeg");

    public DocumentController() throws IOException {
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        if (!Files.exists(this.fileStorageLocation)) {
            Files.createDirectories(this.fileStorageLocation);
        }
    }

    @GetMapping("/user/{userId}")
    public List<Document> getDocumentsByUser(@PathVariable Long userId) {
        System.out.println("--- CONTROLLER: Đang gọi getDocumentsByUser cho userId: " + userId); // <-- THÊM DÒNG NÀY
        return documentRepository.findByUserId(userId);
    }

    @GetMapping("/subject/{subjectId}")
    public List<Document> getDocumentsBySubject(@PathVariable Long subjectId) {
        return documentRepository.findBySubjectId(subjectId);
    }

    @GetMapping("/user/{userId}/bookmarked")
    public List<Document> getBookmarkedDocuments(@PathVariable Long userId) {
        return documentRepository.findByUserIdAndBookmarkedTrue(userId);
    }

    @GetMapping("/user/{userId}/search")
    public List<Document> searchDocuments(@PathVariable Long userId, @RequestParam String keyword) {
        return documentRepository.findByUserIdAndFileNameContainingIgnoreCase(userId, keyword);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id, @RequestParam(required = false) Long userId) {
        try {
            // 1. Tìm thông tin file trong Database
            Document doc = documentRepository.findById(id).orElse(null);
            if (doc == null) {
                return ResponseEntity.notFound().build();
            }

            // 2. Lấy đường dẫn file từ DB (file_path)
            // Lưu ý: doc.getFilePath() phải trả về đường dẫn tuyệt đối trên ổ cứng server
            Path filePath = Paths.get(doc.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            // 3. Kiểm tra file vật lý có tồn tại và đọc được không
            if (resource.exists() && resource.isReadable()) {
                // Trả về file cho trình duyệt tải xuống
                return ResponseEntity.ok()
                        // Xác định loại file (PDF, Image, v.v.)
                        .contentType(MediaType.parseMediaType(doc.getFileType())) 
                        // Đặt tên file khi tải về
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                        .body(resource);
            } else {
                // File có trong DB nhưng không thấy trên ổ cứng
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{documentId}/bookmark")
    public ResponseEntity<?> toggleBookmark(@PathVariable Long documentId, @RequestParam Long userId) {
        Optional<Document> docOpt = documentRepository.findById(documentId);
        if (docOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Document not found"));
        }
        Document document = docOpt.get();
        if (!document.getUserId().equals(userId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Access denied"));
        }
        document.setBookmarked(!document.getBookmarked());
        documentRepository.save(document);
        return ResponseEntity.ok(Map.of("bookmarked", document.getBookmarked()));
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "subjectId", required = false) Long subjectId,
            @RequestParam(value = "customFileName", required = false) String customFileName) {

        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "File rỗng."));
            }

            String originalFileName = file.getOriginalFilename();
            String fileType = file.getContentType();

            if (!ALLOWED_MIME_TYPES.contains(fileType)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Định dạng file không hỗ trợ."));
            }

            String fileExtension = "";
            if (originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf(".") + 1).toLowerCase();
            }
            if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
                return ResponseEntity.badRequest().body(Map.of("message", "File không hợp lệ."));
            }

            String storedFileName = UUID.randomUUID() + "." + fileExtension;
            Path targetLocation = this.fileStorageLocation.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            Document doc = new Document();
            doc.setFileName(customFileName != null && !customFileName.trim().isEmpty() ? customFileName : originalFileName);
            doc.setFilePath(targetLocation.toString());
            doc.setFileType(fileType);
            doc.setFileSize(file.getSize());
            doc.setUserId(userId);
            doc.setSubjectId(subjectId);

            documentRepository.save(doc);

            return ResponseEntity.ok(Map.of("message", "Upload thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long documentId, @RequestParam Long userId) {
        Optional<Document> docOpt = documentRepository.findById(documentId);
        if (docOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Document not found"));
        }

        Document document = docOpt.get();
        if (!document.getUserId().equals(userId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Access denied"));
        }

        try {
            Path filePath = Paths.get(document.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
            documentRepository.deleteById(documentId);
            return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{documentId}/download")
    public ResponseEntity<?> downloadDocument(@PathVariable Long documentId, @RequestParam Long userId) {
        System.out.println("--- CONTROLLER: Đang gọi downloadDocument cho docId: " + documentId + ", userId: " + userId); // <-- THÊM DÒNG NÀY;
        Optional<Document> docOpt = documentRepository.findById(documentId);

        if (docOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Document document = docOpt.get();
        System.out.println("--- CONTROLLER: File 4 này THỰC SỰ thuộc về userId: " + document.getUserId()); // <-- THÊM DÒNG NÀY
        if (!document.getUserId().equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }

        try {
            Path filePath = Paths.get(document.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                return ResponseEntity.status(404).body(Map.of("message", "File not found."));
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(document.getFileType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }
}
