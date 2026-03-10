package com.Judge_Mental.XorOJ.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    /**
     * Find a problem by ID for public users.
     * Returns the problem only if it is published or used in a contest.
     */
    public Problem findProblemById(Long id) {
        Problem problem = problemRepo.findProblemById(id).orElse(null);
        if (problem == null) {
            return null;
        }
        // Allow access if published OR in any contest
        if (problem.isPublished() || problemRepo.existsInAnyContest(id)) {
            return problem;
        }
        return null;
    }

    /**
     * Find problem by ID without visibility filtering.
     * Used by internal services (test files, generators, contest editor) that need access regardless of status.
     */
    public Problem findProblemByIdUnfiltered(Long id) {
        return problemRepo.findProblemById(id).orElse(null);
    }

    public List<Problem> findProblemsByDifficultyRating(Integer minRating, Integer maxRating) {
        if (minRating == null) minRating = 800;
        if (maxRating == null) maxRating = 4000;

        return problemRepo.findProblemsByDifficultyRatingBetween(minRating, maxRating);
    }

    public List<ProblemViewDTO> findAllProblemsAsView() {
        return problemRepo.findAllProblemsAsView();
    }

    /**
     * Find problems with pagination and server-side filtering.
     */
    public Map<String, Object> findProblemsFiltered(int page, int size, Integer minRating, Integer maxRating, String tag) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Problem> problemPage = problemRepo.findFilteredProblems(pageable, minRating, maxRating, tag);

        List<Map<String, Object>> content = problemPage.getContent().stream().map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", p.getId());
            m.put("title", p.getTitle());
            m.put("difficultyRating", p.getDifficultyRating());
            m.put("solveCount", p.getSolveCount());
            m.put("timeLimit", p.getTimeLimit());
            m.put("memoryLimit", p.getMemoryLimit());
            m.put("tags", p.getTags());
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("content", content);
        result.put("totalPages", problemPage.getTotalPages());
        result.put("totalElements", problemPage.getTotalElements());
        result.put("currentPage", problemPage.getNumber());
        return result;
    }

    public List<ProblemViewDTO> findProblemsAsViewByAuthorId(Long authorId) {
        return problemRepo.findProblemsAsViewByAuthorId(authorId);
    }

    public Problem findProblemByIdAndAuthorId(Long id, Long authorId) {
        return problemRepo.findProblemByIdAndAuthorId(id, authorId);
    }

    public Problem createProblem(Problem problem, Long authorId) {
        problem.setAuthorId(authorId);
        problem.setPublished(false);
        Problem savedProblem = problemRepo.save(problem);
        
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

    public List<ContestResponseDTO> getContestsByProblemId(Long problemId) {
        return contestRepo.findContestsByProblemId(problemId);
    }

    // ---- Publish/Unpublish ----

    public boolean isPublishable(Long problemId) {
        return !problemRepo.existsInAnyContest(problemId);
    }

    public boolean publishProblem(Long problemId, Long userId) {
        Problem problem = problemRepo.findProblemById(problemId).orElse(null);
        if (problem == null || !authorHaveAccess(userId, problemId)) {
            return false;
        }
        if (problemRepo.existsInAnyContest(problemId)) {
            return false;
        }
        problem.setPublished(true);
        problemRepo.save(problem);
        return true;
    }

    public boolean unpublishProblem(Long problemId, Long userId) {
        Problem problem = problemRepo.findProblemById(problemId).orElse(null);
        if (problem == null || !authorHaveAccess(userId, problemId)) {
            return false;
        }
        problem.setPublished(false);
        problemRepo.save(problem);
        return true;
    }

    public Map<String, Object> getPublishStatus(Long problemId) {
        Problem problem = problemRepo.findProblemById(problemId).orElse(null);
        if (problem == null) return null;
        
        Map<String, Object> status = new HashMap<>();
        status.put("published", problem.isPublished());
        status.put("inContest", problemRepo.existsInAnyContest(problemId));
        status.put("publishable", !problemRepo.existsInAnyContest(problemId));
        return status;
    }

    // ---- Edit page ----

    public boolean authorHaveAccess(Long userId, Long problemId) {
        return problemContributorRepo.existsByProblemIdAndUserId(problemId, userId);
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
        if (problem == null || !authorHaveAccess(userId, problemId)) {
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
