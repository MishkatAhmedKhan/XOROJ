package com.Judge_Mental.XorOJ.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Judge_Mental.XorOJ.dto.SubmissionResponseDTO;
import com.Judge_Mental.XorOJ.entity.Submission;
import com.Judge_Mental.XorOJ.repo.SubmissionRepository;

@Service
public class SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;
    
    @Autowired
    private FileStorageService fileStorageService;

    public Submission saveSubmissionWithFile(Submission submission, String code) throws IOException {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = String.format("%s_%s_%s_%s.%s", 
            submission.getUserId(), 
            submission.getProblemId(),
            timestamp,
            UUID.randomUUID().toString().substring(0, 8),
            submission.getLanguage()
        );
        
        // Use FileStorageService to store the string content directly to a file
        String directory = "submissions";
        String filePath = fileStorageService.storeStringToFile(code, directory, filename);
        
        // Set file path in submission entity
        submission.setFilePath(filePath);
        
        // Save to database
        return submissionRepository.save(submission);
    }
    
    public Submission createSubmissionFromString(String code, Long problemId, Long contestId, Long userId, 
                                              String language) throws IOException {
        Submission submission = new Submission();
        submission.setProblemId(problemId);
        submission.setContestId(contestId);
        submission.setUserId(userId);
        submission.setLanguage(language);
        submission.setSubmissionTime(LocalDateTime.now());
        submission.setStatus(Submission.SubmissionStatus.PENDING);
        
        return saveSubmissionWithFile(submission, code);
    }

    public Submission submit(Submission submission) {
        return submissionRepository.save(submission);
    }

    public List<Submission> getAllSubmissions() {
        return submissionRepository.findAll();
    }

    public List<Submission> getSubmissionsByUserIDandContestID(Long userId, Long contestId) {
        return submissionRepository.findByUserIdAndContestId(userId, contestId);
    }

    public List<Submission> getPaginatedContestSubmissions(Long contestId, int pageNumber) {
        if (pageNumber < 1) {
            return List.of();
        }
        
        List<Submission> allSubmissions = submissionRepository.findByContestIdOrderBySubmissionTimeDesc(contestId);
        int startIndex = (pageNumber - 1) * 20;
        
        if (startIndex >= allSubmissions.size()) {
            return List.of();
        }
        
        int endIndex = Math.min(startIndex + 20, allSubmissions.size());
        return allSubmissions.subList(startIndex, endIndex);
    }

    public List<SubmissionResponseDTO> getSubmissionResponsesByUserId(Long userId) {
        return submissionRepository.findByUserId(userId).stream()
                .map(SubmissionResponseDTO::fromSubmission)
                .toList();
    }
}
