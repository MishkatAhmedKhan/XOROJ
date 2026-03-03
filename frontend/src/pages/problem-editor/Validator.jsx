// src/pages/Validator.jsx
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../../components/Button.jsx";

export default function Validator() {
  const { problemData, setProblemData } = useOutletContext();

  const [validatorFile, setValidatorFile] = useState(problemData?.validatorFile || null);
  const [tests, setTests] = useState(problemData?.tests || []);
  const [showModal, setShowModal] = useState(false);
  const [newTest, setNewTest] = useState({ id: "", input: "", verdict: "VALID" });
  const [loading, setLoading] = useState(false);

  const problemId = problemData.id;

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".cpp")) {
      alert("Please upload a .cpp file!");
      e.target.value = null; // reset input
      return;
    }

    setValidatorFile(file);
  };

  // Add test (frontend only)
  const handleCreateTest = () => {
    if (!newTest.id.trim() || !newTest.input.trim()) {
      alert("Test ID and Input cannot be empty");
      return;
    }
    if (tests.some((t) => t.id === newTest.id)) {
      alert(`Test with ID "${newTest.id}" already exists`);
      return;
    }

    const updatedTests = [...tests, { ...newTest, validatorVerdict: null, validatorComment: null }];
    setTests(updatedTests);
    setShowModal(false);
    setNewTest({ id: "", input: "", verdict: "VALID" });

    // Update outlet context immediately
    setProblemData({ ...problemData, tests: updatedTests});
  };

  // Delete a test
  const handleDeleteTest = (id) => {
    if (window.confirm(`Delete test #${id}?`)) {
      const updatedTests = tests.filter((t) => t.id !== id);
      setTests(updatedTests);

      // Update outlet context
      setProblemData({ ...problemData, tests: updatedTests});
      
    }
  };

  // Run all tests
  const handleRunTests = async () => {
    if (!validatorFile) return alert("Please upload validator.cpp first!");
    setLoading(true);

    const updatedTests = [...tests];

    for (let i = 0; i < updatedTests.length; i++) {
      const test = updatedTests[i];
      const formData = new FormData();
      formData.append("validator", validatorFile);
      formData.append("input", test.input);

      try {
        const res = await apiFetch(
          `/api/edit/problems/${problemId}/validate/tests/${test.id}`,
          { method: "POST", body: formData }
        );
        const result = await res;
        updatedTests[i] = { ...test, validatorVerdict: result.verdict, validatorComment: result.comment };
      } catch (err) {
        // console.error(err);
        alert(`Failed to run test #${test.id}`);
      }
    }

    setTests(updatedTests);
    setProblemData({ ...problemData, tests: updatedTests});
    setLoading(false);
  };

  // Save all changes
  const handleSaveAll = async () => {
    try {
      const formData = new FormData();
      if (validatorFile) formData.append("validatorFile", validatorFile);
      formData.append("tests", JSON.stringify(tests));

      const res = await apiFetch(`/api/edit/problems/${problemId}/validate`, { method: "POST", body: formData });
      if (!res) throw new Error("Failed to save validator data");

      // Update outlet context with saved data
      setProblemData((prev) => ({ ...prev, validatorFile, tests }));

      alert("Validator data saved successfully!");
    } catch (err) {
      // console.error(err);
      alert("Failed to save validator data");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Validator</h2>

      {/* Upload validator.cpp */}
      <div className="mb-4">
        <input type="file" accept=".cpp" onChange={handleFileUpload} />
        {validatorFile && <p className="text-sm mt-1">Uploaded: {validatorFile.name}</p>}
      </div>

      {/* Buttons */}
      <div className="mb-4 flex justify-between">
        <Button onClick={handleSaveAll} className="bg-indigo-600 hover:bg-indigo-700">Save All</Button>
        <div className="flex gap-3">
          <Button onClick={handleRunTests} className="bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? "Running..." : "Run Tests"}
          </Button>
          <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">Add Test</Button>
        </div>
      </div>

      {/* Tests Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">#</th>
            <th className="border p-2">Input</th>
            <th className="border p-2">Expected Verdict</th>
            <th className="border p-2">Validator Verdict</th>
            <th className="border p-2">Validator Comment</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((t) => (
            <tr key={t.id}>
              <td className="border p-2 text-center">{t.id}</td>
              <td className="border p-2 whitespace-pre">{t.input}</td>
              <td className="border p-2 text-center">{t.verdict}</td>
              <td className="border p-2 text-center">{t.validatorVerdict || "-"}</td>
              <td className="border p-2 text-center">{t.validatorComment || "-"}</td>
              <td className="border p-2 text-center">
                <Button onClick={() => handleDeleteTest(t.id)} className="bg-red-600 hover:bg-red-700 px-2 py-1 text-sm">Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Add Test */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Add Test</h3>
            <label className="block mb-2">Test ID</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-3"
              value={newTest.id}
              onChange={e => setNewTest({ ...newTest, id: e.target.value })}
            />
            <label className="block mb-2">Input</label>
            <textarea
              className="w-full border rounded p-2 mb-3"
              rows="5"
              value={newTest.input}
              onChange={e => setNewTest({ ...newTest, input: e.target.value })}
            />
            <label className="block mb-2">Expected Verdict</label>
            <select
              className="w-full border rounded p-2 mb-3"
              value={newTest.verdict}
              onChange={e => setNewTest({ ...newTest, verdict: e.target.value })}
            >
              <option value="VALID">VALID</option>
              <option value="INVALID">INVALID</option>
            </select>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowModal(false)} className="bg-gray-400 hover:bg-gray-500">Cancel</Button>
              <Button onClick={handleCreateTest} className="bg-blue-600 hover:bg-blue-700">Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
