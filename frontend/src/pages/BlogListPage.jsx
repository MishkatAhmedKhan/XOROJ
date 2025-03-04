import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import "../styles/styles.css";

export default function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch("/api/blogs")
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold themed-text">Blogs</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/blogs/new")}
        >
          + New Blog Entry
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 opacity-60">
          <p className="text-lg">No blog posts yet. Be the first to write one!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => {
            const net = post.upvotes - post.downvotes;
            const date = new Date(post.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            return (
              <Link
                key={post.id}
                to={`/blogs/${post.id}`}
                className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-base-300"
              >
                <div className="card-body p-5">
                  <div className="flex items-start gap-4">
                    {/* Vote count */}
                    <div className="flex flex-col items-center min-w-[48px]">
                      <span
                        className={`text-xl font-bold ${
                          net > 0
                            ? "text-success"
                            : net < 0
                            ? "text-error"
                            : "opacity-60"
                        }`}
                      >
                        {net > 0 ? `+${net}` : net}
                      </span>
                      <span className="text-xs opacity-50">votes</span>
                    </div>

                    {/* Star count */}
                    <div className="flex flex-col items-center min-w-[36px]">
                      <span className="text-lg" title={`${post.stars || 0} stars`}>⭐</span>
                      <span className="text-xs opacity-50">{post.stars || 0}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold themed-text truncate">
                        {post.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm opacity-70">
                        <Link
                          to={`/profile/${post.authorUsername}`}
                          onClick={(e) => e.stopPropagation()}
                          className="link link-hover font-medium"
                        >
                          {post.authorUsername}
                        </Link>
                        <span>·</span>
                        <span>{date}</span>
                        <span>·</span>
                        <span>{post.commentCount} comment{post.commentCount !== 1 ? "s" : ""}</span>
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="badge badge-sm badge-outline"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
