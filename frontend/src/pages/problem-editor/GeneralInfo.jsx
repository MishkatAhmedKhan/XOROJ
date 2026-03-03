// src/pages/problem-editor/GeneralInfo.jsx
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../../components/Button.jsx";

import { apiFetch } from "../../api/client.js";

// TagsInput Component
function TagsInput({ problemData, setProblemData, availableTags }) {
  const [newTag, setNewTag] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const tags = problemData.tags || [];

  const options = availableTags.filter(
    (t) => !tags.includes(t) && t.toLowerCase().includes(newTag.toLowerCase())
  );

  const addTag = (tag) => {
    setProblemData({ ...problemData, tags: [...tags, tag] });
    setNewTag("");
    setShowDropdown(false);
  };

  const removeTag = (tag) => {
    setProblemData({ ...problemData, tags: tags.filter((t) => t !== tag) });
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-indigo-600 font-bold"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <input
        type="text"
        className="w-full border rounded px-2 py-1"
        placeholder="Add a tag..."
        value={newTag}
        onChange={(e) => {
          setNewTag(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
      />

      {showDropdown && options.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded w-full mt-1 max-h-40 overflow-y-auto shadow-md">
          {options.map((opt) => (
            <li
              key={opt}
              className="px-2 py-1 hover:bg-indigo-100 cursor-pointer"
              onClick={() => addTag(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function GeneralInfo() {
  const { problemData, setProblemData } = useOutletContext();

  const availableTags = ["DP", "Graph", "Math", "Greedy", "String", "Implementation"];

  const handleSave = async () => {
    try {
      // Only send the selected fields
      const payload = {
        inputFileType: problemData.inputFileType || "",
        outputFileType: problemData.outputFileType || "",
        difficultyRating: problemData.difficultyRating || 800,
        timeLimit: problemData.timeLimit || 1000,
        memoryLimit: problemData.memoryLimit || 256,
        contestId: problemData.contestId || "",
        tags: problemData.tags || [],
      };
      payload.memoryLimit *= 1024; // Convert MB to KB
      console.log("Sending general info update:", payload);
      const res = await apiFetch(`/api/edit/problems/${problemData.id}/generalinfo`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res) throw new Error("Failed to save general info");

      setProblemData({ ...problemData, ...payload });

      alert("Saved successfully!");
    } catch (err) {
      // console.error(err);
      alert("Failed to save general info");
    }
  };

  if (!problemData) return <p className="p-6">Loading problem data...</p>;

  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <label className="block font-medium">Input File</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={problemData.inputFile || ""}
          onChange={(e) => setProblemData({ ...problemData, inputFile: e.target.value })}
        />
      </div>

      <div>
        <label className="block font-medium">Output File</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={problemData.outputFile || ""}
          onChange={(e) => setProblemData({ ...problemData, outputFile: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Time Limit (ms)</label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1"
            value={problemData.timeLimit || 1000}
            onChange={(e) =>
              setProblemData({ ...problemData, timeLimit: Number(e.target.value) })
            }
            min={250}
            max={15000}
          />
        </div>

        <div>
          <label className="block font-medium">Memory Limit (MB)</label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1"
            value={problemData.memoryLimit / 1024 || 256}
            onChange={(e) =>
              setProblemData({ ...problemData, memoryLimit: Number(e.target.value) })
            }
            min={4}
            max={1024}
          />
        </div>
      </div>

      {/* <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={problemData.interactive || false}
          onChange={(e) =>
            setProblemData({ ...problemData, interactive: e.target.checked })
          }
        />
        <label>Interactive Problem</label>
      </div> */}

      <div>
        <label className="block font-medium">Contest</label>
        <input
          className="w-full border rounded px-2 py-1"
          placeholder="Contest ID (optional)"
          value={problemData.contestId || ""}
          onChange={(e) =>
            setProblemData({ ...problemData, contestId: e.target.value })
          }
        />
      </div>

      <div>
        <label className="block font-medium">Difficulty Rating (800–4000)</label>
        <input
          type="number"
          className="w-full border rounded px-2 py-1"
          min={800}         // updated
          max={4000}        // updated
          value={problemData.difficultyRating || 800} // default to min
          onChange={(e) =>
            setProblemData({ ...problemData, difficultyRating: Number(e.target.value) })
          }
        />
      </div>


      <div>
        <label className="block font-medium">Tags</label>
        <TagsInput
          problemData={problemData}
          setProblemData={setProblemData}
          availableTags={availableTags}
        />
      </div>

      <div>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}
