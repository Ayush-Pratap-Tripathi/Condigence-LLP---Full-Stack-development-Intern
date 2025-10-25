package com.resumescreener.backend.service;

import com.resumescreener.backend.model.Resume;
import com.resumescreener.backend.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Date;
import java.util.List;

@Service
public class ResumeService {
    @Autowired
    private ResumeRepository resumeRepository;

    public Resume saveResume(String userId, String jobDescription, MultipartFile file) throws IOException {
        if (!file.getContentType().equals("application/pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }

        Resume resume = new Resume();
        resume.setUserId(userId);
        resume.setJobDescription(jobDescription);
        resume.setFileName(file.getOriginalFilename());
        resume.setFileType(file.getContentType());
        resume.setFileSize(file.getSize());
        resume.setUploadedAt(new Date());
        resume.setFileData(file.getBytes());

        return resumeRepository.save(resume);
    }

    public List<Resume> getResumesByUser(String userId) {
        return resumeRepository.findByUserId(userId);
    }
}
