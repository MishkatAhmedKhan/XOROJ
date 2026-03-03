// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

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
    <div className="max-w-6xl mx-auto w-full">
      {/* Optional heading to match Login */}
      <section className="mt-8 md:mt-10 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold">
          Welcome to <span className="font-bold">XorOJ</span>
        </h1>
        <p className="mt-3 max-w-3xl mx-auto text-sm md:text-base opacity-80 themed-text">
          Practice algorithms, run contests, and track your progress — all in one place.
        </p>
      </section>

      {/* Card */}
      <main className="mx-auto mt-8 md:mt-10 w-full max-w-md">
        <div
          className="rounded-xl p-6 md:p-7 shadow-sm"
          style={{
            backgroundColor: "var(--colour-1)",
            border: "1px solid var(--colour-5)",
          }}
        >
          <h2 className="text-xl md:text-2xl font-semibold text-center mb-2 themed-text">
            Create your account
          </h2>
          <p className="text-center text-sm opacity-80 mb-6 themed-text">
            Already have an account?{" "}
            <Link to="/login" className="link">
              Login
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
                placeholder="Choose a username"
                value={f.username}
                onChange={(e) => setF({ ...f, username: e.target.value })}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 themed-text">Email</label>
              <input
                className="input input-bordered w-full"
                placeholder="you@example.com"
                value={f.email}
                onChange={(e) => setF({ ...f, email: e.target.value })}
                type="email"
                autoComplete="email"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1 themed-text">First name</label>
                <input
                  className="input input-bordered w-full"
                  placeholder="First name"
                  value={f.firstName}
                  onChange={(e) => setF({ ...f, firstName: e.target.value })}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 themed-text">Last name</label>
                <input
                  className="input input-bordered w-full"
                  placeholder="Last name"
                  value={f.lastName}
                  onChange={(e) => setF({ ...f, lastName: e.target.value })}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1 themed-text">Password</label>
              <div className="relative">
                <input
                  className="input input-bordered w-full pr-10"
                  placeholder="Create a strong password"
                  type={showPwd ? "text" : "password"}
                  value={f.password}
                  onChange={(e) => setF({ ...f, password: e.target.value })}
                  autoComplete="new-password"
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

            <button className="btn btn-primary w-full mt-1">Create account</button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <span
              className="flex-1 h-px"
              style={{ backgroundColor: "var(--colour-5)" }}
            />
            <span className="px-2 text-xs opacity-70 themed-text">or</span>
            <span
              className="flex-1 h-px"
              style={{ backgroundColor: "var(--colour-5)" }}
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Link to="/login" className="btn btn-outline w-full">
              Sign in to an existing account
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-xs opacity-70 themed-text">
          By continuing, you agree to our Terms and acknowledge our Privacy Policy.
        </p>
      </main>
    </div>
  );
}
