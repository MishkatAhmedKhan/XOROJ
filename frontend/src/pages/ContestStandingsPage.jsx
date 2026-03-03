import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { apiFetch } from "../api/client";

export default function ContestStandingsPage() {
  const { id } = useParams(); // contestId from URL
  const [standings, setStandings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    apiFetch(`/api/standings/contests/${id}`)
      .then((data) => {
        console.log(data);
        // Validate that we got a proper DTO
        if (!data || !data.rows || !Array.isArray(data.rows)) {
          throw new Error("Expected a StandingsDTO with a rows array");
        }
        setStandings(data); // Store the full DTO
      })
      .catch((err) => {
        console.error("Failed to fetch standings", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading standings...</div>
      </div>
    );
  if (error)
    return (
      <div className="p-6">
        <div className="text-red-600 font-medium">Error: {error}</div>
      </div>
    );
  if (!standings)
    return (
      <div className="p-6">
        <div className="text-gray-600">No standings available</div>
      </div>
    );

  const { problemIds = [], rows = [], status, startEpochMs, endEpochMs, nowEpochMs } = standings;

  // convert ms → readable time
  const formatTime = (ms) => new Date(ms).toLocaleString();

  // small helper to generate initials/avatar
  const initials = (name) =>
    (name || "?")
      .split(" ")
      .map((s) => s[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // deterministic color class from username
  const avatarBg = (name) => {
    if (!name) return "bg-gray-200 text-gray-700";
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const colors = [
      "bg-red-100 text-red-800",
      "bg-amber-100 text-amber-800",
      "bg-green-100 text-green-800",
      "bg-teal-100 text-teal-800",
      "bg-blue-100 text-blue-800",
      "bg-violet-100 text-violet-800",
      "bg-pink-100 text-pink-800",
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  // status badge color
  const statusBadge = (s) => {
    switch ((s || "").toLowerCase()) {
      case "running":
        return "bg-emerald-100 text-emerald-800";
      case "finished":
        return "bg-slate-100 text-slate-700";
      case "upcoming":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Contest Standings
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${statusBadge(status)}`}>
                <span className="font-medium">{status}</span>
              </span>
              <div className="text-sm text-gray-500">Start: {formatTime(startEpochMs)}</div>
              <div className="text-sm text-gray-500">End: {formatTime(endEpochMs)}</div>
              <div className="text-sm text-gray-400">Now: {formatTime(nowEpochMs)}</div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="text-sm text-gray-600">Participants</div>
            <div className="text-2xl font-semibold text-slate-800">{rows.length}</div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm table-fixed">
            <thead className="bg-gradient-to-r from-slate-50 to-white sticky top-0">
              <tr className="text-left">
                <th className="w-16 px-4 py-3 border-b border-gray-100">#</th>
                <th className="w-64 px-4 py-3 border-b border-gray-100">User</th>
                <th className="w-24 px-4 py-3 border-b border-gray-100 text-center">Solved</th>
                <th className="w-28 px-4 py-3 border-b border-gray-100 text-center">Penalty</th>
                {problemIds.map((pid) => (
                  <th
                    key={pid}
                    className="px-3 py-3 border-b border-gray-100 text-center w-24"
                    title={`Problem ${pid}`}>
                    <div className="flex items-center justify-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-semibold">
                        P{pid}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white">
              {rows.map((row, idx) => (
                <tr key={row.userId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 border-b border-gray-100 align-top">{idx + 1}</td>

                  <td className="px-4 py-3 border-b border-gray-100 align-top">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${avatarBg(
                        row.username
                      )}`}>
                        {initials(row.username)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{row.username}</div>
                        <div className="text-xs text-gray-500">{row.userId}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 border-b border-gray-100 text-center align-top">
                    <div className="font-semibold text-slate-800">{row.solved}</div>
                  </td>

                  <td className="px-4 py-3 border-b border-gray-100 text-center align-top">
                    <div className="text-sm text-gray-600">{row.penaltyMinutes}</div>
                  </td>

                  {problemIds.map((pid) => {
                    const cell = row.cells?.[pid];
                    if (!cell)
                      return (
                        <td key={pid} className="px-3 py-3 border-b border-gray-100 text-center align-top">
                          <span className="text-gray-300">—</span>
                        </td>
                      );

                    // cell exists — keep rendering logic identical
                    return (
                      <td key={pid} className="px-3 py-3 border-b border-gray-100 text-center align-top">
                        {cell.timeFromStartMin !== null ? (
                          <div className="flex flex-col items-center">
                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold">
                              <span aria-hidden>✅</span>
                              <span>{cell.timeFromStartMin}m</span>
                            </span>
                            {cell.rejections > 0 && (
                              <span className="mt-1 text-xs text-red-500">-{cell.rejections}</span>
                            )}
                          </div>
                        ) : cell.rejections > 0 ? (
                          <div className="flex flex-col items-center">
                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-red-50 text-red-600 font-medium">
                              <span aria-hidden>❌</span>
                              <span>{cell.rejections}</span>
                            </span>
                          </div>
                        ) : (
                          <div className="text-gray-300">—</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 bg-slate-50 flex items-center justify-between text-sm">
          <div className="text-gray-600">Showing {rows.length} participants</div>
          <div className="text-gray-500">Last updated: {formatTime(nowEpochMs)}</div>
        </div>
      </div>
    </div>
  );
}
