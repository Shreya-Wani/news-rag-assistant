import { Link } from "react-router-dom";
import {
  HiOutlineChatBubbleLeftRight,
  HiArrowRight,
  HiOutlineServerStack,
  HiOutlineShieldCheck,
  HiOutlineNewspaper
} from "react-icons/hi2";

const HomePage = () => {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 24px", overflowX: "hidden" }}>
      
      {/* ─── HERO SECTION ─── */}
      <div style={{ 
        width: "100%", maxWidth: 1000, 
        marginTop: 80, marginBottom: 80,
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" 
      }} className="animate-fade-in">
        
        {/* Launch Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 12px", borderRadius: 100,
          background: "var(--accent-muted)", border: "1px solid rgba(37, 99, 235, 0.3)",
          color: "var(--accent)", fontSize: 12, fontWeight: 600,
          marginBottom: 32, letterSpacing: "0.02em"
        }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }}></span>
          NewsMind 1.0 is now live
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: 700,
          letterSpacing: "-0.05em", lineHeight: 1.05, marginBottom: 24,
          color: "var(--text-primary)", maxWidth: 900
        }}>
          News analysis, <br /> grounded in reality.
        </h1>

        {/* Subtitle */}
        <p style={{
          maxWidth: 600, margin: "0 auto 40px auto",
          fontSize: "1.25rem", color: "var(--text-secondary)", lineHeight: 1.6
        }}>
          NewsMind indexes thousands of articles daily, allowing you to ask complex questions and receive immediate, source-backed answers.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <Link to="/chat" style={{ textDecoration: "none" }}>
            <button className="hover-lift" style={{
              padding: "14px 28px", borderRadius: 8,
              background: "var(--text-primary)", color: "var(--bg-primary)",
              fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8
            }}>
              Start Chatting
              <HiArrowRight style={{ fontSize: 16 }} />
            </button>
          </Link>
          <Link to="/news" style={{ textDecoration: "none" }}>
            <button className="hover-lift" style={{
              padding: "14px 28px", borderRadius: 8,
              color: "var(--text-primary)", background: "var(--bg-secondary)",
              border: "1px solid var(--border-primary)",
              fontSize: 15, fontWeight: 500, cursor: "pointer"
            }}>
              Browse Sources
            </button>
          </Link>
        </div>
      </div>

      {/* ─── MOCK UI PREVIEW ─── */}
      <div className="animate-slide-up" style={{ 
        width: "100%", maxWidth: 900, marginBottom: 100,
        background: "var(--bg-secondary)", borderRadius: 16,
        border: "1px solid var(--border-primary)", overflow: "hidden",
        boxShadow: "0 32px 64px -12px rgba(0,0,0,0.5)",
        animationDelay: "0.2s"
      }}>
        {/* Mock Window Header */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-primary)", display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10b981" }} />
          <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>NewsMind Chat Interface</div>
        </div>
        
        {/* Mock Chat Body */}
        <div style={{ padding: "32px 24px", display: "flex", flexDirection: "column", gap: 20, background: "var(--bg-primary)" }}>
          <div style={{ alignSelf: "flex-end", background: "var(--accent)", color: "#fff", padding: "12px 18px", borderRadius: 16, borderTopRightRadius: 4, fontSize: 14, fontWeight: 500 }}>
            What are the implications of the latest AI regulations?
          </div>
          
          <div style={{ alignSelf: "flex-start", background: "var(--bg-secondary)", color: "var(--text-primary)", padding: "16px 20px", borderRadius: 16, borderTopLeftRadius: 4, fontSize: 14, lineHeight: 1.6, maxWidth: "85%", border: "1px solid var(--border-primary)" }}>
            <div style={{ marginBottom: 12 }}>
              Based on recent reporting, the new AI regulations focus primarily on transparency and auditing for high-risk models. Companies will be required to disclose training data sources and conduct regular bias testing <span style={{ color: "var(--accent)", fontWeight: 600 }}>[Source 1]</span>. The tech industry has responded with mixed reactions, citing potential stifling of open-source innovation <span style={{ color: "var(--accent)", fontWeight: 600 }}>[Source 2]</span>.
            </div>
            
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", borderTop: "1px solid var(--border-primary)", paddingTop: 12 }}>
               <div style={{ padding: "6px 10px", background: "var(--bg-primary)", border: "1px solid var(--border-secondary)", borderRadius: 6, fontSize: 11, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                 <HiOutlineNewspaper /> TechCrunch (Oct 24)
               </div>
               <div style={{ padding: "6px 10px", background: "var(--bg-primary)", border: "1px solid var(--border-secondary)", borderRadius: 6, fontSize: 11, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                 <HiOutlineNewspaper /> Reuters (Oct 25)
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FEATURES SECTION ─── */}
      <div style={{ width: "100%", maxWidth: 1000, marginBottom: 100, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        {[
          {
            icon: HiOutlineServerStack,
            title: "Automated Ingestion",
            desc: "Continuous pipeline scraping, chunking, and vectorizing thousands of global news articles daily into Pinecone."
          },
          {
            icon: HiOutlineChatBubbleLeftRight,
            title: "Contextual RAG",
            desc: "Retrieval-Augmented Generation using Gemini ensures responses are synthesized perfectly from real context."
          },
          {
            icon: HiOutlineShieldCheck,
            title: "Zero Hallucination",
            desc: "Strict system prompts force the model to cite sources inline or clearly state when data is unavailable."
          }
        ].map((feature, i) => (
          <div key={i} className="animate-slide-up" style={{
            padding: 32, borderRadius: 16, background: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)", animationDelay: `${0.3 + (i * 0.1)}s`
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10, background: "var(--bg-tertiary)",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
              border: "1px solid var(--border-secondary)", color: "var(--text-primary)"
            }}>
              <feature.icon style={{ fontSize: 24 }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12, letterSpacing: "-0.01em" }}>{feature.title}</h3>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6 }}>{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* ─── HOW IT WORKS SECTION ─── */}
      <div style={{ width: "100%", maxWidth: 1000, marginBottom: 100, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>How NewsMind Works</h2>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 600, marginBottom: 48 }}>A seamless pipeline from breaking news to intelligent answers.</p>
        
        <div style={{ display: "flex", gap: 24, width: "100%", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { step: "01", title: "Ingestion", desc: "We constantly monitor global news sources and scrape full articles in real-time." },
            { step: "02", title: "Vectorization", desc: "Articles are chunked and converted into semantic embeddings using HuggingFace models." },
            { step: "03", title: "Retrieval", desc: "When you ask a question, we instantly retrieve the most relevant context from Pinecone." },
            { step: "04", title: "Generation", desc: "Gemini AI synthesizes the context and generates a perfectly cited, hallucination-free response." }
          ].map((item, i) => (
             <div key={i} className="animate-slide-up" style={{ flex: "1 1 200px", maxWidth: 280, padding: 24, background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border-primary)", textAlign: "left", animationDelay: `${0.2 + (i * 0.1)}s` }}>
               <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 12, letterSpacing: "0.05em" }}>STEP {item.step}</div>
               <h4 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>{item.title}</h4>
               <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>{item.desc}</p>
             </div>
          ))}
        </div>
      </div>

      {/* ─── STATS SECTION ─── */}
      <div style={{ width: "100%", maxWidth: 1000, padding: "48px 0", borderTop: "1px solid var(--border-primary)", borderBottom: "1px solid var(--border-primary)", marginBottom: 100, display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 32 }}>
         <div style={{ textAlign: "center" }}>
           <div style={{ fontSize: 40, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>&lt;1.5s</div>
           <div style={{ fontSize: 14, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Retrieval Latency</div>
         </div>
         <div style={{ textAlign: "center" }}>
           <div style={{ fontSize: 40, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>10k+</div>
           <div style={{ fontSize: 14, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Articles Indexed</div>
         </div>
         <div style={{ textAlign: "center" }}>
           <div style={{ fontSize: 40, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>100%</div>
           <div style={{ fontSize: 14, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Source Grounded</div>
         </div>
      </div>

      {/* ─── BOTTOM CTA ─── */}
      <div style={{ width: "100%", maxWidth: 800, marginBottom: 100, textAlign: "center", padding: "64px 32px", background: "var(--bg-secondary)", borderRadius: 24, border: "1px solid var(--border-primary)" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Ready to upgrade your news?</h2>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", marginBottom: 32 }}>Stop scrolling through endless headlines. Get straight to the answers.</p>
        <Link to="/chat" style={{ textDecoration: "none" }}>
          <button className="hover-lift" style={{
            padding: "16px 32px", borderRadius: 8,
            background: "var(--text-primary)", color: "var(--bg-primary)",
            fontSize: 16, fontWeight: 600, border: "none", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 8
          }}>
            Start Chatting for Free
            <HiArrowRight style={{ fontSize: 16 }} />
          </button>
        </Link>
      </div>

    </div>
  );
};

export default HomePage;
