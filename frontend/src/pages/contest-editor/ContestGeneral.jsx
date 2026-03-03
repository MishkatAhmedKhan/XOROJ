// src/pages/contest-editor/ContestGeneral.jsx
import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { apiFetch } from "../../api/client";

/** Convert ISO string to <input type="datetime-local"> value with seconds */
function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
}

/** Convert <input datetime-local> value back to ISO */
function fromLocalInputValue(s) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export default function ContestGeneral() {
  const { contestData, setContestData } = useOutletContext();

  const [title, setTitle] = useState(contestData.title || "");
  const [description, setDescription] = useState(contestData.description || "");
  const [startLocal, setStartLocal] = useState(toLocalInputValue(contestData.startTime));
  const [endLocal, setEndLocal] = useState(toLocalInputValue(contestData.endTime));

  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  // Derived JS dates
  const startDate = useMemo(() => (startLocal ? new Date(startLocal) : null), [startLocal]);
  const endDate = useMemo(() => (endLocal ? new Date(endLocal) : null), [endLocal]);

  // Validation rules
  const errors = useMemo(() => {
    const e = {};
    if (!title.trim()) e.title = "Title is required.";
    if (!startDate || Number.isNaN(startDate.getTime())) e.startTime = "Start time is required.";
    if (!endDate || Number.isNaN(endDate.getTime())) e.endTime = "End time is required.";
    if (!e.startTime && !e.endTime && endDate <= startDate) e.endTime = "End time must be after start time.";
    return e;
  }, [title, startDate, endDate]);

  const isValid = Object.keys(errors).length === 0;

  // Sync local fields when contestData changes
  useEffect(() => {
    setTitle(contestData.title || "");
    setDescription(contestData.description || "");
    setStartLocal(toLocalInputValue(contestData.startTime));
    setEndLocal(toLocalInputValue(contestData.endTime));
    console.log("contestData synced:", contestData);
  }, [contestData]);

  async function onSave(e) {
    e.preventDefault();
    setSaveErr("");
    if (!isValid) return;

    setSaving(true);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      startTime: startLocal,
      endTime: endLocal,
    };

    console.log("Posting payload:", payload);

    try {
      const result = await apiFetch(`/api/edit/contests/${contestData.id}/generalinfo`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      console.log("Server response:", result);

      if (result === true) {
        // API only returns true, so manually update contestData
        setContestData((prev) => ({
          ...prev,
          ...payload,
        }));
        console.log (startLocal, endLocal);
        console.log("contestData updated manually:", contestData);
      } else {
        setSaveErr("Failed to save contest. Server returned false.");
      }
    } catch (err) {
      console.error("Error saving contest:", err);
      setSaveErr(err?.message || "Failed to save contest.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSave} className="space-y-5 max-w-2xl">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input
          className={`input input-bordered w-full ${errors.title ? "input-error" : ""}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. XorOJ Weekly #1"
        />
        {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="textarea textarea-bordered w-full min-h-[100px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional: short info, rules, editorial links…"
        />
      </div>

      {/* Start time */}
      <div>
        <label className="block text-sm font-medium mb-1">Start time *</label>
        <input
          type="datetime-local"
          step="1"
          className={`input input-bordered w-full ${errors.startTime ? "input-error" : ""}`}
          value={startLocal}
          onChange={(e) => setStartLocal(e.target.value)}
          min={toLocalInputValue(new Date().toISOString())}
        />
        {errors.startTime && <p className="text-red-600 text-sm mt-1">{errors.startTime}</p>}
      </div>

      {/* End time */}
      <div>
        <label className="block text-sm font-medium mb-1">End time *</label>
        <input
          type="datetime-local"
          step="1"
          className={`input input-bordered w-full ${errors.endTime ? "input-error" : ""}`}
          value={endLocal}
          onChange={(e) => setEndLocal(e.target.value)}
          min={startLocal || undefined}
        />
        {errors.endTime && <p className="text-red-600 text-sm mt-1">{errors.endTime}</p>}
      </div>

      {/* Save actions */}
      {saveErr && <p className="text-red-600 text-sm">{saveErr}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!isValid || saving}
          title={!isValid ? "Please fix form errors before saving" : "Save"}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
