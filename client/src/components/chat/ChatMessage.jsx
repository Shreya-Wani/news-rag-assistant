import { HiOutlineSparkles } from "react-icons/hi2";
import { RiRobot2Line, RiUser4Line } from "react-icons/ri";
import SourceCard from "./SourceCard.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

const ChatMessage = ({ message, onAnalyze }) => {
  const isUser = message.role === "user";

  return (
    <div className="animate-fade-in" style={{ display: "flex", gap: 12, flexDirection: isUser ? "row-reverse" : "row" }}>
      {/* Avatar */}
      <div style={{
        flexShrink: 0, width: 32, height: 32, borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
        background: isUser ? "var(--accent)" : "var(--bg-tertiary)",
        color: isUser ? "#fff" : "var(--text-secondary)"
      }}>
        {isUser ? <RiUser4Line /> : <RiRobot2Line />}
      </div>

      {/* Body */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: "75%", alignItems: isUser ? "flex-end" : "flex-start" }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 2px" }}>
          {isUser ? "You" : "NewsMind AI"}
        </span>

        <div style={{
          padding: "12px 16px", borderRadius: 16,
          borderTopRightRadius: isUser ? 4 : 16,
          borderTopLeftRadius: isUser ? 16 : 4,
          background: isUser ? "var(--accent)" : "var(--bg-secondary)",
          border: isUser ? "none" : "1px solid var(--border-primary)",
          color: isUser ? "#fff" : "var(--text-primary)",
          fontSize: 14, lineHeight: 1.65
        }}>
          {isUser ? (
            <span style={{ whiteSpace: "pre-wrap" }}>{message.content}</span>
          ) : (
            <div className="prose prose-invert prose-sm" style={{ maxWidth: "none" }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div style={{ width: "100%", marginTop: 4 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, padding: "0 2px" }}>
              Sources ({message.sources.length})
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8 }}>
              {message.sources.map((source, idx) => (
                <SourceCard key={idx} source={source} />
              ))}
            </div>
          </div>
        )}

        {/* Analyze */}
        {!isUser && onAnalyze && (
          <button
            onClick={() => onAnalyze(message.content)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 8,
              background: "var(--accent-muted)", color: "var(--accent)",
              fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer",
              transition: "all 0.15s", marginTop: 4
            }}
          >
            <HiOutlineSparkles style={{ fontSize: 12 }} />
            Analyze with AI
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
