import { useState } from "react";
import { apiFetch } from "../api/client";

export default function ContestRegisterButton({ contestId, initialStatus }) {
  const [registered, setRegistered] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    if (registered) return; // Already registered

    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/contests/${contestId}/register`, {
        method: "POST",
      });

      if (res.success) {
        setRegistered(true);
      } else {
        setError(res.message || "Failed to register");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleRegister}
        disabled={registered || loading}
        className={`btn btn-primary ${registered ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? "Registering..." : registered ? "Registered" : "Register"}
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
