// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

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
    <div className="w-full max-w-md">
      {/* Header / tagline */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-semibold">
          Welcome to <span className="font-bold">XorOJ</span>
        </h1>
        <p className="mt-3 text-sm md:text-base opacity-80 themed-text">
          Practice algorithms, run contests, and track your progress — all in one place.
        </p>
      </div>

      {/* Card */}
      <div
        className="rounded-xl p-6 md:p-7 shadow-sm"
        style={{
          backgroundColor: "var(--colour-1)",
          border: "1px solid var(--colour-5)",
        }}
      >
        <h2 className="text-xl md:text-2xl font-semibold text-center mb-2 themed-text">
          Sign in to your account
        </h2>
        <p className="text-center text-sm opacity-80 mb-6 themed-text">
          New here?{" "}
          <Link to="/register" className="link">
            Create an account
          </Link>
        </p>

        {err && (
          <p className="mb-3 px-3 py-2 rounded text-sm bg-red-50 text-red-700 border border-red-200">
            {err}
          </p>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1 themed-text">Username</label>
            <input
              className="input input-bordered w-full"
              placeholder="Enter your username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1 themed-text">Password</label>
            <div className="relative">
              <input
                className="input input-bordered w-full pr-10"
                placeholder="Enter your password"
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm opacity-70 hover:opacity-100"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={showPwd ? "Hide password" : "Show password"}
                title={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="checkbox checkbox-sm" />
              <span className="themed-text">Remember me</span>
            </label>
            <a className="link text-sm">Forgot password?</a>
          </div>

          <button className="btn btn-primary w-full mt-1">Sign in</button>
        </form>

        <div className="flex items-center my-6">
          <span className="flex-1 h-px" style={{ backgroundColor: "var(--colour-5)" }} />
          <span className="px-2 text-xs opacity-70 themed-text">or</span>
          <span className="flex-1 h-px" style={{ backgroundColor: "var(--colour-5)" }} />
        </div>

        <Link to="/register" className="btn btn-outline w-full">
          Create an account
        </Link>
      </div>

      {/* Small legal line */}
      <p className="mt-3 text-center text-xs opacity-70 themed-text">
        By continuing, you agree to our Terms and acknowledge our Privacy Policy.
      </p>
    </div>
  );
}
