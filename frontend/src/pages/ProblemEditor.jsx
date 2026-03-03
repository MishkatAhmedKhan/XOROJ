import { useState, useEffect } from "react";
import { NavLink, Outlet, useParams, useLocation } from "react-router-dom";
import { apiFetch } from "../api/client.js";

const tabs = [
  { name: "General Info", path: "general" },
  { name: "Statement", path: "statement" },
  { name: "Generator", path: "generator" },
  { name: "Checker", path: "checker" },
  { name: "Tests", path: "tests" },
  { name: "Solution Files", path: "solutions" },
];

export default function ProblemEditor() {
  const { problemId } = useParams();
  const location = useLocation();

  const initialData = location.state?.problemData || null;

  const [problemData, setProblemData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);

  // Fetch problem data if not present
  useEffect(() => {
    if (initialData) return;

    let cancelled = false;

    const fetchProblem = async () => {
      try {
        const res = await apiFetch(`/api/problems/${problemId}`);
        if (!res) throw new Error("Failed to fetch problem data");
        if (!cancelled) setProblemData(res);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProblem();

    return () => {
      cancelled = true;
    };
  }, [problemId, initialData]);

  if (loading || !problemData) {
    return <p className="p-6">Loading problem data...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {`Problem Title: ${problemData.title}`}
      </h1>

      {/* Navigation Tabs */}
      <nav className="flex gap-4 border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `px-3 py-2 -mb-px border-b-2 text-sm font-medium ${
                isActive
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
              }`
            }
          >
            {tab.name}
          </NavLink>
        ))}
      </nav>

      {/* Outlet renders child tab component */}
      {/* Add key so child remounts whenever problemData changes */}
      <Outlet key={problemData.id} context={{ problemData, setProblemData }} />
    </div>
  );
}
