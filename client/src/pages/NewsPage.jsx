import { HiOutlineNewspaper } from "react-icons/hi2";

const NewsPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
          <HiOutlineNewspaper className="text-white text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            News Feed
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Browse the latest indexed articles
          </p>
        </div>
      </div>

      {/* News Grid Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 hover:border-indigo-500/30 transition-all duration-300"
          >
            <div className="w-full h-40 rounded-xl bg-[var(--color-bg-input)] mb-4 animate-pulse" />
            <div className="h-4 w-3/4 bg-[var(--color-bg-input)] rounded mb-3 animate-pulse" />
            <div className="h-3 w-full bg-[var(--color-bg-input)] rounded mb-2 animate-pulse" />
            <div className="h-3 w-5/6 bg-[var(--color-bg-input)] rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsPage;
