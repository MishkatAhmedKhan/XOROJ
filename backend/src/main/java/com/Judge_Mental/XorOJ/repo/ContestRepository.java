package com.Judge_Mental.XorOJ.repo;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.Judge_Mental.XorOJ.dto.ContestResponseDTO;
import com.Judge_Mental.XorOJ.entity.Contest;

@Repository
public interface ContestRepository extends JpaRepository<Contest, Long> {
    public Contest findContestById(Long id);
    interface Times {
        LocalDateTime getStartTime();
        LocalDateTime getEndTime();
        // Status is now calculated dynamically
    }

    @Query("""
      select c.startTime as startTime, c.endTime as endTime
      from Contest c where c.id = :id
    """)
    Times getTimes(@Param("id") Long contestId);

    @Query("""
      select p.id
      from Contest c join c.problems p
      where c.id = :id
      order by p.id
    """)
    List<Long> findProblemIds(@Param("id") Long contestId);

    List<Contest> findContestsByAuthorId(Long authorId);

    @Query("""
      select new com.Judge_Mental.XorOJ.dto.ContestResponseDTO(
        c.id, c.title, c.description, c.startTime, c.endTime, 
        CASE 
          WHEN CURRENT_TIMESTAMP < c.startTime THEN com.Judge_Mental.XorOJ.entity.Contest.ContestStatus.UPCOMING 
          WHEN CURRENT_TIMESTAMP > c.endTime THEN com.Judge_Mental.XorOJ.entity.Contest.ContestStatus.ENDED 
          ELSE com.Judge_Mental.XorOJ.entity.Contest.ContestStatus.RUNNING 
        END, 
        c.duration, false
      )
      from Contest c join c.problems p where p.id = :problemId
    """)
    ContestResponseDTO findContestByProblemId(@Param("problemId") Long problemId);
    
    /**
     * Find all contests a user has participated in
     * @param userId ID of the user
     * @return List of ContestResponseDTO objects representing the contests
     */
    @Query("""
      select new com.Judge_Mental.XorOJ.dto.ContestResponseDTO(
        c.id, c.title, c.description, c.startTime, c.endTime, 
        CASE 
          WHEN CURRENT_TIMESTAMP < c.startTime THEN com.Judge_Mental.XorOJ.entity.Contest.ContestStatus.UPCOMING 
          WHEN CURRENT_TIMESTAMP > c.endTime THEN com.Judge_Mental.XorOJ.entity.Contest.ContestStatus.ENDED 
          ELSE com.Judge_Mental.XorOJ.entity.Contest.ContestStatus.RUNNING 
        END, 
        c.duration, true
      )
      from Contest c join c.participants cp where cp.id = :userId
      order by c.startTime desc
    """)
    List<ContestResponseDTO> findContestsDTOByUserId(@Param("userId") Long userId);

}
