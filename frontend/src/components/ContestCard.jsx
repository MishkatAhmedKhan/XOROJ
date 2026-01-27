// src/components/ContestCard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import CountdownTimer from "./CountdownTimer.jsx";
import { apiFetch } from "../api/client";

export default function ContestCard({ contest }) {
  const [isRegistered, setIsRegistered] = useState(contest.registered);
  const now = new Date();
  const startTime = new Date(contest.startTime);
  const endTime = new Date(contest.endTime);
  const hasStarted = now >= startTime;
  const hasEnded = now >= endTime;

  const handleRegister = async () => {
    if (isRegistered || hasEnded) return;
    try {
      const res = await apiFetch(`/api/contests/${contest.id}/register`, { method: "POST" });
      if (res.success) setIsRegistered(true);
    } catch (err) {
      console.error("Registration failed", err);
    }
  };

  return (
    <div className="border rounded-lg shadow p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{contest.title}</h2>
        <span className="text-gray-500">{contest.visibility}</span>
      </div>
      <p>{contest.description}</p>
      <div>
        <strong>Start:</strong> {startTime.toLocaleString()} <br />
        <strong>End:</strong> {endTime.toLocaleString()} <br />
        <CountdownTimer startTime={hasEnded ? endTime : startTime} />
      </div>

      <div className="flex gap-2 flex-wrap mt-2">
        {!hasEnded && !isRegistered && (
          <button onClick={handleRegister} className="btn btn-primary btn-sm">
            Register
          </button>
        )}
        {hasStarted && (
          <Link to={`/contest/${contest.id}/standings`} className="btn btn-outline btn-sm">
            Standings
          </Link>
        )}
        {isRegistered && hasStarted && (
          <Link to={`/contest/${contest.id}/view`} className="btn btn-primary btn-sm">
            Enter
          </Link>
        )}
      </div>
    </div>
  );
}
