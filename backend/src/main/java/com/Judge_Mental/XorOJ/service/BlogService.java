package com.Judge_Mental.XorOJ.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Judge_Mental.XorOJ.entity.BlogComment;
import com.Judge_Mental.XorOJ.entity.BlogPost;
import com.Judge_Mental.XorOJ.entity.BlogStar;
import com.Judge_Mental.XorOJ.entity.BlogVote;
import com.Judge_Mental.XorOJ.repo.BlogCommentRepository;
import com.Judge_Mental.XorOJ.repo.BlogPostRepository;
import com.Judge_Mental.XorOJ.repo.BlogStarRepository;
import com.Judge_Mental.XorOJ.repo.BlogVoteRepository;

@Service
public class BlogService {

    @Autowired
    private BlogPostRepository blogPostRepo;

    @Autowired
    private BlogCommentRepository blogCommentRepo;

    @Autowired
    private BlogVoteRepository blogVoteRepo;

    @Autowired
    private BlogStarRepository blogStarRepo;

    // ─── Posts ────────────────────────────────────────────────────────

    public List<BlogPost> getAllPosts() {
        return blogPostRepo.findAllByOrderByCreatedAtDesc();
    }

    public BlogPost getPostById(Long id) {
        return blogPostRepo.findById(id).orElse(null);
    }

    public List<BlogPost> getPostsByAuthor(Long authorId) {
        return blogPostRepo.findByAuthorIdOrderByCreatedAtDesc(authorId);
    }

    public BlogPost createPost(String title, String content, List<String> tags,
                               Long authorId, String authorUsername) {
        BlogPost post = new BlogPost();
        post.setTitle(title);
        post.setContent(content);
        post.setTags(tags);
        post.setAuthorId(authorId);
        post.setAuthorUsername(authorUsername);
        post.setUpvotes(0);
        post.setDownvotes(0);
        return blogPostRepo.save(post);
    }

    public BlogPost updatePost(Long postId, Long userId, String title, String content, List<String> tags) {
        BlogPost post = blogPostRepo.findById(postId).orElse(null);
        if (post == null || !post.getAuthorId().equals(userId)) return null;
        post.setTitle(title);
        post.setContent(content);
        post.setTags(tags);
        post.setUpdatedAt(LocalDateTime.now());
        return blogPostRepo.save(post);
    }

    public boolean deletePost(Long postId, Long userId) {
        BlogPost post = blogPostRepo.findById(postId).orElse(null);
        if (post == null || !post.getAuthorId().equals(userId)) return false;
        blogPostRepo.delete(post);
        return true;
    }

    // ─── Comments ─────────────────────────────────────────────────────

    public List<BlogComment> getCommentsForPost(Long postId) {
        return blogCommentRepo.findByBlogPostIdOrderByCreatedAtAsc(postId);
    }

    public BlogComment addComment(Long postId, String content, Long authorId,
                                  String authorUsername, Long parentCommentId) {
        BlogPost post = blogPostRepo.findById(postId).orElse(null);
        if (post == null) return null;

        BlogComment comment = new BlogComment();
        comment.setBlogPost(post);
        comment.setContent(content);
        comment.setAuthorId(authorId);
        comment.setAuthorUsername(authorUsername);
        comment.setParentCommentId(parentCommentId);
        comment.setUpvotes(0);
        comment.setDownvotes(0);
        return blogCommentRepo.save(comment);
    }

    public BlogComment updateComment(Long commentId, Long userId, String content) {
        BlogComment comment = blogCommentRepo.findById(commentId).orElse(null);
        if (comment == null || !comment.getAuthorId().equals(userId)) return null;
        comment.setContent(content);
        comment.setUpdatedAt(LocalDateTime.now());
        return blogCommentRepo.save(comment);
    }

    public boolean deleteComment(Long commentId, Long userId) {
        BlogComment comment = blogCommentRepo.findById(commentId).orElse(null);
        if (comment == null || !comment.getAuthorId().equals(userId)) return false;
        blogCommentRepo.delete(comment);
        return true;
    }

