// src/pages/problem-editor/Generator.jsx
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../../components/Button.jsx";
import { apiFetch } from "../../api/client.js";

export default function Generator() {
  const { problemData, setProblemData } = useOutletContext();
  const generators = problemData?.generatorFiles || [];

  const [showModal, setShowModal] = useState(false);
  const [newGenerator, setNewGenerator] = useState({ id: "", file: null });
  const [loading, setLoading] = useState(false);

  const problemId = problemData.id;

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".cpp")) {
      alert("Please upload .cpp file only!");
      e.target.value = null;
      return;
    }

    setNewGenerator((prev) => ({ ...prev, file }));
  };

  // Create generator file
  const createGenerator = async () => {
    if (!newGenerator.id.trim() || !newGenerator.file) {
      alert("Please provide both an ID and a .cpp file!");
      return;
    }

    if (generators.some((g) => g.generatorId === Number(newGenerator.id))) {
      alert("This ID already exists. Please choose another one.");
      return;
    }

    const formData = new FormData();
    formData.append("id", newGenerator.id);
    formData.append("file", newGenerator.file);

    try {
      setLoading(true);
      const res = await apiFetch(`/api/edit/problems/${problemId}/generator`, {
        method: "POST",
        body: formData,
        headers: {}, // Let browser set content type
      });

      if (!res || res.success === false) {
        throw new Error("Failed to create generator");
      }

      // Construct generator object in backend-like format
      const generatorObj = {
        id: {
          problemId: problemId,
          generatorId: Number(newGenerator.id),
        },
        fileName: newGenerator.file.name,
        filePath: null, // backend can return actual path if needed
        generatorId: Number(newGenerator.id),
      };

      // Update context state
      setProblemData((prev) => ({
        ...prev,
        generatorFiles: [...(prev.generatorFiles || []), generatorObj],
      }));

      setShowModal(false);
      setNewGenerator({ id: "", file: null });
    } catch (err) {
      alert("Failed to create generator");
    } finally {
      setLoading(false);
    }
  };

  // Delete generator
  const deleteGenerator = async (generatorId) => {
    try {
      const res = await apiFetch(
        `/api/edit/problems/${problemId}/generator/${generatorId}`,
        {
          method: "DELETE",
        }
      );

      if (!res || res.success === false) {
        throw new Error("Failed to delete generator");
      }

      setProblemData((prev) => ({
        ...prev,
        generatorFiles: (prev.generatorFiles || []).filter(
          (g) => g.generatorId !== generatorId
        ),
      }));
    } catch (err) {
      alert("Failed to delete generator");
    }
  };

  // View generator file
  const viewGenerator = (generatorId) => {
    const url = `/api/edit/problems/${problemId}/generator/${generatorId}/view`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Generators</h2>

      {/* Add Generator Button */}
      <div className="mb-4">
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Add Generator
        </Button>
      </div>

      {/* Generators Table */}
      {generators.length > 0 ? (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ID</th>
              <th className="border p-2">File</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {generators.map((g) => (
              <tr key={g.generatorId}>
                <td className="border p-2 text-center">{g.generatorId}</td>
                <td className="border p-2">{g.fileName}</td>
                <td className="border p-2 text-center space-x-2">
                  <Button
                    onClick={() => viewGenerator(g.generatorId)}
                    className="bg-green-600 hover:bg-green-700 px-2 py-1 text-sm"
                  >
                    View
                  </Button>
                  <Button
                    onClick={() => deleteGenerator(g.generatorId)}
                    className="bg-red-600 hover:bg-red-700 px-2 py-1 text-sm"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">No generators added yet.</p>
      )}

      {/* Modal for Add Generator */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Add Generator</h3>

            <label className="block mb-2">Generator ID (number)</label>
            <input
              type="number"
              min="1"
              className="w-full border rounded px-2 py-1 mb-3"
              value={newGenerator.id}
              onChange={(e) =>
                setNewGenerator({
                  ...newGenerator,
                  id: e.target.value.replace(/\D/g, ""), // only digits
                })
              }
            />

            <label className="block mb-2">Upload File (.cpp)</label>
            <input
              type="file"
              accept=".cpp"
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
                onClick={createGenerator}
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
