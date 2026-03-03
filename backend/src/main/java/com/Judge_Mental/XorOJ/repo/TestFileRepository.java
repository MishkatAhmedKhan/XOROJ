package com.Judge_Mental.XorOJ.repo;

import com.Judge_Mental.XorOJ.entity.TestFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestFileRepository extends JpaRepository<TestFile, TestFile.TestFileId> {
    // Find all test files for a problem
    @Query("SELECT t FROM TestFile t WHERE t.id.problemId = :problemId")
    List<TestFile> findByProblemId(@Param("problemId") Long problemId);
    
    // Check if a test file exists
    default boolean existsByProblemIdAndTestId(Long problemId, Integer testId) {
        return findById(new TestFile.TestFileId(problemId, testId)).isPresent();
    }
}
