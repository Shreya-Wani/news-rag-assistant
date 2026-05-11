import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

const ChatPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
          <HiOutlineChatBubbleLeftRight className="text-white text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            AI Chat
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Ask me anything about the news
          </p>
        </div>
      </div>

      {/* Chat Interface Placeholder */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] min-h-[60vh] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center">
              <HiOutlineChatBubbleLeftRight className="text-3xl text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
              Start a Conversation
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-md">
              Chat interface will be implemented here. Ask questions about current
              events and get AI-powered, source-backed answers.
            </p>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Ask about the latest news..."
              disabled
              className="flex-1 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
            />
            <button
              disabled
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium text-sm disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
