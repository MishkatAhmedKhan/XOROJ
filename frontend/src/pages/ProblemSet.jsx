// src/pages/ProblemSet.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";

export default function ProblemSet() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filters
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [tagQuery, setTagQuery] = useState("");
  const [applied, setApplied] = useState({ min: "", max: "", tag: "" });

  // mobile sidebar
  const [filtersOpen, setFiltersOpen] = useState(false);

  // upcoming contest
  const [nextContest, setNextContest] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const timerRef = useRef(null);

  // ---------- helpers ----------
  const msToParts = (ms) => {
    if (ms <= 0) return null;
    const totalSec = Math.floor(ms / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return { days, hours, minutes, seconds };
  };

  const formatParts = (p) => {
    if (!p) return "Starting soon";
    const chunks = [];
    if (p.days) chunks.push(`${p.days}d`);
    if (p.hours || p.days) chunks.push(`${p.hours}h`);
    if (p.minutes || p.hours || p.days) chunks.push(`${p.minutes}m`);
    chunks.push(`${p.seconds}s`);
    return chunks.join(" ");
  };

  // ---------- load problems ----------
  useEffect(() => {
    apiFetch("/api/problems")
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Expected an array of problems");
        setProblems(data);
      })
      .catch((err) => {
        console.error("Failed to fetch problems", err);
        setError(err.message || "Unknown error");
      })
      .finally(() => setLoading(false));
  }, []);

  // ---------- load contests & choose next upcoming ----------
  useEffect(() => {
    let cancelled = false;

    async function loadContests() {
      try {
        const contests = await apiFetch("/api/contests");
        const now = Date.now();

        // normalize and filter future
        const future = (Array.isArray(contests) ? contests : [])
          .map((c) => ({
            ...c,
            startMs: Number(new Date(c.startTime)),
          }))
          .filter((c) => Number.isFinite(c.startMs) && c.startMs > now)
          .sort((a, b) => a.startMs - b.startMs);

        if (!cancelled) {
          setNextContest(future.length ? future[0] : null);
        }
      } catch (e) {
        console.warn("Could not load upcoming contests", e);
        if (!cancelled) setNextContest(null);
      }
    }

    loadContests();
    return () => { cancelled = true; };
  }, []);

  // ---------- fetch registration for next contest ----------
  useEffect(() => {
    let cancelled = false;

    async function loadReg() {
      if (!nextContest?.id) {
        setIsRegistered(false);
        return;
      }
      try {
        const detail = await apiFetch(`/api/contests/${nextContest.id}`);
        // Accept any of these keys as "registered"
        const reg = !!(detail?.isRegistered ?? detail?.registered ?? detail?.userRegistered);
        if (!cancelled) setIsRegistered(reg);
      } catch (e) {
        // If error, assume not registered; you can tweak this if your API behaves differently
        if (!cancelled) setIsRegistered(false);
      }
    }

    loadReg();
    return () => { cancelled = true; };
  }, [nextContest]);

  // ---------- live countdown ----------
  useEffect(() => {
    if (!nextContest) {
      setCountdown(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const update = () => {
      const diff = new Date(nextContest.startTime).getTime() - Date.now();
      setCountdown(msToParts(diff));
      if (diff <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    update();
    timerRef.current = setInterval(update, 1000);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [nextContest]);

  // ---------- filtering ----------
  const filtered = useMemo(() => {
    const min = applied.min === "" ? -Infinity : Number(applied.min);
    const max = applied.max === "" ? Infinity : Number(applied.max);
    const tag = applied.tag.trim().toLowerCase();

    return problems.filter((p) => {
      const rating = Number(p.difficultyRating ?? 0);
      const inRange = rating >= min && rating <= max;
      const tagOk =
        !tag ||
        (Array.isArray(p.tags) &&
          p.tags.some((t) => String(t).toLowerCase().includes(tag)));
      return inRange && tagOk;
    });
  }, [problems, applied]);

  const applyFilters = () =>
    setApplied({ min: minRating, max: maxRating, tag: tagQuery });

  if (error) {
    return (
      <div className="max-w-7xl mx-auto mt-6 px-4">
        <p className="text-red-500">Error loading problems: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-6 px-4">
      {/* Title + mobile filter button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-center">Problem Set</h1>
        <button
          className="lg:hidden p-2 rounded-md border"
          style={{ borderColor: "var(--colour-5)" }}
          aria-label="Open filters"
          onClick={() => setFiltersOpen(true)}
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="21" y1="4" x2="14" y2="4" />
            <line x1="10" y1="4" x2="3" y2="4" />
            <circle cx="12" cy="4" r="2" />
            <line x1="21" y1="12" x2="12" y2="12" />
            <line x1="8" y1="12" x2="3" y2="12" />
            <circle cx="8" cy="12" r="2" />
            <line x1="21" y1="20" x2="16" y2="20" />
            <line x1="12" y1="20" x2="3" y2="20" />
            <circle cx="16" cy="20" r="2" />
          </svg>
        </button>
      </div>

      {/* Table + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_20rem] gap-6">
        {/* TABLE */}
        <div>
          {loading ? (
            <p>Loading problems...</p>
          ) : (
            <div className="table-card">
              <table className="w-full table-fixed">
                <colgroup>
                  <col style={{ width: "3.5rem" }} />
                  <col />
                  <col style={{ width: "5.5rem" }} />
                  <col style={{ width: "5rem" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th className="text-center">Difficulty</th>
                    <th className="text-center">Solved</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((p) => (
                      <tr key={p.id}>
                        <td className="text-sm sm:text-base">{p.id}</td>
                        <td className="whitespace-normal break-words text-sm sm:text-base">
                          <div className="flex flex-wrap items-center gap-1 md:gap-2">
                            <Link
                              to={`/problems/${p.id}`}
                              className="text-gray-600 hover:text-indigo-600"
                            >
                              {p.title}
                            </Link>
                            {Array.isArray(p.tags) &&
                              p.tags.map((t, i) => (
                                <span
                                  key={`${p.id}-tag-${i}`}
                                  className="badge-soft hidden md:inline-flex"
                                >
                                  {t}
                                </span>
                              ))}
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="badge-soft">
                            {p.difficultyRating ?? "—"}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="badge-soft">{p.solveCount ?? 0}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center muted">
                        No problems found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="hidden lg:block space-y-4">
          <div className="panel">
            <h3 className="font-semibold text-center mb-3">Stay Updated</h3>
            <div className="text-sm text-center">
              <div className="font-medium mb-1">
                {nextContest ? "Before contest" : "No upcoming contest"}
              </div>

              {nextContest && (
                <>
                  <div className="mb-1 font-semibold">{nextContest.title}</div>
                  <div className="mb-3 opacity-80 themed-text">
                    {formatParts(countdown)}
                  </div>

                  {!isRegistered && (
                    <Link
                      to={`/contests/${nextContest.id}/view`}
                      className="btn btn-sm"
                    >
                      Register
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="panel">
            <h3 className="font-semibold text-center mb-3">Filter Problems</h3>
            <div className="text-sm space-y-3">
              <div>
                <div className="mb-1">Difficulty:</div>
                <div className="flex items-center gap-2 justify-center">
                  <input
                    type="number"
                    placeholder="min"
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="input input-bordered input-sm w-full"
                  />
                  <span className="muted">—</span>
                  <input
                    type="number"
                    placeholder="max"
                    value={maxRating}
                    onChange={(e) => setMaxRating(e.target.value)}
                    className="input input-bordered input-sm w-full"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1">Tag (contains):</div>
                <input
                  type="text"
                  placeholder="e.g. dp, math"
                  value={tagQuery}
                  onChange={(e) => setTagQuery(e.target.value)}
                  className="input input-bordered input-sm w-full"
                />
              </div>

              <button onClick={applyFilters} className="btn btn-sm w-full">
                Apply
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* MOBILE SHEET */}
      {filtersOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFiltersOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-0 right-0 h-full w-80 max-w-[85%] shadow-xl p-4 panel flex flex-col gap-4 bg-base-100">
            <div className="flex items-center justify-between">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="font-semibold text-center mb-2">Stay Updated</h3>
              <div className="text-sm text-center">
                <div className="font-medium mb-1">
                  {nextContest ? "Before contest" : "No upcoming contest"}
                </div>

                {nextContest && (
                  <>
                    <div className="mb-1 font-semibold">{nextContest.title}</div>
                    <div className="mb-3 opacity-80 themed-text">
                      {formatParts(countdown)}
                    </div>

                    {!isRegistered && (
                      <Link
                        to={`/contests/${nextContest.id}/view`}
                        className="btn btn-sm w-full"
                        onClick={() => setFiltersOpen(false)}
                      >
                        Register
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-center mb-2">Filter Problems</h3>
              <div className="text-sm space-y-3">
                <div>
                  <div className="mb-1">Difficulty:</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="min"
                      value={minRating}
                      onChange={(e) => setMinRating(e.target.value)}
                      className="input input-bordered input-sm w-full"
                    />
                    <span className="muted">—</span>
                    <input
                      type="number"
                      placeholder="max"
                      value={maxRating}
                      onChange={(e) => setMaxRating(e.target.value)}
                      className="input input-bordered input-sm w-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1">Tag (contains):</div>
                  <input
                    type="text"
                    placeholder="e.g. dp, math"
                    value={tagQuery}
                    onChange={(e) => setTagQuery(e.target.value)}
                    className="input input-bordered input-sm w-full"
                  />
                </div>

                <button
                  onClick={() => {
                    applyFilters();
                    setFiltersOpen(false);
                  }}
                  className="btn btn-sm w-full"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
