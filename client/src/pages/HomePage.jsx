import { Link } from "react-router-dom";
import { HiOutlineChatBubbleLeftRight, HiOutlineNewspaper, HiOutlineCpuChip } from "react-icons/hi2";
import { Button } from "../components/ui/index.js";

const features = [
  {
    icon: HiOutlineChatBubbleLeftRight,
    title: "AI-Powered Chat",
    description: "Ask questions about current events and get intelligent, context-aware answers powered by RAG.",
  },
  {
    icon: HiOutlineNewspaper,
    title: "Real-Time News",
    description: "Stay updated with the latest news articles, automatically ingested and indexed for AI retrieval.",
  },
  {
    icon: HiOutlineCpuChip,
    title: "Smart RAG Pipeline",
    description: "Built with LangChain, Gemini AI, and Pinecone for accurate, source-backed responses.",
  },
];

const HomePage = () => {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        {/* Background gradient effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            AI-Powered News Intelligence
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            <span className="text-[var(--color-text-primary)]">Your AI News</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Research Assistant
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[var(--color-text-secondary)] mb-10 leading-relaxed">
            Ask anything about current events. NewsMind AI retrieves the latest news
            and delivers accurate, source-backed answers in seconds.
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center gap-4">
            <Link to="/chat">
              <Button size="lg">
                <HiOutlineChatBubbleLeftRight className="text-lg" />
                Start Chatting
              </Button>
            </Link>
            <Link to="/news">
              <Button variant="secondary" size="lg">
                Browse News
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
              How It Works
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
              Powered by cutting-edge AI to transform how you consume and understand news.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description }, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:from-indigo-500/30 group-hover:to-cyan-500/30 transition-all">
                  <Icon className="text-2xl text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
