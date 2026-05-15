import { HiOutlineNewspaper } from "react-icons/hi2";

const SourceCard = ({ source }) => {
  const score = typeof source.score === "number" ? (source.score * 100).toFixed(0) : "—";

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 8,
      padding: 14, borderRadius: 12,
      border: "1px solid var(--border-primary)",
      background: "var(--bg-primary)",
      transition: "border-color 0.15s"
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.35 }}>
          {source.title || "Untitled Article"}
        </span>
        <span style={{
          flexShrink: 0, fontSize: 10, fontWeight: 700, padding: "2px 8px",
          borderRadius: 6, background: "var(--accent-muted)", color: "var(--accent)"
        }}>
          {score}%
        </span>
      </div>

      <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
        {source.snippet || "No preview available."}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "var(--text-tertiary)", fontWeight: 500 }}>
        <HiOutlineNewspaper style={{ fontSize: 11 }} />
        <span>{source.source || "Unknown"}</span>
        {source.publishedAt && (
          <>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>{new Date(source.publishedAt).toLocaleDateString()}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default SourceCard;
