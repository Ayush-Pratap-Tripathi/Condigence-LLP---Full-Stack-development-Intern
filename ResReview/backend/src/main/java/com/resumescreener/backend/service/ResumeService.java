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
     * Main method to analyze resume file and job description.
     * Returns a map containing atsScore, matchPercentage, rating and saved resume
     * id.
     */
    public Map<String, Object> analyzeResume(MultipartFile file, String jobDescription, String userId)
            throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file uploaded");
        }
        // 1) extract text
        String text;
        try (InputStream is = file.getInputStream()) {
            text = tika.parseToString(is);
        }

        // 2) Get direct similarity score from HF API
        double similarity = hfClient.getSimilarityScore(
                truncateForEmbedding(jobDescription),
                truncateForEmbedding(text));

        double matchPercentage = Math.round(similarity * 10000.0) / 100.0; // two decimal percent

        // 4) compute simple ATS score: weight combination of keyword overlap and
        // embedding similarity
        double keywordScore = computeKeywordOverlapScore(text, jobDescription); // 0..100
        double atsScore = Math.round((0.5 * keywordScore + 0.5 * (matchPercentage)) * 100.0) / 100.0;

        // 5) decide rating
        String rating = deriveRating(atsScore);

        // 6) save resume doc
        Resume resume = new Resume();
        resume.setUserId(userId);
        resume.setFileName(file.getOriginalFilename());
        resume.setUploadedAt(new Date());
        resume.setAtsScore(atsScore);
        resume.setMatchPercentage(matchPercentage);
        resume.setRating(rating);
        resume.setExtractedText(text.length() > 100000 ? text.substring(0, 100000) : text); // cap stored text
        resume.setJobDescription(jobDescription);

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

    // helper: very small text truncation to avoid excessively long inputs for HF
    private String truncateForEmbedding(String s) {
        if (s == null)
            return "";
        int max = 1600; // characters limit for safety; tune as needed
        return s.length() > max ? s.substring(0, max) : s;
    }

    private double cosineSimilarity(double[] a, double[] b) {
        if (a.length != b.length) {
            // if lengths differ, compute on min length
            int n = Math.min(a.length, b.length);
            double dot = 0.0, na = 0.0, nb = 0.0;
            for (int i = 0; i < n; i++) {
                dot += a[i] * b[i];
                na += a[i] * a[i];
                nb += b[i] * b[i];
            }
            if (na == 0 || nb == 0)
                return 0.0;
            return dot / (Math.sqrt(na) * Math.sqrt(nb));
        }
        double dot = 0.0, norma = 0.0, normb = 0.0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            norma += a[i] * a[i];
            normb += b[i] * b[i];
        }
        if (norma == 0 || normb == 0)
            return 0.0;
        return dot / (Math.sqrt(norma) * Math.sqrt(normb));
    }

    private double computeKeywordOverlapScore(String resumeText, String jobDescription) {
        if (jobDescription == null || jobDescription.trim().isEmpty())
            return 50.0;
        if (resumeText == null)
            resumeText = "";
        // simple tokenization: extract words from both, remove stopwords minimally
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
        return Math.min(100.0, Math.round(ratio * 10000.0) / 100.0); // 0..100
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