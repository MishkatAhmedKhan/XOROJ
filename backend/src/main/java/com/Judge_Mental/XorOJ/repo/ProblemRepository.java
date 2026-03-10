package com.Judge_Mental.XorOJ.repo;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
        WHERE (p.published = true OR p.id IN (SELECT cp.problem_id FROM contest_problems cp))
        """, nativeQuery = true)
    List<ProblemViewDTO> findAllProblemsAsView();

    // Check if a problem is used in any contest
    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END FROM contest_problems WHERE problem_id = :problemId", nativeQuery = true)
    boolean existsInAnyContest(@Param("problemId") Long problemId);

    // Paginated + filtered query for problemset page
    @Query(value = """
        SELECT DISTINCT p.* FROM problems p
        LEFT JOIN problem_tags pt ON pt.problem_id = p.id
        WHERE (p.published = true OR p.id IN (SELECT cp.problem_id FROM contest_problems cp))
          AND (:minRating IS NULL OR p.difficulty_rating >= :minRating)
          AND (:maxRating IS NULL OR p.difficulty_rating <= :maxRating)
          AND (:tag IS NULL OR :tag = '' OR LOWER(pt.tags) LIKE LOWER(CONCAT('%', :tag, '%')))
        ORDER BY p.id
        """,
        countQuery = """
        SELECT COUNT(DISTINCT p.id) FROM problems p
        LEFT JOIN problem_tags pt ON pt.problem_id = p.id
        WHERE (p.published = true OR p.id IN (SELECT cp.problem_id FROM contest_problems cp))
          AND (:minRating IS NULL OR p.difficulty_rating >= :minRating)
          AND (:maxRating IS NULL OR p.difficulty_rating <= :maxRating)
          AND (:tag IS NULL OR :tag = '' OR LOWER(pt.tags) LIKE LOWER(CONCAT('%', :tag, '%')))
        """,
        nativeQuery = true)
    Page<Problem> findFilteredProblems(
        Pageable pageable,
        @Param("minRating") Integer minRating,
        @Param("maxRating") Integer maxRating,
        @Param("tag") String tag
    );

}
