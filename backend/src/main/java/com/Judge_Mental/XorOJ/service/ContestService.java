package com.Judge_Mental.XorOJ.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Judge_Mental.XorOJ.repo.ContestRepository;
import com.Judge_Mental.XorOJ.model.Contest;


@Service
public class ContestService {

    @Autowired
    private ContestRepository contestRepo;

    public List<Contest> getAllContests() {
        return contestRepo.findAll();
    }

    public Contest findById(Long id) {
        return contestRepo.findById(id).orElse(null);
    }

    public void registerUserForContest(Long contestId, com.Judge_Mental.XorOJ.model.XUser user) {
        Contest contest = findById(contestId);
        if (contest != null) {
            contest.getParticipants().add(user);
            contestRepo.save(contest);
        }
    }
}
