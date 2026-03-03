// src/pages/problem-editor/SolutionFiles.jsx
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../../components/Button.jsx";
import { apiFetch } from "../../api/client.js";

export default function SolutionFiles() {
  const { problemData, setProblemData } = useOutletContext();

  const [solution, setSolution] = useState(problemData?.solutionFile || null);
  const [newFile, setNewFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const problemId = problemData.id;

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".cpp")) {
      alert("Please upload a .cpp file only!");
      e.target.value = null;
      return;
    }

    setNewFile(file);
  };

  // Upload or replace solution file
  const uploadSolutionFile = async () => {
    if (!newFile) {
      alert("Please select a .cpp file");
      return;
    }

    const formData = new FormData();
    formData.append("file", newFile);

    try {
      setLoading(true);
      const res = await apiFetch(`/api/edit/problems/${problemId}/solution`, {
        method: "POST",
        body: formData,
        headers: {}, // let browser handle multipart
      });

      if (!res || res.success === false) {
        throw new Error("Failed to upload solution file");
      }

      const savedFile = {
        fileName: newFile.name,
        filePath: res.filePath || null,
      };

      setSolution(savedFile);
      setProblemData((prev) => ({
        ...prev,
        solutionFile: savedFile,
      }));

      setNewFile(null);
    } catch (err) {
      alert("Failed to upload solution file");
    } finally {
      setLoading(false);
    }
  };

  // Delete solution file
  const deleteSolutionFile = async () => {
    try {
      const res = await apiFetch(`/api/edit/problems/${problemId}/solution`, {
        method: "DELETE",
      });

      if (!res || res.success === false) {
        throw new Error("Failed to delete solution file");
      }

      setSolution(null);
      setProblemData((prev) => ({
        ...prev,
        solutionFile: null,
      }));
    } catch (err) {
      alert("Failed to delete solution file");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Solution File</h2>

      {/* Upload Input */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="file"
          accept=".cpp"
          onChange={handleFileUpload}
          className="border p-1"
        />
        <Button
          onClick={uploadSolutionFile}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={loading || !newFile}
        >
          {loading ? "Uploading..." : solution ? "Replace" : "Upload"}
        </Button>
      </div>

      {/* Current Solution */}
      {solution ? (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">File</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">{solution.fileName}</td>
              <td className="border p-2 text-center">
                <Button
                  onClick={deleteSolutionFile}
                  className="bg-red-600 hover:bg-red-700 px-2 py-1 text-sm"
                >
                  Delete
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">No solution file uploaded yet.</p>
      )}
    </div>
  );
}
