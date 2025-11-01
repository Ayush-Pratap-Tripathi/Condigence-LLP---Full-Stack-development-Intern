package com.resumescreener.backend.service;

import com.resumescreener.backend.model.Resume;
import com.resumescreener.backend.repository.ResumeRepository;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private HuggingFaceClient hfClient;

    private final Tika tika = new Tika();

    /**
     * Analyze resume file and save with PDF binary data.
     */
    public Map<String, Object> analyzeResume(MultipartFile file, String jobDescription, String jobRole, String userId)
            throws Exception {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file uploaded");
        }

        // 1) Extract text using Apache Tika
        String text;
        try (InputStream is = file.getInputStream()) {
            text = tika.parseToString(is);
        }

        // 2) Get similarity score from Hugging Face
        double similarity = hfClient.getSimilarityScore(
                truncateForEmbedding(jobDescription),
                truncateForEmbedding(text));

        double matchPercentage = Math.round(similarity * 10000.0) / 100.0;

        // 3) Compute ATS score
        double keywordScore = computeKeywordOverlapScore(text, jobDescription);
        double atsScore = Math.round((0.5 * keywordScore + 0.5 * (matchPercentage)) * 100.0) / 100.0;

        // 4) Determine rating
        String rating = deriveRating(atsScore);

        // 5) Save resume document with binary PDF
        Resume resume = new Resume();
        resume.setUserId(userId);
        resume.setFileName(file.getOriginalFilename());
        resume.setUploadedAt(new Date());
        resume.setAtsScore(atsScore);
        resume.setMatchPercentage(matchPercentage);
        resume.setRating(rating);
        resume.setExtractedText(text.length() > 100000 ? text.substring(0, 100000) : text);
        resume.setJobDescription(jobDescription);
        resume.setJobRole(jobRole);

        // ✅ Store binary PDF data
        resume.setFileData(file.getBytes());

        Resume saved = resumeRepository.save(resume);

        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("atsScore", atsScore);
        result.put("matchPercentage", matchPercentage);
        result.put("rating", rating);
        return result;
    }

    public List<Resume> getResumesByUser(String userId) {
        return resumeRepository.findByUserId(userId);
    }

    // ✅ New helper to fetch resume by ID
    public Optional<Resume> getResumeById(String id) {
        return resumeRepository.findById(id);
    }

    // Helpers
    private String truncateForEmbedding(String s) {
        if (s == null)
            return "";
        int max = 1600;
        return s.length() > max ? s.substring(0, max) : s;
    }

    private double computeKeywordOverlapScore(String resumeText, String jobDescription) {
        if (jobDescription == null || jobDescription.trim().isEmpty())
            return 50.0;
        if (resumeText == null)
            resumeText = "";
        Set<String> jdTokens = Arrays.stream(jobDescription.toLowerCase().split("\\W+"))
                .filter(s -> s.length() > 2)
                .collect(Collectors.toSet());
        Set<String> resumeTokens = Arrays.stream(resumeText.toLowerCase().split("\\W+"))
                .filter(s -> s.length() > 2)
                .collect(Collectors.toSet());

        if (jdTokens.isEmpty())
            return 50.0;
        long matchCount = jdTokens.stream().filter(resumeTokens::contains).count();
        double ratio = (double) matchCount / jdTokens.size();
        return Math.min(100.0, Math.round(ratio * 10000.0) / 100.0);
    }

    private String deriveRating(double atsScore) {
        if (atsScore >= 85)
            return "Excellent";
        if (atsScore >= 70)
            return "Good";
        if (atsScore >= 50)
            return "Average";
        return "Poor";
    }
}