    // ─── Voting ───────────────────────────────────────────────────────

    /**
     * Vote on a post or comment.
     * @param targetType "post" or "comment"
     * @param targetId   the id of the post or comment
     * @param userId     the voter
     * @param value      +1 for upvote, -1 for downvote
     * @return net score (upvotes - downvotes) after the vote
     */
    public int vote(String targetType, Long targetId, Long userId, int value) {
        if (value != 1 && value != -1) throw new IllegalArgumentException("value must be +1 or -1");

        Optional<BlogVote> existing = blogVoteRepo.findByUserIdAndTargetTypeAndTargetId(userId, targetType, targetId);

        if (existing.isPresent()) {
            BlogVote vote = existing.get();
            if (vote.getValue() == value) {
                // Remove vote (toggle off)
                blogVoteRepo.delete(vote);
                applyVoteDelta(targetType, targetId, -value);
            } else {
                // Switch vote direction
                applyVoteDelta(targetType, targetId, -vote.getValue()); // undo old
                vote.setValue(value);
                blogVoteRepo.save(vote);
                applyVoteDelta(targetType, targetId, value);            // apply new
            }
        } else {
            // New vote
            BlogVote vote = new BlogVote();
            vote.setUserId(userId);
            vote.setTargetType(targetType);
            vote.setTargetId(targetId);
            vote.setValue(value);
            blogVoteRepo.save(vote);
            applyVoteDelta(targetType, targetId, value);
        }

        return getNetScore(targetType, targetId);
    }

    /**
     * Get the user's current vote on a target, or 0 if none.
     */
    public int getUserVote(String targetType, Long targetId, Long userId) {
        return blogVoteRepo.findByUserIdAndTargetTypeAndTargetId(userId, targetType, targetId)
                .map(BlogVote::getValue).orElse(0);
    }

    private void applyVoteDelta(String targetType, Long targetId, int delta) {
        if ("post".equals(targetType)) {
            BlogPost post = blogPostRepo.findById(targetId).orElse(null);
            if (post == null) return;
            if (delta > 0) post.setUpvotes(post.getUpvotes() + 1);
            else post.setDownvotes(post.getDownvotes() + 1);
            blogPostRepo.save(post);
        } else {
            BlogComment comment = blogCommentRepo.findById(targetId).orElse(null);
            if (comment == null) return;
            if (delta > 0) comment.setUpvotes(comment.getUpvotes() + 1);
            else comment.setDownvotes(comment.getDownvotes() + 1);
            blogCommentRepo.save(comment);
        }
    }

    private int getNetScore(String targetType, Long targetId) {
        if ("post".equals(targetType)) {
            BlogPost p = blogPostRepo.findById(targetId).orElse(null);
            return p == null ? 0 : p.getUpvotes() - p.getDownvotes();
        } else {
            BlogComment c = blogCommentRepo.findById(targetId).orElse(null);
            return c == null ? 0 : c.getUpvotes() - c.getDownvotes();
        }
    }

    // ─── Stars (Favorites) ────────────────────────────────────────────

    /**
     * Toggle star on a blog post. Returns true if now starred, false if unstarred.
     */
    public boolean toggleStar(Long postId, Long userId) {
        Optional<BlogStar> existing = blogStarRepo.findByUserIdAndBlogPostId(userId, postId);
        BlogPost post = blogPostRepo.findById(postId).orElse(null);
        if (post == null) return false;

        if (existing.isPresent()) {
            blogStarRepo.delete(existing.get());
            post.setStars(Math.max(0, post.getStars() - 1));
            blogPostRepo.save(post);
            return false;
        } else {
            BlogStar star = new BlogStar();
            star.setUserId(userId);
            star.setBlogPostId(postId);
            blogStarRepo.save(star);
            post.setStars(post.getStars() + 1);
            blogPostRepo.save(post);
            return true;
        }
    }

    /**
     * Check if a user has starred a post.
     */
    public boolean isStarred(Long postId, Long userId) {
        return blogStarRepo.existsByUserIdAndBlogPostId(userId, postId);
    }
}
