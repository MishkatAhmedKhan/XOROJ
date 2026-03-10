// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import "../styles/styles.css";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [err, setErr] = useState(
    params.get("reason") === "unauthorized"
      ? "Username or password is incorrect"
      : null
  );

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    try {
      await login(username, password);
      nav("/");
    } catch (e) {
      setErr(e.message || "Login failed");
    }
  }

  return (
    <div className="w-full max-w-md animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Welcome to <span className="font-bold" style={{ color: "var(--accent-500)" }}>XorOJ</span>
        </h1>
        <p className="mt-3 text-sm md:text-base" style={{ color: "var(--text-secondary)" }}>
          Practice algorithms, run contests, and track your progress — all in one place.
        </p>
      </div>

      {/* Card */}
      <div className="panel">
        <h2 className="text-xl md:text-2xl font-semibold text-center mb-2" style={{ color: "var(--text-primary)" }}>
          Sign in to your account
        </h2>
        <p className="text-center text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          New here?{" "}
          <Link to="/register" style={{ color: "var(--accent-500)", fontWeight: 500 }}>
            Create an account
          </Link>
        </p>

        {err && (
          <p className="mb-3 px-3 py-2 rounded-lg text-sm" style={{
            background: "var(--danger-bg)",
            color: "var(--danger)",
            border: "1px solid var(--danger)",
          }}>
            {err}
          </p>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Username</label>
            <input
              className="input w-full"
              placeholder="Enter your username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Password</label>
            <div className="relative">
              <input
                className="input w-full pr-10"
                placeholder="Enter your password"
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: "var(--text-tertiary)" }}
                onClick={() => setShowPwd((s) => !s)}
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer" style={{ color: "var(--text-secondary)" }}>
              <input type="checkbox" className="rounded" />
              <span>Remember me</span>
            </label>
            <a style={{ color: "var(--accent-500)", fontSize: ".85rem" }}>Forgot password?</a>
          </div>

          <button className="btn btn-primary w-full mt-1">Sign in</button>
        </form>

        <div className="flex items-center my-6">
          <span className="flex-1 h-px" style={{ background: "var(--border-primary)" }} />
          <span className="px-3 text-xs" style={{ color: "var(--text-tertiary)" }}>or</span>
          <span className="flex-1 h-px" style={{ background: "var(--border-primary)" }} />
        </div>

        <Link to="/register" className="btn w-full">
          Create an account
        </Link>
      </div>

      <p className="mt-3 text-center text-xs" style={{ color: "var(--text-tertiary)" }}>
        By continuing, you agree to our Terms and acknowledge our Privacy Policy.
      </p>
    </div>
  );
}
