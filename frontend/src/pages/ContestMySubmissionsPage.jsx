import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { apiFetch } from "../api/client";

import Card from "../components/Card.jsx";

export default function ContestMySubmissionsPage() {
  const { id } = useParams(); // contest id
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contest, setContest] = useState(null);
  const [codePopup, setCodePopup] = useState(null); // state to manage the code popup

  // Fetch contest info first (to check registration + started)
  useEffect(() => {
    setLoading(true);
    
    // Simplified fetch - just get submissions
    apiFetch(`/api/submissions/contests/${id}/my`)
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Expected an array of submissions");
        }
        setSubmissions(data);
      })
      .catch((err) => {
        console.error("Failed to fetch submissions", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center mt-6">Loading submissions…</p>;
  if (error) return <p className="text-red-500 text-center mt-6">Error: {error}</p>;

  return (
    <>
      <div className="max-w-6xl mx-auto mt-6 px-4">
        <h1 className="text-2xl font-bold mb-4">My Submissions</h1>

        <Card>
          {submissions.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-700">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Problem</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Execution Time</th>
                  <th className="py-2 px-3">Memory Used</th>
                  <th className="py-2 px-3">View Code</th>
                </tr> 
              </thead>
              <tbody>
                {submissions.map((s, i) => (
                  <tr
                    key={s.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2 px-3">{i + 1}</td>
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
                    <td className="py-2 px-3">{s.executionTime} ms</td>
                    <td className="py-2 px-3">{s.memoryUsed / 1024} KB</td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => setCodePopup(s.code)}
                        className="btn btn-outline btn-sm"
                      >
                        View Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 py-4 text-center">
              You have not made any submissions yet.
            </p>
          )}
        </Card>

        <Link to={`/contests/${id}/view`} className="btn btn-secondary mt-4">
          Back to Contest
        </Link>
      </div>

      {/* Code Popup */}
      {codePopup && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg w-2/3">
            <h3 className="text-xl font-semibold mb-4">Submitted Code</h3>
            <pre className="overflow-x-auto">{codePopup}</pre>
            <button
              onClick={() => setCodePopup(null)}
              className="mt-4 btn btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </>
  );
}

// Helper function to style verdicts
function getVerdictColor(verdict) {
  if (!verdict) return "text-gray-700";
  switch (verdict.toLowerCase()) {
    case "accepted":
      return "text-green-600";
    case "wrong answer":
      return "text-red-600";
    case "runtime error":
      return "text-yellow-700";
    case "time limit exceeded":
      return "text-orange-600";
    default:
      return "text-gray-700";
  }
}
