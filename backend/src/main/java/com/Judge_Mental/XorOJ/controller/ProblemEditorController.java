package com.Judge_Mental.XorOJ.controller;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.Judge_Mental.XorOJ.dto.GeneratorFileDTO;
import com.Judge_Mental.XorOJ.dto.TestFileDTO;
import com.Judge_Mental.XorOJ.entity.GeneratorFile;
import com.Judge_Mental.XorOJ.entity.TestFile;
import com.Judge_Mental.XorOJ.entity.XUser;
import com.Judge_Mental.XorOJ.service.GeneratorService;
import com.Judge_Mental.XorOJ.service.ProblemService;
import com.Judge_Mental.XorOJ.service.TestFileService;

@RestController
@RequestMapping("api/edit/problems/{problemId}")
public class ProblemEditorController {
    
    @Autowired
    private ProblemService problemService;

    @Autowired
    private GeneratorService generatorService;
    
    @Autowired
    private TestFileService testFileService;
   


    public record GeneralInfoDTO(String inputFileType, String outputFileType, int timeLimit, int memoryLimit, Long contestId, Integer difficultyRating, List<String> tags) {}

    @PostMapping("/generalinfo")
    public ResponseEntity<Boolean> editProblem(
        @PathVariable Long problemId, 
        @RequestBody GeneralInfoDTO generalInfo,
        @AuthenticationPrincipal(expression = "user") XUser user) {

        System.out.println("Editing general info for problem ID: " + problemId);
        return problemService.updateProblem(problemId, user.getId(), generalInfo.inputFileType, generalInfo.outputFileType, generalInfo.timeLimit, generalInfo.memoryLimit, generalInfo.difficultyRating, generalInfo.tags) ? ResponseEntity.ok(true) : ResponseEntity.status(403).body(false);
    }


    public record StatementDTO(String description, String inputFormat, String outputFormat, String notes, String sampleInput, String sampleOutput) {}

    @PostMapping("/statement")
    public ResponseEntity<Boolean> editProblemStatement(
        @PathVariable Long problemId, 
        @RequestBody StatementDTO statementDTO,
        @AuthenticationPrincipal(expression = "user") XUser user) {

        System.out.println("Editing statement for problem ID: " + statementDTO);
        System.out.println(user);
        return problemService.updateProblem(user.getId(), problemId, statementDTO.description, statementDTO.inputFormat, statementDTO.outputFormat, statementDTO.notes, statementDTO.sampleInput, statementDTO.sampleOutput) ? ResponseEntity.ok(true) : ResponseEntity.status(403).body(false);
    }

    // Generator endpoints
    @GetMapping("/generator")
    public ResponseEntity<List<GeneratorFileDTO>> getGeneratorFiles(
            @PathVariable Long problemId,
            @AuthenticationPrincipal(expression = "user") XUser user) {
        
        if (!problemService.authorHaveAccess(user.getId(), problemId)) {
            return ResponseEntity.status(403).body(null);
        }
        
        List<GeneratorFile> generatorFiles = generatorService.getGeneratorFiles(problemId);
        List<GeneratorFileDTO> dtoList = generatorFiles.stream()
                .map(gf -> new GeneratorFileDTO(gf.getGeneratorId(), gf.getFileName()))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtoList);
    }

    @PostMapping("/generator")
    public ResponseEntity<Boolean> createGeneratorFile(
            @PathVariable Long problemId,
            @RequestParam("id") int generatorId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal(expression = "user") XUser user) {
        
        
        try {
            GeneratorFile generatorFile = generatorService.createGeneratorFile(problemId, user.getId(), generatorId, file);
            System.out.println("2nd");
            GeneratorFileDTO dto = new GeneratorFileDTO(generatorFile.getGeneratorId(), generatorFile.getFileName());
            System.out.println("3nd");
            return ResponseEntity.ok(dto != null);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(null);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/generator/{generatorId}")
    public ResponseEntity<Boolean> deleteGeneratorFile(
            @PathVariable Long problemId,
            @PathVariable int generatorId,
            @AuthenticationPrincipal(expression = "user") XUser user) {

        System.out.println("Deleting generator file: " + generatorId);

        boolean success = generatorService.deleteGeneratorFile(problemId, user.getId(), generatorId);
        return success ? ResponseEntity.ok(true) : ResponseEntity.badRequest().body(false);
    }
    
    // Test file endpoints
    @GetMapping("/testfile")
    public ResponseEntity<List<TestFileDTO>> getTestFiles(
            @PathVariable Long problemId,
            @AuthenticationPrincipal(expression = "user") XUser user) {
        
        if (!problemService.authorHaveAccess(user.getId(), problemId)) {
            return ResponseEntity.status(403).body(null);
        }
        
        List<TestFile> testFiles = testFileService.getTestFiles(problemId);
        List<TestFileDTO> dtoList = testFiles.stream()
                .map(tf -> new TestFileDTO(tf.getTestId(), tf.getFileName()))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtoList);
    }

    @PostMapping("/testfile")
    public ResponseEntity<Boolean> createTestFile(
            @PathVariable Long problemId,
            @RequestParam("id") int testId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal(expression = "user") XUser user) {
        
        try {
            TestFile testFile = testFileService.createTestFile(problemId, user.getId(), testId, file);
            TestFileDTO dto = new TestFileDTO(testFile.getTestId(), testFile.getFileName());
            return ResponseEntity.ok(dto != null);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(null);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/testfile/{testId}")
    public ResponseEntity<Boolean> deleteTestFile(
            @PathVariable Long problemId,
            @PathVariable int testId,
            @AuthenticationPrincipal(expression = "user") XUser user) {

        System.out.println("Deleting test file: " + testId);

        boolean success = testFileService.deleteTestFile(problemId, user.getId(), testId);
        return success ? ResponseEntity.ok(true) : ResponseEntity.badRequest().body(false);
    }

    @PostMapping("/solution")
    public ResponseEntity<Boolean> createMainSolutionFile(
            @PathVariable Long problemId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal(expression = "user") XUser user) {

        try {
            boolean success = problemService.updateProblem(user.getId(), problemId, file);
            return success ? ResponseEntity.ok(true) : ResponseEntity.badRequest().body(false);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(null);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}