// src/pages/Invocations.jsx
import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../../components/Button.jsx";

export default function Invocations() {
  const { problemData, setProblemData } = useOutletContext();
  const [invocations, setInvocations] = useState(problemData?.invocations || []);
  const [showModal, setShowModal] = useState(false);

  const [invocationId, setInvocationId] = useState("");
  const [selectedSolutions, setSelectedSolutions] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [viewInvocation, setViewInvocation] = useState(null);

  const problemId = problemData.id;

  useEffect(() => {
    if (problemData?.invocations) setInvocations(problemData.invocations);
  }, [problemData]);

  // Create new invocation
  const createInvocation = async () => {
    if (!invocationId.trim()) {
      alert("Invocation ID is required");
      return;
    }
    if (invocations.some((i) => i.id === invocationId)) {
      alert(`Invocation with ID "${invocationId}" already exists`);
      return;
    }
    if (selectedSolutions.length === 0 || selectedTests.length === 0) {
      alert("Select at least one solution and one test");
      return;
    }

    try {
      const body = {
        id: invocationId,
        solutions: selectedSolutions,
        tests: selectedTests,
      };
      const res = await apiFetch(`/api/edit/problems/${problemId}/invocations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res) throw new Error("Failed to create invocation");

      const saved = await res;
      const updated = [...invocations, saved];
      setInvocations(updated);
      setProblemData((prev) => ({ ...prev, invocations: updated }));

      // reset
      setInvocationId("");
      setSelectedSolutions([]);
      setSelectedTests([]);
      setShowModal(false);
    } catch (err) {
      // console.error(err);
      alert("Failed to create invocation");
    }
  };

  // Delete invocation
  const removeInvocation = async (id) => {
    try {
      const res = await apiFetch(`/api/edit/problems/${problemId}/invocations/${id}`, {
        method: "DELETE",
      });
      if (!res) throw new Error("Failed to delete invocation");

      const updated = invocations.filter((i) => i.id !== id);
      setInvocations(updated);
      setProblemData((prev) => ({ ...prev, invocations: updated }));
    } catch (err) {
      // console.error(err);
      alert("Failed to delete invocation");
    }
  };

  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Invocations</h1>

      {/* Add button */}
      <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 mb-4">
        + Add Invocation
      </Button>

      {/* Invocations Table */}
      <table className="w-full border text-left mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">#</th>
            <th className="p-2 border">Solutions</th>
            <th className="p-2 border">Tests</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Creation Time</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invocations.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-4 text-center text-gray-500">
                No invocations yet
              </td>
            </tr>
          ) : (
            invocations.map((inv) => (
              <tr key={inv.id}>
                <td className="p-2 border">{inv.id}</td>
                <td className="p-2 border">{inv.solutions.join(", ")}</td>
                <td className="p-2 border">tests: {inv.tests.join(", ")}</td>
                <td className="p-2 border">{inv.status}</td>
                <td className="p-2 border">{inv.createdAt}</td>
                <td className="p-2 border flex gap-2">
                  <Button
                    onClick={() => setViewInvocation(inv)}
                    className="bg-indigo-600 hover:bg-indigo-700 px-2 py-1 text-sm"
                  >
                    View
                  </Button>
                  <Button
                    onClick={() => removeInvocation(inv.id)}
                    className="bg-red-600 hover:bg-red-700 px-2 py-1 text-sm"
                  >
                    Remove
                  </Button>
                  <Button
                    onClick={() => alert("Rejudge logic here")}
                    className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 text-sm"
                  >
                    Rejudge
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal for New Invocation */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[800px]">
            <h2 className="text-xl font-bold mb-4">New Invocation</h2>

            {/* Unique ID input */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">Invocation ID</label>
              <input
                type="text"
                value={invocationId}
                onChange={(e) => setInvocationId(e.target.value)}
                className="w-full border rounded px-2 py-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Solutions Table */}
              <div>
                <h3 className="font-semibold mb-2">Solutions to run</h3>
                <table className="w-full border">
                  <tbody>
                    {problemData.solutionFiles?.map((s) => (
                      <tr key={s.id}>
                        <td className="border p-2">
                          <input
                            type="checkbox"
                            checked={selectedSolutions.includes(s.id)}
                            onChange={(e) =>
                              setSelectedSolutions((prev) =>
                                e.target.checked
                                  ? [...prev, s.id]
                                  : prev.filter((id) => id !== s.id)
                              )
                            }
                          />
                        </td>
                        <td className="border p-2">{s.filename}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tests Table */}
              <div>
                <h3 className="font-semibold mb-2">Tests to run</h3>
                <table className="w-full border">
                  <tbody>
                    {problemData.tests?.map((t) => (
                      <tr key={t.id}>
                        <td className="border p-2">
                          <input
                            type="checkbox"
                            checked={selectedTests.includes(t.id)}
                            onChange={(e) =>
                              setSelectedTests((prev) =>
                                e.target.checked
                                  ? [...prev, t.id]
                                  : prev.filter((id) => id !== t.id)
                              )
                            }
                          />
                        </td>
                        <td className="border p-2">{t.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <Button onClick={() => setShowModal(false)} className="bg-gray-400 hover:bg-gray-500">
                Cancel
              </Button>
              <Button onClick={createInvocation} className="bg-green-600 hover:bg-green-700">
                Run Judgement
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Invocation Results */}
      {viewInvocation && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">
            Invocation #{viewInvocation.id} Results
          </h2>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Test</th>
                {viewInvocation.solutions.map((s) => (
                  <th key={s} className="p-2 border">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {viewInvocation.tests.map((tid) => (
                <tr key={tid}>
                  <td className="p-2 border">{tid}</td>
                  {viewInvocation.solutions.map((sid) => (
                    <td key={sid} className="p-2 border text-center">
                      {viewInvocation.results?.[sid]?.[tid] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
