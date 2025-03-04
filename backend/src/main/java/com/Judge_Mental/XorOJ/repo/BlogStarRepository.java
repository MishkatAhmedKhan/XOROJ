package com.Judge_Mental.XorOJ.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Judge_Mental.XorOJ.entity.BlogStar;

@Repository
public interface BlogStarRepository extends JpaRepository<BlogStar, Long> {
    Optional<BlogStar> findByUserIdAndBlogPostId(Long userId, Long blogPostId);
    boolean existsByUserIdAndBlogPostId(Long userId, Long blogPostId);
}
