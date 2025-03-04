package com.Judge_Mental.XorOJ.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Tracks which users have voted on which blog posts / comments,
 * and the direction of the vote (+1 or -1).
 * Prevents double-voting.
 */
@Entity
@Table(name = "blog_votes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"userId", "targetType", "targetId"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlogVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    /** "post" or "comment" */
    @Column(nullable = false)
    private String targetType;

    @Column(nullable = false)
    private Long targetId;

    /** +1 for upvote, -1 for downvote */
    @Column(nullable = false)
    private int value;
}
