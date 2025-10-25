package com.resumescreener.backend.controller;

import com.resumescreener.backend.model.Resume;
import com.resumescreener.backend.service.ResumeService;
import com.resumescreener.backend.security.JwtUtil;  // ✅ Import this
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @Autowired
    private JwtUtil jwtUtil; // ✅ Inject the JwtUtil bean

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("jobDescription") String jobDescription,
            @RequestParam("file") MultipartFile file) {
        try {
            // ✅ Extract token from header ("Bearer <token>")
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7); // remove "Bearer "
            String userId = jwtUtil.extractUserId(token); // ✅ Decode userId from JWT

            Resume resume = resumeService.saveResume(userId, jobDescription, file);
            return ResponseEntity.ok(resume);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("File upload failed");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Resume>> getUserResumes(@PathVariable String userId) {
        return ResponseEntity.ok(resumeService.getResumesByUser(userId));
    }
}
