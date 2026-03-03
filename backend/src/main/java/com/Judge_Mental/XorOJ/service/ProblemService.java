package com.Judge_Mental.XorOJ.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.Judge_Mental.XorOJ.dto.ContestResponseDTO;
import com.Judge_Mental.XorOJ.dto.ProblemViewDTO;
import com.Judge_Mental.XorOJ.entity.Problem;
import com.Judge_Mental.XorOJ.entity.ProblemContributor;
import com.Judge_Mental.XorOJ.repo.ContestRepository;
import com.Judge_Mental.XorOJ.repo.ProblemContributorRepository;
import com.Judge_Mental.XorOJ.repo.ProblemRepository;
import com.Judge_Mental.XorOJ.repo.XUserRepository;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProblemService {
    @Autowired
    private XUserRepository xuserRepo;

    @Autowired
    private ContestRepository contestRepo;

    @Autowired
    private ProblemRepository problemRepo;

    @Autowired
    private ProblemContributorRepository problemContributorRepo;

    @Autowired
    private FileStorageService fileStorageService;

    public Problem findProblemById(Long id) {
        Problem problem = problemRepo.findProblemById(id).orElse(null);
        if(problem == null){
            return null;
        }
        ContestResponseDTO contest = contestRepo.findContestByProblemId(id);
        if(contest != null && !contest.getStartTime().isBefore(LocalDateTime.now())) {
            return null;
        }
        return problem;
    }

    public List<Problem> findProblemsByDifficultyRating(Integer minRating, Integer maxRating) {
        if (minRating == null) minRating = 800;
        if (maxRating == null) maxRating = 4000;

        return problemRepo.findProblemsByDifficultyRatingBetween(minRating, maxRating);
    }
    public List<ProblemViewDTO> findAllProblemsAsView() {
        var p = problemRepo.findAllProblemsAsView();
        System.out.println(p);
        return p;
    }
    public List<ProblemViewDTO> findProblemsAsViewByAuthorId(Long authorId) {
        return problemRepo.findProblemsAsViewByAuthorId(authorId);
    }
    public Problem findProblemByIdAndAuthorId(Long id, Long authorId) {
        return problemRepo.findProblemByIdAndAuthorId(id, authorId);
    }
    public Problem createProblem(Problem problem, Long authorId) {
        problem.setAuthorId(authorId);
        // Save the problem first to get the ID
        Problem savedProblem = problemRepo.save(problem);
        
        // Create and save the contributor with the problem entity and user entity
        ProblemContributor contributor = new ProblemContributor(
            savedProblem, 
            xuserRepo.findById(authorId).orElse(null), 
            "Author"
        );
        problemContributorRepo.save(contributor);
        
        return savedProblem;
    }

    public Problem updateProblem(Problem problem) {
        return problemRepo.save(problem);
    }

    public ContestResponseDTO getContestByProblemId(Long problemId) {
        return contestRepo.findContestByProblemId(problemId);
    }

    // Edit page

    public boolean authorHaveAccess(Long userId, Long problemId) {
        boolean exists = problemContributorRepo.existsByProblemIdAndUserId(problemId, userId);
        System.out.println(exists ? true : false);
        return exists;
    }

    public boolean updateProblem(Long problemId, Long userId, String inputFileType, String outputFileType, int timeLimit, int memoryLimit, Integer difficultyRating, List<String> tags) {
        Problem problem = problemRepo.findProblemById(problemId).orElse(null);
        if (problem == null || !authorHaveAccess(userId, problemId)) {
            return false;
        }
        problem.setInputFileType(inputFileType);
        problem.setOutputFileType(outputFileType);
        problem.setTimeLimit(timeLimit);
        problem.setMemoryLimit(memoryLimit);
        problem.setDifficultyRating(difficultyRating);
        problem.setTags(tags);
        problemRepo.save(problem);
        return true;
    }

    public boolean updateProblem(Long userId, Long problemId, String description, String inputFormat, String outputFormat, String notes, String sampleInput, String sampleOutput) {
        Problem problem = problemRepo.findProblemById(problemId).orElse(null);
        // System.out.println(problem);
        // System.out.println(userId);
        // System.out.println(problemId);
        if (problem == null || !authorHaveAccess(userId, problemId)) {
            // System.out.println(p);
            // System.out.println("User does not have access to update this problem.");
            return false;
        }
        problem.setDescription(description);
        problem.setInputFormat(inputFormat);
        problem.setOutputFormat(outputFormat);
        problem.setNotes(notes);
        problem.setSampleInput(sampleInput);
        problem.setSampleOutput(sampleOutput);
        problemRepo.save(problem);
        return true;
    }

    public boolean updateProblem(Long userId, Long problemId, MultipartFile file) throws IOException {
        Problem problem = problemRepo.findProblemById(problemId).orElse(null);
        if (problem == null || !authorHaveAccess(userId, problemId)) {
            return false;
        }
        String directory = "problems/" + problemId + "/mainSolution";

        problem.setMainSolutionPath(fileStorageService.storeFile(file, directory, file.getOriginalFilename()));
        
        return problemRepo.save(problem) != null;
    }
}
