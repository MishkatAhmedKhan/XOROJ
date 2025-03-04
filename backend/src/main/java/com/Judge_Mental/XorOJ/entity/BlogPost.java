package com.Judge_Mental.XorOJ.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "blog_posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlogPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

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

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int stars;

    @ElementCollection
    @CollectionTable(name = "blog_post_tags", joinColumns = @JoinColumn(name = "blog_post_id"))
    private List<String> tags;

    @OneToMany(mappedBy = "blogPost", cascade = CascadeType.REMOVE, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<BlogComment> comments;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
