package com.resumescreener.backend.controller;

import com.resumescreener.backend.model.Resume;
import com.resumescreener.backend.service.ResumeService;
import com.resumescreener.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Analyze endpoint: expects 'file' (multipart) and 'jobDescription' (string).
     * Also expects an Authorization header "Bearer <token>" to identify user (optional based on your auth).
     */
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeResume(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam("file") MultipartFile file,
            @RequestParam("jobDescription") String jobDescription) {
        try {
            String userId = null;
            if (authorization != null && authorization.startsWith("Bearer ")) {
                String token = authorization.substring(7);
                userId = jwtUtil.extractUserId(token); // implement extractUserId or username in JwtUtil
            }

            Map<String, Object> result = resumeService.analyzeResume(file, jobDescription, userId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error", "details", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Resume>> getUserResumes(@PathVariable String userId) {
        return ResponseEntity.ok(resumeService.getResumesByUser(userId));
    }
}
