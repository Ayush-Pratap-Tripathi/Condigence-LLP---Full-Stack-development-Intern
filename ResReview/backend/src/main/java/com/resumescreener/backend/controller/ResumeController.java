package com.resumescreener.backend.controller;

import com.resumescreener.backend.model.Resume;
import com.resumescreener.backend.service.ResumeService;
import com.resumescreener.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @Autowired
    private JwtUtil jwtUtil;

    // ✅ Modified: supports single or multiple resume uploads
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeResume(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            @RequestParam(value = "file", required = false) MultipartFile singleFile, // backward compat
            @RequestParam("jobRole") String jobRole,
            @RequestParam("jobDescription") String jobDescription) {

        try {
            String userId = null;
            if (authorization != null && authorization.startsWith("Bearer ")) {
                String token = authorization.substring(7);
                userId = jwtUtil.extractUserId(token);
            }

            // Backward-compatible: if client sent single "file" param, convert to files array
            if ((files == null || files.length == 0) && singleFile != null) {
                files = new MultipartFile[]{ singleFile };
            }

            if (files == null || files.length == 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "No file(s) provided"));
            }

            List<Map<String, Object>> results = new ArrayList<>();
            for (MultipartFile f : files) {
                Map<String, Object> res = resumeService.analyzeResume(f, jobDescription, jobRole, userId);
                results.add(res);
            }

            // If only one uploaded, return single object to preserve compatibility
            if (results.size() == 1) {
                return ResponseEntity.ok(results.get(0));
            }
            return ResponseEntity.ok(results);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Internal server error", "details", e.getMessage()));
        }
    }

    // ✅ Fetch all resumes of a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Resume>> getUserResumes(@PathVariable String userId) {
        return ResponseEntity.ok(resumeService.getResumesByUser(userId));
    }

    // ✅ Fetch actual PDF by ID
    @GetMapping("/{id}/file")
    public ResponseEntity<byte[]> getResumeFile(@PathVariable String id) {
        Optional<Resume> resumeOpt = resumeService.getResumeById(id);
        if (resumeOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Resume resume = resumeOpt.get();
        byte[] fileData = resume.getFileData();

        if (fileData == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "inline; filename=\"" + resume.getFileName() + "\"")
                .body(fileData);
    }

    // ✅ Delete single resume by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResumeById(@PathVariable String id) {
        boolean deleted = resumeService.deleteResumeById(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Resume deleted successfully"));
        } else {
            return ResponseEntity.status(404).body(Map.of("error", "Resume not found"));
        }
    }

    // ✅ Delete all resumes of a user
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<?> deleteAllResumesByUser(@PathVariable String userId) {
        resumeService.deleteAllResumesByUser(userId);
        return ResponseEntity.ok(Map.of("message", "All resumes deleted successfully"));
    }
}
