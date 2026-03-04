package com.Judge_Mental.XorOJ.service;

import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
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
                submission.setScore(0);
                return submissionRepository.save(submission);
            }
            
            // Get the main solution path
            String mainSolutionPath = problem.getMainSolutionPath();
            if (mainSolutionPath == null || mainSolutionPath.isEmpty()) {
                submission.setStatus(SubmissionStatus.RUNTIME_ERROR);
                submission.setErrorMessage("Problem not configured for judging yet (no main solution)");
                submission.setScore(0);
                return submissionRepository.save(submission);
            }
            
            int timeLimitMs = problem.getTimeLimit();
            int memoryLimitKB = problem.getMemoryLimit(); // stored in KB in DB
            
            // ─── Compile both solutions ONCE ───────────────────────────
            Path workDir = Files.createTempDirectory("judge-batch-");
            try {
                String exeSuffix = CppExecutor.getExeSuffix();
                
                // Compile main solution
                Path mainExe = workDir.resolve("main-solution" + exeSuffix);
                CppExecutor.RunResult compileMain = cppExecutor.compileSource(
                        Path.of(mainSolutionPath), mainExe);
                if (compileMain.exitCode != 0) {
                    submission.setStatus(SubmissionStatus.RUNTIME_ERROR);
                    submission.setErrorMessage("Main solution compilation failed — contact problem author");
                    submission.setScore(0);
                    return submissionRepository.save(submission);
                }
                
                // Compile candidate (user submission)
                Path candExe = workDir.resolve("candidate" + exeSuffix);
                CppExecutor.RunResult compileCand = cppExecutor.compileSource(
                        Path.of(submissionFilePath), candExe);
                if (compileCand.exitCode != 0) {
                    submission.setStatus(SubmissionStatus.COMPILATION_ERROR);
                    String errMsg = compileCand.stderr;
                    if (errMsg != null && errMsg.length() > 900) {
                        errMsg = errMsg.substring(0, 900) + "... (truncated)";
                    }
                    submission.setErrorMessage(errMsg);
                    submission.setScore(0);
                    return submissionRepository.save(submission);
                }
                
                // ─── Run on all test inputs using pre-compiled exes ────
                List<JudgeVerdict> verdicts = new ArrayList<>();
                
                // Generator-based tests
                List<GeneratorFile> generatorFiles = generatorFileRepository.findByProblemId(problem.getId());
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

                    if (verdict.status != SubmissionStatus.ACCEPTED) {
                        submission.setStatus(verdict.status);
                        submission.setErrorMessage(verdict.message);
                        submission.setScore(0);
                        return submissionRepository.save(submission);
                    }
                }
                
                // Static test files — use pre-compiled exes (no recompilation)
                List<TestFile> testFiles = testFileRepository.findByProblemId(problem.getId());
                for (TestFile test : testFiles) {
                    JudgeVerdict verdict = cppExecutor.judgeWithPrecompiledExes(
                            mainExe,
                            candExe,
                            Path.of(test.getFilePath()),
                            timeLimitMs,
                            memoryLimitKB
                    );
                    verdicts.add(verdict);
                    
                    executionTime = Math.max(executionTime, verdict.timeUsedMillis);
                    memoryUsed = Math.max(memoryUsed, verdict.memoryUsedKB);
                    submission.setExecutionTime(executionTime);
                    submission.setMemoryUsed(memoryUsed);

                    if (verdict.status != SubmissionStatus.ACCEPTED) {
                        submission.setStatus(verdict.status);
                        submission.setErrorMessage(verdict.message);
                        submission.setScore(0);
                        return submissionRepository.save(submission);
                    }
                }
                
                // If no tests were run at all, it's a configuration error
                if (verdicts.isEmpty()) {
                    submission.setStatus(SubmissionStatus.RUNTIME_ERROR);
                    submission.setErrorMessage("No test cases configured for this problem");
                    submission.setScore(0);
                    return submissionRepository.save(submission);
                }

                submission.setStatus(SubmissionStatus.ACCEPTED);
                submission.setErrorMessage(null);
                submission.setScore(100);
                
                return submissionRepository.save(submission);
            } finally {
                // Clean up the batch compilation directory
                deleteDirQuietly(workDir);
            }
        } catch (Exception e) {
            System.out.println(e);
            // Handle any exceptions
            submission.setStatus(SubmissionStatus.RUNTIME_ERROR);
            submission.setErrorMessage("Error during judging: " + e.getMessage());
            return submissionRepository.save(submission);
        }
    }

    /** Best-effort recursive delete of a temp directory. */
    private static void deleteDirQuietly(Path dir) {
        if (dir == null) return;
        try {
            Files.walkFileTree(dir, new SimpleFileVisitor<>() {
                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs)
                        throws IOException {
                    Files.deleteIfExists(file);
                    return FileVisitResult.CONTINUE;
                }
                @Override
                public FileVisitResult postVisitDirectory(Path d, IOException exc)
                        throws IOException {
                    Files.deleteIfExists(d);
                    return FileVisitResult.CONTINUE;
                }
            });
        } catch (IOException ignored) {}
    }

}
