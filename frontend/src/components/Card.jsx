import "../styles/styles.css";

const cardStyles = {
  card: {
    backgroundColor: 'var(--colour-1)', 
    border: '1px solid var(--colour-5)',
    borderRadius: '0.5rem',
    padding: '1.25rem',
    boxShadow: '0 1px 2px var(--colour-6)'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: 'var(--colour-2)',
  },
  content: {
    fontSize: '1rem',
  }
};

export default function Card({ title, children, className = "" }) {
  return (
    <div
      className={className}
      style={cardStyles.card}
    >
      {title && <h2 style={cardStyles.title}>{title}</h2>}
      <div style={cardStyles.content}>{children}</div>
    </div>
  );
}
