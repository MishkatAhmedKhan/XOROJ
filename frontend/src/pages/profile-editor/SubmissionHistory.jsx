// src/pages/Submissions.jsx
import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { apiFetch } from "../../api/client.js";

export default function Submissions() {
  const { username } = useParams();
  const { profile } = useOutletContext(); // comes from ProfilePage
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    setLoading(true);
    setError(null);

    apiFetch(`/api/profile/${username}/submissions`)
      .then((data) => setSubmissions(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [username]);

  const totalPages = Math.ceil(submissions.length / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginated = submissions.slice(start, end);

  if (loading) return <p className="p-6">Loading submissions…</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;
  if (!submissions.length) return <p className="p-6">No submissions yet.</p>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Submissions</h2>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Problem</th>
              <th className="px-4 py-2 text-left font-medium">Language</th>
              <th className="px-4 py-2 text-left font-medium">Status</th>
              <th className="px-4 py-2 text-left font-medium">Exec Time</th>
              <th className="px-4 py-2 text-left font-medium">Memory</th>
              <th className="px-4 py-2 text-left font-medium">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2">{s.problemId}</td>
                <td className="px-4 py-2">{s.language}</td>
                <td
                  className={`px-4 py-2 font-medium ${
                    s.status === "ACCEPTED"
                      ? "text-green-600"
                      : s.status === "WRONG_ANSWER"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {s.status}
                </td>
                <td className="px-4 py-2">
                  {s.executionTime != null ? `${s.executionTime} ms` : "—"}
                </td>
                <td className="px-4 py-2">
                  {s.memoryUsed != null ? `${s.memoryUsed} KB` : "—"}
                </td>
                <td className="px-4 py-2">
                  {new Date(s.submissionTime).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-4">
          <button
            className="btn btn-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
