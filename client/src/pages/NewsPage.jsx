import { useState, useEffect } from "react";
import { HiOutlineNewspaper, HiOutlineArrowUpRight } from "react-icons/hi2";
import newsService from "../services/newsService.js";
import toast from "react-hot-toast";

const SkeletonCard = () => (
  <div className="animate-slide-up" style={{
    padding: 20, borderRadius: 16,
    border: "1px solid var(--border-primary)",
    background: "var(--bg-secondary)"
  }}>
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <div style={{ width: 60, height: 20, borderRadius: 6, background: "var(--bg-tertiary)" }} />
      <div style={{ width: 80, height: 16, borderRadius: 6, background: "var(--bg-tertiary)", marginLeft: "auto" }} />
    </div>
    <div style={{ height: 18, width: "80%", borderRadius: 6, background: "var(--bg-tertiary)", marginBottom: 12 }} />
    <div style={{ height: 14, width: "100%", borderRadius: 4, background: "var(--bg-tertiary)", marginBottom: 8 }} />
    <div style={{ height: 14, width: "70%", borderRadius: 4, background: "var(--bg-tertiary)" }} />
  </div>
);

const NewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await newsService.getArticles({ limit: 12 });
        if (res?.success) setArticles(res.data?.articles || []);
      } catch { toast.error("Failed to load articles"); }
      finally { setIsLoading(false); }
    };
    fetchNews();
  }, []);

  return (
    <div className="page-container" style={{ paddingTop: 40, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 6 }}>
          News Articles
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
          Browse the indexed articles that power the AI assistant.
        </p>
      </div>

      {isLoading ? (
        <div className="grid-news stagger">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : articles.length === 0 ? (
        <div className="flex-col-center" style={{
          padding: "80px 24px", borderRadius: 16,
          border: "1px solid var(--border-primary)",
          background: "var(--bg-secondary)", textAlign: "center"
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "var(--bg-tertiary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20
          }}>
            <HiOutlineNewspaper style={{ fontSize: 24, color: "var(--text-tertiary)" }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>No articles yet</h3>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 360 }}>
            Run the ingestion pipeline to index news articles into the system.
          </p>
        </div>
      ) : (
        <div className="grid-news stagger">
          {articles.map((article) => (
            <article
              key={article._id}
              className="animate-slide-up"
              style={{
                display: "flex", flexDirection: "column",
                padding: 20, borderRadius: 16,
                border: "1px solid var(--border-primary)",
                background: "var(--bg-secondary)",
                transition: "border-color 0.2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                <span style={{
                  padding: "4px 10px", fontSize: 10, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  borderRadius: 6, background: "var(--accent-muted)", color: "var(--accent)"
                }}>
                  {article.category || "news"}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                  {new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.35, marginBottom: 8, letterSpacing: "-0.01em" }}>
                {article.title}
              </h3>

              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16, flex: 1 }}>
                {article.summary || (article.content ? article.content.substring(0, 160) + "..." : "No details available.")}
              </p>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border-primary)" }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-tertiary)" }}>
                  {article.source}
                </span>
                {article.url && (
                  <a href={article.url} target="_blank" rel="noreferrer" style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: 11, fontWeight: 500, color: "var(--accent)", textDecoration: "none"
                  }}>
                    Read <HiOutlineArrowUpRight style={{ fontSize: 10 }} />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsPage;
