import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";

export default function ProblemSet() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/api/problems")
      .then((data) => {
        // Ensure data is an array
        if (!Array.isArray(data)) {
          throw new Error('Expected an array of problems');
        }
        setProblems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch problems", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (error) {
    return <div className="max-w-5xl mx-auto mt-6 px-4">
      <p className="text-red-500">Error loading problems: {error}</p>
    </div>;
  }

  return (
    <div className="max-w-5xl mx-auto mt-6 px-4">
      <h1 className="text-2xl font-bold mb-4">Problem Set</h1>

      {loading ? (
        <p>Loading problems...</p>
      ) : (
        <Card>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Title</th>
                <th className="py-2 px-3">Difficulty</th>
                <th className="py-2 px-3">Solved</th>
              </tr>
            </thead>
            <tbody>
              {problems && problems.length > 0 ? (
                problems.map((p, i) => (
                  <tr
                    key={p.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2 px-3">{i + 1}</td>
                    <td className="py-2 px-3 text-indigo-600">
                      <Link to={`/problems/${p.id}`}>{p.title}</Link>
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${p.difficulty === "Easy"
                            ? "bg-green-100 text-green-700"
                            : p.difficulty === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                      >
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="py-2 px-3">{p.solved}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-gray-500">
                    No problems found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}