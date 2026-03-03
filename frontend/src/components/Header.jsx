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

  return (
    <header className="navbar px-4 lg:px-6 sticky top-0 z-40">
      <div className="w-full flex items-center justify-between">
        {/* Left: brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center text-2xl lg:text-3xl font-bold">
            <img src={logo} alt="XorOJ" className="h-7 w-7 lg:h-8 lg:w-8 mr-2" />
            XorOJ
          </Link>

          {/* Desktop nav: visible lg+ */}
          <nav className="hidden lg:flex items-center gap-6 ml-4">
            <NavLink
              to="/problems"
              className={({ isActive }) =>
                `link link-hover ${isActive ? "font-semibold" : "opacity-90"}`
              }
            >
              Problems
            </NavLink>
            <NavLink
              to="/contests"
              className={({ isActive }) =>
                `link link-hover ${isActive ? "font-semibold" : "opacity-90"}`
              }
            >
              Contests
            </NavLink>
            {/* Author goes to /author */}
            <NavLink
              to="/author"
              className={({ isActive }) =>
                `link link-hover ${isActive ? "font-semibold" : "opacity-90"}`
              }
            >
              Author
            </NavLink>
          </nav>
        </div>

        {/* Right: theme + user + hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme toggle */}
          <button
            className="lg:hidden p-2 rounded-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <button className="btn btn-primary hidden lg:inline-flex" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>

          {/* User menu: hide on mobile; show only lg+ */}
          {username ? (
            <div className="dropdown dropdown-end hidden lg:block">
              <div tabIndex={0} role="button" className="btn btn-sm">
                {displayName}
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow border border-base-200"
              >
                <li><Link to={`/profile/${username}`}>Profile</Link></li>
                <li><button onClick={handleLogout}>Logout</button></li>
              </ul>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="btn btn-sm">Login</Link>
              <Link to="/register" className="btn btn-sm btn-outline">Register</Link>
            </div>
          )}

          {/* Hamburger (mobile only) */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileOpen((s) => !s)}
            aria-label="Open menu"
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
          <div className="absolute top-0 right-0 h-full w-72 max-w-[85%] bg-base-100 shadow-xl p-6 flex flex-col gap-4">
            {/* Top row: avatar, close */}
            <div className="flex items-center justify-between mb-2">
              <div className="avatar">
                <div className="w-10 h-10 rounded-full ring ring-offset-base-100 ring-offset-2 overflow-hidden">
                  {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="User avatar" /> : <img src={logo} alt="User avatar" />}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={closeMobile} aria-label="Close menu">✕</button>
            </div>

            {/* Nav links */}
            <NavLink to="/problems" onClick={closeMobile} className="link link-hover text-lg">Problems</NavLink>
            <NavLink to="/contests" onClick={closeMobile} className="link link-hover text-lg">Contests</NavLink>
            <NavLink to="/author" onClick={closeMobile} className="link link-hover text-lg">Author</NavLink>

            <div className="divider my-2" />

            {username ? (
              <>
                <Link to={`/profile/${username}`} onClick={closeMobile} className="link link-hover text-lg">Profile</Link>
                <button onClick={() => { closeMobile(); handleLogout(); }} className="link link-hover text-left text-lg">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMobile} className="btn btn-sm btn-primary">Login</Link>
                <Link to="/register" onClick={closeMobile} className="btn btn-sm btn-outline">Register</Link>
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
