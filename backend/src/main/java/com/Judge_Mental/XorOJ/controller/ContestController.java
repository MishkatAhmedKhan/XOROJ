package com.Judge_Mental.XorOJ.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Judge_Mental.XorOJ.dto.ContestResponseDTO;
import com.Judge_Mental.XorOJ.entity.Contest;
import com.Judge_Mental.XorOJ.entity.XUser;
import com.Judge_Mental.XorOJ.service.ContestService;

@RestController
@RequestMapping("/api/contests")
public class ContestController {

    @Autowired
    private ContestService contestService;

    @GetMapping
    public List<ContestResponseDTO> getAllContests(
        @AuthenticationPrincipal(expression = "user") XUser user) {

        List<Contest> contests = contestService.getAllContests();
        return contests.stream()
            .map(c -> ContestResponseDTO.fromContest(c, user != null ? user.getId() : null, c.getParticipants().contains(user)))
            .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ContestResponseDTO getContestById(
        @PathVariable Long id,
        @AuthenticationPrincipal(expression = "user") XUser user) {
    
        Contest contest = contestService.findById(id);
        boolean registered = contest.getParticipants().contains(user);
        System.out.println(registered);
        return ContestResponseDTO.fromContest(contest, user != null ? user.getId() : null, registered);
    }

    @GetMapping("/{id}/details")
    public Contest getContestDetails(
        @PathVariable Long id,
        @AuthenticationPrincipal(expression = "user") XUser user) {

        Contest contest = contestService.findById(id);
        return contest;
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<Boolean> registerForContest(
        @PathVariable Long id,
        @AuthenticationPrincipal(expression = "user") XUser user) {

        if (user == null) throw new IllegalStateException("User must be authenticated to register for a contest");
        boolean success = contestService.registerUserForContest(id, user);
        return ResponseEntity.ok(success);
    }
}