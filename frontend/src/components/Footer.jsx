import "../styles/styles.css";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="py-4 px-6" style={{
      background: "var(--bg-secondary)",
      borderTop: "1px solid var(--border-primary)",
      color: "var(--text-tertiary)",
    }}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>XorOJ</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/problems" className="hover:underline" style={{ color: "var(--text-tertiary)" }}>Problems</Link>
          <Link to="/contests" className="hover:underline" style={{ color: "var(--text-tertiary)" }}>Contests</Link>
          <Link to="/leaderboard" className="hover:underline" style={{ color: "var(--text-tertiary)" }}>Leaderboard</Link>
        </div>
      </div>
    </footer>
  );
}
