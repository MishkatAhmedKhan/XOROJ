package com.Judge_Mental.XorOJ.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Judge_Mental.XorOJ.entity.BlogComment;

@Repository
public interface BlogCommentRepository extends JpaRepository<BlogComment, Long> {
    List<BlogComment> findByBlogPostIdOrderByCreatedAtAsc(Long blogPostId);
}
