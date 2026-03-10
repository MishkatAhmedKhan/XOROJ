package com.Judge_Mental.XorOJ.dto;

import java.time.LocalDateTime;

import com.Judge_Mental.XorOJ.entity.Submission;
import com.Judge_Mental.XorOJ.entity.Submission.SubmissionStatus;

import lombok.Data;

@Data
public class SubmissionResponseDTO {
    private Long id;
    private Long userId;
    private Long problemId;
    private String problemTitle;
    private Long contestId;
    private String language;
    private LocalDateTime submissionTime;
    private SubmissionStatus status;
    private Long executionTime;
    private Long memoryUsed;
    
    public SubmissionResponseDTO() {
    }
    
    public SubmissionResponseDTO(Long id, Long userId, Long problemId, Long contestId, String problemTitle, String language, 
                               LocalDateTime submissionTime, SubmissionStatus status, 
                               Long executionTime, Long memoryUsed) {
        this.id = id;
        this.userId = userId;
        this.problemId = problemId;
        this.contestId = contestId;
        this.problemTitle = problemTitle;
        this.language = language;
        this.submissionTime = submissionTime;
        this.status = status;
        this.executionTime = executionTime;
        this.memoryUsed = memoryUsed;
    }

    // Getters and Setters

    public static SubmissionResponseDTO fromSubmission(Submission submission) {
        SubmissionResponseDTO dto = new SubmissionResponseDTO();
        dto.setId(submission.getId());
        dto.setUserId(submission.getUserId());
        dto.setProblemId(submission.getProblemId());
        dto.setContestId(submission.getContestId());
        dto.setLanguage(submission.getLanguage());
        dto.setSubmissionTime(submission.getSubmissionTime());
        dto.setStatus(submission.getStatus());
        dto.setExecutionTime(submission.getExecutionTime());
        dto.setMemoryUsed(submission.getMemoryUsed());
        return dto;
    }
}
