package com.Judge_Mental.XorOJ.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.Judge_Mental.XorOJ.entity.BlogComment;
import com.Judge_Mental.XorOJ.entity.BlogPost;
import com.Judge_Mental.XorOJ.entity.XUser;
import com.Judge_Mental.XorOJ.service.BlogService;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    @Autowired
    private BlogService blogService;

    // ─── DTOs ──────────────────────────────────────────────────────────

    public record BlogPostRequest(String title, String content, List<String> tags) {}
    public record CommentRequest(String content, Long parentCommentId) {}
    public record VoteRequest(int value) {}

    public record BlogPostSummaryDTO(
        Long id, String title, String authorUsername, Long authorId,
        String createdAt, String updatedAt,
        int upvotes, int downvotes, int stars, int commentCount, List<String> tags
    ) {
        public static BlogPostSummaryDTO from(BlogPost p) {
            return new BlogPostSummaryDTO(
                p.getId(), p.getTitle(), p.getAuthorUsername(), p.getAuthorId(),
                p.getCreatedAt().toString(),
                p.getUpdatedAt() != null ? p.getUpdatedAt().toString() : null,
                p.getUpvotes(), p.getDownvotes(), p.getStars(),
                p.getComments() != null ? p.getComments().size() : 0,
                p.getTags()
            );
        }
    }

    public record BlogCommentDTO(
        Long id, String content, Long authorId, String authorUsername,
        String createdAt, String updatedAt,
        int upvotes, int downvotes, Long parentCommentId, int userVote
    ) {
        public static BlogCommentDTO from(BlogComment c, int userVote) {
            return new BlogCommentDTO(
                c.getId(), c.getContent(), c.getAuthorId(), c.getAuthorUsername(),
                c.getCreatedAt().toString(),
                c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : null,
                c.getUpvotes(), c.getDownvotes(), c.getParentCommentId(), userVote
            );
        }
    }

    public record BlogPostDetailDTO(
        Long id, String title, String content, String authorUsername, Long authorId,
        String createdAt, String updatedAt,
        int upvotes, int downvotes, int stars, List<String> tags,
        List<BlogCommentDTO> comments, int userVote, boolean userStarred
    ) {}

    // ─── Post endpoints ────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<BlogPostSummaryDTO>> getAllPosts() {
        List<BlogPostSummaryDTO> posts = blogService.getAllPosts().stream()
            .map(BlogPostSummaryDTO::from)
            .toList();
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogPostDetailDTO> getPost(
            @PathVariable Long id,
            @AuthenticationPrincipal(expression = "user") XUser user) {
        BlogPost post = blogService.getPostById(id);
        if (post == null) return ResponseEntity.notFound().build();

        int userVote = blogService.getUserVote("post", id, user.getId());
        boolean userStarred = blogService.isStarred(id, user.getId());

        List<BlogCommentDTO> commentDTOs = blogService.getCommentsForPost(id).stream()
            .map(c -> BlogCommentDTO.from(c, blogService.getUserVote("comment", c.getId(), user.getId())))
            .toList();

        var dto = new BlogPostDetailDTO(
            post.getId(), post.getTitle(), post.getContent(),
            post.getAuthorUsername(), post.getAuthorId(),
            post.getCreatedAt().toString(),
            post.getUpdatedAt() != null ? post.getUpdatedAt().toString() : null,
            post.getUpvotes(), post.getDownvotes(), post.getStars(), post.getTags(),
            commentDTOs, userVote, userStarred
        );
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<BlogPostSummaryDTO> createPost(
            @RequestBody BlogPostRequest req,
            @AuthenticationPrincipal(expression = "user") XUser user) {
        BlogPost post = blogService.createPost(
            req.title(), req.content(), req.tags(),
            user.getId(), user.getUsername()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(BlogPostSummaryDTO.from(post));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(
            @PathVariable Long id,
            @RequestBody BlogPostRequest req,
            @AuthenticationPrincipal(expression = "user") XUser user) {
        BlogPost updated = blogService.updatePost(id, user.getId(), req.title(), req.content(), req.tags());
        if (updated == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed");
        return ResponseEntity.ok(BlogPostSummaryDTO.from(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal(expression = "user") XUser user) {
        boolean deleted = blogService.deletePost(id, user.getId());
        if (!deleted) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed");
        return ResponseEntity.ok("Deleted");
    }

    // ─── Comment endpoints ─────────────────────────────────────────────

    @PostMapping("/{postId}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable Long postId,
            @RequestBody CommentRequest req,
            @AuthenticationPrincipal(expression = "user") XUser user) {
        BlogComment comment = blogService.addComment(
            postId, req.content(), user.getId(), user.getUsername(), req.parentCommentId()
        );
        if (comment == null) return ResponseEntity.notFound().build();
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(BlogCommentDTO.from(comment, 0));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommentRequest req,
            @AuthenticationPrincipal(expression = "user") XUser user) {
        BlogComment updated = blogService.updateComment(commentId, user.getId(), req.content());
        if (updated == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed");
        return ResponseEntity.ok(BlogCommentDTO.from(updated, 0));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal(expression = "user") XUser user) {
        boolean deleted = blogService.deleteComment(commentId, user.getId());
        if (!deleted) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed");
        return ResponseEntity.ok("Deleted");
    }

    // ─── Vote endpoints ────────────────────────────────────────────────

    @PostMapping("/{postId}/vote")
    public ResponseEntity<Integer> votePost(
            @PathVariable Long postId,
            @RequestBody VoteRequest req,
            @AuthenticationPrincipal(expression = "user") XUser user) {
        int netScore = blogService.vote("post", postId, user.getId(), req.value());
        return ResponseEntity.ok(netScore);
    }

    @PostMapping("/comments/{commentId}/vote")
    public ResponseEntity<Integer> voteComment(
            @PathVariable Long commentId,
            @RequestBody VoteRequest req,
            @AuthenticationPrincipal(expression = "user") XUser user) {
        int netScore = blogService.vote("comment", commentId, user.getId(), req.value());
        return ResponseEntity.ok(netScore);
    }

    // ─── Star endpoints ────────────────────────────────────────────────

    public record StarResponseDTO(boolean starred, int stars) {}

    @PostMapping("/{postId}/star")
    public ResponseEntity<StarResponseDTO> toggleStar(
            @PathVariable Long postId,
            @AuthenticationPrincipal(expression = "user") XUser user) {
        boolean starred = blogService.toggleStar(postId, user.getId());
        BlogPost post = blogService.getPostById(postId);
        int stars = post != null ? post.getStars() : 0;
        return ResponseEntity.ok(new StarResponseDTO(starred, stars));
    }
}
