package com.Judge_Mental.XorOJ.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.Judge_Mental.XorOJ.entity.TestFile;
import com.Judge_Mental.XorOJ.entity.Problem;
import com.Judge_Mental.XorOJ.repo.TestFileRepository;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class TestFileService {
    
    @Autowired
    private TestFileRepository testFileRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private ProblemService problemService;
    
    public List<TestFile> getTestFiles(Long problemId) {
        return testFileRepository.findByProblemId(problemId);
    }
    
    public TestFile createTestFile(Long problemId, Long userId, int testId, MultipartFile file) throws IOException {
        // Check if user has access to the problem
        if (!problemService.authorHaveAccess(userId, problemId)) {
            System.out.println("User does not have access to problem: " + problemId);
            throw new RuntimeException("User does not have access to this problem");
        }
        
        // Check if problem exists
        Problem problem = problemService.findProblemById(problemId);

        if(problem == null) {
            System.out.println("Problem not found");
            throw new RuntimeException("Problem not found");
        }

        // Check if test file with same ID already exists
        if (testFileRepository.existsByProblemIdAndTestId(problemId, testId)) {
            System.out.println("Test file with ID " + testId + " already exists");
            throw new RuntimeException("Test file with this ID already exists");
        }
        
        // Store the file
        String directory = "problems/" + problemId + "/tests";
        String fileName = testId + "_" + file.getOriginalFilename();
        String filePath = fileStorageService.storeFile(file, directory, fileName);

        System.out.println("Stored file at: " + filePath);
        // Create and save test file entity
        TestFile testFile = new TestFile();
        TestFile.TestFileId id = new TestFile.TestFileId(problemId, testId);
        testFile.setId(id);
        testFile.setFileName(file.getOriginalFilename());
        testFile.setFilePath(filePath);
        testFile.setProblem(problem);

        System.out.println("Created test file: " + testFile.getFileName());

        return testFileRepository.save(testFile);
    }
    
    public boolean deleteTestFile(Long problemId, Long userId, int testId) {
        // Check if user has access to the problem
        if (!problemService.authorHaveAccess(userId, problemId)) {
            System.out.println("User does not have access to problem: " + problemId);
            return false;
        }
        
        // Create the composite key
        TestFile.TestFileId id = new TestFile.TestFileId(problemId, testId);
        
        // Get the test file
        Optional<TestFile> testFileOpt = testFileRepository.findById(id);
        System.out.println("Found test file: " + testFileOpt.isPresent());

        if (testFileOpt.isEmpty()) {
            System.out.println("Test file not found: " + testId);
            return false;
        }
        System.out.println("Deleting test file: " + testId);
        // Delete the test file
        testFileRepository.deleteById(id);

        // Also delete the physical file if needed
        String filePath = testFileOpt.get().getFilePath();
        fileStorageService.deleteFile(filePath);

        return true;
    }
}
