package com.Judge_Mental.XorOJ.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Judge_Mental.XorOJ.model.Problem;
import com.Judge_Mental.XorOJ.repo.ProblemRepository;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {
    
    @Autowired
    private ProblemRepository repository;

    @GetMapping
    public ResponseEntity<List<Problem>> getAllProblems() {
        List<Problem> problems = repository.findAll();
        return ResponseEntity.ok(problems);
    }

    @GetMapping("{id}")
    public ResponseEntity<Problem> getProblemById(@PathVariable Long id) {
        Optional<Problem> pdata = repository.findProblemById(id);
        
        if (pdata.isPresent()) {
            Problem problem = pdata.get();

            return ResponseEntity.ok(problem);  
        } else {
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);  
        }
    }
}

