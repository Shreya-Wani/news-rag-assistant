const Footer = () => {
  return (
    <footer className="border-t border-[var(--color-border)] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            &copy; {new Date().getFullYear()} NewsMind AI. All rights reserved.
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Powered by{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent font-medium">
              Gemini AI + LangChain
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
