import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import Card from "../components/Card";

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableFilter, setTableFilter] = useState("");
  const [opFilter, setOpFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const SIZE = 20;

  useEffect(() => {
    setLoading(true);
    let url = `/api/db/audit?page=${page}&size=${SIZE}`;
    if (tableFilter) url += `&table=${tableFilter}`;
    if (opFilter) url += `&operation=${opFilter}`;

    apiFetch(url)
      .then((data) => {
        setLogs(data.content || []);
        setTotalPages(data.totalPages || 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, tableFilter, opFilter]);

  const getOpColor = (op) => {
    switch (op) {
      case "INSERT": return "#22c55e";
      case "UPDATE": return "#eab308";
      case "DELETE": return "#ef4444";
      default: return "inherit";
    }
  };

  if (error) return <div className="p-6 text-red-400">Error: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--colour-2)" }}>
        Audit Log
      </h1>
      <p className="text-sm mb-4 opacity-70">
        Automatically captured by database triggers on submissions, users, problems, and contests.
      </p>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select
          value={tableFilter}
          onChange={(e) => { setTableFilter(e.target.value); setPage(0); }}
          className="px-3 py-1.5 rounded text-sm"
          style={{ backgroundColor: "var(--colour-4)", color: "var(--colour-2)", border: "1px solid var(--colour-5)" }}
        >
          <option value="">All Tables</option>
          <option value="submissions">submissions</option>
          <option value="users">users</option>
          <option value="problems">problems</option>
          <option value="contest">contest</option>
        </select>
        <select
          value={opFilter}
          onChange={(e) => { setOpFilter(e.target.value); setPage(0); }}
          className="px-3 py-1.5 rounded text-sm"
          style={{ backgroundColor: "var(--colour-4)", color: "var(--colour-2)", border: "1px solid var(--colour-5)" }}
        >
          <option value="">All Operations</option>
          <option value="INSERT">INSERT</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="p-6 text-center opacity-60">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="p-6 text-center opacity-60">No audit records found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--colour-5)" }}>
                    <th className="p-3 text-left w-16">ID</th>
                    <th className="p-3 text-left">Table</th>
                    <th className="p-3 text-left">Op</th>
                    <th className="p-3 text-left">Row ID</th>
                    <th className="p-3 text-left">Time</th>
                    <th className="p-3 text-left w-16">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <>
                      <tr
                        key={log.id}
                        className="border-b transition-colors cursor-pointer hover:opacity-80"
                        style={{ borderColor: "var(--colour-5)" }}
                        onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                      >
                        <td className="p-3 font-mono text-xs">{log.id}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--colour-5)" }}>
                            {log.tableName}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-xs" style={{ color: getOpColor(log.operation) }}>
                            {log.operation}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{log.rowId}</td>
                        <td className="p-3 text-xs opacity-70">
                          {new Date(log.changedAt).toLocaleString()}
                        </td>
                        <td className="p-3 text-xs">{expandedId === log.id ? "▲" : "▼"}</td>
                      </tr>
                      {expandedId === log.id && (
                        <tr key={`${log.id}-detail`}>
                          <td colSpan={6} className="p-4" style={{ backgroundColor: "var(--colour-4)" }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {log.oldData && (
                                <div>
                                  <div className="text-xs font-bold mb-1 text-red-400">Old Data:</div>
                                  <pre className="text-xs overflow-auto max-h-40 p-2 rounded" style={{ backgroundColor: "var(--colour-1)" }}>
                                    {JSON.stringify(JSON.parse(log.oldData), null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.newData && (
                                <div>
                                  <div className="text-xs font-bold mb-1 text-green-400">New Data:</div>
                                  <pre className="text-xs overflow-auto max-h-40 p-2 rounded" style={{ backgroundColor: "var(--colour-1)" }}>
                                    {JSON.stringify(JSON.parse(log.newData), null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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
              <span className="text-sm opacity-70 flex items-center">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page + 1 >= totalPages}
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
