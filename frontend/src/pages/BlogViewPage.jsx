import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiFetch, getToken } from "../api/client";
import MathRenderer from "../components/MathRenderer";
import "../styles/styles.css";

function parseJwt(token) {
  try {
    const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/") ?? "";
    const json = decodeURIComponent(
      atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
    return JSON.parse(json);
  } catch { return null; }
}

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/* ─── Vote Button ─────────────────────────────────── */
function VoteButtons({ targetType, targetId, upvotes, downvotes, userVote: initialVote, onUpdate }) {
  const [vote, setVote] = useState(initialVote);
  const [ups, setUps] = useState(upvotes);
  const [downs, setDowns] = useState(downvotes);

  const doVote = async (value) => {
    const url = targetType === "post"
      ? `/api/blogs/${targetId}/vote`
      : `/api/blogs/comments/${targetId}/vote`;
    try {
      const newNet = await apiFetch(url, {
        method: "POST",
        body: JSON.stringify({ value }),
      });
      // Optimistic: just refresh parent
      if (vote === value) {
        // toggled off
        if (value === 1) setUps(u => u - 1);
        else setDowns(d => d - 1);
        setVote(0);
      } else {
        if (vote === -value) {
          // switched
          if (value === 1) { setUps(u => u + 1); setDowns(d => d - 1); }
          else { setDowns(d => d + 1); setUps(u => u - 1); }
        } else {
          if (value === 1) setUps(u => u + 1);
          else setDowns(d => d + 1);
        }
        setVote(value);
      }
    } catch (e) { console.error(e); }
  };

  const net = ups - downs;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => doVote(1)}
        className={`btn btn-xs btn-ghost ${vote === 1 ? "text-success font-bold" : "opacity-60"}`}
        title="Upvote"
      >
        ▲
      </button>
      <span className={`font-semibold text-sm min-w-[24px] text-center ${
        net > 0 ? "text-success" : net < 0 ? "text-error" : "opacity-70"
      }`}>
        {net > 0 ? `+${net}` : net}
      </span>
      <button
        onClick={() => doVote(-1)}
        className={`btn btn-xs btn-ghost ${vote === -1 ? "text-error font-bold" : "opacity-60"}`}
        title="Downvote"
      >
        ▼
      </button>
    </div>
  );
}

/* ─── Star Button ─────────────────────────────────── */
function StarButton({ postId, initialStarred, initialStars }) {
  const [starred, setStarred] = useState(initialStarred);
  const [starCount, setStarCount] = useState(initialStars);

  const toggle = async () => {
    try {
      const res = await apiFetch(`/api/blogs/${postId}/star`, { method: "POST" });
      setStarred(res.starred);
      setStarCount(res.stars);
    } catch (e) { console.error(e); }
  };

  return (
    <button
      onClick={toggle}
      className={`btn btn-sm gap-1 ${starred ? "btn-warning" : "btn-ghost opacity-70"}`}
      title={starred ? "Unstar this post" : "Star this post"}
    >
      {starred ? "★" : "☆"}
      <span className="text-sm">{starCount}</span>
    </button>
  );
}

