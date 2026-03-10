// src/pages/ProblemSet.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";

import "../styles/styles.css";

export default function ProblemSet() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  // filters
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [tagQuery, setTagQuery] = useState("");

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

  // ---------- load problems (server-side) ----------
  const loadProblems = async (page = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("size", pageSize);
      if (minRating) params.set("minRating", minRating);
      if (maxRating) params.set("maxRating", maxRating);
      if (tagQuery.trim()) params.set("tag", tagQuery.trim());

      const data = await apiFetch(`/api/problems?${params.toString()}`);
      setProblems(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setCurrentPage(data.currentPage || 0);
    } catch (err) {
      console.error("Failed to fetch problems", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems(0);
  }, []);

  const applyFilters = () => {
    loadProblems(0);
  };

  const goToPage = (p) => {
    if (p >= 0 && p < totalPages) {
      loadProblems(p);
    }
  };

  // ---------- load contests & choose next upcoming ----------
  useEffect(() => {
    let cancelled = false;

    async function loadContests() {
      try {
        const contests = await apiFetch("/api/contests");
        const now = Date.now();

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
        const reg = !!(detail?.isRegistered ?? detail?.registered ?? detail?.userRegistered);
        if (!cancelled) setIsRegistered(reg);
      } catch (e) {
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

  // ---------- pagination buttons ----------
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxVisible = 7;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);
    if (end - start < maxVisible) start = Math.max(0, end - maxVisible);

    for (let i = start; i < end; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0}
        >
          ‹
        </button>
        {pages.map((p) => (
          <button
            key={p}
            className={`pagination-btn ${p === currentPage ? "active" : ""}`}
            onClick={() => goToPage(p)}
          >
            {p + 1}
          </button>
        ))}
        <button
          className="pagination-btn"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
        >
          ›
        </button>
        <span className="pagination-info">
          {totalElements} problems
        </span>
      </div>
    );
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto mt-6 px-4">
        <div className="ide-error-banner">Error loading problems: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-6 px-4 animate-fadeIn">
      {/* Title + mobile filter button */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Problem Set</h1>
        <button
          className="lg:hidden btn btn-sm"
          aria-label="Open filters"
          onClick={() => setFiltersOpen(true)}
        >
          ⚙ Filters
        </button>
      </div>

      {/* Table + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_20rem] gap-6">
        {/* TABLE */}
        <div>
          {loading ? (
            <div className="text-center py-12" style={{ color: "var(--text-tertiary)" }}>
              <span className="ide-spinner" style={{ width: 24, height: 24, borderWidth: 3 }} /> Loading problems...
            </div>
          ) : (
            <>
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
                    {problems.length > 0 ? (
                      problems.map((p) => (
                        <tr key={p.id}>
                          <td style={{ color: "var(--text-tertiary)", fontSize: ".85rem" }}>{p.id}</td>
                          <td className="whitespace-normal break-words">
                            <div className="flex flex-wrap items-center gap-1 md:gap-2">
                              <Link to={`/problems/${p.id}`}>
                                {p.title}
                              </Link>
                              {Array.isArray(p.tags) &&
                                p.tags.map((t, i) => (
                                  <span
                                    key={`${p.id}-tag-${i}`}
                                    className="badge-tag hidden md:inline-flex"
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
                        <td colSpan={4} className="py-8 text-center" style={{ color: "var(--text-tertiary)" }}>
                          No problems found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {renderPagination()}
            </>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="hidden lg:block space-y-4">
          <div className="panel">
            <h3 className="font-semibold text-center mb-3" style={{ color: "var(--text-primary)" }}>Stay Updated</h3>
            <div className="text-sm text-center">
              <div className="font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                {nextContest ? "Before contest" : "No upcoming contest"}
              </div>

              {nextContest && (
                <>
                  <div className="mb-1 font-semibold" style={{ color: "var(--text-primary)" }}>{nextContest.title}</div>
                  <div className="mb-3" style={{ color: "var(--accent-500)", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatParts(countdown)}
                  </div>

                  {!isRegistered && (
                    <Link
                      to={`/contests/${nextContest.id}/view`}
                      className="btn btn-primary btn-sm"
                      style={{ width: "100%" }}
                    >
                      Register
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="panel">
            <h3 className="font-semibold text-center mb-3" style={{ color: "var(--text-primary)" }}>Filter Problems</h3>
            <div className="text-sm space-y-3">
              <div>
                <div className="mb-1" style={{ color: "var(--text-secondary)" }}>Difficulty:</div>
                <div className="flex items-center gap-2 justify-center">
                  <input
                    type="number"
                    placeholder="min"
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="input input-sm w-full"
                  />
                  <span style={{ color: "var(--text-tertiary)" }}>—</span>
                  <input
                    type="number"
                    placeholder="max"
                    value={maxRating}
                    onChange={(e) => setMaxRating(e.target.value)}
                    className="input input-sm w-full"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1" style={{ color: "var(--text-secondary)" }}>Tag (contains):</div>
                <input
                  type="text"
                  placeholder="e.g. dp, math"
                  value={tagQuery}
                  onChange={(e) => setTagQuery(e.target.value)}
                  className="input input-sm w-full"
                />
              </div>

              <button onClick={applyFilters} className="btn btn-primary btn-sm w-full">
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
          <div className="absolute top-0 right-0 h-full w-80 max-w-[85%] shadow-xl p-4 flex flex-col gap-4"
            style={{ background: "var(--card-bg)" }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filters</h3>
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
                    <div className="mb-3" style={{ color: "var(--accent-500)", fontWeight: 600 }}>
                      {formatParts(countdown)}
                    </div>

                    {!isRegistered && (
                      <Link
                        to={`/contests/${nextContest.id}/view`}
                        className="btn btn-primary btn-sm w-full"
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
                      className="input input-sm w-full"
                    />
                    <span className="muted">—</span>
                    <input
                      type="number"
                      placeholder="max"
                      value={maxRating}
                      onChange={(e) => setMaxRating(e.target.value)}
                      className="input input-sm w-full"
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
                    className="input input-sm w-full"
                  />
                </div>

                <button
                  onClick={() => {
                    applyFilters();
                    setFiltersOpen(false);
                  }}
                  className="btn btn-primary btn-sm w-full"
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
