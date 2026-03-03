package com.Judge_Mental.XorOJ.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Judge_Mental.XorOJ.entity.ProblemContributor;
import com.Judge_Mental.XorOJ.entity.ProblemContributor.ProblemContributorId;

@Repository
public interface ProblemContributorRepository extends JpaRepository<ProblemContributor, ProblemContributorId> {
    
    // Find all contributors for a specific problem
    List<ProblemContributor> findByProblemId(Long problemId);
    
    // Find all problems a user contributes to
    List<ProblemContributor> findByUserId(Long userId);
    
    // Find contributors by role for a specific problem
    List<ProblemContributor> findByProblemIdAndRole(Long problemId, String role);
    
    // Find all problem contributions for a user with a specific role
    List<ProblemContributor> findByUserIdAndRole(Long userId, String role);
    
    // Check if a user is a contributor to a problem
    boolean existsByProblemIdAndUserId(Long problemId, Long userId);
    
    // Delete all contributors for a problem
    void deleteByProblemId(Long problemId);
}
