import { useEffect, useMemo, useState } from "react";
import { useParams, NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { apiFetch } from "../api/client.js";

export default function ProfilePage() {
  const { username } = useParams();
  const location = useLocation();

  const initialData = location.state?.profileData || null;

  const [profile, setProfile] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    apiFetch(`/api/profile/${username}`)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });


    return () => { cancelled = true; };
  }, [username]);

  const fullName = useMemo(() => {
    if (!profile) return "";
    const first = profile.firstName || "";
    const last = profile.lastName || "";
    const combined = `${first} ${last}`.trim();
    return combined || profile.username || "User";
  }, [profile]);

  const initials = useMemo(() => {
    if (!profile) return "";
    const pick = (s) => (s ? s[0].toUpperCase() : "");
    return (pick(profile.firstName) + pick(profile.lastName)) || pick(profile.username) || "U";
  }, [profile]);

  const navLinkClass =
    "px-3 py-2 -mb-px border-b-2 text-sm font-medium transition";
  const navLinkActive = ({ isActive }) =>
    `${navLinkClass} ${
      isActive
        ? "border-indigo-600 text-indigo-600"
        : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
    }`;

  if (loading) return <p className="p-6">Loading profile…</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;
  if (!profile) return <p className="p-6">Profile not found</p>;

  const isItMe = Boolean(profile?.isItMe);
  console.log (isItMe);
  // Tabs are only defined AFTER profile is loaded
  const tabs = [
    ...(isItMe? [{ name: "Edit Profile", path: "edit" }] : []),
    { name: "Submissions", path: "submissions" },
    { name: "Contest History", path: "contest-history" },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <section className="bg-base-200 rounded-2xl p-5 sm:p-6 border border-base-300">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-base-300 grid place-items-center text-2xl font-bold">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{fullName}</h1>
            <p className="text-gray-500">@{profile.username}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div>
            <span className="text-sm text-gray-500 block">Email</span>
            <span className="font-medium">{profile.email || "—"}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500 block">Institute</span>
            <span className="font-medium">{profile.institute || "—"}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500 block">Country</span>
            <span className="font-medium">{profile.country || "—"}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500 block">Contact</span>
            <span className="font-medium">{profile.contact || "—"}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500 block">Bio</span>
            <span className="font-medium">{profile.bio || "—"}</span>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <nav className="flex gap-4 border-b border-gray-200 mt-6 overflow-x-auto">
        {tabs.map((tab) => (
          <NavLink key={tab.path} to={tab.path} className={navLinkActive}>
            {tab.name}
          </NavLink>
        ))}
      </nav>

      {/* Outlet renders child tab component */}
      <Outlet key={profile.username} context={{ profile, setProfile }} />

       {/* External Links */}
      {isItMe && (
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/author/problems" className="btn">
            Problems Created
          </Link>
          <Link to="/author/contests" className="btn">
            Contests Hosted
          </Link>
        </div>
      )}
    </div>
  );
}
