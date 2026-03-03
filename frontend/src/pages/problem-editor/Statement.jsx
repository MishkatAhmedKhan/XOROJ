// src/pages/Statement.jsx
import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../../components/Button.jsx";
import MathRenderer from "../../components/MathRenderer.jsx";
import { apiFetch } from "../../api/client.js";

export default function Statement() {
  const { problemData, setProblemData } = useOutletContext();
  const problemId = problemData?.id;

  // Local editable state
  const [description, setDescription] = useState("");
  const [inputFormat, setInputFormat] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [notes, setNotes] = useState("");
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");

  // Sync local state whenever problemData changes (handles tab switching)
  useEffect(() => {
    if (!problemData) return;
    setDescription(problemData.description || "");
    setInputFormat(problemData.inputFormat || "");
    setOutputFormat(problemData.outputFormat || "");
    setNotes(problemData.notes || "");
    setSampleInput(problemData.sampleInput || "");
    setSampleOutput(problemData.sampleOutput || "");
  }, [problemData]);

  // Save handler
  const handleSave = async () => {
    const payload = { description, inputFormat, outputFormat, notes, sampleInput, sampleOutput };

    try {
      const res = await apiFetch(`/api/edit/problems/${problemId}/statement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res) throw new Error("Failed to save statement");

      // Update shared problemData in context
      setProblemData({ ...problemData, ...payload });

      alert("Statement saved successfully!");
    } catch (err) {
      alert("Failed to save statement");
    }
  };

  // Live preview HTML
  const previewContent = `
    <div style="text-align: center; margin-bottom: 2rem;">
      <h1 style="font-size: 1.75rem; font-weight: 700; margin: 0; color: #1f2937;">
        ${problemData?.title || "Untitled Problem"}
      </h1>
      <p style="margin: 0.25rem 0; font-size: 0.95rem; color: #4b5563;">
        Time Limit: <strong>${problemData?.timeLimit || 1000} ms</strong>
      </p>
      <p style="margin: 0.25rem 0; font-size: 0.95rem; color: #4b5563;">
        Memory Limit: <strong>${problemData?.memoryLimit || 256} MB</strong>
      </p>
    </div>

    <div style="text-align: left; font-size: 1rem; line-height: 1.6; color: #111827;">
      <p>${description || "<em>No description provided.</em>"}</p>

      <h2 style="font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: #1f2937;">
        Input
      </h2>
      <p>${inputFormat || "<em>No input format provided.</em>"}</p>

      <h2 style="font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: #1f2937;">
        Output
      </h2>
      <p>${outputFormat || "<em>No output format provided.</em>"}</p>

      <h2 style="font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: #1f2937;">
        Sample Input
      </h2>
      <pre style="background: #f3f4f6; padding: 0.75rem 1rem; border-radius: 0.5rem; overflow-x: auto; font-family: monospace; font-size: 0.95rem; color: #111827;">
${sampleInput || " "}
      </pre>

      <h2 style="font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: #1f2937;">
        Sample Output
      </h2>
      <pre style="background: #f3f4f6; padding: 0.75rem 1rem; border-radius: 0.5rem; overflow-x: auto; font-family: monospace; font-size: 0.95rem; color: #111827;">
${sampleOutput || " "}
      </pre>

      <h2 style="font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: #1f2937;">
        Notes
      </h2>
      <p>${notes || "<em>No notes.</em>"}</p>
    </div>
  `;

  return (
    <div className="flex gap-6">
      {/* Left: Editor fields */}
      <div className="flex-1 space-y-4 max-w-xl">
        <Field label="Description (LaTeX)" value={description} setValue={setDescription} rows={4} />
        <Field label="Input Format (LaTeX)" value={inputFormat} setValue={setInputFormat} rows={2} />
        <Field label="Output Format (LaTeX)" value={outputFormat} setValue={setOutputFormat} rows={2} />
        <Field label="Notes (LaTeX)" value={notes} setValue={setNotes} rows={2} />
        <Field label="Sample Input" value={sampleInput} setValue={setSampleInput} rows={2} />
        <Field label="Sample Output" value={sampleOutput} setValue={setSampleOutput} rows={2} />

        <div className="flex gap-2 mt-4">
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            Save
          </Button>
        </div>
      </div>

      {/* Right: Live preview */}
      <div className="flex-1 border p-4 max-w-full overflow-auto bg-gray-50">
        <MathRenderer content={previewContent} />
      </div>
    </div>
  );
}

// Reusable Field component
function Field({ label, value, setValue, rows = 2 }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <textarea
        rows={rows}
        className="w-full border rounded px-2 py-1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
