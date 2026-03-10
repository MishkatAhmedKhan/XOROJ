import "../styles/styles.css";

export default function Card({ title, children, className = "" }) {
  return (
    <div className={`panel ${className}`}>
      {title && (
        <h2 style={{
          fontSize: "1.15rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "0.75rem",
        }}>
          {title}
        </h2>
      )}
      <div style={{ color: "var(--text-primary)" }}>{children}</div>
    </div>
  );
}
