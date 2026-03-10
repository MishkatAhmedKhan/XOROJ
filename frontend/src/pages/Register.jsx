// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import "../styles/styles.css";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [f, setF] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    try {
      await register(f);
      nav("/");
    } catch (e) {
      setErr(e.message || "Registration failed");
    }
  }

  return (
    <div className="max-w-6xl mx-auto w-full animate-fadeIn">
      {/* Header */}
      <section className="mt-8 md:mt-10 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Welcome to <span className="font-bold" style={{ color: "var(--accent-500)" }}>XorOJ</span>
        </h1>
        <p className="mt-3 max-w-3xl mx-auto text-sm md:text-base" style={{ color: "var(--text-secondary)" }}>
          Practice algorithms, run contests, and track your progress — all in one place.
        </p>
      </section>

      <main className="mx-auto mt-8 md:mt-10 w-full max-w-md">
        <div className="panel">
          <h2 className="text-xl md:text-2xl font-semibold text-center mb-2" style={{ color: "var(--text-primary)" }}>
            Create your account
          </h2>
          <p className="text-center text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--accent-500)", fontWeight: 500 }}>
              Login
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
                placeholder="Choose a username"
                value={f.username}
                onChange={(e) => setF({ ...f, username: e.target.value })}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Email</label>
              <input
                className="input w-full"
                placeholder="you@example.com"
                value={f.email}
                onChange={(e) => setF({ ...f, email: e.target.value })}
                type="email"
                autoComplete="email"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>First name</label>
                <input
                  className="input w-full"
                  placeholder="First name"
                  value={f.firstName}
                  onChange={(e) => setF({ ...f, firstName: e.target.value })}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Last name</label>
                <input
                  className="input w-full"
                  placeholder="Last name"
                  value={f.lastName}
                  onChange={(e) => setF({ ...f, lastName: e.target.value })}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Password</label>
              <div className="relative">
                <input
                  className="input w-full pr-10"
                  placeholder="Create a strong password"
                  type={showPwd ? "text" : "password"}
                  value={f.password}
                  onChange={(e) => setF({ ...f, password: e.target.value })}
                  autoComplete="new-password"
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

            <button className="btn btn-primary w-full mt-1">Create account</button>
          </form>

          <div className="flex items-center my-6">
            <span className="flex-1 h-px" style={{ background: "var(--border-primary)" }} />
            <span className="px-3 text-xs" style={{ color: "var(--text-tertiary)" }}>or</span>
            <span className="flex-1 h-px" style={{ background: "var(--border-primary)" }} />
          </div>

          <Link to="/login" className="btn w-full">
            Sign in to an existing account
          </Link>
        </div>

        <p className="mt-4 text-center text-xs mb-8" style={{ color: "var(--text-tertiary)" }}>
          By continuing, you agree to our Terms and acknowledge our Privacy Policy.
        </p>
      </main>
    </div>
  );
}