/* ─── Comment ──────────────────────────────────────── */
function Comment({ c, postId, currentUserId, allComments, depth = 0, onCommentAdded }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(c.content);
  const [content, setContent] = useState(c.content);
  const [deleted, setDeleted] = useState(false);

  const replies = allComments.filter(x => x.parentCommentId === c.id);

  const submitReply = async () => {
    if (!replyText.trim()) return;
    try {
      const newComment = await apiFetch(`/api/blogs/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: replyText, parentCommentId: c.id }),
      });
      onCommentAdded(newComment);
      setReplyText("");
      setReplying(false);
    } catch (e) { console.error(e); }
  };

  const submitEdit = async () => {
    try {
      const updated = await apiFetch(`/api/blogs/comments/${c.id}`, {
        method: "PUT",
        body: JSON.stringify({ content: editText }),
      });
      setContent(updated.content);
      setEditing(false);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) return;
    try {
      await apiFetch(`/api/blogs/comments/${c.id}`, { method: "DELETE" });
      setDeleted(true);
    } catch (e) { console.error(e); }
  };

  if (deleted) return null;

  return (
    <div className={`${depth > 0 ? "ml-6 border-l-2 border-base-300 pl-4" : ""} mb-3`}>
      <div className="flex items-start gap-2">
        <VoteButtons
          targetType="comment"
          targetId={c.id}
          upvotes={c.upvotes}
          downvotes={c.downvotes}
          userVote={c.userVote}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <Link to={`/profile/${c.authorUsername}`} className="link link-hover font-medium">
              {c.authorUsername}
            </Link>
            <span className="opacity-50">{timeAgo(c.createdAt)}</span>
            {c.updatedAt && <span className="opacity-40 text-xs">(edited)</span>}
          </div>

          {editing ? (
            <div className="mt-1">
              <textarea
                className="textarea textarea-bordered w-full text-sm"
                rows={3}
                value={editText}
                onChange={e => setEditText(e.target.value)}
              />
              <div className="flex gap-2 mt-1">
                <button className="btn btn-xs btn-primary" onClick={submitEdit}>Save</button>
                <button className="btn btn-xs btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="mt-1 text-sm whitespace-pre-wrap">{content}</div>
          )}

          <div className="flex gap-3 mt-1">
            <button className="btn btn-xs btn-ghost opacity-60" onClick={() => setReplying(!replying)}>
              Reply
            </button>
            {c.authorId === currentUserId && (
              <>
                <button className="btn btn-xs btn-ghost opacity-60" onClick={() => setEditing(true)}>
                  Edit
                </button>
                <button className="btn btn-xs btn-ghost text-error opacity-60" onClick={handleDelete}>
                  Delete
                </button>
              </>
            )}
          </div>

          {replying && (
            <div className="mt-2">
              <textarea
                className="textarea textarea-bordered w-full text-sm"
                rows={2}
                placeholder="Write a reply..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
              />
              <div className="flex gap-2 mt-1">
                <button className="btn btn-xs btn-primary" onClick={submitReply}>Post Reply</button>
                <button className="btn btn-xs btn-ghost" onClick={() => setReplying(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {replies.map(r => (
        <Comment
          key={r.id}
          c={r}
          postId={postId}
          currentUserId={currentUserId}
          allComments={allComments}
          depth={depth + 1}
          onCommentAdded={onCommentAdded}
        />
      ))}
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────── */
export default function BlogViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");

  const token = getToken();
  const currentUserId = useMemo(() => {
    if (!token) return null;
    const p = parseJwt(token);
    return p?.userId ?? null;
  }, [token]);

  const currentUsername = useMemo(() => {
    if (!token) return null;
    return parseJwt(token)?.sub ?? null;
  }, [token]);

  useEffect(() => {
    apiFetch(`/api/blogs/${id}`)
      .then(data => {
        setPost(data);
        setComments(data.comments || []);
      })
      .catch(() => navigate("/blogs"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCommentAdded = (c) => {
    setComments(prev => [...prev, c]);
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    try {
      const c = await apiFetch(`/api/blogs/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: newComment, parentCommentId: null }),
      });
      handleCommentAdded(c);
      setNewComment("");
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this blog post?")) return;
    try {
      await apiFetch(`/api/blogs/${id}`, { method: "DELETE" });
      navigate("/blogs");
    } catch (e) { console.error(e); }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );

  if (!post)
    return <div className="text-center py-16 opacity-60">Post not found</div>;

  const topLevelComments = comments.filter(c => !c.parentCommentId);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Post header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="pt-1">
          <VoteButtons
            targetType="post"
            targetId={post.id}
            upvotes={post.upvotes}
            downvotes={post.downvotes}
            userVote={post.userVote}
          />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold themed-text">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm opacity-70">
            <Link to={`/profile/${post.authorUsername}`} className="link link-hover font-medium">
              {post.authorUsername}
            </Link>
            <span>·</span>
            <span>{timeAgo(post.createdAt)}</span>
            {post.updatedAt && <span className="opacity-50">(edited)</span>}
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.tags.map(tag => (
                <span key={tag} className="badge badge-sm badge-outline">{tag}</span>
              ))}
            </div>
          )}
          {/* Star button */}
          <div className="flex items-center gap-3 mt-3">
            <StarButton
              postId={post.id}
              initialStarred={post.userStarred}
              initialStars={post.stars}
            />
            {/* Author actions */}
            {currentUsername === post.authorUsername && (
              <>
                <button className="btn btn-sm btn-outline" onClick={() => navigate(`/blogs/${id}/edit`)}>
                  Edit
                </button>
                <button className="btn btn-sm btn-error btn-outline" onClick={handleDelete}>
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Post content */}
      <div className="card bg-base-100 shadow-sm border border-base-300 mb-8">
        <div className="card-body prose max-w-full">
          <MathRenderer content={post.content} />
        </div>
      </div>

      {/* Comments section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 themed-text">
          Comments ({comments.length})
        </h2>

        {/* New comment box */}
        <div className="mb-6">
          <textarea
            className="textarea textarea-bordered w-full"
            rows={3}
            placeholder="Write a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
          />
          <button
            className="btn btn-primary btn-sm mt-2"
            onClick={submitComment}
            disabled={!newComment.trim()}
          >
            Post Comment
          </button>
        </div>

        {/* Comment tree */}
        {topLevelComments.length === 0 ? (
          <p className="opacity-50">No comments yet.</p>
        ) : (
          topLevelComments.map(c => (
            <Comment
              key={c.id}
              c={c}
              postId={post.id}
              currentUserId={currentUserId}
              allComments={comments}
              onCommentAdded={handleCommentAdded}
            />
          ))
        )}
      </div>
    </div>
  );
}
