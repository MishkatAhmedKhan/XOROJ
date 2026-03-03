package com.Judge_Mental.XorOJ.repo;

import com.Judge_Mental.XorOJ.entity.Contest;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ContestReadRepository extends JpaRepository<Contest, Long> {

    interface Times {
        LocalDateTime getStartTime();
        LocalDateTime getEndTime();
        Contest.ContestStatus getStatus();
    }

    @Query("""
      select c.startTime as startTime, c.endTime as endTime, c.status as status
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
}
