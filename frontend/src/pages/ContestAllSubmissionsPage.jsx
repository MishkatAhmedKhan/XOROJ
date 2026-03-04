import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";

import { apiFetch } from "../api/client";
import Card from "../components/Card.jsx";

export default function ContestAllSubmissionsPage() {
  const { id } = useParams(); // contest id
  const location = useLocation();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNumber, setPageNumber] = useState(1); // Track the current page
  const [totalPages, setTotalPages] = useState(0); // Track the total pages

  // Fetch submissions for the current page
  useEffect(() => {
    setLoading(true);

    apiFetch(`/api/submissions/contests/${id}/page/${pageNumber}`)
      .then((data) => {
        if (Array.isArray(data)) {
          // in case API just returns list (fallback)
          setSubmissions(data);
          setTotalPages(1);
        } else {
          setSubmissions(data.content || []);
          setTotalPages(data.totalPages || 1);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch all submissions", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id, pageNumber]);

  if (loading) return <p className="text-center mt-6">Loading submissions…</p>;
  if (error) return <p className="text-red-500 text-center mt-6">Error: {error}</p>;

  return (
    <>
      <div className="max-w-6xl mx-auto mt-6 px-4">
        <h1 className="text-2xl font-bold mb-4">All Submissions</h1>

        <Card>
          {submissions.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-700">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">User</th>
                  <th className="py-2 px-3">Problem</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Execution Time</th>
                  <th className="py-2 px-3">Memory Used</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s, i) => (
                  <tr
                    key={s.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2 px-3">
                      {(pageNumber - 1) * 20 + (i + 1)}
                    </td>
                    <td className="py-2 px-3">
                      <Link
                        to={`/profile/${s.userId}`} // Assuming you have a user page
                        className="text-indigo-600"
                      >
                        {s.userId}
                      </Link>
                    </td>
                    <td className="py-2 px-3">
                      <Link
                        to={`/problems/${s.problemId}`}
                        className="text-indigo-600"
                      >
                        {s.problemId}
                      </Link>
                    </td>
                    <td
                      className={`py-2 px-3 font-medium ${getVerdictColor(
                        s.status
                      )}`}
                    >
                      {s.status || "—"}
                    </td>
                    <td className="py-2 px-3">
                      {s.executionTime != null ? `${s.executionTime} ms` : "—"}
                    </td>
                    <td className="py-2 px-3">
                      {s.memoryUsed != null ? `${s.memoryUsed} KB` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 py-4 text-center">
              No submissions yet for this contest.
            </p>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber === 1}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {pageNumber} of {totalPages}
            </span>
            <button
              onClick={() => setPageNumber(Math.min(totalPages, pageNumber + 1))}
              disabled={pageNumber === totalPages}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        )}

        <Link to={`/contests/${id}/view`} className="btn btn-secondary mt-4">
          Back to Contest
        </Link>
      </div>
    </>
  );
}

// Helper function to style verdicts
function getVerdictColor(verdict) {
  if (!verdict) return "text-gray-700";
  switch (verdict.toUpperCase()) {
    case "ACCEPTED":
      return "text-green-600";
    case "WRONG_ANSWER":
      return "text-red-600";
    case "RUNTIME_ERROR":
      return "text-yellow-700";
    case "TIME_LIMIT_EXCEEDED":
      return "text-orange-600";
    case "MEMORY_LIMIT_EXCEEDED":
      return "text-orange-600";
    case "COMPILATION_ERROR":
      return "text-red-700";
    case "PENDING":
    case "RUNNING":
      return "text-blue-600";
    default:
      return "text-gray-700";
  }
}
