package com.Judge_Mental.XorOJ.controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

import com.Judge_Mental.XorOJ.dto.SubmissionResponseDTO;
import com.Judge_Mental.XorOJ.entity.Submission;
import com.Judge_Mental.XorOJ.entity.XUser;
import com.Judge_Mental.XorOJ.entity.Submission.SubmissionStatus;
import com.Judge_Mental.XorOJ.judge.CppExecutor.RunResult;
import com.Judge_Mental.XorOJ.service.ContestService;
import com.Judge_Mental.XorOJ.service.JudgingService;
import com.Judge_Mental.XorOJ.service.ScoreboardService;
import com.Judge_Mental.XorOJ.service.SubmissionService;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    @Autowired
    private JudgingService judgingService;

    @Autowired
    private ScoreboardService scoreboardService;

    @Autowired
    private ContestService contestService;

    @GetMapping("/contests/{id}/my")
    public List<SubmissionResponseDTO> getSubmissionsForContest(
        @PathVariable Long id,
        @AuthenticationPrincipal(expression = "user") XUser user) {

        List<Submission> submissions = submissionService.getSubmissionsByUserIDandContestID(user.getId(), id);
        return submissions.stream()
           .map(SubmissionResponseDTO::fromSubmission)
           .collect(Collectors.toList());
    }

    @GetMapping("/contests/{id}/page/{pageNumber}")
    public List<SubmissionResponseDTO> getPaginatedSubmissions(
        @PathVariable Long id,
        @PathVariable int pageNumber) {
        
        List<Submission> submissions = submissionService.getPaginatedContestSubmissions(id, pageNumber);
        return submissions.stream()
           .map(SubmissionResponseDTO::fromSubmission)
           .collect(Collectors.toList());
    }

    public record submissionRequestDTO(String code, String language) {}
    @PostMapping("/contests/{contestId}/problems/{problemId}/submit")
    public SubmissionStatus submitSolution(
        @PathVariable Long contestId,
        @PathVariable Long problemId,
        @AuthenticationPrincipal(expression = "user") XUser user,
        @RequestBody submissionRequestDTO submission) throws IOException, InterruptedException {

        Submission savedSubmission = submissionService.createSubmissionFromString(
            submission.code(),
            problemId,
            contestId,
            user.getId(),
            submission.language()
        );
        savedSubmission = judgingService.judgeSubmission(savedSubmission);
        // System.out.println("Judged submission with status: " + savedSubmission.getStatus());
        if (contestId > 0) {
            LocalDateTime endTime = contestService.getContestEndTime(contestId);
            if (endTime != null && endTime.isAfter(savedSubmission.getSubmissionTime())) {
                scoreboardService.updateStandingsForSubmission(
                    contestId,
                    problemId,
                    user.getId(),
                    user.getUsername(),
                    savedSubmission.getStatus() == SubmissionStatus.ACCEPTED,
                    savedSubmission.getSubmissionTime()
                );
            }
        }
        
        return savedSubmission.getStatus();
    }

    @PostMapping("/problems/{problemId}/submit")
    public SubmissionStatus submitSolution(
        @PathVariable Long problemId,
        @AuthenticationPrincipal(expression = "user") XUser user,
        @RequestBody submissionRequestDTO submission) throws IOException, InterruptedException {

        Submission savedSubmission = submissionService.createSubmissionFromString(
            submission.code(),
            problemId,
            0L,
            user.getId(),
            submission.language()
        );
        savedSubmission = judgingService.judgeSubmission(savedSubmission);
        System.out.println("Judged submission with status: " + savedSubmission.getStatus());
        return savedSubmission.getStatus();
    }

    public record runRequest(String code, String language, String stdin) {}
    @PostMapping("/test")
    public RunResult submitSolution(
        @RequestBody runRequest request) throws IOException, InterruptedException {
        return judgingService.runCodeWithTest(request.code(), request.stdin());
    }
    
    @PostMapping(value = "/testfile", consumes = "multipart/form-data")
    public RunResult submitSolution(
            @RequestPart("code") String codeFile,
            @RequestPart("input") String inputFile
    ) throws IOException, InterruptedException {

        String code  = new String(codeFile.getBytes());
        String input = new String(inputFile.getBytes());

        return judgingService.runCodeWithTest(code, input);
    }
}
