package com.Judge_Mental.XorOJ.repo;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.Judge_Mental.XorOJ.dto.ProblemViewDTO;
import com.Judge_Mental.XorOJ.entity.Problem;
import com.Judge_Mental.XorOJ.entity.ProblemContributor;


@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    Optional<Problem> findProblemById(Long id);
    List<Problem> findProblemsByTagsContaining(String tags);
    List<Problem> findProblemsByDifficultyRatingBetween(Integer minRating, Integer maxRating);
    
    Problem findProblemByIdAndAuthorId(Long id, Long authorId);
    Set<ProblemContributor> findContributorsById(Long id);

    @Query(value = """
        SELECT p.id,
            p.title,
            p.difficulty_rating,
            p.solve_count,
            p.time_limit,
            p.memory_limit
        FROM Problems p
        WHERE p.author_id = :authorId
        """, nativeQuery = true)
    List<ProblemViewDTO> findProblemsAsViewByAuthorId(Long authorId);

    @Query(value = """
        SELECT p.id,
            p.title,
            p.difficulty_rating,
            p.solve_count,
            p.time_limit,
            p.memory_limit
        FROM problems p
        WHERE p.status = 'public'
        """, nativeQuery = true)
    List<ProblemViewDTO> findAllProblemsAsView();

}
