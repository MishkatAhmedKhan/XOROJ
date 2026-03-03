// src/pages/contest-editor/ContestProblems.jsx
import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../../components/Button.jsx";
import { apiFetch } from "../../api/client.js";

export default function ContestProblems() {
  const { contestData, setContestData } = useOutletContext();
  const [authorProblems, setAuthorProblems] = useState([]); // all problems user can select
  const [availableProblems, setAvailableProblems] = useState([]); // not in contest
  const [selectedProblemId, setSelectedProblemId] = useState("");

  // Load author's problems
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await apiFetch("/api/author/problems/my");
        setAuthorProblems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load author problems", err);
        setAuthorProblems([]);
      }
    };
    fetchProblems();
  }, []);

  // Update availableProblems whenever contestData or authorProblems change
  useEffect(() => {
    const selectedIds = new Set((contestData.problems || []).map((p) => p.id));
    setAvailableProblems(authorProblems.filter((p) => !selectedIds.has(p.id)));
  }, [contestData.problems, authorProblems]);

  const addProblem = () => {
    if (!selectedProblemId) return;

    // Ensure matching type
    const pid = typeof selectedProblemId === "string" ? parseInt(selectedProblemId) : selectedProblemId;

    const problemToAdd = availableProblems.find((p) => p.id === pid);
    if (!problemToAdd) return;

    const updatedProblems = [...(contestData.problems || []), problemToAdd];
    setContestData({ ...contestData, problems: updatedProblems });

    // Remove from dropdown immediately
    setAvailableProblems(availableProblems.filter((p) => p.id !== pid));

    setSelectedProblemId("");
  };


  const removeProblem = (id) => {
    const updatedProblems = (contestData.problems || []).filter((p) => p.id !== id);
    setContestData({ ...contestData, problems: updatedProblems });
  };

  const moveProblem = (index, direction) => {
    const updatedProblems = [...(contestData.problems || [])];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= updatedProblems.length) return;
    [updatedProblems[index], updatedProblems[newIndex]] = [updatedProblems[newIndex], updatedProblems[index]];
    setContestData({ ...contestData, problems: updatedProblems });
  };

  const handleSave = async () => {
    try {
      const payload = (contestData.problems || []).map((p, i) => ({
          first: Number(p.id),
          second: i + 1,
        }));
      const res = await apiFetch(`/api/edit/contests/${contestData.id}/problems`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res) throw new Error("Failed to save contest problems");
      alert("Saved successfully!");
    } catch (err) {
      alert("Failed to save contest problems");
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Add Problem Dropdown */}
      <div className="flex gap-2 items-center">
        <select
          className="border rounded px-2 py-1 flex-1"
          value={selectedProblemId}
          onChange={(e) => setSelectedProblemId(e.target.value)}
        >
          <option value="">Select a problem to add</option>
          {availableProblems.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} (ID: {p.problemNum || p.id})
            </option>
          ))}

        </select>
        <Button onClick={addProblem} disabled={!selectedProblemId}>
          Add Problem
        </Button>
      </div>

      {/* Problems Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Order</th>
            <th className="border p-2">Title</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(contestData.problems || []).map((p, index) => (
            <tr key={p.id}>
              <td className="border p-2 text-center">{index + 1}</td>
              <td className="border p-2">{p.title}</td>
              <td className="border p-2 text-center flex justify-center gap-1">
                <Button
                  className="bg-gray-400 hover:bg-gray-500 px-2 py-1 text-sm"
                  onClick={() => moveProblem(index, -1)}
                >
                  ↑
                </Button>
                <Button
                  className="bg-gray-400 hover:bg-gray-500 px-2 py-1 text-sm"
                  onClick={() => moveProblem(index, 1)}
                >
                  ↓
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 px-2 py-1 text-sm"
                  onClick={() => removeProblem(p.id)}
                >
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Button onClick={handleSave}>Save</Button>
    </div>
  );
}
