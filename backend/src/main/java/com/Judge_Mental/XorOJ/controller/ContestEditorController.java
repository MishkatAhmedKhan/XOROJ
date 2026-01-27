package com.Judge_Mental.XorOJ.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Judge_Mental.XorOJ.service.ContestService;
import com.Judge_Mental.XorOJ.util.Pair;


@RestController
@RequestMapping("/api/edit/contests/{contestId}")
public class ContestEditorController {

    @Autowired
    ContestService contestService;

    public record ContestUpdateRequest(String title, String description, LocalDateTime startTime, LocalDateTime endTime) {}
    @PostMapping("/generalinfo")
    public ResponseEntity<Boolean> updateGeneralInfo(@PathVariable Long contestId, @RequestBody ContestUpdateRequest request) {
        System.out.println(request);
        boolean updated = contestService.updateContestGeneralInfo(contestId, request.title(), request.description(), request.startTime(), request.endTime());

        return updated ? ResponseEntity.ok(true) : ResponseEntity.badRequest().body(false);
    }

    @PostMapping("/problems")
    public ResponseEntity<Boolean> updateProblem(@PathVariable Long contestId, @RequestBody List<Pair<Long, Integer>> request) {

        boolean updated = contestService.updateContestProblems(contestId, request);

        return updated ? ResponseEntity.ok(true) : ResponseEntity.badRequest().body(false);
    }
}
