import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import Card from "../components/Card";

export default function PlatformDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/api/db/platform-stats")
      .then((data) => setStats(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-center opacity-60">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-400">Error: {error}</div>;
  if (!stats) return <div className="p-6 text-center opacity-60">No data available.</div>;

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: "👤" },
    { label: "Total Problems", value: stats.totalProblems, icon: "📝" },
    { label: "Total Submissions", value: stats.totalSubmissions, icon: "📤" },
    { label: "Total Contests", value: stats.totalContests, icon: "🏆" },
    { label: "Submissions Today", value: stats.submissionsToday, icon: "📅" },
    { label: "This Week", value: stats.submissionsThisWeek, icon: "📊" },
    { label: "Active Contests", value: stats.activeContests, icon: "🔴" },
    { label: "Avg. Acceptance Rate", value: `${stats.avgAcceptanceRate}%`, icon: "📈" },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--colour-2)" }}>
        Platform Dashboard
      </h1>
      <p className="text-sm mb-6 opacity-70">
        Real-time statistics from stored functions and materialized views.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <Card key={s.label}>
            <div className="p-4 text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold" style={{ color: "var(--colour-2)" }}>
                {s.value}
              </div>
              <div className="text-xs opacity-60 mt-1">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-2" style={{ color: "var(--colour-2)" }}>
              Most Solved Problem
            </h3>
            {stats.mostSolvedProblemId ? (
              <div>
                <span className="font-mono text-sm opacity-50">#{stats.mostSolvedProblemId}</span>{" "}
                <span className="font-medium">{stats.mostSolvedProblemTitle}</span>
              </div>
            ) : (
              <div className="opacity-50">No data</div>
            )}
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-2" style={{ color: "var(--colour-2)" }}>
              Most Active User
            </h3>
            {stats.mostActiveUserId ? (
              <div>
                <span className="font-medium">{stats.mostActiveUsername}</span>
              </div>
            ) : (
              <div className="opacity-50">No data</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
