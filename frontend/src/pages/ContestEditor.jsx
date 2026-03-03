// src/pages/ContestEditor.jsx
import { useState, useEffect } from "react";
import { NavLink, Outlet, useParams, useLocation } from "react-router-dom";
import { apiFetch } from "../api/client.js";

const tabs = [
  { name: "General Info", path: "general" },
  { name: "Problems", path: "problems" },
  { name: "Participants", path: "participants" },
];

export default function ContestEditor() {
  const { contestId } = useParams();
  const location = useLocation();

  const initialData = location.state?.contestData || null;

  const [contestData, setContestData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (!initialData) {
      const fetchContest = async () => {
        try {
          const res = await apiFetch(`/api/contests/${contestId}/details`);
          if (!res) throw new Error("Failed to fetch contest data");
          setContestData(res);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchContest();
    }
  }, [contestId]);

  if (loading || !contestData) {
    return <p className="p-6">Loading contest data...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 themed-text">
        {`Contest: ${contestData.title}`}
      </h1>

      {/* Tabs */}
      <nav className="flex gap-4 border-b border-[var(--colour-5)] mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `px-3 py-2 -mb-px border-b-2 text-sm font-medium themed-text ${
                isActive
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent hover:border-[var(--colour-5)]"
              }`
            }
          >
            {tab.name}
          </NavLink>
        ))}
      </nav>

      {/* Active tab content */}
      <Outlet context={{ contestData, setContestData }} />
    </div>
  );
}
