package com.Judge_Mental.XorOJ.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Judge_Mental.XorOJ.repo.ContestRepository;
<<<<<<< HEAD
import com.Judge_Mental.XorOJ.model.Contest;
=======
import com.Judge_Mental.XorOJ.util.Pair;
>>>>>>> 7f03888a (contest creation)


@Service
public class ContestService {

    @Autowired
    private ContestRepository contestRepo;
    
    @Autowired
    private ProblemService problemService;

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
    
    public LocalDateTime getContestEndTime(Long contestId) {
        Contest contest = contestRepo.findById(contestId).orElse(null);
        if (contest != null) {
            return contest.getEndTime();
        }
        return null;
    }
<<<<<<< HEAD
=======


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
>>>>>>> 7f03888a (contest creation)
}
