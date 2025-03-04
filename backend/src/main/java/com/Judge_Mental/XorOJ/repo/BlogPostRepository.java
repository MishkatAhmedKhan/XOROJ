package com.Judge_Mental.XorOJ.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Judge_Mental.XorOJ.entity.BlogPost;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    List<BlogPost> findAllByOrderByCreatedAtDesc();
    List<BlogPost> findByAuthorIdOrderByCreatedAtDesc(Long authorId);
    List<BlogPost> findByTagsContainingOrderByCreatedAtDesc(String tag);
}
