package com.Judge_Mental.XorOJ.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Judge_Mental.XorOJ.dto.ProblemViewDTO;
import com.Judge_Mental.XorOJ.entity.Contest;
import com.Judge_Mental.XorOJ.entity.Problem;
import com.Judge_Mental.XorOJ.entity.XUser;
import com.Judge_Mental.XorOJ.service.ContestService;
import com.Judge_Mental.XorOJ.service.ProblemService;

@RestController
@RequestMapping("/api/author")
public class JudgePanelController {

    @Autowired
    private ProblemService problemService;

    @Autowired
    private ContestService contestService;

    @PostMapping("/problems/init")
    public ResponseEntity<Problem> createProblem(
        @RequestBody Problem problem,
        @AuthenticationPrincipal(expression = "user") XUser user
    ) {
        Problem createdProblem = problemService.createProblem(problem, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProblem);
    }

    @GetMapping("/problems/{id}")
    public ResponseEntity<Problem> getProblemById(@PathVariable Long id, @AuthenticationPrincipal(expression = "user") XUser user) {
        Problem problem = problemService.findProblemByIdAndAuthorId(id, user.getId());
        return ResponseEntity.ok(problem);
    }

    @GetMapping("/problems/my")
    public ResponseEntity<List<ProblemViewDTO>> getAllProblemsOfAuthor(
        @AuthenticationPrincipal(expression = "user") XUser user
    ) {
        List<ProblemViewDTO> problems = problemService.findProblemsAsViewByAuthorId(user.getId());
        return ResponseEntity.ok(problems);
    }

    @GetMapping("/contests/my")
    public ResponseEntity<List<Contest>> getAllContestsOfAuthor(
        @AuthenticationPrincipal(expression = "user") XUser user
    ) {
        List<Contest> contests = contestService.findContestsByAuthorId(user.getId());
        return ResponseEntity.ok(contests);
    }


    @PostMapping("/contests/init")
    public ResponseEntity<Contest> createContest(
        @AuthenticationPrincipal(expression = "user") XUser user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contestService.createContest(user.getId()));
    }

}
