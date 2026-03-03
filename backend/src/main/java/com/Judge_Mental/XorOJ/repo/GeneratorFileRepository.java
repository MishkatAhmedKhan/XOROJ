package com.Judge_Mental.XorOJ.repo;

import com.Judge_Mental.XorOJ.entity.GeneratorFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GeneratorFileRepository extends JpaRepository<GeneratorFile, GeneratorFile.GeneratorFileId> {
    // Find all generator files for a problem
    @Query("SELECT g FROM GeneratorFile g WHERE g.id.problemId = :problemId")
    List<GeneratorFile> findByProblemId(@Param("problemId") Long problemId);
    
    // Check if a generator file exists
    default boolean existsByProblemIdAndGeneratorId(Long problemId, Integer generatorId) {
        return findById(new GeneratorFile.GeneratorFileId(problemId, generatorId)).isPresent();
    }
}
