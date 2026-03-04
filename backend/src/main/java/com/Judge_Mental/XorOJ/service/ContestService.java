package com.Judge_Mental.XorOJ.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Judge_Mental.XorOJ.dto.ContestResponseDTO;
import com.Judge_Mental.XorOJ.entity.Contest;
import com.Judge_Mental.XorOJ.entity.Problem;
import com.Judge_Mental.XorOJ.repo.ContestRepository;
import com.Judge_Mental.XorOJ.util.Pair;


@Service
public class ContestService {

    @Autowired
    private ContestRepository contestRepo;
    
    @Autowired
    private ProblemService problemService;

    public Contest createContest(Long userId) {
        Contest contest = new Contest();
        contest.setAuthorId(userId);
        return contestRepo.save(contest);
    }

    public List<Contest> getAllContests() {
        return contestRepo.findAll();
    }

    public Contest findById(Long id) {
        Contest contest = contestRepo.findById(id).orElse(null);
        return contest;
    }

    public boolean registerUserForContest(Long contestId, com.Judge_Mental.XorOJ.entity.XUser user) {
        Contest contest = findById(contestId);
        if (contest != null) {
            contest.getParticipants().add(user);
            contestRepo.save(contest);
            return true;
        }
        return false;
    }

    public List<Contest> findContestsByAuthorId(Long authorId) {
        return contestRepo.findContestsByAuthorId(authorId);
    }
    
    public LocalDateTime getContestEndTime(Long contestId) {
        Contest contest = contestRepo.findById(contestId).orElse(null);
        if (contest != null) {
            return contest.getEndTime();
        }
        return null;
    }


    //Edit

    public boolean updateContestGeneralInfo(Long contestId, String title, String description, LocalDateTime startTime, LocalDateTime endTime) {
        Contest contest = findById(contestId);
        System.out.println("Updating contest: " + contestId);
        if (contest != null) {
            contest.setTitle(title);
            contest.setDescription(description);
            contest.setStartTime(startTime);
            contest.setEndTime(endTime);
            contest.setDuration((int) ChronoUnit.MINUTES.between(startTime, endTime));
            contestRepo.save(contest);
            return true;
        }
        return false;
    }

    public boolean updateContestProblems(Long contestId, List<Pair<Long, Integer>> requests) {
        Contest contest = findById(contestId);
        if (contest != null) {
            Set<Problem> newProblemSet = new HashSet<>();
            
            // Fetch and add each problem in the order specified by the requests list
            for (Pair<Long, Integer> request : requests) {
                Long problemId = request.getFirst();
                Integer problemNum = request.getSecond();
                
                Problem problem = problemService.findProblemById(problemId);
                if (problem != null) {
                    problem.setProblemNum(problemNum);
                    newProblemSet.add(problem);
                }
            }
            
            // Replace all problems with the new set
            contest.getProblems().clear();
            contest.getProblems().addAll(newProblemSet);
            
            contestRepo.save(contest);
            return true;
        }
        return false;
    }

    public List<ContestResponseDTO> findContestsDTOByUserId(Long userId) {
        return contestRepo.findContestsDTOByUserId(userId);
    }
}
