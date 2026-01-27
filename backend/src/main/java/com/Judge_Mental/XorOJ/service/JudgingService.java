package com.Judge_Mental.XorOJ.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Judge_Mental.XorOJ.entity.GeneratorFile;
import com.Judge_Mental.XorOJ.entity.Problem;
import com.Judge_Mental.XorOJ.entity.Submission;
import com.Judge_Mental.XorOJ.entity.Submission.SubmissionStatus;
import com.Judge_Mental.XorOJ.entity.TestFile;
import com.Judge_Mental.XorOJ.judge.CppExecutor;
import com.Judge_Mental.XorOJ.judge.CppExecutor.JudgeVerdict;
import com.Judge_Mental.XorOJ.judge.CppExecutor.RunResult;
import com.Judge_Mental.XorOJ.repo.GeneratorFileRepository;
import com.Judge_Mental.XorOJ.repo.ProblemRepository;
import com.Judge_Mental.XorOJ.repo.SubmissionRepository;
import com.Judge_Mental.XorOJ.repo.TestFileRepository;

@Service
public class JudgingService {

    private final CppExecutor cppExecutor;
    
    @Autowired
    private ProblemRepository problemRepository;
    
    @Autowired
    private TestFileRepository testFileRepository;
    
    @Autowired
    private GeneratorFileRepository generatorFileRepository;
    
    @Autowired
    private SubmissionRepository submissionRepository;

    public JudgingService(CppExecutor cppExecutor) {
        this.cppExecutor = cppExecutor;
    }

    public RunResult runCodeWithTest(String code, String input) throws IOException, InterruptedException {
        return cppExecutor.execute(code, input, 2000, 128 * 1024, 1.0);
    }
    
    public Submission judgeSubmission(Submission submission) throws IOException, InterruptedException {
        // Check if submission is null
        if (submission == null) {
            throw new IllegalArgumentException("Submission cannot be null");
        }
        
        // Set status to running
        submission.setStatus(SubmissionStatus.RUNNING);
        submission = submissionRepository.save(submission);
        
        long executionTime = 0, memoryUsed = 0;

        // Check if the language is C++ (only support C++ for now)
        if (!"cpp".equals(submission.getLanguage()) && !"c".equals(submission.getLanguage())) {
            submission.setStatus(SubmissionStatus.RUNTIME_ERROR);
            submission.setErrorMessage("Unsupported language: " + submission.getLanguage());
            return submissionRepository.save(submission);
        }
        
        try {
            // Get problem details
            Problem problem = problemRepository.findById(submission.getProblemId())
                .orElseThrow(() -> new IllegalArgumentException("Problem not found"));
            
            // Read submission file
            String submissionFilePath = submission.getFilePath();
            Path path = Paths.get(submissionFilePath);
            if (!Files.exists(path)) {
                submission.setStatus(SubmissionStatus.RUNTIME_ERROR);
                submission.setErrorMessage("Submission file not found: " + submissionFilePath);
                return submissionRepository.save(submission);
            }
            
            // Get the main solution path
            String mainSolutionPath = problem.getMainSolutionPath();
            if (mainSolutionPath == null || mainSolutionPath.isEmpty()) {
                submission.setStatus(SubmissionStatus.RUNTIME_ERROR);
                submission.setErrorMessage("No main solution available for this problem");
                return submissionRepository.save(submission);
            }
            
            int timeLimitMs = problem.getTimeLimit();
            int memoryLimitKB = problem.getMemoryLimit();
            
            // Results storage
            List<JudgeVerdict> verdicts = new ArrayList<>();
            
            // First try to judge with generator files if available
            List<GeneratorFile> generatorFiles = generatorFileRepository.findByProblemId(problem.getId());
            if (!generatorFiles.isEmpty()) {
                for (GeneratorFile generator : generatorFiles) {
                    JudgeVerdict verdict = cppExecutor.compareWithGenerator(
                            submissionFilePath,
                            mainSolutionPath,
                            generator.getFilePath(),
                            timeLimitMs,
                            memoryLimitKB
                    );
                    verdicts.add(verdict);
                    
                    executionTime = Math.max(executionTime, verdict.timeUsedMillis);
                    memoryUsed = Math.max(memoryUsed, verdict.memoryUsedKB);
                    submission.setExecutionTime(executionTime);
                    submission.setMemoryUsed(memoryUsed);

                    // If any test fails with a non-AC status, we can stop judging
                    if (verdict.status != SubmissionStatus.ACCEPTED) {
                        submission.setStatus(verdict.status);
                        submission.setErrorMessage(verdict.message);
                        return submissionRepository.save(submission);
                    }
                    
                }
            }
            
            // Then judge with test files if available
            List<TestFile> testFiles = testFileRepository.findByProblemId(problem.getId());
            if (!testFiles.isEmpty()) {
                for (TestFile test : testFiles) {
                    JudgeVerdict verdict = cppExecutor.compareWithInputFile(
                            submissionFilePath,
                            mainSolutionPath,
                            test.getFilePath(),
                            timeLimitMs,
                            memoryLimitKB
                    );
                    verdicts.add(verdict);
                    System.out.println(verdict);
                    executionTime = Math.max(executionTime, verdict.timeUsedMillis);
                    memoryUsed = Math.max(memoryUsed, verdict.memoryUsedKB);
                    submission.setExecutionTime(executionTime);
                    submission.setMemoryUsed(memoryUsed);

                    // If any test fails with a non-AC status, we can stop judging
                    if (verdict.status != SubmissionStatus.ACCEPTED) {
                        submission.setStatus(verdict.status);
                        submission.setErrorMessage(verdict.message);
                        return submissionRepository.save(submission);
                    }
                    
                }
            }
            
            submission.setStatus(SubmissionStatus.ACCEPTED);
            submission.setErrorMessage(null);
            
            return  submissionRepository.save(submission);
        } catch (Exception e) {
            // Handle any exceptions
            submission.setStatus(SubmissionStatus.RUNTIME_ERROR);
            submission.setErrorMessage("Error during judging: " + e.getMessage());
            return submissionRepository.save(submission);
        }
    }

}
