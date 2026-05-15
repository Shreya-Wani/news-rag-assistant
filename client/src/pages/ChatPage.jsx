import { useState, useRef, useEffect, useCallback } from "react";
import { HiOutlineChatBubbleLeftRight, HiOutlinePaperAirplane, HiOutlineSparkles, HiOutlineBookOpen } from "react-icons/hi2";
import ChatMessage from "../components/chat/ChatMessage.jsx";
import LoadingDots from "../components/chat/LoadingDots.jsx";
import ChatSidebar from "../components/chat/ChatSidebar.jsx";
import chatService from "../services/chatService.js";
import toast from "react-hot-toast";

const suggestions = [
  { text: "Latest tech headlines", icon: HiOutlineBookOpen },
  { text: "Recent political events", icon: HiOutlineBookOpen },
  { text: "Science breakthroughs", icon: HiOutlineBookOpen },
  { text: "Market and economy updates", icon: HiOutlineBookOpen }
];

const ChatPage = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);
  useEffect(() => { inputRef.current?.focus(); }, [currentSessionId]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const res = await chatService.getSessions();
      if (res?.success && res.data?.sessions) {
        setSessions(res.data.sessions);
      }
    } catch (err) {
      console.error("Failed to load sessions", err);
    }
  };

  const loadChatHistory = useCallback(async (sessionId) => {
    setIsLoading(true);
    try {
      const res = await chatService.getChatHistory(sessionId);
      if (res?.success && res.data?.history) {
        setMessages(res.data.history);
      } else {
        setMessages([]);
      }
    } catch (err) {
      toast.error("Failed to load chat history");
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectSession = (sessionId) => {
    if (currentSessionId === sessionId) return;
    setCurrentSessionId(sessionId);
    loadChatHistory(sessionId);
  };

  const handleNewSession = async () => {
    try {
      const res = await chatService.createSession();
      if (res?.success && res.data?.sessionId) {
        const newSessionId = res.data.sessionId;
        setCurrentSessionId(newSessionId);
        setMessages([]);
        loadSessions(); // Refresh list
      }
    } catch (err) {
      toast.error("Failed to create new chat");
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      const res = await chatService.deleteSession(sessionId);
      if (res?.success) {
        if (currentSessionId === sessionId) {
          setCurrentSessionId(null);
          setMessages([]);
        }
        loadSessions();
      }
    } catch (err) {
      toast.error("Failed to delete chat");
    }
  };

  const send = async (text) => {
    const userMsg = text.trim();
    if (!userMsg || isLoading) return;
    
    setInput("");
    
    // Optimistic UI update
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    let activeSessionId = currentSessionId;

    // If no session is active, create one first implicitly
    if (!activeSessionId) {
      try {
        const sessionRes = await chatService.createSession();
        if (sessionRes?.success && sessionRes.data?.sessionId) {
          activeSessionId = sessionRes.data.sessionId;
          setCurrentSessionId(activeSessionId);
        }
      } catch (err) {
        toast.error("Failed to initialize chat session");
        setIsLoading(false);
        return;
      }
    }

    try {
      const res = await chatService.sendMessage({ 
        question: userMsg,
        sessionId: activeSessionId
      });
      
      if (res?.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.data?.answer || "No answer returned.", sources: res.data?.sources || [] },
        ]);
        
        // Refresh sessions list to update the title if it was a new chat
        if (messages.length === 0) {
          loadSessions();
        }
      } else {
        throw new Error(res?.message || "Unexpected response");
      }
    } catch (err) {
      toast.error(err.message || "Failed to get response");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error processing your request." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); send(input); };

  const handleAnalyze = async (textToAnalyze) => {
    if (isLoading) return;
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: `Analyze: "${textToAnalyze.substring(0, 60)}..."` },
    ]);
    try {
      const res = await chatService.analyzeResponse({ response: textToAnalyze });
      if (res?.success && res.data?.analysis) {
        const a = res.data.analysis;
        const md = [
          `### Detailed Explanation`, a.detailedExplanation || "", ``,
          `### Key Insights`, ...(a.keyInsights || []).map((i) => `- ${i}`), ``,
          `### Simplified Summary`, a.simplifiedSummary || "", ``,
          `### Additional Context`, a.additionalContext || "", ``,
          `### Follow-Up Questions`, ...(a.followUpQuestions || []).map((q) => `- ${q}`),
        ].join("\n");
        setMessages((prev) => [...prev, { role: "assistant", content: md }]);
      } else { throw new Error("Analysis failed"); }
    } catch {
      toast.error("Failed to analyze");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, the analysis couldn't be completed." },
      ]);
    } finally { setIsLoading(false); }
  };

  const isEmpty = messages.length === 0;

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <ChatSidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", minWidth: 0 }}>
        
        {/* Messages area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0" }}>
          {isEmpty ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px" }} className="animate-fade-in">
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "var(--bg-secondary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 24,
                boxShadow: "0 0 0 1px var(--border-secondary)"
              }}>
                <HiOutlineSparkles style={{ fontSize: 24, color: "var(--text-primary)" }} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
                How can I help you today?
              </h2>
              
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 32, width: "100%", maxWidth: 640 }}>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s.text)}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 100,
                      border: "1px solid var(--border-primary)",
                      background: "transparent",
                      color: "var(--text-secondary)",
                      fontSize: 13,
                      textAlign: "center",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.2s ease"
                    }}
                    className="hover-bg-secondary hover-text-primary"
                  >
                    <s.icon style={{ fontSize: 16 }} />
                    <span style={{ fontWeight: 500 }}>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", maxWidth: 768, margin: "0 auto", padding: "40px 24px 20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {messages.map((msg, idx) => (
                  <ChatMessage key={idx} message={msg} onAnalyze={handleAnalyze} />
                ))}

                {isLoading && (
                  <div className="animate-fade-in" style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "0 16px" }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: "var(--bg-secondary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--text-primary)", flexShrink: 0,
                      boxShadow: "0 0 0 1px var(--border-secondary)"
                    }}>
                      <HiOutlineSparkles style={{ fontSize: 14 }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", height: 28 }}>
                      <LoadingDots />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} style={{ height: 20 }} />
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div style={{ padding: "0 24px 24px", background: "var(--bg-primary)" }}>
          <div style={{ maxWidth: 768, margin: "0 auto" }}>
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex", alignItems: "flex-end", gap: 12,
                padding: "8px 8px 8px 16px", borderRadius: 24,
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-secondary)",
                transition: "border-color 0.2s, box-shadow 0.2s"
              }}
              className="chat-input-container focus-within-border-accent"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                placeholder="Message NewsMind..."
                rows={1}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  resize: "none", fontSize: 15, color: "var(--text-primary)",
                  padding: "8px 0", maxHeight: 200, fontFamily: "var(--font-sans)",
                  lineHeight: 1.5,
                  minHeight: 24
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: input.trim() && !isLoading ? "var(--text-primary)" : "var(--bg-tertiary)",
                  color: input.trim() && !isLoading ? "var(--bg-primary)" : "var(--text-muted)", 
                  border: "none", cursor: input.trim() && !isLoading ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s ease", flexShrink: 0
                }}
              >
                <HiOutlinePaperAirplane style={{ fontSize: 16 }} />
              </button>
            </form>
            <p style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "var(--text-tertiary)" }}>
              NewsMind can make mistakes. Consider verifying important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
