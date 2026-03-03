// src/pages/MyProblems.jsx
import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { useNavigate, useSearchParams } from "react-router-dom";

import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";

export default function MyProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Open modal automatically if ?action=create
  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setShowModal(true);
    }
  }, [searchParams]);

  // Load existing problems
  useEffect(() => {
    async function loadProblems() {
      try {
        const data = await apiFetch("/api/author/problems/my");
        setProblems(Array.isArray(data) ? data : []);
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

  // Handle create new problem
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

      // Redirect to ProblemEditor page for the new problem
      clearActionParam();
      navigate(`/author/problems/${data.id}/edit`, { state: { problemData: data } });
    } catch (err) {
      setError("Failed to create problem. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="p-6">Loading problems...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">My Problems</h1>
        <Button onClick={() => setShowModal(true)}>+ Create Problem</Button>
      </div>

      {/* No problems message */}
      {problems.length === 0 ? (
        <Card>
          <p className="text-gray-600">No problems yet. Create your first problem 🚀</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {problems.map((p) => (
            <Card key={p.id} title={`${p.title} (ID: ${p.id})`}>
              <p className="text-sm text-gray-700 line-clamp-3">{p.statement}</p>

              <div className="mt-3 grid grid-cols-2 gap-y-1 text-sm text-gray-600">
                <span>Difficulty: <b>{p.difficultyRating}</b></span>
                <span>Accepted: <b>{p.solveCount}</b></span>
                <span>Time Limit: <b>{p.timeLimit} ms</b></span>
                <span>Memory: <b>{Math.floor(p.memoryLimit / 1000)} MB</b></span>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() =>
                    navigate(`/author/problems/${p.id}/edit`, { state: { problemData: p } })
                  }
                >
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Problem Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              Create New Problem
            </h2>

            {error && (
              <p className="text-red-500 mb-3 text-sm">{error}</p>
            )}

            <input
              type="text"
              placeholder="Problem Title"
              className="
                w-full rounded-lg px-3 py-2 mb-4
                border border-gray-400 dark:border-slate-600
                bg-white dark:bg-slate-700
                text-gray-800 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "

              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <Button
                className="bg-gray-300 hover:bg-gray-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-800 dark:text-gray-200"
                onClick={closeModal}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                loading={creating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
