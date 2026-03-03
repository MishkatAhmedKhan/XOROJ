// src/pages/ContestHistory.jsx
import { useEffect, useState } from "react";
import { useOutletContext, useParams, Link } from "react-router-dom";
import { apiFetch } from "../../api/client.js";

export default function ContestHistory() {
  const { username } = useParams();
  const { profile } = useOutletContext(); // from ProfilePage
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    setLoading(true);
    setError(null);

    apiFetch(`/api/profile/${username}/contests`)
      .then((data) => setContests(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [username]);

  const totalPages = Math.ceil(contests.length / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginated = contests.slice(start, end);

  if (loading) return <p className="p-6">Loading contest history…</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;
  if (!contests.length) return <p className="p-6">No contests found.</p>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Contest History</h2>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Title</th>
              <th className="px-4 py-2 text-left font-medium">Start Time</th>
              <th className="px-4 py-2 text-left font-medium">End Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-2">
                  <Link
                    to={`/contests/${c.id}/view`}
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    {c.title}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  {new Date(c.startTime).toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  {new Date(c.endTime).toLocaleString()}
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
