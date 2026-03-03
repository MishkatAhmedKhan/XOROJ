package com.Judge_Mental.XorOJ.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Judge_Mental.XorOJ.dto.ProblemViewDTO;
import com.Judge_Mental.XorOJ.entity.Problem;
import com.Judge_Mental.XorOJ.entity.XUser;
import com.Judge_Mental.XorOJ.service.ProblemService;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    @Autowired
    private ProblemService problemService;

    @GetMapping
    public ResponseEntity<List<ProblemViewDTO>> findAllProblems() {
        List<ProblemViewDTO> problems = problemService.findAllProblemsAsView();
        return ResponseEntity.ok(problems);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Problem> getProblemById(
        @PathVariable Long id, 
        @AuthenticationPrincipal(expression = "user") XUser user) {
        Problem problem = problemService.findProblemById(id);

        if (problem != null) {
            return ResponseEntity.ok(problem);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
}