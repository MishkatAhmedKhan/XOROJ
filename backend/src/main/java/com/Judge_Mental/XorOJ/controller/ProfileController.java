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

import com.Judge_Mental.XorOJ.dto.ContestResponseDTO;
import com.Judge_Mental.XorOJ.dto.SubmissionResponseDTO;
import com.Judge_Mental.XorOJ.entity.XUser;
import com.Judge_Mental.XorOJ.service.ContestService;
import com.Judge_Mental.XorOJ.service.SubmissionService;
import com.Judge_Mental.XorOJ.service.XUserService;


@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    
    @Autowired
    private XUserService userService;

    @Autowired
    private SubmissionService submissionService;

    @Autowired
    private ContestService contestService;

    public record UserProfileDTO(String username, String email, String firstName, String lastName, String bio, String institute, String country, String contact, Boolean isItMe) {
        public static UserProfileDTO fromEntity(XUser user, Boolean isItMe) {
            return new UserProfileDTO(user.getUsername(), user.getEmail(), user.getFirstName(), user.getLastName(), user.getBio(), user.getInstitute(), user.getCountry(), user.getContact(), isItMe);
        }
    }
    
    @GetMapping("{username}")
    public ResponseEntity<UserProfileDTO> getProfileByUsername(
        @PathVariable String username,
        @AuthenticationPrincipal(expression = "user") XUser authUser
    ) {
        XUser user = userService.findByUsername(username);

        if (user != null) {
            return ResponseEntity.ok(UserProfileDTO.fromEntity(user, user.getUsername().equals(authUser.getUsername())));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/edit")
    public ResponseEntity<UserProfileDTO> createProfile(
        @RequestBody UserProfileDTO userProfileDTO,
        @AuthenticationPrincipal(expression = "user") XUser user
    ) {
        user.setUsername(userProfileDTO.username());
        user.setEmail(userProfileDTO.email());
        user.setFirstName(userProfileDTO.firstName());
        user.setLastName(userProfileDTO.lastName());
        user.setBio(userProfileDTO.bio());
        user.setInstitute(userProfileDTO.institute());
        user.setCountry(userProfileDTO.country());
        user.setContact(userProfileDTO.contact());

        XUser savedUser = userService.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserProfileDTO.fromEntity(savedUser, savedUser.equals(user)));
    }

    @GetMapping("{username}/submissions")
    public ResponseEntity<List<SubmissionResponseDTO>> getUserSubmissions(@PathVariable String username) {
        XUser user = userService.findByUsername(username);

        if (user != null) {
            List<SubmissionResponseDTO> submissions = submissionService.getSubmissionResponsesByUserId(user.getId());
            return ResponseEntity.ok(submissions);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("{username}/contests")
    public ResponseEntity<List<ContestResponseDTO>> getUserContests(@PathVariable String username) {
        XUser user = userService.findByUsername(username);

        if (user != null) {
            List<ContestResponseDTO> contests = contestService.findContestsDTOByUserId(user.getId());
            return ResponseEntity.ok(contests);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
