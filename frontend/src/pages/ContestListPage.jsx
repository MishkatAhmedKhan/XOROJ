import { useEffect, useState } from "react";

import { apiFetch } from "../api/client";

import ContestCard from "../components/ContestCard.jsx";

export default function ContestListPage() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/api/contests")
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Expected array of contests");
        setContests(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-6">Loading contests…</p>;
  if (error) return <p className="text-red-500 text-center mt-6">Error: {error}</p>;

  return (
    <>
    <div className="max-w-6xl mx-auto mt-6 px-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Contests</h1>
      {contests.length === 0 ? (
        <p className="text-gray-500">No contests available.</p>
      ) : (
        contests.map((contest) => (
          <ContestCard key={contest.id} contest={contest} />
        ))
      )}
    </div>
   </>
  );
}
