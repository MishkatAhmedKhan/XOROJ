package com.Judge_Mental.XorOJ.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.Judge_Mental.XorOJ.entity.GeneratorFile;
import com.Judge_Mental.XorOJ.entity.Problem;
import com.Judge_Mental.XorOJ.repo.GeneratorFileRepository;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class GeneratorService {
    
    @Autowired
    private GeneratorFileRepository generatorFileRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private ProblemService problemService;
    
    public List<GeneratorFile> getGeneratorFiles(Long problemId) {
        return generatorFileRepository.findByProblemId(problemId);
    }
    
    public GeneratorFile createGeneratorFile(Long problemId, Long userId, int generatorId, MultipartFile file) throws IOException {
        // Check if user has access to the problem
        if (!problemService.authorHaveAccess(userId, problemId)) {
            // System.out.println("User does not have access to problem: " + problemId);
            throw new RuntimeException("User does not have access to this problem");
        }
        
        // Check if problem exists
        Problem problem = problemService.findProblemById(problemId);

        if(problem == null) {
            // System.out.println("Problem not found");
            throw new RuntimeException("Problem not found");
        }

        // Check if generator with same ID already exists
        if (generatorFileRepository.existsByProblemIdAndGeneratorId(problemId, generatorId)) {
            // System.out.println("Generator with ID " + generatorId + " already exists");
            throw new RuntimeException("Generator with this ID already exists");
        }
        
        // Store the file
        String directory = "problems/" + problemId + "/generators";
        String fileName = generatorId + "_" + file.getOriginalFilename();
        String filePath = fileStorageService.storeFile(file, directory, fileName);

        // System.out.println("Stored file at: " + filePath);
        // Create and save generator file entity
        GeneratorFile generatorFile = new GeneratorFile();
        GeneratorFile.GeneratorFileId id = new GeneratorFile.GeneratorFileId(problemId, generatorId);
        generatorFile.setId(id);
        generatorFile.setFileName(file.getOriginalFilename());
        generatorFile.setFilePath(filePath);
        generatorFile.setProblem(problem);

        // System.out.println("Created generator file: " + generatorFile.getFileName());

        return generatorFileRepository.save(generatorFile);
    }
    
    public boolean deleteGeneratorFile(Long problemId, Long userId, int generatorId) {
        // Check if user has access to the problem
        if (!problemService.authorHaveAccess(userId, problemId)) {
            // System.out.println("User does not have access to problem: " + problemId);
            return false;
        }
        
        // Create the composite key
        GeneratorFile.GeneratorFileId id = new GeneratorFile.GeneratorFileId(problemId, generatorId);
        
        // Get the generator file
        Optional<GeneratorFile> generatorFileOpt = generatorFileRepository.findById(id);
        // System.out.println("Found generator file: " + generatorFileOpt.isPresent());

        if (generatorFileOpt.isEmpty()) {
            // System.out.println("Generator file not found: " + generatorId);
            return false;
        }
        // System.out.println("Deleting generator file: " + generatorId);
        // Delete the generator file
        generatorFileRepository.deleteById(id);

        // Also delete the physical file if needed
        String filePath = generatorFileOpt.get().getFilePath();
        fileStorageService.deleteFile(filePath);

        return true;
    }
}
