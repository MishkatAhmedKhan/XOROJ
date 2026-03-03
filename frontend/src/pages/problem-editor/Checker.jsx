// src/pages/Checker.jsx
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../../components/Button.jsx";

export default function Checker() {
  const { problemData, setProblemData } = useOutletContext();
  const [checkerFile, setCheckerFile] = useState(problemData?.checkerFile || null);
  const [loading, setLoading] = useState(false);

  const problemId = problemData.id;

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".cpp")) {
      alert("Please upload a .cpp file only!");
      e.target.value = null; // reset input
      return;
    }

    setCheckerFile(file);
  };

  // Save checker file
  const handleSave = async () => {
    if (!checkerFile) {
      alert("Please select a checker file first!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("checkerFile", checkerFile);

      const res = await fetch(`/api/edit/problems/${problemId}/checker`, {
        method: "POST",
        body: formData,
      });

      if (!res) throw new Error("Failed to save checker file");

      // Update context
      setProblemData({ ...problemData, checkerFile})

      alert("Checker file saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save checker file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl">
      <h2 className="text-xl font-bold mb-4">Checker</h2>

      <div className="mb-4">
        <input type="file" accept=".cpp" onChange={handleFileUpload} />
        {checkerFile && <p className="text-sm mt-1">Selected: {checkerFile.name}</p>}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Checker"}
        </Button>
      </div>
    </div>
  );
}
