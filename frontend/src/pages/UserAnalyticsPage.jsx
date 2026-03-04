import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import Card from "../components/Card";

/**
 * User Analytics Page — shows verdict distribution, activity heatmap,
 * and contest performance history.
 * Data comes from cursor-based stored functions and generate_series queries.
 */
export default function UserAnalyticsPage() {
  const { username } = useParams();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [contestPerf, setContestPerf] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch(`/api/db/stats/user/${username}`).catch(() => null),
      apiFetch(`/api/db/analytics/${username}`).catch(() => []),
      apiFetch(`/api/db/heatmap/${username}`).catch(() => []),
      apiFetch(`/api/db/contest-performance/${username}`).catch(() => []),
    ])
      .then(([s, a, h, c]) => {
        setStats(s);
        setAnalytics(Array.isArray(a) ? a : []);
        setHeatmap(Array.isArray(h) ? h : []);
        setContestPerf(Array.isArray(c) ? c : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [username]);

  const getVerdictColor = (verdict) => {
    const map = {
      ACCEPTED: "#22c55e",
      WRONG_ANSWER: "#ef4444",
      TIME_LIMIT_EXCEEDED: "#eab308",
      MEMORY_LIMIT_EXCEEDED: "#f97316",
      RUNTIME_ERROR: "#a855f7",
      COMPILATION_ERROR: "#6b7280",
      PENDING: "#3b82f6",
      RUNNING: "#3b82f6",
    };
    return map[verdict] || "#6b7280";
  };

  const getIntensityColor = (level) => {
    const colors = ["#1a1a2e", "#0e4429", "#006d32", "#26a641", "#39d353"];
    return colors[level] || colors[0];
  };

  if (loading) return <div className="p-6 text-center opacity-60">Loading analytics...</div>;
  if (error) return <div className="p-6 text-red-400">Error: {error}</div>;

  // Group heatmap by weeks for display
  const weeks = [];
  for (let i = 0; i < heatmap.length; i += 7) {
    weeks.push(heatmap.slice(i, i + 7));
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/profile/${username}`} className="text-sm opacity-70 hover:opacity-100">
          ← Profile
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: "var(--colour-2)" }}>
          Analytics: {username}
        </h1>
      </div>

      {/* User Overview Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Problems Solved", value: stats.problemsSolved },
            { label: "Total Submissions", value: stats.totalSubmissions },
            { label: "Accepted", value: stats.acceptedCount },
            { label: "Acceptance Rate", value: `${stats.acceptanceRate}%` },
            { label: "Contests", value: stats.contestsParticipated },
          ].map((s) => (
            <Card key={s.label}>
              <div className="p-3 text-center">
                <div className="text-xl font-bold" style={{ color: "var(--colour-2)" }}>
                  {s.value}
                </div>
                <div className="text-xs opacity-60">{s.label}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Verdict Distribution */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--colour-2)" }}>
            Verdict Distribution
          </h2>
          <p className="text-xs mb-3 opacity-50">
            Computed by a cursor-based PL/pgSQL stored function (fn_user_submission_analytics)
          </p>
          {analytics.length === 0 ? (
            <div className="opacity-50 text-sm">No submissions yet.</div>
          ) : (
            <div className="space-y-2">
              {analytics.map((a) => (
                <div key={a.verdict} className="flex items-center gap-3">
                  <div className="w-36 text-sm font-medium" style={{ color: getVerdictColor(a.verdict) }}>
                    {a.verdict.replace(/_/g, " ")}
                  </div>
                  <div className="flex-1">
                    <div
                      className="h-5 rounded-sm transition-all"
                      style={{
                        width: `${a.percentage}%`,
                        backgroundColor: getVerdictColor(a.verdict),
                        minWidth: "2px",
                      }}
                    />
                  </div>
                  <div className="text-sm w-20 text-right">
                    {a.count} ({a.percentage}%)
                  </div>
                  <div className="text-xs opacity-50 w-28 text-right">
                    {a.avgExecutionTime}ms / {a.avgMemoryUsed}KB
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Activity Heatmap */}
      <Card>
        <div className="p-4 mt-4">
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--colour-2)" }}>
            Activity Heatmap
          </h2>
          <p className="text-xs mb-3 opacity-50">
            365-day grid using generate_series() LEFT JOINed with submissions
          </p>
          <div className="overflow-x-auto">
            <div className="flex gap-0.5" style={{ minWidth: "700px" }}>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      title={`${day.date}: ${day.submissions} submissions (${day.accepted} accepted)`}
                      className="rounded-sm cursor-pointer transition-transform hover:scale-150"
                      style={{
                        width: "10px",
                        height: "10px",
                        backgroundColor: getIntensityColor(day.intensity),
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs opacity-50">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((l) => (
                <div
                  key={l}
                  className="rounded-sm"
                  style={{ width: "10px", height: "10px", backgroundColor: getIntensityColor(l) }}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Contest Performance */}
      <Card>
        <div className="p-4 mt-4">
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--colour-2)" }}>
            Contest Performance
          </h2>
          <p className="text-xs mb-3 opacity-50">
            Per-contest stats computed by cursor-based fn_user_contest_performance()
          </p>
          {contestPerf.length === 0 ? (
            <div className="opacity-50 text-sm">No contest participation yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--colour-5)" }}>
                    <th className="p-2 text-left">Contest</th>
                    <th className="p-2 text-center">Problems</th>
                    <th className="p-2 text-center">Attempted</th>
                    <th className="p-2 text-center">Solved</th>
                    <th className="p-2 text-center">Submissions</th>
                    <th className="p-2 text-center">Solve %</th>
                  </tr>
                </thead>
                <tbody>
                  {contestPerf.map((cp) => (
                    <tr
                      key={cp.contestId}
                      className="border-b"
                      style={{ borderColor: "var(--colour-5)" }}
                    >
                      <td className="p-2">
                        <Link
                          to={`/contests/${cp.contestId}/view`}
                          className="hover:underline"
                          style={{ color: "var(--colour-2)" }}
                        >
                          {cp.contestTitle}
                        </Link>
                      </td>
                      <td className="p-2 text-center">{cp.totalProblems}</td>
                      <td className="p-2 text-center">{cp.problemsAttempted}</td>
                      <td className="p-2 text-center font-bold" style={{ color: "#22c55e" }}>
                        {cp.problemsSolved}
                      </td>
                      <td className="p-2 text-center">{cp.totalSubmissions}</td>
                      <td className="p-2 text-center">
                        <span
                          className="px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor:
                              cp.solvePercentage >= 80
                                ? "rgba(34,197,94,0.15)"
                                : cp.solvePercentage >= 50
                                ? "rgba(234,179,8,0.15)"
                                : "rgba(239,68,68,0.15)",
                            color:
                              cp.solvePercentage >= 80
                                ? "#22c55e"
                                : cp.solvePercentage >= 50
                                ? "#eab308"
                                : "#ef4444",
                          }}
                        >
                          {cp.solvePercentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
