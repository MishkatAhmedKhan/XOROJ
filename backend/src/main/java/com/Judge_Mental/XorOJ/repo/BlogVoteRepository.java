package com.Judge_Mental.XorOJ.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Judge_Mental.XorOJ.entity.BlogVote;

@Repository
public interface BlogVoteRepository extends JpaRepository<BlogVote, Long> {
    Optional<BlogVote> findByUserIdAndTargetTypeAndTargetId(Long userId, String targetType, Long targetId);
}
