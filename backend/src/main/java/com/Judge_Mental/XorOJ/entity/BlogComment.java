package com.Judge_Mental.XorOJ.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "blog_comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlogComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_post_id", nullable = false)
    @JsonIgnore
    private BlogPost blogPost;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private Long authorId;

    @Column(nullable = false)
    private String authorUsername;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int upvotes;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int downvotes;

    /** Self-referencing for nested replies (null = top-level comment) */
    private Long parentCommentId;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
