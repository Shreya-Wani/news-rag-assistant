import { HiOutlinePlus, HiOutlineChatBubbleLeftRight, HiOutlineTrash } from "react-icons/hi2";

const ChatSidebar = ({ sessions, currentSessionId, onSelectSession, onNewSession, onDeleteSession }) => {
  return (
    <div style={{
      width: 260,
      height: "100%",
      borderRight: "1px solid var(--border-primary)",
      background: "var(--bg-primary)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      zIndex: 10
    }}>
      
      {/* New Chat Button Area */}
      <div style={{ padding: "20px 16px 12px 16px" }}>
        <button
          onClick={onNewSession}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 12,
            padding: "10px 14px",
            borderRadius: 8,
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          className="hover-opacity"
        >
          <HiOutlinePlus style={{ fontSize: 18 }} />
          New chat
        </button>
      </div>

      {/* Sessions List */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "8px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 4
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--text-tertiary)",
          padding: "8px 12px",
          marginTop: 8,
          marginBottom: 4,
          textTransform: "uppercase",
          letterSpacing: "0.05em"
        }}>
          Recent
        </div>

        {sessions.length === 0 ? (
          <div style={{ padding: "8px 12px", fontSize: 13, color: "var(--text-muted)" }}>
            No recent chats
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session.sessionId === currentSessionId;
            return (
              <div
                key={session.sessionId}
                onClick={() => onSelectSession(session.sessionId)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: isActive ? "var(--bg-secondary)" : "transparent",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  border: "none",
                  group: "true"
                }}
                className="session-item hover-bg-secondary"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, overflow: "hidden" }}>
                  <HiOutlineChatBubbleLeftRight style={{ 
                    fontSize: 18, 
                    color: isActive ? "var(--accent)" : "var(--text-secondary)", 
                    flexShrink: 0 
                  }} />
                  <span style={{
                    fontSize: 13,
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    fontWeight: isActive ? 500 : 400,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {session.title || "New Chat"}
                  </span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.sessionId);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 4,
                    opacity: isActive ? 1 : 0.4
                  }}
                  className="delete-btn hover-text-error"
                  title="Delete chat"
                >
                  <HiOutlineTrash style={{ fontSize: 16 }} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
