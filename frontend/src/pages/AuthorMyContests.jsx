// src/pages/MyContests.jsx
import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { useNavigate, useSearchParams } from "react-router-dom";

import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";

export default function MyContests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Load existing contests
  useEffect(() => {
    async function loadContests() {
      try {
        const data = await apiFetch("/api/author/contests/my");
        setContests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load contests", err);
        setContests([]);
      } finally {
        setLoading(false);
      }
    }
    loadContests();
  }, []);

  // Auto-create if ?action=create
  useEffect(() => {
    if (searchParams.get("action") === "create") {
      // clear param first so it doesn't loop if navigation fails
      searchParams.delete("action");
      setSearchParams(searchParams, { replace: true });
      handleCreate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle create new contest
  const handleCreate = async () => {
    setCreating(true);
    try {
      const data = await apiFetch("/api/author/contests/init", { method: "POST" });
      if (!data || !data.id) {
        alert("Failed to create contest. Please try again.");
        return;
      }
      navigate(`/author/contests/${data.id}/edit`, { state: { contestData: data } });
    } catch (err) {
      alert("Failed to create contest. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="p-6">Loading contests...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">My Contests</h1>
        <Button onClick={handleCreate} loading={creating}>
          + Create Contest
        </Button>
      </div>

      {/* No contests message */}
      {contests.length === 0 ? (
        <Card>
          <p className="text-gray-600">No contests yet. Create your first contest 🎉</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {contests.map((c) => (
            console.log(c),
            <Card key={c.id} title={c.title}>
              <p className="text-sm text-gray-700 line-clamp-3">{c.description}</p>

              <div className="mt-3 grid grid-cols-2 gap-y-1 text-sm text-gray-600">
                <span>Status: <b>{c.status}</b></span>
                <span>Duration: <b>{c.duration} hours</b></span>
                <span>Start: <b>{new Date(c.startTime).toLocaleString()}</b></span>
                <span>End: <b>{new Date(c.endTime).toLocaleString()}</b></span>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() =>
                    navigate(`/author/contests/${c.id}/edit`, { state: { contestData: c } })
                  }
                >
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
