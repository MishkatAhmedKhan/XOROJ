import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import Card from "../components/Card";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const SIZE = 50;

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/db/leaderboard?page=${page}&size=${SIZE}`)
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Expected array");
        setEntries(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  const getRankStyle = (rank) => {
    if (rank === 1) return { color: "#FFD700", fontWeight: "bold" };
    if (rank === 2) return { color: "#C0C0C0", fontWeight: "bold" };
    if (rank === 3) return { color: "#CD7F32", fontWeight: "bold" };
    return {};
  };

  if (error) return <div className="p-6 text-red-400">Error: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--colour-2)" }}>
        Global Leaderboard
      </h1>
      <p className="text-sm mb-4 opacity-70">
        Rankings computed using DENSE_RANK() window function ordered by problems solved, acceptance rate, and total submissions.
      </p>

      <Card>
        {loading ? (
          <div className="p-6 text-center opacity-60">Loading leaderboard...</div>
        ) : entries.length === 0 ? (
          <div className="p-6 text-center opacity-60">No users to rank yet.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--colour-5)" }}>
                    <th className="p-3 text-left w-16">#</th>
                    <th className="p-3 text-left">User</th>
                    <th className="p-3 text-center">Solved</th>
                    <th className="p-3 text-center">Accepted</th>
                    <th className="p-3 text-center">Total</th>
                    <th className="p-3 text-center">Rate</th>
                    <th className="p-3 text-center">Contests</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr
                      key={e.userId}
                      className="border-b transition-colors hover:opacity-80"
                      style={{ borderColor: "var(--colour-5)" }}
                    >
                      <td className="p-3 font-mono" style={getRankStyle(e.rank)}>
                        {e.rank}
                      </td>
                      <td className="p-3">
                        <Link
                          to={`/profile/${e.username}`}
                          className="font-semibold hover:underline"
                          style={{ color: "var(--colour-2)" }}
                        >
                          {e.firstName || e.username}{" "}
                          {e.lastName && <span className="opacity-70">{e.lastName}</span>}
                        </Link>
                        <div className="text-xs opacity-50">@{e.username}</div>
                      </td>
                      <td className="p-3 text-center font-bold" style={{ color: "var(--colour-3)" }}>
                        {e.problemsSolved}
                      </td>
                      <td className="p-3 text-center">{e.acceptedCount}</td>
                      <td className="p-3 text-center">{e.totalSubmissions}</td>
                      <td className="p-3 text-center">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor:
                              e.acceptanceRate >= 70
                                ? "rgba(34,197,94,0.15)"
                                : e.acceptanceRate >= 40
                                ? "rgba(234,179,8,0.15)"
                                : "rgba(239,68,68,0.15)",
                            color:
                              e.acceptanceRate >= 70
                                ? "#22c55e"
                                : e.acceptanceRate >= 40
                                ? "#eab308"
                                : "#ef4444",
                          }}
                        >
                          {e.acceptanceRate}%
                        </span>
                      </td>
                      <td className="p-3 text-center">{e.contestsParticipated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between p-3 border-t" style={{ borderColor: "var(--colour-5)" }}>
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-1.5 rounded text-sm disabled:opacity-30"
                style={{ backgroundColor: "var(--colour-5)", color: "var(--colour-2)" }}
              >
                Previous
              </button>
              <span className="text-sm opacity-70 flex items-center">Page {page + 1}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={entries.length < SIZE}
                className="px-4 py-1.5 rounded text-sm disabled:opacity-30"
                style={{ backgroundColor: "var(--colour-5)", color: "var(--colour-2)" }}
              >
                Next
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
