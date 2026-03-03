// src/pages/Tests.jsx
import React, { useState, useEffect } from "react";
import Button from "../../components/Button.jsx";
import { useOutletContext } from "react-router-dom";
import { apiFetch } from "../../api/client.js";

export default function Tests() {
  const { problemData, setProblemData } = useOutletContext();
  const [tests, setTests] = useState(problemData?.testFiles || []);
  const [showModal, setShowModal] = useState(false);
  const [newTest, setNewTest] = useState({ id: "", file: null });
  const [loading, setLoading] = useState(false);

  const problemId = problemData.id;

  // Sync tests if problemData changes
  useEffect(() => {
    if (problemData?.testFiles) setTests(problemData.testFiles);
  }, [problemData]);

  // Handle file selection
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
      alert("Please upload .txt file only!");
      e.target.value = null;
      return;
    }

    setNewTest((prev) => ({ ...prev, file }));
  };

  // Create a new test file
  const createTestFile = async () => {
    if (!newTest.id.trim() || !newTest.file) {
      alert("Please provide both an ID and a .txt file!");
      return;
    }

    if (tests.some((t) => t.testId === parseInt(newTest.id))) {
      alert("This ID already exists. Please choose another one.");
      return;
    }

    const formData = new FormData();
    formData.append("id", newTest.id);
    formData.append("file", newTest.file);

    try {
      setLoading(true);
      const res = await apiFetch(`/api/edit/problems/${problemId}/testfile`, {
        method: "POST",
        body: formData,
        headers: {}, // browser sets Content-Type
      });

      if (!res) throw new Error("Failed to create test file");

      // Construct the new test object
      const testObj = {
        testId: parseInt(newTest.id),
        fileName: newTest.file.name,
        filePath: res.filePath || "",
        id: { problemId, testId: parseInt(newTest.id) },
      };

      // Update context and local state
      setProblemData((prev) => ({
        ...prev,
        testFiles: [...(prev.testFiles || []), testObj],
      }));
      setTests((prev) => [...prev, testObj]);

      setNewTest({ id: "", file: null });
      setShowModal(false);
    } catch (err) {
      alert(err.message || "Failed to create test file");
    } finally {
      setLoading(false);
    }
  };

  // Delete a test file
  const deleteTestFile = async (testId) => {
    try {
      const res = await apiFetch(
        `/api/edit/problems/${problemId}/testfile/${testId}`,
        { method: "DELETE" }
      );

      if (!res) throw new Error("Failed to delete test file");

      const updatedTests = tests.filter((t) => t.testId !== testId);
      setTests(updatedTests);
      setProblemData((prev) => ({ ...prev, testFiles: updatedTests }));
    } catch (err) {
      alert(err.message || "Failed to delete test file");
    }
  };

  // View a test file
  const viewTestFile = (testId) => {
    const url = `/api/edit/problems/${problemId}/testfile/${testId}/view`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Tests</h1>

      {/* Add Test File Button */}
      <div className="mb-4">
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Add Test File
        </Button>
      </div>

      {/* Tests Table */}
      {tests.length > 0 ? (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
              <th className="border p-2">ID</th>
              <th className="border p-2">File</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((t) => {
              const testId = t.testId || t.id?.testId;
              return (
                <tr key={testId}>
                  <td className="border p-2 text-center">{testId}</td>
                  <td className="border p-2">{t.fileName}</td>
                  <td className="border p-2 text-center space-x-2">
                    <Button
                      onClick={() => viewTestFile(testId)}
                      className="bg-green-600 hover:bg-green-700 px-2 py-1 text-sm"
                    >
                      View
                    </Button>
                    <Button
                      onClick={() => deleteTestFile(testId)}
                      className="bg-red-600 hover:bg-red-700 px-2 py-1 text-sm"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          No test files added yet.
        </p>
      )}

      {/* Modal for Adding Test File */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
              Add Test File
            </h3>

            <label className="block mb-2 text-gray-700 dark:text-gray-200">
              Test ID (number)
            </label>
            <input
              type="number"
              min="1"
              className="w-full border border-gray-300 dark:border-slate-600 rounded px-3 py-2 mb-3 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newTest.id}
              onChange={(e) =>
                setNewTest({
                  ...newTest,
                  id: e.target.value.replace(/\D/g, ""),
                })
              }
            />

            <label className="block mb-2 text-gray-700 dark:text-gray-200">
              Upload File (.txt)
            </label>
            <input
              type="file"
              accept=".txt"
              className="w-full mb-3"
              onChange={handleFileUpload}
            />

            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 hover:bg-gray-500"
              >
                Cancel
              </Button>
              <Button
                onClick={createTestFile}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
