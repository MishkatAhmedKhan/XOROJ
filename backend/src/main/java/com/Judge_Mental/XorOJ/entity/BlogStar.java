package com.Judge_Mental.XorOJ.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Tracks which users have starred (bookmarked/favorited) which blog posts.
 */
@Entity
@Table(name = "blog_stars", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"userId", "blogPostId"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlogStar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long blogPostId;
}
