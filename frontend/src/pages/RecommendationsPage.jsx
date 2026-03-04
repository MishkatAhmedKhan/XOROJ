import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import Card from "../components/Card";

/**
 * Recommendations Page — shows tag-based problem recommendations
 * computed by a cursor-based stored function.
 */
export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/api/db/recommendations?limit=15")
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Expected array");
        setRecommendations(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const getDifficultyColor = (rating) => {
    if (rating <= 1200) return "#22c55e";
    if (rating <= 1600) return "#3b82f6";
    if (rating <= 2000) return "#a855f7";
    if (rating <= 2800) return "#f97316";
    return "#ef4444";
  };

  if (error) return <div className="p-6 text-red-400">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--colour-2)" }}>
        Recommended Problems
      </h1>
      <p className="text-sm mb-6 opacity-70">
        Personalized recommendations based on your solved problem tags, computed by a cursor-based
        PL/pgSQL function (fn_recommend_problems).
      </p>

      {loading ? (
        <div className="p-6 text-center opacity-60">Analyzing your profile...</div>
      ) : recommendations.length === 0 ? (
        <Card>
          <div className="p-6 text-center opacity-60">
            Solve some problems first to get personalized recommendations!
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <Card key={rec.problemId}>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="text-lg font-mono font-bold opacity-40 w-8 text-center"
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <Link
                      to={`/problems/${rec.problemId}`}
                      className="font-semibold hover:underline"
                      style={{ color: "var(--colour-2)" }}
                    >
                      {rec.title}
                    </Link>
                    <div className="flex gap-3 mt-1 text-xs opacity-60">
                      <span>
                        Difficulty:{" "}
                        <span style={{ color: getDifficultyColor(rec.difficultyRating) }}>
                          {rec.difficultyRating}
                        </span>
                      </span>
                      <span>Solved by: {rec.solveCount}</span>
                      <span>Matching tags: {rec.matchingTags}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-50">Relevance</div>
                  <div
                    className="text-lg font-bold"
                    style={{ color: "var(--colour-3)" }}
                  >
                    {rec.relevanceScore}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
