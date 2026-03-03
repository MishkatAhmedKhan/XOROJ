import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { apiFetch } from "../api/client";

import Card from "../components/Card.jsx";
import CountdownTimer from "../components/CountdownTimer.jsx";

export default function ContestViewPage() {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // registration UI state
  const [isRegistered, setIsRegistered] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Details endpoint
        const data = await apiFetch(`/api/contests/${id}/details`);
        if (cancelled) return;

        setContest(data);

        // Try common keys for "registered"
        const registered =
          !!(data?.isRegistered ?? data?.registered ?? data?.userRegistered);
        setIsRegistered(registered);

        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Failed to load contest");
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleRegister() {
    setRegError("");
    setRegLoading(true);
    try {
      // NOTE: If your API uses a different endpoint, change it here.
      await apiFetch(`/api/contests/${id}/register`, { method: "POST" });
      setIsRegistered(true);
    } catch (e) {
      setRegError(e.message || "Registration failed");
    } finally {
      setRegLoading(false);
    }
  }

  if (loading) return <p className="text-center mt-6">Loading contest…</p>;
  if (error || !contest)
    return (
      <p className="text-red-500 text-center mt-6">
        Error: {error || "Not found"}
      </p>
    );

  const now = new Date();
  const startTime = new Date(contest.startTime);
  const endTime = new Date(contest.endTime);
  const hasStarted = now >= startTime;
  const hasEnded = now > endTime;

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4 space-y-6">
      {/* Header */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-2xl font-bold">{contest.title}</h1>

          {/* Before start -> show countdown to start; During -> countdown to end; After -> static text */}
          {!hasStarted ? (
            <div className="text-sm">
              <div className="font-medium mb-1">Starts in</div>
              <CountdownTimer startTime={startTime} />
            </div>
          ) : !hasEnded ? (
            <div className="text-sm">
              <div className="font-medium mb-1">Ends in</div>
              <CountdownTimer startTime={endTime} />
            </div>
          ) : (
            <div className="text-sm opacity-80">Contest ended</div>
          )}
        </div>

        {contest.description && <p className="mt-2">{contest.description}</p>}

        {/* Registration area (only visible before start) */}
        {!hasStarted && (
          <div className="mt-4">
            {isRegistered ? (
              <div className="inline-flex items-center gap-2 rounded-md px-3 py-2 border"
                   style={{ borderColor: "var(--colour-5)" }}>
                ✅ You are registered
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleRegister}
                  disabled={regLoading}
                  className="btn btn-primary"
                >
                  {regLoading ? "Registering…" : "Register"}
                </button>
                {regError && <span className="text-red-500 text-sm">{regError}</span>}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Problems (visible after start) */}
      {hasStarted && contest.problems && contest.problems.length > 0 && (
        <Card title="Problems">
          <ul className="list-decimal pl-5">
            {contest.problems.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/contests/${id}/problems/${p.id}`}
                  className="text-indigo-600 hover:underline"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Tabs */}
      <Card title="My Submissions">
        <Link
          to={`/contests/${id}/my`}
          className="text-indigo-600 hover:underline"
        >
          View My Submissions
        </Link>
      </Card>

      <Card title="All Submissions">
        <Link
          to={`/contests/${id}/submissions/1`} // Always go to page 1 by default
          className="text-indigo-600 hover:underline"
        >
          View All Submissions
        </Link>
      </Card>

      <Card title="Standings">
        <Link
          to={`/contests/${id}/standings`}
          className="text-indigo-600 hover:underline"
        >
          View Standings
        </Link>
      </Card>

      <Link to={`/contests`} className="btn btn-secondary mt-4">
        Back to Contests
      </Link>
    </div>
  );
}
