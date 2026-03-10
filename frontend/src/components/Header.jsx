import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import logo from "../assets/xorpic.png";

import "../styles/styles.css";

const TOKEN_KEY = "xoroj.jwt";

function parseJwt(token) {
  try {
    const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/") ?? "";
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function Header() {
  const navigate = useNavigate();

  // theme
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  // auth
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [profile, setProfile] = useState(null);
  const username = useMemo(() => (token ? parseJwt(token)?.sub ?? null : null), [token]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!username || !token) { setProfile(null); return; }
      try {
        const res = await fetch(`/api/profile/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) setProfile(data);
      } catch {
        if (!cancelled) setProfile(null);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [username, token]);

  const displayName =
    (profile?.firstName || profile?.lastName)
      ? `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim()
      : username || "Guest";

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    navigate("/login");
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  const navLinks = [
    { to: "/problems", label: "Problems" },
    { to: "/contests", label: "Contests" },
    { to: "/author", label: "Author" },
    { to: "/blogs", label: "Blogs" },
    { to: "/leaderboard", label: "Leaderboard" },
  ];

  return (
    <header className="navbar px-4 lg:px-6 sticky top-0 z-40" style={{
      background: "var(--navbar-bg)",
      backdropFilter: "blur(12px) saturate(180%)",
      WebkitBackdropFilter: "blur(12px) saturate(180%)",
      borderBottom: "1px solid var(--navbar-border)",
    }}>
      <div className="w-full flex items-center justify-between">
        {/* Left: brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center text-2xl lg:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            <img src={logo} alt="XorOJ" className="h-7 w-7 lg:h-8 lg:w-8 mr-2" />
            <span>Xor</span><span style={{ color: "var(--accent-500)" }}>OJ</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive
                    ? "font-semibold"
                    : "opacity-80 hover:opacity-100"}`
                }
                style={({ isActive }) => ({
                  color: isActive ? "var(--accent-500)" : "var(--text-primary)",
                  background: isActive ? "var(--accent-50)" : "transparent",
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme toggle - mobile */}
          <button
            className="lg:hidden p-2 rounded-lg"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
            style={{ color: "var(--text-primary)" }}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          {/* Theme toggle - desktop */}
          <button
            className="btn btn-sm hidden lg:inline-flex"
            onClick={toggleTheme}
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>

          {/* User menu */}
          {username ? (
            <div className="dropdown dropdown-end hidden lg:block">
              <div tabIndex={0} role="button" className="btn btn-sm">
                {displayName}
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu rounded-xl z-50 w-52 p-2 shadow-lg"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                }}
              >
                <li><Link to={`/profile/${username}`} style={{ color: "var(--text-primary)" }}>Profile</Link></li>
                <li><button onClick={handleLogout} style={{ color: "var(--text-primary)" }}>Logout</button></li>
              </ul>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="btn btn-sm">Login</Link>
              <Link to="/register" className="btn btn-sm btn-primary">Register</Link>
            </div>
          )}

          {/* Hamburger */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileOpen((s) => !s)}
            aria-label="Open menu"
            style={{ color: "var(--text-primary)" }}
          >
            <span className="block w-6 h-0.5 bg-current mb-1" />
            <span className="block w-6 h-0.5 bg-current mb-1" />
            <span className="block w-6 h-0.5 bg-current" />
          </button>
        </div>
      </div>

      {/* Mobile overlay panel */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={closeMobile} aria-hidden="true" />
          <div className="absolute top-0 right-0 h-full w-72 max-w-[85%] shadow-xl p-6 flex flex-col gap-4"
            style={{ background: "var(--card-bg)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <img src={logo} alt="XorOJ" className="w-8 h-8 rounded-full" />
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{displayName}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={closeMobile} aria-label="Close menu"
                style={{ color: "var(--text-primary)" }}>✕</button>
            </div>

            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMobile}
                className="text-lg py-1"
                style={{ color: "var(--text-primary)" }}
              >
                {link.label}
              </NavLink>
            ))}

            <div style={{ borderTop: "1px solid var(--border-primary)", margin: "0.5rem 0" }} />

            {username ? (
              <>
                <Link to={`/profile/${username}`} onClick={closeMobile}
                  className="text-lg py-1" style={{ color: "var(--text-primary)" }}>Profile</Link>
                <button onClick={() => { closeMobile(); handleLogout(); }}
                  className="text-left text-lg py-1" style={{ color: "var(--text-primary)" }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMobile} className="btn btn-primary btn-sm">Login</Link>
                <Link to="/register" onClick={closeMobile} className="btn btn-sm">Register</Link>
              </>
            )}

            <div className="mt-auto">
              <button className="btn w-full" onClick={toggleTheme}>
                {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
