import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import MathRenderer from "../components/MathRenderer";
import "../styles/styles.css";

export default function BlogEditorPage() {
  const { id } = useParams(); // undefined for new
  const navigate = useNavigate();
  const isEdit = !!id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/api/blogs/${id}`)
      .then(data => {
        setTitle(data.title);
        setContent(data.content);
        setTagsInput((data.tags || []).join(", "));
      })
      .catch(() => navigate("/blogs"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    const tags = tagsInput
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    try {
      if (isEdit) {
        await apiFetch(`/api/blogs/${id}`, {
          method: "PUT",
          body: JSON.stringify({ title, content, tags }),
        });
        navigate(`/blogs/${id}`);
      } else {
        const created = await apiFetch("/api/blogs", {
          method: "POST",
          body: JSON.stringify({ title, content, tags }),
        });
        navigate(`/blogs/${created.id}`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 themed-text">
        {isEdit ? "Edit Blog Post" : "New Blog Entry"}
      </h1>

      {/* Title */}
      <div className="form-control mb-4">
        <label className="label"><span className="label-text font-semibold">Title</span></label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Enter a descriptive title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      {/* Tags */}
      <div className="form-control mb-4">
        <label className="label"><span className="label-text font-semibold">Tags (comma-separated)</span></label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="e.g. editorial, dp, math"
          value={tagsInput}
          onChange={e => setTagsInput(e.target.value)}
        />
      </div>

      {/* Content + Preview toggle */}
      <div className="form-control mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="label-text font-semibold">Content (supports LaTeX with $..$ and $$..$$)</label>
          <button
            className={`btn btn-sm ${preview ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setPreview(!preview)}
          >
            {preview ? "Edit" : "Preview"}
          </button>
        </div>

        {preview ? (
          <div className="card bg-base-100 border border-base-300 p-4 min-h-[200px]">
            <MathRenderer content={content} />
          </div>
        ) : (
          <textarea
            className="textarea textarea-bordered w-full font-mono"
            rows={15}
            placeholder="Write your blog post here. You can use HTML and LaTeX math expressions."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={saving || !title.trim() || !content.trim()}
        >
          {saving ? <span className="loading loading-spinner loading-sm" /> : isEdit ? "Save Changes" : "Publish"}
        </button>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
