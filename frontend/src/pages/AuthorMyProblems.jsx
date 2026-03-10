// src/pages/AuthorMyProblems.jsx
import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function MyProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [publishStatuses, setPublishStatuses] = useState({}); // { problemId: { published, inContest } }

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setShowModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadProblems() {
      try {
        const data = await apiFetch("/api/author/problems/my");
        const list = Array.isArray(data) ? data : [];
        setProblems(list);

        // Fetch publish status for each problem
        const statuses = {};
        await Promise.all(
          list.map(async (p) => {
            try {
              const s = await apiFetch(`/api/edit/problems/${p.id}/publish-status`);
              statuses[p.id] = s;
            } catch (err) {
              statuses[p.id] = null;
            }
          })
        );
        setPublishStatuses(statuses);
      } catch (err) {
        console.error("Failed to load problems", err);
        setProblems([]);
      } finally {
        setLoading(false);
      }
    }
    loadProblems();
  }, []);

  const clearActionParam = () => {
    if (searchParams.has("action")) {
      searchParams.delete("action");
      setSearchParams(searchParams, { replace: true });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    clearActionParam();
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      setError("Title cannot be empty");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const data = await apiFetch("/api/author/problems/init", {
        method: "POST",
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (!data || !data.id) {
        setError("Failed to create problem. Please try again.");
        return;
      }

      clearActionParam();
      navigate(`/author/problems/${data.id}/edit`, { state: { problemData: data } });
    } catch (err) {
      setError("Failed to create problem. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const getStatusLabel = (problemId) => {
    const s = publishStatuses[problemId];
    if (!s) return null;
    if (s.inContest) return { text: "In Contest", className: "publish-badge publish-badge-contest" };
    if (s.published) return { text: "Published", className: "publish-badge", style: { background: "var(--success-bg)", color: "var(--success)", border: "1px solid var(--success)" } };
    return { text: "Draft", className: "publish-badge", style: { background: "var(--bg-tertiary)", color: "var(--text-tertiary)", border: "1px solid var(--border-primary)" } };
  };

  if (loading) return <div className="p-6" style={{ color: "var(--text-secondary)" }}>Loading problems...</div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>My Problems</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Create Problem</button>
      </div>

      {/* No problems */}
      {problems.length === 0 ? (
        <div className="panel text-center py-8">
          <p style={{ color: "var(--text-secondary)" }}>No problems yet. Create your first problem 🚀</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {problems.map((p) => {
            const statusLabel = getStatusLabel(p.id);
            return (
              <div key={p.id} className="panel">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                    {p.title} <span style={{ color: "var(--text-tertiary)", fontWeight: 400, fontSize: ".85rem" }}>(ID: {p.id})</span>
                  </h3>
                  {statusLabel && (
                    <span className={statusLabel.className} style={statusLabel.style}>
                      {statusLabel.text}
                    </span>
                  )}
                </div>

                <p className="text-sm line-clamp-3 mb-3" style={{ color: "var(--text-secondary)" }}>{p.statement}</p>

                <div className="grid grid-cols-2 gap-y-1 text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                  <span>Difficulty: <b>{p.difficultyRating}</b></span>
                  <span>Accepted: <b>{p.solveCount}</b></span>
                  <span>Time: <b>{p.timeLimit} ms</b></span>
                  <span>Memory: <b>{Math.round(p.memoryLimit / 1024)} MB</b></span>
                </div>

                <button
                  className="btn btn-sm"
                  onClick={() =>
                    navigate(`/author/problems/${p.id}/edit`, { state: { problemData: p } })
                  }
                >
                  Edit
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Problem Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} aria-hidden="true" />
          <div className="relative rounded-xl shadow-xl w-full max-w-md p-6" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Create New Problem
            </h2>

            {error && (
              <p style={{ color: "var(--danger)" }} className="mb-3 text-sm">{error}</p>
            )}

            <input
              type="text"
              placeholder="Problem Title"
              className="input w-full mb-4"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button className="btn" onClick={closeModal}>
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="btn btn-primary"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
